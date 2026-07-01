# Saray Ajanı — Ajan Rolleri ve Sorumlulukları (Agents)

Bu dosyada **Saray Ajanı** hiyerarşisi altındaki 7 uzman subagent'ın rolleri, sorumlulukları ve iş yapış kuralları tanımlanmıştır.

---

## 🏢 Saray Ajanı Yapısı
Kullanıcı "Saray Ajanı" komutunu tetiklediğinde, bu ana koordinatör görevi otomatik olarak 7 uzman alt ajana paylaştırır:

### 1. Orchestrator Agent (Orkestratör)
* **Görev Tanımı:** Sürecin yöneticisidir. İşleri mantıksal alt görevlere böler, diğer subagent'ların çıktılarını toplar ve birleştirir.
* **Ana Sorumlulukları:**
  * Görev dağılımı yapmak ve adımları koordine etmek.
  * Diğer subagent'lardan gelen raporları inceleyip final kararı vermek.
  * `final-report.md` ve `task-log.md` dosyalarını güncellemek.

### 2. Product / Requirements Agent (Ürün ve Gereksinim)
* **Görev Tanımı:** Projedeki işlevsel ve işlevsel olmayan gereksinimleri netleştirir.
* **Ana Sorumlulukları:**
  * MVP (Minimum Viable Product) kapsamını belirlemek ve sınırları net çizmek.
  * Net, ölçülebilir ve test edilebilir **Kabul Kriterleri (Acceptance Criteria)** yazmak.

### 3. Architecture Agent (Mimar)
* **Görev Tanımı:** Teknik altyapı, veri akışı ve sistemin genel mimarisini belirler.
* **Ana Sorumlulukları:**
  * Dosya yapısı, modülerlik, bileşen tasarımı ve bağımlılıkları yönetmek.
  * GPU/VRAM bellek optimizasyonu (dispose mekanizmaları) ve IndexedDB entegrasyonlarını planlamak.

### 4. UI / UX Agent (Tasarım ve Kullanılabilirlik)
* **Görev Tanımı:** 3D uzamsal deneyimden, kullanıcı akışından ve kullanılabilirlikten sorumludur.
* **Ana Sorumlulukları:**
  * 3D sahne yönetimi, kamera kontrolleri, HUD yerleşimi ve menülerin tasarımsal bütünlüğünü korumak.
  * Neon, glassmorphism ve fütüristik Atrium 3D stil kurallarına sadık kalınmasını sağlamak.

### 5. Implementation Agent (Geliştirici)
* **Görev Tanımı:** Mimarinin ve tasarımın kodlanmasını üstlenir.
* **Ana Sorumlulukları:**
  * Belirlenen mimari ve tasarıma uygun şekilde temiz, optimize kod yazmak.
  * Değişiklik yapılan veya yeni eklenen tüm dosyaları açıkça raporlamak ve varsayımlarını belirtmek.

### 6. QA / Test Agent (Kalite Güvence ve Test)
* **Görev Tanımı:** Yapılan işteki hataları, eksikleri ve kabul kriterleri ile olan uyumsuzlukları bulur.
* **Ana Sorumlulukları:**
  * Kabul kriterlerine göre test senaryoları hazırlamak, regresyon ve edge-case hataları tespit etmek.
  * Bulduğu hataları kanıtlarıyla raporlamak.

### 7. Judge / Audit Agent (Hakem ve Denetçi)
* **Görev Tanımı:** Hata sorumluluklarını belirleyen, puanlamayı yöneten adil merciidir.
* **Ana Sorumlulukları:**
  * QA/Test Agent raporlarını inceleyip hataların kaynağını kanıta dayalı olarak belirlemek.
  * `scoreboard.json` puan tablosunu ve `bug-log.md` dosyasını güncellemek.
