import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SPEED = 14; // Increased speed for larger room traversal
const ROOM_LIMIT = 24.5; // (50 / 2) - 0.5 boundary margin
const MIN_HEIGHT = 0.5;
const MAX_HEIGHT = 22.5; // Raised boundary to allow full overhead view of the roofless house

export default function Player({ cameraMode, activeNoteId, activeItemId, isItemEditingActive, isAddMode, isDrawing, isEditorOpen, isDashboardOpen, cameraFocusRequest, hoveredNoteId, playerPositionRef }) {
  const { camera, gl } = useThree();
  const avatarRef = useRef();

  // Create refs to prevent React stale closures in event listeners
  const isAddModeRef = useRef(isAddMode);
  const activeNoteIdRef = useRef(activeNoteId);
  const activeItemIdRef = useRef(activeItemId);
  const isItemEditingActiveRef = useRef(isItemEditingActive);
  const cameraModeRef = useRef(cameraMode);
  const isDrawingRef = useRef(isDrawing);
  const isEditorOpenRef = useRef(isEditorOpen);
  const isDashboardOpenRef = useRef(isDashboardOpen);
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
      // Do not rotate camera if in Add Mode, drawing a note, or editor modal is open
      if (isAddModeRef.current || activeNoteIdRef.current || isDrawingRef.current || isEditorOpenRef.current || isDashboardOpenRef.current) return;
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
      // Don't zoom if editor or dashboard is open
      if (isEditorOpenRef.current || isDashboardOpenRef.current) return;
      
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

    // Apply rotation quaternion to camera
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = pitch.current;
    euler.y = yaw.current;
    camera.quaternion.setFromEuler(euler);

    // WASD + Space/Shift Flying movement (disabled when in large editor, dashboard, or editing item active)
    const canMove = !isEditorOpen && !isDashboardOpen && !isItemEditingActive;

    if (canMove) {
      const moveForward = (keys.current.KeyW || keys.current.ArrowUp) ? 1 : 0;
      const moveBackward = (keys.current.KeyS || keys.current.ArrowDown) ? 1 : 0;
      // Suppress Arrow keys from moving player horizontal if a note is selected
      const moveLeft = (keys.current.KeyA || (!activeNoteId && keys.current.ArrowLeft)) ? 1 : 0;
      const moveRight = (keys.current.KeyD || (!activeNoteId && keys.current.ArrowRight)) ? 1 : 0;
      const moveUp = keys.current.Space ? 1 : 0;
      const moveDown = (keys.current.ShiftLeft || keys.current.ShiftRight) ? 1 : 0;

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

      // Vertical translation (Space/Shift)
      if (moveUp) {
        targetPosition.current.y += SPEED * dt;
      }
      if (moveDown) {
        targetPosition.current.y -= SPEED * dt;
      }

      // Clamp target position boundaries
      targetPosition.current.x = THREE.MathUtils.clamp(targetPosition.current.x, -ROOM_LIMIT, ROOM_LIMIT);
      targetPosition.current.y = THREE.MathUtils.clamp(targetPosition.current.y, MIN_HEIGHT, MAX_HEIGHT);
      targetPosition.current.z = THREE.MathUtils.clamp(targetPosition.current.z, -ROOM_LIMIT, ROOM_LIMIT);
    }

    // Pürüzsüz süzülme (lerp) - smooth transition towards target
    currentPosition.current.lerp(targetPosition.current, 0.12);

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

    // Camera Placement according to mode
    if (cameraMode === 'free') {
      // Free mode: camera is exactly at the current fly position
      camera.position.copy(currentPosition.current);
    } else {
      // Third Person (Position review mode): pull camera backwards to reveal the avatar
      const backDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      
      const targetCamPos = new THREE.Vector3()
        .copy(currentPosition.current)
        .addScaledVector(backDirection, 3.5) // Orbit distance
        .add(new THREE.Vector3(0, 0.5, 0));  // slight height offset

      camera.position.copy(targetCamPos);
    }
  });

  // Avatar representation: Render only in Third Person mode so it doesn't obstruct view in Free Mode
  const showAvatar = cameraMode === 'third-person';

  return (
    <group ref={avatarRef}>
      {showAvatar && (
        <group>
          {/* Minimalist, cute robot/human avatar representing position */}
          {/* Base/Stand */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <meshStandardMaterial color="#6366f1" roughness={0.4} />
          </mesh>

          {/* Main Body */}
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#818cf8" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Head */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} />
          </mesh>

          {/* Glowing visor eyes */}
          <mesh position={[0, 0.48, 0.12]} castShadow>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
          </mesh>

          {/* Halo ring for spatial futuristic look */}
          <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 12, 0, 0]}>
            <torusGeometry args={[0.22, 0.02, 8, 24]} />
            <meshBasicMaterial color="#6366f1" />
          </mesh>
        </group>
      )}
    </group>
  );
}
