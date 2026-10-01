# @pixpilot/mcp

Turn a TypeScript package monorepo into a searchable MCP server, so AI coding assistants find and reuse your utilities instead of writing new ones.

- **Generator:** reads every package's entry points with the TypeScript compiler. It records each export's signature, parameter and return types, option-object properties, and JSDoc description, `@example` blocks, and `@deprecated` notes. The result is one committed `registry.json`.
- **Drift check:** fails when the sources change and the registry was not regenerated: a utility added or removed, a parameter or return type changed, or a doc edited.
- **Server:** serves the registry through three tools: `list_packages`, `search_utilities`, and `get_utility_details`. It uses three tools, not one per utility, because every tool's schema is loaded into the assistant's context. Search matches query words at word starts, drops matches far weaker than the best one, lists the `matchedTerms` of each result, and returns `unmatchedTerms` for words no result covers, so the assistant can tell when the catalog lacks a helper.

`pixpilot-js-utils-mcp` in this repository is a complete example.

## Set up a monorepo

The steps assume a pnpm monorepo with packages in `packages/*`, each exposing TypeScript sources through `exports` (or `src/index.ts`).

### 1. Create the server package

Create a package for the server, for example `packages/acme-mcp`:

```sh
pnpm add @pixpilot/mcp @modelcontextprotocol/sdk zod
pnpm add -D typescript tsx
```

```json
{
  "name": "@acme/utils-mcp",
  "type": "module",
  "bin": { "acme-utils-mcp": "./dist/cli.js" },
  "scripts": {
    "mcp:generate": "pixpilot-mcp generate",
    "mcp:check": "pixpilot-mcp generate --check"
  }
}
```

The generator needs `typescript` as a dev dependency; the server only needs `@pixpilot/mcp` at runtime.

### 2. Add `mcp.config.ts`

Place it at the root of the server package. Every option is optional:

```ts
import { defineMcpConfig } from '@pixpilot/mcp/generator';

export default defineMcpConfig({
  excludePackages: ['@acme/eslint-config'],
});
```

### 3. Add a catalog file per package

Create `catalog/<package-dir>.ts` in the server package for each documented package. It holds what the source cannot express:

```ts
import { defineCatalogPackage } from '@pixpilot/mcp/generator';

export default defineCatalogPackage({
  category: 'String',
  runtime: 'universal',
  keywords: ['string', 'text'],
  utilities: {
    truncate: { keywords: ['ellipsis', 'shorten'] },
  },
});
```

### 4. Generate the registry

```sh
pnpm mcp:generate
```

