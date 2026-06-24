# 🏰 Saray - 3D Zihin Haritası & Bilgi Evreni

Saray, geleneksel 2D zihin haritalarını ve not defterlerini fütüristik, üç boyutlu bir mimari alana taşıyan avant-garde bir bilgi organizasyon uygulamasıdır. Kullanıcılar sanal bir ev içinde odaları özelleştirebilir, duvarlara değişken boyutlu hologram notlar çizebilir, odalara eşyalar yerleştirebilir ve bu eşyaların içine gizli bilgiler veya çok sayfalı notlar saklayabilir.

---

## 🌟 Temel Özellikler

### 1. 🏡 Hazır Ev Konseptleri (Temalar)
Uygulama, bilgi evreninizin havasını değiştirecek 3 benzersiz konsept sunar:
- **Minimal Çalışma Evi**: Kırık beyaz duvarlar, açık ahşap zeminler ve sade tasarımlarla dikkat dağıtmayan modern bir çalışma alanı.
- **Kütüphane / Bilgi Evi**: Sıcak krem duvarlar, koyu ahşap zeminler ve dev kitaplıklarla bezeli, klasik okuma odası sıcaklığı.
- **Bilim Kurgu / Hologram Evi**: Koyu lacivert duvarlar, metalik zeminler, neon çizgiler ve parlayan fütüristik hologram panelleri içeren dijital bir zihin laboratuvarı.

### 2. 🎛️ Çift Kamera Sistemi
- **Serbest Kamera Uçuş Modu (`free`)**: Uçarak odalar arasında gezinebileceğiniz, zemin veya tavan sınırlarına takılmadan tam serbestlik sağlayan kamera açısı.
- **Üçüncü Şahıs Orbit Modu (`third-person`)**: Fütüristik avatarınızı dışarıdan izleyebileceğiniz ve avatar merkezli dönüş yapabileceğiniz mod.

### 3. 📝 Duvar Not Sistemi (Çiz & Yapıştır)
- **Değişken Boyutlu Notlar**: Duvara farenizle tıklayıp sürükleyerek dilediğiniz ebatta not kartları çizebilirsiniz.
- **Çok Sayfalı Yapı**: Her bir not birden fazla sayfaya sahip olabilir. Sayfalar arasında kolayca geçiş yapılabilir.
- **Zengin İçerik**: Sayfalara uzun metinler yazabilir, resimler yükleyebilir ve metin/görsel düzenini özelleştirebilirsiniz.
- **WebGL Kaydırma Desteği**: Uzun metinler notun sınırlarından taşmaz; fare tekerleğiyle notun içinde pürüzsüzce kaydırılabilir.

### 4. 🪑 Eşya Kütüphanesi & Yerleştirme Sistemi
Ev içini dekore etmek ve bilgileri eşyalara bağlamak için 10 adet low-poly (performans dostu) 3D model:
> Masa, Sandalye, Büyük Kitaplık, Duvar Rafı, Saksı Bitkisi, Ayaklı Lamba, Desenli Halı, Bilgisayar Seti, Koli/Kutu, Çalışma Panosu.

- **Eşya Özellik Barı**: Seçilen eşyanın rengini değiştirebilir, boyutunu ölçekleyebilir (0.4x - 2.5x) veya kendi ekseninde döndürebilirsiniz.

### 5. ⚙️ Gelişmiş Eşya Düzenleme Modu
- **Aktivasyon**: Eşyaya sol tık sadece seçimi yapar (taşıma başlamaz). Eşyanın üzerine fare ile **3 saniye basılı tutulduğunda** progress bar dolar ve düzenleme modu aktifleşir. Alternatif olarak seçili eşya barındaki `⚙️ Eşyayı Düzenle` butonuyla manuel geçilebilir.
- **Yön Butonları & Klavye**: Eşyaları X, Y (dikey yükseklik) ve Z eksenlerinde butonlar veya klavye ile hareket ettirebilirsiniz.
- **Yedekleme & Geri Yükleme**: Düzenleme esnasında yapılan değişiklikler `İptal` butonu veya `Escape` tuşu ile tamamen geri alınabilir, `Kaydet` butonu ile onaylanır.
- **Dikey Yükseklik Kalıcılığı**: Eşyaların Y eksenindeki havada durma konumları da dahil tüm pozisyonları `localStorage`'a kaydedilir. Sayfa yenilense bile eşyalar aynı yükseklikte geri yüklenir.

