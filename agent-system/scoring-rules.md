# Agent League — Puanlama Kuralları (Scoring Rules)

Bu dosya, Agent League sistemindeki puanlama mantığını, ceza ve ödül baremlerini tanımlar. Tüm puan değişiklikleri bu kurallara göre uygulanır.

---

## 1. Başlangıç Puanı
Her yeni görev veya proje başlangıcında tüm ajanlar **100 puan** ile başlar.

---

## 2. Puan Düşüşleri (Cezalar)

Ajanların yaptıkları hataların büyüklüğüne göre uygulanacak puan kesintileri:

| Hata Kategorisi | Puan Etkisi | Açıklama / Örnek |
| :--- | :---: | :--- |
| **Kritik Hata (Critical Bug)** | **-25** | Uygulamanın tamamen çökmesi, build hatası alması, sonsuz döngüye girmesi veya IndexedDB veritabanının bozulması. |
| **Ana Özellik Bozuk (Major Feature Broken)** | **-15** | Tanımlanan ana özelliklerden birinin çalışmaması (örneğin 3D notun eklenememesi veya Study Mode'un başlamaması). |
| **Eksik veya Yanlış Özellik (Missing/Incorrect Feature)** | **-10** | Kabul kriterlerinde yer alan bir özelliğin hiç yapılmaması veya kriter dışı yanlış uygulanması. |
| **Başka Ajanın Alanını Bozma (Polluting Other's Area)** | **-10** | Yapılan değişikliğin, diğer bir ajanın çalışan ve stabil kodunu/tasarımını bozması veya etkilemesi. |
| **Test veya Kanıt Sunmama (No Evidence/Test)** | **-8** | Yapılan iş için herhangi bir TestSprite E2E kanıtı, konsol logu veya DOM doğrulama verisi sunulmaması. |
| **Yanlış Varsayım (Wrong Assumption)** | **-7** | Geliştirme sırasında sormadan yapılan ve sistemin genel mantığına uymayan hatalı varsayımlar. |
| **Küçük UI/Metin/Düzen Hatası (Minor Visual/Text Bug)** | **-3** | Glassmorphism temasındaki ufak görsel kaymalar, yanlış dil çevirileri veya hizalama hataları. |

---

## 3. Puan Artışları (Ödüller)

Ajanların kaliteyi artırmaya yönelik aksiyonları için alacakları ek puanlar:

| Başarı Kategorisi | Puan Etkisi | Açıklama / Örnek |
| :--- | :---: | :--- |
| **Test Kanıtı Sunma (Providing Test Evidence)** | **+8** | Yapılan işin çalıştığını gösteren TestSprite E2E plan doğrulaması veya debug status çıktısı sunmak. |
| **Kendi Hatasını Erken Fark Etme (Self-Correction)** | **+5** | QA Agent veya Judge Agent tespit etmeden önce, kendi hatasını fark edip düzeltme kodu veya revize raporu sunmak. |
| **Açık, Uygulanabilir ve Temiz Çıktı (Clean Deliverable)** | **+5** | Sıfır hata ile tamamlanan, mimari kurallara mükemmel uyan ve anlaşılır dokümante edilmiş çıktı sunmak. |
| **Gerçek Hatayı Doğru Kanıtla Yakalama (Bug Hunting)** | **+5** | Başka bir ajanın kodundaki veya tasarımındaki gerçek bir hatayı, inkar edilemez somut teknik kanıtlarla yakalamak. |
