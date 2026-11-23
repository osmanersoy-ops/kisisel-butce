'use client';

import React, { useState } from 'react';
import { Account, AccountType, Currency } from '@/types';
import { formatMoney } from '@/lib/currencies';
import { CreditCard, Landmark, Plus, Coins, Wallet, Trash2 } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateBalance: (id: string, newBalance: number) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onAddAccount,
  onDeleteAccount,
  onUpdateBalance,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#4f46e5');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddAccount({
      name: name.trim(),
      type,
      currency,
      balance: parseFloat(balance || '0'),
      color,
    });

    setName('');
    setBalance('');
    setIsAddModalOpen(false);
  };

  const getAccountIcon = (t: AccountType) => {
    switch (t) {
      case 'bank':
        return <Landmark className="w-5 h-5 text-indigo-400" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-rose-400" />;
      case 'investment':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'cash':
      default:
        return <Wallet className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Hesaplarım & Varlıklarım</h2>
          <p className="text-xs text-slate-400">
            Nakit, banka hesapları, kredi kartları, döviz ve altın varlıklarınız
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Hesap Ekle</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800"
                >
                  {getAccountIcon(acc.type)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{acc.name}</h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {acc.type === 'bank' && 'Banka Vadesiz'}
                    {acc.type === 'credit_card' && 'Kredi Kartı'}
                    {acc.type === 'cash' && 'Nakit Cüzdan'}
                    {acc.type === 'investment' && 'Yatırım / Emtia'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm(`${acc.name} hesabını silmek istediğinizden emin misiniz?`)) {
                    onDeleteAccount(acc.id);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                title="Hesabı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Mevcut Bakiye</div>
              <div
                className={`text-2xl font-bold tracking-tight ${
                  acc.balance < 0 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {formatMoney(acc.balance, acc.currency)}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Para Birimi: <strong className="text-slate-200">{acc.currency}</strong></span>
              <button
                onClick={() => {
                  const val = prompt(`${acc.name} için yeni bakiye girin:`, acc.balance.toString());
                  if (val !== null) {
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed)) onUpdateBalance(acc.id, parsed);
                  }
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Bakiyeyi Güncelle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Yeni Hesap Oluştur</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hesap Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Garanti Vadesiz, Cüzdan..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hesap Türü</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="bank">Banka Hesabı</option>
                    <option value="credit_card">Kredi Kartı</option>
                    <option value="cash">Nakit Cüzdan</option>
                    <option value="investment">Yatırım / Altın / Döviz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Para Birimi</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GAU">Altın (gr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Başlangıç Bakiyesi</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
