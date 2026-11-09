import { createServer } from 'node:net';

const MAX_PORT = 65535;

/**
 * Check whether a TCP port can be bound on the given host; the port is not reserved.
 * @example
 * const available = await isPortAvailable(3000, '127.0.0.1');
 */
export async function isPortAvailable(
  port: number,
  host = '127.0.0.1',
): Promise<boolean> {
  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
    throw new RangeError(`Port must be a whole number from 1 to ${MAX_PORT}.`);
  }
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') resolve(false);
      else reject(error);
    });
    server.listen({ port, host, exclusive: true }, () => {
      server.close((error) => (error ? reject(error) : resolve(true)));
    });
  });
}
