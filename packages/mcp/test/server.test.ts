import type { UtilityRegistry } from '../src/types';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';
import { createMcpServer } from '../src/server';
import { fixtureRegistry, utility } from './helpers';

let client: Client | undefined;

async function connect(
  options: { registry?: UtilityRegistry; summary?: string; instructions?: string } = {},
): Promise<Client> {
  const server = createMcpServer({
    name: 'acme-utils',
    version: '1.2.3',
    registry: options.registry ?? fixtureRegistry(),
    ...(options.summary === undefined ? {} : { summary: options.summary }),
    ...(options.instructions === undefined ? {} : { instructions: options.instructions }),
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  client = new Client({ name: 'test', version: '0.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return client;
}

function textOf(result: Awaited<ReturnType<Client['callTool']>>): string {
  const [first] = result.content as { type: string; text: string }[];
  return first?.text ?? '';
}

afterEach(async () => {
  await client?.close();
  client = undefined;
});

describe('createMcpServer', () => {
  it('advertises three tools and reports its name and version', async () => {
    const mcp = await connect();
    const { tools } = await mcp.listTools();

    expect(mcp.getServerVersion()).toEqual({ name: 'acme-utils', version: '1.2.3' });
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_utility_details',
      'list_packages',
      'search_utilities',
    ]);
  });

  it('describes the catalog from the registry by default', async () => {
    const mcp = await connect();
    const { tools } = await mcp.listTools();
    const search = tools.find((tool) => tool.name === 'search_utilities');

    expect(mcp.getInstructions()).toContain(
      'Catalog of the @acme utility packages (2 packages): Environment, Text.',
    );
    expect(mcp.getInstructions()).toContain('search_utilities');
    expect(JSON.stringify(search?.inputSchema)).toContain('@acme/env/node');
  });

  it('accepts a custom summary or full instructions', async () => {
    const withSummary = await connect({ summary: 'Acme helpers for strings.' });
    expect(withSummary.getInstructions()).toMatch(
      /^Acme helpers for strings\.\n\nConsult/u,
    );
    await withSummary.close();

    const custom = await connect({ instructions: 'Only this.' });
    expect(custom.getInstructions()).toBe('Only this.');
  });

  it('lists packages with install commands', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({ name: 'list_packages', arguments: {} });

    expect(result.structuredContent).toMatchObject({
      packages: [
        { name: '@acme/env', install: 'npm install @acme/env' },
        { name: '@acme/text', install: 'npm install @acme/text' },
      ],
    });
  });

  it('searches utilities and hints when nothing matches', async () => {
    const mcp = await connect();
    const found = await mcp.callTool({
      name: 'search_utilities',
      arguments: { query: 'slug', limit: 1 },
    });
    const empty = await mcp.callTool({
      name: 'search_utilities',
      arguments: { query: 'kubernetes' },
    });

    expect(found.structuredContent).toMatchObject({ results: [{ name: 'toKebabCase' }] });
    expect(empty.structuredContent).toMatchObject({
      results: [],
      hint: expect.any(String),
    });
  });

  it('returns full details with import statement and install command', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'loadEnvFiles' },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      utility: {
        name: 'loadEnvFiles',
        runtime: 'node',
        import: "import { loadEnvFiles } from '@acme/env/node';",
        install: 'npm install @acme/env',
      },
    });
  });

  it('uses a type-only import for types', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'TruncateOptions' },
    });

    expect(result.structuredContent).toMatchObject({
      utility: { import: "import type { TruncateOptions } from '@acme/text';" },
    });
  });

  it('suggests close matches for an unknown name', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'trunacte' },
    });

    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('Did you mean: truncate (@acme/text)?');
  });

  it('asks for a package when a name is ambiguous', async () => {
    const registry = fixtureRegistry();
    registry.utilities.push(
      utility({ name: 'truncate', package: '@acme/other', importPath: '@acme/other' }),
    );
    const mcp = await connect({ registry });

    const ambiguous = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'truncate' },
    });
    const picked = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'truncate', package: 'other' },
    });

    expect(ambiguous.isError).toBe(true);
    expect(textOf(ambiguous)).toContain('@acme/text, @acme/other');
    expect(picked.structuredContent).toMatchObject({
      utility: { importPath: '@acme/other' },
    });
  });
});
