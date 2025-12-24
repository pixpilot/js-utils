import { deleteProperty, setProperty } from 'dot-prop';

type Path = (number | string)[] | string;

/**
 * Set a nested value in an object using a path string.
 *
 * @param object - The target object
 * @param path - The path to set the value at (e.g., 'a.b.c')
 * @param value - The value to set
 * @param options - Options for setting the value
 * @param options.deleteUndefine - If true, delete the property when value is undefined
 *
 * @example
 * ```typescript
 * const obj = { a: { b: {} } };
 * setObjectValueByPath(obj, 'a.b.c', 42); // { a: { b: { c: 42 } } }
 * ```
 */
export function setObjectValueByPath<TResult = any>(
  object: object,
  path: Path,
  value: TResult,
  options: {
    deleteUndefine?: boolean;
  } = {},
): void {
  if (options.deleteUndefine && value === undefined) {
    deleteProperty(object, path);
  } else {
    setProperty(object, path, value);
  }
}
