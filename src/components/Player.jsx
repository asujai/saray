import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SPEED = 14; // Increased speed for larger room traversal
const ROOM_LIMIT = 24.5; // (50 / 2) - 0.5 boundary margin
const MIN_HEIGHT = 0.5;
const MAX_HEIGHT = 22.5; // Raised boundary to allow full overhead view of the roofless house

export default function Player({ cameraMode, activeNoteId, activeItemId, isItemEditingActive, isAddMode, isDrawing, isEditorOpen, isDashboardOpen, isItemDrawerOpen, cameraFocusRequest, hoveredNoteId, playerPositionRef, playerDirectionRef }) {
  const { camera, gl } = useThree();
  const avatarRef = useRef();

  // Yürüyüş animasyonu ve zıplama için gerekli referanslar
  const verticalVelocity = useRef(0);
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  // Create refs to prevent React stale closures in event listeners
  const isAddModeRef = useRef(isAddMode);
  const activeNoteIdRef = useRef(activeNoteId);
  const activeItemIdRef = useRef(activeItemId);
  const isItemEditingActiveRef = useRef(isItemEditingActive);
  const cameraModeRef = useRef(cameraMode);
  const isDrawingRef = useRef(isDrawing);
  const isEditorOpenRef = useRef(isEditorOpen);
  const isDashboardOpenRef = useRef(isDashboardOpen);
  const isItemDrawerOpenRef = useRef(isItemDrawerOpen);
  const hoveredNoteIdRef = useRef(hoveredNoteId);

  useEffect(() => {
    isAddModeRef.current = isAddMode;
    activeNoteIdRef.current = activeNoteId;
    activeItemIdRef.current = activeItemId;
    isItemEditingActiveRef.current = isItemEditingActive;
    cameraModeRef.current = cameraMode;
    isDrawingRef.current = isDrawing;
    isEditorOpenRef.current = isEditorOpen;
    isDashboardOpenRef.current = isDashboardOpen;
    isItemDrawerOpenRef.current = isItemDrawerOpen;
    hoveredNoteIdRef.current = hoveredNoteId;
  });

  // Track last processed focus request time to avoid looping
  const lastFocusTime = useRef(0);

  useEffect(() => {
    if (cameraFocusRequest && cameraFocusRequest.time > lastFocusTime.current) {
      lastFocusTime.current = cameraFocusRequest.time;
      
      targetPosition.current.fromArray(cameraFocusRequest.position);
      pitch.current = cameraFocusRequest.pitch;
      yaw.current = cameraFocusRequest.yaw;
    }
  }, [cameraFocusRequest]);

  useEffect(() => {
    if (!isItemDrawerOpen) {
      Object.keys(keys.current).forEach((k) => {
        keys.current[k] = false;
      });
    }
  }, [isItemDrawerOpen]);

  useEffect(() => {
    if (!isItemEditingActive) {
      Object.keys(keys.current).forEach((k) => {
        keys.current[k] = false;
      });
    }
  }, [isItemEditingActive]);

  // Track keyboard states (Added Space, Shift, and Arrow Keys)
  const keys = useRef({
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    ShiftLeft: false,
    ShiftRight: false,
  });

  // Target position and current position for smooth süzülme (lerp)
  const targetPosition = useRef(new THREE.Vector3(0, 1.6, 5));
  const currentPosition = useRef(new THREE.Vector3(0, 1.6, 5));

  // Mouse camera angles (yaw: left/right, pitch: up/down)
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isDragging = useRef(false);

  // Temp vectors
  const cameraDirection = new THREE.Vector3();
  const cameraRight = new THREE.Vector3();
  const moveVector = new THREE.Vector3();

  useEffect(() => {
    // 1. Keyboard
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'INPUT'
      ) {
        return;
      }
      
      const key = e.code;
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = true;
      }
      // Standardize Space key check
      if (e.code === 'Space') {
        keys.current.Space = true;
        // Prevent browser scrolling
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.code;
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = false;
      }
      if (e.code === 'Space') {
        keys.current.Space = false;
      }
    };

    const handleBlur = () => {
      Object.keys(keys.current).forEach((k) => {
        keys.current[k] = false;
      });
    };

    // 2. Drag to look
    const handleMouseDown = (e) => {
      if (e.target.closest('.interactive-ui')) return;
      // Do not rotate camera if in Add Mode, drawing a note, editor modal is open, item drawer is open, or birds-eye mode
      if (isAddModeRef.current || activeNoteIdRef.current || isDrawingRef.current || isEditorOpenRef.current || isDashboardOpenRef.current || isItemDrawerOpenRef.current || cameraModeRef.current === 'birds-eye') return;
      if (e.button === 0) {
        isDragging.current = true;
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const sensitivity = 0.0025;
      yaw.current -= e.movementX * sensitivity;
      pitch.current -= e.movementY * sensitivity;
      pitch.current = THREE.MathUtils.clamp(pitch.current, -Math.PI / 2.5, Math.PI / 2.5);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
      }
    };

    // 3. Mouse Wheel zoom-in / zoom-out (approach note easily)
    const handleWheel = (e) => {
      // Don't zoom or prevent default if hovering over interactive UI components
      if (e.target && e.target.closest && (
        e.target.closest('.interactive-ui') || 
        e.target.closest('.item-drawer') || 
        e.target.closest('.item-editor-bar') || 
        e.target.closest('.note-dashboard') || 
        e.target.closest('.note-3d-panel') ||
        e.target.closest('.editor-modal') ||
        e.target.closest('.dashboard-window') ||
        e.target.closest('.settings-modal') ||
        e.target.closest('.toast')
      )) {
        return;
      }

      // Don't zoom if editor or dashboard is open, or in birds-eye mode, or item drawer is open
      if (isEditorOpenRef.current || isDashboardOpenRef.current || isItemDrawerOpenRef.current || cameraModeRef.current === 'birds-eye') return;
      
      // Prevent zoom if hovering over the active/selected note to allow scrolling inside the note
      if (activeNoteIdRef.current && hoveredNoteIdRef.current === activeNoteIdRef.current) {
        return;
      }
      
      // Prevent browser zoom/scroll behaviour
      e.preventDefault();

      camera.getWorldDirection(cameraDirection);
      
      // Calculate zoom velocity based on wheel delta
      const zoomStep = -e.deltaY * 0.004; // Positive: scroll up (forward), Negative: scroll down (back)
      
      targetPosition.current.addScaledVector(cameraDirection, zoomStep);

      // Clamp target position to boundaries immediately
      targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, -ROOM_LIMIT, ROOM_LIMIT);
      targetPosition.current.y = THREE.MathUtils.clamp(targetPosition.current.y, MIN_HEIGHT, MAX_HEIGHT);
      targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -ROOM_LIMIT, ROOM_LIMIT);
    };

    // Listeners (All bound to window to avoid Canvas reference drops during HMR)
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      document.body.style.cursor = 'default';
    };
  }, [gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Kuş bakışı modda kamerayı sabit tepeden konumla ve tüm hareketi atla
    if (cameraMode === 'birds-eye') {
      // Sabit tepeden bakış: evin merkezinin üstünden, düz aşağıya bak
      const birdsEyeTarget = new THREE.Vector3(0, 42, 0);
      camera.position.lerp(birdsEyeTarget, 0.08);
      
      // Kamerayı tam aşağı baktır (-Y yönü)
      const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ'));
      camera.quaternion.slerp(targetQuat, 0.08);
      
      // Avatar gizle
      if (avatarRef.current) avatarRef.current.visible = false;
      
      // Pozisyon ref'lerini güncelle (eşya yerleştirme vb. için)
      if (playerPositionRef) {
        playerPositionRef.current = [currentPosition.current.x, currentPosition.current.y, currentPosition.current.z];
      }
      return; // Diğer tüm hareket mantığını atla
    }

    // Avatar'ı tekrar görünür yap (kuş bakışından çıkıldığında)
    if (avatarRef.current) avatarRef.current.visible = true;

    // Apply rotation quaternion to camera
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = pitch.current;
    euler.y = yaw.current;
    camera.quaternion.setFromEuler(euler);

    // WASD + Space/Shift Flying movement (disabled when in large editor, dashboard, editing item active, or item drawer open)
    const canMove = !isEditorOpen && !isDashboardOpen && !isItemEditingActive && !isItemDrawerOpen;

    if (canMove) {
      const moveForward = (keys.current.KeyW || keys.current.ArrowUp) ? 1 : 0;
      const moveBackward = (keys.current.KeyS || keys.current.ArrowDown) ? 1 : 0;
      // Suppress Arrow keys from moving player horizontal if a note is selected
      const moveLeft = (keys.current.KeyA || (!activeNoteId && keys.current.ArrowLeft)) ? 1 : 0;
      const moveRight = (keys.current.KeyD || (!activeNoteId && keys.current.ArrowRight)) ? 1 : 0;

      moveVector.set(0, 0, 0);

      // Horizontal look vectors for WASD movement
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      cameraRight.set(-cameraDirection.z, 0, cameraDirection.x);

      // WASD translation
      if (moveForward) moveVector.add(cameraDirection);
      if (moveBackward) moveVector.addScaledVector(cameraDirection, -1);
      if (moveLeft) moveVector.addScaledVector(cameraRight, -1);
      if (moveRight) moveVector.add(cameraRight);

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize().multiplyScalar(SPEED * dt);
        targetPosition.current.add(moveVector);
      }

      if (cameraMode === 'free') {
        const moveUp = keys.current.Space ? 1 : 0;
        const moveDown = (keys.current.ShiftLeft || keys.current.ShiftRight) ? 1 : 0;
        if (moveUp) {
          targetPosition.current.y += SPEED * dt;
        }
        if (moveDown) {
          targetPosition.current.y -= SPEED * dt;
        }
      } else {
        // Yürüme Modu Fiziği (Gravity + Jump)
        const isGrounded = targetPosition.current.y <= 1.6;
        if (keys.current.Space && isGrounded && verticalVelocity.current === 0) {
          verticalVelocity.current = 5.5; // Zıplama gücü
        }

        if (!isGrounded || verticalVelocity.current > 0) {
          targetPosition.current.y += verticalVelocity.current * dt;
          verticalVelocity.current -= 18.0 * dt; // Yerçekimi ivmesi
          if (targetPosition.current.y <= 1.6) {
            targetPosition.current.y = 1.6;
            verticalVelocity.current = 0;
          }
        } else {
          targetPosition.current.y = 1.6; // Yerde yürüme yüksekliği (göz hizası)
          verticalVelocity.current = 0;
        }
      }

      // Clamp target position boundaries
      targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, -ROOM_LIMIT, ROOM_LIMIT);
      const maxY = cameraMode === 'free' ? MAX_HEIGHT : Math.max(MAX_HEIGHT, targetPosition.current.y);
      targetPosition.current.y = THREE.MathUtils.clamp(targetPosition.current.y, MIN_HEIGHT, maxY);
      targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -ROOM_LIMIT, ROOM_LIMIT);
    }

    // Pürüzsüz süzülme (lerp) - smooth transition towards target
    currentPosition.current.lerp(targetPosition.current, 0.12);

    // Yürüyüş sallantı animasyonunu hesapla (kollar ve bacaklar için)
    const isMoving = canMove && (
      keys.current.KeyW || keys.current.ArrowUp ||
      keys.current.KeyS || keys.current.ArrowDown ||
      keys.current.KeyA || (!activeNoteId && keys.current.ArrowLeft) ||
      keys.current.KeyD || (!activeNoteId && keys.current.ArrowRight)
    );

    const time = state.clock.getElapsedTime();
    const speedMultiplier = 12; // Sallanma sıklığı
    const swingRange = 0.45; // Sallanma genliği (yaklaşık 25 derece)

    if (isMoving) {
      const angle = Math.sin(time * speedMultiplier) * swingRange;
      if (leftLegRef.current) leftLegRef.current.rotation.x = angle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -angle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -angle * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = angle * 0.8;
    } else {
      // Yumuşakça hareketsiz poza dön
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.15);
    }

    // Update Avatar position (always follows camera position)
    if (avatarRef.current) {
      avatarRef.current.position.copy(currentPosition.current);
      avatarRef.current.rotation.y = yaw.current;
    }

    // Eşya yerleşimi için oyuncunun o anki konumunu ref üzerinden App.jsx'e ilet
    if (playerPositionRef) {
      playerPositionRef.current = [
        currentPosition.current.x,
        currentPosition.current.y,
        currentPosition.current.z
      ];
    }

    // Eşya yerleşimi için oyuncunun o anki bakış yönünü ref üzerinden App.jsx'e ilet
    if (playerDirectionRef) {
      const dirVec = new THREE.Vector3();
      camera.getWorldDirection(dirVec);
      dirVec.y = 0;
      dirVec.normalize();
      if (dirVec.lengthSq() > 0.001) {
        playerDirectionRef.current = [dirVec.x, dirVec.y, dirVec.z];
      } else {
        playerDirectionRef.current = [0, 0, -1];
      }
    }

    // Camera Placement according to mode
    if (cameraMode === 'free') {
      // Free mode: camera is exactly at the current fly position
      camera.position.copy(currentPosition.current);
    } else {
      // Omuz Üstü Üçüncü Şahıs Kamera Açısı (Over-the-shoulder look)
      const backDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      const rightDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      
      const targetCamPos = new THREE.Vector3()
        .copy(currentPosition.current)
        .addScaledVector(backDirection, 2.2)    // Arkasında 2.2 metre mesafe
        .addScaledVector(rightDirection, 0.4)   // Omuz üstü için hafif sağa ofset
        .add(new THREE.Vector3(0, 0.3, 0));     // Hafif yükseklik ofseti

      camera.position.copy(targetCamPos);

      // Kameranın evin dış sınırlarından dışarı taşmasını önle
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -24.8, 24.8);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -24.8, 24.8);
    }
  });

  // Avatar representation: Render only in Third Person mode so it doesn't obstruct view in Free Mode
  const showAvatar = cameraMode === 'third-person'; // Kuş bakışı ve serbest uçuşta avatar gizli

  return (
    <group ref={avatarRef}>
      {showAvatar && (
        <group>
          {/* 1. Kafa & Kapüşon (Hoodie Head) */}
          {/* Dış Kapüşon */}
          <mesh position={[0, 0.1, -0.02]} castShadow>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshStandardMaterial color="#6366f1" roughness={0.4} />
          </mesh>
          {/* Yüz Alanı */}
          <mesh position={[0, 0.1, -0.04]} castShadow>
            <sphereGeometry args={[0.155, 16, 16]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.8} />
          </mesh>
          {/* Gözler (Ön yüze bakıyor, -Z yönünde) */}
          <mesh position={[-0.05, 0.14, -0.17]} castShadow>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0.05, 0.14, -0.17]} castShadow>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Ağız (Gülümseme) */}
          <mesh position={[0, 0.07, -0.17]} rotation={[0, 0, Math.PI]} castShadow>
            <torusGeometry args={[0.02, 0.005, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#e11d48" roughness={0.5} />
          </mesh>

          {/* 2. Gövde (Jacket / Torso) */}
          <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.65, 16]} />
            <meshStandardMaterial color="#4f46e5" roughness={0.4} />
          </mesh>
          {/* Ceket Detayı (Ön Cep) */}
          <mesh position={[0, -0.45, -0.14]} castShadow>
            <boxGeometry args={[0.18, 0.08, 0.04]} />
            <meshStandardMaterial color="#818cf8" roughness={0.5} />
          </mesh>

          {/* 3. Sırt Çantası (Backpack - Arkaya bakıyor, +Z yönünde) */}
          <group position={[0, -0.3, 0.13]}>
            {/* Ana Çanta */}
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.3, 0.12]} />
              <meshStandardMaterial color="#b45309" roughness={0.6} />
            </mesh>
            {/* Çanta Kapağı */}
            <mesh position={[0, 0.1, 0.01]} castShadow>
              <boxGeometry args={[0.18, 0.08, 0.13]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            {/* Sol Askı */}
            <mesh position={[-0.09, 0.02, -0.16]} rotation={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 0.35, 0.03]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            {/* Sağ Askı */}
            <mesh position={[0.09, 0.02, -0.16]} rotation={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 0.35, 0.03]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          </group>

          {/* 4. Sol Bacak (Left Leg) */}
          <group ref={leftLegRef} position={[-0.08, -0.65, 0]}>
            <mesh position={[0, -0.425, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.075, 0.85, 0.075]} />
              <meshStandardMaterial color="#312e81" roughness={0.6} />
            </mesh>
            {/* Ayakkabı */}
            <mesh position={[0, -0.85, -0.03]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.13]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
          </group>

          {/* 5. Sağ Bacak (Right Leg) */}
          <group ref={rightLegRef} position={[0.08, -0.65, 0]}>
            <mesh position={[0, -0.425, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.075, 0.85, 0.075]} />
              <meshStandardMaterial color="#312e81" roughness={0.6} />
            </mesh>
            {/* Ayakkabı */}
            <mesh position={[0, -0.85, -0.03]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.13]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
          </group>

          {/* 6. Sol Kol (Left Arm) */}
          <group ref={leftArmRef} position={[-0.20, -0.15, 0]}>
            <mesh position={[0, -0.24, 0]} castShadow>
              <boxGeometry args={[0.065, 0.48, 0.065]} />
              <meshStandardMaterial color="#6366f1" roughness={0.4} />
            </mesh>
            {/* El */}
            <mesh position={[0, -0.48, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.8} />
            </mesh>
          </group>

          {/* 7. Sağ Kol (Right Arm) */}
          <group ref={rightArmRef} position={[0.20, -0.15, 0]}>
            <mesh position={[0, -0.24, 0]} castShadow>
              <boxGeometry args={[0.065, 0.48, 0.065]} />
              <meshStandardMaterial color="#6366f1" roughness={0.4} />
            </mesh>
            {/* El */}
            <mesh position={[0, -0.48, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.8} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
