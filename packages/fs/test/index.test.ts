import { describe, expect, it } from 'vitest';

import { findRoot } from '../src';

describe('index', () => {
  it('should export findRoot', () => {
    expect(findRoot).toBeTypeOf('function');
  });
});
