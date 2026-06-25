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
  isSettingsOpen,
  setIsSettingsOpen,
  uiTheme,
  setUiTheme,
  theme,
  setTheme,
  roomNames,
  roomFloorColors,
  roomWallColors,
  onUpdateRoomName,
  onUpdateRoomFloorColor,
  onUpdateRoomWallColor,
  onResetColors,
  onLoadPresetTemplate,
  onClearRoomTemplate,
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
  isItemDrawerOpen,
  setIsItemDrawerOpen,
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
  crosshairHovered = null,
  notes = [],
  onNavigateToTarget,
  connections = [],
  connectionConcepts = [],
  pendingConnectionSource = null,
  pendingConnectionTarget = null,
  isConceptSelectOpen = false,
  onStartConnection,
  onCompleteConnection,
  onCancelConnection,
  onDeleteConnection,
  onToggleConnectionVisibility,
  connectionVisibilityMode,
  onChangeVisibilityMode,
  setConnections,
  allowQuickTravel = false,
  setAllowQuickTravel,
  freeFlightEnabled = false,
  setFreeFlightEnabled,
  devMode = false
}) {
  const [pages, setPages] = useState([{ text: '', image: null, layout: 'image-top-text-bottom' }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [color, setColor] = useState('#fef08a');
  const fileInputRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTagsPickerOpen, setIsTagsPickerOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isRelationsOpen, setIsRelationsOpen] = useState(false);

  // Compute dynamic character limit from the active note's dimensions
  const charLimit = useMemo(() => {
    if (!activeNote) return 1000;
    return calculateCharLimit(activeNote.width, activeNote.height);
  }, [activeNote]);

  // Sync editor with the active note when opened/changed
  const [itemNoteTitle, setItemNoteTitle] = useState('Eşya Notu');
  const [iconType, setIconType] = useState('info');
  const activeId = editorMode === 'note' ? activeNote?.id : activeItemId;

  useEffect(() => {
    if (activeNote) {
      const activePages = (activeNote.pages || []).map(normalizePage);
      setPages(activePages.length > 0 ? activePages : [{ text: '', image: null, layout: 'image-top-text-bottom' }]);
      setPageIndex(activeNote.currentPageIndex || 0);
      setColor(activeNote.color || '#fef08a');
      setItemNoteTitle(activeNote.title || 'Eşya Notu');
      setIconType(activeNote.iconType || 'info');
      setSelectedTags(activeNote.tags || []);
      setIsColorPickerOpen(false);
      setIsTagsPickerOpen(false);
      setIsRelationsOpen(false);
    }
  }, [activeNote]);

  // Current page safe access
  const currentPage = useMemo(() => {
    if (!pages[pageIndex]) return { text: '', image: null, layout: 'image-top-text-bottom' };
    return normalizePage(pages[pageIndex]);
  }, [pages, pageIndex]);

  // Extract BKZ links from active page text in editor
  const editorLinks = useMemo(() => {
    if (!activeNote || !pages[pageIndex]?.text) return [];
    const text = pages[pageIndex].text;
    const links = [];
    const matches = [...text.matchAll(/\[[Bb][Kk][Zz]:\s*([^\]]+)\]/g)];
    matches.forEach(match => {
      const targetName = match[1].trim().toLowerCase();
      
      const matchedWallNote = notes.find(n => {
        if (n.id.toLowerCase() === targetName) return true;
        const firstLine = (n.pages?.[0]?.text || '').split('\n')[0].trim().toLowerCase();
        const title = (n.title || firstLine).toLowerCase();
        return title === targetName;
      });

      if (matchedWallNote) {
        const firstLine = (matchedWallNote.pages?.[0]?.text || '').split('\n')[0].trim();
        links.push({
          matchText: match[0],
          targetId: matchedWallNote.id,
          targetTitle: matchedWallNote.title || firstLine || matchedWallNote.id,
          isWallNote: true
        });
        return;
      }

      const matchedItem = placedItems.find(item => {
        if (item.id.toLowerCase() === targetName) return true;
        if (item.linkedNote) {
          const title = (item.linkedNote.title || '').trim().toLowerCase();
          return title === targetName;
        }
        return false;
      });

      if (matchedItem) {
        links.push({
          matchText: match[0],
          targetId: matchedItem.id,
          targetTitle: matchedItem.linkedNote.title || matchedItem.id,
          isWallNote: false
        });
      }
    });
    return links;
  }, [pages, pageIndex, notes, placedItems, activeNote]);

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

  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (selectedTags.includes(trimmed)) {
      setNewTagInput('');
      return;
    }
    setSelectedTags(prev => [...prev, trimmed]);
    setNewTagInput('');
  };

  const handleSave = () => {
    if (!activeNote) return;
    // Ensure all pages are normalized before saving
    const sanitizedPages = pages.map(normalizePage);
    if (editorMode === 'note') {
      onSaveNote(activeNote.id, sanitizedPages, pageIndex, color, selectedTags);
    } else {
      onSaveNote(activeNote.id, sanitizedPages, pageIndex, itemNoteTitle, iconType, selectedTags);
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
            background: 'var(--panel-bg-solid)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--panel-border)',
            padding: '12px 20px',
            borderRadius: '12px',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontFamily: 'sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--card-shadow)',
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
            onClick={(e) => { 
              setCameraMode((prev) => {
                if (prev === 'third-person') return 'birds-eye';
                if (prev === 'birds-eye') return freeFlightEnabled ? 'free' : 'third-person';
                return 'third-person';
              });
              e.currentTarget.blur(); 
            }}
            style={cameraMode === 'birds-eye' ? { background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' } : {}}
          >
            <Eye size={16} />
            <span>{cameraMode === 'third-person' ? 'Yürüyüş' : cameraMode === 'birds-eye' ? 'Kuş Bakışı' : 'Serbest Uçuş'}</span>
          </button>

          <button 
            className={`btn-primary ${isItemDrawerOpen ? 'active' : ''}`}
            onClick={(e) => { setIsItemDrawerOpen(!isItemDrawerOpen); setIsSettingsOpen(false); setIsDashboardOpen(false); e.currentTarget.blur(); }}
            title="Eşya kütüphanesini aç/kapat"
            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <Plus size={16} />
            <span>Eşya Ekle</span>
          </button>

          <button 
            className={`btn-primary ${isSettingsOpen ? 'active' : ''}`}
            onClick={(e) => { setIsSettingsOpen(!isSettingsOpen); setIsDashboardOpen(false); setIsItemDrawerOpen(false); e.currentTarget.blur(); }}
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

          <div className="settings-section-divider" style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          
          <div className="settings-template-section" style={{ padding: '5px 10px 15px 10px' }}>
            <h3 style={{ fontSize: '15px', color: '#a5b4fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
              <span>🏢</span> Çalışma Odası Şablonu
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 15px 0', lineHeight: '1.4' }}>
              Referans görseldeki kaliteli hazır çalışma odası tasarımını (büyük ahşap masa, koltuk, kitaplık, pano, saksı bitkisi, lamba, halı, duvar rafı) ve örnek notları yükleyebilir veya odayı tamamen boşaltabilirsiniz.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary" 
                onClick={(e) => { onLoadPresetTemplate(); e.currentTarget.blur(); }}
                style={{ flex: 1, padding: '10px', fontSize: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
              >
                Hazır Şablonu Yükle (Görsel Tasarımı)
              </button>
              <button 
                className="btn-secondary" 
                onClick={(e) => { onClearRoomTemplate(); e.currentTarget.blur(); }}
                style={{ flex: 1, padding: '10px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
              >
                Çalışma Odasını Boşalt
              </button>
            </div>
          </div>

          <div className="settings-section-divider" style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

          {/* Hareket ve Navigasyon Ayarları */}
          <div style={{ padding: '5px 10px 15px 10px' }}>
            <h3 style={{ fontSize: '15px', color: '#a5b4fc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
              <span>⚡</span> Hareket Ayarları
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Serbest Uçuş Toggle */}
              {devMode && (
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px',
                  background: freeFlightEnabled ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: freeFlightEnabled ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>✈️ Serbest Uçuş Modu</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>C tuşu ile uçuş moduna geçebilin</div>
                  </div>
                  <div
                    onClick={(e) => { e.preventDefault(); setFreeFlightEnabled(!freeFlightEnabled); }}
                    style={{
                      width: '40px', height: '22px', borderRadius: '11px', position: 'relative', cursor: 'pointer',
                      background: freeFlightEnabled ? '#6366f1' : '#374151', transition: 'background 0.2s'
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '2px', left: freeFlightEnabled ? '20px' : '2px',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }} />
                  </div>
                </label>
              )}

              {/* Hızlı Işınlanma Toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '8px',
                background: allowQuickTravel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                border: allowQuickTravel ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>🚨 Hızlı Işınlanma</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Panelden nota tıklayınca ışınlan</div>
                </div>
                <div
                  onClick={(e) => { e.preventDefault(); setAllowQuickTravel(!allowQuickTravel); }}
                  style={{
                    width: '40px', height: '22px', borderRadius: '11px', position: 'relative', cursor: 'pointer',
                    background: allowQuickTravel ? '#10b981' : '#374151', transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: allowQuickTravel ? '20px' : '2px',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </label>
            </div>
          </div>

          <div className="settings-section-divider" style={{ margin: '20px 0', borderTop: '1px solid var(--panel-border)' }} />

          {/* Tema Seçimi Ayarları */}
          <div style={{ padding: '5px 10px 15px 10px' }}>
            <h3 style={{ fontSize: '15px', color: '#a5b4fc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
              <span>🎨</span> Arayüz Teması
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUiTheme('dark')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: uiTheme === 'dark' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                  background: uiTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'var(--button-bg-secondary)',
                  color: uiTheme === 'dark' ? '#a5b4fc' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                🌙 Koyu Tema
              </button>
              <button
                type="button"
                onClick={() => setUiTheme('light')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: uiTheme === 'light' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                  background: uiTheme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'var(--button-bg-secondary)',
                  color: uiTheme === 'light' ? '#6366f1' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                ☀️ Açık Tema
              </button>
            </div>
          </div>
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
          <button className="drawer-close" onClick={(e) => { setIsItemDrawerOpen(false); e.currentTarget.blur(); }}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {[
            {
              title: 'Masalar',
              items: [
                { id: 'desk', label: 'Çalışma Masası', icon: '💻' },
                { id: 'large_desk', label: 'Büyük Çalışma Masası', icon: '🖥️' },
                { id: 'meeting_table', label: 'Toplantı Masası', icon: '🤝' },
                { id: 'l_desk', label: 'L Tipi Masa', icon: '📐' },
                { id: 'round_table', label: 'Yuvarlak Masa', icon: '⭕' }
              ]
            },
            {
              title: 'Sandalyeler',
              items: [
                { id: 'chair', label: 'Ofis Sandalyesi', icon: '🪑' },
                { id: 'office_chair', label: 'Çalışma Koltuğu', icon: '💺' },
                { id: 'guest_chair', label: 'Misafir Sandalyesi', icon: '🪑' },
                { id: 'stool', label: 'Küçük Tabure', icon: '🪵' }
              ]
            },
            {
              title: 'Raflar ve Dolaplar',
              items: [
                { id: 'shelf', label: 'Büyük Kitaplık', icon: '📚' },
                { id: 'large_bookshelf', label: 'Geniş Kitaplık', icon: '📖' },
                { id: 'low_bookshelf', label: 'Alçak Kitaplık', icon: '🗄️' },
                { id: 'file_cabinet', label: 'Dosya Dolabı', icon: '🗃️' },
                { id: 'drawer_cabinet', label: 'Çekmeceli Dolap', icon: '🚪' },
                { id: 'large_rack', label: 'Büyük Raf Ünitesi', icon: '🏭' },
                { id: 'wallshelf', label: 'Duvar Rafı', icon: '🪵' },
                { id: 'small_wallshelf', label: 'Küçük Duvar Rafı', icon: '🏷️' }
              ]
            },
            {
              title: 'Panolar',
              items: [
                { id: 'board', label: 'Çalışma Panosu', icon: '📋' },
                { id: 'large_board', label: 'Büyük Pano', icon: '📌' },
                { id: 'whiteboard', label: 'Yazı Tahtası', icon: '📝' }
              ]
            },
            {
              title: 'Aydınlatma',
              items: [
                { id: 'lamp', label: 'Ayaklı Lamba', icon: '💡' },
                { id: 'floor_lamp', label: 'Zemin Lambası', icon: '🏮' },
                { id: 'desk_lamp', label: 'Masa Lambası', icon: '🔦' }
              ]
            },
            {
              title: 'Dekor ve Yardımcılar',
              items: [
                { id: 'rug', label: 'Desenli Halı', icon: '🧺' },
                { id: 'pc', label: 'Bilgisayar Seti', icon: '💻' },
                { id: 'box', label: 'Koli / Kutu', icon: '📦' },
                { id: 'archive_box', label: 'Arşiv Sandığı', icon: '🗳️' },
                { id: 'plant', label: 'Saksı Bitkisi', icon: '🪴' },
                { id: 'large_plant', label: 'Büyük Saksı Bitkisi', icon: '🌴' }
              ]
            }
          ].map((category) => (
            <div key={category.title} className="drawer-category-section" style={{ marginBottom: '18px' }}>
              <h3 className="category-title" style={{ color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '4px', marginBottom: '10px', fontWeight: 'bold' }}>
                {category.title}
              </h3>
              <div className="item-types-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {category.items.map((type) => (
                  <button
                    key={type.id}
                    className="item-type-card"
                    onClick={(e) => {
                      onAddPlacedItem(type.id);
                      setIsItemDrawerOpen(false); // Eklendikten sonra paneli kapat
                      e.currentTarget.blur();
                    }}
                    style={{ padding: '8px', minHeight: '65px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <span className="item-card-icon" style={{ fontSize: '1.4rem' }}>{type.icon}</span>
                    <span className="item-card-label" style={{ fontSize: '0.72rem', textAlign: 'center', lineHeight: '1.2' }}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
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
          board: 'Çalışma Panosu',
          // Yeni Eşyalar
          large_desk: 'Büyük Çalışma Masası',
          meeting_table: 'Geniş Toplantı Masası',
          l_desk: 'L Tipi Masa',
          round_table: 'Yuvarlak Masa',
          large_bookshelf: 'Büyük Kitaplık (Geniş)',
          low_bookshelf: 'Alçak Kitaplık',
          file_cabinet: 'Dosya Dolabı',
          drawer_cabinet: 'Çekmeceli Dolap',
          large_board: 'Büyük Pano',
          whiteboard: 'Ayaklı Yazı Tahtası',
          office_chair: 'Büyük Çalışma Koltuğu',
          guest_chair: 'Misafir Sandalyesi',
          stool: 'Küçük Tabure',
          side_table: 'Yan Sehpa',
          large_rack: 'Büyük Raf Ünitesi',
          small_wallshelf: 'Küçük Duvar Rafı',
          floor_lamp: 'Zemin Lambası',
          desk_lamp: 'Masa Lambası',
          large_plant: 'Saksı Bitkisi (Büyük)',
          archive_box: 'Kutu / Arşiv Sandığı'
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

                {/* 3D Bağlantı Başlat */}
                <button
                  className="btn-primary-item"
                  style={{
                    background: pendingConnectionSource?.id === selectedItem.id ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: pendingConnectionSource?.id === selectedItem.id ? '#fca5a5' : '#a5b4fc',
                    border: pendingConnectionSource?.id === selectedItem.id ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    if (pendingConnectionSource?.id === selectedItem.id) {
                      onCancelConnection();
                    } else {
                      onStartConnection(selectedItem.id, 'item');
                    }
                  }}
                >
                  <span>{pendingConnectionSource?.id === selectedItem.id ? '❌ Bağlantıyı İptal Et' : '🔗 Bağlantı Başlat'}</span>
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

        <div className="editor-body-content">

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
            {isWarningLimit && !isAtLimit && <span style={{ color: '#fbbf24', marginLeft: '8px' }}> — ⚠️ Metin çok büyük!</span>}
          </div>
        </div>

        {/* Seçilen Etiketler Gösterimi (Metin alanının hemen altında) */}
        {selectedTags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '4px 4px', flexShrink: 0 }}>
            {selectedTags.map(tag => (
              <span
                key={tag}
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#a5b4fc',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  maxWidth: '120px',
                  boxSizing: 'border-box'
                }}
              >
                <span 
                  title={tag}
                  style={{ 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap'
                  }}
                >
                  #{tag}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer', padding: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Görsel Yükleme & Önizleme Bölümü (Kompakt) */}
        <div className="editor-image-section" style={{ padding: '0 4px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          {currentPage.image ? (
            <div style={{ position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 0, 0, 0.2)' }}>
              <img src={currentPage.image} alt="Önizleme" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
              <button 
                type="button"
                className="btn-danger" 
                onClick={handleImageDelete} 
                title="Görseli Kaldır"
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'rgba(239, 68, 68, 0.85)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  width: 'auto'
                }}
              >
                <Trash2 size={11} />
                <span>Kaldır</span>
              </button>
            </div>
          ) : (
            <label 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: '#cbd5e1',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
            >
              <ImagePlus size={14} style={{ opacity: 0.8 }} />
              <span>Görsel Ekle</span>
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

        {/* Bağlantılı Notlar Bölümü */}
        {editorLinks.length > 0 && (
          <div className="editor-links-section" style={{ margin: '4px', padding: '10px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.15)', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              🔗 Bağlantılı Notlar (Işınlanmak için tıklayın)
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {editorLinks.map((link, idx) => (
                <button
                  key={idx}
                  className="btn-primary-item"
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => onNavigateToTarget(link.targetId, link.isWallNote)}
                >
                  <span>{link.targetTitle}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Araç Çubuğu (Sayfa Kontrolleri, Renk Seçici, Etiket Butonu) */}
        <div className="pagination-controls" style={{ flexShrink: 0 }}>
          {/* Sol: Sayfa Navigasyonu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-nav"
              onClick={handlePrevPage}
              disabled={pageIndex === 0}
              style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}
              title="Önceki Sayfa"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="page-indicator" style={{ minWidth: '70px', textAlign: 'center', userSelect: 'none' }}>
              Sayfa {pageIndex + 1} / {pages.length}
            </span>

            <button 
              className="btn-nav"
              onClick={handleNextPage}
              disabled={pageIndex === pages.length - 1}
              style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}
              title="Sonraki Sayfa"
            >
              <ChevronRight size={14} />
            </button>

            <button 
              className="btn-nav"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={handleAddPage}
              title="Yeni sayfa ekle"
            >
              <Plus size={12} />
              <span>Ekle</span>
            </button>
          </div>

          {/* Sağ: Renk ve Etiket Popover Tetikleyicileri */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            
            {/* Renk Seçici */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', userSelect: 'none' }}>Renk:</span>
              <button 
                type="button"
                className="color-trigger-btn"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setIsColorPickerOpen(!isColorPickerOpen);
                  setIsTagsPickerOpen(false);
                }}
                title="Renk Seç"
              />
              
              {isColorPickerOpen && (
                <>
                  {/* Dış tıklamayla kapanması için saydam backdrop */}
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2001 }}
                    onClick={() => setIsColorPickerOpen(false)}
                  />
                  <div 
                    className="editor-popover" 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gap: '8px', 
                      right: 0, 
                      bottom: '100%', 
                      marginBottom: '8px', 
                      width: 'max-content',
                      zIndex: 2002
                    }}
                  >
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`color-option ${color === c.value ? 'selected' : ''}`}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: c.value,
                          cursor: 'pointer',
                          border: color === c.value ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                          boxShadow: color === c.value ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          flexShrink: 0
                        }}
                        onClick={() => {
                          setColor(c.value);
                          setIsColorPickerOpen(false);
                        }}
                        title={c.name}
                      >
                        {color === c.value && (
                          <span style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 'bold' }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Etiket Seçici */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <button
                type="button"
                className="btn-nav"
                onClick={() => {
                  setIsTagsPickerOpen(!isTagsPickerOpen);
                  setIsColorPickerOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px' }}
              >
                <span>Etiketler</span>
                <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem' }}>
                  {selectedTags.length}
                </span>
              </button>

              {isTagsPickerOpen && (
                <>
                  {/* Dış tıklamayla kapanması için saydam backdrop */}
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2001 }}
                    onClick={() => setIsTagsPickerOpen(false)}
                  />
                  <div 
                    className="editor-popover tags-popover" 
                    style={{ 
                      width: '280px', 
                      right: 0, 
                      left: 'auto', 
                      bottom: '100%', 
                      marginBottom: '8px', 
                      zIndex: 2002, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '10px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold', userSelect: 'none' }}>Etiket Ekle</div>
                    
                    {/* Etiket Giriş Alanı */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Etiket adı yaz..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag();
                          }
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        style={{
                          background: '#6366f1',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
                      >
                        Ekle
                      </button>
                    </div>

                    {/* Seçili Etiketleri Popover İçinde Listeleme ve Kaldırma */}
                    {selectedTags.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>Ekli Etiketler:</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '110px', overflowY: 'auto', paddingRight: '4px' }}>
                          {selectedTags.map((tag) => (
                            <span
                              key={tag}
                              className="tag-chip"
                              style={{
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                color: '#a5b4fc',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                maxWidth: '100px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <span 
                                title={tag}
                                style={{ 
                                  textOverflow: 'ellipsis', 
                                  overflow: 'hidden', 
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {tag}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#fb7185',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontWeight: 'bold',
                                  marginLeft: '2px'
                                }}
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Seçili Öğeye Ait Bağlantılar Paneli (3D İlişkiler) - Katlanabilir (Accordion) */}
        {activeId && (
          <div className="accordion-section" style={{ flexShrink: 0 }}>
            <div 
              className="accordion-header"
              onClick={() => setIsRelationsOpen(!isRelationsOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}>🔗</span>
                <span style={{ fontSize: '0.8rem', color: '#00f0ff', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '0.03em' }}>
                  BU ÖĞENİN 3D İLİŞKİLERİ
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', background: 'rgba(0, 240, 255, 0.06)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.12)' }}>
                  {connections.filter(c => c.fromId === activeId || c.toId === activeId).length}
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{isRelationsOpen ? 'Gizle' : 'Göster'}</span>
                <span style={{ 
                  transform: isRelationsOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.2s ease', 
                  display: 'inline-block',
                  fontWeight: 'bold'
                }}>▶</span>
              </div>
            </div>

            {isRelationsOpen && (
              <div className="accordion-content">
                {/* Kontrol Butonları */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onChangeVisibilityMode) onChangeVisibilityMode('selected-only');
                      if (setConnections) {
                        setConnections(prev => prev.map(c => 
                          (c.fromId === activeId || c.toId === activeId) ? { ...c, isVisible: true } : c
                        ));
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#a5b4fc',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    Sadece Bu İlişkileri Göster
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setConnections) {
                        setConnections(prev => prev.map(c => 
                          (c.fromId === activeId || c.toId === activeId) ? { ...c, isVisible: true } : c
                        ));
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(52, 211, 153, 0.15)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      color: '#34d399',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    İlişkileri Göster
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setConnections) {
                        setConnections(prev => prev.map(c => 
                          (c.fromId === activeId || c.toId === activeId) ? { ...c, isVisible: false } : c
                        ));
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    İlişkileri Gizle
                  </button>
                </div>

                {/* İlişki Listesi */}
                <div style={{
                  maxHeight: '110px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '4px'
                }}>
                  {(() => {
                    const itemConns = connections.filter(c => c.fromId === activeId || c.toId === activeId);
                    
                    const getObjectName = (id) => {
                      const n = notes.find(x => x.id === id);
                      if (n) return n.pages?.[0]?.text?.substring(0, 15) || 'Duvar Notu';
                      const item = placedItems.find(x => x.id === id);
                      if (item) return item.name || 'Eşya';
                      return 'Bilinmeyen Öğe';
                    };

                    if (itemConns.length === 0) {
                      return (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', padding: '8px 0', fontFamily: 'sans-serif' }}>
                          Bu öğeye ait bir 3D ilişki yok.
                        </span>
                      );
                    }

                    return itemConns.map(conn => {
                      const isSource = conn.fromId === activeId;
                      const targetId = isSource ? conn.toId : conn.fromId;
                      const targetName = getObjectName(targetId);
                      const concept = connectionConcepts.find(cc => cc.id === conn.conceptId) || { name: 'Genel', color: '#00f0ff' };

                      return (
                        <div
                          key={conn.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '5px 8px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.04)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.7rem', color: isSource ? '#a78bfa' : '#60a5fa', fontWeight: 'bold', flexShrink: 0 }}>
                              {isSource ? '➡️' : '⬅️'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#e2e8f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: 'sans-serif' }}>
                              {targetName}
                            </span>
                            <span style={{
                              fontSize: '0.62rem',
                              background: `${concept.color}15`,
                              color: concept.color,
                              border: `1px solid ${concept.color}30`,
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              flexShrink: 0,
                              fontFamily: 'sans-serif'
                            }}>
                              {concept.name}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => { if (onToggleConnectionVisibility) onToggleConnectionVisibility(conn.id); }}
                              style={{
                                background: conn.isVisible ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                border: conn.isVisible ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                color: conn.isVisible ? '#34d399' : '#fca5a5',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                fontFamily: 'sans-serif'
                              }}
                            >
                              {conn.isVisible ? 'Görünür' : 'Gizli'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (onDeleteConnection) onDeleteConnection(conn.id); }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#fca5a5',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                fontFamily: 'sans-serif'
                              }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        </div> {/* editor-body-content sonu */}

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

      {/* 2D MiniMap Krokisi */}
      {!isEditorOpen && !isDashboardOpen && !isSettingsOpen && !isItemDrawerOpen && (
        <div 
          className="minimap-container glass-panel"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            width: '160px',
            height: '160px',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), 0 0 15px rgba(0, 240, 255, 0.05)',
            zIndex: 9999,
            overflow: 'hidden',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {/* Hologram tarama çizgisi */}
          <div className="hologram-scanline" style={{ animationDuration: '6s' }}></div>
          
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Grid Arka Planı */}
            <defs>
              <pattern id="minimap-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 240, 255, 0.04)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#minimap-grid)" />

            {/* Mutfak (Kitchen) - Sol Üst (z <= 0) */}
            <rect 
              x="2" y="2" width="36" height="46" 
              fill="rgba(0, 240, 255, 0.03)" 
              stroke="rgba(0, 240, 255, 0.15)" 
              strokeWidth="0.8" 
              rx="4"
            />
            <text x="20" y="25" fill="rgba(255, 255, 255, 0.55)" fontSize="5" fontWeight="bold" textAnchor="middle">
              {roomNames.kitchen || 'Mutfak'}
            </text>

            {/* Yatak Odası (Bedroom) - Sol Alt (z > 0) */}
            <rect 
              x="2" y="52" width="36" height="46" 
              fill="rgba(0, 240, 255, 0.03)" 
              stroke="rgba(0, 240, 255, 0.15)" 
              strokeWidth="0.8" 
              rx="4"
            />
            <text x="20" y="75" fill="rgba(255, 255, 255, 0.55)" fontSize="5" fontWeight="bold" textAnchor="middle">
              {roomNames.bedroom || 'Yatak Odası'}
            </text>

            {/* Giriş / Hol (Hall) - Orta Sütun */}
            <rect 
              x="40" y="2" width="20" height="96" 
              fill="rgba(0, 240, 255, 0.05)" 
              stroke="rgba(0, 240, 255, 0.25)" 
              strokeWidth="1.0" 
              rx="4"
            />
            <text x="50" y="50" fill="rgba(255, 255, 255, 0.7)" fontSize="5.5" fontWeight="bold" textAnchor="middle">
              {roomNames.hall || 'Giriş'}
            </text>

            {/* Salon (Living) - Sağ Üst (z <= 0) */}
            <rect 
              x="62" y="2" width="36" height="46" 
              fill="rgba(0, 240, 255, 0.03)" 
              stroke="rgba(0, 240, 255, 0.15)" 
              strokeWidth="0.8" 
              rx="4"
            />
            <text x="80" y="25" fill="rgba(255, 255, 255, 0.55)" fontSize="5" fontWeight="bold" textAnchor="middle">
              {roomNames.living || 'Salon'}
            </text>

            {/* Çalışma Odası (Study) - Sağ Alt (z > 0) */}
            <rect 
              x="62" y="52" width="36" height="46" 
              fill="rgba(0, 240, 255, 0.03)" 
              stroke="rgba(0, 240, 255, 0.15)" 
              strokeWidth="0.8" 
              rx="4"
            />
            <text x="80" y="75" fill="rgba(255, 255, 255, 0.55)" fontSize="5" fontWeight="bold" textAnchor="middle">
              {roomNames.study || 'Çalışma Odası'}
            </text>

            {/* Oyuncu Pozisyon ve Yön Göstergesi */}
            <g id="minimap-player-indicator" transform="translate(50, 50) rotate(0)">
              {/* Parlama halkası */}
              <circle r="6" fill="none" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1" strokeDasharray="2 1" />
              {/* Oyuncu oku */}
              <polygon points="0,-4.5 -3.5,3 3.5,3" fill="#00f0ff" stroke="#1e293b" strokeWidth="0.5" />
            </g>
          </svg>
        </div>
      )}

      {/* Kavram Seçici Popover/Modal */}
      {isConceptSelectOpen && pendingConnectionSource && pendingConnectionTarget && (
        <div 
          className="modal-backdrop open interactive-ui"
          style={{ zIndex: 99999 }}
          onClick={onCancelConnection}
        >
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '320px',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 100000
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#00f0ff', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Bağlantı Kavramı Seçin</h3>
              <button 
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                onClick={onCancelConnection}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'sans-serif' }}>
              Kurulacak 3D ilişki çizgisi için bir kategori seçin:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {connectionConcepts.map((concept) => (
                <button
                  key={concept.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onCompleteConnection(concept.id)}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: concept.color, boxShadow: `0 0 8px ${concept.color}` }}></div>
                  <span style={{ fontWeight: '500', fontFamily: 'sans-serif' }}>{concept.name}</span>
                </button>
              ))}
            </div>

            <button 
              className="btn-danger" 
              style={{ padding: '8px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
              onClick={onCancelConnection}
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
