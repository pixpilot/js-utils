# @pixpilot/number

A collection of utility functions for working with JavaScript numbers.

## Installation

```bash
pnpm add @pixpilot/number
```

## Usage

```typescript
import {
  average,
  clamp,
  formatWithSeparator,
  isNumber,
  randomInt,
  round,
  sum,
} from '@pixpilot/number';

// Type guards
if (isNumber(value)) {
  // value is a valid number (not NaN)
}

// Number manipulation
const min = 0;
const max = 10;
const value = 15;
const clamped = clamp(value, min, max); // 10
const pi = 3.14159;
const decimals = 2;
const rounded = round(pi, decimals); // 3.14

// Random numbers
const diceMin = 1;
const diceMax = 6;
const dice = randomInt(diceMin, diceMax); // Random integer 1-6

// Array operations
const numbers = [1, 2, 3, 4, 5];
const total = sum(numbers); // 15
const scores = [10, 20, 30];
const avg = average(scores); // 20

// Formatting
const largeNumber = 1000000;
const formatted = formatWithSeparator(largeNumber); // '1,000,000'
```

## API

### Type Guards

- `isNumber(value: unknown): value is number` - Check if value is a number (excluding NaN)
- `isInteger(value: unknown): value is number` - Check if value is an integer
- `isFiniteNumber(value: unknown): value is number` - Check if value is a finite number
- `isSafeInteger(value: unknown): value is number` - Check if value is a safe integer

### Number Manipulation

- `clamp(value: number, min: number, max: number): number` - Clamp a number between min and max
- `round(value: number, decimals?: number): number` - Round to specified decimal places

### Random Numbers

- `randomInt(min: number, max: number): number` - Generate random integer (inclusive)
- `random(min: number, max: number): number` - Generate random number

### Array Operations

- `sum(numbers: number[]): number` - Calculate sum of numbers
- `average(numbers: number[]): number` - Calculate average
- `min(numbers: number[]): number` - Find minimum value
- `max(numbers: number[]): number` - Find maximum value

### Number Predicates

- `isEven(value: number): boolean` - Check if number is even
- `isOdd(value: number): boolean` - Check if number is odd
- `isPositive(value: number): boolean` - Check if number is positive
- `isNegative(value: number): boolean` - Check if number is negative
- `inRange(value: number, min: number, max: number): boolean` - Check if number is in range

### Conversions

- `toRadians(degrees: number): number` - Convert degrees to radians
- `toDegrees(radians: number): number` - Convert radians to degrees

### Formatting

- `formatWithSeparator(value: number, separator?: string): string` - Format with thousand separators

### Parsing

- `parseNumberOrNull(value: string): number | null` - Parse string to number, return null if invalid

## Contributing

We welcome contributions! Please see the [main contributing guide](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
