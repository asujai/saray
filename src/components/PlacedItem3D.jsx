import React, { useRef, useMemo, useState } from 'react';
import { Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function isNoteNotEmpty(linkedNote) {
  if (!linkedNote) return false;
  if (!linkedNote.pages || !Array.isArray(linkedNote.pages)) return false;
  return linkedNote.pages.some(page => (page.text && page.text.trim()) || page.image);
}

const ROOM_LIMITS = {
  hall: { minX: -4.5, maxX: 4.5, minZ: -24.5, maxZ: 24.5 },
  bedroom: { minX: -24.5, maxX: -5.5, minZ: 0.5, maxZ: 24.5 },
  kitchen: { minX: -24.5, maxX: -5.5, minZ: -24.5, maxZ: -0.5 },
  study: { minX: 5.5, maxX: 24.5, minZ: 0.5, maxZ: 24.5 },
  living: { minX: 5.5, maxX: 24.5, minZ: -24.5, maxZ: -0.5 },
  unknown: { minX: -24.5, maxX: 24.5, minZ: -24.5, maxZ: 24.5 }
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

// --- Ana PlacedItem3D Bileşeni ---

export default function PlacedItem3D({
  item,
  isSelected,
  isFlashed,
  isAddMode,
  isItemEditingActive,
  onSelect,
  onStartEdit,
  onUpdate,
  onOpenNote,
  isCrosshairHovered = false
}) {
  const dragRef = useRef({ isDragging: false, pointerId: null, startPosition: [0, 0, 0], dragged: false, timer: null, progressInterval: null });
  const helperMeshRef = useRef();
  const iconRef = useRef();
  const [longPressProgress, setLongPressProgress] = useState(0);

  useFrame((state) => {
    if (helperMeshRef.current) {
      if (isFlashed) {
        const pulse = 0.25 + 0.75 * Math.abs(Math.sin(state.clock.getElapsedTime() * 14));
        helperMeshRef.current.material.opacity = pulse;
      } else if (isSelected) {
        helperMeshRef.current.material.opacity = 0.7;
      } else if (isCrosshairHovered) {
        helperMeshRef.current.material.opacity = 0.25;
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

    dragRef.current = {
      isDragging: isItemEditingActive,
      pointerId: e.pointerId,
      startPosition: [...posArray],
      dragged: false
    };

    if (!isItemEditingActive) {
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

    if (isItemEditingActive) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
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

    e.ray.intersectPlane(floorPlane, intersectionVec);

    let targetX = intersectionVec.x;
    let targetZ = intersectionVec.z;

    const limits = ROOM_LIMITS[item.roomId] || ROOM_LIMITS.unknown;
    const clampedX = Math.max(limits.minX, Math.min(limits.maxX, targetX));
    const clampedZ = Math.max(limits.minZ, Math.min(limits.maxZ, targetZ));

    const currentY = item.position?.y ?? (item.type === 'wallshelf' ? 1.4 : item.type === 'rug' ? 0.001 : 0.005);

    onUpdate(item.id, { position: { x: clampedX, y: currentY, z: clampedZ } });
  };

  const handlePointerUp = (e) => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      try {
        e.target.releasePointerCapture(dragRef.current.pointerId);
      } catch {}
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
        {(isSelected || isFlashed || isCrosshairHovered) && (
          <mesh ref={helperMeshRef} position={[0, helperBounds[1] / 2, 0]}>
            <boxGeometry args={helperBounds} />
            <meshBasicMaterial
              color="#00f0ff"
              wireframe
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>
        )}
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

      {item.linkedNote && isNoteNotEmpty(item.linkedNote) && (
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
