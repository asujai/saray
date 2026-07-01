import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Text, Html, useGLTF, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { checkItemsCollide } from '../utils/collisionUtils';

function isNoteNotEmpty(linkedNote) {
  if (!linkedNote) return false;
  if (!linkedNote.pages || !Array.isArray(linkedNote.pages)) return false;
  return linkedNote.pages.some(page => (page.text && page.text.trim()) || page.image);
}

const ROOM_LIMITS = {
  entry: { minX: -4.5, maxX: 4.5, minZ: 15.5, maxZ: 24.5 },
  hall: { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 14.5 },
  bathroom: { minX: -4.5, maxX: -0.5, minZ: -24.5, maxZ: -5.5 },
  wc: { minX: 0.5, maxX: 4.5, minZ: -24.5, maxZ: -5.5 },
  bedroom: { minX: -24.5, maxX: -5.5, minZ: 0.5, maxZ: 24.5 },
  study: { minX: -24.5, maxX: -5.5, minZ: -24.5, maxZ: -0.5 },
  kitchen: { minX: 5.5, maxX: 24.5, minZ: -24.5, maxZ: -0.5 },
  living: { minX: 5.5, maxX: 24.5, minZ: 0.5, maxZ: 24.5 },
  unknown: { minX: -24.5, maxX: 24.5, minZ: -24.5, maxZ: 24.5 }
};

const getRoomIdFromPosition = (x, z) => {
  if (x >= -5 && x <= 5) {
    if (z >= 15 && z <= 25) return 'entry';
    if (z >= -5 && z < 15) return 'hall';
    if (z >= -25 && z < -5) {
      return x < 0 ? 'bathroom' : 'wc';
    }
  }
  if (x < -5) {
    if (z >= 0 && z <= 25) return 'bedroom';
    if (z >= -25 && z < 0) return 'study';
  }
  if (x > 5) {
    if (z >= 0 && z <= 25) return 'living';
    if (z >= -25 && z < 0) return 'kitchen';
  }
  return 'unknown';
};

const isDescendantOf = (obj, parent) => {
  let curr = obj;
  while (curr) {
    if (curr === parent) return true;
    curr = curr.parent;
  }
  return false;
};

// --- Low-Poly Eşya Çizimleri ---

