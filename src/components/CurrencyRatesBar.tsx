'use client';

import React from 'react';
import { ExchangeRates } from '@/types';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface CurrencyRatesBarProps {
  rates: ExchangeRates;
  onRefreshRates: () => void;
  isRefreshing?: boolean;
}

export const CurrencyRatesBar: React.FC<CurrencyRatesBarProps> = ({
  rates,
  onRefreshRates,
  isRefreshing,
}) => {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 font-medium text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Piyasa Kurları:</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <strong className="text-emerald-400">USD:</strong> ₺{rates.USD.toFixed(2)}
          </span>
          <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <strong className="text-blue-400">EUR:</strong> ₺{rates.EUR.toFixed(2)}
          </span>
          <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <strong className="text-amber-400">Altın (gr):</strong> ₺{rates.GAU.toFixed(0)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500 hidden sm:inline">
          Son Güncelleme: {new Date(rates.updated_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <button
          onClick={onRefreshRates}
          disabled={isRefreshing}
          title="Kurları Güncelle"
          className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
