import React, { useMemo, useState, useEffect } from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// Room dimensions (Full house grid)
const WIDTH = 50;

// --- Düşük Poligonlu Low-Poly Eşya Bileşenleri ---

function Desk({ position, color, metalColor }) {
  return (
    <group position={position}>
      {/* Üst tabla */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.6, 0.05, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* 4 Ayak */}
      <mesh castShadow position={[-0.7, 0.175, -0.3]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={metalColor || color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.7, 0.175, -0.3]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={metalColor || color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.7, 0.175, 0.3]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={metalColor || color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.7, 0.175, 0.3]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={metalColor || color} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

function Chair({ position, color, baseColor, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Oturak */}
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.45, 0.04, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Sırtlık */}
      <mesh castShadow position={[0, 0.47, -0.2]}>
        <boxGeometry args={[0.45, 0.45, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Ayak bağlantısı */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2]} />
        <meshStandardMaterial color={baseColor || '#1e293b'} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Alt çapraz ayaklar */}
      <mesh position={[0, 0.01, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.4, 0.02, 0.04]} />
        <meshStandardMaterial color={baseColor || '#1e293b'} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[0, Math.PI / 2, 0.2]}>
        <boxGeometry args={[0.4, 0.02, 0.04]} />
        <meshStandardMaterial color={baseColor || '#1e293b'} />
      </mesh>
    </group>
  );
}

