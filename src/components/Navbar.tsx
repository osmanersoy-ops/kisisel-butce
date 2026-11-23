'use client';

import React from 'react';
import { Cloud, Database, Download, Plus, ShieldCheck, Wallet } from 'lucide-react';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onOpenCloudSetup: () => void;
  onExportData: () => void;
  isCloudConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  onOpenCloudSetup,
  onExportData,
  isCloudConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">Bütçem</h1>
            <span className="text-[10px] uppercase font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
              v1.0 Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Kişisel Finans ve Düzenli Ödeme Takibi</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cloud Status Pill */}
        <button
          onClick={onOpenCloudSetup}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
            isCloudConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title="Bulut ve Veritabanı Kurulumu"
        >
          {isCloudConnected ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Supabase Bağlı</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Yerel Mod (Bulut Kur)</span>
            </>
          )}
        </button>

        {/* Backup button */}
        <button
          onClick={onExportData}
          title="Verileri JSON Olarak İndir (Yedek Al)"
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Primary New Transaction Button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm px-3.5 py-2 rounded-lg shadow-md shadow-indigo-600/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">İşlem Ekle</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>
    </header>
  );
};
