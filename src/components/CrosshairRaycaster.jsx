import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CrosshairRaycaster({ cameraMode, isBlocked, onHoverChange }) {
  const { camera, raycaster, scene } = useThree();

  // Merkez koordinatı {x: 0, y: 0}
  const centerCoords = useMemo(() => new THREE.Vector2(0, 0), []);

  // Bir önceki hover edilen nesneyi saklamak için ref
  const lastFoundRef = useRef(null);

  // İki hover nesnesini karşılaştıran helper fonksiyon
  const isSameHover = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.type !== b.type || a.id !== b.id) return false;
    
    // Eğer wall ise, koordinatları belirli bir tolerans sınırında karşılaştırarak re-render yükünü azalt
    if (a.type === 'wall' && b.type === 'wall') {
      const dx = Math.abs(a.point[0] - b.point[0]);
      const dy = Math.abs(a.point[1] - b.point[1]);
      const dz = Math.abs(a.point[2] - b.point[2]);
      
      const ndx = Math.abs(a.normal[0] - b.normal[0]);
      const ndy = Math.abs(a.normal[1] - b.normal[1]);
      const ndz = Math.abs(a.normal[2] - b.normal[2]);

      // Epsilon toleransı: koordinatlar için 0.05m (5 cm), normaller için 0.02
      if (dx < 0.05 && dy < 0.05 && dz < 0.05 && ndx < 0.02 && ndy < 0.02 && ndz < 0.02) {
        return true;
      }
      return false;
    }
    return true;
  };

  useFrame(() => {
    if (cameraMode !== 'free' || isBlocked) {
      if (lastFoundRef.current !== null) {
        lastFoundRef.current = null;
        onHoverChange(null);
      }
      return;
    }

    raycaster.setFromCamera(centerCoords, camera);

    // Sahnedeki nesneleri kontrol et
    const intersects = raycaster.intersectObjects(scene.children, true);

    let found = null;

    for (let i = 0; i < intersects.length; i++) {
      const hit = intersects[i];
      let obj = hit.object;

      // Nesnenin en üst name'li parent'ını bulmak veya name kontrolü
      let current = obj;
      let itemHit = null;
      let noteHit = null;
      let wallHit = null;

      while (current) {
        if (current.name) {
          if (current.name.startsWith('item_mesh_')) {
            itemHit = current.name.replace('item_mesh_', '');
            break;
          }
          if (current.name.startsWith('note_mesh_')) {
            noteHit = current.name.replace('note_mesh_', '');
            break;
          }
          if (current.name.startsWith('wall_') || current.name.startsWith('floor_')) {
            wallHit = current.name;
            break;
          }
        }
        current = current.parent;
      }

      if (itemHit) {
        found = { type: 'item', id: itemHit };
        break;
      }
      if (noteHit) {
        found = { type: 'note', id: noteHit };
        break;
      }
      if (wallHit) {
        // Duvarlar için nokta ve normal bilgisi N tuşu için çok kritik
        const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 0, 1);
        normal.transformDirection(hit.object.matrixWorld);
        found = {
          type: 'wall',
          id: wallHit,
          point: [hit.point.x, hit.point.y, hit.point.z],
          normal: [normal.x, normal.y, normal.z]
        };
        break;
      }
    }

    // Sadece nesne değiştiğinde veya pozisyon belirgin şekilde oynadığında state'i güncelle
    if (!isSameHover(found, lastFoundRef.current)) {
      lastFoundRef.current = found;
      onHoverChange(found);
    }
  });

  return null;
}
