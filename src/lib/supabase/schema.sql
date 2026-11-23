-- ==============================================================
-- KİŞİSEL BÜTÇE YÖNETİM SİSTEMİ - SUPABASE VERİTABANI ŞEMASI
-- ==============================================================
-- Bu SQL kodunu Supabase Dashboard > SQL Editor sekmesine yapıştırıp
-- "RUN" butonuna basmanız yeterlidir. Tüm tablolar ve güvenlik kuralları
-- (Row Level Security - RLS) otomatik olarak kurulacaktır.
-- ==============================================================

-- 1. HESAPLAR TABLOSU (Nakit, Banka, Kredi Kartı, Döviz/Altın)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'credit_card', 'investment')),
    currency TEXT NOT NULL CHECK (currency IN ('TRY', 'USD', 'EUR', 'GAU')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    color TEXT DEFAULT '#4f46e5',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. GELİR / GİDER VE TRANSFER İŞLEMLERİ TABLOSU
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('TRY', 'USD', 'EUR', 'GAU')),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_payment_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. DÜZENLİ ÖDEMELER TABLOSU (Kira, Fatura, Abonelik, Kredi)
CREATE TABLE IF NOT EXISTS public.recurring_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('TRY', 'USD', 'EUR', 'GAU')),
    category TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly', 'weekly')),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    next_due_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_paid_date DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================
-- GÜVENLİK (ROW LEVEL SECURITY - RLS)
-- Yalnızca oturum açan kullanıcı SADECE KENDİ verilerini görebilir ve düzenleyebilir.
-- Dışarıdan veya başka bir kullanıcı tarafından erişilmesi imkansızdır.
-- ==============================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

-- Accounts RLS Politikaları
CREATE POLICY "Kullanıcı sadece kendi hesaplarını görebilir" 
ON public.accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi hesaplarını ekleyebilir" 
ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi hesaplarını güncelleyebilir" 
ON public.accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi hesaplarını silebilir" 
ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Transactions RLS Politikaları
CREATE POLICY "Kullanıcı sadece kendi işlemlerini görebilir" 
ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi işlemlerini ekleyebilir" 
ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi işlemlerini güncelleyebilir" 
ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi işlemlerini silebilir" 
ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Recurring Payments RLS Politikaları
CREATE POLICY "Kullanıcı sadece kendi düzenli ödemelerini görebilir" 
ON public.recurring_payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi düzenli ödemelerini ekleyebilir" 
ON public.recurring_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi düzenli ödemelerini güncelleyebilir" 
ON public.recurring_payments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi düzenli ödemelerini silebilir" 
ON public.recurring_payments FOR DELETE USING (auth.uid() = user_id);

-- İndeksler (Hızlı listeleme ve sorgular için)
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON public.recurring_payments(user_id);
