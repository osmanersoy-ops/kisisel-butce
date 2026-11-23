'use client';

import React from 'react';
import { Account, ExchangeRates, RecurringPayment, Transaction } from '@/types';
import { convertToTRY, formatMoney } from '@/lib/currencies';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  CalendarClock, 
  Check, 
  CreditCard, 
  PieChart, 
  TrendingUp, 
  Wallet,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  accounts: Account[];
  transactions: Transaction[];
  recurring: RecurringPayment[];
  rates: ExchangeRates;
  onOpenNewTransaction: () => void;
  onPayRecurring: (payment: RecurringPayment) => void;
  onNavigateTab: (tab: 'transactions' | 'accounts' | 'recurring') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  accounts,
  transactions,
  recurring,
  rates,
  onOpenNewTransaction,
  onPayRecurring,
  onNavigateTab,
}) => {
  // 1. Calculate Total Net Worth (in TRY)
  const totalNetWorthTRY = accounts.reduce((acc, account) => {
    return acc + convertToTRY(account.balance, account.currency, rates);
  }, 0);

  // 2. Current Month Income & Expenses
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // YYYY-MM
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthPrefix));

  const currentMonthIncomeTRY = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + convertToTRY(t.amount, t.currency, rates), 0);

  const currentMonthExpenseTRY = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + convertToTRY(t.amount, t.currency, rates), 0);

  const netCashFlowTRY = currentMonthIncomeTRY - currentMonthExpenseTRY;

  // 3. Upcoming Recurring Payments (Next 14 days or overdue)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeRecurring = recurring.filter((r) => r.is_active);
  const upcomingPayments = activeRecurring
    .map((r) => {
      const dueDate = new Date(r.next_due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...r, diffDays };
    })
    .filter((r) => r.diffDays <= 14) // Next 14 days or past due
    .sort((a, b) => a.diffDays - b.diffDays);

  // 4. Category breakdown for expenses
  const categoryMap: Record<string, number> = {};
  currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const amountTRY = convertToTRY(t.amount, t.currency, rates);
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amountTRY;
    });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, total]) => ({
      name,
      total,
      percentage: currentMonthExpenseTRY > 0 ? (total / currentMonthExpenseTRY) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Toplam Net Varlık</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatMoney(totalNetWorthTRY, 'TRY')}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>≈ ${(totalNetWorthTRY / rates.USD).toFixed(0)}</span>
            <span>•</span>
            <span>≈ €{(totalNetWorthTRY / rates.EUR).toFixed(0)}</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bu Ay Gelir</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {formatMoney(currentMonthIncomeTRY, 'TRY')}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {currentMonthTransactions.filter((t) => t.type === 'income').length} gelir kaydı
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bu Ay Gider</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {formatMoney(currentMonthExpenseTRY, 'TRY')}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {currentMonthTransactions.filter((t) => t.type === 'expense').length} harcama kaydı
          </div>
        </div>

        {/* Net Flow */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Nakit Akışı</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              netCashFlowTRY >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${
            netCashFlowTRY >= 0 ? 'text-cyan-400' : 'text-amber-400'
          }`}>
            {formatMoney(netCashFlowTRY, 'TRY')}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {netCashFlowTRY >= 0 ? 'Tasarruf durumunda' : 'Giderler geliri aştı'}
          </div>
        </div>
      </div>

      {/* Upcoming Payments Alert Section */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900 border border-indigo-900/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Yaklaşan Düzenli Ödemeler</h3>
              <p className="text-xs text-slate-400">Önümüzdeki 14 gün içindeki ödeme planınız</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('recurring')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            Tümünü Gör ({activeRecurring.length})
          </button>
        </div>

        {upcomingPayments.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-400">
            Yakın zamanda vadesi gelen herhangi bir düzenli ödemeniz bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingPayments.map((p) => {
              const isOverdue = p.diffDays < 0;
              const isToday = p.diffDays === 0;

              return (
                <div
                  key={p.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white truncate">{p.title}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      {formatMoney(p.amount, p.currency)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {isOverdue ? (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <AlertCircle className="w-3 h-3" /> {Math.abs(p.diffDays)} gün gecikti
                        </span>
                      ) : isToday ? (
                        <span className="text-amber-400 font-semibold">Bugün ödenecek</span>
                      ) : (
                        <span className="text-slate-400">{p.diffDays} gün kaldı ({p.next_due_date})</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onPayRecurring(p)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition active:scale-95 shrink-0"
                    title="Ödendi olarak işaretle ve gidere işle"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Öde</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Accounts Summary & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Accounts Overview */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Hesaplarım</span>
            </h3>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Yönet
            </button>
          </div>

          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: acc.color || '#6366f1' }}
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 capitalize">{acc.type}</div>
                  </div>
                </div>
                <div className={`text-xs font-bold ${acc.balance < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                  {formatMoney(acc.balance, acc.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right: Category Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Aylık Harcama Dağılımı</span>
            </h3>
            <span className="text-xs text-slate-400">
              Toplam: {formatMoney(currentMonthExpenseTRY, 'TRY')}
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Bu ay henüz harcama kaydı bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat.name}</span>
                    <span className="text-slate-400">
                      {formatMoney(cat.total, 'TRY')} (%{cat.percentage.toFixed(0)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Son İşlemler</h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Tüm Hareketler ({transactions.length})
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {transactions.slice(0, 5).map((t) => {
            const isExpense = t.type === 'expense';
            const isIncome = t.type === 'income';
            return (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpense
                        ? 'bg-rose-500/10 text-rose-400'
                        : isIncome
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {t.description || t.category}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{t.category}</span>
                      <span>•</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold shrink-0 ${
                    isExpense
                      ? 'text-rose-400'
                      : isIncome
                      ? 'text-emerald-400'
                      : 'text-blue-400'
                  }`}
                >
                  {isExpense ? '-' : isIncome ? '+' : ''}
                  {formatMoney(t.amount, t.currency)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
