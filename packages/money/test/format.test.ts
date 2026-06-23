import { formatMoney } from '../src/format';

describe('formatMoney', () => {
  it('should be defined', () => {
    expect(formatMoney).toBeDefined();
  });

  it('should format money correctly', () => {
    expect(formatMoney(123456)).toBe('$1,234.56');
  });
});
