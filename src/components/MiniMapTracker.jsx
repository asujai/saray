import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MiniMapTracker() {
  const dir = new THREE.Vector3();

  useFrame(({ camera }) => {
    const indicator = document.getElementById('minimap-player-indicator');
    if (!indicator) return;

    const x = camera.position.x;
    const z = camera.position.z;

    // 50x50 alanı (x: [-25, 25], z: [-25, 25]) SVG 100x100 viewBox'a eşle
    // mapX = (x + 25) / 50 * 100
    // mapY = (z + 25) / 50 * 100
    const mapX = ((x + 25) / 50) * 100;
    const mapY = ((z + 25) / 50) * 100;

    // Kamera yönünü (yaw) radyan cinsinden al
    camera.getWorldDirection(dir);
    const angle = Math.atan2(-dir.x, -dir.z); // yaw angle
    const angleDeg = (angle * 180) / Math.PI;

    // DOM elementini doğrudan güncelle
    indicator.setAttribute(
      'transform',
      `translate(${mapX.toFixed(2)}, ${mapY.toFixed(2)}) rotate(${angleDeg.toFixed(1)})`
    );
  });

  return null;
}
