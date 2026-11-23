# 💰 Bütçem - Kişisel Gelir, Gider ve Düzenli Ödeme Yönetim Sistemi

Masaüstü ve mobil tarayıcılarla uyumlu, çevrimdışı çalışabilen (PWA destekli), çoklu para birimi ve hesap yönetimli, **yalnızca sizin erişebileceğiniz** kişisel bütçe yönetim sistemi.

---

## 🌟 Öne Çıkan Özellikler

1. **Çoklu Hesap ve Para Birimi:**
   - Banka vadesiz hesapları, Nakit cüzdanlar, Kredi kartları ve Yatırımlar (Döviz, Gram Altın).
   - Canlı TCMB / Piyasa döviz kurları (USD, EUR, Gram Altın).
   - Tüm varlıklarınızın toplam konsolide net değerini (Net Worth) anlık hesaplama.

2. **Gelir & Gider Yönetimi:**
   - Tek tıkla hızlı işlem ekleme (Gelir, Gider ve Hesaplar arası transfer).
   - Kategori bazlı filtreleme, arama ve aylık harcama dağılım grafikleri.

3. **Düzenli Ödemeler & Abonelik Takvimi:**
   - Kira, aidat, fatura, kredi taksitleri ve dijital abonelikler (Netflix, Spotify vb.).
   - Vadesi yaklaşan veya geciken ödemeler için akıllı sayaç ("3 gün kaldı", "Gecikti").
   - **Tek Tıkla Ödeme:** "Öde" butonuna basıldığında ilgili hesaptan tutar düşer, gidere işlenir ve vade otomatik olarak bir sonraki aya ötelenir!

4. **Mobil Deneyim (PWA Desteği):**
   - iPhone (Safari) ve Android (Chrome) tarayıcısından *"Ana Ekrana Ekle"* diyerek tıpkı App Store / Play Store'dan indirilmiş gerçek bir mobil uygulama gibi tam ekran kullanabilirsiniz.

5. **Mutlak Gizlilik (Zero-Leakage):**
   - PostgreSQL **Row Level Security (RLS)** kuralları ile verilerinize sizden başka hiç kimse (veritabanı yöneticisi dahi olsa) erişemez.

---

## 🚀 3 Adımda Bulut Kurulumu (GitHub + Supabase + Vercel)

Bu sistem tamamen **ücretsiz bulut kotaları** kullanılarak sıfır maliyetle ömür boyu çalışacak şekilde tasarlanmıştır.

### Adım 1: Supabase Veritabanı Kurulumu (1 Dakika)
1. [supabase.com](https://supabase.com) adresine gidin ve ücretsiz hesabınızla oturum açın.
2. **"New Project"** butonuna tıklayarak projenizi oluşturun (Bölge olarak Frankfurt/Avrupa seçebilirsiniz).
3. Sol menüden **SQL Editor** sekmesine gidin.
4. Bu projedeki [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql) dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **Run** butonuna basın. (Tüm tablolarınız ve RLS güvenlik kurallarınız kurulur).
5. Sol menüden **Project Settings > API** sekmesine gidin. `Project URL` ve `anon public` anahtarınızı bir kenara not edin.

### Adım 2: GitHub Üzerine Gizli (Private) Yükleme
1. [github.com](https://github.com) adresinde **"New Repository"** diyerek yeni bir depo oluşturun (Örn: `butcem`). **Private (Gizli)** seçeneğini işaretleyin.
2. Terminalinizde bu proje klasöründeyken şu komutları çalıştırın:
```bash
git remote add origin https://github.com/KULLANICI_ADINIZ/butcem.git
git branch -M main
git push -u origin main
```

### Adım 3: Vercel ile Canlıya Alma (Mobil & Masaüstü Canlı Linki)
1. [vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın.
2. **"Add New Project"** butonuna tıklayıp GitHub'daki `butcem` deponuzu seçin.
3. **Environment Variables** (Ortam Değişkenleri) bölümünü açın ve Adım 1'de aldığınız bilgileri girin:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://projeniz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
4. **Deploy** butonuna basın. Yaklaşık 45 saniye sonra size özel `https://butcem-xyz.vercel.app` bağlantınız hazır olacaktır!

---

## 📱 Cep Telefonuna Yükleme (iOS & Android)

1. Telefonunuzun tarayıcısından (Safari veya Chrome) Vercel linkinize gidin.
2. **iOS (iPhone):** Safari'de alttaki **Paylaş** simgesine dokunun ve **"Ana Ekrana Ekle"** seçeneğini seçin.
3. **Android:** Chrome'da sağ üstteki **üç nokta** menüsüne dokunun ve **"Uygulamayı Yükle"** veya **"Ana Ekrana Ekle"** seçeneğini seçin.
4. Artık telefonunuzun ana ekranındaki "Bütçem" simgesine dokunarak tam ekran uygulama olarak kullanabilirsiniz.

---

## 💻 Bilgisayarınızda Yerel Olarak Çalıştırma

Geliştirme sunucusunu bilgisayarınızda başlatmak için:

```bash
npm run dev
```

Ardından tarayıcınızdan `http://localhost:3000` adresine gidebilirsiniz.
