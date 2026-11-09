import { isPortAvailable } from './is-port-available';

const MAX_PORT = 65535;
const DEFAULT_MAX_ATTEMPTS = 100;

export interface FindAvailablePortOptions {
  /** Interface to probe. Defaults to IPv4 loopback. */
  host?: string;
  /** Ports to skip, for example ports reserved for another service. */
  exclude?: ReadonlySet<number>;
  /** Number of consecutive ports to consider, including excluded ports. Defaults to 100. */
  maxAttempts?: number;
}

/**
 * Find the first available TCP port at or above the preferred port, or throw on exhaustion.
 * @example
 * const port = await findAvailablePort(3000, { maxAttempts: 20 });
 */
export async function findAvailablePort(
  preferredPort: number,
  options: FindAvailablePortOptions = {},
): Promise<number> {
  const { host = '127.0.0.1', exclude, maxAttempts = DEFAULT_MAX_ATTEMPTS } = options;
  if (!Number.isInteger(preferredPort) || preferredPort < 1 || preferredPort > MAX_PORT) {
    throw new RangeError(`Port must be a whole number from 1 to ${MAX_PORT}.`);
  }
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) {
    throw new RangeError('maxAttempts must be a positive safe integer.');
  }
  const lastPort = Math.min(MAX_PORT, preferredPort + maxAttempts - 1);
  for (let port = preferredPort; port <= lastPort; port++) {
    if (exclude?.has(port)) continue;
    // Sequential probes preserve preference order and close each temporary listener.
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(port, host)) return port;
  }
  throw new Error(`No available TCP port found from ${preferredPort} to ${lastPort}.`);
}
