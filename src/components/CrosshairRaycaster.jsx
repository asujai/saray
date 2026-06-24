import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CrosshairRaycaster({ cameraMode, isBlocked, onHoverChange }) {
  const { camera, raycaster, scene } = useThree();

  // Merkez koordinatı {x: 0, y: 0}
  const centerCoords = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    if (cameraMode !== 'free' || isBlocked) {
      onHoverChange(null);
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

    onHoverChange(found);
  });

  return null;
}
