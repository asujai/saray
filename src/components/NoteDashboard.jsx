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
  roomNames = {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');

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

      // 2. Search query filter
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
                      <div className="card-header-row">
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
        <div className="dashboard-footer">
          <span>Toplam: {notes.length} not</span>
          <span>Listelenen: {filteredNotes.length} not</span>
        </div>
      </div>
    </div>
  );
}