function Shelf({ position, color, rotation = [0, 0, 0], args = [1.2, 1.8, 0.35] }) {
  const [w, h, d] = args;
  return (
    <group position={position} rotation={rotation}>
      {/* Çerçeve */}
      <mesh castShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Raflar */}
      <mesh position={[0, h * 0.3, 0.01]}>
        <boxGeometry args={[w - 0.08, 0.03, d - 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, h * 0.6, 0.01]}>
        <boxGeometry args={[w - 0.08, 0.03, d - 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function TableLamp({ position, color, bulbColor, lightColor }) {
  return (
    <group position={position}>
      {/* Taban */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Gövde */}
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Başlık */}
      <mesh position={[0.04, 0.31, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.06, 0.09, 0.1, 16]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Ampul */}
      <mesh position={[0.04, 0.28, 0]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={bulbColor || '#fef08a'} />
      </mesh>
      <pointLight position={[0.04, 0.25, 0]} intensity={0.4} color={lightColor || '#fef08a'} distance={3} />
    </group>
  );
}

function Sofa({ position, color, cushionColor, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Oturak Altı */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.8, 0.24, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Sırtlık */}
      <mesh castShadow position={[0, 0.44, -0.34]}>
        <boxGeometry args={[1.8, 0.5, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Sol Kolçak */}
      <mesh castShadow position={[-0.9, 0.28, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Sağ Kolçak */}
      <mesh castShadow position={[0.9, 0.28, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Minderler */}
      <mesh castShadow position={[-0.4, 0.24, 0.05]}>
        <boxGeometry args={[0.7, 0.08, 0.65]} />
        <meshStandardMaterial color={cushionColor || color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.4, 0.24, 0.05]}>
        <boxGeometry args={[0.7, 0.08, 0.65]} />
        <meshStandardMaterial color={cushionColor || color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function CoffeeTable({ position, color, legColor, shape = 'box' }) {
  return (
    <group position={position}>
      {shape === 'circle' ? (
        <mesh castShadow position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 32]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ) : (
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      )}
      {/* Ayaklar */}
      <mesh position={[-0.3, 0.08, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
        <meshStandardMaterial color={legColor || color} metalness={0.7} />
      </mesh>
      <mesh position={[0.3, 0.08, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
        <meshStandardMaterial color={legColor || color} metalness={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.08, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
        <meshStandardMaterial color={legColor || color} metalness={0.7} />
      </mesh>
      <mesh position={[0.3, 0.08, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
        <meshStandardMaterial color={legColor || color} metalness={0.7} />
      </mesh>
    </group>
  );
}

function Rug({ position, color, args = [2.2, 0.01, 1.6], shape = 'box' }) {
  const [w, h, d] = args;
  return (
    <mesh position={position} receiveShadow>
      {shape === 'circle' ? (
        <cylinderGeometry args={[w / 2, w / 2, h, 32]} />
      ) : (
        <boxGeometry args={[w, h, d]} />
      )}
      <meshStandardMaterial color={color} roughness={1.0} />
    </mesh>
  );
}

function Plant({ position, potColor, plantColor }) {
  return (
    <group position={position}>
      {/* Saksı */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 16]} />
        <meshStandardMaterial color={potColor || '#e2e8f0'} roughness={0.4} />
      </mesh>
      {/* Toprak */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* Yapraklar */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={plantColor || '#15803d'} roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 0.56, -0.04]} castShadow>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color={plantColor || '#166534'} roughness={0.9} />
      </mesh>
      <mesh position={[-0.08, 0.52, 0.08]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={plantColor || '#166534'} roughness={0.9} />
      </mesh>
    </group>
  );
}

// --- Duvar Özelleştirme Doku Giydirme ve Maskeleme Bileşeni ---
function CustomWallOverlay({ wallId, wallCustomizations, wallWidth, wallHeight, globalWallWidth, globalWallHeight, globalOffsetX = 0, globalOffsetY = 0 }) {
  const [texture, setTexture] = useState(null);
  const customization = wallCustomizations?.[wallId];

  useEffect(() => {
    if (!customization || !customization.url) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(customization.url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      
      const zoom = customization.zoom || 1.0;
      const userOffsetX = customization.offsetX || 0;
      const userOffsetY = customization.offsetY || 0;

      // Genişlik ve yüksekliğe göre repeat/offset oranları
      const repeatX = (wallWidth / globalWallWidth) / zoom;
      const repeatY = (wallHeight / globalWallHeight) / zoom;

      // Global hizalama ofsetleri
      const localOffsetX = (globalOffsetX / globalWallWidth) / zoom;
      const localOffsetY = (globalOffsetY / globalWallHeight) / zoom;

      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      tex.offset.set(localOffsetX + userOffsetX, localOffsetY + userOffsetY);

      setTexture(tex);
    }, null, () => {
      setTexture(null);
    });
  }, [customization, wallWidth, wallHeight, globalWallWidth, globalWallHeight, globalOffsetX, globalOffsetY]);

  if (!texture) return null;

  return (
    <meshStandardMaterial map={texture} roughness={0.5} />
  );
}

function KitchenBlocks({ position, color, counterColor, faucetColor }) {
  return (
    <group position={position}>
      {/* Tezgah alt dolap */}
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[0.7, 0.84, 2.4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Mermer üst tezgah */}
      <mesh position={[0.01, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.04, 2.42]} />
        <meshStandardMaterial color={counterColor || '#f8fafc'} roughness={0.3} />
      </mesh>
      {/* Eviye metal plaka */}
      <mesh position={[0.02, 0.875, 0.4]}>
        <boxGeometry args={[0.45, 0.01, 0.6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Batarya / Musluk */}
      <mesh position={[0.02, 0.98, 0.4]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color={faucetColor || '#64748b'} metalness={0.9} />
      </mesh>
      <mesh position={[-0.04, 1.07, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color={faucetColor || '#64748b'} metalness={0.9} />
      </mesh>
    </group>
  );
}

function Bed({ position, baseColor, sheetColor, pillowColor, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Kasa */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.5, 0.24, 2.0]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} />
      </mesh>
      {/* Yatak */}
      <mesh castShadow position={[0, 0.29, 0.02]}>
        <boxGeometry args={[1.42, 0.14, 1.92]} />
        <meshStandardMaterial color={sheetColor || '#ffffff'} roughness={0.9} />
      </mesh>
      {/* Yastık */}
      <mesh position={[0, 0.38, -0.74]}>
        <boxGeometry args={[1.1, 0.06, 0.34]} />
        <meshStandardMaterial color={pillowColor || '#e2e8f0'} roughness={0.9} />
      </mesh>
      {/* Yorgan detayı */}
      <mesh castShadow position={[0, 0.34, 0.3]}>
        <boxGeometry args={[1.44, 0.06, 1.2]} />
        <meshStandardMaterial color={sheetColor || '#ffffff'} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Wardrobe({ position, color, handleColor, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Gardırop */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[1.4, 2.0, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Kulplar */}
      <mesh position={[0.06, 1.0, 0.31]}>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color={handleColor || '#64748b'} metalness={0.7} />
      </mesh>
      <mesh position={[-0.06, 1.0, 0.31]}>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color={handleColor || '#64748b'} metalness={0.7} />
      </mesh>
    </group>
  );
}

function CoatRack({ position, color }) {
  return (
    <group position={position}>
      {/* Alt taban */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Direk */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Askı kancaları */}
      <mesh position={[0, 1.6, 0]} rotation={[0.4, 0.4, 0.4]}>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0.4, -2.0, 0.4]}>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation={[-1.2, 0.5, 0.4]}>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function NeonLine({ start, end, color }) {
  return (
    <Line
      points={[start, end]}
      color={color || '#00f0ff'}
      lineWidth={3.5}
      toneMapped={false}
    />
  );
}

// --- Modüler Gelecek Genişleme Kapısı Bileşeni ---
function FutureExpansionGate({ position, rotation = [0, 0, 0], label, lang }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Holografik neon kesikli çerçeve */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[4, 7, 0.05]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          wireframe={true} 
          transparent={true} 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Kapı eşiği neon zemin çizgisi */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[4, 0.02, 0.3]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          transparent={true} 
          opacity={0.8} 
        />
      </mesh>

      {/* 3D Etiket */}
      <Text
        position={[0, 7.5, 0]}
        fontSize={0.45}
        color="#00f0ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
      <Text
        position={[0, 7.0, 0]}
        fontSize={0.25}
        color="#a1a1aa"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#0f172a"
      >
        {lang === 'en' ? '(Coming Soon)' : '(Yakında)'}
      </Text>
    </group>
  );
}

// --- Ana Oda / Çevre Bileşeni ---

export default function Room({ 
  currentTheme = 'minimal', 
  envConfig,
  roomNames,
  roomFloorColors,
  roomWallColors,
  isAddMode, 
  isItemEditingActive,
  isItemDrawerOpen,
  highlightedRoomId,
  footballThemeActive = false,
  kitchenPatternActive = false,
  wallCustomizations = {},
  onDrawingStart, 
  onDrawingMove, 
  onDrawingEnd, 
  onDeselect,
  lang = 'tr'
}) {
  
  const isMinimal = currentTheme === 'minimal';
  const isLibrary = currentTheme === 'library';
  const isSciFi = currentTheme === 'sci-fi';
  const showGrid = isAddMode || isItemEditingActive || isItemDrawerOpen;

  const outerFloorColor = envConfig?.outerFloorColor || '#cbd5e1';
  const leafColor = envConfig?.leafColor || '#10b981';

  // Mutfak geometrik ve ferah kaplama dokuları
  const kitchenTextures = useMemo(() => {
    if (!kitchenPatternActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Ferah ve açık renkli bir arka plan (kırık beyaz/açık bej)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 512, 512);

    // İnce geometrik çizgiler (soft slate/gri tonu)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'; 
    ctx.lineWidth = 1.5;

    // Heksagon (Petek) deseni çizelim
    const size = 32; 
    const h = size * Math.sqrt(3);

    const drawHexagon = (c, cx, cy, r) => {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        c.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      c.closePath();
      c.stroke();
    };

    for (let y = -size; y < 512 + size; y += h) {
      for (let x = -size; x < 512 + size; x += size * 3) {
        drawHexagon(ctx, x, y, size);
        drawHexagon(ctx, x + size * 1.5, y + h / 2, size);
      }
    }

    // Mikro beyaz noktalar ile minimal derinlik ekleyelim
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 512; i += 64) {
      for (let j = 0; j < 512; j += 64) {
        ctx.beginPath();
        ctx.arc(i + 32, j + 32, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const loadTextureWithRepeat = (w, h) => {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(w / 4, h / 4); // her 4 birimde bir örüntü tekrarlanır
      return tex;
    };

    return {
      size20x5: loadTextureWithRepeat(20, 5),
      size25x5: loadTextureWithRepeat(25, 5),
      size11x5: loadTextureWithRepeat(11, 5),
      size3x1_5: loadTextureWithRepeat(3, 1.5)
    };
  }, [kitchenPatternActive]);

  // Yatak odası özel fotoğraf kaplama dokuları
  const bedroomTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const load = (path) => {
      const tex = loader.load(path);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };
    return {
      front: load('/foto_kaplama/11731.jpg'),
      left: load('/foto_kaplama/11732.jpg'),
      back: load('/foto_kaplama/damien-dufour-wsn0crQNPPw-unsplash.jpg'),
      right: load('/foto_kaplama/pexels-alberth-osorio-2162421639-38209596.jpg'),
    };
  }, []);

  // Futbol teması duvar dokuları
  const footballTextures = useMemo(() => {
    if (!footballThemeActive) return null;
    const loader = new THREE.TextureLoader();
    const load = (path) => {
      const tex = loader.load(path);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };
    return {
      front: load('/football_wall_front.png'),
      right: load('/football_wall_right.png'),
      back: load('/football_wall_back.png'),
      left: load('/football_wall_left.png'),
    };
  }, [footballThemeActive]);

  // Odaların sınırları dışında yer alacak minimalist low-poly bahçe/çevre objelerinin koordinatları
  const outerElements = useMemo(() => {
    const list = [];
    const seedRandom = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
      };
    };

    const rand = seedRandom("saray_secret_garden_v2");

    // 14 ağaç
    for (let i = 0; i < 16; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 32 + rand() * 48; // 32m ile 80m arası
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.7 + rand() * 0.6;
      list.push({ type: 'tree', position: [x, 0, z], scale, id: `tree_${i}` });
    }

    // 18 çalı
    for (let i = 0; i < 22; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 28 + rand() * 52; // 28m ile 80m arası
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.4 + rand() * 0.6;
      list.push({ type: 'bush', position: [x, 0, z], scale, id: `bush_${i}` });
    }

    // 10 kaya
    for (let i = 0; i < 12; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = 29 + rand() * 45; // 29m ile 74m arası
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scaleX = 0.7 + rand() * 1.0;
      const scaleY = 0.4 + rand() * 0.7;
      const scaleZ = 0.7 + rand() * 1.0;
      const rotationY = rand() * Math.PI;
      list.push({ type: 'rock', position: [x, 0, z], scale: [scaleX, scaleY, scaleZ], rotationY, id: `rock_${i}` });
    }

    return list;
  }, []);

  // Tema Varsayılan Duvar Renkleri
  const defaultWallColor = isMinimal ? '#f8fafc' : isLibrary ? '#ebd9c0' : '#1e293b';
  const defaultInnerWallColor = isMinimal ? '#e2e8f0' : isLibrary ? '#eddcc4' : '#0f172a';

  // Tema Varsayılan Zemin Renkleri
  const defaultFloorColors = {
    hall: isMinimal ? '#eae3d2' : isLibrary ? '#3e2723' : '#0b0d19',
    bedroom: isMinimal ? '#f1ebd9' : isLibrary ? '#2d1b10' : '#080a14',
    kitchen: isMinimal ? '#eae6df' : isLibrary ? '#332015' : '#0a0d18',
    study: isMinimal ? '#e5dec9' : isLibrary ? '#2b1a0e' : '#070912',
    living: isMinimal ? '#eedec3' : isLibrary ? '#372317' : '#0c0f1d',
  };

  // Dinamik Zemin Renkleri (Eğer özel renk tanımlanmışsa o uygulanır, yoksa tema varsayılanı)
  const floorColors = useMemo(() => ({
    hall: roomFloorColors?.hall || defaultFloorColors.hall,
    bedroom: roomFloorColors?.bedroom || defaultFloorColors.bedroom,
    kitchen: roomFloorColors?.kitchen || defaultFloorColors.kitchen,
    study: roomFloorColors?.study || defaultFloorColors.study,
    living: roomFloorColors?.living || defaultFloorColors.living,
  }), [roomFloorColors, defaultFloorColors]);

  // Dinamik Duvar Renkleri
  const wallColors = useMemo(() => ({
    hall: roomWallColors?.hall || defaultWallColor,
    bedroom: roomWallColors?.bedroom || defaultWallColor,
    kitchen: roomWallColors?.kitchen || defaultWallColor,
    study: roomWallColors?.study || defaultWallColor,
    living: roomWallColors?.living || defaultWallColor,
    inner: defaultInnerWallColor
  }), [roomWallColors, defaultWallColor, defaultInnerWallColor]);

  // Işık parametreleri
  const ambientIntensity = 0.55; // Genel aydınlatmayı artırmak ve gölgeleri yumuşatmak için
  const pointColor = isMinimal ? '#fffbeb' : isLibrary ? '#fbbf24' : '#00f0ff';

  const handlePointerDown = (e) => {
    e.stopPropagation();

    if (!isAddMode) {
      if (onDeselect) onDeselect();
      return;
    }

    const { point, face, object } = e;
    if (!face || !object) return;

    const normal = face.normal.clone();
    normal.transformDirection(object.matrixWorld);

    onDrawingStart({
      point: [point.x, point.y, point.z],
      normal: [normal.x, normal.y, normal.z],
      wallId: object.name
    });

    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isAddMode) return;
    e.stopPropagation();

    const { point, object } = e;
    if (!object) return;

    onDrawingMove({
      point: [point.x, point.y, point.z]
    });
  };

  const handlePointerUp = (e) => {
    if (!isAddMode) return;
    e.stopPropagation();

    onDrawingEnd();
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleFloorPointerDown = (e) => {
    if (!isAddMode && onDeselect) {
      e.stopPropagation();
      onDeselect();
    }
  };

  return (
    <group>
      {/* Dinamik Işıklar */}
      <ambientLight intensity={ambientIntensity} />

      {/* --- TAVAN LAMBALARI (ARM ATÜRLER) --- */}
      {/* 1. Giriş / Antre Lambası */}
      <mesh position={[0, 8.95, 20]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight position={[0, 8.75, 20]} intensity={9.0} color={pointColor} distance={20} decay={1.2} />

      {/* 2. Koridor Lambası */}
      <mesh position={[0, 8.95, 5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight position={[0, 8.75, 5]} intensity={9.0} color={pointColor} distance={25} decay={1.2} />

      {/* 3. Banyo Lambası */}
      <mesh position={[-2.5, 8.95, -15]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight position={[-2.5, 8.75, -15]} intensity={9.0} color={pointColor} distance={20} decay={1.2} />

      {/* 4. WC Lambası */}
      <mesh position={[2.5, 8.95, -15]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight position={[2.5, 8.75, -15]} intensity={9.0} color={pointColor} distance={20} decay={1.2} />

      {/* 5. Yatak Odası Lambası */}
      <mesh position={[-15, 8.95, 12.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight position={[-15, 8.75, 12.5]} intensity={10.0} color={pointColor} distance={30} decay={1.2} />

      {/* 6. Çalışma Odası Lambası (Gölge Düşüren) */}
      <mesh position={[-15, 8.95, -12.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight 
        position={[-15, 8.75, -12.5]} 
        intensity={12.0} 
        color={pointColor} 
        distance={35} 
        decay={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />

      {/* 7. Mutfak Lambası */}
      <mesh position={[15, 8.95, -12.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight position={[15, 8.75, -12.5]} intensity={10.0} color={pointColor} distance={30} decay={1.2} />

      {/* 8. Salon Lambası (Gölge Düşüren) */}
      <mesh position={[15, 8.95, 12.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      <pointLight 
        position={[15, 8.75, 12.5]} 
        intensity={12.0} 
        color={pointColor} 
        distance={35} 
        decay={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />

      {/* --- Odaların Zeminleri --- */}
      
      {/* 1. Giriş / Antre */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 20]} receiveShadow name="floor_entry" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={floorColors.entry} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 2. Koridor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5]} receiveShadow name="floor_hall" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial color={floorColors.hall} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 3. Banyo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0, -15]} receiveShadow name="floor_bathroom" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[5, 20]} />
        <meshStandardMaterial color={floorColors.bathroom} roughness={0.8} metalness={isSciFi ? 0.6 : 0.1} />
      </mesh>

      {/* 4. WC */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0, -15]} receiveShadow name="floor_wc" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[5, 20]} />
        <meshStandardMaterial color={floorColors.wc} roughness={0.8} metalness={isSciFi ? 0.6 : 0.1} />
      </mesh>

      {/* 5. Yatak Odası */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0, 12.5]} receiveShadow name="floor_bedroom" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.bedroom} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 6. Çalışma Odası */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0, -12.5]} receiveShadow name="floor_study" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.study} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 7. Mutfak */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0, -12.5]} receiveShadow name="floor_kitchen" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.kitchen} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 8. Salon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0, 12.5]} receiveShadow name="floor_living" onPointerDown={handleFloorPointerDown}>
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.living} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* Oda Vurgu Overlay'leri (Panelden nota git tıklanınca oda parlıyor) */}
      {highlightedRoomId && (() => {
        const highlightConfig = {
          entry:    { position: [0, 0.03, 20],     size: [10, 10] },
          hall:     { position: [0, 0.03, 5],      size: [10, 20] },
          bathroom: { position: [-2.5, 0.03, -15], size: [5, 20] },
          wc:       { position: [2.5, 0.03, -15],  size: [5, 20] },
          bedroom:  { position: [-15, 0.03, 12.5], size: [20, 25] },
          study:    { position: [-15, 0.03, -12.5],size: [20, 25] },
          kitchen:  { position: [15, 0.03, -12.5], size: [20, 25] },
          living:   { position: [15, 0.03, 12.5],  size: [20, 25] },
        };
        const cfg = highlightConfig[highlightedRoomId];
        if (!cfg) return null;
        return (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={cfg.position}>
            <planeGeometry args={cfg.size} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        );
      })()}

      {/* Dinamik Oda Etiketleri */}
      <Text position={[0, 0.02, 20]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.0} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.entry || 'Giriş / Antre'}
      </Text>
      <Text position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.0} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.hall || 'Koridor'}
      </Text>
      <Text position={[-2.5, 0.02, -15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.bathroom || 'Banyo'}
      </Text>
      <Text position={[2.5, 0.02, -15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.wc || 'WC'}
      </Text>
      <Text position={[-15, 0.02, 12.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.5} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.bedroom || 'Yatak Odası'}
      </Text>
      <Text position={[-15, 0.02, -12.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.5} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.study || 'Çalışma Odası'}
      </Text>
      <Text position={[15, 0.02, -12.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.5} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.kitchen || 'Mutfak'}
      </Text>
      <Text position={[15, 0.02, 12.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.5} color={isSciFi ? '#00f0ff' : '#f8fafc'} fillOpacity={0.25} anchorX="center" anchorY="middle">
        {roomNames?.living || 'Salon'}
      </Text>

      {/* Grid Helper */}
      {showGrid && (
        <gridHelper args={[WIDTH, 50, isSciFi ? '#a855f7' : '#6366f1', isSciFi ? '#1e1b4b' : '#334155']} position={[0, 0.01, 0]} />
      )}

      {/* --- Duvarlar (Oda Sınırlarına Göre Parçalanmış & Özelleştirilebilir Duvarlar) --- */}

      {/* Arka Dış Duvarlar (Z = -25) */}
      <mesh position={[-15, 3.75, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_study" receiveShadow castShadow>
        <boxGeometry args={[20, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.study} roughness={0.6} />
      </mesh>
      <mesh position={[-2.5, 3.75, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_bathroom" receiveShadow castShadow>
        <boxGeometry args={[5, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.bathroom} roughness={0.6} />
      </mesh>
      <mesh position={[2.5, 3.75, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_wc" receiveShadow castShadow>
        <boxGeometry args={[5, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.wc} roughness={0.6} />
      </mesh>
      <mesh position={[15, 3.75, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_kitchen" receiveShadow castShadow>
        <boxGeometry args={[20, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.kitchen} roughness={0.6} />
      </mesh>

      {/* Ön Dış Duvarlar (Z = 25) */}
      <mesh position={[-15, 3.75, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_bedroom" receiveShadow castShadow>
        <boxGeometry args={[20, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.bedroom} roughness={0.6} />
      </mesh>
      <mesh position={[15, 3.75, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_living" receiveShadow castShadow>
        <boxGeometry args={[20, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.living} roughness={0.6} />
      </mesh>

      {/* Ön Giriş Kapısı ve Duvarı (X = -5 ile 5, Z = 25) */}
      <mesh position={[-3.5, 3.75, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_entry_left" receiveShadow castShadow>
        <boxGeometry args={[3, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.entry} roughness={0.6} />
      </mesh>
      <mesh position={[3.5, 3.75, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_entry_right" receiveShadow castShadow>
        <boxGeometry args={[3, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.entry} roughness={0.6} />
      </mesh>
      <mesh position={[0, 5.5, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_entry_lintel" receiveShadow castShadow>
        <boxGeometry args={[4, 4.0, 0.2]} />
        <meshStandardMaterial color={wallColors.entry} roughness={0.6} />
      </mesh>

      {/* Sol Dış Duvarlar (X = -25) */}
      <mesh position={[-25, 3.75, -12.5]} rotation={[0, Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_left_study" receiveShadow castShadow>
        <boxGeometry args={[25, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.study} roughness={0.6} />
      </mesh>
      <mesh position={[-25, 3.75, 12.5]} rotation={[0, Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_left_bedroom" receiveShadow castShadow>
        <boxGeometry args={[25, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.bedroom} roughness={0.6} />
      </mesh>
      {wallCustomizations?.wall_left_bedroom && (
        <mesh position={[-24.895, 3.75, 12.5]} rotation={[0, Math.PI / 2, 0]} raycast={null} receiveShadow>
          <planeGeometry args={[25, 7.5]} />
          <CustomWallOverlay wallId="wall_left_bedroom" wallCustomizations={wallCustomizations} wallWidth={25} wallHeight={7.5} globalWallWidth={25} globalWallHeight={7.5} />
        </mesh>
      )}

      {/* Sağ Dış Duvarlar (X = 25) */}
      <mesh position={[25, 3.75, -12.5]} rotation={[0, -Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_right_kitchen" receiveShadow castShadow>
        <boxGeometry args={[25, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.kitchen} roughness={0.6} />
      </mesh>
      <mesh position={[25, 3.75, 12.5]} rotation={[0, -Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_right_living" receiveShadow castShadow>
        <boxGeometry args={[25, 7.5, 0.2]} />
        <meshStandardMaterial color={wallColors.living} roughness={0.6} />
      </mesh>
      {wallCustomizations?.wall_right_living && (
        <mesh position={[24.895, 3.75, 12.5]} rotation={[0, -Math.PI / 2, 0]} raycast={null} receiveShadow>
          <planeGeometry args={[25, 7.5]} />
          <CustomWallOverlay wallId="wall_right_living" wallCustomizations={wallCustomizations} wallWidth={25} wallHeight={7.5} globalWallWidth={25} globalWallHeight={7.5} />
        </mesh>
      )}

      {/* --- İç Bölme Duvarları --- */}

      {/* Sol Odalar Z = 0 Bölmesi (Çalışma Odası & Yatak Odası) */}
      <mesh position={[-15, 3.75, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_division" receiveShadow castShadow>
        <boxGeometry args={[20, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* Sağ Odalar Z = 0 Bölmesi (Mutfak & Salon) */}
      <mesh position={[15, 3.75, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_division" receiveShadow castShadow>
        <boxGeometry args={[20, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* Sol Dikey Bölmeler (X = -5) */}
      {/* 1. Çalışma Odası & Banyo Sınırı (Z = -25 ile -5) */}
      <mesh position={[-5, 3.75, -15]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_study_bathroom" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 20]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      {/* 2. Çalışma Odası & Koridor Sınırı (Z = -5 ile 0, Kapı Boşluğu Z = -4 ile -1) */}
      <mesh position={[-5, 3.75, -4.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_study_left" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[-5, 3.75, -0.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_study_right" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[-5, 5.5, -2.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_study_lintel" receiveShadow castShadow>
        <boxGeometry args={[0.1, 4.0, 3]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* 3. Yatak Odası & Koridor Sınırı (Z = 0 ile 15, Kapı Boşluğu Z = 6 ile 9) */}
      <mesh position={[-5, 3.75, 3.0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bedroom_left" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 6]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[-5, 3.75, 12.0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bedroom_right" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 6]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[-5, 5.5, 7.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bedroom_lintel" receiveShadow castShadow>
        <boxGeometry args={[0.1, 4.0, 3]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* 4. Yatak Odası & Antre Sınırı (Z = 15 ile 25) */}
      <mesh position={[-5, 3.75, 20]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bedroom_entry" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 10]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* Sağ Dikey Bölmeler (X = 5) */}
      {/* 1. WC & Mutfak Sınırı (Z = -25 ile -5) */}
      <mesh position={[5, 3.75, -15]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_wc_kitchen" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 20]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      {/* 2. Mutfak & Koridor Sınırı (Z = -5 ile 0, Kapı Boşluğu Z = -4 ile -1) */}
      <mesh position={[5, 3.75, -4.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_kitchen_left" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[5, 3.75, -0.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_kitchen_right" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[5, 5.5, -2.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_kitchen_lintel" receiveShadow castShadow>
        <boxGeometry args={[0.1, 4.0, 3]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* 3. Salon & Koridor Sınırı (Z = 0 ile 15, Kapı Boşluğu Z = 6 ile 9) */}
      <mesh position={[5, 3.75, 3.0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_living_left" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 6]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[5, 3.75, 12.0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_living_right" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 6]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[5, 5.5, 7.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_living_lintel" receiveShadow castShadow>
        <boxGeometry args={[0.1, 4.0, 3]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* 4. Salon & Antre Sınırı (Z = 15 ile 25) */}
      <mesh position={[5, 3.75, 20]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_living_entry" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 10]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* Banyo & WC Arasındaki Dikey Bölme (X = 0, Z = -25 ile -5) */}
      <mesh position={[0, 3.75, -15]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_partition_bathroom_wc" receiveShadow castShadow>
        <boxGeometry args={[0.1, 7.5, 20]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* Banyo & WC Ön Duvarı (Z = -5, X = -5 ile 5) */}
      {/* 1. Banyo Kapı Duvarı (X = -5 ile 0, Kapı Boşluğu X = -3.5 ile -1.5) */}
      <mesh position={[-4.25, 3.75, -5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bathroom_left" receiveShadow castShadow>
        <boxGeometry args={[1.5, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[-0.75, 3.75, -5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bathroom_right" receiveShadow castShadow>
        <boxGeometry args={[1.5, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[-2.5, 5.5, -5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_bathroom_lintel" receiveShadow castShadow>
        <boxGeometry args={[2, 4.0, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* 2. WC Kapı Duvarı (X = 0 ile 5, Kapı Boşluğu X = 1.5 ile 3.5) */}
      <mesh position={[0.75, 3.75, -5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_wc_left" receiveShadow castShadow>
        <boxGeometry args={[1.5, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[4.25, 3.75, -5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_wc_right" receiveShadow castShadow>
        <boxGeometry args={[1.5, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[2.5, 5.5, -5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_wc_lintel" receiveShadow castShadow>
        <boxGeometry args={[2, 4.0, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* Koridor & Antre Geçiş Kemeri (Z = 15, X = -5 ile 5, Kemer Boşluğu X = -3.0 ile 3.0) */}
      <mesh position={[-4, 3.75, 15]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_archway_left" receiveShadow castShadow>
        <boxGeometry args={[2, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[4, 3.75, 15]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_archway_right" receiveShadow castShadow>
        <boxGeometry args={[2, 7.5, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>
      <mesh position={[0, 5.5, 15]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_archway_lintel" receiveShadow castShadow>
        <boxGeometry args={[6, 4.0, 0.1]} />
        <meshStandardMaterial color={wallColors.inner} roughness={0.6} />
      </mesh>

      {/* --- MODÜLER GENİŞLEME KAPILARI (GÖRSEL HOLOGRAFİK GEÇİŞLER) --- */}
      <FutureExpansionGate position={[24.95, 0.01, -12.5]} rotation={[0, -Math.PI / 2, 0]} label={lang === 'en' ? 'Library Room' : 'Kütüphane Odası'} lang={lang} />
      <FutureExpansionGate position={[24.95, 0.01, 12.5]} rotation={[0, -Math.PI / 2, 0]} label={lang === 'en' ? 'Guest Room' : 'Misafir Odası'} lang={lang} />
      <FutureExpansionGate position={[-15, 0.01, 24.95]} rotation={[0, Math.PI, 0]} label={lang === 'en' ? 'Extra Study' : 'Ek Çalışma Odası'} lang={lang} />
      <FutureExpansionGate position={[0, 0.01, 24.95]} rotation={[0, Math.PI, 0]} label={lang === 'en' ? 'Hobby Room' : 'Hobi Odası'} lang={lang} />



      {/* Sade Dış Çevre Platformu (Büyük Ada) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={outerFloorColor} roughness={0.9} metalness={isSciFi ? 0.3 : 0.05} />
      </mesh>

      {/* Dış Çevredeki Minimal Low-Poly Bitki Örtüsü ve Kayalar */}
      {outerElements.map((el) => {
        if (el.type === 'tree') {
          return (
            <group key={el.id} position={el.position} scale={[el.scale, el.scale, el.scale]}>
              {/* Ağaç Gövdesi */}
              <mesh position={[0, 0.9, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, 1.8, 5]} />
                <meshStandardMaterial color={isSciFi ? '#1e1b4b' : '#5c4033'} roughness={0.9} />
              </mesh>
              {/* Ağaç Yaprakları (Minimal Konik) */}
              <mesh position={[0, 2.0, 0]} castShadow>
                <coneGeometry args={[0.7, 1.4, 5]} />
                <meshStandardMaterial color={leafColor} roughness={0.8} />
              </mesh>
            </group>
          );
        } else if (el.type === 'bush') {
          return (
            <group key={el.id} position={el.position} scale={[el.scale, el.scale, el.scale]}>
              {/* Çalı Yaprağı */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <sphereGeometry args={[0.45, 5, 5]} />
                <meshStandardMaterial color={leafColor} roughness={0.9} />
              </mesh>
            </group>
          );
        } else if (el.type === 'rock') {
          return (
            <mesh 
              key={el.id} 
              position={[el.position[0], 0.15 * el.scale[1], el.position[2]]} 
              scale={el.scale}
              rotation={[0, el.rotationY, 0]}
              castShadow
            >
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial color={isSciFi ? '#1f2937' : '#94a3b8'} roughness={0.9} />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}

