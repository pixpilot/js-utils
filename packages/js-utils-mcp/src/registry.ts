import type { UtilityRegistry } from '@pixpilot/mcp';
import { asRegistry } from '@pixpilot/mcp';
import registryJson from './generated/registry.json';

/** Generated catalog of every @pixpilot utility. Regenerate with `pnpm mcp:generate`. */
export const registry: UtilityRegistry = asRegistry(registryJson);
