# Atrium 3D — Proje Bağlamı (Project Context)

Atrium 3D (eski adıyla Saray), notları ve fikirleri 3D bir evin odalarına, duvarlarına ve eşyalarına yerleştirerek düzenlemeyi sağlayan, mekânsal hafıza (spatial memory) odaklı bir 3D zihin haritası uygulamasıdır.

## 🔗 Genel Bilgiler
* **Uygulama Adı:** Atrium 3D
* **GitHub Deposu:** `asujai/saray`
* **Canlı Demo URL:** [https://atrium3d.netlify.app/](https://atrium3d.netlify.app/)

## 🛠️ Teknolojik Altyapı (Tech Stack)
* **Arayüz & State:** React 19 (Modern hooks ve state yönetimi)
* **Derleme & Paketleme:** Vite 8 (Ultra hızlı HMR ve esbuild)
* **3D Grafik Motoru:** Three.js & `@react-three/fiber` (R3F) & `@react-three/drei`
* **Stil & İkonlar:** Custom CSS (Glassmorphism, Neon Hologram UI) & Lucide React
* **Veritabanı (Local-First):** IndexedDB & LocalStorage (`src/utils/db.js`)
* **Kod Analizi:** Oxlint (Rust tabanlı hızlı linter)

## 📂 Temel Proje Yapısı ve Dosyalar
* **`src/App.jsx`**: Ana 3D kanvas kurulumu.
* **`src/SarayApp.jsx`**: Uygulamanın durum yönetimi, çekirdek iş mantığı ve Atrium 3D ana motoru.
* **`src/components/`**:
  * `CrosshairRaycaster.jsx`: Etkileşim ve imleç yönetimi (Raycasting).
  * `MiniMapTracker.jsx`: Mini harita takip bileşeni.
  * `Note3D.jsx`: 3D Not panelleri ve bunların render edilmesi.
  * `NoteDashboard.jsx`: Holografik not yönetim, teleport ve arama paneli.
  * `PlacedItem3D.jsx`: Sahneye yerleştirilen eşyaların (mobilyalar, kitaplıklar) yönetimi.
  * `Player.jsx`: Oyuncu hareketleri, yürüme (Walk) / uçma (Fly) modları ve kamera fizik motoru.
  * `Room.jsx`: Odaların geometrik çizimi ve sınır yönetimi.
  * `UIOverlay.jsx`: 2D kontrol paneli, HUD ve ayarlar modalı.
* **`src/utils/db.js`**: Yerel veritabanı şeması ve IndexedDB okuma/yazma yardımcıları.
* **`src/index.css` & `src/App.css`**: Neon hologram temalı küresel ve bileşen bazlı stiller.

## 🤖 Test Altyapısı (TestSprite)
Uygulama, **TestSprite platformu** ile uçtan uca (E2E) doğrulanmaktadır.
* **Project ID:** `d591bb97-f4bd-4700-bc64-28efa2e4cff0`
* **Test Modu:** `?testMode=true` parametresi ile devreye giren test modu HUD paneli, canvas montaj durumu, aktif modlar vb. verileri DOM üzerinden doğrulama ajanlarına sunar.
* **Önemli Test Planları:**
  * `plan-regression-proof.json`: Regresyon testleri ve rota doğrulamaları.
  * `plan-full-app-verification.json`: Uygulamanın tüm özelliklerinin (not, eşya, kitaplık, 3D kavramsal bağ vb.) ve yerel veritabanı kalıcılığının uçtan uca doğrulanması.
