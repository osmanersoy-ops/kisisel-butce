'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  WalletCards, 
  CalendarClock, 
  CloudCog, 
  ShieldCheck 
} from 'lucide-react';

export type NavTab = 'overview' | 'transactions' | 'accounts' | 'recurring' | 'cloud';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRecurringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingRecurringCount,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Gelir & Giderler', icon: ReceiptText },
    { id: 'accounts' as NavTab, label: 'Hesaplarım & Varlıklar', icon: WalletCards },
    { 
      id: 'recurring' as NavTab, 
      label: 'Düzenli Ödemeler', 
      icon: CalendarClock,
      badge: pendingRecurringCount > 0 ? pendingRecurringCount : undefined,
    },
    { id: 'cloud' as NavTab, label: 'Bulut Kurulumu', icon: CloudCog },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
          Menü
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Kişisel & Güvenli</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Verileriniz yalnızca sizin hesabınıza özeldir. Hiçbir 3. taraf erişemez.
        </p>
      </div>
    </aside>
  );
};
