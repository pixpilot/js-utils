import { formatMoney } from '../src/format';

describe('formatMoney', () => {
  it('should be defined', () => {
    expect(formatMoney).toBeDefined();
  });

  it('should format money correctly', () => {
    expect(formatMoney(123456)).toBe('$1,234.56');
  });
  it('should format money correctly with different currency', () => {
    expect(formatMoney(123456, 'eur')).toBe('€1,234.56');
  });

  it('should format currencies without minor units', () => {
    expect(formatMoney(123, 'jpy')).toBe('¥123');
  });
});
