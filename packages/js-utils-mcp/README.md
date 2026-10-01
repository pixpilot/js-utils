# @pixpilot/js-utils-mcp

MCP server that lets AI coding assistants find, install, and use the `@pixpilot` JavaScript and TypeScript utility packages, so they reuse an existing helper instead of writing a new one.

## Setup

Add the server to your MCP client:

```json
{
  "mcpServers": {
    "pixpilot-js-utils": {
      "command": "npx",
      "args": ["-y", "@pixpilot/js-utils-mcp"]
    }
  }
}
```

## Tools

The server exposes three tools instead of one tool per utility. Every registered tool's schema is loaded into the assistant's context, so a tool per utility (over 100) would fill the context before any work starts. The assistant searches first and loads details only for the utility it picks.

| Tool                  | Input                                                   | Returns                                                                                       |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `list_packages`       | none                                                    | One row per package: description, category, entry points with runtime, utility count, install |
| `search_utilities`    | `query`, optional `package`, `kind`, `runtime`, `limit` | Compact ranked matches: name, import path, runtime, signature, one-line summary               |
| `get_utility_details` | `name`, optional `package`                              | Signatures, parameters, option properties, return type, examples, notes, import, install      |

Search ranks by name, keywords, category, and description. It handles natural-language queries ("end of month", "camel case keys"), plural forms, and small typos in names. An empty `query` with `package` lists that package.

`runtime` is `universal`, `node`, or `browser`. Searching with `runtime: "browser"` leaves out Node-only utilities such as `@pixpilot/env/node`.

## How the registry is built

The server ships one generated file, [`src/generated/registry.json`](src/generated/registry.json). Do not edit it by hand.

`pnpm mcp:generate` builds it from two sources:

- **The package source.** The TypeScript compiler API reads every entry point listed in each package's `exports`. It records each export's signature, parameter and return types, option-object properties, and JSDoc description, `@example` blocks, and `@deprecated` notes.
- **A catalog file per package**, in [`catalog/`](catalog), for what the source cannot express: category, runtime, search keywords, notes, and exports to hide.

Generation fails, listing every problem, when:

- a public package under `packages/` has no `catalog/<dir>.ts` file
- a function or constant has no JSDoc description
- a function has no `@example`, or none of its examples call it by name (usually a rename the examples missed)
- a catalog file names an export that no longer exists

## Drift detection

`test/registry.test.ts` rebuilds the registry from the current source and compares it with the committed file. It fails when a utility is added or removed, or when a signature, parameter type, return type, or doc changes without regenerating. For example:

```text
src/generated/registry.json is stale. Run `pnpm mcp:generate`, review the diff, and commit it:
  changed @pixpilot/string › truncate signature:
      was: truncate(str: string, maxLength: number, ellipsis: string = '...'): string
      now: truncate(str: string, maxLength: number, ellipsis: string = '...', fromEnd?: boolean): string
```

The test runs in CI through `pnpm test`. This package's `turbo.json` adds the other packages' sources to the test inputs, so a cached result is not reused after they change. `pnpm mcp:check` runs the same check outside the test runner.

## Maintaining

From the repository root:

```sh
pnpm mcp:generate   # rebuild src/generated/registry.json
pnpm mcp:check      # fail if the committed registry is stale
```

**When you add or change a utility,** write its JSDoc summary and an `@example`, run `pnpm mcp:generate`, and commit the updated registry. Add catalog keywords when people would search for it with words its name and description do not contain.

**When you add a package,** create `catalog/<package-dir>.ts`:

```ts
import { defineCatalogPackage } from '../scripts/catalog';

export default defineCatalogPackage({
  category: 'String',
  runtime: 'universal',
  keywords: ['string', 'text'],
  utilities: {
    truncate: { keywords: ['ellipsis', 'shorten'] },
  },
});
```

Use `entryPoints` to give a subpath export its own runtime or description, as [`catalog/env.ts`](catalog/env.ts) does for `@pixpilot/env/node`. Use `exclude` to hide an export.

## Programmatic use

```ts
import { registry, searchUtilities } from '@pixpilot/js-utils-mcp';

searchUtilities(registry.utilities, 'start of day', { limit: 3 });
```
