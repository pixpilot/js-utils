import deepmerge from '@fastify/deepmerge';

// Create a deepmerge instance with default options
let deepMergeInstance: ReturnType<typeof deepmerge> | null = null;

function getDeepMerge() {
  if (!deepMergeInstance) {
    deepMergeInstance = deepmerge();
  }
  return deepMergeInstance;
}

/**
 * Deep merge multiple objects.
 *
 * Uses @fastify/deepmerge to merge any number of objects into a single result.
 * Objects are merged from left to right, with later objects overriding earlier ones.
 *
 * @param objects - The objects to merge
 * @returns A new merged object
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const obj3 = { e: 5, f: 6 };
 * deepMergeMany(obj1, obj2, obj3); // { a: 1, b: { c: 2, d: 3 }, e: 5, f: 6 }
 * ```
 */
export function deepMergeMany<T extends Record<string, unknown>>(
  ...objects: T[]
): Record<string, unknown> {
  if (objects.length === 0) {
    return {};
  }
  if (objects.length === 1) {
    return objects[0] ?? {};
  }
  // Merge all objects sequentially
  let result: Record<string, unknown> = {};
  for (const obj of objects) {
    result = getDeepMerge()(result, obj);
  }
  return result;
}

/**
 * Re-export the configured deepmerge instance from @fastify/deepmerge.
 *
 * This provides direct access to the deepmerge function for advanced use cases,
 * allowing merging of multiple objects and custom options.
 *
 * @example
 * ```typescript
 * import { deepmerge } from '@pixpilot/object';
 * const result = deepmerge({ a: 1 }, { b: 2 }, { c: 3 });
 * // { a: 1, b: 2, c: 3 }
 * ```
 */
export function deepMerge<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(target: T, source: U): T & U {
  return getDeepMerge()(target, source) as T & U;
}
