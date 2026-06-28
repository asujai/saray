# 🏰 TestSprite PRD — Saray MVP

## 1. MVP Purpose / Amaç
**Saray**, klasik 2 boyutlu metin tabanlı not uygulamalarının ötesine geçerek bilgiyi görsel ve uzamsal olarak hafızada tutmayı amaçlayan bir **3D Zihin Sarayı (Mind Palace)** uygulamasıdır. Kullanıcıların mekânsal hafızasını (spatial memory) tetiklemek için bilgiyi 3D odalara, duvarlara ve mobilyalara yerleştirerek görsel ve fiziksel bağlar kurmasını sağlar.

## 2. Core User Flows / Ana Kullanıcı Akışları
1.  **Scene Navigation & Controls:** Walk (yürüyüş) ve Fly (uçuş) modlarıyla 3D evde serbestçe dolaşabilme.
2.  **3D Wall Notes:** Odaların duvarlarına tıklayıp sürükleyerek 3D not kartları oluşturma, içeriklerine metin yazma, görsel yükleme ve ikon belirleme.
3.  **Placed Items:** Odaya mobilyalar (masa, sandalye, kitaplık vb.) ekleme, bu eşyaları 3D sahnede konumlandırma/döndürme ve eşyalara özel notlar bağlama.
4.  **Library shelf system:** Kitaplıklara tıklayarak slot bazlı sırt yazılı dikey kitaplar ekleme, bu kitaplara tıklandığında ilişkili notları açma.
5.  **3D Conceptual Connections:** Farklı notlar ve eşyalar arasında 3D bezier çizgileri çizerek ilişkileri görselleştirme.
6.  **Holographic Control Panel:** Tüm saraydaki notlar arasında arama yapma, odalara veya etiketlere göre filtreleme ve tıklanan nota 3D olarak otomatik ışınlanma (teleport).
7.  **Study Session (Çalışma Modu):** Seçilen notlar arasında sırayla dolaşarak bir zihin sarayı çalışma oturumu yürütme.

## 3. TestSprite Verification Targets / Doğrulanacak Davranışlar
TestSprite CLI aracılığıyla canlı demo URL (`https://atrium3d.netlify.app/`) üzerinde test edilip onaylanacak kritik davranışlar:
*   **Scene & HUD Load Verification:**
    *   3D Canvas ve ana kontroller (yüzen panel) ekranda düzgün görünmeli, hata fırlatmamalıdır.
*   **Settings Modal & UI Localization/Theme:**
    *   Ayarlar panelinden dil "EN" veya "TR" olarak değiştirildiğinde butonlar ve etiketler doğru dile bürünmelidir.
    *   Tema (Açık/Koyu) değiştirildiğinde sayfa sınıfları güncellenmeli ve UI tasarımı bozulmamalıdır.
*   **Holographic Navigator & Search Functional:**
    *   Holografik kontrol paneli (H) açılabilmeli.
    *   Not arama çubuğuna yazıldığında sonuçlar filtrelenmeli, arama yapıldığında arama sonucuna ait kartlar görünmelidir.
    *   Çalışma Modu sekmesi açılıp odadaki notlar listelenebilmelidir.
