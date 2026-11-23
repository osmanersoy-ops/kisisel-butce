import { Account, ExchangeRates, RecurringPayment, Transaction } from '@/types';
import { DEFAULT_RATES } from './currencies';
import { INITIAL_ACCOUNTS, INITIAL_RECURRING, INITIAL_TRANSACTIONS } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase/client';

const STORAGE_KEYS = {
  ACCOUNTS: 'butcem_accounts_v1',
  TRANSACTIONS: 'butcem_transactions_v1',
  RECURRING: 'butcem_recurring_v1',
  RATES: 'butcem_rates_v1',
  SETTINGS: 'butcem_settings_v1',
};

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  recurring: RecurringPayment[];
  rates: ExchangeRates;
}

/**
 * Load initial state from LocalStorage or Supabase
 */
export async function loadInitialState(): Promise<AppState> {
  // 1. Try Supabase if configured and logged in
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const [accRes, txRes, recRes] = await Promise.all([
          supabase.from('accounts').select('*').order('created_at', { ascending: true }),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('recurring_payments').select('*').order('next_due_date', { ascending: true }),
        ]);

        if (!accRes.error && !txRes.error && !recRes.error) {
          return {
            accounts: (accRes.data as Account[]) || [],
            transactions: (txRes.data as Transaction[]) || [],
            recurring: (recRes.data as RecurringPayment[]) || [],
            rates: loadLocalRates(),
          };
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }

  // 2. LocalStorage fallback
  if (typeof window === 'undefined') {
    return {
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      recurring: INITIAL_RECURRING,
      rates: DEFAULT_RATES,
    };
  }

  const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const savedRecurring = localStorage.getItem(STORAGE_KEYS.RECURRING);
  const savedRates = localStorage.getItem(STORAGE_KEYS.RATES);

  return {
    accounts: savedAccounts ? JSON.parse(savedAccounts) : INITIAL_ACCOUNTS,
    transactions: savedTransactions ? JSON.parse(savedTransactions) : INITIAL_TRANSACTIONS,
    recurring: savedRecurring ? JSON.parse(savedRecurring) : INITIAL_RECURRING,
    rates: savedRates ? JSON.parse(savedRates) : DEFAULT_RATES,
  };
}

export function saveLocalState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;

  if (state.accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(state.accounts));
  }
  if (state.transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
  }
  if (state.recurring) {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(state.recurring));
  }
  if (state.rates) {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(state.rates));
  }
}

function loadLocalRates(): ExchangeRates {
  if (typeof window === 'undefined') return DEFAULT_RATES;
  const saved = localStorage.getItem(STORAGE_KEYS.RATES);
  return saved ? JSON.parse(saved) : DEFAULT_RATES;
}

/**
 * Advance due date by month
 */
export function calculateNextDueDate(currentDateStr: string, frequency: 'monthly' | 'yearly' | 'weekly'): string {
  const date = new Date(currentDateStr);
  if (isNaN(date.getTime())) return currentDateStr;

  if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Backup state to JSON file download
 */
export function exportDataAsJSON(state: AppState) {
  const exportBlob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(exportBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `butcem-yedek-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
