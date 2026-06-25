import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, FileText, ImageIcon, Calendar, Eye, Compass } from 'lucide-react';

export function getRoomInfo(note, roomNames = {}) {
  if (note.roomId && note.roomName) {
    // If the note has both fields pre-set (from legacy or specific source), respect it unless roomNames has an override
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

  const defaultNames = {
    hall: 'Giriş / Hol',
    bedroom: 'Yatak Odası',
    kitchen: 'Mutfak',
    study: 'Çalışma Odası',
    living: 'Salon',
    unknown: 'Bilinmeyen Oda'
  };

  return { roomId, roomName: roomNames[roomId] || defaultNames[roomId] || 'Bilinmeyen Oda' };
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('tr-TR', {
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

function getNoteTitle(note) {
  const firstPageText = note.pages?.[0]?.text || '';
  const lines = firstPageText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
  }
  return 'Başlıksız Not';
}

function getNotePreview(note) {
  const firstPageText = note.pages?.[0]?.text || '';
  const lines = firstPageText.split('\n').map(l => l.trim()).filter(Boolean);
  const cleanText = firstPageText.replace(/\n/g, ' ').trim();
  return cleanText.length > 60 ? cleanText.substring(0, 60) + '...' : cleanText || 'İçerik boş...';
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
  onDeleteConcept
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'connections' | 'concepts'
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptColor, setNewConceptColor] = useState('#00f0ff');

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
      }[item.type] || 'Eşya';
      
      return item.linkedNote?.title || `${defaultLabel} (${item.id.substring(0, 6)})`;
    }

    return `Kayıp Nesne (${id.substring(0, 8)})`;
  };

  const getObjectConnectionCount = (id) => {
    return connections.filter(c => c.fromId === id || c.toId === id).length;
  };

  const getObjectConnectionColors = (id) => {
    const objConns = connections.filter(c => c.fromId === id || c.toId === id);
    return [...new Set(objConns.map(c => c.color))];
  };

  const roomsFilter = useMemo(() => [
    { id: 'all', name: 'Tümü' },
    { id: 'hall', name: roomNames.hall || 'Giriş / Hol' },
    { id: 'study', name: roomNames.study || 'Çalışma Odası' },
    { id: 'living', name: roomNames.living || 'Salon' },
    { id: 'kitchen', name: roomNames.kitchen || 'Mutfak' },
    { id: 'bedroom', name: roomNames.bedroom || 'Yatak Odası' }
  ], [roomNames]);

  // Duvar notları ve eşya notlarını tek bir dizide birleştir
  const allNotes = useMemo(() => {
    // 1. Duvar notları
    const wallNotes = notes.map((n) => ({
      ...n,
      isWallNote: true,
      displayTitle: getNoteTitle(n),
      displayPreview: getNotePreview(n),
      tags: n.tags || [],
      roomId: getRoomInfo(n, roomNames).roomId,
      roomName: getRoomInfo(n, roomNames).roomName,
    }));

    // 2. Eşya notları (yalnızca linkedNote olan eşyalar)
    const itemNotes = placedItems
      .filter((item) => item.linkedNote)
      .map((item) => {
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
        }[item.type] || 'Eşya';

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
          displayTitle: item.linkedNote.title || `${defaultLabel} Notu`,
          displayPreview: item.linkedNote.pages?.[0]?.text
            ? (item.linkedNote.pages[0].text.length > 60 
               ? item.linkedNote.pages[0].text.substring(0, 60) + '...' 
               : item.linkedNote.pages[0].text)
            : 'İçerik boş...',
          itemLabel: defaultLabel,
          itemType: item.type
        };
      });

    return [...wallNotes, ...itemNotes];
  }, [notes, placedItems, roomNames]);

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
  }, [allNotes, searchQuery, selectedRoom]);

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
              <h2 className="dashboard-title">HOLOGRAFİK KONTROL PANELİ</h2>
              <span className="dashboard-subtitle">ZİHİN HARİTASI EVİ NOT NAVİGATÖRÜ</span>
            </div>
          </div>
          <button className="dashboard-close-btn" onClick={onClose} title="Kapat (ESC)">
            <X size={20} />
          </button>
        </div>

        {/* Sekme Geçiş Menüsü */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', padding: '0 24px', background: 'rgba(0, 0, 0, 0.2)', flexShrink: 0 }}>
          {[
            { id: 'notes', name: '📚 Notlar & Eşyalar' },
            { id: 'connections', name: '🔗 3D İlişkiler' },
            { id: 'concepts', name: '🎨 Kavram Yönetimi' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #00f0ff' : '2px solid transparent',
                color: activeTab === tab.id ? '#00f0ff' : '#94a3b8',
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
              placeholder="Not metni, başlık veya oda ara..."
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
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center', marginRight: '6px' }}>Etiket:</span>
            {['all', 'Fikir', 'Araştırma', 'Acil', 'Görev', 'Özet', 'Kaynak'].map((tag) => (
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
                {tag === 'all' ? 'Tümü' : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="notes-list-container" onWheel={handleWheel}>
          {filteredNotes.length === 0 ? (
            <div className="empty-dashboard-state">
              <FileText size={48} className="empty-icon" />
              <p>Aramanızla eşleşen not bulunamadı.</p>
              <span>Filtreleri değiştirmeyi veya yeni not eklemeyi deneyin.</span>
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
                            <span className="card-room-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                              {note.itemLabel}
                            </span>
                          )}

                          {/* Etiket Rozetleri */}
                          {(note.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="card-room-badge"
                              style={{
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: '#a5b4fc',
                                borderColor: 'rgba(99, 102, 241, 0.3)',
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
                                background: 'rgba(0, 240, 255, 0.1)', 
                                color: '#00f0ff', 
                                borderColor: 'rgba(0, 240, 255, 0.2)',
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
                            <span className="card-badge-icon" title="Görsel İçeriyor">
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
                            {formatDate(note.updatedAt)}
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
                            Seç
                          </button>
                          <button 
                            className="card-btn-goto btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onGoToNote(note);
                            }}
                          >
                            <Eye size={12} style={{ marginRight: '4px' }} />
                            Nota Git
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
          <span>Toplam: {notes.length} not</span>
          <span>Listelenen: {filteredNotes.length} not</span>
        </div>
      </>
    )}

    {/* 3D BAĞLANTILAR SEKMESİ */}
    {activeTab === 'connections' && (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '24px' }}>
        {/* Global Görünürlük Modları */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'sans-serif' }}>Görünürlük Modu:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', name: 'Tümünü Göster' },
              { id: 'selected-only', name: 'Sadece Seçili Olanlar' },
              { id: 'hidden', name: 'Tümünü Gizle' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => onChangeVisibilityMode(mode.id)}
                style={{
                  background: connectionVisibilityMode === mode.id ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: connectionVisibilityMode === mode.id ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
                  color: connectionVisibilityMode === mode.id ? '#00f0ff' : '#94a3b8',
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
              <p style={{ fontFamily: 'sans-serif' }}>Henüz hiçbir 3D bağlantı oluşturulmadı.</p>
              <span style={{ fontFamily: 'sans-serif' }}>Bir not veya eşya seçip "Bağlantı" butonunu kullanın.</span>
            </div>
          ) : (
            connections.map(conn => {
              const concept = connectionConcepts.find(cc => cc.id === conn.conceptId) || { name: 'Genel', color: '#00f0ff' };
              return (
                <div
                  key={conn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '500', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getObjectName(conn.fromId)}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                        {conn.fromType === 'note' ? 'Duvar Notu' : 'Eşya'}
                      </span>
                    </div>
                    <span style={{ color: '#00f0ff', fontSize: '1rem', flexShrink: 0 }}>➡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '500', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getObjectName(conn.toId)}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                        {conn.toType === 'note' ? 'Duvar Notu' : 'Eşya'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {/* Kavram Badgesi */}
                    <span
                      style={{
                        background: `rgba(${parseInt(concept.color.slice(1,3),16) || 0}, ${parseInt(concept.color.slice(3,5),16) || 0}, ${parseInt(concept.color.slice(5,7),16) || 0}, 0.15)`,
                        color: concept.color,
                        border: `1px solid ${concept.color}35`,
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
                        background: conn.isVisible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: conn.isVisible ? '1px solid #10b981' : '1px solid #ef4444',
                        color: conn.isVisible ? '#34d399' : '#fca5a5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      {conn.isVisible ? 'Görünür' : 'Gizli'}
                    </button>

                    {/* Sil Butonu */}
                    <button
                      onClick={() => onDeleteConnection(conn.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      Sil
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
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.9rem', color: '#00f0ff', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Yeni Kavram Tanımla</span>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Kavram adı yazın..."
              value={newConceptName}
              onChange={(e) => setNewConceptName(e.target.value)}
              style={{
                flex: 1,
                minWidth: '150px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />

            {/* Renk Seçici */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
              {CONCEPT_COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setNewConceptColor(c)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: newConceptColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
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
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'sans-serif'
              }}
            >
              Ekle
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
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => {
                    const idx = CONCEPT_COLORS.indexOf(concept.color);
                    const nextIdx = idx === -1 ? 0 : (idx + 1) % CONCEPT_COLORS.length;
                    onUpdateConcept(concept.id, { color: CONCEPT_COLORS[nextIdx] });
                  }}
                  title="Rengi değiştirmek için tıklayın"
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: concept.color,
                    boxShadow: `0 0 8px ${concept.color}`,
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
                
                <input
                  type="text"
                  value={concept.name}
                  disabled={concept.id === 'concept_general'}
                  onChange={(e) => onUpdateConcept(concept.id, { name: e.target.value })}
                  style={{
                    background: 'none',
                    border: concept.id === 'concept_general' ? 'none' : '1px dashed rgba(255,255,255,0.1)',
                    color: '#f8fafc',
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
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif'
                  }}
                >
                  Sil
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
