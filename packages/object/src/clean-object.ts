/**
 * Inspired by https://github.com/nunofgs/clean-deep
 */

import { isEmptyObject, isPlainObject } from './type-guards';

export interface CleanOptions {
  cleanKeys?: readonly string[];
  cleanValues?: readonly unknown[];
  emptyArrays?: boolean;
  emptyObjects?: boolean;
  emptyStrings?: boolean;
  NaNValues?: boolean;
  nullValues?: boolean;
  undefinedValues?: boolean;
  shouldRemove?: (key: string, value: unknown, base?: unknown) => boolean;
  transform?: (key: string, value: unknown, base?: unknown) => unknown;
}

type Cleanable = Record<string, unknown> | unknown[];

interface ResolvedCleanOptions {
  cleanKeys: readonly string[];
  cleanValues: readonly unknown[];
  emptyArrays: boolean;
  emptyObjects: boolean;
  emptyStrings: boolean;
  NaNValues: boolean;
  nullValues: boolean;
  undefinedValues: boolean;
  shouldRemove: ((key: string, value: unknown, base?: unknown) => boolean) | undefined;
  transform: ((key: string, value: unknown, base?: unknown) => unknown) | undefined;
}

function resolveOptions(options: CleanOptions | undefined): ResolvedCleanOptions {
  return {
    cleanKeys: options?.cleanKeys ?? [],
    cleanValues: options?.cleanValues ?? [],
    emptyArrays: options?.emptyArrays ?? true,
    emptyObjects: options?.emptyObjects ?? true,
    emptyStrings: options?.emptyStrings ?? true,
    NaNValues: options?.NaNValues ?? false,
    nullValues: options?.nullValues ?? true,
    undefinedValues: options?.undefinedValues ?? true,
    shouldRemove: options?.shouldRemove,
    transform: options?.transform,
  };
}

function isCleanable(value: unknown): value is Cleanable {
  return (Array.isArray(value) || isPlainObject(value)) && !(value instanceof Date);
}

function shouldSkipValue(value: unknown, options: ResolvedCleanOptions): boolean {
  if (options.cleanValues.includes(value)) {
    return true;
  }

  if (options.emptyObjects && isPlainObject(value) && isEmptyObject(value)) {
    return true;
  }

  if (options.emptyArrays && Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (options.emptyStrings && value === '') {
    return true;
  }

  if (options.NaNValues && typeof value === 'number' && Number.isNaN(value)) {
    return true;
  }

  if (options.nullValues && value === null) {
    return true;
  }

  if (options.undefinedValues && value === undefined) {
    return true;
  }

  return false;
}

function cleanDeep(value: Cleanable, options: ResolvedCleanOptions): Cleanable {
  if (Array.isArray(value)) {
    const result: unknown[] = [];

    for (let index = 0; index < value.length; index += 1) {
      const key = String(index);

      const isIndexRemoved = options.cleanKeys.includes(key);
      if (!isIndexRemoved) {
        const transformed = options.transform
          ? options.transform(key, value[index], value)
          : value[index];
        const cleaned = isCleanable(transformed)
          ? cleanDeep(transformed, options)
          : transformed;
        const shouldRemove = options.shouldRemove
          ? options.shouldRemove(key, cleaned, value)
          : false;
        const shouldSkip = shouldRemove || shouldSkipValue(cleaned, options);

        if (!shouldSkip) {
          result.push(cleaned);
        }
      }
    }

    return result;
  }

  const prototype = Object.getPrototypeOf(value as object) as object | null;
  const result = Object.create(prototype) as Record<string, unknown>;

  for (const [key, originalValue] of Object.entries(value)) {
    const isKeyRemoved = options.cleanKeys.includes(key);
    if (!isKeyRemoved) {
      const transformed = options.transform
        ? options.transform(key, originalValue, value)
        : originalValue;
      const cleaned = isCleanable(transformed)
        ? cleanDeep(transformed, options)
        : transformed;
      const shouldRemove = options.shouldRemove
        ? options.shouldRemove(key, cleaned, value)
        : false;
      const shouldSkip = shouldRemove || shouldSkipValue(cleaned, options);

      if (!shouldSkip) {
        result[key] = cleaned;
      }
    }
  }

  return result;
}

function cleanObject<T>(value: T, options?: CleanOptions): T {
  const resolvedOptions = resolveOptions(options);

  if (!isCleanable(value)) {
    return value;
  }

  return cleanDeep(value, resolvedOptions) as T;
}

export { cleanObject };
