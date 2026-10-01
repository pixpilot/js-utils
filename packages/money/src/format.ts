function getMinorUnitDivisor(currency: string): number {
  const { minimumFractionDigits = 0 } = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).resolvedOptions();

  return 10 ** minimumFractionDigits;
}

/**
 * Format an amount in minor units (e.g. cents) as an `en-US` currency string.
 *
 * The divisor follows the currency's standard fraction digits, so zero-decimal
 * currencies such as JPY are not divided.
 *
 * @param amountMinorUnits - Amount in the currency's minor unit (cents for USD)
 * @param currency - ISO 4217 currency code, case-insensitive (default: 'usd')
 * @returns The formatted amount
 *
 * @example
 * ```typescript
 * formatMoney(1234); // '$12.34'
 * formatMoney(1234, 'eur'); // '€12.34'
 * formatMoney(500, 'jpy'); // '¥500'
 * ```
 */
export function formatMoney(amountMinorUnits: number, currency = 'usd'): string {
  const divisor = getMinorUnitDivisor(currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountMinorUnits / divisor);
}
