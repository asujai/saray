// UIOverlay dashboard button integration active
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Eye, Edit3, Save, Trash2, X, Plus, ChevronLeft, ChevronRight, ImagePlus, Compass, Settings } from 'lucide-react';

const COLOR_PALETTE = [
  { name: 'Sarı', value: '#fef08a' },
  { name: 'Mavi', value: '#bfdbfe' },
  { name: 'Yeşil', value: '#bbf7d0' },
  { name: 'Pembe', value: '#fbcfe8' },
  { name: 'Mor', value: '#e9d5ff' },
];

// Calculate dynamic character limit based on note dimensions
function calculateCharLimit(_w, _h) {
  return 100000;
}

// Compress image before storing as base64
function compressImage(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Safely normalize a page
function normalizePage(p) {
  if (!p) return { text: '', image: null, layout: 'image-top-text-bottom' };
  if (typeof p === 'string') return { text: p, image: null, layout: 'image-top-text-bottom' };
  return {
    text: p.text !== undefined ? p.text : '',
    image: p.image !== undefined ? p.image : null,
    layout: p.layout || 'image-top-text-bottom'
  };
}

const ROOM_LIMITS = {
  hall: { minX: -4.5, maxX: 4.5, minZ: -24.5, maxZ: 24.5 },
  bedroom: { minX: -24.5, maxX: -5.5, minZ: 0.5, maxZ: 24.5 },
  kitchen: { minX: -24.5, maxX: -5.5, minZ: -24.5, maxZ: -0.5 },
  study: { minX: 5.5, maxX: 24.5, minZ: 0.5, maxZ: 24.5 },
  living: { minX: 5.5, maxX: 24.5, minZ: -24.5, maxZ: -0.5 },
  unknown: { minX: -24.5, maxX: 24.5, minZ: -24.5, maxZ: 24.5 }
};

export default function UIOverlay({
  theme,
  setTheme,
  roomNames,
  roomFloorColors,
  roomWallColors,
  onUpdateRoomName,
  onUpdateRoomFloorColor,
  onUpdateRoomWallColor,
  onResetColors,
  cameraMode,
  setCameraMode,
  isAddMode,
  setIsAddMode,
  activeNote,
  isEditorOpen,
  onSaveNote,
  onDeleteNote,
  onCloseEditor,
  isDashboardOpen,
  setIsDashboardOpen,
  placedItems = [],
  activeItemId = null,
  setActiveItemId,
  onAddPlacedItem,
  onUpdatePlacedItem,
  onDeletePlacedItem,
  editorMode,
  setEditorMode,
  setIsEditorOpen,
  isItemEditingActive,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  toast = null,
  crosshairHovered = null
}) {
  const [pages, setPages] = useState([{ text: '', image: null, layout: 'image-top-text-bottom' }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [color, setColor] = useState('#fef08a');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Compute dynamic character limit from the active note's dimensions
  const charLimit = useMemo(() => {
    if (!activeNote) return 1000;
    return calculateCharLimit(activeNote.width, activeNote.height);
  }, [activeNote]);

  // Sync editor with the active note when opened/changed
  const [itemNoteTitle, setItemNoteTitle] = useState('Eşya Notu');
  const [iconType, setIconType] = useState('info');

  useEffect(() => {
    if (activeNote) {
      const activePages = (activeNote.pages || []).map(normalizePage);
      setPages(activePages.length > 0 ? activePages : [{ text: '', image: null, layout: 'image-top-text-bottom' }]);
      setPageIndex(activeNote.currentPageIndex || 0);
      setColor(activeNote.color || '#fef08a');
      setItemNoteTitle(activeNote.title || 'Eşya Notu');
      setIconType(activeNote.iconType || 'info');
    }
  }, [activeNote]);

  // Current page safe access
  const currentPage = useMemo(() => {
    if (!pages[pageIndex]) return { text: '', image: null, layout: 'image-top-text-bottom' };
    return normalizePage(pages[pageIndex]);
  }, [pages, pageIndex]);

  const currentTextLength = (currentPage.text || '').length;
  const isWarningLimit = currentTextLength > 40000;
  const isNearLimit = currentTextLength > 90000;
  const isAtLimit = currentTextLength >= charLimit;

  const handleTextChange = (e) => {
    const val = e.target.value;
    // Enforce dynamic limit
    if (val.length > charLimit) return;
    setPages((prev) => prev.map((p, idx) => (idx === pageIndex ? { ...normalizePage(p), text: val } : p)));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    try {
      const compressed = await compressImage(file, 1600, 0.8);
      setPages((prev) =>
        prev.map((p, idx) => (idx === pageIndex ? { ...normalizePage(p), image: compressed } : p))
      );
    } catch (err) {
      console.error('Görsel sıkıştırma hatası:', err);
      alert('Görsel yüklenirken bir hata oluştu.');
    }

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageDelete = () => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === pageIndex ? { ...normalizePage(p), image: null } : p))
    );
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (pageIndex < pages.length - 1) setPageIndex(pageIndex + 1);
  };

  const handleAddPage = () => {
    const newPages = [...pages, { text: '', image: null, layout: 'image-top-text-bottom' }];
    setPages(newPages);
    setPageIndex(newPages.length - 1);
  };

  const handleSave = () => {
    if (!activeNote) return;
    // Ensure all pages are normalized before saving
    const sanitizedPages = pages.map(normalizePage);
    if (editorMode === 'note') {
      onSaveNote(activeNote.id, sanitizedPages, pageIndex, color);
    } else {
      onSaveNote(activeNote.id, sanitizedPages, pageIndex, itemNoteTitle, iconType);
    }
  };

  const isOpen = isEditorOpen && !!activeNote;

  return (
    <div className="ui-container">
      {/* Merkez Crosshair Noktası */}
      {cameraMode === 'free' && !isEditorOpen && !isDashboardOpen && !isSettingsOpen && !isItemDrawerOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: crosshairHovered ? '8px' : '4px',
            height: crosshairHovered ? '8px' : '4px',
            borderRadius: '50%',
            background: crosshairHovered ? '#00f0ff' : 'rgba(255, 255, 255, 0.45)',
            boxShadow: crosshairHovered ? '0 0 10px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.5)' : 'none',
            pointerEvents: 'none',
            transition: 'all 0.15s ease',
            zIndex: 99999
          }}
        />
      )}

      {/* Auto-Save Toast Bildirimi */}
      {toast && toast.show && (
        <div 
          className="interactive-ui"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            padding: '12px 20px',
            borderRadius: '12px',
            color: '#00f0ff',
            fontSize: '0.85rem',
            fontFamily: 'sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
            zIndex: 999999,
            pointerEvents: 'auto'
          }}
        >
          <span style={{ fontWeight: 'bold' }}>{toast.message}</span>
        </div>
      )}
      {/* Modal Backdrop */}
      {isOpen && (
        <div 
          className="modal-backdrop open interactive-ui"
          onClick={onCloseEditor}
        />
      )}

      {/* Bottom Bar */}
      <div className="bottom-bar" style={{ justifyContent: 'space-between', marginTop: 'auto', width: '100%', padding: '0 24px 24px 24px', boxSizing: 'border-box' }}>
        {/* Sol tarafta tema seçici panel */}
        <div className="action-card glass-panel interactive-ui theme-selector-panel">
          <span className="theme-panel-title">Ev Konsepti</span>
          <div className="theme-buttons-group">
            <button 
              className={`btn-theme ${theme === 'minimal' ? 'active' : ''}`}
              onClick={() => setTheme('minimal')}
              title="Minimal Çalışma Evi - Sade, modern çalışma ortamı"
            >
              🏡 Minimal
            </button>
            <button 
              className={`btn-theme ${theme === 'library' ? 'active' : ''}`}
              onClick={() => setTheme('library')}
              title="Kütüphane / Bilgi Evi - Sıcak, ahşap kütüphane evi"
            >
              📚 Kütüphane
            </button>
            <button 
              className={`btn-theme ${theme === 'sci-fi' ? 'active' : ''}`}
              onClick={() => setTheme('sci-fi')}
              title="Bilim Kurgu / Hologram Evi - Teknolojik zihin laboratuvarı"
            >
              🌌 Bilim Kurgu
            </button>
          </div>
        </div>

        {/* Sağ tarafta kontrol butonları */}
        <div className="action-card glass-panel interactive-ui" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-secondary ${isDashboardOpen ? 'active' : ''}`}
            onClick={() => { setIsDashboardOpen(!isDashboardOpen); setIsSettingsOpen(false); setIsItemDrawerOpen(false); }}
            title="Not kontrol panelini aç/kapat (H)"
          >
            <Compass size={16} />
            <span>Kontrol Paneli (H)</span>
          </button>

          <button 
            className={`btn-secondary ${isAddMode ? 'active' : ''}`}
            onClick={() => { setIsAddMode(!isAddMode); setIsSettingsOpen(false); setIsItemDrawerOpen(false); }}
            disabled={isDashboardOpen}
            title={isDashboardOpen ? "Kontrol paneli açıkken not eklenemez" : "Duvara tıklayıp sürükleyerek (çizerek) not ekleyin"}
          >
            <Edit3 size={16} />
            <span>{isAddMode ? 'Duvara Sürükle & Çiz' : 'Not Ekleme Modu'}</span>
          </button>

          <button 
            className="btn-primary"
            onClick={() => setCameraMode(cameraMode === 'free' ? 'third-person' : 'free')}
          >
            <Eye size={16} />
            <span>Kamera Değiştir</span>
          </button>

          <button 
            className={`btn-primary ${isItemDrawerOpen ? 'active' : ''}`}
            onClick={() => { setIsItemDrawerOpen(!isItemDrawerOpen); setIsSettingsOpen(false); setIsDashboardOpen(false); }}
            title="Eşya kütüphanesini aç/kapat"
            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <Plus size={16} />
            <span>Eşya Ekle</span>
          </button>

          <button 
            className={`btn-primary ${isSettingsOpen ? 'active' : ''}`}
            onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsDashboardOpen(false); setIsItemDrawerOpen(false); }}
            title="Ev ayarlarını ve oda renklerini özelleştirin"
            style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}
          >
            <Settings size={16} />
            <span>Ayarlar</span>
          </button>
        </div>
      </div>

      {/* Ev Ayarları Özelleştirme Modalı */}
      {isSettingsOpen && (
        <div 
          className="modal-backdrop open interactive-ui"
          onClick={() => setIsSettingsOpen(false)}
          style={{ zIndex: 110 }}
        />
      )}
      <div 
        className={`settings-modal glass-panel interactive-ui ${isSettingsOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ zIndex: 112 }}
      >
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} className="settings-icon-glow" style={{ color: '#6366f1' }} />
            <h2 className="settings-title">Ev & Oda Özelleştirme</h2>
          </div>
          <button className="settings-close" onClick={() => setIsSettingsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Her Oda İçin Ayrı Bölüm */}
          {Object.entries({
            hall: 'Giriş / Hol',
            bedroom: 'Yatak Odası',
            kitchen: 'Mutfak',
            study: 'Çalışma Odası',
            living: 'Salon'
          }).map(([id, defaultLabel]) => (
            <div key={id} className="settings-room-row">
              <div className="room-name-input-group">
                <label className="room-input-label">{defaultLabel} Yeni Adı</label>
                <input
                  type="text"
                  className="room-name-input"
                  value={roomNames[id] || ''}
                  onChange={(e) => onUpdateRoomName(id, e.target.value)}
                  maxLength={20}
                />
              </div>
              
              <div className="color-selectors-group">
                <div>
                  <span className="color-selector-label">Zemin Rengi</span>
                  <div className="color-row">
                    {['#eae3d2', '#3e2723', '#0b0d19', '#eae6df', '#eedec3', '#bbf7d0', '#bfdbfe', '#fbcfe8'].map((c) => (
                      <div
                        key={c}
                        className={`color-dot ${roomFloorColors[id] === c ? 'selected' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => onUpdateRoomFloorColor(id, c)}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="color-selector-label">Duvar Rengi</span>
                  <div className="color-row">
                    {['#f8fafc', '#ebd9c0', '#1e293b', '#fafafa', '#cbd5e1', '#0f172a', '#022c22', '#1e1b4b'].map((c) => (
                      <div
                        key={c}
                        className={`color-dot ${roomWallColors[id] === c ? 'selected' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => onUpdateRoomWallColor(id, c)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="settings-footer">
          <button 
            className="btn-danger" 
            style={{ flex: 1, padding: '10px' }}
            onClick={onResetColors}
            title="Tüm odaların zemin ve duvar renklerini varsayılan konsept ayarlarına döndürür."
          >
            Özelleştirmeleri Sıfırla (Temaya Dön)
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1 }}
            onClick={() => setIsSettingsOpen(false)}
          >
            Tamam
          </button>
        </div>
      </div>

      {/* Eşya Kütüphanesi Çekmecesi (Sağdan kayarak açılan panel) */}
      {isItemDrawerOpen && (
        <div 
          className="modal-backdrop open interactive-ui"
          onClick={() => setIsItemDrawerOpen(false)}
          style={{ zIndex: 110 }}
        />
      )}
      <div 
        className={`item-drawer glass-panel interactive-ui ${isItemDrawerOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ zIndex: 112 }}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} className="drawer-icon-glow" style={{ color: '#10b981' }} />
            <h2 className="drawer-title">Eşya Kütüphanesi</h2>
          </div>
          <button className="drawer-close" onClick={() => setIsItemDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="item-types-grid">
            {[
              { id: 'desk', label: 'Çalışma Masası', icon: '💻' },
              { id: 'chair', label: 'Ofis Sandalyesi', icon: '🪑' },
              { id: 'shelf', label: 'Büyük Kitaplık', icon: '📚' },
              { id: 'wallshelf', label: 'Duvar Rafı', icon: '🗄️' },
              { id: 'plant', label: 'Saksı Bitkisi', icon: '🪴' },
              { id: 'lamp', label: 'Ayaklı Lamba', icon: '💡' },
              { id: 'rug', label: 'Desenli Halı', icon: '🧺' },
              { id: 'pc', label: 'Bilgisayar Seti', icon: '🖥️' },
              { id: 'box', label: 'Koli / Kutu', icon: '📦' },
              { id: 'board', label: 'Çalışma Panosu', icon: '📋' }
            ].map((type) => (
              <button
                key={type.id}
                className="item-type-card"
                onClick={() => {
                  onAddPlacedItem(type.id);
                  setIsItemDrawerOpen(false); // Eklendikten sonra paneli kapat
                }}
              >
                <span className="item-card-icon">{type.icon}</span>
                <span className="item-card-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Seçili Eşya Düzenleme Paneli */}
      {activeItemId && !isEditorOpen && (() => {
        const selectedItem = placedItems.find((i) => i.id === activeItemId);
        if (!selectedItem) return null;

        const defaultLabel = {
          desk: 'Çalışma Masası',
          chair: 'Ofis Sandalyesi',
          shelf: 'Büyük Kitaplık',
          wallshelf: 'Duvar Rafı',
          plant: 'Saksı Bitkisi',
          lamp: 'Ayaklı Lamba',
          rug: 'Desenli Halı',
          pc: 'Bilgisayar Seti',
          box: 'Koli / Kutu',
          board: 'Çalışma Panosu'
        }[selectedItem.type] || 'Eşya';

        // Renk paleti seçenekleri
        const colors = ['#818cf8', '#fb7185', '#34d399', '#fbbf24', '#cbd5e1', '#f472b6', '#22d3ee', '#c084fc'];

        // Eşya rotasyonu (Y ekseninde radyan)
        const rotationVal = selectedItem.rotation?.y ?? 0;
        // Eşya ölçeği
        const scaleVal = selectedItem.scale?.[0] || 1;

        const handleScaleChange = (amount) => {
          const newScale = Math.max(0.4, Math.min(2.5, scaleVal + amount));
          onUpdatePlacedItem(activeItemId, { scale: [newScale, newScale, newScale] });
        };

        const handleRotate = (direction) => {
          const step = Math.PI / 12; // 15 derece
          const newRy = rotationVal + (direction === 'left' ? step : -step);
          const snappedRy = Math.round(newRy / step) * step;
          onUpdatePlacedItem(activeItemId, { rotation: { x: 0, y: snappedRy, z: 0 } });
        };

        const handleMoveCoord = (axis, amount) => {
          const pos = selectedItem.position || { x: 0, y: 0, z: 0 };
          let newX = pos.x ?? 0;
          let newY = pos.y ?? 0;
          let newZ = pos.z ?? 0;

          if (axis === 'x') newX += amount;
          if (axis === 'y') newY = Math.max(0.001, newY + amount);
          if (axis === 'z') newZ += amount;

          // Oda limitleri clamp
          const limits = ROOM_LIMITS[selectedItem.roomId] || ROOM_LIMITS.unknown;
          newX = Math.max(limits.minX, Math.min(limits.maxX, newX));
          newZ = Math.max(limits.minZ, Math.min(limits.maxZ, newZ));

          onUpdatePlacedItem(activeItemId, { position: { x: newX, y: newY, z: newZ } });
        };

        return (
          <div 
            className="item-editor-bar glass-panel interactive-ui"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ padding: isItemEditingActive ? '12px 20px' : '16px 24px', flexWrap: 'wrap', gap: '12px' }}
          >
            <div className="item-info">
              <span className="item-label-glow">{defaultLabel}</span>
              <span className="item-room-label">Oda: {roomNames[selectedItem.roomId] || selectedItem.roomId}</span>
            </div>

            {isItemEditingActive ? (
              // DÜZENLEME MODU AÇIKKEN
              <div className="editor-controls-group" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                {/* Hassas Konum Butonları */}
                <div className="editor-control-section" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="control-label">Konumlandırma</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMoveCoord('y', 0.1); }} title="Yukarı Kaldır (PageUp)">Y+ ⬆️</button>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMoveCoord('y', -0.1); }} title="Aşağı İndir (PageDown)">Y- ⬇️</button>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMoveCoord('x', -0.1); }} title="Sola Kaydır">X- ⬅️</button>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMoveCoord('x', 0.1); }} title="Sağa Kaydır">X+ ➡️</button>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMoveCoord('z', -0.1); }} title="İleri Kaydır">Z- ⬆️</button>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMoveCoord('z', 0.1); }} title="Geri Kaydır">Z+ ⬇️</button>
                  </div>
                </div>

                {/* Renk Seçimi */}
                <div className="editor-control-section">
                  <span className="control-label">Renk</span>
                  <div className="color-options-row">
                    {colors.map((c) => (
                      <div
                        key={c}
                        className={`color-option-dot ${selectedItem.color === c ? 'selected' : ''}`}
                        style={{ backgroundColor: c }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          onUpdatePlacedItem(activeItemId, { color: c });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Ölçek (Boyut) */}
                <div className="editor-control-section">
                  <span className="control-label">Boyut</span>
                  <div className="btn-group">
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleScaleChange(-0.1); }} title="Küçült (-)">-</button>
                    <span className="value-display">{scaleVal.toFixed(1)}x</span>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleScaleChange(0.1); }} title="Büyüt (+)">+</button>
                  </div>
                </div>

                {/* Döndürme */}
                <div className="editor-control-section">
                  <span className="control-label">Döndür</span>
                  <div className="btn-group">
                    <button className="btn-control font-arrow" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleRotate('left'); }} title="Sola Döndür (Q)">↺</button>
                    <button className="btn-control font-arrow" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleRotate('right'); }} title="Sağa Döndür (E)">↻</button>
                  </div>
                </div>

                {/* Aksiyon Grubu */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  {/* Silme */}
                  <button 
                    className="btn-danger-item" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onDeletePlacedItem(activeItemId);
                      onCancelEdit(); // State temizliği
                    }}
                    title="Eşyayı Sil (Delete)"
                  >
                    <Trash2 size={16} />
                    <span>Sil</span>
                  </button>

                  {/* İptal */}
                  <button 
                    className="btn-primary-item" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onCancelEdit();
                    }}
                    title="Değişiklikleri iptal et ve eski haline döndür (Escape)"
                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                  >
                    İptal
                  </button>

                  {/* Kaydet */}
                  <button 
                    className="btn-primary-item" 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onSaveEdit();
                    }}
                    title="Değişiklikleri kaydet"
                    style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              // SADECE SEÇİLİ KESİM
              <div className="editor-controls-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '8px' }}>
                  💡 Düzenlemek için eşyaya 3 saniye basılı tutun
                </span>

                {/* Manuel Düzenleme Moduna Geçiş Butonu */}
                <button
                  className="btn-primary-item"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#a7f3d0',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    onStartEdit(activeItemId);
                  }}
                >
                  ⚙️ Eşyayı Düzenle
                </button>

                {/* Not Bağlama */}
                <button
                  className="btn-primary-item"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    setEditorMode('item');
                    setActiveItemId(selectedItem.id);
                    setIsEditorOpen(true);
                  }}
                >
                  <span>{selectedItem.linkedNote ? '📝 Notu Düzenle' : '📝 Eşyaya Not Ekle'}</span>
                </button>

                {/* Kapat */}
                <button 
                  className="btn-primary-item" 
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    setActiveItemId(null);
                  }}
                  title="Seçimi Kapat (Escape)"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Editor Modal */}
      <div 
        className={`editor-modal glass-panel interactive-ui ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="editor-header">
          <h2 className="editor-title">Notu Oku & Düzenle</h2>
          <button className="editor-close" onClick={onCloseEditor}>
            <X size={20} />
          </button>
        </div>

        {/* Eşya Notu Başlık Giriş Alanı */}
        {editorMode === 'item' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 4px 10px 4px' }}>
              <span className="control-label" style={{ fontSize: '0.75rem' }}>Not Başlığı</span>
              <input
                type="text"
                value={itemNoteTitle}
                onChange={(e) => setItemNoteTitle(e.target.value)}
                maxLength={40}
                placeholder="Eşya notu başlığı yazın..."
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  outline: 'none',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.05)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 4px 12px 4px' }}>
              <span className="control-label" style={{ fontSize: '0.75rem' }}>İkon Tipi</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'info', label: 'ℹ️ Bilgi' },
                  { id: 'question', label: '❓ Soru' },
                  { id: 'exclamation', label: '⚠️ Uyarı' },
                  { id: 'dot', label: '🔵 Nokta' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    style={{
                      flex: 1,
                      background: iconType === opt.id ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      border: iconType === opt.id ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: iconType === opt.id ? '#00f0ff' : '#94a3b8',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setIconType(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Metin Alanı */}
        <div className="editor-textarea-wrapper">
          <textarea
            className="editor-textarea"
            value={currentPage.text}
            onChange={handleTextChange}
            placeholder="Yazmaya başlayın..."
          />
          <div className={`char-counter ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''}`}>
            {currentTextLength.toLocaleString()} / {charLimit.toLocaleString()}
            {isAtLimit && <span className="limit-warning"> — Karakter limiti doldu!</span>}
            {isWarningLimit && !isAtLimit && <span style={{ color: '#fbbf24', marginLeft: '8px' }}> — ⚠️ Metin çok büyük, 3D render performansı düşebilir!</span>}
          </div>
        </div>

        {/* Görsel Yükleme & Önizleme Bölümü */}
        <div className="editor-image-section">
          {currentPage.image ? (
            <div className="image-preview-container">
              <img src={currentPage.image} alt="Önizleme" className="image-preview" />
              <button className="btn-delete-image" onClick={handleImageDelete} title="Görseli Kaldır">
                <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                <span>Görseli Kaldır</span>
              </button>
            </div>
          ) : (
            <label className="image-upload-label">
              <ImagePlus size={18} style={{ opacity: 0.7 }} />
              <span>Görsel Yükle</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Multi-page Navigation */}
        <div className="pagination-controls">
          <button 
            className="btn-nav"
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
          >
            <ChevronLeft size={16} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
            Önceki
          </button>

          <span className="page-indicator">
            Sayfa {pageIndex + 1} / {pages.length}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-nav"
              onClick={handleNextPage}
              disabled={pageIndex === pages.length - 1}
            >
              Sonraki
              <ChevronRight size={16} style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
            </button>

            <button 
              className="btn-nav"
              style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}
              onClick={handleAddPage}
              title="Yeni sayfa ekle"
            >
              <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
              Ekle
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Not Rengi
            </label>
            <div className="color-picker">
              {COLOR_PALETTE.map((c) => (
                <div
                  key={c.value}
                  className={`color-option ${color === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <button className="btn-danger" onClick={() => onDeleteNote(activeNote.id)}>
            <Trash2 size={16} />
            Notu Sil
          </button>
          
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
