import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, FileText, ImageIcon, Calendar, Eye, Compass } from 'lucide-react';

const DASH_TRANSLATIONS = {
  tr: {
    title: 'HOLOGRAFİK KONTROL PANELİ',
    subtitle: 'ZİHİN HARİTASI EVİ NOT NAVİGATÖRÜ',
    close_esc: 'Kapat (ESC)',
    tab_notes: '📚 Notlar & Eşyalar',
    tab_connections: '🔗 3D İlişkiler',
    tab_concepts: '🎨 Kavram Yönetimi',
    search_placeholder: 'Not metni, başlık veya oda ara...',
    all: 'Tümü',
    tag_label: 'Etiket:',
    no_notes: 'Aramanızla eşleşen not bulunamadı.',
    try_filter: 'Filtreleri değiştirmeyi veya yeni not eklemeyi deneyin.',
    select: 'Seç',
    go_to_note: 'Nota Git',
    has_image: 'Görsel İçeriyor',
    total: 'Toplam',
    listed: 'Listelenen',
    note_singular: 'not',
    visibility_mode: 'Görünürlük Modu:',
    show_all: 'Tümünü Göster',
    selected_only: 'Sadece Seçili Olanlar',
    hide_all: 'Tümünü Gizle',
    no_connections: 'Henüz hiçbir 3D bağlantı oluşturulmadı.',
    use_connection_btn: 'Bir not veya eşya seçip "Bağlantı" butonunu kullanın.',
    wall_note: 'Duvar Notu',
    item: 'Eşya',
    visible: 'Görünür',
    hidden: 'Gizli',
    delete: 'Sil',
    define_concept: 'Yeni Kavram Tanımla',
    concept_placeholder: 'Kavram adı yazın...',
    add: 'Ekle',
    change_color: 'Rengi değiştirmek için tıklayın',
    untitled_note: 'Başlıksız Not',
    empty_content: 'İçerik boş...',
    room_hall: 'Giriş / Hol',
    room_bedroom: 'Yatak Odası',
    room_kitchen: 'Mutfak',
    room_study: 'Çalışma Odası',
    room_living: 'Salon',
    room_unknown: 'Bilinmeyen Oda',
    item_desk: 'Çalışma Masası',
    item_chair: 'Ofis Sandalyesi',
    item_shelf: 'Büyük Kitaplık',
    item_wallshelf: 'Duvar Rafı',
    item_plant: 'Saksı Bitkisi',
    item_lamp: 'Ayaklı Lamba',
    item_rug: 'Desenli Halı',
    item_pc: 'Bilgisayar Seti',
    item_box: 'Koli / Kutu',
    item_board: 'Çalışma Panosu',
    item_generic: 'Eşya',
    lost_object: 'Kayıp Nesne',
    note_suffix: 'Notu'
  },
  en: {
    title: 'HOLOGRAPHIC CONTROL PANEL',
    subtitle: 'MIND MAP HOUSE NOTE NAVIGATOR',
    close_esc: 'Close (ESC)',
    tab_notes: '📚 Notes & Items',
    tab_connections: '🔗 3D Relations',
    tab_concepts: '🎨 Concept Management',
    search_placeholder: 'Search note text, title or room...',
    all: 'All',
    tag_label: 'Tag:',
    no_notes: 'No notes match your search.',
    try_filter: 'Try changing filters or adding new notes.',
    select: 'Select',
    go_to_note: 'Go to Note',
    has_image: 'Contains Image',
    total: 'Total',
    listed: 'Listed',
    note_singular: 'notes',
    visibility_mode: 'Visibility Mode:',
    show_all: 'Show All',
    selected_only: 'Selected Only',
    hide_all: 'Hide All',
    no_connections: 'No 3D connections created yet.',
    use_connection_btn: 'Select a note or item and use the "Connection" button.',
    wall_note: 'Wall Note',
    item: 'Item',
    visible: 'Visible',
    hidden: 'Hidden',
    delete: 'Delete',
    define_concept: 'Define New Concept',
    concept_placeholder: 'Write concept name...',
    add: 'Add',
    change_color: 'Click to change color',
    untitled_note: 'Untitled Note',
    empty_content: 'Empty content...',
    room_hall: 'Entrance / Hall',
    room_bedroom: 'Bedroom',
    room_kitchen: 'Kitchen',
    room_study: 'Study Room',
    room_living: 'Living Room',
    room_unknown: 'Unknown Room',
    item_desk: 'Study Desk',
    item_chair: 'Office Chair',
    item_shelf: 'Bookshelf',
    item_wallshelf: 'Wall Shelf',
    item_plant: 'Potted Plant',
    item_lamp: 'Floor Lamp',
    item_rug: 'Patterned Rug',
    item_pc: 'PC Set',
    item_box: 'Box',
    item_board: 'Study Board',
    item_generic: 'Item',
    lost_object: 'Lost Object',
    note_suffix: 'Note'
  }
};

