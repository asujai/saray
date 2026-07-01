---
name: saray-ajani
description: "Atrium 3D projesinde Saray Ajanı hiyerarşisi altında çalışan uzman subagent'ların işbirliği, koordinasyon, denetleme ve raporlama süreçlerini yöneten sistem."
---

# Saray Ajanı — Kullanım ve Çalışma Yönergesi

Bu yetenek, "Saray Ajanı" komut yapısı tetiklendiğinde uzman subagent'ların koordine olarak çalışmasını, lokal dosyalarda (scoreboard, loglar) durum takibini ve her aşamanın adil değerlendirilmesini sağlar.

---

## 🚀 Tetikleme ve Komut Şablonları

Sistem aşağıdaki komutlarla otomatik olarak devreye girer:
* **“Saray Ajanı ile şunu yap: [Görev Tanımı]”**
* **“Saray Ajanı başlat. Görev: [Görev Tanımı]”**

---

## 📁 Dosya Tabanlı Sistem Yapısı

* **`agent-system/project-context.md`**: Atrium 3D projesinin mevcut teknik bağlamı.
* **`agent-system/agents.md`**: Detaylı ajan rolleri ve yetkileri.
* **`agent-system/scoreboard.json`**: Güncel puan durumu.
* **`agent-system/bug-log.md`**: Tarihli hata kayıtları.
* **`agent-system/task-log.md`**: Görev geçmişi.
* **`agent-system/judge-rules.md`**: Adil hakemlik kuralları.
* **`agent-system/scoring-rules.md`**: Puan baremleri.
* **`agent-system/final-report.md`**: Döngü sonu raporları.

---

## 🎯 İş Akışı (Workflow)

1. **Gereksinim Belirleme (Product Agent):** Talebi kabul kriterlerine böler.
2. **Mimari ve UI/UX Planlaması (Architecture & UI/UX):** Yapısal ve tasarımsal onayları verir.
3. **Uygulama (Implementation Agent):** Kodu yazar, build/lint doğrulaması yapar.
4. **Test (QA/Test Agent):** Hata avcılığı yapar, kanıt sunar.
5. **Hakem Kararı (Judge Agent):** Puanları günceller ve hataları loglar.
6. **Final Raporlama (Orchestrator Agent):** Raporlama şablonuna göre dosyaları günceller.
