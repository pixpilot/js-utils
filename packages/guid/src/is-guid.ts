const FIRST_CHARACTER_INDEX = 0;
const GUID_LENGTH = '00000000-0000-0000-0000-000000000000'.length;
const GUID_SEPARATOR_CODE = '-'.charCodeAt(FIRST_CHARACTER_INDEX);
const GUID_SEPARATOR_ONE_INDEX = '00000000'.length;
const GUID_SEPARATOR_TWO_INDEX = '00000000-0000'.length;
const GUID_SEPARATOR_THREE_INDEX = '00000000-0000-0000'.length;
const GUID_SEPARATOR_FOUR_INDEX = '00000000-0000-0000-0000'.length;
const ZERO_CODE = '0'.charCodeAt(FIRST_CHARACTER_INDEX);
const NINE_CODE = '9'.charCodeAt(FIRST_CHARACTER_INDEX);
const UPPERCASE_A_CODE = 'A'.charCodeAt(FIRST_CHARACTER_INDEX);
const UPPERCASE_F_CODE = 'F'.charCodeAt(FIRST_CHARACTER_INDEX);
const LOWERCASE_A_CODE = 'a'.charCodeAt(FIRST_CHARACTER_INDEX);
const LOWERCASE_F_CODE = 'f'.charCodeAt(FIRST_CHARACTER_INDEX);

function isHexCode(charCode: number): boolean {
  return (
    (charCode >= ZERO_CODE && charCode <= NINE_CODE) ||
    (charCode >= UPPERCASE_A_CODE && charCode <= UPPERCASE_F_CODE) ||
    (charCode >= LOWERCASE_A_CODE && charCode <= LOWERCASE_F_CODE)
  );
}

/**
 * Check if a string matches the canonical GUID format.
 *
 * This implementation is optimized for repeated checks by validating fixed
 * positions before scanning the remaining hexadecimal characters.
 *
 * @param str - The string to check
 * @returns True if the string matches `8-4-4-4-12` hex characters, false otherwise
 *
 * @example
 * ```typescript
 * isGuidString('550e8400-e29b-41d4-a716-446655440000'); // true
 * isGuidString('not-a-guid'); // false
 * ```
 */
export function isGuidString(str: string): boolean {
  if (str.length !== GUID_LENGTH) {
    return false;
  }

  if (
    str.charCodeAt(GUID_SEPARATOR_ONE_INDEX) !== GUID_SEPARATOR_CODE ||
    str.charCodeAt(GUID_SEPARATOR_TWO_INDEX) !== GUID_SEPARATOR_CODE ||
    str.charCodeAt(GUID_SEPARATOR_THREE_INDEX) !== GUID_SEPARATOR_CODE ||
    str.charCodeAt(GUID_SEPARATOR_FOUR_INDEX) !== GUID_SEPARATOR_CODE
  ) {
    return false;
  }

  for (let index = 0; index < str.length; index += 1) {
    const isSeparatorIndex =
      index === GUID_SEPARATOR_ONE_INDEX ||
      index === GUID_SEPARATOR_TWO_INDEX ||
      index === GUID_SEPARATOR_THREE_INDEX ||
      index === GUID_SEPARATOR_FOUR_INDEX;

    if (!isSeparatorIndex && !isHexCode(str.charCodeAt(index))) {
      return false;
    }
  }

  return true;
}
