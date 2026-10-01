import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpServer } from '@pixpilot/mcp';
import { registry } from './registry';

/** Name reported to MCP clients. */
export const SERVER_NAME = 'pixpilot-js-utils';

/** First paragraph of the server instructions: what the catalog covers. */
export const SERVER_SUMMARY =
  'Catalog of the @pixpilot JavaScript/TypeScript utility packages: strings and case conversion, arrays, objects (deep merge, dot paths, key casing), dates, numbers, money formatting, pagination, env/.env loading, DOM z-index, GUID checks, hashing, and finding project roots.';

/** Creates the @pixpilot utilities MCP server. */
export function createServer(version: string): McpServer {
  return createMcpServer({
    name: SERVER_NAME,
    version,
    registry,
    summary: SERVER_SUMMARY,
  });
}
