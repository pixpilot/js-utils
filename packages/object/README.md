# @pixpilot/object

A collection of utility functions for working with JavaScript objects.

## Installation

```bash
pnpm add @pixpilot/object
```

## Usage

```typescript
import {
  deepClone,
  isObject,
  keysToCamelCase,
  keysToSnakeCase,
  omit,
  pick,
} from '@pixpilot/object';

// Convert object keys
const obj = { user_name: 'john', user_details: { first_name: 'John' } };
const camelCaseObj = keysToCamelCase(obj);
// { userName: 'john', userDetails: { firstName: 'John' } }

// Manipulate objects
const picked = pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
const omitted = omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }

// Clone deeply
const cloned = deepClone({ a: { b: { c: 1 } } });

// Type guards
if (isObject(value)) {
  // value is typed as Record<string, unknown>
}
```

## API

### Type Guards

- `isObject(value: unknown): value is Record<string, unknown>` - Check if value is an object
- `isPlainObject(value: unknown): value is Record<string, unknown>` - Check if value is a plain object
- `isEmptyObject(value: unknown): boolean` - Check if object is empty

### Key Transformation

- `keysToCamelCase<T>(obj: T): KeysToCamelCase<T>` - Convert all keys to camelCase
- `keysToSnakeCase<T>(obj: T): KeysToSnakeCase<T>` - Convert all keys to snake_case

### Object Manipulation

- `pick<T, K>(obj: T, keys: K[]): Pick<T, K>` - Pick specific keys from object
- `omit<T, K>(obj: T, keys: K[]): Omit<T, K>` - Omit specific keys from object
- `merge<T, U>(target: T, source: U): T & U` - Deep merge two objects
- `get<T>(obj: object, path: string, defaultValue?: T): T | undefined` - Get nested value by path
- `set<T>(obj: T, path: string, value: unknown): T` - Set nested value by path
- `has(obj: object, path: string): boolean` - Check if nested path exists
- `flatKeys(obj: object, prefix?: string): string[]` - Get all keys including nested paths
- `deepClone<T>(obj: T): T` - Deep clone an object
- `deepEqual(obj1: unknown, obj2: unknown): boolean` - Deep equality comparison
- `mapValues<T, U>(obj: T, fn: (value, key) => U): Record<keyof T, U>` - Map over object values
- `mapKeys<T>(obj: T, fn: (key) => string): Record<string, T[keyof T]>` - Map over object keys

## Contributing

We welcome contributions! Please see the [main contributing guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
