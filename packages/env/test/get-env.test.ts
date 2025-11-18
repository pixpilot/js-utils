import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getEnv } from '../src/get-env';

// Mock the get-env module to control process.env and import.meta
vi.mock('../src/get-env.ts', () => ({
  getEnv: vi.fn((key: string) => {
    if (typeof process !== 'undefined' && process.env?.[key] != null) {
      return process.env[key];
    }

    if (
      typeof (globalThis as any).mockImportMeta !== 'undefined' &&
      (globalThis as any).mockImportMeta.env?.[key] != null
    ) {
      return (globalThis as any).mockImportMeta.env[key];
    }
    return undefined;
  }),
}));

describe('getEnv', () => {
  const originalProcess = globalThis.process;

  beforeEach(() => {
    // Reset environment variables
    delete process.env['TEST_KEY'];
    // Reset mock import.meta
    (globalThis as any).mockImportMeta = undefined;
  });

  afterEach(() => {
    // Restore original process
    globalThis.process = originalProcess;
    vi.restoreAllMocks();
  });

  describe('process.env conditions', () => {
    it('should return the value from process.env when key exists', () => {
      process.env['TEST_KEY'] = 'test_value';
      expect(getEnv('TEST_KEY')).toBe('test_value');
    });

    it('should return undefined when key does not exist in process.env', () => {
      expect(getEnv('NON_EXISTENT_KEY')).toBe(undefined);
    });

    it('should return undefined when process.env key is deleted', () => {
      delete process.env['TEST_KEY'];
      expect(getEnv('TEST_KEY')).toBe(undefined);
    });
  });

  describe('import.meta.env conditions', () => {
    it('should return the value from import.meta.env when key exists', () => {
      (globalThis as any).mockImportMeta = { env: { TEST_KEY: 'meta_value' } };
      expect(getEnv('TEST_KEY')).toBe('meta_value');
    });

    it('should return undefined when key does not exist in import.meta.env', () => {
      (globalThis as any).mockImportMeta = { env: {} };
      expect(getEnv('NON_EXISTENT_KEY')).toBe(undefined);
    });

    it('should return undefined when import.meta.env key is missing', () => {
      (globalThis as any).mockImportMeta = { env: {} };
      expect(getEnv('TEST_KEY')).toBe(undefined);
    });

    it('should handle import.meta being undefined', () => {
      expect(getEnv('TEST_KEY')).toBe(undefined);
    });
  });

  describe('priority and fallback', () => {
    it('should prioritize process.env over import.meta.env', () => {
      process.env['TEST_KEY'] = 'process_value';
      (globalThis as any).mockImportMeta = { env: { TEST_KEY: 'meta_value' } };
      expect(getEnv('TEST_KEY')).toBe('process_value');
    });

    it('should fallback to import.meta.env when process.env does not have the key', () => {
      (globalThis as any).mockImportMeta = { env: { TEST_KEY: 'meta_value' } };
      expect(getEnv('TEST_KEY')).toBe('meta_value');
    });

    it('should return undefined when neither process.env nor import.meta.env has the key', () => {
      expect(getEnv('TEST_KEY')).toBe(undefined);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      process.env['TEST_KEY'] = '';
      expect(getEnv('TEST_KEY')).toBe('');
    });

    it('should handle numeric string values', () => {
      process.env['TEST_KEY'] = '123';
      expect(getEnv('TEST_KEY')).toBe('123');
    });

    it('should handle boolean-like string values', () => {
      process.env['TEST_KEY'] = 'true';
      expect(getEnv('TEST_KEY')).toBe('true');
    });
  });
});
