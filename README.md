# 🏰 Atrium 3D — 3D Spatial Mind Map

Atrium 3D, notlarınızı ve fikirlerinizi üç boyutlu bir evin odalarına, duvarlarına ve eşyalarına yerleştirerek düzenlemenizi sağlayan, **mekânsal hafıza (spatial memory)** odaklı yenilikçi bir 3D zihin haritası uygulamasıdır.

Klasik iki boyutlu zihin haritalarının aksine Atrium 3D, bilgiyi fiziksel bir mimari alana yerleştirir. Fikirlerinizi odalara, duvarlara veya mobilyalara yerleştirerek zihninizde güçlü mekânsal bağlar kurabilir, sanal ortamda yürüyerek bilgilerinizi çok daha kalıcı bir şekilde hatırlayabilirsiniz.

> [!NOTE]
> Projenin GitHub depo ismi `asujai/saray` (eski adı olan Saray nedeniyle) olarak kalmakla birlikte, resmi uygulama adı ve marka kimliği **Atrium 3D** olarak güncellenmiştir.

---

## 🔗 Live Demo URL
**Canlı Demo:** [https://atrium3d.netlify.app/](https://atrium3d.netlify.app/)

---

## 🌟 What I Built / Ne İnşa Ettim
Atrium 3D, bilgileri 2D listeler yerine 3D uzamsal ortamlarda görselleştirerek hatırlamayı kolaylaştıran bir **3D Zihin Sarayı (Mind Palace)** uygulamasıdır. Kullanıcılar:
*   **3D Gezinti ve Kontroller**: Yürüyüş (Walk) ve serbest uçuş (Fly) modları ile 3D oda navigasyonu yapabilirler.
*   **Dinamik Not Panelleri**: Duvarlara tıklayıp sürükleyerek 3D not kartları oluşturabilirler.
*   **Çok Sayfalı Notlar**: Her not içinde sayfalar oluşturup yerel görseller yükleyebilirler.
*   **Etkileşimli Eşyalar & Kitaplıklar**: Sahneye mobilyalar yerleştirebilir, kitaplıklara not bağlı kitaplar ekleyebilirler.
*   **3D Kavramsal Bağlantılar**: Notlar ve nesneler arasında bezier eğrileri çizerek ilişkileri görselleştirebilirler.
*   **Holografik Kontrol Paneli**: Tüm notlarda arama yapıp ilgili nota anında ışınlanabilirler (Teleport).
*   **Çalışma Oturumu (Study Mode)**: Seçtikleri notlar arasında sıralı zihin sarayı turları yapabilirler.

---

## 🛠️ Tech Stack / Teknolojik Altyapı
*   **Frontend Library:** React 19 (Modern hooks ve state yönetimi)
*   **Build Tool:** Vite 8 (Ultra hızlı HMR ve esbuild)
*   **3D Render Engine:** Three.js & `@react-three/fiber` (R3F) & `@react-three/drei`
*   **Styling & Icons:** Custom CSS (Glassmorphism, Neon Hologram UI) & Lucide React
*   **Database:** Local-First Architecture (IndexedDB & LocalStorage)
*   **Linting:** Oxlint (Rust-based ultra-fast linter)

---

## 🤖 TestSprite Hackathon Verification
Bu proje, **TestSprite Hackathon Season 3** kapsamında TestSprite platformu ve CLI araçları ile otomatik olarak doğrulanmıştır.
*   Tüm kritik kullanıcı akışları TestSprite’ın yapay zeka tabanlı test ajanları tarafından canlı Netlify URL'i üzerinden test edilmiştir.
*   Her kod değişikliği sonrasında otomatik doğrulama döngüsü (Verification Loop) çalıştırılmış ve test sonuçları `LOOP.md` dosyasına kaydedilmiştir.

### TestSprite Proje Konfigürasyonu
*   **Project ID:** `d591bb97-f4bd-4700-bc64-28efa2e4cff0`
*   **Type:** Frontend E2E / AI-driven Plan Testing

### LOOP-05 Regression Proof Hazırlığı
*   **Plan dosyası:** `plan-regression-proof.json`
*   **Amaç:** Atrium 3D marka temizliği, `open-atrium-button` geçişi, sıkı `?testMode=true` kapısı ve gerçek debug state kanıtlarını deploy sonrası doğrulamak.
*   **Durum:** Kod ve plan hazırlandı. TestSprite Run ID yalnızca Netlify deploy tamamlanıp plan başarıyla geçtikten sonra buraya yazılacaktır.

---

## 📊 Loop Coverage / Test Kapsamı
TestSprite E2E test planları kapsamında doğrulanan ana senaryolar:
1.  **Scene & HUD Verification:** Canlı URL'in başarıyla açılması, 3D Canvas elementlerinin render edilmesi ve yüzen kontrol panelinin ekranda görünürlüğü.
2.  **Settings & UI Customization:** Ayarlar modalının açılması, dil seçeneklerinin (TR/EN) değiştirilmesi ve arayüz teması (Açık/Koyu) geçişlerinin stabil çalışması.
3.  **Holographic Navigator & Study Mode:** Holografik kontrol panelinin açılması, not arama motorunun çalışması ve Çalışma Odası (Study Mode) sekmelerinin erişilebilirliği.
4.  **Visual Evidence & Real State Verification:** `?testMode=true` ile devreye giren testMode debug status paneli yardımıyla gerçek state değişikliklerinin, not, eşya ve bağlantı ekleme işlemlerinin kararlı şekilde doğrulanması.

---

## 📂 Proje Yapısı

```text
atrium-3d/
├── .testsprite/         # TestSprite konfigürasyonu
├── public/              # Statik varlıklar ve 3D modeller
├── src/
│   ├── assets/          # Uygulama içi görseller ve stiller
│   ├── components/      # Arayüz ve 3D Sahne Bileşenleri
│   │   ├── CrosshairRaycaster.jsx  # Etkileşim ve imleç yönetimi
│   │   ├── MiniMapTracker.jsx      # Mini harita takip bileşeni
│   │   ├── Note3D.jsx              # 3D not paneli ve rendering
│   │   ├── NoteDashboard.jsx       # Not yönetim ve arama paneli
│   │   ├── PlacedItem3D.jsx        # Sahneye yerleştirilen eşyaların kontrolü
│   │   ├── Player.jsx              # Oyuncu hareket ve kamera fizik motoru
│   │   ├── Room.jsx                # Odaların geometrik çizimi ve sınırları
│   │   └── UIOverlay.jsx           # 2D kontrol ve HUD arayüzü
│   ├── utils/
│   │   └── db.js                   # Veritabanı ve yerel depolama yardımcıları
│   ├── App.css
│   ├── App.jsx          # Ana 3D Kanvas kurulumu
│   ├── SarayApp.jsx     # Uygulama durum yönetimi ve ana mantık (Atrium 3D çekirdek motoru)
│   ├── index.css        # Küresel CSS ve tasarım sistemi kuralları
│   └── main.jsx         # React başlangıç noktası
├── index.html           # Giriş HTML şablonu
├── package.json         # Bağımlılıklar ve komutlar
└── vite.config.js       # Vite yapılandırması
```

---

## 🚀 How to Run Locally / Yerel Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak ve geliştirmek için aşağıdaki adımları izleyebilirsiniz:

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın (Localhost:5173):**
   ```bash
   npm run dev
   ```

3. **Üretim Sürümü (Build) Alın:**
   ```bash
   npm run build
   ```

4. **Derlenen Sürümü Önizleyin:**
   ```bash
   npm run preview
   ```

5. **Kod Analizi (Linting) Yapın:**
   ```bash
   npm run lint
   ```
