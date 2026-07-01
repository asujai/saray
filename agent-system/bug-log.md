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

### [BUG-006] FutureExpansionGate ReferenceError Hatası
* **Saptayan Ajan:** Judge / Audit Agent (Ekran Görüntüsü Kanıtı)
* **Hata Tanımı:** TASK-005 kapsamında `Room.jsx` içerisine yerleştirilen holografik genişleme kapıları (`FutureExpansionGate`) bileşeninin tanımının yapılmamış olması sebebiyle 3D sahne render edilirken `Uncaught ReferenceError: FutureExpansionGate is not defined` hatası alınıyor ve uygulama beyaz ekranda kalıyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `Room.jsx` içerisine neon kesikli holografik tel kafes ve 3D etiketleri barındıran `<FutureExpansionGate>` bileşeni tanımlanarak ReferenceError hatası tamamen giderildi.
* **Durum:** Çözüldü (TASK-005 Düzeltmesi)

### [BUG-007] lang ReferenceError Hatası
* **Saptayan Ajan:** Judge / Audit Agent (Ekran Görüntüsü Kanıtı)
* **Hata Tanımı:** `Room.jsx` içerisindeki holografik genişleme kapılarına `lang` değişkeni parametre olarak geçilmiş olmasına karşın `Room` bileşeninde `lang` prop'unun tanımlanmamış olması sebebiyle render sırasında `Uncaught ReferenceError: lang is not defined` hatası alınıyor ve uygulama beyaz ekranda kalıyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `SarayApp.jsx` içinde `Room` bileşenine `lang={lang}` prop'u geçildi; `Room.jsx` dosyası içerisindeki `Room` bileşen tanımında `lang = 'tr'` prop olarak destructure edilerek hata giderildi.
* **Durum:** Çözüldü (TASK-005 Düzeltmesi)

### [BUG-008] Failure Loading Font (sans-serif) RangeError Hatası
* **Saptayan Ajan:** Judge / Audit Agent (Konsol Logu Kanıtı)
* **Hata Tanımı:** `FutureExpansionGate` bileşenindeki `<Text>` bileşenlerine `font="sans-serif"` atanması nedeniyle Troika text rendering motoru local sunucudan `/sans-serif` dosyasını çekmeye çalışıyor ve HTML yanıtını binary font olarak parse ederken `RangeError: Offset is outside the bounds of the DataView` fırlatarak 3D sahneyi çökertiyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `<Text>` bileşenlerindeki `font="sans-serif"` parametreleri kaldırılarak gömülü varsayılan fontun kullanılması sağlandı ve çökme engellendi.
* **Durum:** Çözüldü (TASK-005 Düzeltmesi)

### [BUG-009] FineTuneAccordion lang ReferenceError Hatası
* **Saptayan Ajan:** Judge / Audit Agent (Kullanıcı Geri Bildirimi)
* **Hata Tanımı:** `UIOverlay.jsx` içerisindeki `<FineTuneAccordion>` alt bileşeninde `lang` değişkeni kullanılmasına rağmen component tanımında `lang` prop'unun destructure edilmemiş olması ve üst bileşenden geçilmemiş olması sebebiyle 'Özellikleri Düzenle' butonuna basıldığında `Uncaught ReferenceError: lang is not defined` fırlatılıyor ve uygulama tamamen beyaz ekranda kalıyordu.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `UIOverlay.jsx` içinde `<FineTuneAccordion lang={lang} />` olarak prop geçildi; alt bileşen tanımında `lang` parametresi destructure edilerek hata giderildi.
* **Durum:** Çözüldü (TASK-007 Düzeltmesi)

### [BUG-010] Sahne Boşluğuna Tıklanıldığında Eşya Seçiminin Kalkmaması Hatası
* **Saptayan Ajan:** Kullanıcı (Geri Bildirim)
* **Hata Tanımı:** 3D sahnedeki sadece belirli zemin/duvar mesh'lerinin tıklama dinleyicisi olması; buna karşılık tavan, statik süs eşyaları veya sahne dışındaki boşluklar tıklandığında `onDeselect` olayının tetiklenmemesi nedeniyle kutu seçim çerçevesinin (glow efekti) seçili kalması.
* **Hata Sorumlusu:** Implementation Agent
* **Çözüm:** `<Canvas>` bileşenine `onPointerMissed={handleDeselect}` prop'u eklenerek boşluğa veya tıklama dinleyicisi olmayan herhangi bir statik yapıya tıklandığında seçimin güvenle kalkması sağlandı.
* **Durum:** Çözüldü (TASK-009 Düzeltmesi)