### 6. ℹ️ Eşya Üstü Billboard İkonlar & Gizli Notlar
- **Gizli Bilgi**: Eşyalara büyük duvar notları yerine, içine gömülü gizli bilgiler bağlayabilirsiniz.
- **Billboard İkon**: Eşyaya not eklendiğinde üzerinde seçilen simge (`?`, `!`, `i` veya mavi parlayan nokta) belirir. Bu simgeler kameranın quaternion değerini kopyalayarak her zaman kameraya dönük kalır (billboard davranışı).
- **Dinamik Ölçek**: İkon boyutu eşyanın scale değerine göre dinamik olarak hesaplanır (`clamp(scale * 0.4, 0.25, 0.8)`).
- **Doğrudan Not Açma**: İkona tıklamak eşya taşıma modunu tetiklemeden doğrudan not penceresini açar.

### 7. 🎨 Oda & İsim Özelleştirme
- **Ev & Oda Ayarları**: Panelden 5 odanın (Hol, Yatak Odası, Mutfak, Çalışma Odası, Salon) isimlerini değiştirebilir, her oda için ayrı duvar ve zemin renkleri atayabilir ya da tek bir tıkla varsayılan temaya dönebilirsiniz.
- **Holografik Panel Senkronizasyonu**: Değiştirilen oda isimleri, not kartları üzerindeki rozetlerde ve arama filtrelerinde anında güncellenir.

### 8. 🔍 Holografik Kontrol Paneli (Dashboard)
- Tüm duvar notlarını ve eşya notlarını tek bir panelde arayabilir, odaya ve eşyaya göre filtreleyebilirsiniz.
- Listeden bir nota veya eşyaya tıkladığınızda kamera otomatik olarak o nesneye uçar (teleport) ve hedef nesne 2 saniye boyunca neon mavi renkte yanıp sönerek (pulsing efekti) kendini belli eder.

---

## 🕹️ Kontroller ve Kısayollar

### 🏃 Kamera ve Uçuş Kontrolleri
- **Hareket (WASD / Yön Tuşları)**: `W`/`S`/`A`/`D` veya Arrow keys ile serbest uçuş.
- **Dikey Yükselme / Alçalma**: `Space` tuşu ile yukarı çıkma, `Shift` tuşu ile aşağı inme (odaklar input/textarea veya açık modallarda değilken çalışır).
- **Bakış Yönü (Look around)**: Ekranın boş bir yerine farenin sol tuşuyla basılı tutup sürükleyerek kamerayı çevirme.
- **İleri/Geri Süzülme (Zoom)**: Fare tekerleği (wheel) ile bakış yönüne doğru pürüzsüz yaklaşma/uzaklaşma.

### ⌨️ Global Kısayollar
- **`C`**: Kamera modunu değiştir (`free` <-> `third-person`).
- **`E`**: Duvar notu çizim (Add) modunu aç/kapat.
- **`H`**: Holografik kontrol panelini aç/kapat.
- **`Escape` veya Sağ Tık**: Seçimleri temizler, düzenleme modundan veya açık modallerden güvenli çıkış sağlar.

### 🧸 Eşya Düzenleme Modu Kısayolları (Sadece Düzenleme Aktifken)
- **`PageUp`**: Eşyayı yukarı kaldırır (Y ekseninde yükseltir).
- **`PageDown`**: Eşyayı aşağı indirir (Y ekseninde alçaltır).
- **`Q` / `E`**: Eşyayı kendi ekseninde sola/sağa döndürür (15 derecelik adımlarla).
- **`+` / `-`**: Eşyayı büyütür veya küçültür.
- **`Delete` / `Backspace`**: Seçili eşyayı sahneden tamamen siler.
- **`Escape` veya Sağ Tık**: Yapılan değişiklikleri iptal eder ve eşyayı eski konum/renk/boyutuna geri döndürür.

---

## 🛠️ Teknoloji Yığını

- **Çekirdek**: React 18, Vite (SWC), Custom Modern Glassmorphic CSS.
- **3D Render**: Three.js, React Three Fiber (R3F), `@react-three/drei`.
- **Veri Depolama**:
  - **IndexedDB**: Boyut limiti olmayan, görsel dosyalarını da (base64) barındıran dayanıklı duvar notları tablosu.
  - **LocalStorage**: Eşya koordinatları, renkleri, ölçekleri, oda isimleri ve temaları.
- **İkon Seti**: Lucide React.
