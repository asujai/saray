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

const UI_TRANSLATIONS = {
  tr: {
    // Genel
    close: 'Kapat',
    save: 'Kaydet',
    delete: 'Sil',
    cancel: 'İptal',
    ok: 'Tamam',
    add: 'Ekle',
    remove: 'Kaldır',
    general: 'Genel',
    
    // Yüzen Panel
    control_panel: 'Kontrol Paneli (H)',
    add_note: 'Not Ekle (E)',
    draw_and_add: 'Çiz & Ekle (E)',
    walk: 'Yürüyüş (C)',
    birds_eye: 'Kuş Bakışı (C)',
    free: 'Serbest (C)',
    add_item: 'Eşya Ekle (I)',
    settings: 'Ayarlar (O)',
    hide_panel: 'Paneli Gizle',
    show_panel: 'Kontrol Panelini Göster',
    
    // Ayarlar Modalı
    settings_title: 'Ev & Oda Özelleştirme',
    room_new_name: 'Yeni Adı',
    floor_color: 'Zemin Rengi',
    wall_color: 'Duvar Rengi',
    study_room_template: 'Çalışma Odası Şablonu',
    study_room_template_desc: 'Referans görseldeki kaliteli hazır çalışma odası tasarımını (büyük ahşap masa, koltuk, kitaplık, pano, saksı bitkisi, lamba, halı, duvar rafı) ve örnek notları yükleyebilir veya odayı tamamen boşaltabilirsiniz.',
    load_preset: 'Hazır Şablonu Yükle (Görsel Tasarımı)',
    clear_study_room: 'Çalışma Odasını Boşalt',
    movement_settings: 'Hareket Ayarları',
    free_flight: '✈️ Serbest Uçuş Modu',
    free_flight_desc: 'C tuşu ile uçuş moduna geçebilin',
    mobile_control: '📱 Mobil Kontrol Modu',
    mobile_control_desc: 'Ekran üzerinde dokunmatik yön kontrollerini açın',
    quick_travel: '🚨 Hızlı Işınlanma',
    quick_travel_desc: 'Panelden nota tıklayınca ışınlan',
    home_concept: '🏡 Ev Konsepti',
    minimal: '🏡 Minimal',
    minimal_desc: 'Minimal Çalışma Evi - Sade, modern çalışma ortamı',
    library: '📚 Kütüphane',
    library_desc: 'Kütüphane / Bilgi Evi - Sıcak, ahşap kütüphane evi',
    scifi: '🌌 Bilim Kurgu',
    scifi_desc: 'Bilim Kurgu / Hologram Evi - Teknolojik zihin laboratuvarı',
    ui_theme: '🎨 Arayüz Teması',
    dark_theme: '🌙 Koyu Tema',
    light_theme: '☀️ Açık Tema',
    room_wall_themes: '⚽ Oda Duvar Temaları',
    football_theme: 'Futbol Teması (Dünya Kupası)',
    football_theme_desc: 'Çalışma odası duvarlarına uygulanır',
    saray_backup: '💾 Atrium 3D Yedeği',
    saray_backup_desc: 'Beta sürümde veriler bu tarayıcıda saklanır. Başka cihazda kullanmak veya yedek almak için Atrium 3D Yedeği oluşturabilirsiniz.',
    get_backup: '📥 Atrium 3D Yedeği Al',
    load_backup: '📤 Atrium 3D Yedeği Yükle',
    reset_customizations: 'Özelleştirmeleri Sıfırla (Temaya Dön)',
    return_to_home: '🏠 Ana Sayfaya Dön',
    language: '🌐 Dil / Language',
    
    // Eşya Kütüphanesi
    item_library: 'Eşya Kütüphanesi',
    category_desks: 'Masalar',
    category_chairs: 'Sandalyeler',
    category_shelves: 'Raflar ve Dolaplar',
    category_boards: 'Panolar',
    category_lighting: 'Aydınlatma',
    category_decor: 'Dekor ve Yardımcılar',
    
    // Eşya Çevirileri
    item_desk: 'Çalışma Masası',
    item_large_desk: 'Büyük Çalışma Masası',
    item_meeting_table: 'Toplantı Masası',
    item_l_desk: 'L Tipi Masa',
    item_round_table: 'Yuvarlak Masa',
    item_chair: 'Ofis Sandalyesi',
    item_office_chair: 'Çalışma Koltuğu',
    item_guest_chair: 'Misafir Sandalyesi',
    item_stool: 'Küçük Tabure',
    item_shelf: 'Kitaplık',
    item_large_bookshelf: 'Geniş Kitaplık',
    item_libraryShelf: 'Kütüphane Rafı',
    item_largeLibraryShelf: 'Büyük Kitaplık',
    item_add_book: '📚 Kitap Ekle',
    item_books_title: 'Kitaplar',
    item_low_bookshelf: 'Alçak Kitaplık',
    item_file_cabinet: 'Dosya Dolabı',
    item_drawer_cabinet: 'Çekmeceli Dolap',
    item_large_rack: 'Büyük Raf Ünitesi',
    item_wallshelf: 'Duvar Rafı',
    item_small_wallshelf: 'Küçük Duvar Rafı',
    item_board: 'Çalışma Panosu',
    item_large_board: 'Büyük Pano',
    item_whiteboard: 'Yazı Tahtası',
    item_lamp: 'Ayaklı Lamba',
    item_floor_lamp: 'Zemin Lambası',
    item_desk_lamp: 'Masa Lambası',
    item_rug: 'Desenli Halı',
    item_pc: 'Bilgisayar Seti',
    item_box: 'Koli / Kutu',
    item_archive_box: 'Arşiv Sandığı',
    item_plant: 'Saksı Bitkisi',
    item_large_plant: 'Büyük Saksı Bitkisi',
    item_item: 'Eşya',
    
    // Eşya Düzenleme Barı
    item_positioning: 'Konumlandırma',
    item_color: 'Renk',
    item_size: 'Boyut',
    item_rotate: 'Döndür',
    item_edit_hint: 'Düzenlemek için eşyaya 3 saniye basılı tutun',
    item_edit_btn: '⚙️ Eşyayı Düzenle',
    item_connect_start: '🔗 Bağlantı Başlat',
    item_connect_cancel: '❌ Bağlantıyı İptal Et',
    item_add_note: '📝 Eşyaya Not Ekle',
    item_edit_note: '📝 Notu Düzenle',
    
    // Editör Modal
    editor_read_write: 'Notu Oku & Düzenle',
    note_title: 'Not Başlığı',
    write_note_placeholder: 'Eşya notu başlığı yazın...',
    icon_type: 'İkon Tipi',
    icon_info: 'ℹ️ Bilgi',
    icon_question: '❓ Soru',
    icon_exclamation: '⚠️ Uyarı',
    icon_dot: '🔵 Nokta',
    write_placeholder: 'Yazmaya başlayın...',
    char_limit_reached: ' — Karakter limiti doldu!',
    text_too_large: ' — ⚠️ Metin çok büyük!',
    tag_placeholder: 'Etiket adı yaz...',
    tag_add_btn: 'Ekle',
    connected_notes: '🔗 Bağlantılı Notlar (Işınlanmak için tıklayın)',
    prev_page: 'Önceki Sayfa',
    next_page: 'Sonraki Sayfa',
    page: 'Sayfa',
    add_page: 'Yeni sayfa ekle',
    upload_image: 'Görsel Yükle',
    select_color: 'Renk Seç',
    three_d_relations: '3D İlişkiler',
    show: 'Göster',
    hide: 'Gizle',
    relations_selected_only: 'Sadece Bu İlişkileri Göster',
    relations_show: 'İlişkileri Göster',
    relations_hide: 'İlişkileri Gizle',
    no_relations: 'Bu öğeye ait bir 3D ilişki yok.',
    relations_visible: 'Görünür',
    relations_hidden: 'Gizli',
    delete_note: 'Notu Sil',
    wall_note_label: 'Duvar Notu',
    unknown_object: 'Bilinmeyen Öğe',
    
    // Minimap
    room_hall: 'Giriş / Hol',
    room_bedroom: 'Yatak Odası',
    room_kitchen: 'Mutfak',
    room_study: 'Çalışma Odası',
    room_living: 'Salon',
    room_unknown: 'Bilinmeyen Oda',
    
    // Bağlantı Popover
    concept_choose: 'Bağlantı Kavramı Seçin',
    concept_choose_desc: 'Kurulacak 3D ilişki çizgisi için bir kategori seçin:',
    concept_cancel: 'Vazgeç',
    
    // Mobil Kontroller
    mobile_look: 'BAKIŞ',
    mobile_look_desc: 'Kaydırın',
    mobile_fly_up: 'YÜKSEL',
    mobile_fly_down: 'ALÇAL',
    
    // Sekmeler
    tab_appearance: 'Görünüm',
    tab_room_colors: 'Oda Renkleri',
    tab_wall_covering: 'Duvar Kaplama',
    tab_cleanup: 'Temizlik',
    tab_backup: 'Yedekleme',
    tab_language: 'Dil',
    controls_title: 'Kontroller',
    select_target: 'Seçilecek Alan',
    floor_and_wall: 'Zemin & Duvar Renkleri',
    select_color: 'Renk Seçin',
    apply_color: 'Rengi Uygula',
    cleanup_desc: 'Bu odadaki eşyaları veya notları toplu olarak silebilirsiniz.',
    what_to_remove: 'Temizlenecek Tür',
    remove_objects: 'Sadece Eşyalar',
    remove_notes: 'Sadece Duvar Notları',
    remove_all: 'Tüm Oda İçeriği',
    remove_all_confirm: 'UYARI: Odadaki seçili tüm içerik silinecek. Devam etmek istiyor musunuz?',
    btn_remove: 'Temizliği Başlat',
    return_to_home: 'Ana Sayfaya Dön'
  },
  en: {
    // General
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    ok: 'OK',
    add: 'Add',
    remove: 'Remove',
    general: 'General',
    
    // Floating Panel
    control_panel: 'Control Panel (H)',
    add_note: 'Add Note (E)',
    draw_and_add: 'Draw & Add (E)',
    walk: 'Walk Mode (C)',
    birds_eye: 'Birds-Eye (C)',
    free: 'Free Flight (C)',
    add_item: 'Add Item (I)',
    settings: 'Settings (O)',
    hide_panel: 'Hide Panel',
    show_panel: 'Show Control Panel',
    
    // Settings Modal
    settings_title: 'Home & Room Customization',
    room_new_name: 'New Name',
    floor_color: 'Floor Color',
    wall_color: 'Wall Color',
    study_room_template: 'Study Room Template',
    study_room_template_desc: 'You can load the high-quality preset study room design from the reference image (large wooden desk, chair, bookshelf, board, potted plant, lamp, rug, wall shelf) and sample notes, or empty the room completely.',
    load_preset: 'Load Preset Template (Visual Design)',
    clear_study_room: 'Empty Study Room',
    movement_settings: 'Movement Settings',
    free_flight: '✈️ Free Flight Mode',
    free_flight_desc: 'Enable switching to flight mode with C key',
    mobile_control: '📱 Mobile Control Mode',
    mobile_control_desc: 'Enable touch movement controls on screen',
    quick_travel: '🚨 Quick Teleport',
    quick_travel_desc: 'Teleport when clicking a note on the panel',
    home_concept: '🏡 House Concept',
    minimal: '🏡 Minimal',
    minimal_desc: 'Minimal Study House - Simple, modern study environment',
    library: '📚 Library',
    library_desc: 'Library / Information House - Warm, wooden library house',
    scifi: '🌌 Sci-Fi',
    scifi_desc: 'Sci-Fi / Hologram House - Technological mind laboratory',
    ui_theme: '🎨 User Interface Theme',
    dark_theme: 'Dark Theme',
    light_theme: 'Light Theme',
    room_wall_themes: '⚽ Room Wall Themes',
    football_theme: 'Football Theme (World Cup)',
    football_theme_desc: 'Applied to study room walls',
    saray_backup: '💾 Atrium 3D Backup',
    saray_backup_desc: 'In beta version, data is stored in this browser. You can create a Atrium 3D Backup to use on another device or keep a copy.',
    get_backup: '📥 Get Atrium 3D Backup',
    load_backup: '📤 Load Atrium 3D Backup',
    reset_customizations: 'Reset Customizations (Return to Theme)',
    return_to_home: '🏠 Return to Home',
    language: '🌐 Language / Dil',
    
    // Item Drawer
    item_library: 'Item Library',
    category_desks: 'Desks',
    category_chairs: 'Chairs',
    category_shelves: 'Shelves & Cabinets',
    category_boards: 'Boards',
    category_lighting: 'Lighting',
    category_decor: 'Decor & Helpers',
    
    // Items
    item_desk: 'Study Desk',
    item_large_desk: 'Large Desk',
    item_meeting_table: 'Meeting Table',
    item_l_desk: 'L-Shaped Desk',
    item_round_table: 'Round Table',
    item_chair: 'Office Chair',
    item_office_chair: 'Task Chair',
    item_guest_chair: 'Guest Chair',
    item_stool: 'Small Stool',
    item_shelf: 'Bookshelf',
    item_large_bookshelf: 'Wide Bookshelf',
    item_libraryShelf: 'Library Shelf',
    item_largeLibraryShelf: 'Large Library Shelf',
    item_add_book: '📚 Add Book',
    item_books_title: 'Books',
    item_low_bookshelf: 'Low Bookshelf',
    item_file_cabinet: 'File Cabinet',
    item_drawer_cabinet: 'Drawer Cabinet',
    item_large_rack: 'Large Rack Unit',
    item_wallshelf: 'Wall Shelf',
    item_small_wallshelf: 'Small Wall Shelf',
    item_board: 'Study Board',
    item_large_board: 'Large Board',
    item_whiteboard: 'Whiteboard',
    item_lamp: 'Floor Lamp',
    item_floor_lamp: 'Ground Lamp',
    item_desk_lamp: 'Desk Lamp',
    item_rug: 'Patterned Rug',
    item_pc: 'PC Set',
    item_box: 'Box',
    item_archive_box: 'Archive Chest',
    item_plant: 'Potted Plant',
    item_large_plant: 'Large Potted Plant',
    item_item: 'Item',
    
    // Item Editor Bar
    item_positioning: 'Positioning',
    item_color: 'Color',
    item_size: 'Size',
    item_rotate: 'Rotate',
    item_edit_hint: 'Hold press on item for 3s to edit',
    item_edit_btn: '⚙️ Edit Item',
    item_connect_start: '🔗 Start Connection',
    item_connect_cancel: '❌ Cancel Connection',
    item_add_note: '📝 Add Note to Item',
    item_edit_note: '📝 Edit Note',
    
    // Editor Modal
    editor_read_write: 'Read & Edit Note',
    note_title: 'Note Title',
    write_note_placeholder: 'Write item note title...',
    icon_type: 'Icon Type',
    icon_info: 'ℹ️ Info',
    icon_question: '❓ Question',
    icon_exclamation: '⚠️ Warning',
    icon_dot: '🔵 Dot',
    write_placeholder: 'Start writing...',
    char_limit_reached: ' — Character limit reached!',
    text_too_large: ' — ⚠️ Text too large!',
    tag_placeholder: 'Write tag name...',
    tag_add_btn: 'Add',
    connected_notes: '🔗 Connected Notes (Click to teleport)',
    prev_page: 'Previous Page',
    next_page: 'Next Page',
    page: 'Page',
    add_page: 'Add page',
    upload_image: 'Upload Image',
    select_color: 'Select Color',
    three_d_relations: '3D Relations',
    show: 'Show',
    hide: 'Hide',
    relations_selected_only: 'Show Only These Relations',
    relations_show: 'Show Relations',
    relations_hide: 'Hide Relations',
    no_relations: 'No 3D relations for this item.',
    relations_visible: 'Visible',
    relations_hidden: 'Hidden',
    delete_note: 'Delete Note',
    wall_note_label: 'Wall Note',
    unknown_object: 'Unknown Object',
    
    // Minimap
    room_hall: 'Entrance / Hall',
    room_bedroom: 'Bedroom',
    room_kitchen: 'Kitchen',
    room_study: 'Study Room',
    room_living: 'Living Room',
    room_unknown: 'Unknown Room',
    
    // Connection Popover
    concept_choose: 'Select Connection Concept',
    concept_choose_desc: 'Select a category for the 3D relation line:',
    concept_cancel: 'Cancel',
    
    // Mobile Controls
    mobile_look: 'LOOK',
    mobile_look_desc: 'Swipe',
    mobile_fly_up: 'UP',
    mobile_fly_down: 'DOWN',
    
    // Tabs
    tab_appearance: 'Appearance',
    tab_room_colors: 'Room Colors',
    tab_wall_covering: 'Wall Covering',
    tab_cleanup: 'Cleanup',
    tab_backup: 'Backup',
    tab_language: 'Language',
    controls_title: 'Controls',
    select_target: 'Target Element',
    floor_and_wall: 'Floor & Wall Colors',
    select_color: 'Select Color',
    apply_color: 'Apply Color',
    cleanup_desc: 'You can batch delete items or notes in this room.',
    what_to_remove: 'Select what to remove',
    remove_objects: 'Only Objects',
    remove_notes: 'Only Wall Notes',
    remove_all: 'Entire Room Content',
    remove_all_confirm: 'WARNING: All selected content in the room will be deleted. Do you want to continue?',
    btn_remove: 'Execute Cleanup',
    return_to_home: 'Return to Home Page'
  }
};

