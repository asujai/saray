import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
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
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  return (
    <line>
      <bufferGeometry attach="geometry" onCreated={(g) => g.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color={color || '#00f0ff'} linewidth={2} />
    </line>
  );
}

// --- Ana Oda / Çevre Bileşeni ---

export default function Room({ 
  currentTheme = 'minimal', 
  roomNames,
  roomFloorColors,
  roomWallColors,
  isAddMode, 
  onDrawingStart, 
  onDrawingMove, 
  onDrawingEnd, 
  onDeselect 
}) {
  
  const isMinimal = currentTheme === 'minimal';
  const isLibrary = currentTheme === 'library';
  const isSciFi = currentTheme === 'sci-fi';

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
  const ambientIntensity = isMinimal ? 1.2 : isLibrary ? 1.0 : 0.55;
  const dirIntensity = isMinimal ? 0.95 : isLibrary ? 0.75 : 0.45;
  const dirColor = isMinimal ? '#ffffff' : isLibrary ? '#ffedd5' : '#7c3aed';
  const pointColor = isMinimal ? '#fffbeb' : isLibrary ? '#fbbf24' : '#00f0ff';
  const pointIntensity = isMinimal ? 0.75 : isLibrary ? 1.25 : 1.75;

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
      <directionalLight 
        position={[20, 35, 20]} 
        intensity={dirIntensity} 
        color={dirColor}
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-bias={-0.0001}
      />
      <pointLight position={[0, 4.5, 0]} intensity={pointIntensity} color={pointColor} distance={40} />

      {/* --- Odaların Zeminleri --- */}
      
      {/* 1. Giriş / Hol */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow 
        name="floor_hall"
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial color={floorColors.hall} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 2. Yatak Odası */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[-15, 0, 12.5]} 
        receiveShadow 
        name="floor_bedroom"
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.bedroom} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 3. Mutfak */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[-15, 0, -12.5]} 
        receiveShadow 
        name="floor_kitchen"
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.kitchen} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 4. Çalışma Odası */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[15, 0, 12.5]} 
        receiveShadow 
        name="floor_study"
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.study} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* 5. Salon */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[15, 0, -12.5]} 
        receiveShadow 
        name="floor_living"
        onPointerDown={handleFloorPointerDown}
      >
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color={floorColors.living} roughness={0.75} metalness={isSciFi ? 0.5 : 0.1} />
      </mesh>

      {/* Dinamik Oda Etiketleri */}
      <Text
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.2}
        color={isSciFi ? '#00f0ff' : '#f8fafc'}
        fillOpacity={isSciFi ? 0.45 : 0.25}
        anchorX="center"
        anchorY="middle"
      >
        {roomNames?.hall || 'Giriş / Hol'}
      </Text>
      <Text
        position={[-15, 0.02, 12.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.5}
        color={isSciFi ? '#00f0ff' : '#f8fafc'}
        fillOpacity={isSciFi ? 0.45 : 0.25}
        anchorX="center"
        anchorY="middle"
      >
        {roomNames?.bedroom || 'Yatak Odası'}
      </Text>
      <Text
        position={[-15, 0.02, -12.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.5}
        color={isSciFi ? '#00f0ff' : '#f8fafc'}
        fillOpacity={isSciFi ? 0.45 : 0.25}
        anchorX="center"
        anchorY="middle"
      >
        {roomNames?.kitchen || 'Mutfak'}
      </Text>
      <Text
        position={[15, 0.02, 12.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.5}
        color={isSciFi ? '#00f0ff' : '#f8fafc'}
        fillOpacity={isSciFi ? 0.45 : 0.25}
        anchorX="center"
        anchorY="middle"
      >
        {roomNames?.study || 'Çalışma Odası'}
      </Text>
      <Text
        position={[15, 0.02, -12.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.5}
        color={isSciFi ? '#00f0ff' : '#f8fafc'}
        fillOpacity={isSciFi ? 0.45 : 0.25}
        anchorX="center"
        anchorY="middle"
      >
        {roomNames?.living || 'Salon'}
      </Text>

      {/* Grid Helper - Geometri algısı için */}
      <gridHelper args={[WIDTH, 50, isSciFi ? '#a855f7' : '#6366f1', isSciFi ? '#1e1b4b' : '#334155']} position={[0, 0.01, 0]} />

      {/* --- Duvarlar (Oda Sınırlarına Göre Parçalanmış & Özelleştirilebilir Duvarlar) --- */}

      {/* Arka Dış Duvar (Z = -25) */}
      {/* 1. Mutfak Arka Duvarı */}
      <mesh position={[-15, 2.5, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_kitchen" receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.kitchen} roughness={0.6} />
      </mesh>
      {/* 2. Hol Arka Duvarı */}
      <mesh position={[0, 2.5, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_hall" receiveShadow castShadow>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>
      {/* 3. Salon Arka Duvarı */}
      <mesh position={[15, 2.5, -25]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_back_living" receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.living} roughness={0.6} />
      </mesh>

      {/* Ön Dış Duvar (Z = 25) */}
      {/* 1. Yatak Odası Ön Duvarı */}
      <mesh position={[-15, 2.5, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_bedroom" receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.bedroom} roughness={0.6} />
      </mesh>
      {/* 2. Hol Ön Duvarı */}
      <mesh position={[0, 2.5, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_hall" receiveShadow castShadow>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>
      {/* 3. Çalışma Odası Ön Duvarı */}
      <mesh position={[15, 2.5, 25]} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_front_study" receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.study} roughness={0.6} />
      </mesh>

      {/* Sol Dış Duvar (X = -25) */}
      {/* 1. Mutfak Sol Duvarı */}
      <mesh position={[-25, 2.5, -12.5]} rotation={[0, Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_left_kitchen" receiveShadow castShadow>
        <boxGeometry args={[25, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.kitchen} roughness={0.6} />
      </mesh>
      {/* 2. Yatak Odası Sol Duvarı */}
      <mesh position={[-25, 2.5, 12.5]} rotation={[0, Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_left_bedroom" receiveShadow castShadow>
        <boxGeometry args={[25, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.bedroom} roughness={0.6} />
      </mesh>

      {/* Sağ Dış Duvar (X = 25) */}
      {/* 1. Salon Sağ Duvarı */}
      <mesh position={[25, 2.5, -12.5]} rotation={[0, -Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_right_living" receiveShadow castShadow>
        <boxGeometry args={[25, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.living} roughness={0.6} />
      </mesh>
      {/* 2. Çalışma Odası Sağ Duvarı */}
      <mesh position={[25, 2.5, 12.5]} rotation={[0, -Math.PI / 2, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_right_study" receiveShadow castShadow>
        <boxGeometry args={[25, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.study} roughness={0.6} />
      </mesh>

      {/* İç Yatay Bölme Duvarları (Z = 0) */}
      <mesh position={[-15, 2.5, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_division" receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.bedroom} roughness={0.6} />
      </mesh>

      <mesh position={[15, 2.5, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_division" receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color={wallColors.study} roughness={0.6} />
      </mesh>

      {/* İç Sol Dikey Bölme Duvarları (X = -5) */}
      <mesh position={[-5, 2.5, -19.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_hall" receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 11]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>
      
      {/* Kapı Üst Kirişi 1 (Mutfak Kapısı) */}
      <mesh position={[-5, 4.25, -12.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_hall_lintel1" receiveShadow castShadow>
        <boxGeometry args={[0.2, 1.5, 3]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      <mesh position={[-5, 2.5, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_hall" receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 22]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      {/* Kapı Üst Kirişi 2 (Yatak Odası Kapısı) */}
      <mesh position={[-5, 4.25, 12.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_hall_lintel2" receiveShadow castShadow>
        <boxGeometry args={[0.2, 1.5, 3]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      <mesh position={[-5, 2.5, 19.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_left_hall" receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 11]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      {/* İç Sağ Dikey Bölme Duvarları (X = 5) */}
      <mesh position={[5, 2.5, -19.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_hall" receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 11]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>
      
      {/* Kapı Üst Kirişi 1 (Salon Kapısı) */}
      <mesh position={[5, 4.25, -12.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_hall_lintel1" receiveShadow castShadow>
        <boxGeometry args={[0.2, 1.5, 3]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      <mesh position={[5, 2.5, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_hall" receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 22]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      {/* Kapı Üst Kirişi 2 (Çalışma Odası Kapısı) */}
      <mesh position={[5, 4.25, 12.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_hall_lintel2" receiveShadow castShadow>
        <boxGeometry args={[0.2, 1.5, 3]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      <mesh position={[5, 2.5, 19.5]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} name="wall_inner_right_hall" receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 11]} />
        <meshStandardMaterial color={wallColors.hall} roughness={0.6} />
      </mesh>

      {/* --- Tema Seçimine Göre Mobilyaların Yerleşimi --- */}

      {/* 1. Minimal Çalışma Evi Mobilyaları */}
      {isMinimal && (
        <group>
          {/* Çalışma Odası */}
          <Desk position={[15, 0, 8]} color="#f1f5f9" metalColor="#cbd5e1" />
          <Chair position={[15, 0, 9.2]} color="#334155" baseColor="#64748b" />
          <Shelf position={[23.8, 0, 15]} color="#f1f5f9" rotation={[0, -Math.PI / 2, 0]} />
          <TableLamp position={[14.6, 0.38, 8]} color="#64748b" bulbColor="#fef08a" lightColor="#fef08a" />
          <mesh position={[15, 1.8, 6.01]}>
            <boxGeometry args={[1.8, 1.0, 0.02]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
          
          {/* Salon */}
          <Sofa position={[15, 0, -18]} color="#e2e8f0" cushionColor="#cbd5e1" />
          <CoffeeTable position={[15, 0, -14]} color="#ffffff" legColor="#94a3b8" />
          <Rug position={[15, 0.005, -14]} color="#f8fafc" />
          <Plant position={[23, 0, -23]} potColor="#cbd5e1" plantColor="#22c55e" />

          {/* Mutfak */}
          <KitchenBlocks position={[-23.8, 0, -12.5]} color="#ffffff" counterColor="#e2e8f0" />
          <Desk position={[-13, 0, -12.5]} color="#ffffff" metalColor="#e2e8f0" />
          <Chair position={[-13, 0, -10.8]} color="#64748b" baseColor="#cbd5e1" rotation={[0, Math.PI, 0]} />
          <Chair position={[-13, 0, -14.2]} color="#64748b" baseColor="#cbd5e1" />

          {/* Yatak Odası */}
          <Bed position={[-20, 0, 20]} baseColor="#f1f5f9" sheetColor="#ffffff" pillowColor="#cbd5e1" />
          <CoffeeTable position={[-23.8, 0, 15]} color="#ffffff" legColor="#cbd5e1" />
          <Wardrobe position={[-10, 0, 8]} color="#ffffff" handleColor="#cbd5e1" rotation={[0, Math.PI, 0]} />

          {/* Hol */}
          <CoffeeTable position={[-3.5, 0, -5]} color="#ffffff" legColor="#cbd5e1" />
          <CoatRack position={[3.5, 0, 2]} color="#cbd5e1" />
        </group>
      )}

      {/* 2. Kütüphane / Bilgi Evi Mobilyaları */}
      {isLibrary && (
        <group>
          {/* Çalışma Odası */}
          <Desk position={[15, 0, 8]} color="#5c4033" metalColor="#3e2723" />
          <Chair position={[15, 0, 9.2]} color="#1a0f0a" baseColor="#3e2723" />
          <Shelf position={[23.8, 0, 15]} color="#4a3525" args={[1.5, 2.2, 0.4]} rotation={[0, -Math.PI / 2, 0]} />
          <Shelf position={[23.8, 0, 12]} color="#4a3525" args={[1.5, 2.2, 0.4]} rotation={[0, -Math.PI / 2, 0]} />
          <TableLamp position={[14.6, 0.38, 8]} color="#d97706" bulbColor="#fbbf24" lightColor="#fbbf24" />
          <mesh position={[15, 1.8, 6.01]}>
            <boxGeometry args={[1.8, 1.0, 0.02]} />
            <meshStandardMaterial color="#b45309" roughness={0.9} />
          </mesh>

          {/* Salon */}
          <Sofa position={[15, 0, -18]} color="#7c2d12" cushionColor="#9a3412" />
          <CoffeeTable position={[15, 0, -14]} color="#4a3525" legColor="#3e2723" />
          <Rug position={[15, 0.005, -14]} color="#7f1d1d" args={[2.5, 0.01, 1.8]} />
          <Shelf position={[23.8, 0, -18]} color="#4a3525" rotation={[0, -Math.PI / 2, 0]} />
          <CoatRack position={[8, 0, -22]} color="#fbbf24" />

          {/* Mutfak */}
          <KitchenBlocks position={[-23.8, 0, -12.5]} color="#5c4033" counterColor="#854d0e" />
          <Desk position={[-13, 0, -12.5]} color="#5c4033" metalColor="#3e2723" />
          <Chair position={[-13, 0, -10.8]} color="#3e2723" baseColor="#1a0f0a" rotation={[0, Math.PI, 0]} />
          <Chair position={[-13, 0, -14.2]} color="#3e2723" baseColor="#1a0f0a" />

          {/* Yatak Odası */}
          <Bed position={[-20, 0, 20]} baseColor="#4a3525" sheetColor="#fef3c7" pillowColor="#b45309" />
          <Shelf position={[-23.8, 0, 15]} color="#4a3525" args={[0.8, 1.6, 0.3]} rotation={[0, Math.PI / 2, 0]} />
          <CoffeeTable position={[-10, 0, 8]} color="#4a3525" legColor="#3e2723" />

          {/* Hol */}
          <Shelf position={[-3.5, 0, -5]} color="#4a3525" args={[0.8, 1.4, 0.35]} rotation={[0, Math.PI / 2, 0]} />
          <CoatRack position={[3.5, 0, 2]} color="#4a3525" />
        </group>
      )}

      {/* 3. Bilim Kurgu / Hologram Evi Mobilyaları */}
      {isSciFi && (
        <group>
          {/* Çalışma Odası */}
          <Desk position={[15, 0, 8]} color="#0f172a" metalColor="#00f0ff" />
          <Chair position={[15, 0, 9.2]} color="#1e293b" baseColor="#00f0ff" />
          {/* Yarı Saydam Ekran Panelleri */}
          <mesh position={[23.8, 1.2, 14]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.5, 1.0]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[23.8, 1.2, 14]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[1.5, 1.0, 0.01]} />
            <meshStandardMaterial color="#0f172a" transparent opacity={0.15} />
          </mesh>
          {/* Neon oda çizgileri */}
          <NeonLine start={[6, 0.012, 6]} end={[24, 0.012, 6]} color="#00f0ff" />
          <NeonLine start={[6, 0.012, 24]} end={[24, 0.012, 24]} color="#00f0ff" />
          <NeonLine start={[6, 0.012, 6]} end={[6, 0.012, 24]} color="#00f0ff" />
          <NeonLine start={[24, 0.012, 6]} end={[24, 0.012, 24]} color="#00f0ff" />

          {/* Salon */}
          <Sofa position={[15, 0, -18]} color="#0f172a" cushionColor="#3b82f6" />
          <CoffeeTable position={[15, 0, -14]} color="#1e293b" legColor="#00f0ff" shape="circle" />
          <Rug position={[15, 0.005, -14]} color="#1e1b4b" shape="circle" args={[2.0, 0.01]} />
          {/* Neon çizgiler salon */}
          <NeonLine start={[6, 0.012, -24]} end={[24, 0.012, -24]} color="#a855f7" />
          <NeonLine start={[6, 0.012, -6]} end={[24, 0.012, -6]} color="#a855f7" />
          <NeonLine start={[6, 0.012, -24]} end={[6, 0.012, -6]} color="#a855f7" />
          <NeonLine start={[24, 0.012, -24]} end={[24, 0.012, -6]} color="#a855f7" />

          {/* Mutfak */}
          <KitchenBlocks position={[-23.8, 0, -12.5]} color="#1e293b" counterColor="#0f172a" faucetColor="#00f0ff" />
          <Desk position={[-13, 0, -12.5]} color="#0f172a" metalColor="#3b82f6" />
          <Chair position={[-13, 0, -10.8]} color="#1e293b" baseColor="#3b82f6" rotation={[0, Math.PI, 0]} />
          <Chair position={[-13, 0, -14.2]} color="#1e293b" baseColor="#3b82f6" />

          {/* Yatak Odası */}
          <Bed position={[-20, 0, 20]} baseColor="#0f172a" sheetColor="#1e1b4b" pillowColor="#00f0ff" />
          <CoffeeTable position={[-23.8, 0, 15]} color="#1e293b" legColor="#3b82f6" />
          {/* Yatak odası neon çizgileri */}
          <NeonLine start={[-24, 0.012, 6]} end={[-6, 0.012, 6]} color="#00f0ff" />
          <NeonLine start={[-24, 0.012, 24]} end={[-6, 0.012, 24]} color="#00f0ff" />
          <NeonLine start={[-24, 0.012, 6]} end={[-24, 0.012, 24]} color="#00f0ff" />
          <NeonLine start={[-6, 0.012, 6]} end={[-6, 0.012, 24]} color="#00f0ff" />

          {/* Hol */}
          <NeonLine start={[0, 0.012, -24]} end={[0, 0.012, 24]} color="#3b82f6" />
          <NeonLine start={[-4, 0.012, 0]} end={[4, 0.012, 0]} color="#3b82f6" />
          {/* Hologram panel hissi veren parlayan duvar */}
          <mesh position={[-4.9, 2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[2.5, 1.6]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

