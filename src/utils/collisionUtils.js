export const ITEM_BASE_SIZES = {
  desk: [1.7, 0.8, 0.9],
  chair: [0.55, 1.05, 0.55],
  shelf: [1.1, 1.9, 0.45],
  wallshelf: [1.3, 0.3, 0.35],
  plant: [0.45, 0.85, 0.45],
  lamp: [0.6, 1.9, 0.6],
  rug: [2.5, 0.02, 1.9],
  pc: [0.46, 0.3, 0.34],
  box: [0.56, 0.56, 0.56],
  board: [1.6, 1.8, 0.45],
  large_desk: [2.3, 0.82, 1.1],
  meeting_table: [3.3, 0.9, 1.5],
  l_desk: [1.9, 0.8, 1.7],
  round_table: [1.5, 0.8, 1.5],
  large_bookshelf: [1.9, 2.1, 0.45],
  libraryShelf: [3.92, 2.2, 0.38],
  largeLibraryShelf: [4.4, 2.2, 0.38],
  low_bookshelf: [1.7, 1.0, 0.5],
  file_cabinet: [0.7, 1.6, 0.7],
  drawer_cabinet: [0.9, 1.0, 0.6],
  large_board: [2.5, 1.4, 0.15],
  whiteboard: [1.5, 1.8, 0.6],
  office_chair: [0.6, 1.25, 0.6],
  guest_chair: [0.55, 1.1, 0.55],
  stool: [0.45, 0.55, 0.45],
  side_table: [0.6, 0.6, 0.6],
  large_rack: [1.7, 1.9, 0.55],
  small_wallshelf: [0.8, 0.4, 0.3],
  floor_lamp: [0.7, 1.9, 0.7],
  desk_lamp: [0.25, 0.48, 0.25],
  large_plant: [0.8, 1.2, 0.8],
  archive_box: [0.7, 0.55, 0.52],

  // Yatak Odası Seti
  bed: [1.1, 0.8, 2.1],
  double_bed: [1.7, 0.8, 2.1],
  nightstand: [0.55, 0.55, 0.5],
  wardrobe: [1.3, 2.0, 0.65],

  // Banyo / WC Seti
  sink: [0.65, 0.85, 0.55],
  toilet: [0.45, 0.75, 0.65],
  shower: [1.0, 2.0, 1.0],
  bathtub: [0.85, 0.65, 1.7],
  bathroom_cabinet: [0.65, 1.8, 0.45],
  mirror: [0.6, 0.8, 0.05],
  towel_rack: [0.6, 0.2, 0.15],
  laundry_basket: [0.5, 0.7, 0.5]
};

export function getItemBaseSize(item) {
  if (item.type === 'customVisualBox') {
    const geom = item.geometryType || 'box';
    if (geom === 'sphere') {
      const r = item.radius || 0.5;
      return [r * 2, r * 2, r * 2];
    }
    if (geom === 'cylinder' || geom === 'cone' || geom === 'pyramid' || geom === 'prism') {
      const r = item.radius || 0.5;
      const h = item.boxHeight || 1.0;
      return [r * 2, h, r * 2];
    }
    if (geom === 'capsule') {
      const r = item.radius || 0.5;
      const h = item.boxHeight || 1.0;
      const actualH = Math.max(0.1, h - 2 * r) + 2 * r;
      return [r * 2, actualH, r * 2];
    }
    if (geom === 'cube') {
      const w = item.boxWidth || 1.0;
      return [w, w, w];
    }
    return [item.boxWidth || 1.0, item.boxHeight || 1.0, item.boxDepth || 0.1];
  }
  return ITEM_BASE_SIZES[item.type] || [1.0, 1.0, 1.0];
}

export function getBoxCorners2D(pos, size, rotationY) {
  const [w, , d] = size;
  const hx = w / 2;
  const hz = d / 2;

  // Box'ın X-Z düzlemindeki yerel 4 köşesi
  const localCorners = [
    { x: -hx, z: -hz },
    { x: hx, z: -hz },
    { x: hx, z: hz },
    { x: -hx, z: hz }
  ];

  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);

  return localCorners.map(p => ({
    x: p.x * cos - p.z * sin + pos.x,
    z: p.x * sin + p.z * cos + pos.z
  }));
}

export function checkOBBIntersection2D(cornersA, cornersB) {
  // SAT (Separating Axis Theorem) için kenar normallerini hesaplar
  const getAxes = (corners) => {
    const axes = [];
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const edge = { x: p2.x - p1.x, z: p2.z - p1.z };
      const normal = { x: -edge.z, z: edge.x };
      const len = Math.sqrt(normal.x * normal.x + normal.z * normal.z);
      if (len > 0.0001) {
        axes.push({ x: normal.x / len, z: normal.z / len });
      }
    }
    return axes;
  };

  const axes = [...getAxes(cornersA), ...getAxes(cornersB)];

  for (const axis of axes) {
    // A'nın köşelerini izdüşür
    let minA = Infinity;
    let maxA = -Infinity;
    for (const p of cornersA) {
      const proj = p.x * axis.x + p.z * axis.z;
      if (proj < minA) minA = proj;
      if (proj > maxA) maxA = proj;
    }

    // B'nin köşelerini izdüşür
    let minB = Infinity;
    let maxB = -Infinity;
    for (const p of cornersB) {
      const proj = p.x * axis.x + p.z * axis.z;
      if (proj < minB) minB = proj;
      if (proj > maxB) maxB = proj;
    }

    // İzdüşümler çakışıyor mu? (Temas serbest, kesişim yasak)
    const epsilon = 0.001; // Tolerans
    if (maxA <= minB + epsilon || maxB <= minA + epsilon) {
      // Ayrım çizgisi (axis) bulundu, çakışma kesinlikle yok
      return false;
    }
  }

  // Hiçbir ayrım çizgisi bulunamadı, köşeler kesişiyor
  return true;
}

export function checkItemsCollide(itemA, itemB) {
  if (!itemA || !itemB || itemA.id === itemB.id) return false;

  // Halılar (rug) çakışma testinden muaftır (üzerine masa/sandalye konulabilsin)
  if (itemA.type === 'rug' || itemB.type === 'rug') return false;

  const baseSizeA = getItemBaseSize(itemA);
  const baseSizeB = getItemBaseSize(itemB);

  const scaleValA = itemA.scale?.[0] || 1.0;
  const scaleValB = itemB.scale?.[0] || 1.0;

  const sizeA = baseSizeA.map(val => val * scaleValA);
  const sizeB = baseSizeB.map(val => val * scaleValB);

  const posA = itemA.position || { x: 0, y: 0, z: 0 };
  const posB = itemB.position || { x: 0, y: 0, z: 0 };

  const rotA = itemA.rotation?.y ?? 0.0;
  const rotB = itemB.rotation?.y ?? 0.0;

  // 1. Dikey (Y) Çakışma Kontrolü
  const hA = sizeA[1];
  const hB = sizeB[1];
  const yOverlap = (posA.y < posB.y + hB && posA.y + hA > posB.y);
  if (!yOverlap) return false;

  // 2. Yatay (X-Z) OBB SAT Çakışma Kontrolü
  const cornersA = getBoxCorners2D(posA, sizeA, rotA);
  const cornersB = getBoxCorners2D(posB, sizeB, rotB);

  return checkOBBIntersection2D(cornersA, cornersB);
}
