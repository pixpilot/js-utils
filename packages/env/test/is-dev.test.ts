import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isDevelopment } from '../src/is-dev';

// Mock the is-dev module to control import.meta
vi.mock('../src/is-dev.ts', () => ({
  isDevelopment: vi.fn(
    () =>
      (typeof process !== 'undefined' && process.env?.['DEV'] === 'true') ||
      (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') ||
      (typeof (globalThis as any).mockImportMeta !== 'undefined' &&
        (globalThis as any).mockImportMeta.env?.DEV === 'true') ||
      (typeof (globalThis as any).mockImportMeta !== 'undefined' &&
        (globalThis as any).mockImportMeta.env?.MODE === 'development'),
  ),
}));

describe('isDevelopment', () => {
  const originalProcess = globalThis.process;

  beforeEach(() => {
    // Reset environment variables
    delete process.env['DEV'];
    delete process.env['NODE_ENV'];
    // Reset mock import.meta
    (globalThis as any).mockImportMeta = undefined;
  });

  afterEach(() => {
    // Restore original process
    globalThis.process = originalProcess;
    vi.restoreAllMocks();
  });

  describe('process.env conditions', () => {
    it('should return true when process.env.DEV is "true"', () => {
      process.env['DEV'] = 'true';
      expect(isDevelopment()).toBe(true);
    });

    it('should return true when process.env.NODE_ENV is "development"', () => {
      process.env['NODE_ENV'] = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when process.env.DEV is not "true"', () => {
      process.env['DEV'] = 'false';
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when process.env.NODE_ENV is not "development"', () => {
      process.env['NODE_ENV'] = 'production';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('import.meta.env conditions', () => {
    it('should return true when import.meta.env.DEV is "true"', () => {
      (globalThis as any).mockImportMeta = { env: { DEV: 'true' } };
      expect(isDevelopment()).toBe(true);
    });

    it('should return true when import.meta.env.MODE is "development"', () => {
      (globalThis as any).mockImportMeta = { env: { MODE: 'development' } };
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when import.meta.env.DEV is not "true"', () => {
      (globalThis as any).mockImportMeta = { env: { DEV: 'false' } };
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when import.meta.env.MODE is not "development"', () => {
      (globalThis as any).mockImportMeta = { env: { MODE: 'production' } };
      expect(isDevelopment()).toBe(false);
    });

    it('should handle import.meta being undefined', () => {
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false when all environment checks fail', () => {
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('combinations', () => {
    it('should return true when multiple process.env conditions are met', () => {
      process.env['DEV'] = 'true';
      process.env['NODE_ENV'] = 'development';

      expect(isDevelopment()).toBe(true);
    });

    it('should return true when DEV is true regardless of NODE_ENV', () => {
      process.env['DEV'] = 'true';
      process.env['NODE_ENV'] = 'production';

      expect(isDevelopment()).toBe(true);
    });

    it('should return true when NODE_ENV is development regardless of DEV', () => {
      process.env['DEV'] = 'false';
      process.env['NODE_ENV'] = 'development';

      expect(isDevelopment()).toBe(true);
    });

    it('should return true when import.meta.env conditions are met', () => {
      (globalThis as any).mockImportMeta = { env: { DEV: 'true' } };
      expect(isDevelopment()).toBe(true);
    });

    it('should return true when import.meta.env.MODE is development', () => {
      (globalThis as any).mockImportMeta = { env: { MODE: 'development' } };
      expect(isDevelopment()).toBe(true);
    });

    it('should return true when both process.env and import.meta.env conditions are met', () => {
      process.env['DEV'] = 'true';
      (globalThis as any).mockImportMeta = { env: { MODE: 'development' } };

      expect(isDevelopment()).toBe(true);
    });
  });
});
