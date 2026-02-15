import type { KeysToCamelCase } from '../src/keys-to-camel-case';

import { describe, expect, expectTypeOf, it } from 'vitest';
import { keysToCamelCase } from '../src/keys-to-camel-case';

describe('toCamelCase', () => {
  it('should convert simple snake_case keys to camelCase', () => {
    const input = { snake_case_key: 'value' };
    const expected = { snakeCaseKey: 'value' };

    const result = keysToCamelCase(input);
    expect(result).toEqual(expected);
  });

  it('should handle multiple underscores', () => {
    const input = { multi_word_key_name: 'value' };
    const expected = { multiWordKeyName: 'value' };
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle keys that are already camelCase', () => {
    const input = { camelCaseKey: 'value' };
    const expected = { camelCaseKey: 'value' };
    const result = keysToCamelCase(input);
    expect(result).toEqual(expected);
  });

  it('should handle keys without underscores', () => {
    const input = { simplekey: 'value' };
    const expected = { simplekey: 'value' };
    const result = keysToCamelCase(input);
    expect(result).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      parent_key: {
        child_key: 'value',
        another_child: {
          deep_key: 'deep value',
        },
      },
    };
    const expected = {
      parentKey: {
        childKey: 'value',
        anotherChild: {
          deepKey: 'deep value',
        },
      },
    };
    const result = keysToCamelCase(input);
    expect(result).toEqual(expected);
  });

  it('should handle arrays of objects', () => {
    const input = {
      items: [{ item_key: 'value1' }, { another_key: 'value2' }],
    };
    const expected = {
      items: [{ itemKey: 'value1' }, { anotherKey: 'value2' }],
    };
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle mixed arrays', () => {
    const input = {
      mixed_array: [{ object_key: 'object value' }, 'string value', 42, null],
    };
    const expected = {
      mixedArray: [{ objectKey: 'object value' }, 'string value', 42, null],
    };
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle empty objects', () => {
    const input = {};
    const expected = {};
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle primitive values unchanged', () => {
    expect(keysToCamelCase('string')).toBe('string');
    expect(keysToCamelCase(42)).toBe(42);
    expect(keysToCamelCase(true)).toBe(true);
    expect(keysToCamelCase(null)).toBe(null);
    expect(keysToCamelCase(undefined)).toBe(undefined);
  });

  it('should handle arrays of primitives', () => {
    const input = ['string', 42, true, null];
    const expected = ['string', 42, true, null];
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle complex nested structures', () => {
    const input = {
      user_info: {
        personal_details: {
          first_name: 'John',
          last_name: 'Doe',
          contact_info: {
            email_address: 'john@example.com',
            phone_numbers: [
              { type: 'home', number: '123-456-7890' },
              { type: 'work', number: '098-765-4321' },
            ],
          },
        },
        preferences: {
          notification_settings: {
            email_notifications: true,
            sms_notifications: false,
          },
        },
      },
      metadata: {
        created_at: '2023-01-01',
        updated_by: 'system',
      },
    };

    const expected = {
      userInfo: {
        personalDetails: {
          firstName: 'John',
          lastName: 'Doe',
          contactInfo: {
            emailAddress: 'john@example.com',
            phoneNumbers: [
              { type: 'home', number: '123-456-7890' },
              { type: 'work', number: '098-765-4321' },
            ],
          },
        },
        preferences: {
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: false,
          },
        },
      },
      metadata: {
        createdAt: '2023-01-01',
        updatedBy: 'system',
      },
    };

    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should preserve array structure', () => {
    const input = [{ snake_case: 'value1' }, { another_snake: 'value2' }];
    const expected = [{ snakeCase: 'value1' }, { anotherSnake: 'value2' }];
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle keys starting with underscore', () => {
    const input = { _private_key: 'value' };
    const expected = { privateKey: 'value' };
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle keys with consecutive underscores', () => {
    const input = { key__with__double: 'value' };
    const expected = { keyWithDouble: 'value' };
    expect(keysToCamelCase(input)).toEqual(expected);
  });

  it('should handle nested arrays with objects', () => {
    const input = {
      deeplyNested: [
        [{ first_level_key: 'value1' }, { second_level_key: 'value2' }],
        [{ another_key: 'value3' }],
      ],
    };
    const expected = {
      deeplyNested: [
        [{ firstLevelKey: 'value1' }, { secondLevelKey: 'value2' }],
        [{ anotherKey: 'value3' }],
      ],
    };
    const result = keysToCamelCase(input);
    expect(result).toEqual(expected);
  });

  it('should transform nested keys at the type level', () => {
    interface Input {
      parent_key: {
        child_key: string;
        another_child: {
          deep_key: string;
        };
      };
    }

    interface Expected {
      parentKey: {
        childKey: string;
        anotherChild: {
          deepKey: string;
        };
      };
    }

    expectTypeOf<KeysToCamelCase<Input>>().toEqualTypeOf<Expected>();
  });

  it('should transform nested arrays/tuples at the type level', () => {
    interface Input {
      items: Array<{ item_key: string; deep_list: { deep_key: string }[] }>;
      tuple: [{ first_key: 1 }, { second_key: 2 }];
      _private_key: string;
      key__with__double: string;
    }

    interface Expected {
      items: Array<{ itemKey: string; deepList: { deepKey: string }[] }>;
      tuple: [{ firstKey: 1 }, { secondKey: 2 }];
      privateKey: string;
      keyWithDouble: string;
    }

    type Result = KeysToCamelCase<Input>;

    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
