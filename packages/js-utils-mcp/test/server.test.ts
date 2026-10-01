import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';
import { createServer, SERVER_NAME, SERVER_SUMMARY } from '../src';

describe('pixpilot-js-utils server', () => {
  it('serves the generated registry with its own name and summary', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test', version: '0.0.0' });
    await Promise.all([
      createServer('1.0.0').connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: 'get_utility_details',
      arguments: { name: 'truncate' },
    });

    expect(client.getServerVersion()).toEqual({ name: SERVER_NAME, version: '1.0.0' });
    expect(client.getInstructions()).toContain(SERVER_SUMMARY);
    expect(result.structuredContent).toMatchObject({
      utility: {
        import: "import { truncate } from '@pixpilot/string';",
        install: 'npm install @pixpilot/string',
      },
    });

    await client.close();
  });
});
