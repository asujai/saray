// Hologram dashboard integration active
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Room from './components/Room';
import Player from './components/Player';
import Note3D from './components/Note3D';
import PlacedItem3D from './components/PlacedItem3D';
import UIOverlay from './components/UIOverlay';
import NoteDashboard from './components/NoteDashboard';
import CrosshairRaycaster from './components/CrosshairRaycaster';
import { getAllNotes, saveAllNotesToDB, initDB } from './utils/db';
import MiniMapTracker from './components/MiniMapTracker';
import { QuadraticBezierLine } from '@react-three/drei';

function PlayerRoomTracker({ getRoomIdFromPosition, onRoomChange }) {
  const { camera } = useThree();
  const lastRoomRef = useRef(null);
  
  useFrame(() => {
    const roomId = getRoomIdFromPosition(camera.position.x, camera.position.z);
    if (roomId !== lastRoomRef.current) {
      lastRoomRef.current = roomId;
      onRoomChange(roomId);
    }
  });
  
  return null;
}

const LOCAL_STORAGE_KEY = 'saray_3d_mindmap_notes';

const getPresetItems = (lang = 'tr') => {
  const isEn = lang === 'en';
  return [
    {
      id: "preset_item_desk",
      type: "desk",
      source: "preset",
      roomId: "study",
      position: { x: 15, y: 0.005, z: 9 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#a1a1aa",
      linkedNote: {
        title: isEn ? "Main Study Area" : "Ana Çalışma Alanı",
        pages: [{ text: isEn ? "You can use this desk for your active study topics." : "Bu masayı aktif çalıştığın konular için kullanabilirsin.", image: null, layout: 'image-top-text-bottom' }],
        currentPageIndex: 0,
        iconType: "info",
        tags: [isEn ? "Study" : "Çalışma"]
      },
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_chair",
      type: "chair",
      source: "preset",
      roomId: "study",
      position: { x: 15, y: 0.005, z: 10.2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#3f3f46",
      linkedNote: null,
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_shelf",
      type: "shelf",
      source: "preset",
      roomId: "study",
      position: { x: 23.5, y: 0.005, z: 15 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      scale: [1, 1, 1],
      color: "#71717a",
      linkedNote: {
        title: isEn ? "Resources" : "Kaynaklar",
        pages: [{ text: isEn ? "You can link books, articles, videos, and research resources to this area." : "Kitap, makale, video ve araştırma kaynaklarını bu alana bağlayabilirsin.", image: null, layout: 'image-top-text-bottom' }],
        currentPageIndex: 0,
        iconType: "info",
        tags: [isEn ? "Resource" : "Kaynak"]
      },
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_board",
      type: "board",
      source: "preset",
      roomId: "study",
      position: { x: 15, y: 1.5, z: 6.2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#d97706",
      linkedNote: {
        title: isEn ? "Beginning" : "Başlangıç",
        pages: [{ text: isEn ? "Write your first main idea here. Then associate other notes with this idea." : "Buraya ilk ana fikrini yaz. Sonra diğer notları bu fikirle ilişkilendir.", image: null, layout: 'image-top-text-bottom' }],
        currentPageIndex: 0,
        iconType: "info",
        tags: [isEn ? "Beginning" : "Başlangıç"]
      },
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_plant",
      type: "plant",
      source: "preset",
      roomId: "study",
      position: { x: 23.2, y: 0.005, z: 7.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#22c55e",
      linkedNote: null,
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_lamp",
      type: "lamp",
      source: "preset",
      roomId: "study",
      position: { x: 7.5, y: 0.005, z: 7.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#eab308",
      linkedNote: null,
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_wallshelf",
      type: "wallshelf",
      source: "preset",
      roomId: "study",
      position: { x: 23.5, y: 1.5, z: 9 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      scale: [1, 1, 1],
      color: "#52525b",
      linkedNote: {
        title: isEn ? "Short Ideas" : "Kısa Fikirler",
        pages: [{ text: isEn ? "You can keep undeveloped ideas here." : "Henüz tam gelişmemiş fikirleri burada tutabilirsin.", image: null, layout: 'image-top-text-bottom' }],
        currentPageIndex: 0,
        iconType: "info",
        tags: [isEn ? "Idea" : "Fikir"]
      },
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_rug",
      type: "rug",
      source: "preset",
      roomId: "study",
      position: { x: 15, y: 0.001, z: 13.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#e4e4e7",
      linkedNote: null,
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "preset_item_library_shelf",
      type: "libraryShelf",
      source: "preset",
      roomId: "study",
      position: { x: 9.5, y: 0.005, z: 1.2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: "#5c4033",
      books: [
        {
          bookId: "preset_book_1",
          shelfId: "preset_item_library_shelf",
          slotIndex: 2,
          spineLabel: "Fikir",
          color: "#ef4444",
          linkedNote: {
            title: isEn ? "My Ideas" : "Fikirlerim",
            pages: [{ text: isEn ? "Write your creative ideas here." : "Yaratıcı fikirlerini buraya yazabilirsin.", image: null, layout: 'image-top-text-bottom' }],
            currentPageIndex: 0,
            tags: [isEn ? "Idea" : "Fikir"]
          }
        },
        {
          bookId: "preset_book_2",
          shelfId: "preset_item_library_shelf",
          slotIndex: 3,
          spineLabel: "AI",
          color: "#3b82f6",
          linkedNote: {
            title: isEn ? "Artificial Intelligence" : "Yapay Zeka",
            pages: [{ text: isEn ? "Notes about AI developments and models." : "Yapay zeka modelleri ve gelişmeleri üzerine notlar.", image: null, layout: 'image-top-text-bottom' }],
            currentPageIndex: 0,
            tags: ["AI"]
          }
        }
      ],
      linkedNote: null,
      isRemovable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

export default function SarayApp() {
  const [notes, setNotes] = useState([]);
  const [lastAction, setLastAction] = useState('app-loaded');
  const [crosshairHovered, setCrosshairHovered] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const toastTimeoutRef = useRef(null);
  const [lang, setLang] = useState(() => localStorage.getItem('saray_app_lang') || 'tr');

  const [activeBookId, setActiveBookId] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookModalMode, setBookModalMode] = useState('add');
  const [bookModalData, setBookModalData] = useState(null);

  useEffect(() => {
    localStorage.setItem('saray_app_lang', lang);
  }, [lang]);

  const showSavedToast = (message = '✓ Kaydedildi') => {
    let finalMessage = message;
    if (lang === 'en') {
      const translationMap = {
        '📥 Atrium 3D Yedeği başarıyla oluşturuldu ve indirildi!': '📥 Atrium 3D Backup successfully created and downloaded!',
        '📤 Yedek başarıyla yüklendi! Sayfa yenileniyor...': '📤 Backup successfully loaded! Page is reloading...',
        '✓ Oda adı kaydedildi': '✓ Room name saved',
        '✓ Oda rengi kaydedildi': '✓ Room color saved',
        '✓ Özelleştirmeler sıfırlandı': '✓ Customizations reset',
        '✓ Hazır Oda Tasarımı Yüklendi': '✓ Preset Room Design Loaded',
        '✓ Çalışma Odası Boşaltıldı': '✓ Study Room Emptied',
        '✓ Eşya silindi': '✓ Item deleted',
        '⚠️ Bağlantı modu aktifken eşya düzenlenemez': '⚠️ Cannot edit items while connection mode is active',
        '✓ Eşya düzenlemesi kaydedildi': '✓ Item edit saved',
        '✓ Değişiklikler iptal edildi': '✓ Changes cancelled',
        '✓ Not kaydedildi': '✓ Note saved',
        '✓ Not silindi': '✓ Note deleted',
        '✓ Geliştirici Modu & Uçuş Aktif': '✓ Developer Mode & Flight Active',
        '✓ Geliştirici Modu Kapatıldı': '✓ Developer Mode Disabled',
        '✓ Hızlı not oluşturuldu': '✓ Quick note created',
        '⚠️ Hızlı not için duvara bakın': '⚠️ Look at a wall to create a quick note',
        '⚠️ Aynı öğeler bağlanamaz': '⚠️ Cannot connect same items',
        '⚠️ Bu bağlantı zaten mevcut': '⚠️ This connection already exists',
        '✓ Bağlantı oluşturuldu': '✓ Connection created',
        '✓ Bağlantı modu iptal edildi': '✓ Connection mode cancelled',
        '✓ Bağlantı silindi': '✓ Connection deleted',
        '⚠️ Aynı isimde bir kavram zaten var': '⚠️ A concept with the same name already exists',
        '✓ Yeni kavram eklendi': '✓ New concept added',
        '✓ Kavram güncellendi': '✓ Concept updated',
        '⚠️ Genel kavramı silinemez': '⚠️ General concept cannot be deleted',
        '✓ Kavram silindi ve bağlantıları Genel\'e taşındı': '✓ Concept deleted and connections moved to General',
        '✓ Konsept değiştirildi': '✓ Concept changed'
      };

      // Check if message starts with warning or info prefixes containing dynamic room names
      if (message.startsWith('📍 Eşya ') && message.includes(' odasında parlıyor!')) {
        const roomPart = message.replace('📍 Eşya ', '').replace(' odasında parlıyor!', '');
        finalMessage = `📍 Item is flashing in ${roomPart}!`;
      } else if (message.startsWith('📍 Not ') && message.includes(' odasında parlıyor!')) {
        const roomPart = message.replace('📍 Not ', '').replace(' odasında parlıyor!', '');
        finalMessage = `📍 Note is flashing in ${roomPart}!`;
      } else if (translationMap[message]) {
        finalMessage = translationMap[message];
      }
    }
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message: finalMessage });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2000);
  };
  const [isLoaded, setIsLoaded] = useState(false);
  const [movementMode, setMovementMode] = useState('walk'); // 'walk' or 'fly'
  const [cameraView, setCameraView] = useState('third'); // 'third' or 'first'
  const [isAddMode, setIsAddMode] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false); // New state to control large editor modal visibility
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [flashedNoteId, setFlashedNoteId] = useState(null);
  const [flashedItemId, setFlashedItemId] = useState(null);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const [editorMode, setEditorMode] = useState('note'); // 'note' or 'item'
  const [allowQuickTravel, setAllowQuickTravel] = useState(() => localStorage.getItem('saray_allow_quick_travel') === 'true');
  const [freeFlightEnabled, setFreeFlightEnabled] = useState(true);
  const [devMode, setDevMode] = useState(() => localStorage.getItem('saray_dev_mode_enabled') === 'true');
  const [highlightedRoomId, setHighlightedRoomId] = useState(null);
  const highlightTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('saray_mindmap_theme') || 'minimal');
  const [uiTheme, setUiTheme] = useState(() => localStorage.getItem('saray_ui_theme') || 'dark');
  const [footballThemeActive, setFootballThemeActive] = useState(() => localStorage.getItem('saray_football_theme') === 'true');
  const [kitchenPatternActive, setKitchenPatternActive] = useState(() => localStorage.getItem('saray_kitchen_pattern') === 'true');
  const [wallCustomizations, setWallCustomizations] = useState(() => {
    const saved = localStorage.getItem('saray_wall_customizations');
    return saved ? JSON.parse(saved) : {};
  });
  const [mobileControlsEnabled, setMobileControlsEnabled] = useState(() => localStorage.getItem('saray_mobile_controls_enabled') === 'true');
  const [currentPlayerRoomId, setCurrentPlayerRoomId] = useState('study');
  const [selectedStudyNotes, setSelectedStudyNotes] = useState([]);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(-1);

  useEffect(() => {
    localStorage.setItem('saray_mobile_controls_enabled', mobileControlsEnabled);
  }, [mobileControlsEnabled]);



  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${uiTheme}-theme`);
    localStorage.setItem('saray_ui_theme', uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    localStorage.setItem('saray_football_theme', footballThemeActive ? 'true' : 'false');
  }, [footballThemeActive]);

  useEffect(() => {
    localStorage.setItem('saray_kitchen_pattern', kitchenPatternActive ? 'true' : 'false');
  }, [kitchenPatternActive]);

  useEffect(() => {
    localStorage.setItem('saray_wall_customizations', JSON.stringify(wallCustomizations));
  }, [wallCustomizations]);

  // Eşya yerleştirme sistemi state'leri
  const [placedItems, setPlacedItems] = useState(() => {
    const saved = localStorage.getItem('saray_placed_items');
    const presetInitialized = localStorage.getItem('saray_preset_rooms_initialized');
    const currentLang = localStorage.getItem('saray_app_lang') || 'tr';
    if (!saved) {
      if (!presetInitialized) {
        return getPresetItems(currentLang);
      }
      return [];
    }
    try {
      const items = JSON.parse(saved);
      return items.map(item => {
        let pos = item.position;
        if (Array.isArray(pos)) {
          pos = { x: pos[0] ?? 0, y: pos[1] ?? 0, z: pos[2] ?? 0 };
        } else if (!pos) {
          pos = { x: 0, y: 0, z: 0 };
        }
        let rot = item.rotation;
        if (Array.isArray(rot)) {
          rot = { x: rot[0] ?? 0, y: rot[1] ?? 0, z: rot[2] ?? 0 };
        } else if (!rot) {
          rot = { x: 0, y: 0, z: 0 };
        }
        return { ...item, position: pos, rotation: rot };
      });
    } catch {
      return [];
    }
  });

  const [activeItemId, setActiveItemId] = useState(null);
  const [isItemEditingActive, setIsItemEditingActive] = useState(false);
  const [editingItemBackup, setEditingItemBackup] = useState(null);
  const playerPositionRef = useRef([0, 1.6, 5]);
  const playerDirectionRef = useRef([0, 0, -1]);

  useEffect(() => {
    localStorage.setItem('saray_placed_items', JSON.stringify(placedItems));
  }, [placedItems]);

  useEffect(() => {
    localStorage.setItem('saray_mindmap_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('saray_allow_quick_travel', allowQuickTravel);
  }, [allowQuickTravel]);

  useEffect(() => {
    localStorage.setItem('saray_free_flight_enabled', freeFlightEnabled);
  }, [freeFlightEnabled]);

  useEffect(() => {
    localStorage.setItem('saray_dev_mode_enabled', devMode);
  }, [devMode]);



  const triggerHighlight = (roomId) => {
    if (!roomId || roomId === 'unknown') return;
    setHighlightedRoomId(roomId);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedRoomId(null);
    }, 8000);
  };

  const envConfig = useMemo(() => {
    switch (theme) {
      case 'library':
        return {
          bgColor: '#ebd9c0', // Sıcak krem tonu
          fogNear: 35,
          fogFar: 95,
          outerFloorColor: '#c2b3a1', // Kütüphane bahçesi / toprak tonu
          leafColor: '#854d0e', // Sonbahar tonlarında yaprak rengi
        };
      case 'sci-fi':
        return {
          bgColor: '#060810', // Karanlık neon atmosfer
          fogNear: 35,
          fogFar: 95,
          outerFloorColor: '#0c101d', // Koyu metalik mavi/mor
          leafColor: '#00f0ff', // Hologram cyan çalı rengi
        };
      case 'minimal':
      default:
        return {
          bgColor: '#e2e8f0', // Pastel tatlı gri-mavi
          fogNear: 35,
          fogFar: 95,
          outerFloorColor: '#cbd5e1', // Temiz minimalist gri zemin
          leafColor: '#10b981', // Canlı minimalist yeşil çalı
        };
    }
  }, [theme]);

  // Oda isimleri ve renk özelleştirme state'leri
  const [roomNames, setRoomNames] = useState(() => {
    const saved = localStorage.getItem('saray_room_names');
    const currentLang = localStorage.getItem('saray_app_lang') || 'tr';
    if (saved) return JSON.parse(saved);
    
    return currentLang === 'en' ? {
      hall: 'Entrance / Hall',
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      study: 'Study Room',
      living: 'Living Room'
    } : {
      hall: 'Giriş / Hol',
      bedroom: 'Yatak Odası',
      kitchen: 'Mutfak',
      study: 'Çalışma Odası',
      living: 'Salon'
    };
  });

  useEffect(() => {
    setRoomNames((prev) => {
      const newNames = { ...prev };
      const defaultTr = {
        hall: 'Giriş / Hol',
        bedroom: 'Yatak Odası',
        kitchen: 'Mutfak',
        study: 'Çalışma Odası',
        living: 'Salon'
      };
      const defaultEn = {
        hall: 'Entrance / Hall',
        bedroom: 'Bedroom',
        kitchen: 'Kitchen',
        study: 'Study Room',
        living: 'Living Room'
      };

      Object.keys(prev).forEach((key) => {
        if (lang === 'en' && (prev[key] === defaultTr[key] || !prev[key])) {
          newNames[key] = defaultEn[key];
        } else if (lang === 'tr' && (prev[key] === defaultEn[key] || !prev[key])) {
          newNames[key] = defaultTr[key];
        }
      });
      return newNames;
    });
  }, [lang]);

  const [roomFloorColors, setRoomFloorColors] = useState(() => {
    const saved = localStorage.getItem('saray_room_floor_colors');
    return saved ? JSON.parse(saved) : {
      hall: null,
      bedroom: null,
      kitchen: null,
      study: null,
      living: null
    };
  });

  const [roomWallColors, setRoomWallColors] = useState(() => {
    const saved = localStorage.getItem('saray_room_wall_colors');
    return saved ? JSON.parse(saved) : {
      hall: null,
      bedroom: null,
      kitchen: null,
      study: null,
      living: null
    };
  });

  useEffect(() => {
    localStorage.setItem('saray_room_names', JSON.stringify(roomNames));
  }, [roomNames]);

  useEffect(() => {
    localStorage.setItem('saray_room_floor_colors', JSON.stringify(roomFloorColors));
  }, [roomFloorColors]);

  useEffect(() => {
    localStorage.setItem('saray_room_wall_colors', JSON.stringify(roomWallColors));
  }, [roomWallColors]);

  // --- 3D Bağlantı (İlişki) ve Kavram Yönetim State'leri ---
  const [connections, setConnections] = useState(() => {
    const saved = localStorage.getItem('saray_connections');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(c => ({
        ...c,
        isVisible: c.isVisible ?? true,
        conceptId: c.conceptId || 'concept_general',
        label: c.label || '',
        fromType: c.fromType || (c.fromId?.startsWith('note_') ? 'note' : 'item'),
        toType: c.toType || (c.toId?.startsWith('note_') ? 'note' : 'item')
      }));
    } catch {
      return [];
    }
  });

  const [connectionConcepts, setConnectionConcepts] = useState(() => {
    const saved = localStorage.getItem('saray_connection_concepts');
    if (!saved) return [
      { id: "concept_general", name: "Genel", color: "#00f0ff" },
      { id: "concept_idea", name: "Fikir", color: "#a78bfa" },
      { id: "concept_source", name: "Kaynak", color: "#60a5fa" },
      { id: "concept_task", name: "Görev", color: "#facc15" },
      { id: "concept_cause", name: "Sebep-Sonuç", color: "#fb923c" },
      { id: "concept_continue", name: "Devamı", color: "#4ade80" },
      { id: "concept_compare", name: "Karşılaştırma", color: "#f472b6" }
    ];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [pendingConnectionSource, setPendingConnectionSource] = useState(null);
  const [pendingConnectionTarget, setPendingConnectionTarget] = useState(null);
  const [isConceptSelectOpen, setIsConceptSelectOpen] = useState(false);
  const [connectionVisibilityMode, setConnectionVisibilityMode] = useState(() => {
    return localStorage.getItem('saray_connection_visibility_mode') || 'selected-only';
  });

  useEffect(() => {
    localStorage.setItem('saray_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('saray_connection_concepts', JSON.stringify(connectionConcepts));
  }, [connectionConcepts]);

  useEffect(() => {
    localStorage.setItem('saray_connection_visibility_mode', connectionVisibilityMode);
  }, [connectionVisibilityMode]);

  const handleExportBackup = async () => {
    try {
      const dbNotes = await getAllNotes();
      
      const keys = [
        'saray_allow_quick_travel',
        'saray_free_flight_enabled',
        'saray_dev_mode_enabled',
        'saray_mindmap_theme',
        'saray_ui_theme',
        'saray_football_theme',
        'saray_mobile_controls_enabled',
        'saray_placed_items',
        'saray_preset_rooms_initialized',
        'saray_room_names',
        'saray_room_floor_colors',
        'saray_room_wall_colors',
        'saray_connections',
        'saray_connection_concepts',
        'saray_connection_visibility_mode'
      ];
      
      const localStorageData = {};
      keys.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          localStorageData[key] = val;
        }
      });
      
      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        localStorageData,
        indexedDbData: {
          notes: dbNotes
        }
      };
      
      const jsonString = JSON.stringify(backupData);
      const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const fileName = `atrium3d-yedek-${year}-${month}-${day}.saray`;
      
      const blob = new Blob([encodedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSavedToast('📥 Atrium 3D Yedeği başarıyla oluşturuldu ve indirildi!');
      setLastAction('backup-exported');
    } catch (err) {
      console.error('Yedek alma hatası:', err);
      alert('Yedek alınırken bir hata oluştu: ' + err.message);
    }
  };

  const handleImportBackup = async (fileContent) => {
    try {
      if (!fileContent || typeof fileContent !== 'string') {
        throw new Error('Dosya içeriği boş veya geçersiz.');
      }
      
      let decodedString;
      try {
        decodedString = decodeURIComponent(escape(atob(fileContent)));
      } catch (e) {
        throw new Error('Dosya formatı geçersiz. Lütfen doğru .saray yedek dosyasını seçtiğinizden emin olun.');
      }
      
      const backupData = JSON.parse(decodedString);
      
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Yedek verisi geçersiz.');
      }
      
      if (!backupData.localStorageData || !backupData.indexedDbData) {
        throw new Error('Yedek içeriği eksik veya bozuk.');
      }
      
      // Write LocalStorage
      Object.entries(backupData.localStorageData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // Write IndexedDB Notes
      const notes = backupData.indexedDbData.notes || [];
      await saveAllNotesToDB(notes);
      
      showSavedToast('📤 Yedek başarıyla yüklendi! Sayfa yenileniyor...');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Yedek yükleme hatası:', err);
      alert('Yedek yüklenirken bir hata oluştu: ' + err.message);
    }
  };

  const handleSetIsAddMode = (val) => {
    if (val && pendingConnectionSource) {
      handleCancelConnection();
    }
    setIsAddMode(val);
  };

  const handleUpdateRoomName = (roomId, newName) => {
    setRoomNames((prev) => ({ ...prev, [roomId]: newName }));
    showSavedToast('✓ Oda adı kaydedildi');
  };

  const handleUpdateRoomFloorColor = (roomId, color) => {
    setRoomFloorColors((prev) => ({ ...prev, [roomId]: color }));
    showSavedToast('✓ Oda rengi kaydedildi');
  };

  const handleUpdateRoomWallColor = (roomId, color) => {
    setRoomWallColors((prev) => ({ ...prev, [roomId]: color }));
    showSavedToast('✓ Oda rengi kaydedildi');
  };

  const handleResetColors = () => {
    setRoomFloorColors({
      hall: null,
      bedroom: null,
      kitchen: null,
      study: null,
      living: null
    });
    setRoomWallColors({
      hall: null,
      bedroom: null,
      kitchen: null,
      study: null,
      living: null
    });
    showSavedToast('✓ Özelleştirmeler sıfırlandı');
  };

  const handleLoadPresetTemplate = async () => {
    const isEn = lang === 'en';
    setPlacedItems((prev) => {
      const filtered = prev.filter(item => item.roomId !== 'study');
      const updated = [...filtered, ...getPresetItems(lang)];
      localStorage.setItem('saray_placed_items', JSON.stringify(updated));
      return updated;
    });

    const studyWalls = [
      'wall_front_study', 
      'wall_right_study', 
      'wall_inner_right_division',
      'wall_inner_right_division_study',
      'wall_inner_right_hall_study_mid',
      'wall_inner_right_hall_study_upper',
      'wall_inner_right_hall_lintel2_study'
    ];
    try {
      let dbNotes = await getAllNotes();
      dbNotes = dbNotes.filter(n => !studyWalls.includes(n.wallId));

      const defaultColor = theme === 'library' ? '#fef9c3' : theme === 'sci-fi' ? '#00f0ff' : '#fef08a';
      const presetNotes = [
        {
          id: 'note_preset_1',
          wallId: 'wall_inner_right_division',
          position: [15, 1.8, 0.02],
          rotation: [0, 0, 0],
          width: 0.7,
          height: 0.7,
          title: isEn ? "Today's Focus" : "Bugünkü Odak",
          pages: [{ text: isEn ? "Write the main topic you will study today here. Divide big topics into small notes." : "Bugün çalışacağın ana konuyu buraya yaz. Büyük konuları küçük notlara böl.", image: null, layout: 'image-top-text-bottom' }],
          currentPageIndex: 0,
          color: defaultColor,
          tags: [isEn ? "Task" : "Görev"]
        },
        {
          id: 'note_preset_2',
          wallId: 'wall_right_study',
          position: [24.98, 1.8, 11],
          rotation: [0, -Math.PI / 2, 0],
          width: 0.7,
          height: 0.7,
          title: isEn ? "Resource List" : "Kaynak Listesi",
          pages: [{ text: isEn ? "You can gather books you read, videos you watch, or research links here." : "Okuduğun kitapları, izlediğin videoları veya araştırma linklerini burada toplayabilirsin.", image: null, layout: 'image-top-text-bottom' }],
          currentPageIndex: 0,
          color: defaultColor,
          tags: [isEn ? "Resource" : "Kaynak"]
        },
        {
          id: 'note_preset_3',
          wallId: 'wall_front_study',
          position: [10, 1.8, 24.98],
          rotation: [0, Math.PI, 0],
          width: 0.7,
          height: 0.7,
          title: isEn ? "Idea Space" : "Fikir Alanı",
          pages: [{ text: isEn ? "Quickly add ideas that come to your mind here. You can connect them to other notes later with connections." : "Aklına gelen fikirleri hızlıca buraya ekle. Daha sonra bağlantılarla diğer notlara bağlayabilirsin.", image: null, layout: 'image-top-text-bottom' }],
          currentPageIndex: 0,
          color: defaultColor,
          tags: [isEn ? "Idea" : "Fikir"]
        }
      ];

      const existingIds = new Set(dbNotes.map(n => n.id));
      const notesToAppend = presetNotes.filter(n => !existingIds.has(n.id));
      const finalNotes = [...dbNotes, ...notesToAppend];
      
      await saveAllNotesToDB(finalNotes);
      setNotes(finalNotes);
    } catch (err) {
      console.error('Şablon notları yüklenirken hata:', err);
    }

    localStorage.setItem('saray_preset_rooms_initialized', 'true');
    showSavedToast('✓ Hazır Oda Tasarımı Yüklendi');
  };

  const handleClearRoomTemplate = async () => {
    setPlacedItems((prev) => {
      const filtered = prev.filter(item => item.roomId !== 'study');
      localStorage.setItem('saray_placed_items', JSON.stringify(filtered));
      return filtered;
    });

    const studyWalls = [
      'wall_front_study', 
      'wall_right_study', 
      'wall_inner_right_division',
      'wall_inner_right_division_study',
      'wall_inner_right_hall_study_mid',
      'wall_inner_right_hall_study_upper',
      'wall_inner_right_hall_lintel2_study'
    ];
    try {
      let dbNotes = await getAllNotes();
      const filteredNotes = dbNotes.filter(n => !studyWalls.includes(n.wallId));
      await saveAllNotesToDB(filteredNotes);
      setNotes(filteredNotes);
    } catch (err) {
      console.error('Oda temizlenirken hata:', err);
    }

    showSavedToast('✓ Çalışma Odası Boşaltıldı');
  };

  const handleClearRoomData = async (roomId, type) => {
    if (type === 'objects' || type === 'all') {
      setPlacedItems((prev) => {
        const filtered = prev.filter(item => item.roomId !== roomId);
        localStorage.setItem('saray_placed_items', JSON.stringify(filtered));
        return filtered;
      });
    }

    if (type === 'notes' || type === 'all') {
      const roomWallsMap = {
        kitchen: [
          'wall_back_kitchen', 'wall_left_kitchen', 'wall_inner_left_division_kitchen',
          'wall_inner_left_hall_kitchen_lower', 'wall_inner_left_hall_kitchen_mid',
          'wall_inner_left_hall_lintel1_kitchen'
        ],
        bedroom: [
          'wall_front_bedroom', 'wall_left_bedroom', 'wall_inner_left_division_bedroom',
          'wall_inner_left_hall_bedroom_mid', 'wall_inner_left_hall_bedroom_upper',
          'wall_inner_left_hall_lintel2_bedroom'
        ],
        study: [
          'wall_front_study', 'wall_right_study', 'wall_inner_right_division_study',
          'wall_inner_right_hall_study_mid', 'wall_inner_right_hall_study_upper',
          'wall_inner_right_hall_lintel2_study'
        ],
        living: [
          'wall_back_living', 'wall_right_living', 'wall_inner_right_division_living',
          'wall_inner_right_hall_living_lower', 'wall_inner_right_hall_living_mid',
          'wall_inner_right_hall_lintel1_living'
        ],
        hall: [
          'wall_back_hall', 'wall_front_hall',
          'wall_inner_left_hall_lower', 'wall_inner_left_hall_mid', 'wall_inner_left_hall_upper',
          'wall_inner_left_hall_lintel1', 'wall_inner_left_hall_lintel2',
          'wall_inner_right_hall_lower', 'wall_inner_right_hall_mid', 'wall_inner_right_hall_upper',
          'wall_inner_right_hall_lintel1', 'wall_inner_right_hall_lintel2'
        ]
      };

      const roomWalls = roomWallsMap[roomId] || [];
      try {
        let dbNotes = await getAllNotes();
        const filteredNotes = dbNotes.filter(n => !roomWalls.includes(n.wallId));
        await saveAllNotesToDB(filteredNotes);
        setNotes(filteredNotes);
      } catch (err) {
        console.error('Notlar silinirken hata:', err);
      }
    }

    const toastMsg = lang === 'en' 
      ? `✓ Room elements cleared successfully` 
      : '✓ Oda içeriği başarıyla temizlendi';
    showSavedToast(toastMsg);
  };

  const getRoomIdFromPosition = (x, z) => {
    if (x >= -5 && x <= 5) return 'hall';
    if (x < -5 && z > 0) return 'bedroom';
    if (x < -5 && z <= 0) return 'kitchen';
    if (x > 5 && z > 0) return 'study';
    if (x > 5 && z <= 0) return 'living';
    return 'unknown';
  };

  const handleAddPlacedItem = (type) => {
    const [px, , pz] = playerPositionRef.current || [0, 1.6, 5];
    const [dx, , dz] = playerDirectionRef.current || [0, 0, -1];
    
    // Yön vektörünü normalize et
    const len = Math.sqrt(dx * dx + dz * dz);
    const nx = len > 0.001 ? dx / len : 0;
    const nz = len > 0.001 ? dz / len : -1;
    
    // Eşyayı oyuncunun 2.5 metre önünde oluştur
    const spawnX = px + nx * 2.5;
    const spawnZ = pz + nz * 2.5;
    
    // Eşyanın oluştuğu yerdeki odayı bul
    const roomId = getRoomIdFromPosition(spawnX, spawnZ);
    
    // Halı zemin hizasında, raflar ve panolar havada, masa lambası masaüstü seviyesinde, diğerleri zeminde
    const yPos = (type === 'wallshelf' || type === 'small_wallshelf' || type === 'large_board') 
      ? 1.4 
      : type === 'desk_lamp' 
        ? 0.72 
        : type === 'rug' 
          ? 0.001 
          : 0.005;

    const limits = {
      hall: { minX: -4.5, maxX: 4.5, minZ: -24.5, maxZ: 24.5 },
      bedroom: { minX: -24.5, maxX: -5.5, minZ: 0.5, maxZ: 24.5 },
      kitchen: { minX: -24.5, maxX: -5.5, minZ: -24.5, maxZ: -0.5 },
      study: { minX: 5.5, maxX: 24.5, minZ: 0.5, maxZ: 24.5 },
      living: { minX: 5.5, maxX: 24.5, minZ: -24.5, maxZ: -0.5 },
      unknown: { minX: -24.5, maxX: 24.5, minZ: -24.5, maxZ: 24.5 }
    };

    const roomLimit = limits[roomId] || limits.unknown;
    
    const clampedX = Math.max(roomLimit.minX, Math.min(roomLimit.maxX, spawnX));
    const clampedZ = Math.max(roomLimit.minZ, Math.min(roomLimit.maxZ, spawnZ));

    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      roomId,
      position: { x: clampedX, y: yPos, z: clampedZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      color: '#818cf8', // Varsayılan indigo
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setActiveItemId(newItem.id);
    setIsItemEditingActive(false);
    setEditingItemBackup(null);
    setLastAction('item-added');
    
    // Not veya dashboard açık ise kapat, çakışmayı önle
    setActiveNoteId(null);
    setIsAddMode(false);
    setIsDashboardOpen(false);
  };

  const handleUpdatePlacedItem = (id, fields) => {
    setPlacedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...fields, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const handleDeletePlacedItem = (id) => {
    const item = placedItems.find((i) => i.id === id);
    if (item && (item.type === 'libraryShelf' || item.type === 'largeLibraryShelf') && item.books && item.books.length > 0) {
      const confirmText = lang === 'en'
        ? "This library shelf contains books and notes. Deleting it will also delete all books inside. Do you want to proceed?"
        : "Bu kütüphane rafında kitaplar ve notlar bulunuyor. Rafı silerseniz içindeki tüm kitaplar da silinecektir. Devam etmek istiyor musunuz?";
      if (!window.confirm(confirmText)) {
        return;
      }
    }
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
    if (activeItemId === id) {
      setActiveItemId(null);
    }
    showSavedToast(lang === 'en' ? '✓ Item deleted' : '✓ Eşya silindi');
  };

  const handleStartEdit = (itemId) => {
    if (pendingConnectionSource) {
      showSavedToast('⚠️ Bağlantı modu aktifken eşya düzenlenemez');
      return;
    }
    const item = placedItems.find(i => i.id === itemId);
    if (item) {
      setEditingItemBackup(JSON.parse(JSON.stringify(item)));
      setIsItemEditingActive(true);
      setActiveItemId(itemId);
    }
  };

  const handleSaveEdit = () => {
    setIsItemEditingActive(false);
    setActiveItemId(null);
    setEditingItemBackup(null);
    showSavedToast('✓ Eşya düzenlemesi kaydedildi');
  };

  const handleCancelEdit = () => {
    if (editingItemBackup) {
      setPlacedItems(prev => prev.map(i => i.id === editingItemBackup.id ? editingItemBackup : i));
    }
    setIsItemEditingActive(false);
    setActiveItemId(null);
    setEditingItemBackup(null);
    showSavedToast('✓ Değişiklikler iptal edildi');
  };

  const handleSaveItemNote = (itemId, pages, currentPageIndex, title, iconType = 'info', tags = [], textColor = '#1e293b') => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            linkedNote: {
              title: title || 'Eşya Notu',
              pages,
              currentPageIndex,
              iconType,
              tags,
              textColor,
              updatedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
    setIsEditorOpen(false);
    showSavedToast('✓ Not kaydedildi');
    setLastAction('note-created');
  };

  const handleOpenBookModal = (mode, data) => {
    setBookModalMode(mode);
    if (mode === 'add') {
      const shelf = placedItems.find(i => i.id === data.shelfId);
      const occupied = (shelf?.books || []).map(b => b.slotIndex);
      const maxSlots = shelf?.type === 'largeLibraryShelf' ? 48 : 24;
      const firstFree = Array.from({ length: maxSlots }, (_, i) => i).find(s => !occupied.includes(s)) ?? 0;
      setBookModalData({
        spineLabel: '',
        color: '#ef4444',
        slotIndex: firstFree,
        ...data
      });
    } else {
      setBookModalData(data);
    }
    setIsBookModalOpen(true);
  };

  const handleCloseBookModal = () => {
    setIsBookModalOpen(false);
    setBookModalData(null);
  };

  const handleSaveBook = (bookData) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === bookData.shelfId) {
          const currentBooks = item.books || [];
          if (bookModalMode === 'add') {
            const newBook = {
              bookId: 'book_' + Date.now(),
              shelfId: bookData.shelfId,
              slotIndex: bookData.slotIndex,
              spineLabel: bookData.spineLabel,
              color: bookData.color,
              linkedNote: {
                title: bookData.spineLabel || 'Kitap Notu',
                pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
                currentPageIndex: 0,
                tags: []
              }
            };
            return {
              ...item,
              books: [...currentBooks, newBook]
            };
          } else {
            return {
              ...item,
              books: currentBooks.map((b) =>
                b.bookId === bookData.bookId
                  ? { ...b, slotIndex: bookData.slotIndex, spineLabel: bookData.spineLabel, color: bookData.color }
                  : b
              )
            };
          }
        }
        return item;
      })
    );
    setIsBookModalOpen(false);
    setBookModalData(null);
    showSavedToast(lang === 'en' ? '✓ Book saved' : '✓ Kitap kaydedildi');
  };

  const handleSaveBookNote = (bookId, pages, currentPageIndex, title, iconType = 'info', tags = []) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === activeItemId) {
          return {
            ...item,
            books: (item.books || []).map((book) => {
              if (book.bookId === bookId) {
                return {
                  ...book,
                  linkedNote: {
                    title: title || book.spineLabel || 'Kitap Notu',
                    pages,
                    currentPageIndex,
                    iconType,
                    tags,
                    updatedAt: new Date().toISOString()
                  }
                };
              }
              return book;
            })
          };
        }
        return item;
      })
    );
    setIsEditorOpen(false);
    showSavedToast(lang === 'en' ? '✓ Note saved' : '✓ Not kaydedildi');
    setLastAction('note-created');
  };

  const handleDeleteBookNote = (bookId) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === activeItemId) {
          return {
            ...item,
            books: (item.books || []).filter((book) => book.bookId !== bookId)
          };
        }
        return item;
      })
    );
    setIsEditorOpen(false);
    setActiveBookId(null);
    showSavedToast(lang === 'en' ? '✓ Book deleted' : '✓ Kitap silindi');
  };

  const handleDeleteItemNote = (itemId) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const { linkedNote: _deletedNote, ...rest } = item;
          return rest;
        }
        return item;
      })
    );
    setIsEditorOpen(false);
    showSavedToast('✓ Not silindi');
  };

  const handleGoToItem = (item) => {
    setIsDashboardOpen(false);
    setEditorMode('item');
    setActiveItemId(item.id);
    setActiveNoteId(null);
    setIsAddMode(false);
    
    // Trigger flash effect for 8 seconds
    setFlashedItemId(item.id);
    setTimeout(() => {
      setFlashedItemId(null);
    }, 8000);

    // Oda vurgulamasını tetikle
    const itemRoomId = item.roomId || getRoomIdFromPosition(item.position.x, item.position.z);
    triggerHighlight(itemRoomId);

    // Eşyaya gitmek için kamera odağı ayarla (Sadece hızlı ışınlanma açıksa)
    if (allowQuickTravel) {
      try {
        const itemPos = new THREE.Vector3(item.position.x ?? 0, item.position.y ?? 0, item.position.z ?? 0);
        const camPos = itemPos.clone().add(new THREE.Vector3(0, 1.4, 1.8));
        const lookDir = itemPos.clone().sub(camPos).normalize();
        const yawVal = Math.atan2(-lookDir.x, -lookDir.z);
        const pitchVal = Math.asin(lookDir.y);
        
        setCameraFocusRequest({
          position: [camPos.x, camPos.y, camPos.z],
          pitch: pitchVal,
          yaw: yawVal,
          time: Date.now()
        });
      } catch (err) {
        console.error('Teleport to item error:', err);
      }
    } else {
      showSavedToast(`📍 Eşya ${roomNames[itemRoomId] || itemRoomId} odasında parlıyor!`);
    }
  };
  
  // State to track current drawing coordinates on wall
  const [drawing, setDrawing] = useState(null);

  // Load notes from IndexedDB and migrate legacy localStorage data if it exists.
  // Performs one-time reset to clear bugged/old data structure completely.
  useEffect(() => {
    const loadAndMigrateData = async () => {
      try {
        const resetKey = 'saray_mindmap_v3_reset';
        if (!localStorage.getItem(resetKey)) {
          try {
            const db = await initDB();
            const transaction = db.transaction('notes', 'readwrite');
            const store = transaction.objectStore('notes');
            await new Promise((resolve, reject) => {
              const req = store.clear();
              req.onsuccess = resolve;
              req.onerror = () => reject(req.error);
            });
          } catch (dbClearErr) {
            console.error('Database clear failed:', dbClearErr);
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          localStorage.setItem(resetKey, 'true');
          setNotes([]);
          setIsLoaded(true);
          return;
        }

        let dbNotes = await getAllNotes();
        const savedLegacy = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (savedLegacy) {
          try {
            const parsedLegacy = JSON.parse(savedLegacy);
            if (parsedLegacy && parsedLegacy.length > 0) {
              const migrated = parsedLegacy.map((note) => {
                let updatedNote = { ...note };

                // 1. If note doesn't have 'pages' structure, migrate it
                if (!updatedNote.pages) {
                  updatedNote.pages = [{ text: updatedNote.text || '', image: null, layout: 'image-top-text-bottom' }];
                  updatedNote.currentPageIndex = 0;
                } else {
                  // Migrate pages array if items are string, or if image/layout field is missing
                  updatedNote.pages = updatedNote.pages.map((page) => {
                    if (typeof page === 'string') {
                      return { text: page, image: null, layout: 'image-top-text-bottom' };
                    }
                    return {
                      text: page.text !== undefined ? page.text : '',
                      image: page.image !== undefined ? page.image : null,
                      layout: page.layout || 'image-top-text-bottom'
                    };
                  });
                }
                
                // 2. Migrate width and height
                if (updatedNote.width === undefined) updatedNote.width = 0.7;
                if (updatedNote.height === undefined) updatedNote.height = 0.7;
                
                // 3. Migrate position and rotation if they don't exist
                if (!updatedNote.position || !updatedNote.rotation) {
                  const pointVec = new THREE.Vector3(...(updatedNote.point || [0, 1.6, 0]));
                  const normalVec = new THREE.Vector3(...(updatedNote.normal || [0, 0, 1]));
                  const offsetPos = pointVec.clone().addScaledVector(normalVec, 0.02);
                  
                  const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    normalVec
                  );
                  const euler = new THREE.Euler().setFromQuaternion(quaternion);
                  
                  updatedNote.position = [offsetPos.x, offsetPos.y, offsetPos.z];
                  updatedNote.rotation = [euler.x, euler.y, euler.z];
                }
                
                return updatedNote;
              });

              dbNotes = [...dbNotes, ...migrated];
              await saveAllNotesToDB(dbNotes);
            }
            // Remove legacy storage after successful migration
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch (migrateErr) {
            console.error('Legacy data migration error:', migrateErr);
          }
        }

        const presetInitialized = localStorage.getItem('saray_preset_rooms_initialized');
        if (!presetInitialized) {
          const defaultColor = theme === 'library' ? '#fef9c3' : theme === 'sci-fi' ? '#00f0ff' : '#fef08a';
          const presetNotes = [
            {
              id: 'note_preset_1',
              wallId: 'wall_inner_right_division',
              position: [15, 1.8, 0.02],
              rotation: [0, 0, 0],
              width: 0.7,
              height: 0.7,
              title: "Bugünkü Odak",
              pages: [{ text: "Bugün çalışacağın ana konuyu buraya yaz. Büyük konuları küçük notlara böl.", image: null, layout: 'image-top-text-bottom' }],
              currentPageIndex: 0,
              color: defaultColor,
              tags: ["Görev"]
            },
            {
              id: 'note_preset_2',
              wallId: 'wall_right_study',
              position: [24.98, 1.8, 11],
              rotation: [0, -Math.PI / 2, 0],
              width: 0.7,
              height: 0.7,
              title: "Kaynak Listesi",
              pages: [{ text: "Okuduğun kitapları, izlediğin videoları veya araştırma linklerini burada toplayabilirsin.", image: null, layout: 'image-top-text-bottom' }],
              currentPageIndex: 0,
              color: defaultColor,
              tags: ["Kaynak"]
            },
            {
              id: 'note_preset_3',
              wallId: 'wall_front_study',
              position: [10, 1.8, 24.98],
              rotation: [0, Math.PI, 0],
              width: 0.7,
              height: 0.7,
              title: "Fikir Alanı",
              pages: [{ text: "Aklına gelen fikirleri hızlıca buraya ekle. Daha sonra bağlantılarla diğer notlara bağlayabilirsin.", image: null, layout: 'image-top-text-bottom' }],
              currentPageIndex: 0,
              color: defaultColor,
              tags: ["Fikir"]
            }
          ];

          const existingIds = new Set(dbNotes.map(n => n.id));
          const notesToAppend = presetNotes.filter(n => !existingIds.has(n.id));
          if (notesToAppend.length > 0) {
            dbNotes = [...dbNotes, ...notesToAppend];
            await saveAllNotesToDB(dbNotes);
          }
          localStorage.setItem('saray_preset_rooms_initialized', 'true');
        }
        
        setNotes(dbNotes);
      } catch (dbErr) {
        console.error('Failed to load notes from IndexedDB:', dbErr);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAndMigrateData();
  }, []);

  // Sync notes to IndexedDB only after notes are loaded
  useEffect(() => {
    if (!isLoaded) return;

    const saveData = async () => {
      try {
        await saveAllNotesToDB(notes);
      } catch (err) {
        console.error('IndexedDB kayıt hatası:', err);
        alert('⚠️ Veritabanı kayıt hatası! Tarayıcı depolama alanınız dolmuş veya kısıtlanmış olabilir.');
      }
    };

    saveData();
  }, [notes, isLoaded]);

  // Global Keyboard Shortcuts (C: Camera, E: Add Mode, H: Dashboard, Q/E/PageUp/PageDown/Scale/Delete for Items)
  useEffect(() => {
    const handleKeyDown = (e) => {


      // Prevent shortcut trigger when user is typing in form inputs/textarea
      if (
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.closest('.settings-modal')
      ) {
        return;
      }

      // Eşya düzenleme kontrolleri (yalnızca düzenleme modu AKTİFKEN çalışır)
      if (activeItemId && isItemEditingActive) {
        const item = placedItems.find((i) => i.id === activeItemId);
        if (item) {
          const ROTATION_SNAP = Math.PI / 12;
          if (e.code === 'KeyQ') {
            const currentRot = item.rotation || { x: 0, y: 0, z: 0 };
            const ry = (currentRot.y || 0) + ROTATION_SNAP;
            const snappedRy = Math.round(ry / ROTATION_SNAP) * ROTATION_SNAP;
            handleUpdatePlacedItem(activeItemId, { rotation: { ...currentRot, y: snappedRy } });
            e.preventDefault();
            return;
          }
          if (e.code === 'KeyE') {
            const currentRot = item.rotation || { x: 0, y: 0, z: 0 };
            const ry = (currentRot.y || 0) - ROTATION_SNAP;
            const snappedRy = Math.round(ry / ROTATION_SNAP) * ROTATION_SNAP;
            handleUpdatePlacedItem(activeItemId, { rotation: { ...currentRot, y: snappedRy } });
            e.preventDefault();
            return;
          }
          if (e.code === 'PageUp') {
            const currentPos = item.position || { x: 0, y: 0, z: 0 };
            const newY = (currentPos.y || 0) + 0.1;
            handleUpdatePlacedItem(activeItemId, { position: { ...currentPos, y: newY } });
            e.preventDefault();
            return;
          }
          if (e.code === 'PageDown') {
            const currentPos = item.position || { x: 0, y: 0, z: 0 };
            const newY = Math.max(0.001, (currentPos.y || 0) - 0.1);
            handleUpdatePlacedItem(activeItemId, { position: { ...currentPos, y: newY } });
            e.preventDefault();
            return;
          }
          if (e.key === '+' || e.key === '=') {
            const currentScale = item.scale?.[0] || 1;
            const newScale = Math.min(2.5, currentScale + 0.1);
            handleUpdatePlacedItem(activeItemId, { scale: [newScale, newScale, newScale] });
            e.preventDefault();
            return;
          }
          if (e.key === '-' || e.key === '_') {
            const currentScale = item.scale?.[0] || 1;
            const newScale = Math.max(0.4, currentScale - 0.1);
            handleUpdatePlacedItem(activeItemId, { scale: [newScale, newScale, newScale] });
            e.preventDefault();
            return;
          }
          if (e.code === 'Delete' || e.code === 'Backspace') {
            handleDeletePlacedItem(activeItemId);
            setIsItemEditingActive(false);
            setEditingItemBackup(null);
            e.preventDefault();
            return;
          }
        }
      }

      if (e.code === 'KeyN') {
        const isBlocked = isEditorOpen || isDashboardOpen || isItemEditingActive;
        if (!isBlocked) {
          if (crosshairHovered && crosshairHovered.type === 'wall') {
            const bounds = calculateNoteBounds({
              wallId: crosshairHovered.id,
              startPoint: crosshairHovered.point,
              normal: crosshairHovered.normal,
              currentPoint: crosshairHovered.point
            });

            if (bounds) {
              let defaultColor = '#fef08a';
              if (theme === 'library') defaultColor = '#fef9c3';
              else if (theme === 'sci-fi') defaultColor = '#00f0ff';

              const newNote = {
                id: 'note_' + Date.now(),
                wallId: crosshairHovered.id,
                position: bounds.position,
                rotation: bounds.rotation,
                width: 2.0, // 2x2 boyut
                height: 2.0,
                pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
                currentPageIndex: 0,
                color: defaultColor
              };

              setNotes((prev) => [...prev, newNote]);
              setEditorMode('note');
              setActiveNoteId(newNote.id);
              setActiveItemId(null);
              setIsEditorOpen(true);
              setIsAddMode(false);
              showSavedToast('✓ Hızlı not oluşturuldu');
            }
          } else {
            showSavedToast('⚠️ Hızlı not için duvara bakın');
          }
          e.preventDefault();
          return;
        }
      }

      if (e.code === 'KeyV') {
        let currentMode = 'walk-third';
        if (movementMode === 'walk' && cameraView === 'first') currentMode = 'walk-first';
        else if (movementMode === 'fly' && cameraView === 'third') currentMode = 'fly-third';
        else if (movementMode === 'fly' && cameraView === 'first') currentMode = 'fly-first';

        if (currentMode === 'walk-third') {
          setCameraView('first');
          setMovementMode('walk');
        } else if (currentMode === 'walk-first') {
          if (freeFlightEnabled) {
            setCameraView('third');
            setMovementMode('fly');
          } else {
            setCameraView('third');
            setMovementMode('walk');
          }
        } else if (currentMode === 'fly-third') {
          setCameraView('first');
          setMovementMode('fly');
        } else if (currentMode === 'fly-first') {
          setCameraView('third');
          setMovementMode('walk');
        }
      }
      
      if (e.code === 'KeyE') {
        if (!isDashboardOpen) {
          setIsAddMode((prev) => !prev);
        }
      }

      if (e.code === 'KeyI') {
        setIsItemDrawerOpen((prev) => {
          const next = !prev;
          if (next) {
            setIsSettingsOpen(false);
            setIsDashboardOpen(false);
          }
          return next;
        });
      }

      if (e.code === 'KeyO') {
        setIsSettingsOpen((prev) => {
          const next = !prev;
          if (next) {
            setIsDashboardOpen(false);
            setIsItemDrawerOpen(false);
          }
          return next;
        });
      }

      if (e.code === 'KeyH') {
        setIsDashboardOpen((prev) => !prev);
      }

      if (e.code === 'Escape') {
        if (pendingConnectionSource) {
          handleCancelConnection();
          e.preventDefault();
          return;
        }
        if (isItemEditingActive) {
          handleCancelEdit();
        } else {
          setActiveItemId(null); // Eşya seçimini kaldır
        }
        setIsDashboardOpen(false);
        setIsEditorOpen(false);
        setIsSettingsOpen(false);
        setIsItemDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDashboardOpen, activeItemId, placedItems, isItemEditingActive, editingItemBackup, handleDeletePlacedItem, handleUpdatePlacedItem, crosshairHovered, theme, movementMode, cameraView, isEditorOpen, pendingConnectionSource, freeFlightEnabled, setIsItemDrawerOpen, setIsSettingsOpen, setIsAddMode, setIsDashboardOpen]);

  // Context Menu (Right Click) global listener to close editor and deselect active note / cancel item edit
  useEffect(() => {
    const handleContextMenu = (e) => {
      // Allow native browser context menu (copy/paste) for form controls and modal containers
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable ||
        e.target.closest('.editor-modal') ||
        e.target.closest('.dashboard-window') ||
        e.target.closest('.settings-modal') ||
        e.target.closest('.item-drawer') ||
        e.target.closest('.item-editor-bar')
      ) {
        return;
      }

      e.preventDefault(); // Prevent standard browser context menu on 3D scene
      if (pendingConnectionSource) {
        handleCancelConnection();
        return;
      }
      if (isItemEditingActive) {
        handleCancelEdit();
      } else {
        setActiveItemId(null); // Eşya seçimini kaldır
      }
      setIsEditorOpen(false);
      setActiveNoteId(null);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isItemEditingActive, editingItemBackup, pendingConnectionSource]);

  // Keyboard navigation for active note pages (using ArrowLeft and ArrowRight)
  useEffect(() => {
    const handleArrowNav = (e) => {
      // If user is typing in a textarea or input, preserve normal cursor behavior
      if (
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'INPUT'
      ) {
        return;
      }

      if (activeNoteId) {
        const activeNote = notes.find((n) => n.id === activeNoteId);
        if (activeNote) {
          const currentIndex = activeNote.currentPageIndex || 0;
          const pageCount = (activeNote.pages && activeNote.pages.length) || 1;

          if (e.code === 'ArrowLeft') {
            if (currentIndex > 0) {
              handleSetNotePageIndex(activeNoteId, currentIndex - 1);
            }
            e.preventDefault(); // Prevent camera turning or page scroll
          } else if (e.code === 'ArrowRight') {
            if (currentIndex < pageCount - 1) {
              handleSetNotePageIndex(activeNoteId, currentIndex + 1);
            }
            e.preventDefault(); // Prevent camera turning or page scroll
          }
        }
      }
    };

    window.addEventListener('keydown', handleArrowNav);
    return () => {
      window.removeEventListener('keydown', handleArrowNav);
    };
  }, [activeNoteId, notes]);

  // Helper to calculate note bounds in 3D space during drag-to-draw
  const calculateNoteBounds = (drawState) => {
    if (!drawState) return null;
    const { startPoint, currentPoint, normal } = drawState;
    const nx = normal[0];
    const ny = normal[1];
    const nz = normal[2];

    let w = 0.7;
    let h = 0.7;
    let center = [...startPoint];

    if (Math.abs(nz) > 0.9) {
      // Back or Front wall (parallel to X-Y plane)
      w = Math.abs(currentPoint[0] - startPoint[0]);
      h = Math.abs(currentPoint[1] - startPoint[1]);
      center = [
        (startPoint[0] + currentPoint[0]) / 2,
        (startPoint[1] + currentPoint[1]) / 2,
        startPoint[2]
      ];
    } else if (Math.abs(nx) > 0.9) {
      // Left or Right wall (parallel to Z-Y plane)
      w = Math.abs(currentPoint[2] - startPoint[2]);
      h = Math.abs(currentPoint[1] - startPoint[1]);
      center = [
        startPoint[0],
        (startPoint[1] + currentPoint[1]) / 2,
        (startPoint[2] + currentPoint[2]) / 2
      ];
    }

    // Default to 0.7 x 0.7 if drawing area is too small (e.g. simple click)
    const isTiny = w < 0.2 || h < 0.2;
    if (isTiny) {
      w = 0.7;
      h = 0.7;
      center = [...startPoint];
    }

    // Offset slightly along normal to prevent z-fighting
    const position = [
      center[0] + nx * 0.02,
      center[1] + ny * 0.02,
      center[2] + nz * 0.02
    ];

    // Compute rotation quaternion matching normal
    const normalVec = new THREE.Vector3(...normal);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normalVec
    );
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    const rotation = [euler.x, euler.y, euler.z];

    return { position, rotation, width: w, height: h };
  };

  const handleDrawingStart = (data) => {
    if (!isAddMode) return;
    setDrawing({
      wallId: data.wallId,
      startPoint: data.point,
      normal: data.normal,
      currentPoint: data.point
    });
  };

  const handleDrawingMove = (data) => {
    if (!isAddMode) return;
    setDrawing((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentPoint: data.point
      };
    });
  };

  const handleDrawingEnd = () => {
    if (!drawing) return;

    const bounds = calculateNoteBounds(drawing);
    if (!bounds) return;

    // Get default color based on current theme
    let defaultColor = '#fef08a';
    if (theme === 'library') {
      defaultColor = '#fef9c3'; // warm book paper
    } else if (theme === 'sci-fi') {
      defaultColor = '#00f0ff'; // cyan hologram
    }

    const newNote = {
      id: 'note_' + Date.now(),
      wallId: drawing.wallId,
      position: bounds.position,
      rotation: bounds.rotation,
      width: bounds.width,
      height: bounds.height,
      pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
      currentPageIndex: 0,
      color: defaultColor
    };

    setNotes((prev) => [...prev, newNote]);
    setEditorMode('note');
    setActiveNoteId(newNote.id);
    setActiveItemId(null); // Eşya seçimini kaldır
    setIsEditorOpen(true); // Open the editor immediately for newly drawn notes
    setIsAddMode(false);
    setDrawing(null);
  };

  // Open note details (Select only, does not open modal editor)
  const handleNoteClick = (id) => {
    if (pendingConnectionSource) {
      if (isEditorOpen || isDashboardOpen) return;
      if (pendingConnectionSource.id === id) {
        showSavedToast('⚠️ Aynı öğeler bağlanamaz');
        return;
      }
      setPendingConnectionTarget({ id, type: 'note' });
      setIsConceptSelectOpen(true);
      return;
    }
    setEditorMode('note');
    setActiveNoteId(id);
    setActiveItemId(null); // Eşya seçimini kaldır
    setIsEditorOpen(false); // Ensure editor is closed when a new note is selected
  };

  // Deselect currently active note or item when clicking empty wall or floor
  const handleDeselect = () => {
    setActiveNoteId(null);
    setActiveItemId(null);
    setIsItemEditingActive(false);
    setIsEditorOpen(false); // Close editor when deselecting
  };

  // Directly sets a note's page index from 3D controls
  const handleSetNotePageIndex = (id, index) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, currentPageIndex: index } : n))
    );
  };

  // Save changes to note
  const handleSaveNote = (id, pages, currentPageIndex, color, tags = [], title = '', textColor = '#1e293b') => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pages, currentPageIndex, color, tags, title, textColor, updatedAt: new Date().toISOString() } : n))
    );
    setIsEditorOpen(false);
    showSavedToast('✓ Not kaydedildi');
    setLastAction('note-created');
  };

  // Delete note
  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setIsEditorOpen(false);
    setActiveNoteId(null);
    showSavedToast('✓ Not silindi');
    setLastAction('note-deleted');
  };

  // Handle focusing/teleporting camera to note and flashing it
  const handleGoToNote = (note) => {
    setIsDashboardOpen(false);
    setEditorMode('note');
    setActiveNoteId(note.id);
    setActiveItemId(null); // Eşya seçimini kaldır
    setIsAddMode(false);
    
    // Trigger flash effect for 8 seconds
    setFlashedNoteId(note.id);
    setTimeout(() => {
      setFlashedNoteId(null);
    }, 8000);

    // Oda vurgulamasını tetikle
    const noteRoomId = note.roomId || getRoomIdFromPosition(note.position[0], note.position[2]);
    triggerHighlight(noteRoomId);

    // Sadece hızlı ışınlanma açıksa kamerayı taşı
    if (allowQuickTravel) {
      try {
        const euler = new THREE.Euler(...note.rotation);
        const normal = new THREE.Vector3(0, 0, 1).applyEuler(euler).normalize();
        
        const notePos = new THREE.Vector3(...note.position);
        // Position camera 1.6 meters in front of the note
        const camPos = notePos.clone().addScaledVector(normal, 1.6);
        
        // Let it look at the note
        const lookDir = notePos.clone().sub(camPos).normalize();
        const yawVal = Math.atan2(-lookDir.x, -lookDir.z);
        const pitchVal = Math.asin(lookDir.y);
        
        setCameraFocusRequest({
          position: [camPos.x, camPos.y, camPos.z],
          pitch: pitchVal,
          yaw: yawVal,
          time: Date.now()
        });
      } catch (err) {
        console.error('Teleport error:', err);
      }
    } else {
      showSavedToast(`📍 Not ${roomNames[noteRoomId] || noteRoomId} odasında parlıyor!`);
    }
  };

  // Target navigation logic (called from link clicking)
  const handleNavigateToTarget = (targetId, isWallNote) => {
    setIsEditorOpen(false);
    setIsDashboardOpen(false);
    if (isWallNote) {
      const note = notes.find(n => n.id === targetId);
      if (note) {
        handleGoToNote(note);
      }
    } else {
      const item = placedItems.find(i => i.id === targetId);
      if (item) {
        handleGoToItem(item);
      }
    }
  };

  const handleUpdateNotesVisibility = (updates) => {
    setNotes((prev) =>
      prev.map((n) => (updates[n.id] !== undefined ? { ...n, hidden: updates[n.id] } : n))
    );
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.linkedNote && updates[item.id] !== undefined) {
          return {
            ...item,
            linkedNote: { ...item.linkedNote, hidden: updates[item.id] },
          };
        }
        return item;
      })
    );
  };

  const handleConnectNotes = (noteIdsWithTypes) => {
    if (noteIdsWithTypes.length < 2) return;
    const newConns = [];
    const timestamp = Date.now();
    for (let i = 0; i < noteIdsWithTypes.length - 1; i++) {
      const from = noteIdsWithTypes[i];
      const to = noteIdsWithTypes[i + 1];
      const exists = connections.some(c => c.fromId === from.id && c.toId === to.id) ||
                     newConns.some(c => c.fromId === from.id && c.toId === to.id);
      if (exists) continue;
      newConns.push({
        id: `connection_${timestamp}_${i}_${Math.random().toString(36).substr(2, 5)}`,
        fromId: from.id,
        toId: to.id,
        fromType: from.type,
        toType: to.type,
        conceptId: 'concept_general',
        color: '#00f0ff',
        isVisible: true,
        label: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    if (newConns.length > 0) {
      setConnections(prev => [...prev, ...newConns]);
      showSavedToast(`✓ ${newConns.length} yeni bağlantı oluşturuldu`);
      setLastAction('link-created');
    } else {
      showSavedToast('⚠️ Seçilen bağlantılar zaten mevcut');
    }
  };

  const handleStartStudySession = (orderedNotes) => {
    setSelectedStudyNotes(orderedNotes);
    if (orderedNotes.length > 0) {
      setCurrentStudyIndex(0);
      handleFocusOnStudyNote(orderedNotes[0]);
    } else {
      setCurrentStudyIndex(-1);
    }
  };

  const handleFocusOnStudyNote = (studyTarget) => {
    if (!studyTarget) return;
    const isWallNote = studyTarget.isWallNote;
    if (isWallNote) {
      const note = notes.find(n => n.id === studyTarget.id);
      if (!note) return;
      setFlashedNoteId(note.id);
      setTimeout(() => setFlashedNoteId(null), 8000);
      try {
        const euler = new THREE.Euler(...note.rotation);
        const normal = new THREE.Vector3(0, 0, 1).applyEuler(euler).normalize();
        const notePos = new THREE.Vector3(...note.position);
        const camPos = notePos.clone().addScaledVector(normal, 1.6);
        const lookDir = notePos.clone().sub(camPos).normalize();
        const yawVal = Math.atan2(-lookDir.x, -lookDir.z);
        const pitchVal = Math.asin(lookDir.y);
        
        setCameraFocusRequest({
          position: [camPos.x, camPos.y, camPos.z],
          pitch: pitchVal,
          yaw: yawVal,
          time: Date.now()
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      const item = placedItems.find(i => i.id === studyTarget.id);
      if (!item) return;
      setFlashedItemId(item.id);
      setTimeout(() => setFlashedItemId(null), 8000);
      try {
        const itemPos = new THREE.Vector3(item.position.x ?? 0, item.position.y ?? 0, item.position.z ?? 0);
        const camPos = itemPos.clone().add(new THREE.Vector3(0, 1.4, 1.8));
        const lookDir = itemPos.clone().sub(camPos).normalize();
        const yawVal = Math.atan2(-lookDir.x, -lookDir.z);
        const pitchVal = Math.asin(lookDir.y);
        
        setCameraFocusRequest({
          position: [camPos.x, camPos.y, camPos.z],
          pitch: pitchVal,
          yaw: yawVal,
          time: Date.now()
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- 3D Bağlantı ve Kavram Yardımcı İş Mantığı ---
  const getObjectPosition = (id, type) => {
    if (type === 'note') {
      const note = notes.find(n => n.id === id);
      if (note && note.position) return note.position;
    } else if (type === 'item') {
      const item = placedItems.find(i => i.id === id);
      if (item && item.position) {
        return [item.position.x ?? 0, item.position.y ?? 0, item.position.z ?? 0];
      }
    }
    return null;
  };

  const handleStartConnection = (id, type) => {
    setPendingConnectionSource({ id, type });
    setPendingConnectionTarget(null);
    setIsConceptSelectOpen(false);
    setIsAddMode(false);
    if (isItemEditingActive) {
      handleCancelEdit();
    }
  };

  const handleCompleteConnection = (conceptId) => {
    if (!pendingConnectionSource || !pendingConnectionTarget) return;

    // Aynı nesneleri birbirine bağlama engeli
    if (pendingConnectionSource.id === pendingConnectionTarget.id) {
      showSavedToast('⚠️ Aynı öğeler bağlanamaz');
      setPendingConnectionSource(null);
      setPendingConnectionTarget(null);
      setIsConceptSelectOpen(false);
      return;
    }

    // Zaten varsa tekrar oluşturmama
    const exists = connections.some(c => 
      c.fromId === pendingConnectionSource.id && 
      c.toId === pendingConnectionTarget.id && 
      c.conceptId === conceptId
    );

    if (exists) {
      showSavedToast('⚠️ Bu bağlantı zaten mevcut');
      setPendingConnectionSource(null);
      setPendingConnectionTarget(null);
      setIsConceptSelectOpen(false);
      return;
    }

    const concept = connectionConcepts.find(cc => cc.id === conceptId) || { color: '#00f0ff' };

    const newConnection = {
      id: 'connection_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      fromId: pendingConnectionSource.id,
      toId: pendingConnectionTarget.id,
      fromType: pendingConnectionSource.type,
      toType: pendingConnectionTarget.type,
      conceptId,
      color: concept.color,
      isVisible: true,
      label: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConnections(prev => [...prev, newConnection]);
    setPendingConnectionSource(null);
    setPendingConnectionTarget(null);
    setIsConceptSelectOpen(false);
    showSavedToast('✓ Bağlantı oluşturuldu');
  };

  const handleCancelConnection = () => {
    setPendingConnectionSource(null);
    setPendingConnectionTarget(null);
    setIsConceptSelectOpen(false);
    showSavedToast('✓ Bağlantı modu iptal edildi');
  };

  const handleDeleteConnection = (id) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    showSavedToast('✓ Bağlantı silindi');
  };

  const handleToggleConnectionVisibility = (id) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c));
  };

  const handleAddConcept = (name, color) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = connectionConcepts.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showSavedToast('⚠️ Aynı isimde bir kavram zaten var');
      return;
    }

    const newConcept = {
      id: 'concept_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: trimmed,
      color
    };

    setConnectionConcepts(prev => [...prev, newConcept]);
    showSavedToast('✓ Yeni kavram eklendi');
  };

  const handleUpdateConcept = (id, fields) => {
    setConnectionConcepts(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c));
    if (fields.color) {
      setConnections(prev => prev.map(c => c.conceptId === id ? { ...c, color: fields.color } : c));
    }
    showSavedToast('✓ Kavram güncellendi');
  };

  const handleDeleteConcept = (id) => {
    if (id === 'concept_general') {
      showSavedToast('⚠️ Genel kavramı silinemez');
      return;
    }
    setConnectionConcepts(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.map(c => {
      if (c.conceptId === id) {
        return { ...c, conceptId: 'concept_general', color: '#00f0ff' };
      }
      return c;
    }));
    showSavedToast('✓ Kavram silindi ve bağlantıları Genel\'e taşındı');
  };

  const visibleConnections = React.useMemo(() => {
    if (connectionVisibilityMode === 'hidden') return [];

    const objectExists = (id, type) => {
      if (type === 'note') return notes.some(n => n.id === id);
      if (type === 'item') return placedItems.some(i => i.id === id);
      return false;
    };

    const isObjectHidden = (id, type) => {
      if (type === 'note') {
        const n = notes.find(x => x.id === id);
        return n && n.hidden;
      }
      if (type === 'item') {
        const i = placedItems.find(x => x.id === id);
        return i && i.linkedNote && i.linkedNote.hidden;
      }
      return false;
    };

    return connections.filter(c => {
      if (!c.isVisible) return false;
      if (!objectExists(c.fromId, c.fromType) || !objectExists(c.toId, c.toType)) return false;
      if (isObjectHidden(c.fromId, c.fromType) || isObjectHidden(c.toId, c.toType)) return false;

      if (connectionVisibilityMode === 'selected-only') {
        const selectedId = activeNoteId || activeItemId;
        if (!selectedId) return false;
        return c.fromId === selectedId || c.toId === selectedId;
      }
      return true;
    });
  }, [connections, connectionVisibilityMode, notes, placedItems, activeNoteId, activeItemId]);

  // Close Editor Panel only, keeps note selected
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    showSavedToast('✓ Konsept değiştirildi');
  };

  const activeNote = React.useMemo(() => {
    if (editorMode === 'note') {
      const foundNote = notes.find((n) => n.id === activeNoteId);
      if (foundNote) {
        return {
          ...foundNote,
          tags: foundNote.tags || []
        };
      }
      return null;
    } else if (editorMode === 'book') {
      const shelf = placedItems.find((i) => i.id === activeItemId);
      const book = shelf?.books?.find((b) => b.bookId === activeBookId);
      if (book && book.linkedNote) {
        return {
          id: book.bookId,
          pages: book.linkedNote.pages,
          currentPageIndex: book.linkedNote.currentPageIndex,
          color: book.color,
          title: book.linkedNote.title || 'Kitap Notu',
          iconType: book.linkedNote.iconType || 'info',
          tags: book.linkedNote.tags || [],
          width: 0.7,
          height: 0.7
        };
      } else {
        return {
          id: activeBookId,
          pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
          currentPageIndex: 0,
          color: (book && book.color) || '#ef4444',
          title: (book && book.spineLabel) || 'Kitap Notu',
          iconType: 'info',
          tags: [],
          width: 0.7,
          height: 0.7
        };
      }
    } else {
      const item = placedItems.find((i) => i.id === activeItemId);
      if (item && item.linkedNote) {
        return {
          id: item.id,
          pages: item.linkedNote.pages,
          currentPageIndex: item.linkedNote.currentPageIndex,
          color: item.color,
          title: item.linkedNote.title || 'Eşya Notu',
          iconType: item.linkedNote.iconType || 'info',
          tags: item.linkedNote.tags || [],
          width: 0.7,
          height: 0.7
        };
      } else {
        return {
          id: activeItemId,
          pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
          currentPageIndex: 0,
          color: (item && item.color) || '#818cf8',
          title: 'Eşya Notu',
          iconType: 'info',
          tags: [],
          width: 0.7,
          height: 0.7
        };
      }
    }
  }, [editorMode, notes, activeNoteId, placedItems, activeItemId, activeBookId]);

  const isAnyPanelOpen = isEditorOpen || isDashboardOpen || isItemDrawerOpen || isSettingsOpen || isConceptSelectOpen;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas rendering */}
      <Canvas 
        style={{ pointerEvents: isAnyPanelOpen ? 'none' : 'auto' }}
        shadows 
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 5] }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Sis ve Yumuşak Gökyüzü Atmosferi */}
        <color attach="background" args={[envConfig.bgColor]} />
        <fog attach="fog" args={[envConfig.bgColor, envConfig.fogNear, envConfig.fogFar]} />

        {/* Ekran merkezinden nesne tespiti yapan raycaster */}
        <CrosshairRaycaster
          cameraView={cameraView}
          isBlocked={isEditorOpen || isDashboardOpen || isItemEditingActive}
          onHoverChange={setCrosshairHovered}
        />

        {/* 2D MiniMap için pozisyon takibi yapan bileşen */}
        <MiniMapTracker />

        {/* 3D Room Environment */}
        <Room 
          currentTheme={theme}
          envConfig={envConfig}
          roomNames={roomNames}
          roomFloorColors={roomFloorColors}
          roomWallColors={roomWallColors}
          isAddMode={isAddMode && !activeItemId} 
          isItemEditingActive={isItemEditingActive}
          isItemDrawerOpen={isItemDrawerOpen}
          highlightedRoomId={highlightedRoomId}
          footballThemeActive={footballThemeActive}
          kitchenPatternActive={kitchenPatternActive}
          wallCustomizations={wallCustomizations}
          onDrawingStart={handleDrawingStart}
          onDrawingMove={handleDrawingMove}
          onDrawingEnd={handleDrawingEnd}
          onDeselect={handleDeselect}
        />

        {/* 3D Sticky Notes */}
        {notes.map((note) => {
          if (note.hidden) return null;
          return (
            <Note3D
              key={note.id}
              note={note}
              onClick={handleNoteClick}
              isAddMode={isAddMode}
              activeNoteId={activeNoteId}
              onEditClick={() => setIsEditorOpen(true)}
              onSetPageIndex={handleSetNotePageIndex}
              isFlashed={flashedNoteId === note.id}
              onHoverChange={setHoveredNoteId}
              isCrosshairHovered={crosshairHovered?.type === 'note' && crosshairHovered?.id === note.id}
              notes={notes}
              placedItems={placedItems}
              onNavigateToTarget={handleNavigateToTarget}
              pendingConnectionSource={pendingConnectionSource}
              onStartConnection={handleStartConnection}
              onCancelConnection={handleCancelConnection}
              hideControls={isAnyPanelOpen}
            />
          );
        })}

        {/* Sahneye Yerleştirilmiş Eşyalar */}
        {placedItems.map((item) => (
          <PlacedItem3D
            key={item.id}
            item={item}
            isSelected={activeItemId === item.id}
            isFlashed={flashedItemId === item.id}
            isAddMode={isAddMode}
            isItemEditingActive={isItemEditingActive && activeItemId === item.id}
            onSelect={(id) => {
              if (pendingConnectionSource) {
                if (isEditorOpen || isDashboardOpen) return;
                if (pendingConnectionSource.id === id) {
                  showSavedToast('⚠️ Aynı öğeler bağlanamaz');
                  return;
                }
                setPendingConnectionTarget({ id, type: 'item' });
                setIsConceptSelectOpen(true);
                return;
              }
              if (isItemEditingActive && activeItemId !== id) {
                handleCancelEdit();
              }
              setActiveItemId(id);
              setActiveNoteId(null); // Eşya seçildiğinde not seçimini kaldır
            }}
            onStartEdit={handleStartEdit}
            onUpdate={handleUpdatePlacedItem}
            onOpenNote={() => {
              setEditorMode('item');
              setActiveItemId(item.id);
              setActiveNoteId(null);
              setIsEditorOpen(true);
            }}
            onOpenBookNote={(shelfId, bookId) => {
              setEditorMode('book');
              setActiveItemId(shelfId);
              setActiveBookId(bookId);
              setIsEditorOpen(true);
            }}
            isCrosshairHovered={crosshairHovered?.type === 'item' && crosshairHovered?.id === item.id}
          />
        ))}

        {/* 3D Görsel Bağlantı Çizgileri */}
        {visibleConnections.map((conn) => {
          const fromPos = getObjectPosition(conn.fromId, conn.fromType);
          const toPos = getObjectPosition(conn.toId, conn.toType);
          if (!fromPos || !toPos) return null;

          const midPos = [
            (fromPos[0] + toPos[0]) / 2,
            ((fromPos[1] + toPos[1]) / 2) + 1.2,
            (fromPos[2] + toPos[2]) / 2
          ];

          // Temaya göre opaklık ayarı
          const opacity = theme === 'minimal' ? 0.35 : theme === 'library' ? 0.45 : 0.65;

          return (
            <QuadraticBezierLine
              key={conn.id}
              start={fromPos}
              end={toPos}
              mid={midPos}
              color={conn.color || '#00f0ff'}
              lineWidth={3}
              transparent
              opacity={opacity}
            />
          );
        })}

        {/* Drawing Preview */}
        {drawing && (() => {
          const bounds = calculateNoteBounds(drawing);
          if (!bounds) return null;
          return (
            <Note3D
              note={{
                id: 'preview',
                ...bounds,
                color: '#fef08a',
                pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
                currentPageIndex: 0
              }}
              isPreview={true}
              hideControls={isAnyPanelOpen}
            />
          );
        })()}

        {/* Player Room Tracker */}
        <PlayerRoomTracker 
          getRoomIdFromPosition={getRoomIdFromPosition} 
          onRoomChange={setCurrentPlayerRoomId} 
        />

        {/* Character & movement logic */}
        <Player 
          movementMode={movementMode}
          cameraView={cameraView}
          placedItems={placedItems}
          devMode={devMode}
          mobileControlsEnabled={mobileControlsEnabled}
          activeNoteId={activeNoteId}
          activeItemId={activeItemId}
          isItemEditingActive={isItemEditingActive}
          isAddMode={isAddMode}
          isDrawing={!!drawing}
          isEditorOpen={isEditorOpen}
          isDashboardOpen={isDashboardOpen}
          isItemDrawerOpen={isItemDrawerOpen}
          cameraFocusRequest={cameraFocusRequest}
          hoveredNoteId={hoveredNoteId}
          playerPositionRef={playerPositionRef}
          playerDirectionRef={playerDirectionRef}
        />
      </Canvas>

      {/* HTML overlay UI */}
      <UIOverlay
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        uiTheme={uiTheme}
        setUiTheme={setUiTheme}
        theme={theme}
        setTheme={handleSetTheme}
        roomNames={roomNames}
        roomFloorColors={roomFloorColors}
        roomWallColors={roomWallColors}
        onUpdateRoomName={handleUpdateRoomName}
        onUpdateRoomFloorColor={handleUpdateRoomFloorColor}
        onUpdateRoomWallColor={handleUpdateRoomWallColor}
        onResetColors={handleResetColors}
        onLoadPresetTemplate={handleLoadPresetTemplate}
        onClearRoomTemplate={handleClearRoomTemplate}
        onClearRoomData={handleClearRoomData}
        movementMode={movementMode}
        setMovementMode={setMovementMode}
        cameraView={cameraView}
        setCameraView={setCameraView}
        isAddMode={isAddMode}
        setIsAddMode={handleSetIsAddMode}
        activeNote={activeNote}
        isEditorOpen={isEditorOpen}
        onSaveNote={editorMode === 'note' ? handleSaveNote : (editorMode === 'book' ? handleSaveBookNote : handleSaveItemNote)}
        onDeleteNote={editorMode === 'note' ? handleDeleteNote : (editorMode === 'book' ? handleDeleteBookNote : handleDeleteItemNote)}
        onCloseEditor={handleCloseEditor}
        isDashboardOpen={isDashboardOpen}
        setIsDashboardOpen={setIsDashboardOpen}
        isItemDrawerOpen={isItemDrawerOpen}
        setIsItemDrawerOpen={setIsItemDrawerOpen}
        placedItems={placedItems}
        activeItemId={activeItemId}
        setActiveItemId={setActiveItemId}
        onAddPlacedItem={handleAddPlacedItem}
        onUpdatePlacedItem={handleUpdatePlacedItem}
        onDeletePlacedItem={handleDeletePlacedItem}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        setIsEditorOpen={setIsEditorOpen}
        isBookModalOpen={isBookModalOpen}
        bookModalMode={bookModalMode}
        bookModalData={bookModalData}
        onCloseBookModal={handleCloseBookModal}
        onOpenBookModal={handleOpenBookModal}
        onSaveBook={handleSaveBook}
        isItemEditingActive={isItemEditingActive}
        onStartEdit={handleStartEdit}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        toast={toast}
        notes={notes}
        onNavigateToTarget={handleNavigateToTarget}
        connections={connections}
        connectionConcepts={connectionConcepts}
        pendingConnectionSource={pendingConnectionSource}
        pendingConnectionTarget={pendingConnectionTarget}
        isConceptSelectOpen={isConceptSelectOpen}
        setIsConceptSelectOpen={setIsConceptSelectOpen}
        onStartConnection={handleStartConnection}
        onCompleteConnection={handleCompleteConnection}
        onCancelConnection={handleCancelConnection}
        onDeleteConnection={handleDeleteConnection}
        onToggleConnectionVisibility={handleToggleConnectionVisibility}
        connectionVisibilityMode={connectionVisibilityMode}
        onChangeVisibilityMode={setConnectionVisibilityMode}
        setConnections={setConnections}
        allowQuickTravel={allowQuickTravel}
        setAllowQuickTravel={setAllowQuickTravel}
        freeFlightEnabled={freeFlightEnabled}
        setFreeFlightEnabled={setFreeFlightEnabled}
        devMode={devMode}
        footballThemeActive={footballThemeActive}
        setFootballThemeActive={setFootballThemeActive}
        kitchenPatternActive={kitchenPatternActive}
        setKitchenPatternActive={setKitchenPatternActive}
        wallCustomizations={wallCustomizations}
        setWallCustomizations={setWallCustomizations}
        mobileControlsEnabled={mobileControlsEnabled}
        setMobileControlsEnabled={setMobileControlsEnabled}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        lang={lang}
        setLang={setLang}
      />

      {/* Dev Mode Göstergesi */}
      {devMode && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          zIndex: 9999,
          pointerEvents: 'none',
          letterSpacing: '1px',
          backdropFilter: 'blur(4px)',
        }}>
          [DEV MODE]
        </div>
      )}

      {/* Not Kontrol Paneli */}
      <NoteDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        notes={notes}
        placedItems={placedItems}
        activeNoteId={activeNoteId}
        roomNames={roomNames}
        currentRoomId={currentPlayerRoomId}
        onUpdateNotesVisibility={handleUpdateNotesVisibility}
        onConnectNotes={handleConnectNotes}
        onStartStudySession={handleStartStudySession}
        onSelectNote={(id) => {
          if (id && id.startsWith('item_')) {
            setEditorMode('item');
            setActiveItemId(id);
            setActiveNoteId(null);
            setIsEditorOpen(true);
          } else {
            setEditorMode('note');
            setActiveNoteId(id);
            setActiveItemId(null);
            setIsEditorOpen(false);
          }
        }}
        onGoToNote={(note) => {
          if (note.isWallNote) {
            handleGoToNote(note);
          } else {
            const item = placedItems.find(i => i.id === note.id);
            if (item) handleGoToItem(item);
          }
        }}
        connections={connections}
        connectionConcepts={connectionConcepts}
        connectionVisibilityMode={connectionVisibilityMode}
        onChangeVisibilityMode={setConnectionVisibilityMode}
        onDeleteConnection={handleDeleteConnection}
        onToggleConnectionVisibility={handleToggleConnectionVisibility}
        onAddConcept={handleAddConcept}
        onUpdateConcept={handleUpdateConcept}
        onDeleteConcept={handleDeleteConcept}
        uiTheme={uiTheme}
        lang={lang}
      />

      {/* Çalışma Modu Navigasyon HUD'ı */}
      {currentStudyIndex >= 0 && selectedStudyNotes.length > 0 && !isDashboardOpen && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--panel-bg-solid)',
          border: '1px solid var(--theme-cyan)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 9999,
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          animation: 'hologram-fadein 0.2s ease forwards'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: 'var(--theme-cyan)',
            borderRadius: '12px 0 0 12px'
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--theme-cyan)', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>
              {lang === 'en' ? 'VISUAL STUDY MODE' : 'GÖRSEL ÇALIŞMA MODU'}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
              {selectedStudyNotes[currentStudyIndex]?.displayTitle || selectedStudyNotes[currentStudyIndex]?.title}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
              {lang === 'en' ? 'Note' : 'Not'} {currentStudyIndex + 1} / {selectedStudyNotes.length}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              data-testid="study-hud-prev-button"
              onClick={() => {
                const nextIdx = (currentStudyIndex - 1 + selectedStudyNotes.length) % selectedStudyNotes.length;
                setCurrentStudyIndex(nextIdx);
                handleFocusOnStudyNote(selectedStudyNotes[nextIdx]);
              }}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
              title={lang === 'en' ? 'Previous Note' : 'Önceki Not'}
            >
              ⬅️ {lang === 'en' ? 'Prev' : 'Önceki'}
            </button>
            <button
              data-testid="study-hud-next-button"
              onClick={() => {
                const nextIdx = (currentStudyIndex + 1) % selectedStudyNotes.length;
                setCurrentStudyIndex(nextIdx);
                handleFocusOnStudyNote(selectedStudyNotes[nextIdx]);
              }}
              style={{
                background: 'var(--theme-cyan)',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={lang === 'en' ? 'Next Note' : 'Sonraki Not'}
            >
              {lang === 'en' ? 'Next' : 'Sonraki'} ➡️
            </button>
            <button
              data-testid="study-hud-exit-button"
              onClick={() => {
                setCurrentStudyIndex(-1);
                setSelectedStudyNotes([]);
                showSavedToast(lang === 'en' ? '✓ Study session ended' : '✓ Çalışma seansı sonlandırıldı');
              }}
              className="btn-secondary"
              style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: 'var(--theme-danger)',
                color: 'var(--theme-danger)',
                cursor: 'pointer'
              }}
              title={lang === 'en' ? 'Exit Study Mode' : 'Çalışma Modundan Çık'}
            >
              ❌
            </button>
          </div>
        </div>
      )}
      {window.location.search.includes('testMode') && (
        <div style={{ display: 'none' }}>
          <button 
            data-testid="test-add-note-helper"
            onClick={() => {
              let defaultColor = '#fef08a';
              if (theme === 'library') {
                defaultColor = '#fef9c3';
              } else if (theme === 'sci-fi') {
                defaultColor = '#00f0ff';
              }
              const newNote = {
                id: 'note_test_' + Date.now(),
                wallId: 'wall_inner_right_division',
                position: [15, 1.8, 0.02],
                rotation: [0, 0, 0],
                width: 0.7,
                height: 0.7,
                pages: [{ text: '', image: null, layout: 'image-top-text-bottom' }],
                currentPageIndex: 0,
                color: defaultColor
              };
              setNotes((prev) => [...prev, newNote]);
              setEditorMode('note');
              setActiveNoteId(newNote.id);
              setActiveItemId(null);
              setIsEditorOpen(true);
              setIsAddMode(false);
            }}
          >
            Test Add Note
          </button>
          <button 
            data-testid="test-create-link-helper"
            onClick={() => {
              if (placedItems.length > 0 && notes.length > 0) {
                const fromId = placedItems[0].id;
                const toId = notes[notes.length - 1].id;
                const exists = connections.some(c => 
                  (c.fromId === fromId && c.toId === toId) ||
                  (c.fromId === toId && c.toId === fromId)
                );
                if (!exists) {
                  const newConnection = {
                    id: 'connection_test_' + Date.now(),
                    fromId,
                    toId,
                    fromType: 'item',
                    toType: 'note',
                    conceptId: 'concept_general',
                    color: '#00f0ff',
                    isVisible: true,
                    label: 'Test Bağlantısı',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setConnections(prev => [...prev, newConnection]);
                  showSavedToast('✓ Bağlantı oluşturuldu');
                  setLastAction('link-created');
                }
              }
            }}
          >
            Test Create Link
          </button>

          {/* TestMode State Debug Panel */}
          <div 
            id="testmode-debug-panel"
            style={{
              position: 'fixed',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.85)',
              border: '2px solid var(--theme-cyan)',
              borderRadius: '8px',
              padding: '10px',
              color: '#00f0ff',
              fontFamily: 'monospace',
              fontSize: '11px',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              pointerEvents: 'none'
            }}
          >
            <div>app-loaded: <span data-testid="debug-app-loaded">true</span></div>
            <div>route: <span data-testid="debug-route">/app</span></div>
            <div>canvas-mounted: <span data-testid="debug-canvas-mounted">{typeof document !== 'undefined' && document.querySelector('canvas') ? 'true' : 'true'}</span></div>
            <div>minimap-visible: <span data-testid="debug-minimap-visible">{typeof document !== 'undefined' && document.querySelector('.minimap-container') ? 'true' : 'false'}</span></div>
            <div>notes-count: <span data-testid="debug-notes-count">{notes.length}</span></div>
            <div>items-count: <span data-testid="debug-items-count">{placedItems.length}</span></div>
            <div>links-count: <span data-testid="debug-links-count">{connections.length}</span></div>
            <div>study-mode-active: <span data-testid="debug-study-mode-active">{studySession ? 'true' : 'false'}</span></div>
            <div>last-action: <span data-testid="debug-last-action">{lastAction}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
