/**
 * Universal exports - safe to use in any environment (Node.js, browser, edge runtime)
 *
 * ⚠️ DO NOT export Node.js-specific code here (e.g., fs, path imports)
 * ⚠️ Node-only utilities should be exported from './node.ts' instead
 *
 * This is the main entry point: import { isDevelopment } from '@pixpilot/env'
 */
export * from './get-env';
export * from './is-dev';
