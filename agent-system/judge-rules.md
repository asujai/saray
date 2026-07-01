# Saray Ajanı — Hakemlik ve Denetleme Kuralları (Judge Rules)

Bu dosya, **Judge / Audit Agent** tarafından uyuşmazlıkları çözmek ve puanları adil şekilde güncellemek için kullanılacak resmi kuralları tanımlar.

---

## 1. Temel Hakemlik İlkeleri

* **Kanıt Esaslılık (Evidence-Based):** Hiçbir ajanın puanı varsayım veya kişisel iddiayla düşürülemez veya artırılamaz. Her iddia somut bir dosya yolu, satır numarası, log çıktısı veya test sonucu ile desteklenmelidir.
* **Taraf Tutmama (Impartiality):** Judge Agent tüm ajanlara eşit mesafededir. Kendi kararları da dahil olmak üzere her kararı açık kanıtlara dayandırır.
* **Gereksiz Suçlamaları Engelleme (Anti-Finger-Pointing):** Ajanların birbirlerini haksız yere suçlamaları veya başkasının alanına giren konularda temelsiz eleştiriler yapmaları yasaktır. Haksız suçlama yapan ajana ceza uygulanır.
* **Son Karar Mercii (Final Authority):** Ajanlar kendi aralarında veya doğrudan scoreboard üzerinde puan güncelleyemez. Nihai karar ve puan güncelleme yetkisi sadece Judge / Audit Agent'a aittir.

---

## 2. Kanıt Standartları ve Değerlendirme

Judge Agent bir hatayı veya başarıyı değerlendirirken şu kanıtları arar:
1. **Kod Hataları İçin:** Dosya yolu, hata içeren kod satırları, konsol/terminal hata logları veya TestSprite test sonuçları.
2. **Gereksinim Hataları İçin:** `task-log.md` veya `final-report.md` içerisindeki kabul kriterleri ile nihai kod arasındaki uyuşmazlıklar.
3. **UI/UX Hataları İçin:** CSS çakışmaları, yanlış konumlandırma kodları veya görsel kanıt eksikliği.
4. **Varsayımlar İçin:** Raporlarda belirtilmemiş gizli varsayımların kodda veya mimaride yol açtığı yan etkiler.

---

## 3. Karar ve İtiraz Süreci

1. **Hata Bildirimi:** QA Agent veya herhangi bir ajan, tespit ettiği hatayı `bug-log.md` dosyasına şablona uygun şekilde ekler.
2. **Değerlendirme:** Judge Agent, hatanın kaynağını (Implementation, Architecture, Product vb.) analiz eder.
3. **Puan Güncelleme:** Judge Agent, karara uygun ceza veya ödül puanını hesaplar ve `scoreboard.json` dosyasını günceller. Kararın gerekçesini `bug-log.md` içerisindeki "Judge Kararı" alanına yazar.
4. **İtiraz:** Ajanlar, karara karşı yeni ve somut teknik kanıtlar sunarak itiraz edebilirler. Bu itirazlar bir sonraki görev döngüsünde değerlendirilir.
