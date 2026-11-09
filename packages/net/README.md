# @pixpilot/net

Node.js utilities for finding and checking available TCP ports. No runtime dependencies.

```sh
pnpm add @pixpilot/net
```

```ts
import { findAvailablePort, isPortAvailable } from '@pixpilot/net';

const preferredPort = 3000;
const excludedPort = 3001;
const port = await findAvailablePort(preferredPort);
const available = await isPortAvailable(preferredPort, '0.0.0.0');

const anotherPort = await findAvailablePort(preferredPort, {
  host: '127.0.0.1',
  exclude: new Set([excludedPort]),
  maxAttempts: 100,
});
```

- `isPortAvailable(port, host?)` temporarily binds and closes a TCP listener. It returns `false` for occupied or permission-denied ports and propagates other errors.
- `findAvailablePort(preferredPort, options?)` searches upward, includes excluded ports in the attempt limit, and throws when the range is exhausted.
- Ports must be integers from 1 to 65535. Both functions default to `127.0.0.1`; `maxAttempts` defaults to 100.
- A successful probe does not reserve the port. The caller must handle a possible conflict when starting its own server.
- Node.js only: these utilities import `node:net` and are not for browser bundles.
