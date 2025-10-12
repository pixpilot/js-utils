# @pixpilot/object

A collection of utility functions for working with JavaScript objects.

## Installation

```bash
pnpm add @pixpilot/object
```

## Usage

```typescript
import { keysToCamelCase, keysToSnakeCase } from '@pixpilot/object';

// Example: Convert object keys between camelCase and snake_case
const obj = { user_name: 'john', user_details: { first_name: 'John', last_name: 'Doe' } };
const camelCaseObj = keysToCamelCase(obj);
```

## API

### `keysToCamelCase(obj: any): any`

Converts all keys in an object (and nested objects) from snake_case to camelCase.

### `keysToSnakeCase(obj: any): any`

Converts all keys in an object (and nested objects) from camelCase to snake_case.

## Contributing

We welcome contributions! Please see the [main contributing guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
