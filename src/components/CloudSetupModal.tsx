'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Github, 
  Key, 
  Lock, 
  Server, 
  ShieldCheck, 
  Terminal, 
  UploadCloud, 
  X 
} from 'lucide-react';

interface CloudSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCloudConnected: boolean;
}

export const CloudSetupModal: React.FC<CloudSetupModalProps> = ({
  isOpen,
  onClose,
  isCloudConnected,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchemaSnippet = `-- Supabase SQL Editor'a yapıştırılacak kod:
-- Tablolar otomatik oluşturulur ve Row Level Security (RLS) aktif edilir.
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    color TEXT DEFAULT '#4f46e5',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kişiye Özel Erişim" ON public.accounts FOR ALL USING (auth.uid() = user_id);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Bulut, GitHub & Vercel Kurulum Rehberi
              </h2>
              <p className="text-xs text-slate-400">
                Verilerinizin tamamen şifreli ve sadece sizin erişebileceğiniz mimarisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Status Alert */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              isCloudConnected
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 shrink-0" />
              <div>
                <strong className="block font-semibold">
                  {isCloudConnected ? 'Supabase Bulut Veritabanı Aktif' : 'Şu Anda Yerel Modda Çalışıyor'}
                </strong>
                <span className="text-[11px] opacity-90">
                  {isCloudConnected
                    ? 'Tüm verileriniz Supabase PostgreSQL üzerinde RLS şifrelemesiyle saklanıyor.'
                    : 'Verileriniz şu anda tarayıcınızda güvenle saklanmaktadır. Aşağıdaki 3 adımı uygulayarak buluta bağlayabilirsiniz.'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Supabase */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">1</span>
                Supabase (Ücretsiz Bulut PostgreSQL & Giriş Sistemi)
              </span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400">
              1. Supabase&apos;de ücretsiz hesap açıp <strong>&quot;Yeni Proje&quot;</strong> oluşturun.<br />
              2. <strong>SQL Editor</strong> sekmesini açın, projedeki <code className="text-indigo-300">src/lib/supabase/schema.sql</code> dosyasının içeriğini yapıştırıp <strong>Run</strong>&apos;a basın.<br />
              3. <strong>Project Settings &gt; API</strong> sekmesinden <code>URL</code> ve <code>anon public key</code> değerlerini alın.
            </p>
          </div>

          {/* Step 2: GitHub Repository */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">2</span>
                GitHub (Gizli / Private Depo)
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                github.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400">
              Proje kodunuzu GitHub&apos;da <strong>Private (Gizli)</strong> bir depoya gönderdiğinizde, kaynak kodunuza sizden başka kimse erişemez.
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
              <code>git remote add origin https://github.com/KULLANICI_ADINIZ/butcem.git</code>
              <button
                onClick={() => copyToClipboard('git remote add origin https://github.com/.../butcem.git && git push -u origin main', 'git')}
                className="p-1 hover:text-white"
              >
                {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 3: Vercel Deployment */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">3</span>
                Vercel (Ücretsiz Bulut Canlı Yayın & Mobil Erişim)
              </span>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                vercel.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400">
              1. Vercel&apos;e GitHub hesabınızla giriş yapın.<br />
              2. <strong>&quot;Add New Project&quot;</strong> &gt; GitHub&apos;daki <strong>butcem</strong> reposunu seçin.<br />
              3. <strong>Environment Variables (Ortam Değişkenleri)</strong> kısmına şunları ekleyin:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL=https://projeniz.supabase.co</div>
              <div className="text-indigo-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
            </div>
            <p className="text-slate-400">
              4. <strong>Deploy</strong> butonuna tıklayın. 1 dakika içinde size özel <code className="text-white">https://butcem-xxxx.vercel.app</code> şeklinde şifreli HTTPS bağlantınız hazır olacaktır!
            </p>
          </div>

          {/* Mobile PWA Installation */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">4</span>
              Telefonda Mobil Uygulama Olarak Kullanma (PWA)
            </span>
            <p className="text-slate-400 leading-relaxed">
              Vercel linkinize telefonunuzun Safari (iOS) veya Chrome (Android) tarayıcısından girin.<br />
              <strong>Paylaş</strong> veya menü butonuna dokunup <strong>&quot;Ana Ekrana Ekle&quot;</strong> deyin. Telefonunuzun ana ekranında yerel bir bankacılık uygulaması gibi açılacaktır.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/95 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
