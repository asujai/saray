import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ROOM_LIMIT = 24.5; // (50 / 2) - 0.5 boundary margin
const MIN_HEIGHT = 0.2;
const MAX_HEIGHT = 22.5; // Raised boundary to allow full overhead view of the roofless house

export default function Player({ 
  movementMode, 
  cameraView, 
  cameraMode,
  placedItems = [],
  devMode, 
  mobileControlsEnabled, 
  activeNoteId, 
  activeItemId, 
  isItemEditingActive, 
  isAddMode, 
  isDrawing, 
  isEditorOpen, 
  isDashboardOpen, 
  isItemDrawerOpen, 
  cameraFocusRequest, 
  hoveredNoteId, 
  playerPositionRef, 
  playerDirectionRef 
}) {
  const { camera, gl } = useThree();
  const avatarRef = useRef();

  // Eşyaların AABB bounding box boyutları [genişlik, derinlik] (Rug ve wallshelf hariç)
  const ITEM_SIZES = {
    desk: [1.7, 0.9],
    chair: [0.55, 0.55],
    shelf: [1.1, 0.45],
    plant: [0.45, 0.45],
    lamp: [0.6, 0.6],
    pc: [0.46, 0.34],
    box: [0.56, 0.56],
    board: [1.6, 0.45],
    large_desk: [2.3, 1.1],
    meeting_table: [3.3, 1.5],
    l_desk: [1.9, 1.7],
    round_table: [1.5, 1.5],
    large_bookshelf: [1.9, 0.45],
    libraryShelf: [3.92, 0.38],
    largeLibraryShelf: [4.4, 0.38],
    low_bookshelf: [1.7, 0.5],
    file_cabinet: [0.7, 0.7],
    drawer_cabinet: [0.9, 0.6],
    large_board: [2.5, 0.15],
    whiteboard: [1.5, 0.6],
    office_chair: [0.6, 0.6],
  };

  const getCustomCollisionWalls = () => {
    const itemWalls = [];
    if (!placedItems) return itemWalls;

    placedItems.forEach(item => {
      // Düzenleme modunda olan aktif eşyayı çarpışma testinden muaf tutalım ki taşınırken sıkışma yapmasın
      if (isItemEditingActive && activeItemId === item.id) return;
      
      const sizes = ITEM_SIZES[item.type];
      if (!sizes) return; // Boyutu tanımlanmamış olanların içinden geçilebilir

      const [origW, origD] = sizes;
      // Rotasyona göre genişlik ve derinliği ayarla
      const rotationY = item.rotation?.[1] || 0;
      const isRotated90 = Math.abs(Math.sin(rotationY)) > 0.707;
      const w = isRotated90 ? origD : origW;
      const d = isRotated90 ? origW : origD;

      const posX = item.position?.[0] || 0;
      const posZ = item.position?.[2] || 0;

      itemWalls.push({
        minX: posX - w / 2,
        maxX: posX + w / 2,
        minZ: posZ - d / 2,
        maxZ: posZ + d / 2
      });
    });

    return itemWalls;
  };

  const performCollisionCheck = (oldX, oldZ, newX, newZ, radius = 0.4) => {
    // 1. Sabit oda duvarları (Sliding Collision)
    const walls = [
      { minX: -5.1, maxX: -4.9, minZ: -25.0, maxZ: -14.0 },
      { minX: -5.1, maxX: -4.9, minZ: -11.0, maxZ: 11.0 },
      { minX: -5.1, maxX: -4.9, minZ: 14.0, maxZ: 25.0 },
      
      { minX: 4.9, maxX: 5.1, minZ: -25.0, maxZ: -14.0 },
      { minX: 4.9, maxX: 5.1, minZ: -11.0, maxZ: 11.0 },
      { minX: 4.9, maxX: 5.1, minZ: 14.0, maxZ: 25.0 },
      
      { minX: -25.0, maxX: -5.0, minZ: -0.1, maxZ: 0.1 },
      { minX: 5.0, maxX: 25.0, minZ: -0.1, maxZ: 0.1 }
    ];

    let resX = newX;
    let resZ = newZ;

    for (const wall of walls) {
      const wMinX = wall.minX - radius;
      const wMaxX = wall.maxX + radius;
      const wMinZ = wall.minZ - radius;
      const wMaxZ = wall.maxZ + radius;

      if (resX > wMinX && resX < wMaxX && resZ > wMinZ && resZ < wMaxZ) {
        const hitX = resX > wMinX && resX < wMaxX && oldZ > wMinZ && oldZ < wMaxZ;
        const hitZ = oldX > wMinX && oldX < wMaxX && resZ > wMinZ && resZ < wMaxZ;

        if (hitX) resX = oldX;
        if (hitZ) resZ = oldZ;
        if (!hitX && !hitZ) {
          resX = oldX;
          resZ = oldZ;
        }
      }
    }

    // 2. Dinamik yerleştirilmiş eşya duvarları (Push-Out Collision)
    if (placedItems) {
      placedItems.forEach(item => {
        if (isItemEditingActive && activeItemId === item.id) return;
        
        const sizes = ITEM_SIZES[item.type];
        if (!sizes) return; // Rug ve wallshelf geçilebilir

        const [origW, origD] = sizes;
        const rotationY = item.rotation?.[1] || 0;
        const isRotated90 = Math.abs(Math.sin(rotationY)) > 0.707;
        const w = isRotated90 ? origD : origW;
        const d = isRotated90 ? origW : origD;

        const posX = item.position?.[0] || 0;
        const posZ = item.position?.[2] || 0;

        const minX = posX - w / 2 - radius;
        const maxX = posX + w / 2 + radius;
        const minZ = posZ - d / 2 - radius;
        const maxZ = posZ + d / 2 + radius;

        if (resX > minX && resX < maxX && resZ > minZ && resZ < maxZ) {
          // Karakter kutunun içinde! Sıkışmayı önlemek için en yakın kenarın dışına itelim (Push-Out)
          const distToMinX = Math.abs(resX - minX);
          const distToMaxX = Math.abs(resX - maxX);
          const distToMinZ = Math.abs(resZ - minZ);
          const distToMaxZ = Math.abs(resZ - maxZ);

          const minDist = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

          if (minDist === distToMinX) {
            resX = minX - 0.01;
          } else if (minDist === distToMaxX) {
            resX = maxX + 0.01;
          } else if (minDist === distToMinZ) {
            resZ = minZ - 0.01;
          } else {
            resZ = maxZ + 0.01;
          }
        }
      });
    }

    return { x: resX, z: resZ };
  };

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
  const movementModeRef = useRef(movementMode);
  const cameraViewRef = useRef(cameraView);
  const cameraModeRef = useRef(cameraMode);
  const isDrawingRef = useRef(isDrawing);
  const isEditorOpenRef = useRef(isEditorOpen);
  const isDashboardOpenRef = useRef(isDashboardOpen);
  const isItemDrawerOpenRef = useRef(isItemDrawerOpen);
  const hoveredNoteIdRef = useRef(hoveredNoteId);
  const devModeRef = useRef(devMode);

  useEffect(() => {
    isAddModeRef.current = isAddMode;
    activeNoteIdRef.current = activeNoteId;
    activeItemIdRef.current = activeItemId;
    isItemEditingActiveRef.current = isItemEditingActive;
    movementModeRef.current = movementMode;
    cameraViewRef.current = cameraView;
    cameraModeRef.current = cameraMode;
    isDrawingRef.current = isDrawing;
    isEditorOpenRef.current = isEditorOpen;
    isDashboardOpenRef.current = isDashboardOpen;
    isItemDrawerOpenRef.current = isItemDrawerOpen;
    hoveredNoteIdRef.current = hoveredNoteId;
    devModeRef.current = devMode;
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
    const handleCameraRotate = (e) => {
      if (cameraModeRef.current === 'birds-eye') return;
      if (e.detail) {
        const sensitivity = 0.0025;
        yaw.current -= e.detail.x * sensitivity;
        pitch.current -= e.detail.y * sensitivity;
        pitch.current = THREE.MathUtils.clamp(pitch.current, -Math.PI / 2.5, Math.PI / 2.5);
      }
    };
    window.addEventListener('saray-camera-rotate', handleCameraRotate);
    return () => {
      window.removeEventListener('saray-camera-rotate', handleCameraRotate);
    };
  }, []);

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
    KeyC: false,
    ControlLeft: false,
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
      if (e.key === 'Shift') {
        keys.current.ShiftLeft = true;
        keys.current.ShiftRight = true;
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
      if (e.key === 'Shift') {
        keys.current.ShiftLeft = false;
        keys.current.ShiftRight = false;
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
      if (window.isDraggingPlacedItem) return;
      if (cameraModeRef.current === 'birds-eye') return;
      // Do not rotate camera if in Add Mode, drawing a note, editor modal is open, or item drawer is open
      if (isAddModeRef.current || activeNoteIdRef.current || isDrawingRef.current || isEditorOpenRef.current || isDashboardOpenRef.current || isItemDrawerOpenRef.current) return;
      if (e.button === 0) {
        isDragging.current = true;
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      if (cameraModeRef.current === 'birds-eye') return;
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

      // Don't zoom if editor or dashboard is open, or item drawer is open
      if (isEditorOpenRef.current || isDashboardOpenRef.current || isItemDrawerOpenRef.current) return;
      
      // Prevent zoom if hovering over the active/selected note to allow scrolling inside the note
      if (activeNoteIdRef.current && hoveredNoteIdRef.current === activeNoteIdRef.current) {
        return;
      }
      
      // Prevent browser zoom/scroll behaviour
      e.preventDefault();

      camera.getWorldDirection(cameraDirection);
      
      // Calculate zoom velocity based on wheel delta
      const zoomStep = -e.deltaY * 0.002; // Hassas yakınlaşma için zoom hızı yarıya indirildi
      
      const oldX = targetPosition.current.x;
      const oldZ = targetPosition.current.z;

      targetPosition.current.addScaledVector(cameraDirection, zoomStep);

      // Çarpışma algılama ve engelleme (sliding collision)
      if (!devModeRef.current) {
        const corrected = performCollisionCheck(oldX, oldZ, targetPosition.current.x, targetPosition.current.z, 0.4);
        targetPosition.current.x = corrected.x;
        targetPosition.current.z = corrected.z;
      }

      // Clamp target position to boundaries immediately
      targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, -ROOM_LIMIT, ROOM_LIMIT);
      targetPosition.current.y = THREE.MathUtils.clamp(targetPosition.current.y, MIN_HEIGHT, MAX_HEIGHT);
      targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -ROOM_LIMIT, ROOM_LIMIT);
    };

    // Listeners (All bound to window to avoid Canvas reference drops during HMR)
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointerdown', handleMouseDown);
    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      document.body.style.cursor = 'default';
    };
  }, [gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);



    // Apply rotation quaternion to camera
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    if (cameraMode === 'birds-eye') {
      euler.x = -Math.PI / 2.1; // Look down almost vertically
      euler.y = yaw.current; // Keep player's yaw
    } else {
      euler.x = pitch.current;
      euler.y = yaw.current;
    }
    camera.quaternion.setFromEuler(euler);

    // WASD + Space/Shift Flying movement (disabled when in large editor, dashboard, or item drawer open)
    const canMove = !isEditorOpen && !isDashboardOpen && !isItemDrawerOpen;

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

      const oldX = targetPosition.current.x;
      const oldZ = targetPosition.current.z;
      const walkSpeed = 3.8; // Yavaş ve son derece hassas hizalanma için yürüme hızı
      const flySpeed = 9.0;  // Uçuş sırasında oda içinde rahat hareket etmek için orta hız
      const currentSpeed = movementMode === 'fly' ? flySpeed : walkSpeed;

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize().multiplyScalar(currentSpeed * dt);
        targetPosition.current.add(moveVector);
      }

      // Çarpışma algılama ve engelleme (sliding collision)
      if (!devMode) {
        const corrected = performCollisionCheck(oldX, oldZ, targetPosition.current.x, targetPosition.current.z, 0.4);
        targetPosition.current.x = corrected.x;
        targetPosition.current.z = corrected.z;
      }

      if (movementMode === 'fly') {
        const moveUp = (keys.current.Space && !window.isDraggingPlacedItem) ? 1 : 0;
        const moveDown = (keys.current.ShiftLeft || keys.current.ShiftRight) ? 1 : 0;
        if (moveUp) {
          targetPosition.current.y += flySpeed * dt;
        }
        if (moveDown) {
          targetPosition.current.y -= flySpeed * dt;
        }
      } else {
        // Yürüme Modu Fiziği (Gravity + Jump + Crouch)
        const isCrouching = keys.current.ShiftLeft || keys.current.ShiftRight;
        const eyeHeight = isCrouching ? 0.7 : 1.6;

        const isGrounded = targetPosition.current.y <= eyeHeight + 0.05;
        if (keys.current.Space && isGrounded && verticalVelocity.current === 0 && !window.isDraggingPlacedItem) {
          verticalVelocity.current = 5.5; // Zıplama gücü
        }

        if (!isGrounded || verticalVelocity.current > 0) {
          targetPosition.current.y += verticalVelocity.current * dt;
          verticalVelocity.current -= 18.0 * dt; // Yerçekimi ivmesi
          if (targetPosition.current.y <= eyeHeight) {
            targetPosition.current.y = eyeHeight;
            verticalVelocity.current = 0;
          }
        } else {
          targetPosition.current.y = THREE.MathUtils.lerp(targetPosition.current.y, eyeHeight, 0.15);
          verticalVelocity.current = 0;
        }
      }

      // Clamp target position boundaries
      targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, -ROOM_LIMIT, ROOM_LIMIT);
      const maxY = movementMode === 'fly' ? MAX_HEIGHT : Math.max(MAX_HEIGHT, targetPosition.current.y);
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
    if (cameraMode === 'birds-eye') {
      camera.position.set(currentPosition.current.x, 18.0, currentPosition.current.z);
      camera.lookAt(currentPosition.current.x, currentPosition.current.y, currentPosition.current.z);
    } else if (cameraView === 'first') {
      // First-Person view: camera is exactly at the current fly/eye position
      camera.position.copy(currentPosition.current);
    } else {
      // Third-Person view: Omuz Üstü Üçüncü Şahıs Kamera Açısı
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

  // Avatar representation: Render only in Third Person view modes so it doesn't obstruct view in FPS Mode
  const showAvatar = cameraView === 'third' && cameraMode !== 'birds-eye'; 

  return (
    <group ref={avatarRef}>
      {showAvatar && (
        <group>
          {/* 1. Kafa & Dedektif Şapkası (Detective Hat) */}
          {/* Şapka Kenarı (Brim) */}
          <mesh position={[0, 0.22, -0.02]} rotation={[0.08, 0, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.015, 16]} />
            <meshStandardMaterial color="#5c3818" roughness={0.6} />
          </mesh>
          {/* Şapka Üstü (Crown) */}
          <mesh position={[0, 0.29, -0.02]} rotation={[0.08, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.14, 16]} />
            <meshStandardMaterial color="#5c3818" roughness={0.6} />
          </mesh>
          {/* Şapka Şeridi (Ribbon) */}
          <mesh position={[0, 0.235, -0.02]} rotation={[0.08, 0, 0]} castShadow>
            <cylinderGeometry args={[0.152, 0.162, 0.025, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Yüz */}
          <mesh position={[0, 0.08, -0.04]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.8} />
          </mesh>

          {/* Saçlar (Şapkanın altından sarkan) */}
          {/* Sol Saç */}
          <mesh position={[-0.13, 0.08, -0.05]} castShadow>
            <boxGeometry args={[0.04, 0.08, 0.1]} />
            <meshStandardMaterial color="#2d2219" roughness={0.9} />
          </mesh>
          {/* Sağ Saç */}
          <mesh position={[0.13, 0.08, -0.05]} castShadow>
            <boxGeometry args={[0.04, 0.08, 0.1]} />
            <meshStandardMaterial color="#2d2219" roughness={0.9} />
          </mesh>
          {/* Arka Saç (Ense) */}
          <mesh position={[0, 0.06, 0.08]} castShadow>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color="#2d2219" roughness={0.9} />
          </mesh>
          {/* Sol Favori Saç */}
          <mesh position={[-0.13, 0.04, -0.09]} castShadow>
            <boxGeometry args={[0.03, 0.06, 0.03]} />
            <meshStandardMaterial color="#2d2219" roughness={0.9} />
          </mesh>
          {/* Sağ Favori Saç */}
          <mesh position={[0.13, 0.04, -0.09]} castShadow>
            <boxGeometry args={[0.03, 0.06, 0.03]} />
            <meshStandardMaterial color="#2d2219" roughness={0.9} />
          </mesh>

          {/* Gözler */}
          <mesh position={[-0.05, 0.12, -0.16]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0.05, 0.12, -0.16]} castShadow>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>

          {/* Monokl (Sol gözde) */}
          <mesh position={[-0.05, 0.12, -0.165]} rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.028, 0.004, 8, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Bıyık (Mustache) */}
          <mesh position={[0, 0.03, -0.165]} castShadow>
            <boxGeometry args={[0.09, 0.02, 0.025]} />
            <meshStandardMaterial color="#2d2219" roughness={0.9} />
          </mesh>

          {/* 2. Gövde (Trençkot / Trenchcoat) */}
          <mesh position={[0, -0.38, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.72, 16]} />
            <meshStandardMaterial color="#784b24" roughness={0.5} />
          </mesh>

          {/* Trençkot Yakaları (Lapels) */}
          <mesh position={[-0.06, -0.2, -0.13]} rotation={[0.1, 0.1, -0.15]} castShadow>
            <boxGeometry args={[0.05, 0.22, 0.025]} />
            <meshStandardMaterial color="#5c3818" roughness={0.6} />
          </mesh>
          <mesh position={[0.06, -0.2, -0.13]} rotation={[0.1, -0.1, 0.15]} castShadow>
            <boxGeometry args={[0.05, 0.22, 0.025]} />
            <meshStandardMaterial color="#5c3818" roughness={0.6} />
          </mesh>

          {/* Trençkot Kemeri ve Tokası */}
          <mesh position={[0, -0.42, 0]} castShadow>
            <boxGeometry args={[0.34, 0.045, 0.34]} />
            <meshStandardMaterial color="#5c3818" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.42, -0.175]} castShadow>
            <boxGeometry args={[0.07, 0.06, 0.015]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Düğmeler (Altın Düğmeler) */}
          <mesh position={[-0.03, -0.24, -0.15]} castShadow>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.03, -0.33, -0.16]} castShadow>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.03, -0.24, -0.15]} castShadow>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.03, -0.33, -0.16]} castShadow>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* 4. Sol Bacak (Left Leg) */}
          <group ref={leftLegRef} position={[-0.08, -0.65, 0]}>
            <mesh position={[0, -0.425, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.075, 0.85, 0.075]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            {/* Ayakkabı */}
            <mesh position={[0, -0.85, -0.03]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.13]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>

          {/* 5. Sağ Bacak (Right Leg) */}
          <group ref={rightLegRef} position={[0.08, -0.65, 0]}>
            <mesh position={[0, -0.425, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.075, 0.85, 0.075]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            {/* Ayakkabı */}
            <mesh position={[0, -0.85, -0.03]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.13]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>

          {/* 6. Sol Kol (Left Arm) */}
          <group ref={leftArmRef} position={[-0.20, -0.15, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.065, 0.44, 0.065]} />
              <meshStandardMaterial color="#784b24" roughness={0.5} />
            </mesh>
            {/* Detaylı Sol El (Avuç İçi + Baş Parmak) */}
            <group position={[0, -0.44, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.075, 0.075, 0.06]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.8} />
              </mesh>
              {/* Baş Parmak */}
              <mesh position={[0.035, 0.01, -0.015]} rotation={[0.2, 0, 0.3]} castShadow>
                <boxGeometry args={[0.02, 0.035, 0.02]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.8} />
              </mesh>
            </group>
          </group>

          {/* 7. Sağ Kol (Right Arm) */}
          <group ref={rightArmRef} position={[0.20, -0.15, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <boxGeometry args={[0.065, 0.44, 0.065]} />
              <meshStandardMaterial color="#784b24" roughness={0.5} />
            </mesh>
            {/* Detaylı Sağ El (Avuç İçi + Parmak Kavraması) */}
            <group position={[0, -0.44, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.075, 0.075, 0.06]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.8} />
              </mesh>
              {/* Baş Parmak */}
              <mesh position={[-0.035, 0.01, -0.015]} rotation={[0.2, 0, -0.3]} castShadow>
                <boxGeometry args={[0.02, 0.035, 0.02]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.8} />
              </mesh>
              {/* Büyüteci kavrayan diğer parmaklar efekti */}
              <mesh position={[0, -0.02, -0.025]} castShadow>
                <boxGeometry args={[0.05, 0.03, 0.04]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.8} />
              </mesh>
              
              {/* Büyüteç Entegrasyonu */}
              <group position={[0, 0, 0]} rotation={[0.1, 0, 0.05]}>
                {/* Büyüteç Sapı (Elin içinden geçip yukarı/ileriye uzanıyor) */}
                <mesh position={[0, 0.01, -0.025]} rotation={[Math.PI / 4, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.007, 0.007, 0.09, 8]} />
                  <meshStandardMaterial color="#4a2c11" roughness={0.7} />
                </mesh>
                {/* Büyüteç Çerçevesi */}
                <mesh position={[0, 0.07, -0.085]} rotation={[Math.PI / 4, 0, 0]} castShadow>
                  <torusGeometry args={[0.032, 0.005, 8, 16]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Büyüteç Camı */}
                <mesh position={[0, 0.07, -0.085]} rotation={[Math.PI / 4, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.002, 8]} />
                  <meshStandardMaterial color="#93c5fd" opacity={0.35} transparent={true} roughness={0.1} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      )}
    </group>
  );
}
