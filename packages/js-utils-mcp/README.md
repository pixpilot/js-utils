# pixpilot-js-utils-mcp

MCP server that lets AI coding assistants find, install, and use the `@pixpilot` JavaScript and TypeScript utility packages, so they reuse an existing helper instead of writing a new one.

## Setup

Add the server to your MCP client:

```json
{
  "mcpServers": {
    "pixpilot-js-utils": {
      "command": "npx",
      "args": ["-y", "pixpilot-js-utils-mcp"]
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

## How it is built

This package is a consumer of [`@pixpilot/mcp`](../mcp), which does the generating, checking, and serving. This package holds only:

- [`mcp.config.ts`](mcp.config.ts): generator settings
- [`catalog/`](catalog): one file per utility package with what the source cannot express (category, runtime, search keywords, notes, exports to hide)
- [`src/generated/registry.json`](src/generated/registry.json): the generated registry the server ships. Do not edit it by hand.
- the bin entry point and the tests

The `@pixpilot/mcp` runtime is bundled into `dist`, so installing this server does not pull in the generator's dependencies.

## Maintaining

From the repository root:

```sh
pnpm mcp:generate   # rebuild src/generated/registry.json
pnpm mcp:check      # fail if the committed registry is stale
```

`test/registry.test.ts` runs the same check in CI. It fails when a utility is added or removed, or when a signature, parameter type, return type, or doc changes without regenerating.

**When you add or change a utility,** write its JSDoc summary and an `@example`, run `pnpm mcp:generate`, and commit the updated registry. Add catalog keywords when people would search for it with words its name and description do not contain. `test/search.test.ts` checks that realistic queries still find the right utility.

**When you add a package,** create `catalog/<package-dir>.ts`:

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

Use `entryPoints` to give a subpath export its own runtime or description, as [`catalog/env.ts`](catalog/env.ts) does for `@pixpilot/env/node`. Use `exclude` to hide an export. Packages that are not utilities go in `excludePackages` in `mcp.config.ts`.

See the [`@pixpilot/mcp` README](../mcp/README.md) for every config option, catalog field, and check.