function DeskModel({ color }) {
  return (
    <group>
      {/* Tabla */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Ayaklar */}
      <mesh castShadow position={[-0.7, 0.35, -0.3]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.7, 0.35, -0.3]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[-0.7, 0.35, 0.3]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.7, 0.35, 0.3]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ChairModel({ color }) {
  return (
    <group>
      {/* Oturak */}
      <mesh castShadow position={[0, 0.44, 0]}>
        <boxGeometry args={[0.45, 0.05, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Sırtlık */}
      <mesh castShadow position={[0, 0.75, -0.2]}>
        <boxGeometry args={[0.45, 0.5, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Ayak bağlantısı */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Ayaklar */}
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0.1]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function ShelfModel({ color }) {
  return (
    <group>
      {/* Çerçeve */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1.0, 1.8, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Raflar (İç Kısımlar) */}
      <mesh position={[0, 0.45, 0.01]} castShadow>
        <boxGeometry args={[0.92, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.9, 0.01]} castShadow>
        <boxGeometry args={[0.92, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 1.35, 0.01]} castShadow>
        <boxGeometry args={[0.92, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function WallShelfModel({ color }) {
  return (
    <group>
      {/* Yatay Raf */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Alt destekler */}
      <mesh castShadow position={[-0.4, -0.1, -0.08]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh castShadow position={[0.4, -0.1, -0.08]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function PlantModel({ color }) {
  return (
    <group>
      {/* Saksı */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Toprak */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* Bitki gövde/yaprak */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.08, 0.68, -0.06]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.08, 0.64, 0.08]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>
    </group>
  );
}

function LampModel({ color }) {
  return (
    <group>
      {/* Taban */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      {/* Direk */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      {/* Abajur şapkası */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.35, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Ampul / Işık halkası */}
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#fffbeb" />
      </mesh>
      <pointLight position={[0, 1.45, 0]} intensity={1.5} color="#fffbeb" distance={8} decay={1.5} />
    </group>
  );
}

function RugModel({ color }) {
  return (
    <mesh receiveShadow position={[0, 0.002, 0]}>
      <boxGeometry args={[2.4, 0.004, 1.8]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function PCModel() {
  return (
    <group>
      {/* Laptop alt kasa */}
      <mesh castShadow position={[0, 0.01, 0.1]}>
        <boxGeometry args={[0.42, 0.015, 0.28]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Laptop ekran kapak */}
      <mesh castShadow position={[0, 0.14, -0.04]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.42, 0.26, 0.015]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Ekran paneli (neon mavi parlayan) */}
      <mesh position={[0, 0.14, -0.03]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.39, 0.23, 0.005]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
    </group>
  );
}

function BoxModel({ color }) {
  return (
    <group>
      {/* Ana kutu */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color || '#b45309'} roughness={0.85} />
      </mesh>
      {/* Kapak bant detayı */}
      <mesh position={[0, 0.505, 0]} castShadow>
        <boxGeometry args={[0.08, 0.01, 0.51]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>
    </group>
  );
}

function BoardModel({ color }) {
  return (
    <group>
      {/* Pano Yüzeyi */}
      <mesh castShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[1.5, 1.0, 0.04]} />
        <meshStandardMaterial color={color || '#dbeafe'} roughness={0.6} />
      </mesh>
      {/* Pano Çerçevesi */}
      <mesh castShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[1.56, 1.06, 0.02]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
      {/* Destek ayakları */}
      <mesh castShadow position={[-0.6, 0.4, 0]}>
        <boxGeometry args={[0.04, 0.8, 0.04]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh castShadow position={[0.6, 0.4, 0]}>
        <boxGeometry args={[0.04, 0.8, 0.04]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Ayak alt yatay metal */}
      <mesh position={[-0.6, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.04, 0.4, 0.04]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.6, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.04, 0.4, 0.04]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function LargeDeskModel({ color }) {
  return (
    <group>
      {/* Geniş Tabla */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.0]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Metal Yan Ayaklar (U şeklinde kalın ayaklar) */}
      <mesh castShadow position={[-0.95, 0.33, 0]}>
        <boxGeometry args={[0.08, 0.66, 0.88]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0.95, 0.33, 0]}>
        <boxGeometry args={[0.08, 0.66, 0.88]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Çekmece Bloğu (Keson) */}
      <mesh castShadow position={[0.6, 0.35, 0.2]}>
        <boxGeometry args={[0.45, 0.5, 0.5]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>
      {/* Çekmece Kulpları */}
      <mesh position={[0.6, 0.48, 0.46]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.3, 0.46]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
    </group>
  );
}

function MeetingTableModel({ color }) {
  return (
    <group>
      {/* Masif Kalın Tabla */}
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[3.2, 0.1, 1.4]} />
        <meshStandardMaterial color={color || '#78350f'} roughness={0.5} />
      </mesh>
      {/* Kalın Merkez Ayak Bloğu 1 */}
      <mesh castShadow position={[-0.9, 0.35, 0]}>
        <boxGeometry args={[0.4, 0.7, 0.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      {/* Kalın Merkez Ayak Bloğu 2 */}
      <mesh castShadow position={[0.9, 0.35, 0]}>
        <boxGeometry args={[0.4, 0.7, 0.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
    </group>
  );
}

function LDeskModel({ color }) {
  return (
    <group>
      {/* Ana Tabla */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0.2]}>
        <boxGeometry args={[1.8, 0.06, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* L Dönüş Tablası */}
      <mesh castShadow receiveShadow position={[-0.5, 0.72, -0.6]}>
        <boxGeometry args={[0.8, 0.06, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Ayaklar */}
      <mesh castShadow position={[-0.8, 0.35, 0.5]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0.8, 0.35, 0.5]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0.8, 0.35, -0.1]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.8, 0.35, -0.9]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.1, 0.35, -0.9]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
    </group>
  );
}

function RoundTableModel({ color }) {
  return (
    <group>
      {/* Yuvarlak Tabla */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 24]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Merkez Sütun Ayak */}
      <mesh castShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.68, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Dairesel Taban */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 20]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
    </group>
  );
}

function LargeBookshelfModel({ color }) {
  return (
    <group>
      {/* Dış Çerçeve */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[1.8, 2.0, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Dikey Bölme Paneli (İç Kısmı İkiye Böler) */}
      <mesh position={[0, 1.0, 0.01]} castShadow>
        <boxGeometry args={[0.04, 1.9, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Yatay Raflar Sol */}
      <mesh position={[-0.43, 0.5, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.43, 1.0, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.43, 1.5, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Yatay Raflar Sağ */}
      <mesh position={[0.43, 0.35, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.43, 0.85, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.43, 1.35, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.43, 1.75, 0.01]} castShadow>
        <boxGeometry args={[0.82, 0.03, 0.33]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function LibraryShelfModel({ color, books = [], onOpenBookNote }) {
  const { scene } = useGLTF('/models/kitaplik_modeli.gltf');

  const { clonedScene } = useMemo(() => {
    const clone = scene.clone();
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const factor = size.y > 0 ? 2.2 / size.y : 0.791;

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.85;
          child.material.metalness = 0.1;
          
          if (color) {
            const finalColor = new THREE.Color(color);
            // Arkalık mesh'leri local z < -0.1 koordinatlarındadır. Onları koyulaştırarak derinlik algısı katıyoruz.
            if (child.position && child.position.z < -0.1) {
              finalColor.multiplyScalar(0.65);
            } else if (child.position && child.position.y > 2.7) {
              finalColor.multiplyScalar(1.05); // Üst tabla parlaması
            } else if (child.position && child.position.y < 0.1) {
              finalColor.multiplyScalar(0.8);  // Zemin gölgelemesi
            }
            child.material.color.copy(finalColor);
          }
        }
      }
    });

    clone.position.set(-center.x * factor, -box.min.y * factor, -center.z * factor);
    clone.scale.set(factor, factor, factor);

    return { clonedScene: clone };
  }, [scene]);

  return (
    <group>
      <primitive object={clonedScene} />

      {books.map((book) => {
        const slot = book.slotIndex;
        const row = Math.floor(slot / 5);
        const col = slot % 5;

        // X koordinatları (Sütunlar)
        const xCoords = [-1.569, -0.785, 0, 0.785, 1.569];
        const x = xCoords[col] !== undefined ? xCoords[col] : 0;

        // Y koordinatları (Satırlar - Kitap merkezleri rafların üzerine gelecek şekilde)
        const yCoords = [0.142, 0.454, 0.765, 1.077, 1.390, 1.701, 2.013];
        const y = yCoords[row] !== undefined ? yCoords[row] : 0.142;

        const z = 0.08;

        return (
          <group key={book.bookId} position={[x, y, z]}>
            <mesh 
              castShadow 
              onClick={(e) => {
                e.stopPropagation();
                onOpenBookNote(book.bookId);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'default';
              }}
            >
              <boxGeometry args={[0.12, 0.32, 0.22]} />
              <meshStandardMaterial color={book.color || '#ef4444'} roughness={0.7} metalness={0.05} />
            </mesh>
            <Text
              position={[0, 0, 0.111]}
              rotation={[0, 0, -Math.PI / 2]}
              fontSize={0.035}
              color="#ffffff"
              maxWidth={0.28}
              anchorX="center"
              anchorY="middle"
              depthOffset={-1}
              toneMapped={false}
            >
              {book.spineLabel}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function LargeLibraryShelfModel({ color, books = [], onOpenBookNote }) {
  const shelfColor = color || '#78350f';
  return (
    <group>
      {/* Yan Dikmeler */}
      <mesh castShadow position={[-2.17, 1.1, 0]}>
        <boxGeometry args={[0.06, 2.2, 0.35]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[2.17, 1.1, 0]}>
        <boxGeometry args={[0.06, 2.2, 0.35]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} />
      </mesh>
      {/* Alt ve Üst Tablalar */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[4.4, 0.04, 0.35]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 2.18, 0]}>
        <boxGeometry args={[4.4, 0.04, 0.35]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} />
      </mesh>
      {/* Arka Kapak */}
      <mesh receiveShadow position={[0, 1.1, -0.17]}>
        <boxGeometry args={[4.28, 2.12, 0.02]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* İç Dikey Dikmeler */}
      {[-1.4, -0.7, 0, 0.7, 1.4].map((x, idx) => (
        <mesh key={idx} castShadow position={[x, 1.1, 0.005]}>
          <boxGeometry args={[0.04, 2.12, 0.33]} />
          <meshStandardMaterial color={shelfColor} roughness={0.8} />
        </mesh>
      ))}
      {/* İç Yatay Raflar (Katlar) */}
      {[0.5, 1.0, 1.5].map((y, idx) => (
        <group key={idx}>
          <mesh position={[-1.785, y, 0.005]} castShadow>
            <boxGeometry args={[0.71, 0.03, 0.33]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
          <mesh position={[-1.05, y, 0.005]} castShadow>
            <boxGeometry args={[0.66, 0.03, 0.33]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
          <mesh position={[-0.35, y, 0.005]} castShadow>
            <boxGeometry args={[0.66, 0.03, 0.33]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
          <mesh position={[0.35, y, 0.005]} castShadow>
            <boxGeometry args={[0.66, 0.03, 0.33]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
          <mesh position={[1.05, y, 0.005]} castShadow>
            <boxGeometry args={[0.66, 0.03, 0.33]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
          <mesh position={[1.785, y, 0.005]} castShadow>
            <boxGeometry args={[0.71, 0.03, 0.33]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
        </group>
      ))}

      {/* Kitaplar */}
      {books.map((book) => {
        const slot = book.slotIndex;
        const row = Math.floor(slot / 12);
        const col = slot % 12;
        
        const xCoords = [-1.92, -1.57, -1.22, -0.87, -0.52, -0.17, 0.17, 0.52, 0.87, 1.22, 1.57, 1.92];
        const x = xCoords[col] ?? 0;

        let y = 0.2;
        if (row === 1) y = 0.7;
        else if (row === 2) y = 1.2;
        else if (row === 3) y = 1.7;

        const z = 0.065;

        return (
          <group key={book.bookId} position={[x, y, z]}>
            <mesh 
              castShadow 
              onClick={(e) => {
                e.stopPropagation();
                onOpenBookNote(book.bookId);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'default';
              }}
            >
              <boxGeometry args={[0.12, 0.32, 0.22]} />
              <meshStandardMaterial color={book.color || '#ef4444'} roughness={0.6} />
            </mesh>
            <Text
              position={[0, 0, 0.111]}
              rotation={[0, 0, -Math.PI / 2]}
              fontSize={0.035}
              color="#ffffff"
              maxWidth={0.28}
              anchorX="center"
              anchorY="middle"
              depthOffset={-1}
              toneMapped={false}
            >
              {book.spineLabel}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function LowBookshelfModel({ color }) {
  return (
    <group>
      {/* Dış Çerçeve */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.6, 0.9, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Orta Dikey Bölme */}
      <mesh position={[0, 0.43, 0.01]} castShadow>
        <boxGeometry args={[0.04, 0.78, 0.38]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Raflar */}
      <mesh position={[-0.38, 0.43, 0.01]} castShadow>
        <boxGeometry args={[0.72, 0.03, 0.38]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.38, 0.43, 0.01]} castShadow>
        <boxGeometry args={[0.72, 0.03, 0.38]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function FileCabinetModel({ color }) {
  return (
    <group>
      {/* Metal Gövde */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.6]} />
        <meshStandardMaterial color={color || '#475569'} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Çekmece Bölmeleri */}
      {[0.2, 0.55, 0.9, 1.25].map((y, idx) => (
        <group key={idx} position={[0, y, 0.301]}>
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.3, 0.01]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          {/* Metal Kulp */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.16, 0.03, 0.02]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          {/* Etiketlik */}
          <mesh position={[0.18, 0.08, 0.006]}>
            <boxGeometry args={[0.08, 0.04, 0.002]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DrawerCabinetModel({ color }) {
  return (
    <group>
      {/* Ahşap Gövde */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.8, 0.9, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Üst Çekmece Sol */}
      <mesh castShadow position={[-0.18, 0.68, 0.251]}>
        <boxGeometry args={[0.34, 0.32, 0.01]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.5} />
      </mesh>
      <mesh position={[-0.18, 0.68, 0.26]}>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} />
      </mesh>
      {/* Üst Çekmece Sağ */}
      <mesh castShadow position={[0.18, 0.68, 0.251]}>
        <boxGeometry args={[0.34, 0.32, 0.01]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.5} />
      </mesh>
      <mesh position={[0.18, 0.68, 0.26]}>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} />
      </mesh>
      {/* Alt Çekmece Büyük */}
      <mesh castShadow position={[0, 0.26, 0.251]}>
        <boxGeometry args={[0.7, 0.42, 0.01]} />
        <meshStandardMaterial color="#27272a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.26, 0.26]}>
        <boxGeometry args={[0.18, 0.02, 0.02]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} />
      </mesh>
    </group>
  );
}

function LargeBoardModel({ color }) {
  return (
    <group>
      {/* Büyük Pano Yüzeyi */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[2.4, 1.3, 0.04]} />
        <meshStandardMaterial color={color || '#fef08a'} roughness={0.8} />
      </mesh>
      {/* Ahşap Çerçeve */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[2.46, 1.36, 0.02]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Küçük Post-it Temsilleri */}
      <mesh position={[-0.6, 1.6, 0.022]}>
        <boxGeometry args={[0.12, 0.12, 0.005]} />
        <meshStandardMaterial color="#fb7185" roughness={0.6} />
      </mesh>
      <mesh position={[-0.4, 1.6, 0.022]}>
        <boxGeometry args={[0.12, 0.12, 0.005]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 1.3, 0.022]}>
        <boxGeometry args={[0.14, 0.14, 0.005]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} />
      </mesh>
    </group>
  );
}

function WhiteboardModel() {
  return (
    <group>
      {/* Parlak Beyaz Panel */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.4, 1.0, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
      {/* Alüminyum İnce Çerçeve */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.44, 1.04, 0.015]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      {/* Kalemlik Çıkıntısı */}
      <mesh position={[0, 0.69, 0.05]} castShadow>
        <boxGeometry args={[0.6, 0.01, 0.08]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
      {/* Ayak Destekleri */}
      <mesh position={[-0.55, 0.35, 0]} castShadow>
        <boxGeometry args={[0.03, 0.7, 0.03]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0.55, 0.35, 0]} castShadow>
        <boxGeometry args={[0.03, 0.7, 0.03]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Yatay Alt Ayaklar */}
      <mesh position={[-0.55, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.5, 0.03]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0.55, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.5, 0.03]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function OfficeChairModel({ color }) {
  return (
    <group>
      {/* Kalın Oturak */}
      <mesh castShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Ergonomik Sırtlık */}
      <mesh castShadow position={[0, 0.88, -0.22]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.46, 0.62, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Kolçak Sol */}
      <group position={[-0.27, 0.62, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.22]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh castShadow position={[0, 0.1, -0.04]}>
          <boxGeometry args={[0.04, 0.02, 0.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
      </group>
      {/* Kolçak Sağ */}
      <group position={[0.27, 0.62, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.22]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh castShadow position={[0, 0.1, -0.04]}>
          <boxGeometry args={[0.04, 0.02, 0.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
      </group>
      {/* Ayak Mekanizması */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Yıldız Ayak Tabanı */}
      {[0, Math.PI / 2.5, (2 * Math.PI) / 2.5, (3 * Math.PI) / 2.5, (4 * Math.PI) / 2.5].map((angle, idx) => (
        <group key={idx} rotation={[0, angle, 0]} position={[0, 0.02, 0]}>
          <mesh castShadow position={[0, 0, 0.25]}>
            <boxGeometry args={[0.06, 0.03, 0.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Tekerlek */}
          <mesh castShadow position={[0, -0.02, 0.46]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GuestChairModel({ color }) {
  return (
    <group>
      {/* Oturak */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.48, 0.04, 0.46]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Sırtlık */}
      <mesh castShadow position={[0, 0.8, -0.2]}>
        <boxGeometry args={[0.46, 0.45, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Kızak Metal Ayak (U şeklinde kıvrılan boru ayaklar) */}
      <mesh castShadow position={[-0.22, 0.22, 0.02]}>
        <boxGeometry args={[0.03, 0.42, 0.42]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh castShadow position={[0.22, 0.22, 0.02]}>
        <boxGeometry args={[0.03, 0.42, 0.42]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Taban Zemin Bağlantısı */}
      <mesh position={[0, 0.015, 0.02]}>
        <boxGeometry args={[0.44, 0.03, 0.03]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

function StoolModel({ color }) {
  return (
    <group>
      {/* Yuvarlak Oturak */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* 4 Ayak */}
      {[-0.12, 0.12].map((x) =>
        [-0.12, 0.12].map((z, idx) => (
          <mesh key={`${x}-${z}-${idx}`} castShadow position={[x, 0.225, z]} rotation={[x * 0.2, 0, -z * 0.2]}>
            <cylinderGeometry args={[0.018, 0.012, 0.45, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* Ayak Çemberi (Destek) */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
    </group>
  );
}

function SideTableModel({ color }) {
  return (
    <group>
      {/* Sehpa Tablası */}
      <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* 4 İnce Ayak */}
      <mesh castShadow position={[-0.23, 0.24, -0.23]}>
        <boxGeometry args={[0.04, 0.48, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0.23, 0.24, -0.23]}>
        <boxGeometry args={[0.04, 0.48, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.23, 0.24, 0.23]}>
        <boxGeometry args={[0.04, 0.48, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0.23, 0.24, 0.23]}>
        <boxGeometry args={[0.04, 0.48, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
    </group>
  );
}

function LargeRackModel({ color }) {
  return (
    <group>
      {/* 4 Dikey Metal Direk */}
      <mesh castShadow position={[-0.78, 0.9, -0.22]}>
        <boxGeometry args={[0.04, 1.8, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.78, 0.9, -0.22]}>
        <boxGeometry args={[0.04, 1.8, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.78, 0.9, 0.22]}>
        <boxGeometry args={[0.04, 1.8, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.78, 0.9, 0.22]}>
        <boxGeometry args={[0.04, 1.8, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* 4 Katlı Ahşap/Metal Raflar */}
      {[0.2, 0.7, 1.2, 1.7].map((y, idx) => (
        <mesh key={idx} castShadow position={[0, y, 0]}>
          <boxGeometry args={[1.56, 0.03, 0.44]} />
          <meshStandardMaterial color={color || '#b45309'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function SmallWallShelfModel({ color }) {
  return (
    <group>
      {/* Alt Raf */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.7, 0.03, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Üst Raf */}
      <mesh castShadow position={[0, 0.32, -0.02]}>
        <boxGeometry args={[0.7, 0.03, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* İki Rafı Birleştiren Yan Teller */}
      <mesh position={[-0.32, 0.17, -0.02]} castShadow>
        <boxGeometry args={[0.02, 0.34, 0.18]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.32, 0.17, -0.02]} castShadow>
        <boxGeometry args={[0.02, 0.34, 0.18]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
    </group>
  );
}

function FloorLampModel({ color }) {
  return (
    <group>
      {/* Tripod Ayak 1 */}
      <mesh position={[-0.15, 0.75, -0.08]} rotation={[0.1, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      {/* Tripod Ayak 2 */}
      <mesh position={[0.15, 0.75, -0.08]} rotation={[0.1, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      {/* Tripod Ayak 3 */}
      <mesh position={[0, 0.75, 0.15]} rotation={[-0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      {/* Büyük Şapka */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.45, 16]} />
        <meshStandardMaterial color={color || '#fef08a'} roughness={0.6} />
      </mesh>
      {/* Ampul ve Işık */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#fffbeb" />
      </mesh>
      <pointLight position={[0, 1.4, 0]} intensity={1.8} color="#fffbeb" distance={10} decay={1.5} />
    </group>
  );
}

function DeskLampModel({ color }) {
  return (
    <group>
      {/* Küçük Taban */}
      <mesh castShadow position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Eğimli Gövde Borusu */}
      <mesh position={[-0.04, 0.15, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.28, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[0.02, 0.3, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.18, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      {/* Küçük Şapka */}
      <mesh position={[0.07, 0.38, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.1, 12]} />
        <meshStandardMaterial color={color || '#fbbf24'} roughness={0.4} />
      </mesh>
      {/* Ampul & Işık */}
      <mesh position={[0.08, 0.34, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <pointLight position={[0.08, 0.32, 0]} intensity={1.0} color="#fffbeb" distance={3} decay={2.0} />
    </group>
  );
}

function LargePlantModel({ color }) {
  return (
    <group>
      {/* Büyük Seramik Saksı */}
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.3, 0.22, 0.56, 16]} />
        <meshStandardMaterial color={color || '#f1f5f9'} roughness={0.2} />
      </mesh>
      {/* Toprak */}
      <mesh position={[0, 0.54, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* Büyük Yapraklı Bitki Gövdesi */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* 5 adet büyük monstera benzeri yaprak (box) */}
      {[0, (2 * Math.PI) / 5, (4 * Math.PI) / 5, (6 * Math.PI) / 5, (8 * Math.PI) / 5].map((angle, idx) => (
        <group key={idx} rotation={[0, angle, 0]} position={[0, 0.75, 0]}>
          <mesh castShadow position={[0.18, 0.18, 0]} rotation={[0.4, 0, -0.4]}>
            <boxGeometry args={[0.34, 0.02, 0.24]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ArchiveBoxModel({ color }) {
  return (
    <group>
      {/* Sandık/Karton Gövde */}
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.62, 0.44, 0.44]} />
        <meshStandardMaterial color={color || '#d97706'} roughness={0.9} />
      </mesh>
      {/* Sandık Kapağı */}
      <mesh castShadow position={[0, 0.44, 0]}>
        <boxGeometry args={[0.64, 0.05, 0.46]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      {/* Yan Tutma Boşluğu Detayı Sol */}
      <mesh position={[0.311, 0.26, 0]}>
        <boxGeometry args={[0.002, 0.05, 0.12]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
    </group>
  );
}

function BedModel({ color }) {
  return (
    <group>
      {/* Karyola Kasa */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.05, 0.28, 2.05]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Yatak Başlığı */}
      <mesh castShadow position={[0, 0.45, -0.98]}>
        <boxGeometry args={[1.05, 0.7, 0.08]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Çarşaf/Nevresim */}
      <mesh castShadow position={[0, 0.19, 0.2]}>
        <boxGeometry args={[1.03, 0.22, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Yastık */}
      <mesh castShadow position={[0, 0.32, -0.72]}>
        <boxGeometry args={[0.7, 0.08, 0.36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Ayaklar */}
      <mesh castShadow position={[-0.48, 0.04, -0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.48, 0.04, -0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.48, 0.04, 0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.48, 0.04, 0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
    </group>
  );
}

function DoubleBedModel({ color }) {
  return (
    <group>
      {/* Karyola Kasa */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.65, 0.28, 2.05]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Yatak Başlığı */}
      <mesh castShadow position={[0, 0.45, -0.98]}>
        <boxGeometry args={[1.65, 0.7, 0.08]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Çarşaf/Nevresim */}
      <mesh castShadow position={[0, 0.19, 0.2]}>
        <boxGeometry args={[1.63, 0.22, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Sol Yastık */}
      <mesh castShadow position={[-0.38, 0.32, -0.72]}>
        <boxGeometry args={[0.55, 0.08, 0.36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Sağ Yastık */}
      <mesh castShadow position={[0.38, 0.32, -0.72]}>
        <boxGeometry args={[0.55, 0.08, 0.36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Ayaklar */}
      <mesh castShadow position={[-0.78, 0.04, -0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.78, 0.04, -0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.78, 0.04, 0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.78, 0.04, 0.98]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
    </group>
  );
}

function NightstandModel({ color }) {
  return (
    <group>
      {/* Gövde */}
      <mesh castShadow receiveShadow position={[0, 0.23, 0]}>
        <boxGeometry args={[0.5, 0.44, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Üst Çekmece */}
      <mesh castShadow position={[0, 0.32, 0.215]}>
        <boxGeometry args={[0.42, 0.16, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Alt Çekmece */}
      <mesh castShadow position={[0, 0.12, 0.215]}>
        <boxGeometry args={[0.42, 0.16, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Kulp Üst */}
      <mesh castShadow position={[0, 0.32, 0.235]}>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Kulp Alt */}
      <mesh castShadow position={[0, 0.12, 0.235]}>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function WardrobeModel({ color }) {
  return (
    <group>
      {/* Ana Gövde */}
      <mesh castShadow receiveShadow position={[0, 0.975, 0]}>
        <boxGeometry args={[1.25, 1.9, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Sol Kapak */}
      <mesh castShadow position={[-0.3, 0.975, 0.305]}>
        <boxGeometry args={[0.56, 1.8, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Sağ Kapak */}
      <mesh castShadow position={[0.3, 0.975, 0.305]}>
        <boxGeometry args={[0.56, 1.8, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Dikey Sol Kulp */}
      <mesh castShadow position={[-0.04, 0.975, 0.32]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Dikey Sağ Kulp */}
      <mesh castShadow position={[0.04, 0.975, 0.32]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function SinkModel({ color }) {
  return (
    <group>
      {/* Alt Altlık / Dolap */}
      <mesh castShadow receiveShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[0.56, 0.72, 0.48]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Lavabo Haznesi (Porselen) */}
      <mesh castShadow position={[0, 0.77, 0]}>
        <boxGeometry args={[0.62, 0.12, 0.52]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      {/* İç Havuz Overlay */}
      <mesh position={[0, 0.825, 0.02]}>
        <boxGeometry args={[0.48, 0.01, 0.36]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.6} />
      </mesh>
      {/* Batarya / Musluk */}
      <mesh castShadow position={[0, 0.88, -0.18]}>
        <boxGeometry args={[0.04, 0.12, 0.04]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh castShadow position={[0, 0.94, -0.14]}>
        <boxGeometry args={[0.04, 0.03, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function ToiletModel({ color }) {
  return (
    <group>
      {/* Klozet Ayağı ve Gövde */}
      <mesh castShadow position={[0, 0.2, 0.1]}>
        <cylinderGeometry args={[0.16, 0.14, 0.4, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      {/* Oturak Kapağı */}
      <mesh castShadow position={[0, 0.41, 0.08]}>
        <boxGeometry args={[0.36, 0.03, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Rezervuar */}
      <mesh castShadow position={[0, 0.58, -0.16]}>
        <boxGeometry args={[0.38, 0.34, 0.18]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      {/* Rezervuar Butonu */}
      <mesh castShadow position={[0, 0.755, -0.16]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function ShowerModel({ color }) {
  return (
    <group>
      {/* Duş Teknesi */}
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[0.96, 0.08, 0.96]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
      </mesh>
      {/* Arka Duvar Paneli */}
      <mesh castShadow position={[-0.47, 1.0, 0]}>
        <boxGeometry args={[0.02, 1.84, 0.94]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 1.0, -0.47]}>
        <boxGeometry args={[0.94, 1.84, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Ön Cam Kapı */}
      <mesh position={[0.47, 1.0, 0]}>
        <boxGeometry args={[0.01, 1.84, 0.94]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.0, 0.47]}>
        <boxGeometry args={[0.94, 1.84, 0.01]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      {/* Duş Başlığı Borusu */}
      <mesh position={[-0.4, 1.5, -0.4]}>
        <cylinderGeometry args={[0.01, 0.01, 0.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[-0.32, 1.9, -0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
    </group>
  );
}

function BathtubModel({ color }) {
  return (
    <group>
      {/* Küvet Gövde */}
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.8, 0.56, 1.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      {/* İç Dolgu Su Görünümü */}
      <mesh position={[0, 0.52, 0.02]}>
        <boxGeometry args={[0.68, 0.01, 1.48]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
      </mesh>
      {/* Batarya ve El Duşu */}
      <mesh castShadow position={[0, 0.62, -0.74]}>
        <boxGeometry args={[0.04, 0.12, 0.04]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh castShadow position={[0, 0.68, -0.7]}>
        <boxGeometry args={[0.04, 0.03, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Banyo Perdesi Tutucu Direkler veya Oval Şerit */}
      <mesh castShadow position={[0, 0.28, 0.76]}>
        <boxGeometry args={[0.84, 0.58, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

function BathroomCabinetModel({ color }) {
  return (
    <group>
      {/* Alt Lavabo Dolabı */}
      <mesh castShadow receiveShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[0.6, 0.72, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Mermer/Porselen Tabla */}
      <mesh castShadow position={[0, 0.74, 0]}>
        <boxGeometry args={[0.62, 0.04, 0.42]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      {/* Ayna Bölmesi */}
      <mesh castShadow position={[0, 1.25, -0.16]}>
        <boxGeometry args={[0.52, 0.68, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Ayna Camı */}
      <mesh position={[0, 1.25, -0.135]}>
        <boxGeometry args={[0.46, 0.62, 0.01]} />
        <meshStandardMaterial color="#eaeef2" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Üst Spot Lambalık / Raf */}
      <mesh castShadow position={[0, 1.62, -0.08]}>
        <boxGeometry args={[0.6, 0.06, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function MirrorModel({ color }) {
  return (
    <group>
      {/* Ahşap/Metal Arka Çerçeve */}
      <mesh castShadow position={[0, 0, -0.015]}>
        <boxGeometry args={[0.56, 0.76, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Ayna Cam Yüzeyi */}
      <mesh position={[0, 0, 0.001]}>
        <boxGeometry args={[0.52, 0.72, 0.01]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
  );
}

function TowelRackModel({ color }) {
  return (
    <group>
      {/* Duvar Askı Demiri */}
      <mesh castShadow position={[0, 0, -0.06]}>
        <boxGeometry args={[0.56, 0.03, 0.03]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[-0.26, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.26, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      {/* Asılı Havlular */}
      <mesh castShadow position={[-0.12, -0.18, 0]}>
        <boxGeometry args={[0.16, 0.32, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.12, -0.18, -0.02]}>
        <boxGeometry args={[0.16, 0.32, 0.06]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
    </group>
  );
}

function LaundryBasketModel({ color }) {
  return (
    <group>
      {/* Sepet Gövde */}
      <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.64, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Sepet Kapağı */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.03, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      {/* Tutma Kulpu */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[0.08, 0.03, 0.03]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// --- Ana PlacedItem3D Bileşeni ---

export default function PlacedItem3D({
  item,
  isSelected,
  isFlashed,
  isAddMode,
  isItemEditingActive,
  isItemMovingActive,
  onSelect,
  onStartEdit,
  onUpdate,
  onOpenNote,
  isCrosshairHovered = false,
  onOpenBookNote,
  isConnected = false,
  cameraMode = 'third-person',
  movementMode = 'walk',
  connectionGlowActive = true,
  placedItems = [],
  lang = 'tr'
}) {
  const dragRef = useRef({ isDragging: false, pointerId: null, startPosition: [0, 0, 0], dragged: false, timer: null, progressInterval: null });
  const helperMeshRef = useRef();
  const iconRef = useRef();
  const itemGroupRef = useRef();
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isColliding, setIsColliding] = useState(false);

  useFrame((state) => {
    if (dragRef.current.isDragging && itemGroupRef.current) {
      // 1. Ray'i kameradan imleç konumuna göre güncelle
      state.raycaster.setFromCamera(state.pointer, state.camera);
      
      // 2. Sahnedeki nesnelerle kesişimi bul (kendimizi ve yardımcı nesneleri hariç tutarak)
      const intersects = state.raycaster.intersectObjects(state.scene.children, true);
      
      const maxDistance = 3.2; // Kontrollü ve yakın taşıma mesafesi (3.2 metre)
      let targetPos = new THREE.Vector3();
      let foundSurface = false;

      for (let hit of intersects) {
        // Kendimiz veya alt meshlerimiz mi?
        if (itemGroupRef.current && (hit.object === itemGroupRef.current || isDescendantOf(hit.object, itemGroupRef.current))) {
          continue;
        }
        // Helper çizgileri veya selection box'ları mı?
        if (hit.object.name === 'helper-bounds' || hit.object.name === 'selection-helper' || hit.object.name?.includes('helper')) {
          continue;
        }
        targetPos.copy(hit.point);
        foundSurface = true;
        break;
      }

      // Yüzey bulunamadıysa veya oyuncudan çok uzaktaysa bakış doğrultusunda konumlandır
      const distToCamera = state.camera.position.distanceTo(targetPos);
      if (!foundSurface || distToCamera > maxDistance) {
        targetPos.copy(state.camera.position).addScaledVector(state.raycaster.ray.direction, maxDistance);
      }

      // 3. Konum Limitleri & Clamp (Zemin altına inmesin, tavanı aşmasın, oda sınırlarında kalsın)
      const roomId = getRoomIdFromPosition(targetPos.x, targetPos.z);
      const limits = ROOM_LIMITS[roomId] || ROOM_LIMITS.unknown;
      
      const clampedX = THREE.MathUtils.clamp(targetPos.x, limits.minX, limits.maxX);
      const clampedZ = THREE.MathUtils.clamp(targetPos.z, limits.minZ, limits.maxZ);
      const clampedY = Math.max(0.005, Math.min(3.8, targetPos.y));

      itemGroupRef.current.position.set(clampedX, clampedY, clampedZ);
      dragRef.current.dragged = true;

      // 4. Çakışma Kontrolü (Simülasyon)
      const simulatedItem = {
        ...item,
        position: { x: clampedX, y: clampedY, z: clampedZ }
      };

      const hasCollision = placedItems.some(otherItem => {
        if (otherItem.id === item.id) return false;
        return checkItemsCollide(simulatedItem, otherItem);
      });

      setIsColliding(hasCollision);
    }

    if (helperMeshRef.current) {
      const isGlowActive = isConnected && connectionGlowActive && (movementMode === 'fly' || cameraMode === 'birds-eye' || cameraMode === 'free');
      if (isColliding) {
        // Çakışma durumunda dikkat çekici kırmızı pulse efekti
        const pulse = 0.65 + Math.sin(state.clock.getElapsedTime() * 12.0) * 0.2;
        helperMeshRef.current.material.opacity = pulse;
        helperMeshRef.current.material.color.set('#f43f5e');
      } else if (isGlowActive) {
        const time = state.clock.getElapsedTime();
        const pulse = 0.2 + Math.sin(time * 2.0) * 0.15;
        helperMeshRef.current.material.opacity = pulse;
        helperMeshRef.current.material.color.set('#00f0ff');
      } else if (isFlashed) {
        const pulse = 0.25 + 0.75 * Math.abs(Math.sin(state.clock.getElapsedTime() * 14));
        helperMeshRef.current.material.opacity = pulse;
        helperMeshRef.current.material.color.set('#f43f5e');
      } else if (isSelected) {
        helperMeshRef.current.material.opacity = 0.7;
        helperMeshRef.current.material.color.set(isItemMovingActive || isItemEditingActive ? '#fbbf24' : '#10b981');
      } else if (isCrosshairHovered) {
        helperMeshRef.current.material.opacity = 0.25;
        helperMeshRef.current.material.color.set('#00f0ff');
      } else {
        helperMeshRef.current.material.opacity = 0;
      }
    }
    if (iconRef.current) {
      iconRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  // Raycast düzlemi (y=0 yatay zemin düzlemi)
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionVec = useMemo(() => new THREE.Vector3(), []);

  const clearLongPress = () => {
    if (dragRef.current.timer) {
      clearTimeout(dragRef.current.timer);
      dragRef.current.timer = null;
    }
    if (dragRef.current.progressInterval) {
      clearInterval(dragRef.current.progressInterval);
      dragRef.current.progressInterval = null;
    }
    setLongPressProgress(0);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (isAddMode) return;
    
    onSelect(item.id);

    const pos = item.position || { x: 0, y: 0, z: 0 };
    const posArray = [pos.x ?? 0, pos.y ?? 0, pos.z ?? 0];
    const isThisItemMoving = isItemMovingActive && isSelected;

    // Normal varsayılan Y konumu hesapla
    const defaultY = (item.type === 'wallshelf' || item.type === 'small_wallshelf' || item.type === 'large_board' || item.type === 'mirror') 
      ? 1.4 
      : item.type === 'towel_rack'
        ? 1.2
        : item.type === 'desk_lamp' 
          ? 0.72 
          : item.type === 'rug' 
            ? 0.001 
            : 0.005;

    dragRef.current = {
      isDragging: isThisItemMoving,
      pointerId: e.pointerId,
      startPosition: [...posArray],
      startY: e.clientY,
      startYCoord: pos.y ?? defaultY,
      dragged: false
    };

    if (isThisItemMoving) {
      window.isDraggingPlacedItem = true;
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
    } else {
      dragRef.current.timer = setTimeout(() => {
        clearLongPress();
        onStartEdit(item.id);
      }, 3000);

      let elapsed = 0;
      dragRef.current.progressInterval = setInterval(() => {
        elapsed += 100;
        const progress = Math.min(1, elapsed / 3000);
        setLongPressProgress(progress);
        if (progress >= 1) {
          clearInterval(dragRef.current.progressInterval);
        }
      }, 100);
    }
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) {
      if (dragRef.current.timer) {
        e.ray.intersectPlane(floorPlane, intersectionVec);
        const dx = intersectionVec.x - dragRef.current.startPosition[0];
        const dz = intersectionVec.z - dragRef.current.startPosition[2];
        if (Math.sqrt(dx * dx + dz * dz) > 0.3) {
          clearLongPress();
        }
      }
      return;
    }
    e.stopPropagation();
  };

  const handlePointerUp = (e) => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      window.isDraggingPlacedItem = false;
      try {
        e.target.releasePointerCapture(dragRef.current.pointerId);
      } catch {}

      if (dragRef.current.dragged && itemGroupRef.current) {
        if (isColliding) {
          // Çakışma var! Eski geçerli konumuna sıfırla
          const [oldX, oldY, oldZ] = dragRef.current.startPosition;
          itemGroupRef.current.position.set(oldX, oldY, oldZ);
          setIsColliding(false);
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: lang === 'en' ? '⚠️ Cannot place here (Collision)' : '⚠️ Bu konuma yerleştirilemez (Çakışma var)' 
          }));
        } else {
          // Çakışma yok, konumu güncelle
          const newX = itemGroupRef.current.position.x;
          const newY = itemGroupRef.current.position.y;
          const newZ = itemGroupRef.current.position.z;
          onUpdate(item.id, { position: { x: newX, y: newY, z: newZ } });
        }
      }
    }
    clearLongPress();
  };

  const handlePointerLeave = () => {
    clearLongPress();
  };

  const renderModel = () => {
    switch (item.type) {
      case 'desk':
        return <DeskModel color={item.color} />;
      case 'chair':
        return <ChairModel color={item.color} />;
      case 'shelf':
        return <ShelfModel color={item.color} />;
      case 'wallshelf':
        return <WallShelfModel color={item.color} />;
      case 'plant':
        return <PlantModel color={item.color} />;
      case 'lamp':
        return <LampModel color={item.color} />;
      case 'rug':
        return <RugModel color={item.color} />;
      case 'pc':
        return <PCModel />;
      case 'box':
        return <BoxModel color={item.color} />;
      case 'board':
        return <BoardModel color={item.color} />;
      // Yeni Eşyalar
      case 'large_desk':
        return <LargeDeskModel color={item.color} />;
      case 'meeting_table':
        return <MeetingTableModel color={item.color} />;
      case 'l_desk':
        return <LDeskModel color={item.color} />;
      case 'round_table':
        return <RoundTableModel color={item.color} />;
      case 'large_bookshelf':
        return <LargeBookshelfModel color={item.color} />;
      case 'libraryShelf':
        return (
          <LibraryShelfModel
            color={item.color}
            books={item.books}
            onOpenBookNote={(bookId) => {
              if (onOpenBookNote) onOpenBookNote(item.id, bookId);
            }}
          />
        );
      case 'largeLibraryShelf':
        return (
          <LargeLibraryShelfModel
            color={item.color}
            books={item.books}
            onOpenBookNote={(bookId) => {
              if (onOpenBookNote) onOpenBookNote(item.id, bookId);
            }}
          />
        );
      case 'low_bookshelf':
        return <LowBookshelfModel color={item.color} />;
      case 'file_cabinet':
        return <FileCabinetModel color={item.color} />;
      case 'drawer_cabinet':
        return <DrawerCabinetModel color={item.color} />;
      case 'large_board':
        return <LargeBoardModel color={item.color} />;
      case 'whiteboard':
        return <WhiteboardModel />;
      case 'office_chair':
        return <OfficeChairModel color={item.color} />;
      case 'guest_chair':
        return <GuestChairModel color={item.color} />;
      case 'stool':
        return <StoolModel color={item.color} />;
      case 'side_table':
        return <SideTableModel color={item.color} />;
      case 'large_rack':
        return <LargeRackModel color={item.color} />;
      case 'small_wallshelf':
        return <SmallWallShelfModel color={item.color} />;
      case 'floor_lamp':
        return <FloorLampModel color={item.color} />;
      case 'desk_lamp':
        return <DeskLampModel color={item.color} />;
      case 'large_plant':
        return <LargePlantModel color={item.color} />;
      case 'archive_box':
        return <ArchiveBoxModel color={item.color} />;
      case 'bed':
        return <BedModel color={item.color} />;
      case 'double_bed':
        return <DoubleBedModel color={item.color} />;
      case 'nightstand':
        return <NightstandModel color={item.color} />;
      case 'wardrobe':
        return <WardrobeModel color={item.color} />;
      case 'sink':
        return <SinkModel color={item.color} />;
      case 'toilet':
        return <ToiletModel color={item.color} />;
      case 'shower':
        return <ShowerModel color={item.color} />;
      case 'bathtub':
        return <BathtubModel color={item.color} />;
      case 'bathroom_cabinet':
        return <BathroomCabinetModel color={item.color} />;
      case 'mirror':
        return <MirrorModel color={item.color} />;
      case 'towel_rack':
        return <TowelRackModel color={item.color} />;
      case 'laundry_basket':
        return <LaundryBasketModel color={item.color} />;
      case 'customVisualBox':
        return (
          <CustomVisualBoxModel
            color={item.color}
            boxWidth={item.boxWidth}
            boxHeight={item.boxHeight}
            boxDepth={item.boxDepth}
            radius={item.radius}
            imageData={item.imageData}
            imageFace={item.imageFace}
            imageFit={item.imageFit}
            geometryType={item.geometryType}
          />
        );
      default:
        return null;
    }
  };

  const helperBounds = useMemo(() => {
    switch (item.type) {
      case 'desk':
        return [1.7, 0.8, 0.9];
      case 'chair':
        return [0.55, 1.05, 0.55];
      case 'shelf':
        return [1.1, 1.9, 0.45];
      case 'wallshelf':
        return [1.3, 0.3, 0.35];
      case 'plant':
        return [0.45, 0.85, 0.45];
      case 'lamp':
        return [0.6, 1.9, 0.6];
      case 'rug':
        return [2.5, 0.02, 1.9];
      case 'pc':
        return [0.46, 0.3, 0.34];
      case 'box':
        return [0.56, 0.56, 0.56];
      case 'board':
        return [1.6, 1.8, 0.45];
      // Yeni Eşyalar
      case 'large_desk':
        return [2.3, 0.82, 1.1];
      case 'meeting_table':
        return [3.3, 0.9, 1.5];
      case 'l_desk':
        return [1.9, 0.8, 1.7];
      case 'round_table':
        return [1.5, 0.8, 1.5];
      case 'large_bookshelf':
        return [1.9, 2.1, 0.45];
      case 'libraryShelf':
        return [3.92, 2.2, 0.38];
      case 'largeLibraryShelf':
        return [4.4, 2.2, 0.38];
      case 'low_bookshelf':
        return [1.7, 1.0, 0.5];
      case 'file_cabinet':
        return [0.7, 1.6, 0.7];
      case 'drawer_cabinet':
        return [0.9, 1.0, 0.6];
      case 'large_board':
        return [2.5, 1.4, 0.15];
      case 'whiteboard':
        return [1.5, 1.8, 0.6];
      case 'office_chair':
        return [0.6, 1.25, 0.6];
      case 'guest_chair':
        return [0.55, 1.1, 0.55];
      case 'stool':
        return [0.45, 0.55, 0.45];
      case 'side_table':
        return [0.6, 0.6, 0.6];
      case 'large_rack':
        return [1.7, 1.9, 0.55];
      case 'small_wallshelf':
        return [0.8, 0.4, 0.3];
      case 'floor_lamp':
        return [0.7, 1.9, 0.7];
      case 'desk_lamp':
        return [0.25, 0.48, 0.25];
      case 'large_plant':
        return [0.8, 1.2, 0.8];
      case 'archive_box':
        return [0.7, 0.55, 0.52];
      case 'bed':
        return [1.1, 0.8, 2.1];
      case 'double_bed':
        return [1.7, 0.8, 2.1];
      case 'nightstand':
        return [0.55, 0.55, 0.5];
      case 'wardrobe':
        return [1.3, 2.0, 0.65];
      case 'sink':
        return [0.65, 0.85, 0.55];
      case 'toilet':
        return [0.45, 0.75, 0.65];
      case 'shower':
        return [1.0, 2.0, 1.0];
      case 'bathtub':
        return [0.85, 0.65, 1.7];
      case 'bathroom_cabinet':
        return [0.65, 1.8, 0.45];
      case 'mirror':
        return [0.6, 0.8, 0.05];
      case 'towel_rack':
        return [0.6, 0.2, 0.15];
      case 'laundry_basket':
        return [0.5, 0.7, 0.5];
      case 'customVisualBox': {
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
      default:
        return [1, 1, 1];
    }
  }, [item.type]);

  const pos = item.position || { x: 0, y: 0, z: 0 };
  const rot = item.rotation || { x: 0, y: 0, z: 0 };
  const posArray = [pos.x ?? 0, pos.y ?? 0, pos.z ?? 0];
  const rotArray = [rot.x ?? 0, rot.y ?? 0, rot.z ?? 0];

  const itemScale = item.scale || [1, 1, 1];
  const itemScaleVal = itemScale[0] || 1;
  const iconSize = Math.max(0.25, Math.min(0.8, itemScaleVal * 0.4));
  const iconY = helperBounds[1] * itemScaleVal + 0.3;

  const iconText = useMemo(() => {
    if (!item.linkedNote) return 'i';
    const type = item.linkedNote.iconType;
    if (type === 'question') return '?';
    if (type === 'exclamation') return '!';
    return 'i';
  }, [item.linkedNote]);

  const isDotIcon = item.linkedNote?.iconType === 'dot';

  return (
    <group>
      <group
        ref={itemGroupRef}
        name={`item_mesh_${item.id}`}
        position={posArray}
        rotation={rotArray}
        scale={itemScale}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {renderModel()}
        {(isSelected || isFlashed || isCrosshairHovered || (isConnected && connectionGlowActive && (movementMode === 'fly' || cameraMode === 'birds-eye' || cameraMode === 'free'))) && (() => {
          const isGlowActive = isConnected && connectionGlowActive && (movementMode === 'fly' || cameraMode === 'birds-eye' || cameraMode === 'free');
          return (
            <mesh 
              ref={helperMeshRef} 
              position={[0, helperBounds[1] / 2, 0]}
              renderOrder={isGlowActive ? 999 : undefined}
              data-testid="item-helper-mesh"
            >
              <boxGeometry args={helperBounds} />
              <meshBasicMaterial 
                transparent 
                opacity={0} 
                depthTest={isGlowActive ? false : true} 
              />
              <Edges
                color={isGlowActive ? '#00f0ff' : (isFlashed ? '#f43f5e' : (isSelected ? (isItemMovingActive || isItemEditingActive ? '#fbbf24' : '#10b981') : '#00f0ff'))}
                lineWidth={2.5}
                toneMapped={false}
              />
            </mesh>
          );
        })()}
      </group>

      {longPressProgress > 0 && (
        <Html position={[posArray[0], posArray[1] + helperBounds[1] * itemScaleVal + 0.4, posArray[2]]} center>
          <div style={{
            width: '100px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            padding: '6px',
            borderRadius: '6px',
            color: '#00f0ff',
            fontSize: '11px',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Düzenle (3s)</div>
            <div style={{
              width: '100%',
              height: '5px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${longPressProgress * 100}%`,
                height: '100%',
                background: '#00f0ff',
                transition: 'width 0.1s linear'
              }} />
            </div>
          </div>
        </Html>
      )}

      {item.linkedNote && isNoteNotEmpty(item.linkedNote) && !item.linkedNote.hidden && (
        <group 
          ref={iconRef}
          position={[posArray[0], posArray[1] + iconY, posArray[2]]}
        >
          <mesh onPointerDown={(e) => e.stopPropagation()}>
            <sphereGeometry args={[isDotIcon ? 0.08 : 0.07, 8, 8]} />
            <meshBasicMaterial 
              color="#00f0ff" 
              transparent 
              opacity={isDotIcon ? 0.8 : 0.3} 
              toneMapped={false} 
            />
          </mesh>
          
          {!isDotIcon ? (
            <Text
              fontSize={iconSize}
              color="#00f0ff"
              anchorX="center"
              anchorY="middle"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenNote();
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'default';
              }}
              toneMapped={false}
            >
              {iconText}
            </Text>
          ) : (
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onOpenNote();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'default';
              }}
              visible={false}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

useGLTF.preload('/models/kitaplik_modeli.gltf');

function adjustTextureFit(tex, fit, face, boxW, boxH, boxD, radius, geom) {
  if (!tex || !tex.image) return;
  
  const imgW = tex.image.width;
  const imgH = tex.image.height;
  if (!imgW || !imgH) return;
  
  let faceW = boxW || 1;
  let faceH = boxH || 1;
  
  if (geom === 'sphere') {
    const r = radius || 0.5;
    faceW = r * Math.PI * 2;
    faceH = r * Math.PI;
  } else if (geom === 'cylinder' || geom === 'cone' || geom === 'pyramid' || geom === 'prism' || geom === 'capsule') {
    const r = radius || 0.5;
    if (face === 'top' || face === 'bottom') {
      faceW = r * 2;
      faceH = r * 2;
    } else {
      faceW = r * Math.PI * 2;
      faceH = boxH || 1;
    }
  } else {
    if (face === 'top' || face === 'bottom') {
      faceW = boxW || 1;
      faceH = boxD || 0.1;
    } else if (face === 'left' || face === 'right') {
      faceW = boxD || 0.1;
      faceH = boxH || 1;
    } else {
      faceW = boxW || 1;
      faceH = boxH || 1;
    }
  }
  
  const faceAspect = faceW / faceH;
  const imgAspect = imgW / imgH;
  
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  
  if (fit === 'stretch') {
    tex.repeat.set(1, 1);
    tex.offset.set(0, 0);
  } else if (fit === 'contain') {
    if (imgAspect > faceAspect) {
      const scale = imgAspect / faceAspect;
      tex.repeat.set(1, scale);
      tex.offset.set(0, (1 - scale) / 2);
    } else {
      const scale = faceAspect / imgAspect;
      tex.repeat.set(scale, 1);
      tex.offset.set((1 - scale) / 2, 0);
    }
  } else if (fit === 'cover') {
    if (imgAspect > faceAspect) {
      const scale = faceAspect / imgAspect;
      tex.repeat.set(scale, 1);
      tex.offset.set((1 - scale) / 2, 0);
    } else {
      const scale = imgAspect / faceAspect;
      tex.repeat.set(1, scale);
      tex.offset.set(0, (1 - scale) / 2);
    }
  }
  tex.needsUpdate = true;
}

function CustomVisualBoxModel({ color, boxWidth, boxHeight, boxDepth, radius, imageData, imageFace, imageFit, geometryType }) {
  const geom = geometryType || 'box';
  const w = boxWidth || 1.0;
  const h = boxHeight || 1.0;
  const d = boxDepth || 0.1;
  const r = radius || 0.5;
  const face = imageFace || 'front';
  const fit = imageFit || 'contain';

  const [texture, setTexture] = useState(null);
  const materialsRef = useRef(null);

  useEffect(() => {
    if (!imageData) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    let isMounted = true;
    let loadedTex = null;
    loader.load(
      imageData,
      (tex) => {
        if (isMounted) {
          adjustTextureFit(tex, fit, face, w, h, d, r, geom);
          loadedTex = tex;
          setTexture(tex);
        } else {
          tex.dispose();
        }
      },
      undefined,
      (err) => {
        console.warn("Görsel yüklenirken hata oluştu:", err);
        if (isMounted) setTexture(null);
      }
    );
    return () => {
      isMounted = false;
      if (loadedTex) {
        loadedTex.dispose();
      }
    };
  }, [imageData, fit, face, w, h, d, r, geom]);

  const disposeMaterials = (mats) => {
    if (!mats) return;
    if (Array.isArray(mats)) {
      mats.forEach((m) => {
        if (m && typeof m.dispose === 'function') m.dispose();
      });
    } else {
      if (mats && typeof mats.dispose === 'function') mats.dispose();
    }
  };

  const materials = useMemo(() => {
    const baseMat = new THREE.MeshStandardMaterial({ color: color || '#818cf8', roughness: 0.7 });
    
    if (materialsRef.current) {
      disposeMaterials(materialsRef.current);
    }

    if (!texture) {
      materialsRef.current = baseMat;
      return baseMat;
    }

    const texMat = new THREE.MeshStandardMaterial({
      map: texture,
      color: color || '#818cf8',
      roughness: 0.5,
      metalness: 0.1
    });

    let newMats;
    if (geom === 'box' || geom === 'cube') {
      const mats = [baseMat, baseMat, baseMat, baseMat, baseMat, baseMat];
      if (face === 'all') {
        newMats = [texMat, texMat, texMat, texMat, texMat, texMat];
      } else {
        if (face === 'right') mats[0] = texMat;
        if (face === 'left') mats[1] = texMat;
        if (face === 'top') mats[2] = texMat;
        if (face === 'bottom') mats[3] = texMat;
        if (face === 'front') mats[4] = texMat;
        if (face === 'back') mats[5] = texMat;
        newMats = mats;
      }
    } else if (geom === 'cylinder' || geom === 'cone' || geom === 'pyramid' || geom === 'prism') {
      const mats = [baseMat, baseMat, baseMat];
      if (face === 'all') {
        newMats = [texMat, texMat, texMat];
      } else {
        if (face === 'top') mats[1] = texMat;
        if (face === 'bottom') mats[2] = texMat;
        if (face === 'front' || face === 'back' || face === 'left' || face === 'right') mats[0] = texMat;
        newMats = mats;
      }
    } else {
      newMats = texMat;
    }

    materialsRef.current = newMats;
    return newMats;
  }, [color, texture, face, geom]);

  useEffect(() => {
    return () => {
      if (materialsRef.current) {
        disposeMaterials(materialsRef.current);
      }
    };
  }, []);

  const renderGeometry = () => {
    switch (geom) {
      case 'cube':
        return (
          <mesh position={[0, w / 2, 0]} material={materials} castShadow receiveShadow>
            <boxGeometry args={[w, w, w]} />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh position={[0, h / 2, 0]} material={materials} castShadow receiveShadow>
            <cylinderGeometry args={[r, r, h, 32]} />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh position={[0, r, 0]} material={materials} castShadow receiveShadow>
            <sphereGeometry args={[r, 32, 32]} />
          </mesh>
        );
      case 'cone':
        return (
          <mesh position={[0, h / 2, 0]} material={materials} castShadow receiveShadow>
            <coneGeometry args={[r, h, 32]} />
          </mesh>
        );
      case 'pyramid':
        return (
          <mesh position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]} material={materials} castShadow receiveShadow>
            <coneGeometry args={[r, h, 4]} />
          </mesh>
        );
      case 'capsule':
        return (
          <mesh position={[0, h / 2, 0]} material={materials} castShadow receiveShadow>
            <capsuleGeometry args={[r, Math.max(0.1, h - 2 * r), 8, 16]} />
          </mesh>
        );
      case 'prism':
        return (
          <mesh position={[0, h / 2, 0]} rotation={[0, Math.PI / 6, 0]} material={materials} castShadow receiveShadow>
            <cylinderGeometry args={[r, r, h, 3]} />
          </mesh>
        );
      case 'box':
      default:
        return (
          <mesh position={[0, h / 2, 0]} material={materials} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        );
    }
  };

  return renderGeometry();
}
