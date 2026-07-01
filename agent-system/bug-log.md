# Saray Ajanı — Hata Defteri (Bug Log)

Bu dosyada Saray Ajanı denetim sürecinde uzman subagent'lar tarafından tespit edilen tüm hatalar, sorumluları, hakem kararları ve çözüm durumları listelenir.

---

## Aktif Hatalar

*(Aktif hata bulunmamaktadır. Tüm saptanan hatalar başarıyla çözülmüştür.)*

---

## Arşivlenen / Çözülen Hatalar

### [BUG-001] Üçgen Prizma (Prism) Yüzey Kaplama Sınırı
* **Saptayan Ajan:** QA / Test Agent
* **Hata Tanımı:** TASK-002 kabul kriteri 4'te üçgen prizma için de kutular gibi ayrı ayrı yüzey kaplama desteği istenmiş olmasına rağmen, prizma silindir materyal koduna dahil edildiğinden sadece 3 yüzeyli (üst, alt ve tek parça dairesel/yan yüzey) olarak kaplanabiliyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `PlacedItem3D.jsx` içindeki `CustomVisualBoxModel` materyal dizilimi optimize edilerek prizma için üst kapak (`top`), alt kapak (`bottom`) ve radial yan yüzeyler (`front`/`back`/`left`/`right`) Three.js sınırları dahilinde en esnek şekilde ayrıştırıldı ve kaplama desteği entegre edildi.
* **Durum:** Çözüldü (TASK-003)

### [BUG-002] UIOverlay Accordion Dil Kontrolü Hatası
* **Saptayan Ajan:** QA / Test Agent
* **Hata Tanımı:** `UIOverlay.jsx` dosyasında `FineTuneAccordion` başlığı dil kontrolünde `t.lang === 'en'` şeklinde yanlış bir değişken kullanılmış, bu nedenle İngilizce modunda dahi başlık Türkçe ("İnce Ayar (Konumlandırma)") olarak render ediliyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `t.lang === 'en'` kontrolü parametre olarak gelen dil state'i olan `lang === 'en'` olarak güncellendi ve etiketler başarıyla yerelleştirildi.
* **Durum:** Çözüldü (TASK-003)

### [BUG-003] Kapsül (Capsule) Seçim Sınırları (HelperBounds) Uyuşmazlığı
* **Saptayan Ajan:** QA / Test Agent (Edge-Case)
* **Hata Tanımı:** Kapsül geometrisinde `h < 2 * r` olduğunda `capsuleGeometry` toplam yüksekliği `Math.max(0.1, h - 2 * r) + 2 * r` olmaktayken, seçim çerçevesi (`helperBounds`) yüksekliği direkt `h` olarak atanıyordu. Bu durum seçim çizgileriyle modelin uyuşmamasına yol açıyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `PlacedItem3D.jsx` içindeki `helperBounds` fonksiyonuna kapsül için gerçek render edilen yüksekliği hesaplayan `Math.max(0.1, h - 2 * r) + 2 * r` mantığı entegre edildi.
* **Durum:** Çözüldü (TASK-003)

### [BUG-004] Kutu Yan/Alt Yüzeylerindeki Doku Sünmesi (Aspect Ratio Bozulması)
* **Saptayan Ajan:** QA / Test Agent
* **Hata Tanımı:** `PlacedItem3D.jsx` içindeki `adjustTextureFit` fonksiyonu yan ve alt yüzeyler için aspect oranını (`boxD / boxH` veya `boxW / boxD`) doğru hesaplamadığı için kaplamalar sünüp bozuluyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `adjustTextureFit` fonksiyonu güncellenerek yan yüzeylerde derinlik/yükseklik, alt yüzeylerde ise genişlik/derinlik aspect oranlarının doğru yansıtılması sağlandı.
* **Durum:** Çözüldü (TASK-003)

### [BUG-005] cameraMode Prop Eksikliği ve Eye Butonu TypeError Hatası
* **Saptayan Ajan:** Judge / Audit Agent
* **Hata Tanımı:** `UIOverlay.jsx` bileşeninde prop olarak beklenen `cameraMode` ve `setCameraMode` state'lerinin `SarayApp.jsx` içinde tanımlanmamış olması sebebiyle Eye butonu tıklandığında `TypeError: setCameraMode is not a function` hatası fırlatılıyordu ve kuş bakışı/serbest uçuş modlarındaki bağlantılı not parlamaları eksikti.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `SarayApp.jsx` dosyasına `cameraMode` state'i, localStorage senkronizasyonu ve klavye kısayolu 'C' entegre edildi. `Player` ve `UIOverlay` bileşenlerine prop olarak geçildi. `Note3D.jsx` içinde bağlantılı notların kuş bakışı ve serbest uçuş modlarında neon mavi parıltıyla (`emissiveIntensity` ve `emissive` güncellenmesi) ve duvar arkasından dahi görünmelerini sağlayan `depthTest={false}` holografik çerçeve ile render edilmesi sağlandı.
* **Durum:** Çözüldü (TASK-004)
