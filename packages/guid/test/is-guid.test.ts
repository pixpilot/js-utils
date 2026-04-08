import { describe, expect, it } from 'vitest';
import { isGuidString } from '../src/is-guid';

describe('isGuidString', () => {
  it('should return true for canonical lowercase GUID strings', () => {
    expect(isGuidString('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isGuidString('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('should return true for uppercase and mixed-case GUID strings', () => {
    expect(isGuidString('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    expect(isGuidString('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
  });

  it('should return false for values with incorrect length', () => {
    expect(isGuidString('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
    expect(isGuidString('550e8400-e29b-41d4-a716-4466554400000')).toBe(false);
    expect(isGuidString('')).toBe(false);
  });

  it('should return false when dash positions are wrong', () => {
    expect(isGuidString('550e8400e-29b-41d4-a716-446655440000')).toBe(false);
    expect(isGuidString('550e8400-e29b41d4-a716-446655440000')).toBe(false);
    expect(isGuidString('550e8400-e29b-41d4a716-446655440000')).toBe(false);
    expect(isGuidString('550e8400-e29b-41d4-a716446655440000')).toBe(false);
  });

  it('should return false for non-hexadecimal characters', () => {
    expect(isGuidString('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
    expect(isGuidString('550e8400-e29b-41d4-a716-44665544_000')).toBe(false);
    expect(isGuidString('zzzzzzzz-e29b-41d4-a716-446655440000')).toBe(false);
  });

  it('should return false for GUID-like wrappers and separators', () => {
    expect(isGuidString('{550e8400-e29b-41d4-a716-446655440000}')).toBe(false);
    expect(isGuidString('(550e8400-e29b-41d4-a716-446655440000)')).toBe(false);
    expect(isGuidString('550e8400_e29b_41d4_a716_446655440000')).toBe(false);
    expect(isGuidString('550e8400/e29b/41d4/a716/446655440000')).toBe(false);
  });
});
