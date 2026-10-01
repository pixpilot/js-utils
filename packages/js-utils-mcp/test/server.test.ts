import type { UtilityRegistry } from '../src/types';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';
import { registry } from '../src/registry';
import { createServer, SERVER_NAME } from '../src/server';

let client: Client | undefined;

async function connect(customRegistry?: UtilityRegistry): Promise<Client> {
  const server = createServer({
    version: '1.2.3',
    ...(customRegistry ? { registry: customRegistry } : {}),
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

describe('mcp server', () => {
  it('advertises a small, fixed tool set and usage instructions', async () => {
    const mcp = await connect();
    const { tools } = await mcp.listTools();

    expect(mcp.getServerVersion()).toEqual({ name: SERVER_NAME, version: '1.2.3' });
    expect(mcp.getInstructions()).toContain('search_utilities');
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_utility_details',
      'list_packages',
      'search_utilities',
    ]);
  });

  it('lists packages with entry points and install commands', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({ name: 'list_packages', arguments: {} });
    const { packages } = result.structuredContent as {
      packages: {
        name: string;
        install: string;
        entryPoints: { importPath: string }[];
      }[];
    };
    const env = packages.find((pkg) => pkg.name === '@pixpilot/env');

    expect(packages).toHaveLength(registry.packages.length);
    expect(env?.install).toBe('npm install @pixpilot/env');
    expect(env?.entryPoints.map((entry) => entry.importPath)).toEqual([
      '@pixpilot/env',
      '@pixpilot/env/node',
    ]);
  });

  it('searches utilities', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'search_utilities',
      arguments: { query: 'start of day', limit: 1 },
    });

    expect(result.structuredContent).toMatchObject({
      results: [{ name: 'startOfDay', importPath: '@pixpilot/date' }],
    });
  });

  it('adds a hint when nothing matches', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'search_utilities',
      arguments: { query: 'kubernetes' },
    });

    expect(result.structuredContent).toMatchObject({
      results: [],
      hint: expect.any(String),
    });
  });

  it('returns full details with import statement and install command', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'truncate' },
    });
    const { utility } = result.structuredContent as {
      utility: {
        import: string;
        install: string;
        signatures: unknown[];
        examples: string[];
      };
    };

    expect(result.isError).toBeFalsy();
    expect(utility.import).toBe("import { truncate } from '@pixpilot/string';");
    expect(utility.install).toBe('npm install @pixpilot/string');
    expect(utility.signatures).toHaveLength(1);
    expect(utility.examples.length).toBeGreaterThan(0);
  });

  it('suggests close matches for an unknown name', async () => {
    const mcp = await connect();
    const result = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'trunacte' },
    });

    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('truncate (@pixpilot/string)');
  });

  it('asks for a package when a name is ambiguous', async () => {
    const [truncate] = registry.utilities.filter((item) => item.name === 'truncate');
    const mcp = await connect({
      packages: [],
      utilities: [
        truncate!,
        { ...truncate!, package: '@pixpilot/other', importPath: '@pixpilot/other' },
      ],
    });

    const ambiguous = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'truncate' },
    });
    const picked = await mcp.callTool({
      name: 'get_utility_details',
      arguments: { name: 'truncate', package: 'other' },
    });

    expect(ambiguous.isError).toBe(true);
    expect(textOf(ambiguous)).toContain('@pixpilot/string, @pixpilot/other');
    expect(picked.structuredContent).toMatchObject({
      utility: { importPath: '@pixpilot/other' },
    });
  });
});
