import type { AddressInfo, Server } from 'node:net';
import { createServer } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { findAvailablePort, isPortAvailable } from '../src';

const servers: Server[] = [];

async function listen(host = '127.0.0.1'): Promise<number> {
  const server = createServer();
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolve);
  });
  return (server.address() as AddressInfo).port;
}

async function close(server: Server): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map(close));
});

describe('isPortAvailable', () => {
  it('should report occupied ports and release its own probe listener', async () => {
    const port = await listen();
    await expect(isPortAvailable(port)).resolves.toBe(false);
    await close(servers[0]!);
    await expect(isPortAvailable(port)).resolves.toBe(true);
    await expect(isPortAvailable(port)).resolves.toBe(true);
  });

  it('should support wildcard interfaces', async () => {
    const port = await listen('0.0.0.0');
    await expect(isPortAvailable(port, '0.0.0.0')).resolves.toBe(false);
  });

  it.each([0, -1, 65536, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'should reject invalid port %s',
    async (port) => {
      await expect(isPortAvailable(port)).rejects.toThrow(RangeError);
    },
  );

  it('should propagate unexpected host errors', async () => {
    await expect(isPortAvailable(3000, 'invalid host')).rejects.toThrow();
  });
});

describe('findAvailablePort', () => {
  it('should return the preferred port when available without reserving it', async () => {
    const port = await listen();
    await close(servers[0]!);
    await expect(findAvailablePort(port)).resolves.toBe(port);
    await expect(isPortAvailable(port)).resolves.toBe(true);
  });

  it('should skip occupied ports', async () => {
    const port = await listen();
    const selected = await findAvailablePort(port);
    expect(selected).toBeGreaterThan(port);
    await expect(isPortAvailable(selected)).resolves.toBe(true);
  });

  it('should skip explicitly excluded ports', async () => {
    const port = await listen();
    await close(servers[0]!);
    const selected = await findAvailablePort(port, { exclude: new Set([port]) });
    expect(selected).toBeGreaterThan(port);
  });

  it('should stop at the configured attempt limit', async () => {
    const port = await listen('0.0.0.0');
    await expect(
      findAvailablePort(port, { host: '0.0.0.0', maxAttempts: 1 }),
    ).rejects.toThrow('No available TCP port');
  });

  it('should stop at the maximum TCP port', async () => {
    await expect(findAvailablePort(65535, { exclude: new Set([65535]) })).rejects.toThrow(
      'No available TCP port found from 65535 to 65535.',
    );
  });

  it.each([0, -1, 65536, 1.5, Number.NaN])(
    'should reject preferred port %s',
    async (port) => {
      await expect(findAvailablePort(port)).rejects.toThrow(RangeError);
    },
  );

  it.each([0, -1, 1.5, Number.POSITIVE_INFINITY])(
    'should reject attempt limit %s',
    async (maxAttempts) => {
      await expect(findAvailablePort(3000, { maxAttempts })).rejects.toThrow(RangeError);
    },
  );
});
