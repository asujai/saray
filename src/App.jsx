// Hologram dashboard integration active
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
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

const LOCAL_STORAGE_KEY = 'saray_3d_mindmap_notes';

const PRESET_ITEMS = [
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
      title: "Ana Çalışma Alanı",
      pages: [{ text: "Bu masayı aktif çalıştığın konular için kullanabilirsin.", image: null, layout: 'image-top-text-bottom' }],
      currentPageIndex: 0,
      iconType: "info",
      tags: ["Çalışma"]
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
      title: "Kaynaklar",
      pages: [{ text: "Kitap, makale, video ve araştırma kaynaklarını bu alana bağlayabilirsin.", image: null, layout: 'image-top-text-bottom' }],
      currentPageIndex: 0,
      iconType: "info",
      tags: ["Kaynak"]
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
      title: "Başlangıç",
      pages: [{ text: "Buraya ilk ana fikrini yaz. Sonra diğer notları bu fikirle ilişkilendir.", image: null, layout: 'image-top-text-bottom' }],
      currentPageIndex: 0,
      iconType: "info",
      tags: ["Başlangıç"]
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
      title: "Kısa Fikirler",
      pages: [{ text: "Henüz tam gelişmemiş fikirleri burada tutabilirsin.", image: null, layout: 'image-top-text-bottom' }],
      currentPageIndex: 0,
      iconType: "info",
      tags: ["Fikir"]
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
  }
];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [crosshairHovered, setCrosshairHovered] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const toastTimeoutRef = useRef(null);

  const showSavedToast = (message = '✓ Kaydedildi') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 1000);
  };
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraMode, setCameraMode] = useState('third-person'); // 'free' or 'third-person'
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
  const [freeFlightEnabled, setFreeFlightEnabled] = useState(() => localStorage.getItem('saray_free_flight_enabled') === 'true');
  const [devMode, setDevMode] = useState(() => localStorage.getItem('saray_dev_mode_enabled') === 'true');
  const [highlightedRoomId, setHighlightedRoomId] = useState(null);
  const highlightTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('saray_mindmap_theme') || 'minimal');
  const [uiTheme, setUiTheme] = useState(() => localStorage.getItem('saray_ui_theme') || 'dark');

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${uiTheme}-theme`);
    localStorage.setItem('saray_ui_theme', uiTheme);
  }, [uiTheme]);

  // Eşya yerleştirme sistemi state'leri
  const [placedItems, setPlacedItems] = useState(() => {
    const saved = localStorage.getItem('saray_placed_items');
    const presetInitialized = localStorage.getItem('saray_preset_rooms_initialized');
    if (!saved) {
      if (!presetInitialized) {
        return PRESET_ITEMS;
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

  useEffect(() => {
    if (!devMode) {
      setFreeFlightEnabled(false);
      if (cameraMode === 'free') {
        setCameraMode('third-person');
      }
    }
  }, [devMode, cameraMode]);

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
    return saved ? JSON.parse(saved) : {
      hall: 'Giriş / Hol',
      bedroom: 'Yatak Odası',
      kitchen: 'Mutfak',
      study: 'Çalışma Odası',
      living: 'Salon'
    };
  });

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
    setPlacedItems((prev) => {
      const filtered = prev.filter(item => item.roomId !== 'study');
      const updated = [...filtered, ...PRESET_ITEMS];
      localStorage.setItem('saray_placed_items', JSON.stringify(updated));
      return updated;
    });

    const studyWalls = ['wall_front_study', 'wall_right_study', 'wall_inner_right_division'];
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

    const studyWalls = ['wall_front_study', 'wall_right_study', 'wall_inner_right_division'];
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
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
    if (activeItemId === id) {
      setActiveItemId(null);
    }
    showSavedToast('✓ Eşya silindi');
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

  const handleSaveItemNote = (itemId, pages, currentPageIndex, title, iconType = 'info', tags = []) => {
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
      // Geliştirici Modu Kısayolu: Ctrl + Shift + F
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
        setDevMode((prev) => {
          const next = !prev;
          if (next) {
            setFreeFlightEnabled(true);
            setCameraMode('free');
            showSavedToast('✓ Geliştirici Modu & Uçuş Aktif');
          } else {
            setFreeFlightEnabled(false);
            setCameraMode('third-person');
            showSavedToast('✓ Geliştirici Modu Kapatıldı');
          }
          return next;
        });
        e.preventDefault();
        return;
      }

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
        if (cameraMode !== 'birds-eye' && !isBlocked) {
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

      if (e.code === 'KeyC') {
        setCameraMode((prev) => {
          if (prev === 'third-person') return 'birds-eye';
          if (prev === 'birds-eye') return freeFlightEnabled ? 'free' : 'third-person';
          return 'third-person'; // free → third-person
        });
      }
      
      if (e.code === 'KeyE') {
        if (!isDashboardOpen && cameraMode !== 'birds-eye') {
          setIsAddMode((prev) => !prev);
        }
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDashboardOpen, activeItemId, placedItems, isItemEditingActive, editingItemBackup, handleDeletePlacedItem, handleUpdatePlacedItem, crosshairHovered, theme, cameraMode, isEditorOpen, pendingConnectionSource, freeFlightEnabled]);

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
  const handleSaveNote = (id, pages, currentPageIndex, color, tags = []) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pages, currentPageIndex, color, tags, updatedAt: new Date().toISOString() } : n))
    );
    setIsEditorOpen(false);
    showSavedToast('✓ Not kaydedildi');
  };

  // Delete note
  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setIsEditorOpen(false);
    setActiveNoteId(null);
    showSavedToast('✓ Not silindi');
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

    return connections.filter(c => {
      if (!c.isVisible) return false;
      if (!objectExists(c.fromId, c.fromType) || !objectExists(c.toId, c.toType)) return false;

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
  }, [editorMode, notes, activeNoteId, placedItems, activeItemId]);

  const isAnyPanelOpen = isEditorOpen || isDashboardOpen || isItemDrawerOpen || isSettingsOpen || isConceptSelectOpen;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas rendering */}
      <Canvas 
        style={{ pointerEvents: isAnyPanelOpen ? 'none' : 'auto' }}
        shadows 
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 5] }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        {/* Sis ve Yumuşak Gökyüzü Atmosferi */}
        <color attach="background" args={[envConfig.bgColor]} />
        <fog attach="fog" args={[envConfig.bgColor, envConfig.fogNear, envConfig.fogFar]} />

        {/* Ekran merkezinden nesne tespiti yapan raycaster */}
        <CrosshairRaycaster
          cameraMode={cameraMode}
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
          onDrawingStart={handleDrawingStart}
          onDrawingMove={handleDrawingMove}
          onDrawingEnd={handleDrawingEnd}
          onDeselect={handleDeselect}
        />

        {/* 3D Sticky Notes */}
        {notes.map((note) => (
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
        ))}

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
              lineWidth={1.5}
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

        {/* Character & movement logic */}
        <Player 
          cameraMode={cameraMode} 
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
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        isAddMode={isAddMode}
        setIsAddMode={handleSetIsAddMode}
        activeNote={activeNote}
        isEditorOpen={isEditorOpen}
        onSaveNote={editorMode === 'note' ? handleSaveNote : handleSaveItemNote}
        onDeleteNote={editorMode === 'note' ? handleDeleteNote : handleDeleteItemNote}
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
      />
    </div>
  );
}
