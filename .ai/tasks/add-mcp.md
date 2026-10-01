I need to figure out how to build MCP support for all the packages in this repository. I have done something similar in `Z:\github\pixpilot\shadcn-components\packages\shadcn-ui\src\alert\mcp.ts`, but that covered all components in one package. Here, each package contains multiple utilities.

I want a TypeScript- or test-based check that detects when utilities are added or their parameter or return types change, and reports an error if the corresponding MCP tool needs to be added or updated. I have looked at [`ts-to-json`](https://github.com/ccpu/ts-to-json), which is old but working, and [`ts-json-schema-generator`](https://github.com/vega/ts-json-schema-generator), which is more up to date. Could either help detect type changes? I am not sure how to use them, but I need a reliable way to ensure the MCP tools stay up to date.

In addition to keeping MCP definitions current, I want MCP discovery to be searchable so an AI can find only the tools it needs without loading all MCP information into its context. I have implemented smart search for AI in `Z:\github\ccpu\storybook-addon-playwright\mcp`; please investigate it and propose a solution.

Tasks:
- Implement MCP support for all packages in this repository.
- Add automated drift detection or regeneration so changes to utilities trigger an alert or update to the corresponding MCP definitions.
- Make MCP tools searchable and discoverable so an AI can find the relevant tool with minimal context, install the relevant package, and use it.
- add to my local mcp list in Z:\github\ccpu\skills\mcp.jsonc