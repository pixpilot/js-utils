# @pixpilot/mcp

## 0.2.0

### Minor Changes

- enhance search utilities for improved relevance
- f01756b: Make `search_utilities` results easier to trust: terms now match at word starts (`move` no longer matches `remove`), matches far weaker than the best one are dropped, each result lists its `matchedTerms`, and the response flags `unmatchedTerms` that no result covers. Adds the `queryTerms` export.

## 0.1.0

### Minor Changes

- add reusable MCP server generator
- 55763dd: Add `@pixpilot/mcp`: generate a searchable MCP server for a TypeScript package monorepo from its sources and JSDoc, with a `pixpilot-mcp generate [--check]` CLI and a drift check for CI.