// Calculate dynamic character limit based on note dimensions
function calculateCharLimit(_w, _h) {
  return 100000;
}

// Preset Wall Coverings
const PRESET_WALLS = [
  { id: 'wood-panel', name: 'Ahşap Panel', thumbnail: '🪵', url: '/foto_kaplama/ahsap.jpg' },
  { id: 'brick-red', name: 'Kızıl Tuğla', thumbnail: '🧱', url: '/foto_kaplama/tugla.jpg' },
  { id: 'marble-white', name: 'Beyaz Mermer', thumbnail: '🏛️', url: '/foto_kaplama/mermer.jpg' },
  { id: 'concrete-gray', name: 'Brüt Beton', thumbnail: '🪙', url: '/foto_kaplama/beton.jpg' }
];

// Room walls mapping matching the 3D scene wall naming/indices
const wallsByRoom = {
  kitchen: [
    { id: 'kitchen_wall_0', name: 'Mutfak Arka Duvar' },
    { id: 'kitchen_wall_1', name: 'Mutfak Sol Yan Duvar' },
    { id: 'kitchen_wall_2', name: 'Mutfak Sağ Bölme Duvarı (Giriş)' }
  ],
  bedroom: [
    { id: 'bedroom_wall_0', name: 'Yatak Odası Sol Duvar (Yatak Arkası)' },
    { id: 'bedroom_wall_1', name: 'Yatak Odası Arka Duvar' },
    { id: 'bedroom_wall_2', name: 'Yatak Odası Sağ Bölme Duvarı' }
  ],
  study: [
    { id: 'study_wall_0', name: 'Çalışma Odası Arka Duvar (Kitaplık Arkası)' },
    { id: 'study_wall_1', name: 'Çalışma Odası Sol Bölme Duvarı' },
    { id: 'study_wall_2', name: 'Çalışma Odası Sağ Dış Duvar' }
  ],
  living: [
    { id: 'living_wall_0', name: 'Salon Sol Bölme Duvarı (Giriş)' },
    { id: 'living_wall_1', name: 'Salon Arka Duvar (TV Arkası)' },
    { id: 'living_wall_2', name: 'Salon Sağ Dış Duvar' }
  ],
  hall: [
    { id: 'hall_wall_0', name: 'Giriş Holü Arka Duvar' },
    { id: 'hall_wall_1', name: 'Giriş Holü Sol Yan Duvar' }
  ]
};

