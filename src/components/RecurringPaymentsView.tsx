'use client';

import React, { useState } from 'react';
import { Account, Currency, RecurringFrequency, RecurringPayment } from '@/types';
import { formatMoney } from '@/lib/currencies';
import { INITIAL_CATEGORIES } from '@/lib/mockData';
import { 
  AlertCircle, 
  Calendar, 
  CalendarClock, 
  Check, 
  Clock, 
  Pause, 
  Play, 
  Plus, 
  Trash2 
} from 'lucide-react';

interface RecurringPaymentsViewProps {
  recurring: RecurringPayment[];
  accounts: Account[];
  onAddRecurring: (rec: Omit<RecurringPayment, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleActive: (id: string) => void;
  onPayRecurring: (payment: RecurringPayment) => void;
}

export const RecurringPaymentsView: React.FC<RecurringPaymentsViewProps> = ({
  recurring,
  accounts,
  onAddRecurring,
  onDeleteRecurring,
  onToggleActive,
  onPayRecurring,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [category, setCategory] = useState('Faturalar & Aidat');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [dueDay, setDueDay] = useState('1');
  const [notes, setNotes] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    // Calculate next due date
    const day = parseInt(dueDay, 10);
    const now = new Date();
    let nextDate = new Date(now.getFullYear(), now.getMonth(), day);
    if (nextDate.getTime() < now.getTime()) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    onAddRecurring({
      title: title.trim(),
      amount: numAmount,
      currency,
      category,
      account_id: accountId,
      frequency,
      due_day: day,
      next_due_date: nextDate.toISOString().split('T')[0],
      is_active: true,
      notes: notes.trim(),
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name || 'Bilinmeyen Hesap';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Düzenli Ödemeler & Abonelikler</h2>
          <p className="text-xs text-slate-400">
            Kira, aidat, fatura, kredi ve dijital aboneliklerinizi tek ekranda yönetin
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Düzenli Ödeme Ekle</span>
        </button>
      </div>

      {/* Grid of Recurring Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurring.map((rec) => {
          const dueDate = new Date(rec.next_due_date);
          dueDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays < 0;
          const isToday = diffDays === 0;

          return (
            <div
              key={rec.id}
              className={`border rounded-2xl p-5 space-y-4 transition ${
                rec.is_active
                  ? isOverdue
                    ? 'bg-rose-950/20 border-rose-900/60'
                    : isToday
                    ? 'bg-amber-950/20 border-amber-900/60'
                    : 'bg-slate-900/60 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                      {rec.category}
                    </span>
                    <span>•</span>
                    <span>Ayın {rec.due_day}. günü</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleActive(rec.id)}
                    title={rec.is_active ? 'Duraklat' : 'Aktifleştir'}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    {rec.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`${rec.title} kaydını silmek istediğinizden emin misiniz?`)) {
                        onDeleteRecurring(rec.id);
                      }
                    }}
                    title="Sil"
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Amount & Status */}
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {formatMoney(rec.amount, rec.currency)}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sonraki Vade: <strong className="text-slate-200">{rec.next_due_date}</strong></span>
                </div>
              </div>

              {/* Remaining badge & Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-xs">
                  {isOverdue ? (
                    <span className="flex items-center gap-1 text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> {Math.abs(diffDays)} gün gecikti
                    </span>
                  ) : isToday ? (
                    <span className="text-amber-400 font-semibold">Bugün ödenecek</span>
                  ) : (
                    <span className="text-slate-400">{diffDays} gün kaldı</span>
                  )}
                </div>

                <button
                  onClick={() => onPayRecurring(rec)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow transition active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Ödendi Yap</span>
                </button>
              </div>

              {rec.notes && (
                <p className="text-[11px] text-slate-500 italic bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                  {rec.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Recurring Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Yeni Düzenli Ödeme</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ödeme Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ev Kirası, Netflix, Elektrik Faturası..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tutar</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {INITIAL_CATEGORIES.filter((c) => c.type === 'expense').map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ödeme Hesabı</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Periyot</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                    <option value="weekly">Haftalık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ödeme Günü (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Not (İsteğe bağlı)</label>
                <input
                  type="text"
                  placeholder="Örn: IBAN no, müşteri no..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
