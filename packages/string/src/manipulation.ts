/**
 * Truncate a string to a specified length, adding an ellipsis if truncated.
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string
 * @param ellipsis - The ellipsis to append (default: '...')
 * @returns The truncated string
 *
 * @example
 * ```typescript
 * truncate('Hello World', 5); // 'Hello...'
 * truncate('Hello', 10); // 'Hello'
 * truncate('Hello World', 5, '…'); // 'Hello…'
 * ```
 */
export function truncate(str: string, maxLength: number, ellipsis = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + ellipsis;
}

/**
 * Capitalize the first letter of a string.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 *
 * @example
 * ```typescript
 * capitalize('hello'); // 'Hello'
 * capitalize('WORLD'); // 'WORLD'
 * capitalize(''); // ''
 * ```
 */
export function capitalize(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize the first letter of a string and lowercase the rest.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 *
 * @example
 * ```typescript
 * capitalizeFirst('hello'); // 'Hello'
 * capitalizeFirst('WORLD'); // 'World'
 * capitalizeFirst('hELLO wORLD'); // 'Hello world'
 * ```
 */
export function capitalizeFirst(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Reverse a string.
 *
 * @param str - The string to reverse
 * @returns The reversed string
 *
 * @example
 * ```typescript
 * reverse('hello'); // 'olleh'
 * reverse('abc123'); // '321cba'
 * ```
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Remove all whitespace from a string.
 *
 * @param str - The string to process
 * @returns The string without whitespace
 *
 * @example
 * ```typescript
 * removeWhitespace('hello world'); // 'helloworld'
 * removeWhitespace('  a  b  c  '); // 'abc'
 * ```
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/gu, '');
}

/**
 * Replace multiple consecutive spaces with a single space.
 *
 * @param str - The string to process
 * @returns The string with normalized spaces
 *
 * @example
 * ```typescript
 * normalizeSpaces('hello    world'); // 'hello world'
 * normalizeSpaces('a  b  c'); // 'a b c'
 * ```
 */
export function normalizeSpaces(str: string): string {
  return str.replace(/\s+/gu, ' ').trim();
}

/**
 * Pad a string to a specified length from the start.
 *
 * @param str - The string to pad
 * @param targetLength - The target length
 * @param padString - The string to pad with (default: ' ')
 * @returns The padded string
 *
 * @example
 * ```typescript
 * padStart('5', 3, '0'); // '005'
 * padStart('hello', 10); // '     hello'
 * ```
 */
export function padStart(str: string, targetLength: number, padString = ' '): string {
  return str.padStart(targetLength, padString);
}

/**
 * Pad a string to a specified length from the end.
 *
 * @param str - The string to pad
 * @param targetLength - The target length
 * @param padString - The string to pad with (default: ' ')
 * @returns The padded string
 *
 * @example
 * ```typescript
 * padEnd('5', 3, '0'); // '500'
 * padEnd('hello', 10); // 'hello     '
 * ```
 */
export function padEnd(str: string, targetLength: number, padString = ' '): string {
  return str.padEnd(targetLength, padString);
}

/**
 * Repeat a string a specified number of times.
 *
 * @param str - The string to repeat
 * @param count - The number of times to repeat
 * @returns The repeated string
 *
 * @example
 * ```typescript
 * repeat('ha', 3); // 'hahaha'
 * repeat('*', 5); // '*****'
 * ```
 */
export function repeat(str: string, count: number): string {
  return str.repeat(count);
}

/**
 * Count the occurrences of a substring in a string.
 *
 * @param str - The string to search in
 * @param searchValue - The substring to count
 * @param caseSensitive - Whether the search is case-sensitive (default: true)
 * @returns The number of occurrences
 *
 * @example
 * ```typescript
 * countOccurrences('hello world hello', 'hello'); // 2
 * countOccurrences('Hello HELLO hello', 'hello', false); // 3
 * ```
 */
export function countOccurrences(
  str: string,
  searchValue: string,
  caseSensitive = true,
): number {
  if (searchValue.length === 0) {
    return 0;
  }

  const source = caseSensitive ? str : str.toLowerCase();
  const search = caseSensitive ? searchValue : searchValue.toLowerCase();

  let count = 0;
  let position = 0;

  while (true) {
    const index = source.indexOf(search, position);
    if (index === -1) {
      break;
    }
    count++;
    position = index + 1;
  }

  return count;
}

/**
 * Extract words from a string.
 *
 * @param str - The string to extract words from
 * @returns An array of words
 *
 * @example
 * ```typescript
 * words('hello world'); // ['hello', 'world']
 * words('one-two_three'); // ['one', 'two', 'three']
 * ```
 */
export function words(str: string): string[] {
  return str.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/gu) || [];
}