It writes `src/generated/registry.json`. Commit it. Generation fails, listing every problem, until each function has a JSDoc summary and an `@example` (see [Checks](#checks)).

### 5. Add the bin entry point

```ts
#!/usr/bin/env node
// src/cli.ts
import { asRegistry, readPackageVersion, startMcpServer } from '@pixpilot/mcp';
import registryJson from './generated/registry.json';

await startMcpServer({
  name: 'acme-utils',
  version: readPackageVersion(import.meta.url),
  registry: asRegistry(registryJson),
});
```

Build it with your bundler as ESM; the bin uses top-level await.

### 6. Fail CI on drift

```ts
// test/registry.test.ts
import { fileURLToPath } from 'node:url';
import {
  checkRegistry,
  formatDriftMessage,
  loadMcpConfig,
} from '@pixpilot/mcp/generator';
import { expect, it } from 'vitest';

// Building the registry type-checks every package entry point.
const TIMEOUT_MS = 120_000;

it(
  'MCP registry is in sync with the sources',
  async () => {
    const config = await loadMcpConfig(fileURLToPath(new URL('..', import.meta.url)));
    const changes = await checkRegistry(config);

    expect(changes, formatDriftMessage(config, changes)).toEqual([]);
  },
  TIMEOUT_MS,
);
```

A failure names each change:

```text
src/generated/registry.json is out of date (1 change(s)). Run `pixpilot-mcp generate`, review the diff, and commit it:
  changed @acme/string › truncate signature:
      was: truncate(str: string, maxLength: number): string
      now: truncate(str: string, maxLength: number, ellipsis?: string): string
```

With Turborepo, the test's cache must also depend on the other packages' sources. Add a `turbo.json` to the server package:

```json
{
  "extends": ["//"],
  "tasks": {
    "test": {
      "inputs": [
        "$TURBO_DEFAULT$",
        "$TURBO_ROOT$/packages/*/src/**",
        "$TURBO_ROOT$/packages/*/package.json",
        "$TURBO_ROOT$/pnpm-lock.yaml"
      ]
    }
  }
}
```

## Configuration

`mcp.config.ts` (also `.mts`, `.js`, `.mjs`). Relative paths resolve from the config file.

| Option            | Default                                    | Description                                                                                                                          |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `root`            | nearest `pnpm-workspace.yaml` or `.git`    | Monorepo root.                                                                                                                       |
| `packages`        | `['packages/*']`                           | Package directories relative to `root`, as `dir` or `dir/*`.                                                                         |
| `excludePackages` | `[]`                                       | Package names to leave out. Private packages and the package holding the config are always left out.                                 |
| `catalog`         | `'catalog/{dir}.ts'`                       | Catalog file per package. `{dir}` is the package directory name; `'{packageDir}/mcp.catalog.ts'` keeps catalogs inside each package. |
| `requireCatalog`  | `true`                                     | Fail when a package has no catalog file. When false, the category defaults to the directory name.                                    |
| `output`          | `'src/generated/registry.json'`            | Generated registry file.                                                                                                             |
| `tsconfig`        | `tsconfig.json` next to the config, if any | Compiler options used to resolve imports.                                                                                            |
| `rules`           | all `true`                                 | `requireDescription`, `requireExample`, `requireExampleCallsName`. See [Checks](#checks).                                            |

The output is formatted with the consumer's own Prettier and config when Prettier is installed, and as two-space JSON otherwise.

## Catalog files

| Field         | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `category`    | Group label shown in package listings and matched by search. Default: the package directory name.              |
| `runtime`     | `universal`, `node`, or `browser` for the main entry point. Default: `universal`.                              |
| `description` | Used when package.json has no `description`.                                                                   |
| `keywords`    | Package-level search terms.                                                                                    |
| `entryPoints` | Per-subpath overrides keyed like `exports` (`'./node'`): `runtime`, `description`, `source`.                   |
| `utilities`   | Per-export extras: `keywords` (synonyms people search for), `notes`, extra `examples`, `description` override. |
| `exclude`     | Exported names to hide.                                                                                        |

Each subpath in a package's `exports` becomes an entry point. Its source is the `exports` target when it is a `.ts` file, otherwise `src/index.ts` for `.` and `src/<name>.ts` for `./<name>`.

## Checks

Generation fails, listing every problem at once, when:

- a package has no catalog file (with `requireCatalog`)
- a catalog file has no matching package, or names an export or subpath that no longer exists
- a function or constant has no JSDoc summary (`requireDescription`)
- a non-deprecated function has no `@example` (`requireExample`)
- no example of a function calls it by name, usually after a rename (`requireExampleCallsName`)
- a package has no description in package.json or its catalog

## CLI

```sh
pixpilot-mcp generate [--check] [--config <file-or-dir>]
```

`--check` writes nothing and exits 1 when the registry is out of date. Config and catalog files are TypeScript, loaded with [jiti](https://github.com/unjs/jiti).

## API

`@pixpilot/mcp` (runtime): `createMcpServer`, `startMcpServer`, `buildInstructions`, `searchUtilities`, `queryTerms`, `asRegistry`, `findUtilities`, `importStatement`, `installCommand`, `listPackages`, `readPackageVersion`, and the registry types.

`createMcpServer` options: `name`, `version`, `registry`, plus `summary` (the first paragraph of the instructions sent to clients; defaults to the registry's categories) or `instructions` (replaces the whole text).

`@pixpilot/mcp/generator` (build time, needs `typescript`): `defineMcpConfig`, `defineCatalogPackage`, `loadMcpConfig`, `resolveMcpConfig`, `buildRegistry`, `generateRegistry`, `checkRegistry`, `diffRegistries`, `formatDriftMessage`, `readRegistryFile`, `findWorkspacePackages`, `ApiExtractor`, and `RegistryValidationError`.
