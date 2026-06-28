# 🏰 Saray — 3D Spatial Mind Map

Saray, notlarınızı ve fikirlerinizi üç boyutlu bir evin odalarına, duvarlarına ve eşyalarına yerleştirerek düzenlemenizi sağlayan, **mekânsal hafıza (spatial memory)** odaklı yenilikçi bir 3D zihin haritası uygulamasıdır.

Klasik iki boyutlu zihin haritalarının aksine Saray, bilgiyi fiziksel bir mimari alana yerleştirir. Fikirlerinizi odalara, duvarlara veya mobilyalara yerleştirerek zihninizde güçlü mekânsal bağlar kurabilir, sanal ortamda yürüyerek bilgilerinizi çok daha kalıcı bir şekilde hatırlayabilirsiniz.

---

## 🌟 Öne Çıkan Özellikler

- 🚶‍♂️ **3D Gezinti ve Kontroller**: Serbest uçuş (Fly) ve fizik tabanlı yürüyüş (Walk) modları ile akıcı 3D oda navigasyonu.
- 📌 **Dinamik Not Panelleri**: Duvarlara tıklayıp sürükleyerek istenen boyutta 3D not kartları oluşturma.
- 📄 **Çok Sayfalı Notlar**: Her not kartı içinde birden fazla sayfa oluşturma, düzenleme ve yönetme.
- 🖼️ **Görsel Bellek Desteği**: Not sayfalarına yerel cihazınızdan görseller yükleme ve ekleme.
- 🛋️ **Etkileşimli Eşya & Mobilyalar**: Masa, kitaplık, bitki ve halı gibi çeşitli 3D objeleri odaya yerleştirip düzenleme.
- 🔍 **Eşyaya Not Gizleme**: Yerleştirilen mobilyaların içine notlar saklama ve üzerlerindeki billboard ikonlarıyla etkileşime girme.
- 📚 **Gelişmiş Kitaplık Sistemleri**:
  - **Kütüphane Rafı**: 24 slot kapasiteli, sırt yazılı dikey kitap dizilimi.
  - **Büyük Kitaplık**: 48 slot kapasiteli gelişmiş ünite. Kitaplara tıklandığında bağlı notlar anında açılır.
- 🔗 **3D Kavramsal Bağlantılar**: Notlar ve eşyalar arasında 3D çizgiler çizerek fikirler arası ilişkileri görselleştirme.
- ⚡ **Holografik Kontrol Paneli**: Notlar arasında arama yapma, oda/etiket filtreleme ve tıklanan nota otomatik ışınlanma (teleport).
- 🌓 **Açık/Koyu Tema Desteği**: Göz yormayan koyu tema ile ferah açık tema arasında tek tıkla geçiş.

---

## 📂 Proje Yapısı

Projenin temel klasör ve dosya organizasyonu aşağıdaki şekildedir:

```text
saray/
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
│   ├── SarayApp.jsx     # Uygulama durum yönetimi ve ana mantık
│   ├── index.css        # Küresel CSS ve tasarım sistemi kuralları
│   └── main.jsx         # React başlangıç noktası
├── .oxlintrc.json       # Linter yapılandırması
├── index.html           # Giriş HTML şablonu
├── package.json         # Bağımlılıklar ve komutlar
└── vite.config.js       # Vite yapılandırması
```

---

## 💾 Veri Güvenliği ve Depolama

> [!IMPORTANT]  
> **Yerel Odaklı (Local-First) Yaklaşım:**  
> Saray'da oluşturduğunuz tüm notlar, yüklediğiniz görseller, yerleştirdiğiniz eşyalar ve özelleştirdiğiniz oda ayarları **tamamen sizin cihazınızda (tarayıcınızda)** saklanır. Verileriniz hiçbir harici sunucuya gönderilmez.

- **IndexedDB**: Görseller ve büyük not metinleri tarayıcının IndexedDB veritabanında yüksek performansla saklanır.
- **LocalStorage**: Oda yapılandırmaları, eşya koordinatları ve kullanıcı tercihleri (tema vb.) LocalStorage üzerinde tutulur.
- *Gelecek Planı:* Çoklu cihaz senkronizasyonu ve isteğe bağlı bulut yedekleme özellikleri sonraki sürümlerde planlanmaktadır.

---

## 🛠️ Teknolojik Altyapı

Uygulamanın performanslı ve modern çalışmasını sağlayan ana teknolojiler:

- **Çekirdek**: [React 19](https://react.dev/) & [Vite 8](https://vite.dev/)
- **3D Grafik Motoru**: [Three.js](https://threejs.org/)
- **React-3D Entegrasyonu**: [React Three Fiber (R3F)](https://r3f.docs.pmnd.rs/) & [Drei](https://github.com/pmndrs/drei)
- **Tasarım & İkonlar**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://github.com/oxc-project/oxc) (Ultra hızlı JS/TS linter)

---

## 🚀 Geliştirme ve Çalıştırma

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
