import React, { useState, useEffect } from 'react';
import SarayApp from './SarayApp';
import { Compass, Sun, Moon } from 'lucide-react';

const TRANSLATIONS = {
  tr: {
    badge: "🚀 Erken Erişim / Beta Web Sürümü",
    title: "Bilgilerini 3D bir odada düzenle",
    desc: "Saray, notlarını, görsellerini ve bağlantılarını 3D bir çalışma odasında düzenlemeni sağlayan masaüstü odaklı bir zihin haritası uygulamasıdır.",
    betaMsg: '"Saray şu anda beta web sürümündedir. İlk kullanıcıların geri bildirimleriyle nihai masaüstü uygulaması şekillendirilecektir."',
    openButton: "Saray'ı Aç",
    experienceWarning: "🖥️ En iyi deneyim bilgisayarda alınır. İsteğe bağlı mobil kontrol modu ve tablet desteği aktiftir.",
    betaSectionTitle: "Beta Sürecinde Neler Var?",
    betaSectionDesc: "Şu anki web sürümünde kullanabileceğiniz temel özellikler:",
    card1Title: "2 Odalı Başlangıç Sistemi",
    card1Desc: "Hazır döşenmiş Çalışma Odası ve tamamen kendi zevkinize göre özelleştirebileceğiniz boş Kişisel Oda ile başlayın.",
    card2Title: "Duvara Not ve Görsel Ekleme",
    card2Desc: "Fikirlerinizi, planlarınızı veya resimlerinizi odanın herhangi bir duvarına yapıştırın, serbestçe konumlandırın.",
    card3Title: "Eşyalara Bilgi Bağlama",
    card3Desc: "Çalışma odasındaki masalara, kitaplıklara ve dekoratif eşyalara zengin içerikli, çok sayfalı notlar entegre edin.",
    card4Title: "3D Bağlantılar Kurma",
    card4Desc: "Fikirler, notlar ve eşyalar arasına holografik 3D bağlantı çizgileri çizerek ilişkileri mekânsal olarak görselleştirin.",
    futureTitle: "Gelecekte Neler Gelecek?",
    futureDesc: "Nihai masaüstü ve cloud sürümünde yer alacak yol haritamız:",
    future1Title: "Gelişmiş Özelleştirme",
    future1Desc: "Daha fazla oda seçeneği, zengin mobilya ve dekorasyon kütüphanesi.",
    future2Title: "Dış Çevre Etkenleri",
    future2Desc: "İki odalı yapının ötesine geçerek; bahçeli, geniş dış alanlara sahip mekânsal çalışma ortamları.",
    future3Title: "Bulut Senkronizasyonu",
    future3Desc: "Bulut tabanlı senkronizasyon, hesap sistemi ve anlık yedekleme.",
    future4Title: "Yapay Zeka Desteği",
    future4Desc: "Notlarınızı analiz eden ve odanızı düzenlemenize yardım eden yapay zeka.",
    future5Title: "Mobil & Masaüstü",
    future5Desc: "Masaüstü (PC/Mac) uygulamalarının yanı sıra iOS ve Android mobil versiyonları.",
    earlyUserTitle: "Erken Kullanıcı Avantajları",
    earlyUserDesc: "Beta sürecinde geri bildirim veren kullanıcılar, final sürümde özel avantajlardan, indirimlerden ve kişiselleştirilmiş sürpriz içeriklerden (kişiye özel oda öğeleri, özel dekoratif eşyalar, özel tema veya duvar kaplamaları) yararlanabilir.",
    supportTitle: "Saray'ı Destekleyin",
    supportDesc: "Saray'ın tamamen bağımsız gelişmesini desteklemek ve projemize katkıda bulunmak isterseniz aşağıdaki destek seçeneklerini kullanabilirsiniz:",
    support1Title: "Bir Kahve Ismarla",
    support1Desc: "Geliştirici ekibe tek seferlik küçük bir kahve ısmarlayarak motivasyonumuza destek olabilirsiniz.",
    support2Title: "Patreon Destekçisi Ol",
    support2Desc: "Aylık düzenli katkı sağlayarak gelişim sürecini hızlandırabilir ve özel topluluk rollerine sahip olabilirsiniz.",
    support3Title: "Doğrudan Fonlama",
    support3Desc: "Kredi kartı veya diğer güvenli ödeme yöntemleriyle geliştirme bütçesine doğrudan katkı sunabilirsiniz.",
    supportSoon: "Yakında Aktif",
    feedbackPrompt: "Önerilerinizi ve fikirlerinizi buradan paylaşın:",
    footerText: "Bu sürüm test/MVP sürümüdür. Geri bildirimlere göre masaüstü uygulaması olarak geliştirilecektir."
  },
  en: {
    badge: "🚀 Early Access / Beta Web Version",
    title: "Organize your info in a 3D room",
    desc: "Saray is a desktop-oriented mind mapping application that lets you organize your notes, images, and connections in a 3D study room.",
    betaMsg: '"Saray is currently in beta web version. The final desktop app will be shaped by the feedback of the first users."',
    openButton: "Open Saray",
    experienceWarning: "🖥️ Best experience is on computer. Optional mobile control mode and tablet support are active.",
    betaSectionTitle: "What's in the Beta?",
    betaSectionDesc: "Core features available in the current web version:",
    card1Title: "2-Room Starting System",
    card1Desc: "Start with a pre-furnished Study Room and an empty Personal Room that you can customize to your liking.",
    card2Title: "Add Notes & Images to Walls",
    card2Desc: "Paste your ideas, plans, or images on any wall of the room, and position them freely.",
    card3Title: "Link Info to Items",
    card3Desc: "Integrate rich, multi-page notes into desks, bookshelves, and decorative items in the study room.",
    card4Title: "Establish 3D Connections",
    card4Desc: "Visualize relations by drawing holographic 3D connection lines between ideas, notes, and items.",
    futureTitle: "What's Coming in the Future?",
    futureDesc: "Our roadmap for the final desktop and cloud version:",
    future1Title: "Advanced Customization",
    future1Desc: "More room options, rich furniture, and decoration libraries.",
    future2Title: "Environmental Factors",
    future2Desc: "Moving beyond two rooms: spatial study environments with gardens and spacious outdoor areas.",
    future3Title: "Cloud Synchronization",
    future3Desc: "Cloud-based synchronization, account system, and instant backups.",
    future4Title: "AI Support",
    future4Desc: "AI that analyzes your notes and helps you organize your room.",
    future5Title: "Mobile & Desktop",
    future5Desc: "iOS and Android mobile versions alongside desktop (PC/Mac) applications.",
    earlyUserTitle: "Early Adopter Benefits",
    earlyUserDesc: "Users who provide feedback during the beta process can benefit from special advantages, discounts, and personalized surprise content (personalized room items, special decorative items, special themes or wall coverings) in the final version.",
    supportTitle: "Support Saray",
    supportDesc: "If you would like to support the completely independent development of Saray and contribute to our project, you can use the following support options:",
    support1Title: "Buy a Coffee",
    support1Desc: "You can support our motivation by buying the developer team a one-time small coffee.",
    support2Title: "Become a Patreon Patron",
    support2Desc: "You can speed up the development process by making monthly regular contributions and have special community roles.",
    support3Title: "Direct Funding",
    support3Desc: "You can contribute directly to the development budget via credit card or other secure payment methods.",
    supportSoon: "Active Soon",
    feedbackPrompt: "Share your suggestions and ideas here:",
    footerText: "This version is a test/MVP version. It will be developed as a desktop application based on feedback."
  },
  de: {
    badge: "🚀 Vorabzugang / Beta-Webversion",
    title: "Organisieren Sie Ihre Infos in einem 3D-Raum",
    desc: "Saray ist eine Desktop-orientierte Mind-Mapping-Anwendung, mit der Sie Ihre Notizen, Bilder und Verbindungen in einem 3D-Arbeitszimmer organisieren können.",
    betaMsg: '"Saray befindet sich derzeit in der Beta-Webversion. Die endgültige Desktop-App wird durch das Feedback der ersten Benutzer gestaltet."',
    openButton: "Saray öffnen",
    experienceWarning: "🖥️ Das beste Erlebnis haben Sie auf dem Computer. Optionaler mobiler Steuerungsmodus und Tablet-Unterstützung sind aktiv.",
    betaSectionTitle: "Was ist in der Beta enthalten?",
    betaSectionDesc: "Kernfunktionen, die in der aktuellen Webversion verfügbar sind:",
    card1Title: "2-Raum-Startsystem",
    card1Desc: "Beginnen Sie mit einem fertig eingerichteten Arbeitszimmer und einem leeren persönlichen Raum, den Sie nach Belieben anpassen können.",
    card2Title: "Notizen & Bilder an Wände hängen",
    card2Desc: "Fügen Sie Ihre Ideen, Pläne oder Bilder an einer beliebigen Wand des Raums ein und positionieren Sie sie frei.",
    card3Title: "Infos mit Gegenständen verknüpfen",
    card3Desc: "Integrieren Sie reichhaltige, mehrseitige Notizen in Schreibtische, Bücherregale und Dekorationsartikel im Arbeitszimmer.",
    card4Title: "3D-Verbindungen herstellen",
    card4Desc: "Visualisieren Sie Beziehungen, indem Sie holografische 3D-Verbindungslinien zwischen Ideen, Notizen und Gegenständen zeichnen.",
    futureTitle: "Was bringt die Zukunft?",
    futureDesc: "Unsere Roadmap für die endgültige Desktop- und Cloud-Version:",
    future1Title: "Erweiterte Anpassung",
    future1Desc: "Mehr Raumoptionen, reichhaltige Möbel- und Dekorationsbibliotheken.",
    future2Title: "Umweltfaktoren",
    future2Desc: "Über zwei Räume hinausgehen: räumliche Lernumgebungen mit Gärten und weitläufigen Außenbereichen.",
    future3Title: "Cloud-Synchronisation",
    future3Desc: "Cloud-basierte Synchronisierung, Kontosystem und sofortige Backups.",
    future4Title: "KI-Unterstützung",
    future4Desc: "KI, die Ihre Notizen analysiert und Ihnen hilft, Ihren Raum zu organisieren.",
    future5Title: "Mobil & Desktop",
    future5Desc: "iOS- und Android-Mobilversionen neben Desktop-Anwendungen (PC/Mac).",
    earlyUserTitle: "Vorteile für frühe Anwender",
    earlyUserDesc: "Benutzer, die während der Beta-Phase Feedback geben, können in der endgültigen Version von besonderen Vorteilen, Rabatten und personalisierten Überraschungsinhalten (personalisierte Raumgegenstände, spezielle Dekoartikel, spezielle Themen oder Wandverkleidungen) profitieren.",
    supportTitle: "Saray unterstützen",
    supportDesc: "Wenn Sie die völlig unabhängige Entwicklung von Saray unterstützen und zu unserem Projekt beitragen möchten, können Sie die folgenden Support-Optionen nutzen:",
    support1Title: "Einen Kaffee spendieren",
    support1Desc: "Sie können unsere Motivation unterstützen, indem Sie dem Entwicklerteam einen einmaligen kleinen Kaffee spendieren.",
    support2Title: "Patreon-Patron werden",
    support2Desc: "Sie können den Entwicklungsprozess durch monatliche regelmäßige Beiträge beschleunigen und spezielle Community-Rollen erhalten.",
    support3Title: "Direkte Finanzierung",
    support3Desc: "Sie können über Kreditkarte oder andere sichere Zahlungsmethoden direkt zum Entwicklungsbudget beitragen.",
    supportSoon: "Bald aktiv",
    feedbackPrompt: "Teilen Sie Ihre Vorschläge und Ideen hier:",
    footerText: "Diese Version ist eine Test-/MVP-Version. Sie wird basierend auf dem Feedback als Desktop-Anwendung weiterentwickelt."
  },
  it: {
    badge: "🚀 Accesso Anticipato / Versione Beta Web",
    title: "Organizza le tue informazioni in una stanza 3D",
    desc: "Saray è un'applicazione per mappe mentali orientata al desktop che ti consente di organizzare appunti, immagini e connessioni in uno studio 3D.",
    betaMsg: '"Saray è attualmente in versione beta web. L\'app desktop finale sarà modellata sui feedback dei primi utenti."',
    openButton: "Apri Saray",
    experienceWarning: "🖥️ La migliore esperienza si ottiene su computer. La modalità di controllo mobile e il supporto per tablet opzionali sono attivi.",
    betaSectionTitle: "Cosa c'è nella Beta?",
    betaSectionDesc: "Funzionalità principali disponibili nell'attuale versione web:",
    card1Title: "Sistema di partenza a 2 stanze",
    card1Desc: "Inizia con uno studio pre-arredato e una stanza personale vuota che puoi personalizzare a tuo piacimento.",
    card2Title: "Aggiungi note e immagini alle pareti",
    card2Desc: "Incolla le tue idee, piani o immagini su qualsiasi parete della stanza e posizionali liberamente.",
    card3Title: "Collega le info agli oggetti",
    card3Desc: "Integra note ricche e multipagina in scrivanie, librerie e oggetti decorativi nella stanza dello studio.",
    card4Title: "Crea connessioni 3D",
    card4Desc: "Visualizza le relazioni disegnando linee di connessione 3D olografiche tra idee, note e oggetti.",
    futureTitle: "Cosa riserva il futuro?",
    futureDesc: "La nostra tabella di marcia per la versione desktop e cloud finale:",
    future1Title: "Personalizzazione Avanzata",
    future1Desc: "Ulteriori opzioni di stanze, ricchi cataloghi di mobili e decorazioni.",
    future2Title: "Fattori Ambientali",
    future2Desc: "Andando oltre le due stanze: ambienti di studio spaziali con giardini e ampi spazi esterni.",
    future3Title: "Sincronizzazione Cloud",
    future3Desc: "Sincronizzazione basata su cloud, sistema di account e backup istantanei.",
    future4Title: "Supporto AI",
    future4Desc: "AI che analizza le tue note e ti aiuta a organizzare la tua stanza.",
    future5Title: "Mobile & Desktop",
    future5Desc: "Versioni mobili iOS e Android insieme ad applicazioni desktop (PC/Mac).",
    earlyUserTitle: "Vantaggi per i primi utenti",
    earlyUserDesc: "Gli utenti che forniscono feedback durante il processo beta possono beneficiare di vantaggi speciali, sconti e contenuti a sorpresa personalizzati (oggetti per stanze personalizzati, oggetti decorativi speciali, temi o rivestimenti murali speciali) nella versione finale.",
    supportTitle: "Supporta Saray",
    supportDesc: "Se desideri supportare lo sviluppo completamente indipendente di Saray e contribuire al nostro progetto, puoi utilizzare le seguenti opzioni di supporto:",
    support1Title: "Offri un caffè",
    support1Desc: "Puoi sostenere la nostra motivazione offrendo al team di sviluppo un piccolo caffè una tantum.",
    support2Title: "Diventa un patrono su Patreon",
    support2Desc: "Puoi accelerare il processo di sviluppo apportando contributi regolari mensili e ottenere ruoli speciali nella community.",
    support3Title: "Finanziamento Diretto",
    support3Desc: "Puoi contribuire direttamente al budget di sviluppo tramite carta di credito o altri metodi di pagamento sicuri.",
    supportSoon: "Attivo Presto",
    feedbackPrompt: "Condividi i tuoi suggerimenti e idee qui:",
    footerText: "Questa versione è una versione di test/MVP. Sarà sviluppata come applicazione desktop in base al feedback."
  },
  fr: {
    badge: "🚀 Accès Anticipé / Version Web Bêta",
    title: "Organisez vos informations dans une pièce 3D",
    desc: "Saray est une application de cartes mentales orientée bureau qui vous permet d'organiser vos notes, images et connexions dans un bureau d'étude 3D.",
    betaMsg: '"Saray est actuellement en version bêta web. L\'application de bureau finale sera façonnée par les retours des premiers utilisateurs."',
    openButton: "Ouvrir Saray",
    experienceWarning: "🖥️ La meilleure expérience est sur ordinateur. Le mode de contrôle mobile et le support pour tablette en option sont actifs.",
    betaSectionTitle: "Qu'y a-t-il dans la Bêta ?",
    betaSectionDesc: "Fonctionnalités clés disponibles dans la version web actuelle :",
    card1Title: "Système de départ à 2 pièces",
    card1Desc: "Commencez avec une salle d'étude pré-meublée et une pièce personnelle vide que vous pouvez personnaliser à votre guise.",
    card2Title: "Ajouter des notes et images aux murs",
    card2Desc: "Collez vos idées, plans ou images sur n'importe quel mur de la pièce et positionnez-les librement.",
    card3Title: "Lier des infos aux objets",
    card3Desc: "Intégrez des notes riches de plusieurs pages dans les bureaux, les bibliothèques et les objets de décoration du bureau d'étude.",
    card4Title: "Créer des connexions 3D",
    card4Desc: "Visualisez les relations en traçant des lignes de connexion 3D holographiques entre les idées, les notes et les objets.",
    futureTitle: "Que réserve l'avenir ?",
    futureDesc: "Notre feuille de route pour la version finale de bureau et cloud :",
    future1Title: "Personnalisation Avancée",
    future1Desc: "Plus d'options de pièces, de riches bibliothèques de meubles et de décorations.",
    future2Title: "Facteurs Environnementaux",
    future2Desc: "Aller au-delà de deux pièces : environnements d'étude spatiaux avec jardins et grands espaces extérieurs.",
    future3Title: "Synchronisation Cloud",
    future3Desc: "Synchronisation basée sur le cloud, système de compte et sauvegardes instantanées.",
    future4Title: "Support IA",
    future4Desc: "Une IA qui analyse vos notes et vous aide à organiser votre pièce.",
    future5Title: "Mobile & Bureau",
    future5Desc: "Versions mobiles iOS et Android aux côtés d'applications de bureau (PC/Mac).",
    earlyUserTitle: "Avantages pour les premiers utilisateurs",
    earlyUserDesc: "Les utilisateurs qui fournissent des retours pendant le processus bêta peuvent bénéficier d'avantages spéciaux, de réductions et de contenus surprises personnalisés (objets de pièce personnalisés, objets décoratifs spéciaux, thèmes ou revêtements muraux spéciaux) dans la version finale.",
    supportTitle: "Soutenir Saray",
    supportDesc: "Si vous souhaitez soutenir le développement entièrement indépendant de Saray et contribuer à notre projet, vous pouvez utiliser les options de soutien suivantes :",
    support1Title: "Offrir un café",
    support1Desc: "Vous pouvez soutenir notre motivation en offrant à l'équipe de développement un petit café unique.",
    support2Title: "Devenir parrain sur Patreon",
    support2Desc: "Vous pouvez accélérer le processus de développement en apportant des contributions régulières mensuelles et obtenir des rôles communautaires spéciaux.",
    support3Title: "Financement Direct",
    support3Desc: "Vous pouvez contribuer directement au budget de développement via carte de crédit ou d'autres méthodes de paiement sécurisées.",
    supportSoon: "Actif Bientôt",
    feedbackPrompt: "Partagez vos suggestions et idées ici :",
    footerText: "Cette version est une version de test/MVP. Elle sera développée sous forme d'application de bureau en fonction des retours."
  }
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState(() => localStorage.getItem('ui_theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('saray_lang') || 'tr');

  // Synchronize path state with browser history (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('saray_lang', lang);
  }, [lang]);

  // Theme synchronization with document body class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('ui_theme', theme);
  }, [theme]);

  // Navigate function that pushes history state
  const navigate = (toPath) => {
    window.history.pushState({}, '', toPath);
    setPath(toPath);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;

  // Route: /app
  if (path === '/app') {
    return <SarayApp />;
  }

  // Route: / (Landing Page)
  return (
    <div className="landing-container" style={{
      width: '100vw',
      height: '100vh',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-color)',
      color: 'var(--text-main)',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '24px 40px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass style={{ color: 'var(--primary)', width: '28px', height: '28px' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--theme-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SARAY
          </span>
        </div>

        {/* Language Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: 'auto',
          marginRight: '12px',
          background: 'var(--button-bg-secondary)',
          border: '1px solid var(--panel-border)',
          borderRadius: '20px',
          padding: '2px 4px',
          height: '36px'
        }}>
          {['tr', 'en', 'de', 'it', 'fr'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                background: lang === l ? 'var(--primary)' : 'transparent',
                color: lang === l ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '14px',
                padding: '4px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '28px'
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--button-bg-secondary)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-main)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)'
          }}
          title={theme === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç'}
        >
          {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '8px 20px',
          borderRadius: '20px',
          marginBottom: '28px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'inline-block'
        }}>
          {t.badge}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--text-main) 30%, var(--theme-accent-muted) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t.title}
        </h1>

        <p style={{
          fontSize: '1.25rem',
          lineHeight: 1.6,
          color: 'var(--text-muted)',
          marginBottom: '20px',
          maxWidth: '700px'
        }}>
          {t.desc}
        </p>

        <p style={{
          fontSize: '1rem',
          lineHeight: 1.5,
          color: 'var(--theme-accent-muted)',
          marginBottom: '36px',
          maxWidth: '640px',
          fontStyle: 'italic'
        }}>
          {t.betaMsg}
        </p>

        {/* Call to Action */}
        <div style={{ marginBottom: '60px' }}>
          <button 
            data-testid="open-saray-button"
            onClick={() => navigate('/app')}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '18px 44px',
              fontSize: '1.15rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 30px var(--primary-glow)',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '0 auto'
            }}
          >
            {t.openButton} <Compass size={18} />
          </button>
          <span style={{
            display: 'block',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginTop: '14px',
            fontWeight: 500
          }}>
            {t.experienceWarning}
          </span>
        </div>

        {/* Beta Sürecinde Neler Var? */}
        <div style={{ width: '100%', marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '12px',
            color: 'var(--text-main)'
          }}>
            {t.betaSectionTitle}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            {t.betaSectionDesc}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Card 1 */}
            <div className="glass-panel" style={{
              padding: '24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🏠</span> {t.card1Title}
              </h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
                {t.card1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel" style={{
              padding: '24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📝</span> {t.card2Title}
              </h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
                {t.card2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel" style={{
              padding: '24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📦</span> {t.card3Title}
              </h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
                {t.card3Desc}
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-panel" style={{
              padding: '24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🔗</span> {t.card4Title}
              </h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
                {t.card4Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Gelecekte Neler Gelecek? */}
        <div style={{ width: '100%', marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '12px',
            color: 'var(--text-main)'
          }}>
            {t.futureTitle}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            {t.futureDesc}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Future Item 1 */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎨</div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 700 }}>{t.future1Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{t.future1Desc}</p>
            </div>

            {/* Future Item 2 */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌿</div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 700 }}>{t.future2Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{t.future2Desc}</p>
            </div>

            {/* Future Item 3 */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>☁️</div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 700 }}>{t.future3Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{t.future3Desc}</p>
            </div>

            {/* Future Item 4 */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 700 }}>{t.future4Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{t.future4Desc}</p>
            </div>

            {/* Future Item 5 */}
            <div style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📱</div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontWeight: 700 }}>{t.future5Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{t.future5Desc}</p>
            </div>
          </div>
        </div>

        {/* Erken Kullanıcı Avantajları */}
        <div style={{
          width: '100%',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            🌟 {t.earlyUserTitle}
          </h3>
          <p style={{
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            margin: 0,
            maxWidth: '800px'
          }}>
            {t.earlyUserDesc}
          </p>
        </div>

        {/* Destek Bölümü */}
        <div style={{
          width: '100%',
          marginTop: '40px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '12px',
            color: 'var(--text-main)'
          }}>
            💖 {t.supportTitle}
          </h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '640px', margin: '0 auto 28px auto' }}>
            {t.supportDesc}
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            width: '100%'
          }}>
            {/* Destek Seçeneği 1 */}
            <div style={{
              flex: '1 1 280px',
              maxWidth: '320px',
              padding: '24px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: 0.85
            }}>
              <div style={{ fontSize: '1.8rem' }}>☕</div>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>{t.support1Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {t.support1Desc}
              </p>
              <button disabled style={{
                marginTop: 'auto',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'not-allowed'
              }}>
                {t.supportSoon}
              </button>
            </div>

            {/* Destek Seçeneği 2 */}
            <div style={{
              flex: '1 1 280px',
              maxWidth: '320px',
              padding: '24px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: 0.85
            }}>
              <div style={{ fontSize: '1.8rem' }}>🌟</div>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>{t.support2Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {t.support2Desc}
              </p>
              <button disabled style={{
                marginTop: 'auto',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'not-allowed'
              }}>
                {t.supportSoon}
              </button>
            </div>

            {/* Destek Seçeneği 3 */}
            <div style={{
              flex: '1 1 280px',
              maxWidth: '320px',
              padding: '24px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: '12px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: 0.85
            }}>
              <div style={{ fontSize: '1.8rem' }}>💳</div>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>{t.support3Title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {t.support3Desc}
              </p>
              <button disabled style={{
                marginTop: 'auto',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'not-allowed'
              }}>
                {t.supportSoon}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '40px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--panel-border)',
        width: '100%',
        maxWidth: '1200px',
        margin: '60px auto 0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {t.feedbackPrompt}
          </p>
          <a 
            href="mailto:asujai964@gmail.com" 
            style={{ 
              color: 'var(--primary)', 
              textDecoration: 'none', 
              fontSize: '1rem', 
              fontWeight: 700,
              letterSpacing: '0.5px',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#4f46e5'}
            onMouseOut={(e) => e.target.style.color = 'var(--primary)'}
          >
            ✉️ asujai964@gmail.com
          </a>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8, lineHeight: 1.5 }}>
          {t.footerText}
        </p>
      </footer>
    </div>
  );
}