export function getRoomInfo(note, roomNames = {}, lang = 'tr') {
  if (note.roomId && note.roomName) {
    return { roomId: note.roomId, roomName: roomNames[note.roomId] || note.roomName };
  }
  
  const [x, y, z] = note.position || [0, 0, 0];
  let roomId = 'unknown';
  
  if (x >= -5 && x <= 5) {
    roomId = 'hall';
  } else if (x < -5 && z > 0) {
    roomId = 'bedroom';
  } else if (x < -5 && z <= 0) {
    roomId = 'kitchen';
  } else if (x > 5 && z > 0) {
    roomId = 'study';
  } else if (x > 5 && z <= 0) {
    roomId = 'living';
  }

  const dt = DASH_TRANSLATIONS[lang] || DASH_TRANSLATIONS.tr;
  const defaultNames = {
    hall: dt.room_hall,
    bedroom: dt.room_bedroom,
    kitchen: dt.room_kitchen,
    study: dt.room_study,
    living: dt.room_living,
    unknown: dt.room_unknown
  };

  return { roomId, roomName: roomNames[roomId] || defaultNames[roomId] || dt.room_unknown };
}

function formatDate(dateString, lang = 'tr') {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

function getNoteTitle(note, lang = 'tr') {
  if (note.title && note.title.trim()) return note.title;
  const dt = DASH_TRANSLATIONS[lang] || DASH_TRANSLATIONS.tr;
  const firstPageText = note.pages?.[0]?.text || '';
  const lines = firstPageText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
  }
  return dt.untitled_note;
}

function getNotePreview(note, lang = 'tr') {
  const dt = DASH_TRANSLATIONS[lang] || DASH_TRANSLATIONS.tr;
  const firstPageText = note.pages?.[0]?.text || '';
  const lines = firstPageText.split('\n').map(l => l.trim()).filter(Boolean);
  const cleanText = firstPageText.replace(/\n/g, ' ').trim();
  return cleanText.length > 60 ? cleanText.substring(0, 60) + '...' : cleanText || dt.empty_content;
}

