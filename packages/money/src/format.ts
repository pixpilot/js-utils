function getMinorUnitDivisor(currency: string): number {
  const { minimumFractionDigits = 0 } = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).resolvedOptions();

  return 10 ** minimumFractionDigits;
}

export function formatMoney(amountMinorUnits: number, currency = 'usd'): string {
  const divisor = getMinorUnitDivisor(currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountMinorUnits / divisor);
}
