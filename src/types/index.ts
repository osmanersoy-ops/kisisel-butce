export type Currency = 'TRY' | 'USD' | 'EUR' | 'GAU';

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  color?: string;
  is_archived?: boolean;
  created_at?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  account_id: string;
  to_account_id?: string; // if transfer
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  created_at?: string;
  is_recurring?: boolean;
  recurring_payment_id?: string;
}

export type RecurringFrequency = 'monthly' | 'yearly' | 'weekly';

export interface RecurringPayment {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: string;
  account_id: string;
  frequency: RecurringFrequency;
  due_day: number; // 1-31
  next_due_date: string; // YYYY-MM-DD
  is_active: boolean;
  last_paid_date?: string;
  notes?: string;
  created_at?: string;
}

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GAU: number; // Gram Altın (TRY)
  updated_at: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  iconName: string;
  color: string;
}
