import { Currency, ExchangeRates } from '@/types';

export const DEFAULT_RATES: ExchangeRates = {
  USD: 36.25,
  EUR: 38.10,
  GAU: 3180.00,
  updated_at: new Date().toISOString(),
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GAU: 'gr Altın',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  TRY: 'Türk Lirası (₺)',
  USD: 'Amerikan Doları ($)',
  EUR: 'Euro (€)',
  GAU: 'Gram Altın (gr)',
};

/**
 * Format currency amount with symbol and locale
 */
export function formatMoney(amount: number, currency: Currency = 'TRY'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: currency === 'GAU' ? 3 : 2,
    maximumFractionDigits: currency === 'GAU' ? 3 : 2,
  }).format(absAmount);

  const sign = isNegative ? '-' : '';
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === 'GAU') {
    return `${sign}${formatted} ${symbol}`;
  }
  return `${sign}${symbol} ${formatted}`;
}

/**
 * Convert any currency to TRY based on current rates
 */
export function convertToTRY(amount: number, currency: Currency, rates: ExchangeRates): number {
  switch (currency) {
    case 'TRY':
      return amount;
    case 'USD':
      return amount * (rates.USD || DEFAULT_RATES.USD);
    case 'EUR':
      return amount * (rates.EUR || DEFAULT_RATES.EUR);
    case 'GAU':
      return amount * (rates.GAU || DEFAULT_RATES.GAU);
    default:
      return amount;
  }
}

/**
 * Fetch live rates with fallback
 */
export async function fetchLiveRates(): Promise<ExchangeRates> {
  try {
    // Free open exchange rates for USD & EUR to TRY
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY,EUR', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const usdToTry = data.rates?.TRY || DEFAULT_RATES.USD;
      const usdToEur = data.rates?.EUR || 0.95;
      const eurToTry = usdToTry / usdToEur;

      return {
        USD: Number(usdToTry.toFixed(2)),
        EUR: Number(eurToTry.toFixed(2)),
        GAU: Number((usdToTry * 87.5).toFixed(2)), // Approx gram gold calculation based on ounce/USD
        updated_at: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn('Live rates fetch failed, using stored/default rates', error);
  }
  return DEFAULT_RATES;
}
