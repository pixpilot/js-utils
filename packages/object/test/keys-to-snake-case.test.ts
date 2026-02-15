import type { KeysToSnakeCase } from '../src/keys-to-snake-case';

import { describe, expect, expectTypeOf, it } from 'vitest';
import { keysToSnakeCase } from '../src/keys-to-snake-case';

describe('keysToSnakeCase', () => {
  it('should convert simple camelCase keys to snake_case', () => {
    const input = { camelCaseKey: 'value' };
    const expected = { camel_case_key: 'value' };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle multiple words', () => {
    const input = { multiWordKeyName: 'value' };
    const expected = { multi_word_key_name: 'value' };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle keys that are already snake_case', () => {
    const input = { snake_case_key: 'value' };
    const expected = { snake_case_key: 'value' };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle keys without uppercase', () => {
    const input = { simplekey: 'value' };
    const expected = { simplekey: 'value' };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      parentKey: {
        childKey: 'value',
        anotherChild: {
          deepKey: 'deep value',
        },
      },
    };
    const expected = {
      parent_key: {
        child_key: 'value',
        another_child: {
          deep_key: 'deep value',
        },
      },
    };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle arrays of objects', () => {
    const input = {
      items: [{ itemKey: 'value1' }, { anotherKey: 'value2' }],
    };
    const expected = {
      items: [{ item_key: 'value1' }, { another_key: 'value2' }],
    };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle mixed arrays', () => {
    const input = {
      mixedArray: [{ objectKey: 'object value' }, 'string value', 42, null],
    };
    const expected = {
      mixed_array: [{ object_key: 'object value' }, 'string value', 42, null],
    };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle empty objects', () => {
    const input = {};
    const expected = {};
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle primitive values unchanged', () => {
    expect(keysToSnakeCase('string')).toBe('string');
    expect(keysToSnakeCase(42)).toBe(42);
    expect(keysToSnakeCase(true)).toBe(true);
    expect(keysToSnakeCase(null)).toBe(null);
    expect(keysToSnakeCase(undefined)).toBe(undefined);
  });

  it('should handle arrays of primitives', () => {
    const input = ['string', 42, true, null];
    const expected = ['string', 42, true, null];
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle complex nested structures', () => {
    const input = {
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

    const expected = {
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

    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should preserve array structure', () => {
    const input = [{ camelCase: 'value1' }, { anotherCamel: 'value2' }];
    const expected = [{ camel_case: 'value1' }, { another_camel: 'value2' }];
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle keys starting with uppercase', () => {
    const input = { PrivateKey: 'value' };
    const expected = { private_key: 'value' };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should handle keys with consecutive uppercase', () => {
    const input = { XMLData: 'value' };
    const expected = { xml_data: 'value' };
    expect(keysToSnakeCase(input)).toEqual(expected);
  });

  it('should transform nested keys at the type level', () => {
    interface Input {
      parentKey: {
        childKey: string;
        anotherChild: {
          deepKey: string;
        };
      };
    }

    interface Expected {
      parent_key: {
        child_key: string;
        another_child: {
          deep_key: string;
        };
      };
    }

    expectTypeOf<KeysToSnakeCase<Input>>().toEqualTypeOf<Expected>();
  });

  it('should transform nested arrays/tuples at the type level', () => {
    interface Input {
      items: Array<{ itemKey: string; deepList: { deepKey: string }[] }>;
      tuple: [{ firstKey: 1 }, { secondKey: 2 }];
      privateKey: string;
      xmlData: string;
    }

    interface Expected {
      items: Array<{ item_key: string; deep_list: { deep_key: string }[] }>;
      tuple: [{ first_key: 1 }, { second_key: 2 }];
      private_key: string;
      xml_data: string;
    }

    type Result = KeysToSnakeCase<Input>;

    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