// Rooms lists for settings selection dropdown
const roomsList = [
  { id: 'kitchen', name: 'Mutfak' },
  { id: 'bedroom', name: 'Yatak Odası' },
  { id: 'study', name: 'Çalışma Odası' },
  { id: 'living', name: 'Salon' },
  { id: 'hall', name: 'Giriş Holü' }
];

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
  devMode = false,
  footballThemeActive = false,
  setFootballThemeActive,
  kitchenPatternActive = false,
  setKitchenPatternActive,
  wallCustomizations = {},
  setWallCustomizations,
  mobileControlsEnabled = false,
  setMobileControlsEnabled = () => {},
  onExportBackup,
  onImportBackup,
  onClearRoomData,
  lang = 'tr',
  setLang,
  isBookModalOpen = false,
  bookModalMode = 'add',
  bookModalData = null,
  onCloseBookModal,
  onOpenBookModal,
  onSaveBook
}) {
  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.tr;
  const [pages, setPages] = useState([{ text: '', image: null, layout: 'image-top-text-bottom' }]);

  // Gelişmiş Ayarlar Paneli Tab ve Seçim State'leri
  const [activeSettingsTab, setActiveSettingsTab] = useState('appearance');
  const [colorSelectedRoom, setColorSelectedRoom] = useState('kitchen');
  const [colorSelectedTarget, setColorSelectedTarget] = useState('floor');
  const [colorSelectedColor, setColorSelectedColor] = useState('#eae3d2');
  const [cleanupSelectedRoom, setCleanupSelectedRoom] = useState('kitchen');
  const [cleanupSelectedType, setCleanupSelectedType] = useState('objects');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Duvar Özelleştirme State'leri
  const [selectedRoom, setSelectedRoom] = useState('kitchen');
  const [selectedWall, setSelectedWall] = useState('kitchen_wall_0');
  const [activeWallTab, setActiveWallTab] = useState('preset');
  const [customImage, setCustomImage] = useState(null);
  const [imageResolution, setImageResolution] = useState({ w: 0, h: 0 });
  const [imageResolutionWarning, setImageResolutionWarning] = useState(false);
  const [wallZoom, setWallZoom] = useState(1.0);
  const [wallOffsetX, setWallOffsetX] = useState(0.0);
  const [wallOffsetY, setWallOffsetY] = useState(0.0);

  // Oda değişince o odanın ilk duvarını otomatik seç
  useEffect(() => {
    const walls = wallsByRoom[selectedRoom] || [];
    if (walls.length > 0) {
      setSelectedWall(walls[0].id);
    }
  }, [selectedRoom]);

  // Duvar değiştiğinde mevcut özelleştirmeleri yükle
  useEffect(() => {
    const custom = wallCustomizations[selectedWall];
    if (custom) {
      if (custom.type === 'custom') {
        setCustomImage(custom.url);
        setWallZoom(custom.zoom || 1.0);
        setWallOffsetX(custom.offsetX || 0.0);
        setWallOffsetY(custom.offsetY || 0.0);
        setActiveWallTab('upload');
      } else {
        setCustomImage(null);
        setActiveWallTab('preset');
      }
    } else {
      setCustomImage(null);
      setWallZoom(1.0);
      setWallOffsetX(0.0);
      setWallOffsetY(0.0);
    }
  }, [selectedWall, wallCustomizations]);

  // Görsel yükleme işlemi
  const handleWallCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Çözünürlük tespiti
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImageResolution({ w: img.width, h: img.height });
      // Çözünürlük 512x512'den küçükse uyarı ver
      if (img.width < 512 || img.height < 512) {
        setImageResolutionWarning(true);
      } else {
        setImageResolutionWarning(false);
      }
    };

    // Görseli sıkıştır ve base64 formatına çevir
    try {
      const compressed = await compressImage(file, 2048, 0.85);
      setCustomImage(compressed);
    } catch (err) {
      console.error("Görsel sıkıştırma hatası:", err);
      // Hata durumunda sıkıştırmadan oku
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCustomImage(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Duvar özelleştirmesini uygula
  const handleApplyWall = (presetUrl) => {
    const updated = { ...wallCustomizations };
    if (presetUrl) {
      updated[selectedWall] = {
        type: 'preset',
        url: presetUrl,
        zoom: 1.0,
        offsetX: 0.0,
        offsetY: 0.0
      };
    } else if (customImage) {
      updated[selectedWall] = {
        type: 'custom',
        url: customImage,
        zoom: wallZoom,
        offsetX: wallOffsetX,
        offsetY: wallOffsetY
      };
    }
    setWallCustomizations(updated);
  };

  // Duvar özelleştirmesini temizle
  const handleClearWall = () => {
    const updated = { ...wallCustomizations };
    delete updated[selectedWall];
    setWallCustomizations(updated);
    setCustomImage(null);
    setWallZoom(1.0);
    setWallOffsetX(0.0);
    setWallOffsetY(0.0);
  };

  const [bookSpineLabel, setBookSpineLabel] = useState('');
  const [bookSlotIndex, setBookSlotIndex] = useState(0);
  const [bookSelectedColor, setBookSelectedColor] = useState('#ef4444');

  const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#b45309', '#6b7280', '#1e3a8a'];

  useEffect(() => {
    if (isBookModalOpen && bookModalData) {
      setBookSpineLabel(bookModalData.spineLabel || '');
      setBookSlotIndex(bookModalData.slotIndex ?? 0);
      setBookSelectedColor(bookModalData.color || '#ef4444');
    }
  }, [isBookModalOpen, bookModalData]);

  const currentShelf = useMemo(() => {
    return placedItems.find(i => i.id === activeItemId);
  }, [placedItems, activeItemId]);

  const availableSlots = useMemo(() => {
    if (!currentShelf || (currentShelf.type !== 'libraryShelf' && currentShelf.type !== 'largeLibraryShelf')) return [];
    const maxSlots = currentShelf.type === 'largeLibraryShelf' ? 48 : 24;
    const occupied = (currentShelf.books || [])
      .filter(b => bookModalMode === 'add' || b.bookId !== bookModalData?.bookId)
      .map(b => b.slotIndex);
    return Array.from({ length: maxSlots }, (_, i) => i).filter(s => !occupied.includes(s));
  }, [currentShelf, bookModalMode, bookModalData, isBookModalOpen]);

  const handleSaveBookClick = () => {
    if (!bookSpineLabel.trim()) return;
    onSaveBook({
      bookId: bookModalData?.bookId,
      shelfId: activeItemId,
      slotIndex: bookSlotIndex,
      spineLabel: bookSpineLabel.trim(),
      color: bookSelectedColor
    });
  };
  const [pageIndex, setPageIndex] = useState(0);
  const [color, setColor] = useState('#fef08a');
  const fileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  const handleBackupFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const inputElement = e.target;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      if (onImportBackup) {
        await onImportBackup(content);
      }
      inputElement.value = '';
    };
    reader.onerror = () => {
      alert(lang === 'en' ? "An error occurred while reading the file!" : "Dosya okunurken bir hata oluştu!");
      inputElement.value = '';
    };
    reader.readAsText(file);
  };
  const [selectedTags, setSelectedTags] = useState([]);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTagsPickerOpen, setIsTagsPickerOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isRelationsOpen, setIsRelationsOpen] = useState(false);
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(() => {
    return localStorage.getItem('control_panel_visible') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('control_panel_visible', isControlPanelVisible);
  }, [isControlPanelVisible]);

  useEffect(() => {
    if (isControlPanelVisible) {
      const timer = setTimeout(() => {
        setIsControlPanelVisible(false);
      }, 7000); // 7 saniye sonra otomatik gizle
      return () => clearTimeout(timer);
    }
  }, [isControlPanelVisible]);

  const touchpadActive = useRef(false);
  const touchpadLastPos = useRef({ x: 0, y: 0 });

  const handleTouchpadDown = (e) => {
    touchpadActive.current = true;
    touchpadLastPos.current = { x: e.clientX, y: e.clientY };
    e.target.style.cursor = 'grabbing';
    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
    e.target.style.borderColor = 'var(--primary)';
  };

  const handleTouchpadMove = (e) => {
    if (!touchpadActive.current) return;
    const deltaX = e.clientX - touchpadLastPos.current.x;
    const deltaY = e.clientY - touchpadLastPos.current.y;
    touchpadLastPos.current = { x: e.clientX, y: e.clientY };

    window.dispatchEvent(new CustomEvent('saray-camera-rotate', {
      detail: { x: deltaX * 1.5, y: deltaY * 1.5 }
    }));
  };

  const handleTouchpadUp = (e) => {
    if (touchpadActive.current) {
      touchpadActive.current = false;
      e.target.style.cursor = 'grab';
      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
      e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    }
  };

  const mobileBtnStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    transition: 'background 0.15s, transform 0.1s'
  };

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

      {/* Sağ Altta Dikey Yüzen Kontrol Paneli */}
      <div 
        className="action-card glass-panel interactive-ui" 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          right: isControlPanelVisible ? '24px' : '-240px',
          bottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '8px',
          transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          opacity: isControlPanelVisible ? 1 : 0,
          pointerEvents: isControlPanelVisible ? 'auto' : 'none',
          zIndex: 108,
          width: '180px',
          padding: '16px'
        }}
      >
        {/* Gizleme Ok Tuşu */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsControlPanelVisible(false); }}
          style={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--panel-bg-solid)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-muted)',
            borderRadius: '10px 0 0 10px',
            width: '20px',
            height: '48px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--card-shadow)',
            fontSize: '0.8rem',
            padding: 0
          }}
          title={t.hide_panel}
        >
          ➡️
        </button>

        <button 
          data-testid="dashboard-button"
          className={`btn-secondary ${isDashboardOpen ? 'active' : ''}`}
          onClick={() => { setIsDashboardOpen(!isDashboardOpen); setIsSettingsOpen(false); setIsItemDrawerOpen(false); }}
          title={lang === 'en' ? "Open/close control panel (H)" : "Not kontrol panelini aç/kapat (H)"}
          style={{ justifyContent: 'flex-start', width: '100%' }}
        >
          <Compass size={16} />
          <span>{t.control_panel}</span>
        </button>

        <button 
          data-testid="add-note-button"
          className={`btn-secondary ${isAddMode ? 'active' : ''}`}
          onClick={() => { setIsAddMode(!isAddMode); setIsSettingsOpen(false); setIsItemDrawerOpen(false); }}
          disabled={isDashboardOpen}
          title={isDashboardOpen ? (lang === 'en' ? "Cannot add note when control panel is open" : "Kontrol paneli açıkken not eklenemez") : (lang === 'en' ? "Click and drag (draw) on a wall to add a note" : "Duvara tıklayıp sürükleyerek (çizerek) not ekleyin")}
          style={{ justifyContent: 'flex-start', width: '100%' }}
        >
          <Edit3 size={16} />
          <span>{isAddMode ? t.draw_and_add : t.add_note}</span>
        </button>

        <button 
          className={`btn-secondary ${cameraMode !== 'third-person' ? 'active' : ''}`}
          onClick={(e) => { 
            setCameraMode((prev) => {
              if (prev === 'third-person') return 'birds-eye';
              if (prev === 'birds-eye') return freeFlightEnabled ? 'free' : 'third-person';
              return 'third-person';
            });
            e.currentTarget.blur(); 
          }}
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            ...(cameraMode === 'birds-eye' 
              ? { background: 'rgba(217, 119, 6, 0.15)', color: 'var(--theme-warning)', border: '1px solid var(--theme-warning)' } 
              : cameraMode === 'free' 
              ? { background: 'var(--primary-glow)', color: 'var(--theme-cyan)', border: '1px solid var(--theme-cyan)' }
              : {})
          }}
        >
          <Eye size={16} />
          <span>{cameraMode === 'third-person' ? t.walk : cameraMode === 'birds-eye' ? t.birds_eye : t.free}</span>
        </button>

        <button 
          data-testid="add-item-button"
          className={`btn-secondary ${isItemDrawerOpen ? 'active' : ''}`}
          onClick={(e) => { setIsItemDrawerOpen(!isItemDrawerOpen); setIsSettingsOpen(false); setIsDashboardOpen(false); e.currentTarget.blur(); }}
          title={lang === 'en' ? "Open/close item library (I)" : "Eşya kütüphanesini aç/kapat (I)"}
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            ...(isItemDrawerOpen ? { background: 'var(--theme-success-bg)', color: 'var(--theme-success)', border: '1px solid var(--theme-success)' } : {})
          }}
        >
          <Plus size={16} />
          <span>{t.add_item}</span>
        </button>

        <button 
          data-testid="settings-button"
          className={`btn-secondary ${isSettingsOpen ? 'active' : ''}`}
          onClick={(e) => { setIsSettingsOpen(!isSettingsOpen); setIsDashboardOpen(false); setIsItemDrawerOpen(false); e.currentTarget.blur(); }}
          title={lang === 'en' ? "Customize house settings and room colors (O)" : "Ev ayarlarını ve oda renklerini özelleştirin (O)"}
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            ...(isSettingsOpen ? { background: 'var(--primary-glow)', color: 'var(--theme-accent-muted)', border: '1px solid var(--primary)' } : {})
          }}
        >
          <Settings size={16} />
          <span>{t.settings}</span>
        </button>
      </div>

      {/* Panel Gizlendiğinde Çıkacak Küçük Açma Butonu */}
      {!isControlPanelVisible && (
        <button
          className="interactive-ui glass-panel"
          onClick={(e) => { e.stopPropagation(); setIsControlPanelVisible(true); }}
          style={{
            position: 'fixed',
            right: '12px',
            bottom: '24px',
            background: 'var(--panel-bg-solid)',
            border: '1px solid var(--panel-border)',
            color: 'var(--primary)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--card-shadow)',
            zIndex: 109,
            transition: 'transform 0.2s',
            fontSize: '1rem',
            padding: 0
          }}
          title={t.show_panel}
        >
          ⬅️
        </button>
      )}

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
        onWheel={(e) => e.stopPropagation()}
        style={{ zIndex: 112 }}
      >
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} className="settings-icon-glow" style={{ color: '#6366f1' }} />
            <h2 className="settings-title">{t.settings_title}</h2>
          </div>
          <button className="settings-close" onClick={() => setIsSettingsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-container">
          {/* Sol Sekme Menüsü */}
          <div className="settings-sidebar">
            <button 
              data-testid="tab-appearance"
              className={`settings-tab-btn ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('appearance')}
            >
              🖼️ {t.tab_appearance}
            </button>
            <button 
              data-testid="tab-room-colors"
              className={`settings-tab-btn ${activeSettingsTab === 'roomColors' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('roomColors')}
            >
              🎨 {t.tab_room_colors}
            </button>
            <button 
              data-testid="tab-wall-covering"
              className={`settings-tab-btn ${activeSettingsTab === 'wallCovering' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('wallCovering')}
            >
              🧱 {t.tab_wall_covering}
            </button>
            <button 
              className={`settings-tab-btn ${activeSettingsTab === 'cleanup' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('cleanup')}
            >
              🗑️ {t.tab_cleanup}
            </button>
            <button 
              data-testid="tab-backup"
              className={`settings-tab-btn ${activeSettingsTab === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('backup')}
            >
              💾 {t.tab_backup}
            </button>
            <button 
              data-testid="tab-language"
              className={`settings-tab-btn ${activeSettingsTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('language')}
            >
              🌐 {t.tab_language}
            </button>
          </div>

          {/* Sağ Sekme İçeriği */}
          <div className="settings-content">
            
            {/* 1. SEKMELİ GÖRÜNÜM (APPEARANCE) */}
            {activeSettingsTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Oda İsimleri */}
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🏠 {lang === 'en' ? 'Rename Rooms' : 'Odaları Yeniden Adlandır'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {Object.entries({
                      hall: t.room_hall,
                      bedroom: t.room_bedroom,
                      kitchen: t.room_kitchen,
                      study: t.room_study,
                      living: t.room_living
                    }).map(([id, defaultLabel]) => (
                      <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>{defaultLabel}</span>
                        <input
                          type="text"
                          className="room-name-input"
                          value={roomNames[id] || ''}
                          onChange={(e) => onUpdateRoomName(id, e.target.value)}
                          maxLength={20}
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* UI Tema Seçimi */}
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🎨 {t.ui_theme}</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      data-testid="ui-theme-dark-button"
                      type="button"
                      onClick={() => setUiTheme('dark')}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        border: uiTheme === 'dark' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                        background: uiTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'var(--button-bg-secondary)',
                        color: uiTheme === 'dark' ? '#a5b4fc' : 'var(--text-muted)'
                      }}
                    >
                      🌙 {t.dark_theme}
                    </button>
                    <button
                      data-testid="ui-theme-light-button"
                      type="button"
                      onClick={() => setUiTheme('light')}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        border: uiTheme === 'light' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                        background: uiTheme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'var(--button-bg-secondary)',
                        color: uiTheme === 'light' ? '#6366f1' : 'var(--text-muted)'
                      }}
                    >
                      ☀️ {t.light_theme}
                    </button>
                  </div>
                </div>

                {/* Duvar Temaları */}
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>⚽ {t.room_wall_themes}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>⚽ {t.football_theme}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.football_theme_desc}</span>
                      </div>
                      <div 
                        onClick={() => setFootballThemeActive && setFootballThemeActive(!footballThemeActive)}
                        style={{
                          width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                          background: footballThemeActive ? '#10b981' : 'var(--button-bg-secondary)', cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: '3px', left: footballThemeActive ? '19px' : '3px', transition: 'left 0.2s'
                        }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>📐 {t.kitchen_pattern}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.kitchen_pattern_desc}</span>
                      </div>
                      <div 
                        onClick={() => setKitchenPatternActive && setKitchenPatternActive(!kitchenPatternActive)}
                        style={{
                          width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                          background: kitchenPatternActive ? '#10b981' : 'var(--button-bg-secondary)', cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: '3px', left: kitchenPatternActive ? '19px' : '3px', transition: 'left 0.2s'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kontroller (Controls) */}
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🕹️ {t.controls_title}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {devMode && (
                      <button
                        onClick={() => setFreeFlightEnabled(!freeFlightEnabled)}
                        style={{
                          padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                          background: freeFlightEnabled ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          color: freeFlightEnabled ? '#a5b4fc' : 'var(--text-muted)'
                        }}
                      >
                        ✈️ {t.free_flight}
                      </button>
                    )}
                    <button
                      onClick={() => setMobileControlsEnabled(!mobileControlsEnabled)}
                      style={{
                        padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                        background: mobileControlsEnabled ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: mobileControlsEnabled ? '#a5b4fc' : 'var(--text-muted)'
                      }}
                    >
                      📱 {t.mobile_control}
                    </button>
                    <button
                      onClick={() => setAllowQuickTravel(!allowQuickTravel)}
                      style={{
                        padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                        background: allowQuickTravel ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: allowQuickTravel ? '#a5b4fc' : 'var(--text-muted)',
                        gridColumn: devMode ? 'span 1' : 'span 2'
                      }}
                    >
                      🚨 {t.quick_travel}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ODA RENKLERİ (ROOM COLORS - KOMPAKT AKIŞ) */}
            {activeSettingsTab === 'roomColors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🎨 {t.floor_and_wall}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Oda Seçimi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.select_room}</label>
                      <select 
                        data-testid="room-color-select"
                        value={colorSelectedRoom} 
                        onChange={(e) => setColorSelectedRoom(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                      >
                        {roomsList.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zemin / Duvar Seçimi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.select_target}</label>
                      <div style={{ display: 'flex', gap: '4px', background: 'var(--panel-bg-sub)', padding: '3px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <button
                          data-testid="color-target-floor"
                          type="button"
                          onClick={() => setColorSelectedTarget('floor')}
                          style={{
                            flex: 1, padding: '6px 0', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                            background: colorSelectedTarget === 'floor' ? 'var(--button-bg-secondary)' : 'transparent',
                            color: colorSelectedTarget === 'floor' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer'
                          }}
                        >
                          Floor
                        </button>
                        <button
                          type="button"
                          onClick={() => setColorSelectedTarget('wall')}
                          style={{
                            flex: 1, padding: '6px 0', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                            background: colorSelectedTarget === 'wall' ? 'var(--button-bg-secondary)' : 'transparent',
                            color: colorSelectedTarget === 'wall' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer'
                          }}
                        >
                          Wall
                        </button>
                      </div>
                    </div>

                    {/* Renk Seçimi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.select_color}</label>
                      
                      {/* Renk Paleti */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', margin: '4px 0' }}>
                        {(colorSelectedTarget === 'floor' 
                          ? ['#eae3d2', '#3e2723', '#0b0d19', '#eae6df', '#eedec3', '#bbf7d0', '#bfdbfe', '#fbcfe8']
                          : ['#f8fafc', '#ebd9c0', '#1e293b', '#fafafa', '#cbd5e1', '#0f172a', '#022c22', '#1e1b4b']
                        ).map((c) => (
                          <div
                            data-testid="color-dot-preset"
                            key={c}
                            className={`color-dot ${colorSelectedColor === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c, width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', border: colorSelectedColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', transition: 'all 0.1s' }}
                            onClick={() => setColorSelectedColor(c)}
                          />
                        ))}
                      </div>

                      {/* Özel Renk Seçici */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <input 
                          type="color" 
                          value={colorSelectedColor} 
                          onChange={(e) => setColorSelectedColor(e.target.value)}
                          style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lang === 'en' ? 'Or choose custom hex:' : 'Veya özel renk kodu:'} <strong>{colorSelectedColor}</strong></span>
                      </div>
                    </div>

                    {/* Uygulama Butonu */}
                    <button
                      data-testid="apply-room-color-button"
                      type="button"
                      onClick={() => {
                        if (colorSelectedTarget === 'floor') {
                          onUpdateRoomFloorColor(colorSelectedRoom, colorSelectedColor);
                        } else {
                          onUpdateRoomWallColor(colorSelectedRoom, colorSelectedColor);
                        }
                      }}
                      className="btn-primary"
                      style={{ padding: '10px', fontSize: '12px', marginTop: '6px' }}
                    >
                      💾 {t.apply_color}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DUVAR KAPLAMA SİSTEMİ (WALL COVERING) */}
            {activeSettingsTab === 'wallCovering' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🧱 {t.wall_customization}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Oda ve Duvar Seçimi */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.select_room}</label>
                        <select 
                          value={selectedRoom} 
                          onChange={(e) => setSelectedRoom(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                        >
                          {roomsList.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.select_wall}</label>
                        <select 
                          value={selectedWall} 
                          onChange={(e) => setSelectedWall(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                        >
                          {(wallsByRoom[selectedRoom] || []).map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sekme Seçicileri (Tab Buttons) */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--panel-bg-sub)', padding: '3px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                      <button
                        onClick={() => setActiveWallTab('preset')}
                        style={{
                          flex: 1, padding: '6px 0', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: activeWallTab === 'preset' ? 'var(--button-bg-secondary)' : 'transparent',
                          color: activeWallTab === 'preset' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer'
                        }}
                      >
                        {t.preset_templates}
                      </button>
                      <button
                        onClick={() => setActiveWallTab('upload')}
                        style={{
                          flex: 1, padding: '6px 0', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: activeWallTab === 'upload' ? 'var(--button-bg-secondary)' : 'transparent',
                          color: activeWallTab === 'upload' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer'
                        }}
                      >
                        {t.upload_image}
                      </button>
                    </div>

                    {/* Ayrıntılar */}
                    {activeWallTab === 'preset' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                        {PRESET_WALLS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => handleApplyWall(preset.url)}
                            title={preset.name}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                              padding: '10px 4px', border: '1px solid var(--panel-border)', borderRadius: '10px',
                              background: 'var(--input-bg)', cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                            }}
                          >
                            <span style={{ fontSize: '20px' }}>{preset.thumbnail}</span>
                            <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-main)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Dosya Seçme Girişi */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            id="wall-image-uploader" 
                            onChange={handleWallCustomImageUpload}
                            style={{ display: 'none' }} 
                          />
                          <label 
                            htmlFor="wall-image-uploader"
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              padding: '10px', border: '1px dashed var(--panel-border)', borderRadius: '8px',
                              background: 'var(--input-bg)', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                              color: 'var(--text-muted)', transition: 'all 0.2s'
                            }}
                          >
                            📁 {t.upload_image}
                          </label>
                        </div>

                        {/* Çözünürlük Uyarısı */}
                        {customImage && (
                          <div style={{
                            padding: '8px 10px', borderRadius: '8px', fontSize: '11px',
                            background: imageResolutionWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid ' + (imageResolutionWarning ? '#f59e0b' : '#10b981'),
                            color: imageResolutionWarning ? '#f59e0b' : '#10b981'
                          }}>
                            {imageResolutionWarning 
                              ? t.resolution_warning.replace('WxH', `${imageResolution.w}x${imageResolution.h}`)
                              : t.resolution_ok.replace('WxH', `${imageResolution.w}x${imageResolution.h}`)
                            }
                          </div>
                        )}

                        {/* Kırpma / Konumlandırma Önizleme Kutusu */}
                        {customImage && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.preview}</div>
                            
                            {/* Önizleme Maskesi */}
                            <div style={{
                              width: '100%', height: '140px', borderRadius: '10px', border: '1px solid var(--panel-border)',
                              background: '#0a0a0c', overflow: 'hidden', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', position: 'relative'
                            }}>
                              <div style={{
                                width: '100%', height: '100%',
                                backgroundImage: `url(${customImage})`,
                                backgroundSize: `${wallZoom * 100}%`,
                                backgroundPosition: `${50 + (wallOffsetX * 50)}% ${50 + (wallOffsetY * 50)}%`,
                                backgroundRepeat: 'no-repeat',
                                transition: 'background-size 0.1s, background-position 0.1s'
                              }} />
                            </div>

                            {/* Kontroller */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {/* Yatay Kaydırma */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                                  <span>{t.horizontal_offset}</span>
                                  <span>{wallOffsetX.toFixed(2)}</span>
                                </div>
                                <input 
                                  type="range" min="-1" max="1" step="0.01" value={wallOffsetX}
                                  onChange={(e) => setWallOffsetX(parseFloat(e.target.value))}
                                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--theme-accent-muted)' }}
                                />
                              </div>

                              {/* Dikey Kaydırma */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                                  <span>{t.vertical_offset}</span>
                                  <span>{wallOffsetY.toFixed(2)}</span>
                                </div>
                                <input 
                                  type="range" min="-1" max="1" step="0.01" value={wallOffsetY}
                                  onChange={(e) => setWallOffsetY(parseFloat(e.target.value))}
                                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--theme-accent-muted)' }}
                                />
                              </div>

                              {/* Yakınlaştırma */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                                  <span>{t.zoom}</span>
                                  <span>{wallZoom.toFixed(1)}x</span>
                                </div>
                                <input 
                                  type="range" min="0.5" max="3" step="0.1" value={wallZoom}
                                  onChange={(e) => setWallZoom(parseFloat(e.target.value))}
                                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--theme-accent-muted)' }}
                                />
                              </div>
                            </div>

                            {/* Uygulama Butonu */}
                            <button
                              onClick={() => handleApplyWall(null)}
                              style={{
                                width: '100%', padding: '10px', background: '#10b981', color: '#fff',
                                border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                              }}
                            >
                              💾 {t.apply_to_wall}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Temizleme Butonu */}
                    {wallCustomizations[selectedWall] && (
                      <button
                        onClick={handleClearWall}
                        style={{
                          width: '100%', padding: '8px', background: 'transparent', color: '#ef4444',
                          border: '1px solid #ef4444', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                          cursor: 'pointer', transition: 'all 0.2s', outline: 'none', marginTop: '4px'
                        }}
                      >
                        🗑️ {t.clear_wall}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. NESNE & NOT TEMİZLEME (CLEANUP) */}
            {activeSettingsTab === 'cleanup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🗑️ {t.tab_cleanup}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px', marginTop: '-6px' }}>
                    {t.cleanup_desc}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Oda Seçimi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.select_room}</label>
                      <select 
                        value={cleanupSelectedRoom} 
                        onChange={(e) => setCleanupSelectedRoom(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                      >
                        {roomsList.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Silinecek Tür Seçimi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>{t.what_to_remove}</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'var(--panel-bg-sub)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-main)', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="cleanupType" 
                            checked={cleanupSelectedType === 'objects'} 
                            onChange={() => setCleanupSelectedType('objects')} 
                          />
                          <span>🛋️ {t.remove_objects}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-main)', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="cleanupType" 
                            checked={cleanupSelectedType === 'notes'} 
                            onChange={() => setCleanupSelectedType('notes')} 
                          />
                          <span>📝 {t.remove_notes}</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--theme-danger)', cursor: 'pointer', fontWeight: '600' }}>
                          <input 
                            type="radio" 
                            name="cleanupType" 
                            checked={cleanupSelectedType === 'all'} 
                            onChange={() => setCleanupSelectedType('all')} 
                          />
                          <span>💥 {t.remove_all}</span>
                        </label>
                      </div>
                    </div>

                    {/* Onay Diyaloğu */}
                    {showDeleteConfirm && (
                      <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '11px', marginTop: '6px' }}>
                        ⚠️ {t.remove_all_confirm}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              onClearRoomData && onClearRoomData(cleanupSelectedRoom, cleanupSelectedType);
                              setShowDeleteConfirm(false);
                            }}
                            style={{ padding: '4px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            {lang === 'en' ? 'Yes, Delete' : 'Evet, Sil'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Temizle Butonu */}
                    {!showDeleteConfirm && (
                      <button
                        type="button"
                        onClick={() => {
                          if (cleanupSelectedType === 'all') {
                            setShowDeleteConfirm(true);
                          } else {
                            onClearRoomData && onClearRoomData(cleanupSelectedRoom, cleanupSelectedType);
                          }
                        }}
                        style={{
                          padding: '10px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          background: cleanupSelectedType === 'all' ? '#ef4444' : 'var(--theme-accent-muted)',
                          color: '#fff', transition: 'all 0.2s', marginTop: '6px'
                        }}
                      >
                        🗑️ {t.btn_remove}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. YEDEKLEME (BACKUP) */}
            {activeSettingsTab === 'backup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>💾 {t.saray_backup}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px', marginTop: '-6px' }}>
                    {t.saray_backup_desc}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      data-testid="export-backup-button"
                      type="button"
                      onClick={onExportBackup}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    >
                      📥 {t.get_backup}
                    </button>
                    <button
                      type="button"
                      onClick={() => backupFileInputRef.current && backupFileInputRef.current.click()}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: 'var(--button-bg-secondary)', border: '1px solid var(--panel-border)', color: 'var(--text-main)' }}
                    >
                      📤 {t.load_backup}
                    </button>
                    <input
                      type="file"
                      ref={backupFileInputRef}
                      onChange={handleBackupFileChange}
                      accept=".saray"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. DİL SEÇİMİ (LANGUAGE) */}
            {activeSettingsTab === 'language' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--theme-accent-muted)', fontWeight: '600', margin: '0 0 12px 0' }}>🌐 {t.language}</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      data-testid="lang-tr-button"
                      type="button"
                      onClick={() => setLang && setLang('tr')}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        border: lang === 'tr' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                        background: lang === 'tr' ? 'rgba(99, 102, 241, 0.2)' : 'var(--button-bg-secondary)',
                        color: lang === 'tr' ? '#a5b4fc' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      🇹🇷 Türkçe
                    </button>
                    <button
                      data-testid="lang-en-button"
                      type="button"
                      onClick={() => setLang && setLang('en')}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        border: lang === 'en' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                        background: lang === 'en' ? 'rgba(99, 102, 241, 0.2)' : 'var(--button-bg-secondary)',
                        color: lang === 'en' ? '#a5b4fc' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Alt Footer (Buttons) */}
        <div className="settings-footer" style={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '15px 20px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            className="btn-danger" 
            style={{ flex: 1.2, padding: '10px', fontSize: '12px' }}
            onClick={onResetColors}
            title={lang === 'en' ? "Reset all room floor and wall colors to default theme settings." : "Tüm odaların zemin ve duvar renklerini varsayılan konsept ayarlarına döndürür."}
          >
            {t.reset_customizations}
          </button>
          
          <button 
            className="btn-secondary" 
            style={{ 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
          >
            {t.return_to_home}
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
        onWheel={(e) => e.stopPropagation()}
        style={{ zIndex: 112 }}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} className="drawer-icon-glow" style={{ color: '#10b981' }} />
            <h2 className="drawer-title">{t.item_library}</h2>
          </div>
          <button className="drawer-close" onClick={(e) => { setIsItemDrawerOpen(false); e.currentTarget.blur(); }}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {[
            {
              title: t.category_desks,
              items: [
                { id: 'desk', label: t.item_desk, icon: '💻' },
                { id: 'large_desk', label: t.item_large_desk, icon: '🖥️' },
                { id: 'meeting_table', label: t.item_meeting_table, icon: '🤝' },
                { id: 'l_desk', label: t.item_l_desk, icon: '📐' },
                { id: 'round_table', label: t.item_round_table, icon: '⭕' }
              ]
            },
            {
              title: t.category_chairs,
              items: [
                { id: 'chair', label: t.item_chair, icon: '🪑' },
                { id: 'office_chair', label: t.item_office_chair, icon: '💺' },
                { id: 'guest_chair', label: t.item_guest_chair, icon: '🪑' },
                { id: 'stool', label: t.item_stool, icon: '🪵' }
              ]
            },
            {
              title: t.category_shelves,
              items: [
                { id: 'shelf', label: t.item_shelf, icon: '📚' },
                { id: 'large_bookshelf', label: t.item_large_bookshelf, icon: '📖' },
                { id: 'libraryShelf', label: t.item_libraryShelf, icon: '🏛️' },
                { id: 'largeLibraryShelf', label: t.item_largeLibraryShelf, icon: '📚' },
                { id: 'low_bookshelf', label: t.item_low_bookshelf, icon: '🗄️' },
                { id: 'file_cabinet', label: t.item_file_cabinet, icon: '🗃️' },
                { id: 'drawer_cabinet', label: t.item_drawer_cabinet, icon: '🚪' },
                { id: 'large_rack', label: t.item_large_rack, icon: '🏭' },
                { id: 'wallshelf', label: t.item_wallshelf, icon: '🪵' },
                { id: 'small_wallshelf', label: t.item_small_wallshelf, icon: '🏷️' }
              ]
            },
            {
              title: t.category_boards,
              items: [
                { id: 'board', label: t.item_board, icon: '📋' },
                { id: 'large_board', label: t.item_large_board, icon: '📌' },
                { id: 'whiteboard', label: t.item_whiteboard, icon: '📝' }
              ]
            },
            {
              title: t.category_lighting,
              items: [
                { id: 'lamp', label: t.item_lamp, icon: '💡' },
                { id: 'floor_lamp', label: t.item_floor_lamp, icon: '🏮' },
                { id: 'desk_lamp', label: t.item_desk_lamp, icon: '🔦' }
              ]
            },
            {
              title: t.category_decor,
              items: [
                { id: 'rug', label: t.item_rug, icon: '🧺' },
                { id: 'pc', label: t.item_pc, icon: '💻' },
                { id: 'box', label: t.item_box, icon: '📦' },
                { id: 'archive_box', label: t.item_archive_box, icon: '🗳️' },
                { id: 'plant', label: t.item_plant, icon: '🪴' },
                { id: 'large_plant', label: t.item_large_plant, icon: '🌴' }
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
                    data-testid={"item-card-" + type.id}
                    key={type.id}
                    className="item-type-card"
                    onClick={(e) => {
                      onAddPlacedItem(type.id);
                      setIsItemDrawerOpen(false);
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
          desk: t.item_desk,
          chair: t.item_chair,
          shelf: t.item_shelf,
          wallshelf: t.item_wallshelf,
          plant: t.item_plant,
          lamp: t.item_lamp,
          rug: t.item_rug,
          pc: t.item_pc,
          box: t.item_box,
          board: t.item_board,
          large_desk: t.item_large_desk,
          meeting_table: t.item_meeting_table,
          l_desk: t.item_l_desk,
          round_table: t.item_round_table,
          large_bookshelf: t.item_large_bookshelf,
          libraryShelf: t.item_libraryShelf,
          largeLibraryShelf: t.item_largeLibraryShelf,
          low_bookshelf: t.item_low_bookshelf,
          file_cabinet: t.item_file_cabinet,
          drawer_cabinet: t.item_drawer_cabinet,
          large_board: t.item_large_board,
          whiteboard: t.item_whiteboard,
          office_chair: t.item_office_chair,
          guest_chair: t.item_guest_chair,
          stool: t.item_stool,
          side_table: lang === 'en' ? 'Side Table' : 'Yan Sehpa',
          large_rack: t.item_large_rack,
          small_wallshelf: t.item_small_wallshelf,
          floor_lamp: t.item_floor_lamp,
          desk_lamp: t.item_desk_lamp,
          large_plant: t.item_large_plant,
          archive_box: t.item_archive_box
        }[selectedItem.type] || t.item_item;

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
            onWheel={(e) => e.stopPropagation()}
            style={{ padding: isItemEditingActive ? '12px 20px' : '16px 24px', flexWrap: 'wrap', gap: '12px' }}
          >
            <div className="item-info">
              <span className="item-label-glow">{defaultLabel}</span>
              <span className="item-room-label">{lang === 'en' ? 'Room' : 'Oda'}: {roomNames[selectedItem.roomId] || selectedItem.roomId}</span>
            </div>

            {isItemEditingActive ? (
              // DÜZENLEME MODU AÇIKKEN
              <div className="editor-controls-group" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                {/* Hassas Konum Butonları */}
                <div className="editor-control-section" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="control-label">{t.item_positioning}</span>
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
                  <span className="control-label">{t.item_color}</span>
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
                  <span className="control-label">{t.item_size}</span>
                  <div className="btn-group">
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleScaleChange(-0.1); }} title="Küçült (-)">-</button>
                    <span className="value-display">{scaleVal.toFixed(1)}x</span>
                    <button className="btn-control" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleScaleChange(0.1); }} title="Büyüt (+)">+</button>
                  </div>
                </div>

                {/* Döndürme */}
                <div className="editor-control-section">
                  <span className="control-label">{t.item_rotate}</span>
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
                    <span>{t.delete}</span>
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
                    style={{ background: 'var(--theme-danger-bg)', color: 'var(--theme-danger)', border: '1px solid var(--theme-danger)' }}
                  >
                    {t.cancel}
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
                    style={{ background: 'var(--theme-success-bg)', color: 'var(--theme-success)', border: '1px solid var(--theme-success)' }}
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            ) : (
              // SADECE SEÇİLİ KESİM
              <div className="editor-controls-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>
                  💡 {t.item_edit_hint}
                </span>
 
                {/* Manuel Düzenleme Moduna Geçiş Butonu */}
                <button
                  className="btn-primary-item"
                  style={{
                    background: 'var(--theme-success-bg)',
                    color: 'var(--theme-success)',
                    border: '1px solid var(--theme-success)'
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    onStartEdit(activeItemId);
                  }}
                >
                  {t.item_edit_btn}
                </button>
 
                {/* 3D Bağlantı Başlat */}
                <button
                  className="btn-primary-item"
                  style={{
                    background: pendingConnectionSource?.id === selectedItem.id ? 'var(--theme-danger-bg)' : 'var(--button-bg-secondary)',
                    color: pendingConnectionSource?.id === selectedItem.id ? 'var(--theme-danger)' : 'var(--theme-accent-muted)',
                    border: pendingConnectionSource?.id === selectedItem.id ? '1px solid var(--theme-danger)' : '1px solid var(--theme-accent-muted)',
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
                  <span>{pendingConnectionSource?.id === selectedItem.id ? t.item_connect_cancel : t.item_connect_start}</span>
                </button>
 
                {/* Kitap Ekleme (Kütüphane Rafı ise) */}
                {(selectedItem.type === 'libraryShelf' || selectedItem.type === 'largeLibraryShelf') && (
                  <button
                    className="btn-primary-item"
                    style={{
                      background: 'var(--button-bg-secondary)',
                      color: 'var(--theme-amber)',
                      border: '1px solid var(--theme-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.currentTarget.blur();
                      onOpenBookModal('add', { shelfId: selectedItem.id });
                    }}
                  >
                    <span>{t.item_add_book}</span>
                  </button>
                )}

                {/* Not Bağlama */}
                <button
                  data-testid="item-add-note-button"
                  className="btn-primary-item"
                  style={{
                    background: 'var(--button-bg-secondary)',
                    color: 'var(--theme-cyan)',
                    border: '1px solid var(--theme-cyan)',
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
                  <span>{selectedItem.linkedNote ? t.item_edit_note : t.item_add_note}</span>
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
                  {t.close}
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
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="editor-header">
          <h2 className="editor-title">{t.editor_read_write}</h2>
          <button className="editor-close" onClick={onCloseEditor}>
            <X size={20} />
          </button>
        </div>

        <div className="editor-body-content">

        {/* Eşya Notu Başlık Giriş Alanı */}
        {editorMode === 'item' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 4px 10px 4px' }}>
              <span className="control-label" style={{ fontSize: '0.75rem' }}>{t.note_title}</span>
              <input
                type="text"
                value={itemNoteTitle}
                onChange={(e) => setItemNoteTitle(e.target.value)}
                maxLength={40}
                placeholder={t.write_note_placeholder}
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-main)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  outline: 'none',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.05)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '0 4px 12px 4px' }}>
              <span className="control-label" style={{ fontSize: '0.75rem' }}>{t.icon_type}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'info', label: t.icon_info },
                  { id: 'question', label: t.icon_question },
                  { id: 'exclamation', label: t.icon_exclamation },
                  { id: 'dot', label: t.icon_dot }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    style={{
                      flex: 1,
                      background: iconType === opt.id ? 'var(--theme-success-bg)' : 'var(--button-bg-secondary)',
                      border: iconType === opt.id ? '1px solid var(--theme-cyan)' : '1px solid var(--panel-border)',
                      color: iconType === opt.id ? 'var(--theme-cyan)' : 'var(--text-muted)',
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
            placeholder={t.write_placeholder}
          />
          <div className={`char-counter ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''}`}>
            {currentTextLength.toLocaleString()} / {charLimit.toLocaleString()}
            {isAtLimit && <span className="limit-warning">{t.char_limit_reached}</span>}
            {isWarningLimit && !isAtLimit && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>{t.text_too_large}</span>}
          </div>
        </div>

        {/* Etiket Yönetim Satırı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--panel-bg-soft)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '2px 4px 2px 8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', userSelect: 'none' }}>#</span>
            <input
              type="text"
              placeholder={t.tag_placeholder}
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                padding: '4px 0',
                fontSize: '0.78rem',
                outline: 'none',
                width: '110px'
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {t.tag_add_btn}
            </button>
          </div>

          {/* Ekli Etiket Chipleri */}
          {selectedTags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'var(--theme-success-bg)',
                    border: '1px solid var(--theme-accent-muted)',
                    color: 'var(--theme-accent-muted)',
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
        </div>

        {/* Görsel Önizleme Alanı */}
        {currentPage.image && (
          <div style={{ padding: '0 4px', display: 'flex', flexShrink: 0 }}>
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
                  background: 'var(--theme-danger)',
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
                <span>{t.remove}</span>
              </button>
            </div>
          </div>
        )}

        {/* Bağlantılı Notlar Bölümü */}
        {editorLinks.length > 0 && (
          <div className="editor-links-section" style={{ margin: '4px', padding: '10px', background: 'var(--theme-success-bg)', borderRadius: '10px', border: '1px solid var(--panel-border)', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--theme-accent-muted)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              🔗 {t.connected_notes}
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {editorLinks.map((link, idx) => (
                <button
                  key={idx}
                  className="btn-primary-item"
                  style={{
                    background: 'var(--button-bg-secondary)',
                    border: '1px solid var(--theme-accent-muted)',
                    color: 'var(--theme-accent-muted)',
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

        {/* Araç Çubuğu (Sayfa Kontrolleri, Renk Seçici, Görsel Ekleme) */}
        <div className="pagination-controls" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Sol: Sayfa Navigasyonu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-nav"
              onClick={handlePrevPage}
              disabled={pageIndex === 0}
              style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}
              title={t.prev_page}
            >
              <ChevronLeft size={14} />
            </button>

            <span className="page-indicator" style={{ minWidth: '70px', textAlign: 'center', userSelect: 'none' }}>
              {t.page} {pageIndex + 1} / {pages.length}
            </span>

            <button 
              className="btn-nav"
              onClick={handleNextPage}
              disabled={pageIndex === pages.length - 1}
              style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}
              title={t.next_page}
            >
              <ChevronRight size={14} />
            </button>

            <button 
              className="btn-nav"
              style={{ background: 'var(--theme-success-bg)', color: 'var(--theme-accent-muted)', border: '1px solid var(--theme-accent-muted)', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={handleAddPage}
              title={t.add_page}
            >
              <Plus size={12} />
              <span>{t.add}</span>
            </button>
          </div>

          {/* Sağ: Renk Seçici & Görsel Yükleme Butonu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            
            {/* Görsel Yükleme Butonu (Sadece görsel yoksa gösterilir) */}
            {!currentPage.image && (
              <label 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--button-bg-secondary)',
                  border: '1px solid var(--panel-border)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--button-bg-secondary-hover)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--button-bg-secondary)'; }}
              >
                <ImagePlus size={14} style={{ opacity: 0.8 }} />
                <span>{t.upload_image}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}

            {window.location.search.includes('testMode') && !currentPage.image && (
              <button
                data-testid="test-upload-image-helper"
                type="button"
                onClick={() => {
                  setPages(prev => prev.map((p, idx) => idx === pageIndex ? { ...normalizePage(p), image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } : p));
                }}
                style={{ display: 'none' }}
              >
                Test Upload Image
              </button>
            )}

            {/* Renk Seçici */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <button 
                type="button"
                className="color-trigger-btn"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setIsColorPickerOpen(!isColorPickerOpen);
                }}
                title={t.select_color}
              />
              
              {isColorPickerOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2001 }}
                    onClick={() => setIsColorPickerOpen(false)}
                  />
                  <div 
                    className="editor-popover" 
                    onWheel={(e) => e.stopPropagation()}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gap: '8px', 
                      right: 0, 
                      left: 'auto',
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
                          border: color === c.value ? '2px solid var(--text-main)' : '1px solid var(--panel-border)',
                          boxShadow: color === c.value ? '0 0 8px var(--primary-glow)' : 'none',
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
                <span style={{ fontSize: '0.8rem', color: 'var(--theme-cyan)', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '0.03em' }}>
                  {t.three_d_relations}
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{isRelationsOpen ? t.hide : t.show}</span>
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
                      background: 'var(--button-bg-secondary)',
                      border: '1px solid var(--theme-accent-muted)',
                      color: 'var(--theme-accent-muted)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    {t.relations_selected_only}
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
                      background: 'var(--theme-success-bg)',
                      border: '1px solid var(--theme-success)',
                      color: 'var(--theme-success)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    {t.relations_show}
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
                      background: 'var(--theme-danger-bg)',
                      border: '1px solid var(--theme-danger)',
                      color: 'var(--theme-danger)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    {t.relations_hide}
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
                      if (n) return n.pages?.[0]?.text?.substring(0, 15) || t.wall_note_label;
                      const item = placedItems.find(x => x.id === id);
                      if (item) return item.name || t.item_item;
                      return t.unknown_object;
                    };

                    if (itemConns.length === 0) {
                      return (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', padding: '8px 0', fontFamily: 'sans-serif' }}>
                          {t.no_relations}
                        </span>
                      );
                    }

                    return itemConns.map(conn => {
                      const isSource = conn.fromId === activeId;
                      const targetId = isSource ? conn.toId : conn.fromId;
                      const targetName = getObjectName(targetId);
                      const concept = connectionConcepts.find(cc => cc.id === conn.conceptId) || { name: t.general, color: '#00f0ff' };

                      return (
                        <div
                          key={conn.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '5px 8px',
                            background: 'var(--panel-bg-soft)',
                            borderRadius: '6px',
                            border: '1px solid var(--panel-border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--theme-accent-muted)', fontWeight: 'bold', flexShrink: 0 }}>
                              {isSource ? '➡️' : '⬅️'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: 'sans-serif' }}>
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
                                background: conn.isVisible ? 'var(--theme-success-bg)' : 'var(--theme-danger-bg)',
                                border: conn.isVisible ? '1px solid var(--theme-success)' : '1px solid var(--theme-danger)',
                                color: conn.isVisible ? 'var(--theme-success)' : 'var(--theme-danger)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                fontFamily: 'sans-serif'
                              }}
                            >
                              {conn.isVisible ? t.relations_visible : t.relations_hidden}
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (onDeleteConnection) onDeleteConnection(conn.id); }}
                              style={{
                                background: 'var(--theme-danger-bg)',
                                border: '1px solid var(--theme-danger)',
                                color: 'var(--theme-danger)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                fontFamily: 'sans-serif'
                              }}
                            >
                              {t.delete}
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
          <button className="btn-danger" onClick={() => {
            const confirmMsg = editorMode === 'book'
              ? (lang === 'en' ? "Are you sure you want to delete this book and its note?" : "Bu kitabı ve notunu silmek istediğinize emin misiniz?")
              : (lang === 'en' ? "Are you sure you want to delete this note?" : "Bu notu silmek istediğinize emin misiniz?");
            if (window.confirm(confirmMsg)) {
              onDeleteNote(activeNote.id);
            }
          }}>
            <Trash2 size={16} />
            {editorMode === 'book' ? (lang === 'en' ? "Delete Book" : "Kitabı Sil") : t.delete_note}
          </button>
          
          <button data-testid="save-note-button" className="btn-primary" onClick={handleSave}>
            <Save size={16} />
            {t.save}
          </button>
        </div>
      </div>

      {/* Kitap Ekle/Düzenle Modalı */}
      {isBookModalOpen && (
        <div 
          className="editor-modal glass-panel interactive-ui open"
          style={{
            zIndex: 10000,
            maxWidth: '400px',
            height: 'auto',
            maxHeight: '85vh',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.5), 0 0 1px 1px rgba(255,255,255,0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="editor-header">
            <h2 className="editor-title">
              {bookModalMode === 'add' 
                ? (lang === 'en' ? 'Add New Book' : 'Yeni Kitap Ekle') 
                : (lang === 'en' ? 'Edit Book Spine' : 'Kitap Sırtını Düzenle')}
            </h2>
            <button className="editor-close" onClick={onCloseBookModal}>
              <X size={20} />
            </button>
          </div>

          <div className="editor-body-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Sırt Yazısı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {lang === 'en' ? 'Book Spine Label' : 'Kitap Sırt Yazısı'} (Max 15)
              </label>
              <input
                type="text"
                value={bookSpineLabel}
                onChange={(e) => setBookSpineLabel(e.target.value.slice(0, 15))}
                placeholder={lang === 'en' ? 'e.g. Fikir, AI, Project' : 'Örn: Fikir, AI, Proje'}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Bölme (Slot) Seçimi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {lang === 'en' ? 'Shelf / Slot Location' : 'Raf / Bölme Konumu'}
              </label>
              <select
                value={bookSlotIndex}
                onChange={(e) => setBookSlotIndex(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              >
                {availableSlots.map((slot) => {
                  const slotsPerRow = currentShelf?.type === 'largeLibraryShelf' ? 12 : 6;
                  const r = Math.floor(slot / slotsPerRow) + 1;
                  const c = (slot % slotsPerRow) + 1;
                  const slotLabel = lang === 'en' 
                    ? `Level ${r} - Slot ${c}` 
                    : `Raf ${r} - Bölme ${c}`;
                  return (
                    <option key={slot} value={slot} style={{ background: '#1e293b' }}>
                      {slotLabel}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Kitap Rengi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {lang === 'en' ? 'Book Color' : 'Kitap Rengi'}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {bookColors.map((c) => (
                  <div
                    key={c}
                    onClick={() => setBookSelectedColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: bookSelectedColor === c ? '2px solid #00f0ff' : '2px solid transparent',
                      boxShadow: bookSelectedColor === c ? '0 0 8px #00f0ff' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="editor-footer" style={{ padding: '12px 16px' }}>
            <button className="btn-primary" style={{ background: 'var(--button-bg-secondary)', color: 'var(--text-color)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={onCloseBookModal}>
              {lang === 'en' ? 'Cancel' : 'İptal'}
            </button>
            <button 
              className="btn-primary" 
              style={{ background: 'var(--theme-success-bg)', color: 'var(--theme-success)', border: '1px solid var(--theme-success)' }} 
              onClick={handleSaveBookClick}
              disabled={!bookSpineLabel.trim()}
            >
              {lang === 'en' ? 'Save' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

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
            onWheel={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '320px',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--panel-border)',
              background: 'var(--panel-bg-solid)',
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--card-shadow)',
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
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--theme-cyan)', fontWeight: 'bold', fontFamily: 'sans-serif' }}>{t.concept_choose}</h3>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={onCancelConnection}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
              {t.concept_choose_desc}
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
                    border: '1px solid var(--panel-border)',
                    background: 'var(--button-bg-secondary)',
                    color: 'var(--text-main)',
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
              {t.concept_cancel}
            </button>
          </div>
        </div>
      )}

      {/* Saydam Mobil Kontroller */}
      {mobileControlsEnabled && (
        <div className="interactive-ui" style={{
          position: 'absolute',
          bottom: '120px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          zIndex: 9999
        }}>
          {/* Sol Alt: D-Pad */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}>
            {/* İleri (W) */}
            <button
              onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }))}
              onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }))}
              onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }))}
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); }}
              onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' })); }}
              style={mobileBtnStyle}
            >
              ▲
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Sol (A) */}
              <button
                onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))}
                onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))}
                onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }))}
                onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' })); }}
                onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' })); }}
                style={mobileBtnStyle}
              >
                ◀
              </button>
              {/* Geri (S) */}
              <button
                onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }))}
                onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' }))}
                onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' }))}
                onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' })); }}
                onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' })); }}
                style={mobileBtnStyle}
              >
                ▼
              </button>
              {/* Sağ (D) */}
              <button
                onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))}
                onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }))}
                onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }))}
                onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); }}
                onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' })); }}
                style={mobileBtnStyle}
              >
                ▶
              </button>
            </div>

            {/* Dikey Uçuş (Space/Shift - Sadece Serbest Uçuşta) */}
            {cameraMode === 'free' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))}
                  onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }))}
                  onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }))}
                  onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' })); }}
                  onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' })); }}
                  style={{ ...mobileBtnStyle, width: '48px', fontSize: '9px' }}
                >
                  {t.mobile_fly_up}
                </button>
                <button
                  onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }))}
                  onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }))}
                  onPointerLeave={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }))}
                  onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' })); }}
                  onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' })); }}
                  style={{ ...mobileBtnStyle, width: '48px', fontSize: '9px' }}
                >
                  {t.mobile_fly_down}
                </button>
              </div>
            )}
          </div>

          {/* Sağ Alt: Bakış Touchpad */}
          <div 
            onPointerDown={handleTouchpadDown}
            onPointerMove={handleTouchpadMove}
            onPointerUp={handleTouchpadUp}
            onPointerLeave={handleTouchpadUp}
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
              cursor: 'grab'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, opacity: 0.8 }}>{t.mobile_look}</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.5, marginTop: '4px' }}>{t.mobile_look_desc}</span>
          </div>
        </div>
      )}
    </div>
  );
}
