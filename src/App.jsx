// Hologram dashboard integration active
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Room from './components/Room';
import Player from './components/Player';
import Note3D from './components/Note3D';
import PlacedItem3D from './components/PlacedItem3D';
import UIOverlay from './components/UIOverlay';
import NoteDashboard from './components/NoteDashboard';
import { getAllNotes, saveAllNotesToDB, initDB } from './utils/db';

const LOCAL_STORAGE_KEY = 'saray_3d_mindmap_notes';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraMode, setCameraMode] = useState('free'); // 'free' or 'third-person'
  const [isAddMode, setIsAddMode] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false); // New state to control large editor modal visibility
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [cameraFocusRequest, setCameraFocusRequest] = useState(null);
  const [flashedNoteId, setFlashedNoteId] = useState(null);
  const [flashedItemId, setFlashedItemId] = useState(null);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const [editorMode, setEditorMode] = useState('note'); // 'note' or 'item'
  const [theme, setTheme] = useState(() => localStorage.getItem('saray_mindmap_theme') || 'minimal');

  // Eşya yerleştirme sistemi state'leri
  const [placedItems, setPlacedItems] = useState(() => {
    const saved = localStorage.getItem('saray_placed_items');
    if (!saved) return [];
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

  useEffect(() => {
    localStorage.setItem('saray_placed_items', JSON.stringify(placedItems));
  }, [placedItems]);

  useEffect(() => {
    localStorage.setItem('saray_mindmap_theme', theme);
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

  const handleUpdateRoomName = (roomId, newName) => {
    setRoomNames((prev) => ({ ...prev, [roomId]: newName }));
  };

  const handleUpdateRoomFloorColor = (roomId, color) => {
    setRoomFloorColors((prev) => ({ ...prev, [roomId]: color }));
  };

  const handleUpdateRoomWallColor = (roomId, color) => {
    setRoomWallColors((prev) => ({ ...prev, [roomId]: color }));
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
    const roomId = getRoomIdFromPosition(px, pz);
    
    // Halı zemin hizasında, raf havada, diğerleri zeminde
    const yPos = type === 'wallshelf' ? 1.4 : type === 'rug' ? 0.001 : 0.005;

    const limits = {
      hall: { minX: -4.5, maxX: 4.5, minZ: -24.5, maxZ: 24.5 },
      bedroom: { minX: -24.5, maxX: -5.5, minZ: 0.5, maxZ: 24.5 },
      kitchen: { minX: -24.5, maxX: -5.5, minZ: -24.5, maxZ: -0.5 },
      study: { minX: 5.5, maxX: 24.5, minZ: 0.5, maxZ: 24.5 },
      living: { minX: 5.5, maxX: 24.5, minZ: -24.5, maxZ: -0.5 },
      unknown: { minX: -24.5, maxX: 24.5, minZ: -24.5, maxZ: 24.5 }
    };

    const roomLimit = limits[roomId] || limits.unknown;
    
    const clampedX = Math.max(roomLimit.minX, Math.min(roomLimit.maxX, px));
    const clampedZ = Math.max(roomLimit.minZ, Math.min(roomLimit.maxZ, pz));

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
  };

  const handleStartEdit = (itemId) => {
    const item = placedItems.find(i => i.id === itemId);
    if (item) {
      setEditingItemBackup(JSON.parse(JSON.stringify(item)));
      setIsItemEditingActive(true);
      setActiveItemId(itemId);
    }
  };

  const handleSaveEdit = () => {
    setIsItemEditingActive(false);
    setEditingItemBackup(null);
  };

  const handleCancelEdit = () => {
    if (editingItemBackup) {
      setPlacedItems(prev => prev.map(i => i.id === editingItemBackup.id ? editingItemBackup : i));
    }
    setIsItemEditingActive(false);
    setEditingItemBackup(null);
  };

  const handleSaveItemNote = (itemId, pages, currentPageIndex, title, iconType = 'info') => {
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
              updatedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
    setIsEditorOpen(false);
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
  };

  const handleGoToItem = (item) => {
    setIsDashboardOpen(false);
    setEditorMode('item');
    setActiveItemId(item.id);
    setActiveNoteId(null);
    setIsAddMode(false);
    
    // Trigger flash effect
    setFlashedItemId(item.id);
    setTimeout(() => {
      setFlashedItemId(null);
    }, 2000);

    // Eşyaya gitmek için kamera odağı ayarla
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
          if (e.code === 'KeyQ') {
            const currentRot = item.rotation || { x: 0, y: 0, z: 0 };
            const ry = (currentRot.y || 0) + Math.PI / 12; // 15 derece sola
            handleUpdatePlacedItem(activeItemId, { rotation: { ...currentRot, y: ry } });
            e.preventDefault();
            return;
          }
          if (e.code === 'KeyE') {
            const currentRot = item.rotation || { x: 0, y: 0, z: 0 };
            const ry = (currentRot.y || 0) - Math.PI / 12; // 15 derece sağa
            handleUpdatePlacedItem(activeItemId, { rotation: { ...currentRot, y: ry } });
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

      if (e.code === 'KeyC') {
        setCameraMode((prev) => (prev === 'free' ? 'third-person' : 'free'));
      }
      
      if (e.code === 'KeyE') {
        if (!isDashboardOpen) {
          setIsAddMode((prev) => !prev);
        }
      }

      if (e.code === 'KeyH') {
        setIsDashboardOpen((prev) => !prev);
      }

      if (e.code === 'Escape') {
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
  }, [isDashboardOpen, activeItemId, placedItems, isItemEditingActive, editingItemBackup, handleDeletePlacedItem, handleUpdatePlacedItem]);

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
  }, [isItemEditingActive, editingItemBackup]);

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
    setEditorMode('note');
    setActiveNoteId(id);
    setActiveItemId(null); // Eşya seçimini kaldır
    setIsEditorOpen(false); // Ensure editor is closed when a new note is selected
  };

  // Deselect currently active note or item when clicking empty wall or floor
  const handleDeselect = () => {
    setActiveNoteId(null);
    setActiveItemId(null);
    setIsEditorOpen(false); // Close editor when deselecting
  };

  // Directly sets a note's page index from 3D controls
  const handleSetNotePageIndex = (id, index) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, currentPageIndex: index } : n))
    );
  };

  // Save changes to note
  const handleSaveNote = (id, pages, currentPageIndex, color) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pages, currentPageIndex, color, updatedAt: new Date().toISOString() } : n))
    );
    setIsEditorOpen(false);
  };

  // Delete note
  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setIsEditorOpen(false);
    setActiveNoteId(null);
  };

  // Handle focusing/teleporting camera to note and flashing it
  const handleGoToNote = (note) => {
    setIsDashboardOpen(false);
    setEditorMode('note');
    setActiveNoteId(note.id);
    setActiveItemId(null); // Eşya seçimini kaldır
    setIsAddMode(false);
    
    // Trigger flash effect
    setFlashedNoteId(note.id);
    setTimeout(() => {
      setFlashedNoteId(null);
    }, 2000);

    // Calculate look position and orientation
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
  };

  // Close Editor Panel only, keeps note selected
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  const activeNote = React.useMemo(() => {
    if (editorMode === 'note') {
      return notes.find((n) => n.id === activeNoteId);
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
          width: 0.7,
          height: 0.7
        };
      }
    }
  }, [editorMode, notes, activeNoteId, placedItems, activeItemId]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas rendering */}
      <Canvas 
        style={{ pointerEvents: (isEditorOpen || isDashboardOpen) ? 'none' : 'auto' }}
        shadows 
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 5] }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        {/* 3D Room Environment */}
        <Room 
          currentTheme={theme}
          roomNames={roomNames}
          roomFloorColors={roomFloorColors}
          roomWallColors={roomWallColors}
          isAddMode={isAddMode && !activeItemId} 
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
          />
        ))}

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
          cameraFocusRequest={cameraFocusRequest}
          hoveredNoteId={hoveredNoteId}
          playerPositionRef={playerPositionRef}
        />
      </Canvas>

      {/* HTML overlay UI */}
      <UIOverlay
        theme={theme}
        setTheme={setTheme}
        roomNames={roomNames}
        roomFloorColors={roomFloorColors}
        roomWallColors={roomWallColors}
        onUpdateRoomName={handleUpdateRoomName}
        onUpdateRoomFloorColor={handleUpdateRoomFloorColor}
        onUpdateRoomWallColor={handleUpdateRoomWallColor}
        onResetColors={handleResetColors}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        isAddMode={isAddMode}
        setIsAddMode={setIsAddMode}
        activeNote={activeNote}
        isEditorOpen={isEditorOpen}
        onSaveNote={editorMode === 'note' ? handleSaveNote : handleSaveItemNote}
        onDeleteNote={editorMode === 'note' ? handleDeleteNote : handleDeleteItemNote}
        onCloseEditor={handleCloseEditor}
        isDashboardOpen={isDashboardOpen}
        setIsDashboardOpen={setIsDashboardOpen}
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
      />

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
      />
    </div>
  );
}
