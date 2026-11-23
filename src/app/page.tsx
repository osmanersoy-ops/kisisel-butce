'use client';

import React, { useEffect, useState } from 'react';
import { Account, ExchangeRates, RecurringPayment, Transaction } from '@/types';
import { 
  calculateNextDueDate, 
  exportDataAsJSON, 
  loadInitialState, 
  saveLocalState 
} from '@/lib/storage';
import { DEFAULT_RATES, fetchLiveRates } from '@/lib/currencies';
import { isSupabaseConfigured } from '@/lib/supabase/client';

import { Navbar } from '@/components/Navbar';
import { NavTab, Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { CurrencyRatesBar } from '@/components/CurrencyRatesBar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { TransactionList } from '@/components/TransactionList';
import { AccountsView } from '@/components/AccountsView';
import { RecurringPaymentsView } from '@/components/RecurringPaymentsView';
import { TransactionModal } from '@/components/TransactionModal';
import { CloudSetupModal } from '@/components/CloudSetupModal';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  
  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurring, setRecurring] = useState<RecurringPayment[]>([]);
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Data Load
  useEffect(() => {
    setIsClient(true);
    loadInitialState().then((data) => {
      setAccounts(data.accounts);
      setTransactions(data.transactions);
      setRecurring(data.recurring);
      setRates(data.rates);
    });

    // Check for updated rates on mount
    fetchLiveRates().then((liveRates) => {
      setRates(liveRates);
      saveLocalState({ rates: liveRates });
    });
  }, []);

  // Save changes when state updates
  useEffect(() => {
    if (!isClient) return;
    saveLocalState({
      accounts,
      transactions,
      recurring,
      rates,
    });
  }, [accounts, transactions, recurring, rates, isClient]);

  // Handle Add Transaction
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'created_at'>
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (newTx.type === 'expense' && acc.id === newTx.account_id) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'income' && acc.id === newTx.account_id) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.account_id) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.to_account_id) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    showToast('İşlem başarıyla kaydedildi.');
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Revert account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (target.type === 'expense' && acc.id === target.account_id) {
          return { ...acc, balance: acc.balance + target.amount };
        }
        if (target.type === 'income' && acc.id === target.account_id) {
          return { ...acc, balance: acc.balance - target.amount };
        }
        if (target.type === 'transfer') {
          if (acc.id === target.account_id) {
            return { ...acc, balance: acc.balance + target.amount };
          }
          if (acc.id === target.to_account_id) {
            return { ...acc, balance: acc.balance - target.amount };
          }
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('İşlem silindi ve bakiye geri yüklendi.');
  };

  // Handle Add Account
  const handleAddAccount = (accData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accData,
      id: 'acc-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAccount]);
    showToast(`${newAccount.name} hesabı eklendi.`);
  };

  // Handle Delete Account
  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Hesap silindi.');
  };

  // Handle Update Account Balance
  const handleUpdateBalance = (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, balance: newBalance } : a))
    );
    showToast('Bakiye güncellendi.');
  };

  // Handle Add Recurring Payment
  const handleAddRecurring = (recData: Omit<RecurringPayment, 'id'>) => {
    const newRec: RecurringPayment = {
      ...recData,
      id: 'rec-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setRecurring((prev) => [...prev, newRec]);
    showToast(`${newRec.title} düzenli ödemesi eklendi.`);
  };

  // Handle Delete Recurring
  const handleDeleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
    showToast('Düzenli ödeme silindi.');
  };

  // Handle Toggle Recurring Active Status
  const handleToggleRecurringActive = (id: string) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  // Handle "Pay Recurring Payment" (Smart one-click payment)
  const handlePayRecurring = (rec: RecurringPayment) => {
    // 1. Create transaction
    const newTx: Transaction = {
      id: 'tx-rec-' + Date.now(),
      type: 'expense',
      amount: rec.amount,
      currency: rec.currency,
      account_id: rec.account_id,
      category: rec.category,
      description: `${rec.title} Ödemesi`,
      date: new Date().toISOString().split('T')[0],
      is_recurring: true,
      recurring_payment_id: rec.id,
      created_at: new Date().toISOString(),
    };

    // 2. Advance recurring due date
    const nextDate = calculateNextDueDate(rec.next_due_date, rec.frequency);
    setRecurring((prev) =>
      prev.map((r) =>
        r.id === rec.id
          ? {
              ...r,
              last_paid_date: new Date().toISOString().split('T')[0],
              next_due_date: nextDate,
            }
          : r
      )
    );

    // 3. Deduct from account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === rec.account_id
          ? { ...acc, balance: acc.balance - rec.amount }
          : acc
      )
    );

    // 4. Save transaction
    setTransactions((prev) => [newTx, ...prev]);

    showToast(
      `✓ "${rec.title}" ödendi olarak işlendi. Yeni vade: ${nextDate}`
    );
  };

  // Refresh Exchange Rates
  const handleRefreshRates = async () => {
    setIsRefreshingRates(true);
    try {
      const live = await fetchLiveRates();
      setRates(live);
      showToast('Döviz kurları güncellendi.');
    } catch {
      showToast('Kurlar güncellenirken hata oluştu.');
    } finally {
      setIsRefreshingRates(false);
    }
  };

  // Count pending recurring payments within 7 days
  const pendingRecurringCount = recurring.filter((r) => {
    if (!r.is_active) return false;
    const due = new Date(r.next_due_date).getTime();
    const now = new Date().getTime();
    return due - now <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (!isClient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Bütçem yükleniyor...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-indigo-400/40 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Ticker Bar */}
      <CurrencyRatesBar
        rates={rates}
        onRefreshRates={handleRefreshRates}
        isRefreshing={isRefreshingRates}
      />

      {/* Top Navbar */}
      <Navbar
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenCloudSetup={() => setIsCloudModalOpen(true)}
        onExportData={() =>
          exportDataAsJSON({ accounts, transactions, recurring, rates })
        }
        isCloudConnected={isSupabaseConfigured}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'cloud') {
              setIsCloudModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          pendingRecurringCount={pendingRecurringCount}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <DashboardOverview
              accounts={accounts}
              transactions={transactions}
              recurring={recurring}
              rates={rates}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onPayRecurring={handlePayRecurring}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              accounts={accounts}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
              onUpdateBalance={handleUpdateBalance}
            />
          )}

          {currentTab === 'recurring' && (
            <RecurringPaymentsView
              recurring={recurring}
              accounts={accounts}
              onAddRecurring={handleAddRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onToggleActive={handleToggleRecurringActive}
              onPayRecurring={handlePayRecurring}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation Dock */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        pendingRecurringCount={pendingRecurringCount}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        accounts={accounts}
        onSave={handleSaveTransaction}
      />

      <CloudSetupModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        isCloudConnected={isSupabaseConfigured}
      />
    </div>
  );
}
