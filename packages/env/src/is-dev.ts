/* eslint-disable node/prefer-global/process */

/**
 * ⚠️ WARNING: This function PREVENTS dead code elimination in production builds!
 *
 * Bundlers cannot optimize away calls to this function because:
 * 1. It's a function call (not a constant)
 * 2. Runtime typeof checks prevent compile-time evaluation
 *
 * ❌ DON'T USE THIS: if (isDevelopment()) { devOnlyCode(); }
 * ✅ USE THIS INSTEAD: if (process.env.NODE_ENV !== 'production') { devOnlyCode(); }
 *
 * The direct check allows bundlers to eliminate dead code at build time.
 * Only use this function if you need runtime environment detection.
 */
export function isDevelopment(): boolean {
  return (
    (typeof process !== 'undefined' && process.env?.['DEV'] === 'true') ||
    (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.['DEV'] === 'true') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.['MODE'] === 'development')
  );
}
