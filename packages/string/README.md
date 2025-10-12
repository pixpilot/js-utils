# @pixpilot/string

A collection of utility functions for working with JavaScript strings.

## Installation

```bash
pnpm add @pixpilot/string
```

## Usage

```typescript
import { toCamelCase, toKebabCase } from '@pixpilot/string';

// Example: Convert strings to different cases
const camel = toCamelCase('hello world'); // 'helloWorld'
const kebab = toKebabCase('hello world'); // 'hello-world'
```

## API

### Case Conversion Functions

- `toCamelCase(str: string): string` - Convert a string to camel case (`fooBar`)
- `toCapitalCase(str: string): string` - Convert a string to capital case (`Foo Bar`)
- `toConstantCase(str: string): string` - Convert a string to constant case (`CONSTANT_CASE`)
- `toDotCase(str: string): string` - Convert a string to dot case (`dot.case`)
- `toKebabCase(str: string): string` - Convert a string to kebab case (`kebab-case`)
- `toNoCase(str: string): string` - Convert a string to no case (`no case`)
- `toPascalCase(str: string): string` - Convert a string to pascal case (`PascalCase`)
- `toPascalSnakeCase(str: string): string` - Convert a string to pascal snake case (`Pascal_Snake_Case`)
- `toPathCase(str: string): string` - Convert a string to path case (`path/case`)
- `toSentenceCase(str: string): string` - Convert a string to sentence case (`Sentence case`)
- `toSnakeCase(str: string): string` - Convert a string to snake case (`snake_case`)
- `toTrainCase(str: string): string` - Convert a string to train case (`Train-Case`)

## Contributing

We welcome contributions! Please see the [main contributing guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
