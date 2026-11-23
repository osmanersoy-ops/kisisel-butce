'use client';

import React, { useState } from 'react';
import { Account, Currency, Transaction } from '@/types';
import { formatMoney } from '@/lib/currencies';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Filter, Search, Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  onOpenNewTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchAccount = filterAccount === 'all' || t.account_id === filterAccount;
    return matchSearch && matchType && matchAccount;
  });

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || 'Bilinmeyen Hesap';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İşlem veya kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
          >
            <option value="all">Tüm Türler</option>
            <option value="expense">Yalnızca Giderler</option>
            <option value="income">Yalnızca Gelirler</option>
            <option value="transfer">Yalnızca Transferler</option>
          </select>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
          >
            <option value="all">Tüm Hesaplar</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Arama kriterlerinize uygun işlem kaydı bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {filtered.map((t) => {
              const isExpense = t.type === 'expense';
              const isIncome = t.type === 'income';

              return (
                <div
                  key={t.id}
                  className="p-4 hover:bg-slate-800/30 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isExpense
                          ? 'bg-rose-500/10 text-rose-400'
                          : isIncome
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {isExpense ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowRightLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {t.description || t.category}
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                          {t.category}
                        </span>
                        <span>•</span>
                        <span>{getAccountName(t.account_id)}</span>
                        <span>•</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div
                      className={`text-sm sm:text-base font-bold ${
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

                    <button
                      onClick={() => {
                        if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
                          onDeleteTransaction(t.id);
                        }
                      }}
                      title="İşlemi Sil"
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