export default function NoteDashboard({
  isOpen,
  onClose,
  notes,
  placedItems = [],
  activeNoteId,
  onSelectNote,
  onGoToNote,
  roomNames = {},
  connections = [],
  connectionConcepts = [],
  connectionVisibilityMode = 'selected-only',
  onChangeVisibilityMode,
  onDeleteConnection,
  onToggleConnectionVisibility,
  onAddConcept,
  onUpdateConcept,
  onDeleteConcept,
  uiTheme,
  lang = 'tr',
  setLang,
  currentRoomId = 'study',
  onUpdateNotesVisibility,
  onConnectNotes,
  onStartStudySession
}) {
  const dt = DASH_TRANSLATIONS[lang] || DASH_TRANSLATIONS.tr;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'connections' | 'concepts'
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptColor, setNewConceptColor] = useState('#00f0ff');
  const [checkedNoteIds, setCheckedNoteIds] = useState([]);

  const CONCEPT_COLORS = ['#00f0ff', '#a78bfa', '#60a5fa', '#facc15', '#fb923c', '#4ade80', '#f472b6', '#fca5a5', '#34d399', '#38bdf8'];

  const getObjectName = (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const firstLine = (note.pages?.[0]?.text || '').split('\n')[0].trim();
      return note.title || firstLine || `Not (${note.id.substring(0, 8)})`;
    }

    const item = placedItems.find(i => i.id === id);
    if (item) {
      const defaultLabel = {
        desk: dt.item_desk,
        chair: dt.item_chair,
        shelf: dt.item_shelf,
        wallshelf: dt.item_wallshelf,
        plant: dt.item_plant,
        lamp: dt.item_lamp,
        rug: dt.item_rug,
        pc: dt.item_pc,
        box: dt.item_box,
        board: dt.item_board
      }[item.type] || dt.item_generic;
      
      return item.linkedNote?.title || `${defaultLabel} (${item.id.substring(0, 6)})`;
    }

    return `${dt.lost_object} (${id.substring(0, 8)})`;
  };

  const getObjectConnectionCount = (id) => {
    return connections.filter(c => c.fromId === id || c.toId === id).length;
  };

  const getObjectConnectionColors = (id) => {
    const objConns = connections.filter(c => c.fromId === id || c.toId === id);
    return [...new Set(objConns.map(c => c.color))];
  };

  const roomsFilter = useMemo(() => [
    { id: 'all', name: dt.all },
    { id: 'hall', name: roomNames.hall || dt.room_hall },
    { id: 'study', name: roomNames.study || dt.room_study },
    { id: 'living', name: roomNames.living || dt.room_living },
    { id: 'kitchen', name: roomNames.kitchen || dt.room_kitchen },
    { id: 'bedroom', name: roomNames.bedroom || dt.room_bedroom }
  ], [roomNames, dt]);

  // Duvar notları ve eşya notlarını tek bir dizide birleştir
  const allNotes = useMemo(() => {
    // 1. Duvar notları
    const wallNotes = notes.map((n) => ({
      ...n,
      isWallNote: true,
      displayTitle: getNoteTitle(n, lang),
      displayPreview: getNotePreview(n, lang),
      tags: n.tags || [],
      roomId: getRoomInfo(n, roomNames).roomId,
      roomName: getRoomInfo(n, roomNames).roomName,
    }));

    // 2. Eşya notları (yalnızca linkedNote olan eşyalar)
    const itemNotes = placedItems
      .filter((item) => item.linkedNote)
      .map((item) => {
        const defaultLabel = {
          desk: dt.item_desk,
          chair: dt.item_chair,
          shelf: dt.item_shelf,
          wallshelf: dt.item_wallshelf,
          plant: dt.item_plant,
          lamp: dt.item_lamp,
          rug: dt.item_rug,
          pc: dt.item_pc,
          box: dt.item_box,
          board: dt.item_board
        }[item.type] || dt.item_generic;

        return {
          id: item.id,
          isWallNote: false,
          roomId: item.roomId,
          roomName: roomNames[item.roomId] || item.roomId,
          color: item.color,
          pages: item.linkedNote.pages,
          currentPageIndex: item.linkedNote.currentPageIndex,
          tags: item.linkedNote.tags || [],
          updatedAt: item.linkedNote.updatedAt,
          displayTitle: item.linkedNote.title || `${defaultLabel} ${dt.note_suffix}`,
          displayPreview: item.linkedNote.pages?.[0]?.text
            ? (item.linkedNote.pages[0].text.length > 60 
               ? item.linkedNote.pages[0].text.substring(0, 60) + '...' 
               : item.linkedNote.pages[0].text)
            : dt.empty_content,
          itemLabel: defaultLabel,
          itemType: item.type,
          hidden: item.linkedNote.hidden || false
        };
      });

    return [...wallNotes, ...itemNotes];
  }, [notes, placedItems, roomNames]);

  // Filtrelenmiş oda notları (Görsel Çalışma Modu için)
  const currentRoomNotes = useMemo(() => {
    return allNotes.filter(note => note.roomId === currentRoomId);
  }, [allNotes, currentRoomId]);

  const isAllChecked = useMemo(() => {
    return currentRoomNotes.length > 0 && currentRoomNotes.every(n => checkedNoteIds.includes(n.id));
  }, [currentRoomNotes, checkedNoteIds]);

  const toggleCheckedNote = (id) => {
    setCheckedNoteIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllChecked) {
      setCheckedNoteIds([]);
    } else {
      setCheckedNoteIds(currentRoomNotes.map(n => n.id));
    }
  };

  React.useEffect(() => {
    setCheckedNoteIds([]);
  }, [currentRoomId]);

  // Extract all unique tags dynamically from all notes
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set();
    allNotes.forEach((note) => {
      const noteTags = note.tags || [];
      noteTags.forEach((tag) => {
        const trimmed = tag ? tag.trim() : '';
        if (trimmed) {
          tagsSet.add(trimmed);
        }
      });
    });
    return ['all', ...Array.from(tagsSet)];
  }, [allNotes]);

  // Process and filter notes
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      // 1. Room filter
      if (selectedRoom !== 'all' && note.roomId !== selectedRoom) {
        return false;
      }

      // 2. Tag filter
      if (selectedTag !== 'all') {
        const noteTags = note.tags || [];
        if (!noteTags.includes(selectedTag)) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim() === '') {
        return true;
      }

      const q = searchQuery.toLowerCase();
      const title = note.displayTitle.toLowerCase();
      const roomName = note.roomName.toLowerCase();
      const itemLabel = (note.itemLabel || '').toLowerCase();
      
      // Check if query is in title, room name, or item label
      if (title.includes(q) || roomName.includes(q) || itemLabel.includes(q)) {
        return true;
      }

      // Check pages content
      if (note.pages && Array.isArray(note.pages)) {
        return note.pages.some((page) => {
          const text = (page?.text || '').toLowerCase();
          return text.includes(q);
        });
      }

      return false;
    });
  }, [allNotes, searchQuery, selectedRoom, selectedTag]);

  if (!isOpen) return null;

  // Stop events from leaking to Three.js canvas
  const preventPropagation = (e) => {
    e.stopPropagation();
  };

  const handleWheel = (e) => {
    e.stopPropagation(); // Prevent mouse wheel from zooming camera inside dashboard scroll lists
  };

  return (
    <div 
      className="dashboard-overlay interactive-ui"
      onPointerDown={preventPropagation}
      onMouseDown={preventPropagation}
      onMouseUp={preventPropagation}
      onClick={preventPropagation}
      onWheel={handleWheel}
    >
      <div className="dashboard-window glass-panel">
        {/* Hologram Tarama Efekt Çizgisi */}
        <div className="hologram-scanline"></div>
        
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <Compass className="dashboard-icon" size={24} />
            <div>
              <h2 className="dashboard-title">{dt.title}</h2>
              <span className="dashboard-subtitle">{dt.subtitle}</span>
            </div>
          </div>
          <button className="dashboard-close-btn" onClick={onClose} title={dt.close_esc}>
            <X size={20} />
          </button>
        </div>

        {/* Sekme Geçiş Menüsü */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', padding: '0 24px', background: 'var(--panel-bg-soft)', flexShrink: 0 }}>
          {[
            { id: 'notes', name: dt.tab_notes },
            { id: 'study', name: lang === 'en' ? '👁️ Study Mode' : '👁️ Çalışma Modu' },
            { id: 'connections', name: dt.tab_connections },
            { id: 'concepts', name: dt.tab_concepts }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--theme-cyan)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--theme-cyan)' : 'var(--text-muted)',
                padding: '12px 16px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'sans-serif'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {activeTab === 'notes' && (
          <>
            {/* Search and Filters Section */}
            <div className="dashboard-controls">
          <div className="search-box-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder={dt.search_placeholder}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="room-filters">
            {roomsFilter.map((room) => (
              <button
                key={room.id}
                className={`room-filter-btn ${selectedRoom === room.id ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room.id)}
              >
                {room.name}
              </button>
            ))}
          </div>

          <div className="room-filters" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '6px' }}>{dt.tag_label}</span>
            {allAvailableTags.map((tag) => (
              <button
                key={tag}
                className={`room-filter-btn ${selectedTag === tag ? 'active' : ''}`}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => setSelectedTag(tag)}
              >
                {tag === 'all' ? dt.all : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="notes-list-container" onWheel={handleWheel}>
          {filteredNotes.length === 0 ? (
            <div className="empty-dashboard-state">
              <FileText size={48} className="empty-icon" />
              <p>{dt.no_notes}</p>
              <span>{dt.try_filter}</span>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => {
                const title = note.displayTitle;
                const preview = note.displayPreview;
                const pageCount = note.pages?.length || 1;
                const hasImage = note.pages?.some(p => p.image) || false;
                const isSelected = activeNoteId === note.id;

                return (
                  <div 
                    key={note.id} 
                    className={`note-dashboard-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectNote(note.id)}
                  >
                    {/* Renk Çizgisi */}
                    <div 
                      className="card-color-indicator" 
                      style={{ backgroundColor: note.color || '#fef08a' }}
                    />
                    
                    <div className="card-body">
                      <div className="card-header-row" style={{ flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="card-room-badge">
                            <MapPin size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {note.roomName}
                          </span>
                          
                          {!note.isWallNote && (
                            <span className="card-room-badge" style={{ background: 'var(--theme-success-bg)', color: 'var(--theme-success)', borderColor: 'var(--theme-success)' }}>
                              {note.itemLabel}
                            </span>
                          )}

                          {/* Etiket Rozetleri */}
                          {(note.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="card-room-badge"
                              style={{
                                background: 'var(--primary-glow)',
                                color: 'var(--primary)',
                                borderColor: 'var(--primary)',
                                fontSize: '0.7rem'
                              }}
                            >
                              🏷️ {tag}
                            </span>
                          ))}

                          {getObjectConnectionCount(note.id) > 0 && (
                            <span 
                              className="card-room-badge" 
                              style={{ 
                                background: 'var(--button-bg-secondary)', 
                                color: 'var(--theme-cyan)', 
                                borderColor: 'var(--theme-cyan)',
                                fontSize: '0.7rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              🔗 {getObjectConnectionCount(note.id)}
                            </span>
                          )}
                        </div>
                        
                        <div className="card-badge-group">
                          {hasImage && (
                            <span className="card-badge-icon" title={dt.has_image}>
                              <ImageIcon size={12} />
                            </span>
                          )}
                          <span className="card-page-badge">
                            {pageCount} S.
                          </span>
                        </div>
                      </div>

                      <h3 className="card-note-title">{title}</h3>
                      <p className="card-note-preview">{preview}</p>

                      <div className="card-footer-row">
                        {note.updatedAt ? (
                          <span className="card-date">
                            <Calendar size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {formatDate(note.updatedAt, lang)}
                          </span>
                        ) : (
                          <span className="card-date-placeholder" />
                        )}

                        <div className="card-action-buttons">
                          <button
                            className="card-btn-select"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNote(note.id);
                            }}
                          >
                            {dt.select}
                          </button>
                          <button 
                            className="card-btn-goto btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onGoToNote(note);
                            }}
                          >
                            <Eye size={12} style={{ marginRight: '4px' }} />
                            {dt.go_to_note}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="dashboard-footer" style={{ flexShrink: 0 }}>
          <span>{dt.total}: {notes.length} {dt.note_singular}</span>
          <span>{dt.listed}: {filteredNotes.length} {dt.note_singular}</span>
        </div>
      </>
    )}

    {/* GÖRSEL ÇALIŞMA MODU SEKMESİ */}
    {activeTab === 'study' && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header info */}
        <div style={{ padding: '16px 24px', background: 'var(--panel-bg-soft)', borderBottom: '1px solid rgba(0, 240, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--theme-cyan)', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
              📍 {lang === 'en' ? 'Active Room:' : 'Aktif Oda:'} {roomNames[currentRoomId] || currentRoomId}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
              {checkedNoteIds.length} / {currentRoomNotes.length} {lang === 'en' ? 'selected' : 'seçili'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'sans-serif', lineHeight: '1.4' }}>
            {lang === 'en' 
              ? 'Select notes in this room to change their visibility, connect them in order, or navigate through them sequentially.' 
              : 'Görünürlüklerini değiştirmek, sırayla bağlamak veya aralarında gezinmek için bu odadaki notları seçin.'}
          </p>
        </div>

        {/* Actions Bar */}
        <div style={{ padding: '12px 24px', background: 'var(--panel-bg-hard)', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(0, 240, 255, 0.08)' }}>
          <button
            onClick={toggleSelectAll}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            {isAllChecked ? (lang === 'en' ? 'Deselect All' : 'Seçimi Kaldır') : (lang === 'en' ? 'Select All' : 'Tümünü Seç')}
          </button>

          <button
            disabled={checkedNoteIds.length === 0}
            onClick={() => {
              onUpdateNotesVisibility(
                checkedNoteIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
              );
            }}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', opacity: checkedNoteIds.length === 0 ? 0.5 : 1 }}
          >
            👁️ {lang === 'en' ? 'Show' : 'Görünür Yap'}
          </button>

          <button
            disabled={checkedNoteIds.length === 0}
            onClick={() => {
              onUpdateNotesVisibility(
                checkedNoteIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
              );
            }}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', opacity: checkedNoteIds.length === 0 ? 0.5 : 1 }}
          >
            🙈 {lang === 'en' ? 'Hide' : 'Gizle'}
          </button>

          <button
            disabled={checkedNoteIds.length === 0}
            onClick={() => {
              const updates = {};
              currentRoomNotes.forEach(n => {
                updates[n.id] = !checkedNoteIds.includes(n.id);
              });
              onUpdateNotesVisibility(updates);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', opacity: checkedNoteIds.length === 0 ? 0.5 : 1 }}
          >
            🎯 {lang === 'en' ? 'Show Only' : 'Sadece Bunları Göster'}
          </button>

          <button
            disabled={checkedNoteIds.length < 2}
            onClick={() => {
              const selectedNotesWithTypes = checkedNoteIds.map(id => {
                const found = currentRoomNotes.find(n => n.id === id);
                return found ? { id: found.id, type: found.isWallNote ? 'note' : 'item' } : null;
              }).filter(Boolean);
              onConnectNotes(selectedNotesWithTypes);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', opacity: checkedNoteIds.length < 2 ? 0.5 : 1 }}
          >
            🔗 {lang === 'en' ? 'Connect in Order' : 'Sırayla Bağla'}
          </button>

          <button
            disabled={checkedNoteIds.length === 0}
            onClick={() => {
              const orderedNoteList = checkedNoteIds.map(id => currentRoomNotes.find(n => n.id === id)).filter(Boolean);
              onStartStudySession(orderedNoteList);
              onClose();
            }}
            style={{ 
              fontSize: '0.75rem', 
              padding: '6px 12px', 
              opacity: checkedNoteIds.length === 0 ? 0.5 : 1,
              background: 'var(--theme-cyan)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🚀 {lang === 'en' ? 'Start Study Session' : 'Çalışmayı Başlat'}
          </button>
        </div>

        {/* List Section */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} onWheel={handleWheel}>
          {currentRoomNotes.length === 0 ? (
            <div className="empty-dashboard-state" style={{ padding: '40px 0' }}>
              <FileText size={48} className="empty-icon" />
              <p style={{ fontFamily: 'sans-serif' }}>
                {lang === 'en' ? 'No notes in this room.' : 'Bu odada henüz not bulunmuyor.'}
              </p>
              <span style={{ fontFamily: 'sans-serif' }}>
                {lang === 'en' ? 'Add notes to this room to start studying.' : 'Çalışmaya başlamak için odaya not ekleyin.'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentRoomNotes.map((note) => {
                const isChecked = checkedNoteIds.includes(note.id);
                const isHidden = note.hidden;
                
                return (
                  <div
                    key={note.id}
                    onClick={() => toggleCheckedNote(note.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: isChecked ? 'rgba(0, 240, 255, 0.05)' : 'var(--panel-bg-soft)',
                      border: isChecked ? '1px solid var(--theme-cyan)' : '1px solid var(--panel-border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      gap: '12px',
                      opacity: isHidden ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: 'var(--theme-cyan)',
                          cursor: 'pointer'
                        }}
                      />
                    </div>

                    {/* Color Indicator */}
                    <div
                      style={{
                        width: '4px',
                        height: '24px',
                        borderRadius: '2px',
                        background: note.color || '#fef08a',
                        flexShrink: 0
                      }}
                    />

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {note.displayTitle}
                        </span>
                        {isHidden && (
                          <span style={{ fontSize: '0.65rem', background: 'var(--theme-danger-bg)', color: 'var(--theme-danger)', border: '1px solid var(--theme-danger)', padding: '1px 4px', borderRadius: '4px', fontFamily: 'sans-serif' }}>
                            {lang === 'en' ? 'Hidden' : 'Gizli'}
                          </span>
                        )}
                        {!note.isWallNote && (
                          <span style={{ fontSize: '0.65rem', background: 'var(--theme-success-bg)', color: 'var(--theme-success)', border: '1px solid var(--theme-success)', padding: '1px 4px', borderRadius: '4px', fontFamily: 'sans-serif' }}>
                            {note.itemLabel || (lang === 'en' ? 'Item' : 'Eşya')}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.displayPreview}
                      </span>
                    </div>

                    {/* Focus Camera Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoToNote(note);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                    >
                      👁️ {lang === 'en' ? 'View' : 'Odaklan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

    {/* 3D BAĞLANTILAR SEKMESİ */}
    {activeTab === 'connections' && (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '24px' }}>
        {/* Global Görünürlük Modları */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'var(--panel-bg-soft)', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>{dt.visibility_mode}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', name: dt.show_all },
              { id: 'selected-only', name: dt.selected_only },
              { id: 'hidden', name: dt.hide_all }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => onChangeVisibilityMode(mode.id)}
                style={{
                  background: connectionVisibilityMode === mode.id ? 'var(--theme-success-bg)' : 'var(--button-bg-secondary)',
                  border: connectionVisibilityMode === mode.id ? '1px solid var(--theme-cyan)' : '1px solid var(--panel-border)',
                  color: connectionVisibilityMode === mode.id ? 'var(--theme-cyan)' : 'var(--text-muted)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif'
                }}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bağlantılar Listesi */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} onWheel={handleWheel}>
          {connections.length === 0 ? (
            <div className="empty-dashboard-state" style={{ padding: '40px 0' }}>
              <FileText size={48} className="empty-icon" />
              <p style={{ fontFamily: 'sans-serif' }}>{dt.no_connections}</p>
              <span style={{ fontFamily: 'sans-serif' }}>{dt.use_connection_btn}</span>
            </div>
          ) : (
            connections.map(conn => {
              const concept = connectionConcepts.find(cc => cc.id === conn.conceptId) || { name: dt.all, color: '#00f0ff' };
              return (
                <div
                  key={conn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--panel-bg-soft)',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getObjectName(conn.fromId)}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
                        {conn.fromType === 'note' ? dt.wall_note : dt.item}
                      </span>
                    </div>
                    <span style={{ color: 'var(--theme-cyan)', fontSize: '1rem', flexShrink: 0 }}>➡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getObjectName(conn.toId)}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
                        {conn.toType === 'note' ? dt.wall_note : dt.item}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {/* Kavram Badgesi */}
                    <span
                      style={{
                        background: uiTheme === 'light' 
                          ? concept.color 
                          : `rgba(${parseInt(concept.color.slice(1,3),16) || 0}, ${parseInt(concept.color.slice(3,5),16) || 0}, ${parseInt(concept.color.slice(5,7),16) || 0}, 0.15)`,
                        color: uiTheme === 'light' ? '#fff' : concept.color,
                        border: uiTheme === 'light' ? `1px solid ${concept.color}` : `1px solid ${concept.color}35`,
                        textShadow: uiTheme === 'light' ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      {concept.name}
                    </span>

                    {/* Görünürlük Switch */}
                    <button
                      onClick={() => onToggleConnectionVisibility(conn.id)}
                      style={{
                        background: conn.isVisible ? 'var(--theme-success-bg)' : 'var(--theme-danger-bg)',
                        border: conn.isVisible ? '1px solid var(--theme-success)' : '1px solid var(--theme-danger)',
                        color: conn.isVisible ? 'var(--theme-success)' : 'var(--theme-danger)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      {conn.isVisible ? dt.visible : dt.hidden}
                    </button>

                    {/* Sil Butonu */}
                    <button
                      onClick={() => onDeleteConnection(conn.id)}
                      style={{
                        background: 'var(--theme-danger-bg)',
                        border: '1px solid var(--theme-danger)',
                        color: 'var(--theme-danger)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      {dt.delete}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    )}

    {/* KAVRAM YÖNETİMİ SEKMESİ */}
    {activeTab === 'concepts' && (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '24px', gap: '20px' }}>
        {/* Yeni Kavram Ekleme Formu */}
        <div style={{ background: 'var(--panel-bg-soft)', padding: '16px', borderRadius: '12px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--theme-cyan)', fontWeight: 'bold', fontFamily: 'sans-serif' }}>{dt.define_concept}</span>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={dt.concept_placeholder}
              value={newConceptName}
              onChange={(e) => setNewConceptName(e.target.value)}
              style={{
                flex: 1,
                minWidth: '150px',
                background: 'var(--input-bg)',
                border: '1px solid var(--panel-border)',
                padding: '8px 12px',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />

            {/* Renk Seçici */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--input-bg)', padding: '6px', borderRadius: '8px', border: '1px solid var(--panel-border)', flexWrap: 'wrap' }}>
              {CONCEPT_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setNewConceptColor(c)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: newConceptColor === c ? '2px solid #fff' : '1px solid var(--panel-border)',
                    cursor: 'pointer',
                    transform: newConceptColor === c ? 'scale(1.15)' : 'none',
                    transition: 'transform 0.15s ease'
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                onAddConcept(newConceptName, newConceptColor);
                setNewConceptName('');
              }}
              style={{
                background: 'var(--theme-success-bg)',
                border: '1px solid var(--theme-success)',
                color: 'var(--theme-success)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'sans-serif'
              }}
            >
              {dt.add}
            </button>
          </div>
        </div>

        {/* Kavramlar Listesi */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} onWheel={handleWheel}>
          {connectionConcepts.map(concept => (
            <div
              key={concept.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--panel-bg-soft)',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => {
                    const idx = CONCEPT_COLORS.indexOf(concept.color);
                    const nextIdx = idx === -1 ? 0 : (idx + 1) % CONCEPT_COLORS.length;
                    onUpdateConcept(concept.id, { color: CONCEPT_COLORS[nextIdx] });
                  }}
                  title={dt.change_color}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: concept.color,
                    boxShadow: `0 0 8px ${concept.color}`,
                    cursor: 'pointer',
                    border: '1px solid var(--panel-border)'
                  }}
                />
                
                <input
                  type="text"
                  value={concept.name}
                  disabled={concept.id === 'concept_general'}
                  onChange={(e) => onUpdateConcept(concept.id, { name: e.target.value })}
                  style={{
                    background: 'none',
                    border: concept.id === 'concept_general' ? 'none' : '1px dashed var(--panel-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    outline: 'none',
                    fontFamily: 'sans-serif'
                  }}
                />
              </div>

              {concept.id !== 'concept_general' && (
                <button
                  onClick={() => onDeleteConcept(concept.id)}
                  style={{
                    background: 'var(--theme-danger-bg)',
                    border: '1px solid var(--theme-danger)',
                    color: 'var(--theme-danger)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif'
                  }}
                >
                  {dt.delete}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
      </div>
    </div>
  );
}
