'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Plus, 
  WalletCards, 
  CalendarClock 
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewTransaction: () => void;
  pendingRecurringCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  pendingRecurringCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:hidden pb-safe">
      <div className="grid grid-cols-5 items-center px-2 py-1.5">
        <button
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            currentTab === 'overview' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Özet</span>
        </button>

        <button
          onClick={() => onSelectTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            currentTab === 'transactions' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">İşlemler</span>
        </button>

        {/* Floating Center Action Button */}
        <div className="flex justify-center items-center -mt-5">
          <button
            onClick={onOpenNewTransaction}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-95 transition"
            aria-label="Yeni İşlem Ekle"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onSelectTab('accounts')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            currentTab === 'accounts' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <WalletCards className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Hesaplar</span>
        </button>

        <button
          onClick={() => onSelectTab('recurring')}
          className={`relative flex flex-col items-center justify-center py-1 transition ${
            currentTab === 'recurring' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <CalendarClock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Ödemeler</span>
          {pendingRecurringCount > 0 && (
            <span className="absolute top-0.5 right-4 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>
    </nav>
  );
};
