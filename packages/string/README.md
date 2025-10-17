# @pixpilot/string

A collection of utility functions for working with JavaScript strings.

## Installation

```bash
pnpm add @pixpilot/string
```

## Usage

```typescript
import { isString, toCamelCase, toKebabCase, truncate } from '@pixpilot/string';

// Case conversion
const camel = toCamelCase('hello world'); // 'helloWorld'
const kebab = toKebabCase('hello world'); // 'hello-world'

// String manipulation
const maxLength = 10;
const short = truncate('This is a long string', maxLength); // 'This is a ...'

// Type guards and validation
if (isString(value)) {
  // value is typed as string
}
```

## API

### Type Guards

- `isString(value: unknown): value is string` - Type guard to check if a value is a string

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

### Validation Functions

- `isEmpty(str: string, trimWhitespace?: boolean): boolean` - Check if a string is empty
- `isAlphanumeric(str: string): boolean` - Check if a string contains only alphanumeric characters
- `isEmail(str: string): boolean` - Check if a string is a valid email address
- `isUrl(str: string): boolean` - Check if a string is a valid URL

### Manipulation Functions

- `truncate(str: string, maxLength: number, ellipsis?: string): string` - Truncate a string
- `capitalize(str: string): string` - Capitalize the first letter
- `capitalizeFirst(str: string): string` - Capitalize first letter and lowercase rest
- `reverse(str: string): string` - Reverse a string
- `removeWhitespace(str: string): string` - Remove all whitespace
- `normalizeSpaces(str: string): string` - Replace multiple spaces with single space
- `padStart(str: string, targetLength: number, padString?: string): string` - Pad from the start
- `padEnd(str: string, targetLength: number, padString?: string): string` - Pad from the end
- `repeat(str: string, count: number): string` - Repeat a string
- `countOccurrences(str: string, searchValue: string, caseSensitive?: boolean): number` - Count occurrences
- `words(str: string): string[]` - Extract words from a string

## Contributing

We welcome contributions! Please see the [main contributing guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
