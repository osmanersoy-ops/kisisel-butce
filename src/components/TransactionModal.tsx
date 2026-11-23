'use client';

import React, { useState } from 'react';
import { Account, Currency, Transaction, TransactionType } from '@/types';
import { CURRENCY_NAMES } from '@/lib/currencies';
import { INITIAL_CATEGORIES } from '@/lib/mockData';
import { ArrowRightLeft, MinusCircle, PlusCircle, X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSave: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [category, setCategory] = useState<string>('Market & Gıda');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Lütfen geçerli bir tutar girin.');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      currency,
      account_id: accountId,
      to_account_id: type === 'transfer' ? toAccountId : undefined,
      category: type === 'transfer' ? 'Hesaplar Arası Transfer' : category,
      description: description.trim() || (type === 'transfer' ? 'Transfer' : category),
      date,
    });

    // Reset & Close
    setAmount('');
    setDescription('');
    onClose();
  };

  const filteredCategories = INITIAL_CATEGORIES.filter((c) =>
    type === 'expense' ? c.type === 'expense' : c.type === 'income'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Yeni İşlem Kaydı</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Market & Gıda');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Gider</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Maaş & Sabit Gelir');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Gelir</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'transfer'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Tutar
              </label>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-lg font-bold text-white placeholder-slate-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Birim
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-3 text-sm text-white outline-none transition"
              >
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GAU">Altın (gr)</option>
              </select>
            </div>
          </div>

          {/* Account Selection */}
          {type !== 'transfer' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Hesap
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Kaynak Hesap
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Hedef Hesap
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {accounts
                    .filter((acc) => acc.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Category (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Tarih
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <input
                type="text"
                placeholder="Örn: Migros, Fatura ödemesi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-[0.99]"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
