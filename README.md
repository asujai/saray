# 🏰 Saray - 3D Zihin Haritası

Saray, notlarını ve fikirlerini üç boyutlu bir evin odalarına, duvarlarına ve eşyalarına yerleştirerek düzenlemeyi sağlayan mekânsal hafıza odaklı bir 3D zihin haritası uygulamasıdır.

Klasik 2D zihin haritalarından farklı olarak Saray, bilgiyi iki boyutlu çizgiler yerine üç boyutlu bir mimari alana yerleştirir. Kullanıcılar fikirlerini odalara, duvarlara ve eşyalara yerleştirerek zihinlerinde mekânsal bir bağ kurarlar. Temel amaç, bilgileri sanal ortamda yürüyerek ve mekânsal hafızanın gücünü kullanarak daha kalıcı bir şekilde hatırlamaktır.

---

## 🌟 Temel Özellikler

* **3D Oda İçinde Gezme**: Serbest uçuş ve yürüyüş modları ile 3D oda ve alanlar arasında pürüzsüz gezinti.
* **Duvara Not Ekleme**: Sahnedeki duvarlara tıklayıp sürükleyerek istenilen boyutta 3D not panelleri oluşturma.
* **Çok Sayfalı Not Sistemi**: Her not kartında birden fazla sayfa oluşturabilme ve yönetme.
* **Notlara Görsel Ekleme**: Not sayfalarına yerel görseller yükleyerek görsel hafızayı destekleme.
* **Eşya Yerleştirme**: Çalışma masası, kitaplık, saksı bitkisi, halı gibi çeşitli 3D mobilya ve aksesuarları odaya yerleştirip düzenleme.
* **Eşyalara Not Bağlama**: Yerleştirilen eşyaların içerisine gizli notlar saklama ve eşya üzerinde billboard ikonlar gösterme.
* **Kütüphane Rafı & Kitap Notları**: Odalara yerleştirilebilen 24 slotlu "Kütüphane Rafı" ve 48 slotlu "Büyük Kitaplık" üniteleri. Kitaplar dikey olarak bölmelere dizilir ve sırt yazılarıyla görsel çağrışım sağlar; kitaba tıklandığında bağlı notu açılır.
* **3D Bağlantılar (İlişkiler)**: Notlar ve eşyalar arasında kavramsal 3D çizgiler çizerek fikirler arası ilişkileri görselleştirme.
* **Holografik Kontrol Paneli**: Tüm notları arayabilme, odaya veya etikete göre filtreleme ve tıklanan nota otomatik ışınlanma (teleport).
* **Açık/Koyu Arayüz Teması**: Kullanıcı tercihine göre gözü yormayan koyu tema veya ferah açık tema desteği.

---

## 📦 MVP Konsepti

Saray'ın ilk ücretsiz sürümü temel mekânsal hafıza deneyimini sunacak şekilde MVP (Minimum Uygulanabilir Ürün) olarak tasarlanmıştır:
* Uygulama ilk açılışta küçük bir koridor ve iki adet oda sunar.
* **Hazır Oda**: İçerisinde büyük bir çalışma masası, koltuk, kitaplık, bitki ve örnek notların yer aldığı hazır tasarlanmış bir çalışma/bilgi odasıdır. Kullanıcı bu odayı dilediği gibi düzenleyebilir, boşaltabilir veya tek tıkla ilk haline döndürür.
* **Boş Oda**: Kullanıcının tamamen kendi zihin haritasını sıfırdan inşa edebileceği boş bir alandır.
* *Gelecek Planları*: İlerleyen aşamalarda daha fazla oda seçeneği ve ev şablonları premium özellikler olarak eklenecektir.

---

## 💾 Veri Durumu

* **Yerel Depolama (Local-First)**: Saray'da oluşturduğunuz tüm notlar, görseller, yerleştirdiğiniz eşyalar ve odaların isim/renk özelleştirmeleri tamamen sizin cihazınızda (tarayıcınızda) saklanır.
* **IndexedDB & LocalStorage**: Görseller ve büyük not metinleri tarayıcının IndexedDB veritabanında saklanırken; oda ayarları ve eşya koordinatları LocalStorage üzerinde tutulur.
* *Gelecek Planları*: Çoklu cihaz senkronizasyonu, bulut yedekleme ve kullanıcı hesap sistemi sonraki geliştirme aşamalarında planlanmaktadır.

---

## 🛠️ Teknik Yığın

* **Arayüz & Çekirdek**: React, Vite
* **3D Grafik**: Three.js, React Three Fiber (R3F), Drei
* **Veri Yönetimi**: IndexedDB, LocalStorage
* **İkonlar**: Lucide React

---

## 🚀 Geliştirme Komutları

Projeyi yerel ortamınızda çalıştırmak veya derlemek için aşağıdaki komutları kullanabilirsiniz:

```bash
# Bağımlılıkları yükleme
npm install

# Yerel geliştirme sunucusunu başlatma (http://localhost:5173)
npm run dev

# Üretim sürümü için derleme (build) alma
npm run build

# Derlenen üretim sürümünü yerel olarak önizleme
npm run preview

# Linter kontrolü
npm run lint
```
