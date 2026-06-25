import React, { useState, useMemo, useEffect } from 'react';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Safely normalize a page entry — guarantees { text, image, layout }
function normalizePage(page) {
  if (!page) return { text: '', image: null, layout: 'image-top-text-bottom' };
  if (typeof page === 'string') return { text: page, image: null, layout: 'image-top-text-bottom' };
  return {
    text: (page.text != null) ? String(page.text) : '',
    image: (page.image != null) ? page.image : null,
    layout: page.layout || 'image-top-text-bottom'
  };
}

export default function Note3D({ 
  note, 
  onClick, 
  isAddMode, 
  activeNoteId, 
  isPreview, 
  onEditClick, 
  onSetPageIndex,
  isFlashed,
  onHoverChange,
  isCrosshairHovered = false,
  notes = [],
  placedItems = [],
  onNavigateToTarget,
  pendingConnectionSource = null,
  onStartConnection,
  onCancelConnection,
  hideControls = false
}) {
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const [imageAspect, setImageAspect] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [scrollLineIndex, setScrollLineIndex] = useState(0);

  const w = note.width || 0.7;
  const h = note.height || 0.7;

  // Compute position and rotation
  const { position, rotation } = useMemo(() => {
    try {
      if (note.position && note.rotation) {
        return { position: note.position, rotation: note.rotation };
      }
      const pointVec = new THREE.Vector3(...(note.point || [0, 1.6, 0]));
      const normalVec = new THREE.Vector3(...(note.normal || [0, 0, 1]));
      const offsetPos = pointVec.clone().addScaledVector(normalVec, isPreview ? 0.03 : 0.02);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec);
      const euler = new THREE.Euler().setFromQuaternion(quaternion);
      return {
        position: [offsetPos.x, offsetPos.y, offsetPos.z],
        rotation: [euler.x, euler.y, euler.z]
      };
    } catch {
      return { position: [0, 1.6, 0], rotation: [0, 0, 0] };
    }
  }, [note.position, note.rotation, note.point, note.normal, isPreview]);

  // Normalize current page data safely
  const currentPage = useMemo(() => {
    if (isPreview) return { text: '', image: null, layout: 'image-top-text-bottom' };
    try {
      const idx = note.currentPageIndex || 0;
      const pages = note.pages;
      if (!Array.isArray(pages) || pages.length === 0) {
        return { text: '', image: null, layout: 'image-top-text-bottom' };
      }
      const page = pages[Math.min(idx, pages.length - 1)];
      return normalizePage(page);
    } catch {
      return { text: '', image: null, layout: 'image-top-text-bottom' };
    }
  }, [note.pages, note.currentPageIndex, isPreview]);

  // Asynchronously load texture — completely safe, no Suspense crash
  useEffect(() => {
    if (isPreview) { setTexture(null); return; }
    
    const imageUrl = currentPage.image;
    if (!imageUrl || typeof imageUrl !== 'string') {
      setTexture(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    
    loader.load(
      imageUrl,
      (tex) => {
        if (cancelled) return;
        try {
          if (tex.image) {
            setImageAspect((tex.image.width || 1) / (tex.image.height || 1));
          }
          setTexture(tex);
          setHasError(false);
        } catch {
          setTexture(null);
        }
      },
      undefined,
      () => {
        if (!cancelled) setTexture(null);
      }
    );

    return () => { cancelled = true; };
  }, [currentPage.image, isPreview]);

  // Reset scroll index when page or note changes
  useEffect(() => {
    setScrollLineIndex(0);
  }, [note.currentPageIndex, note.id]);

  // Dynamic font sizing
  const fontSize = useMemo(() => {
    const minDim = Math.min(w, h);
    return Math.max(0.035, Math.min(0.065, minDim * 0.075));
  }, [w, h]);

  const textMaxWidth = w * 0.88;
  const isSelected = activeNoteId === note.id;

  // Process text into wrapped lines for 3D scroll representation
  const allLines = useMemo(() => {
    const textVal = (currentPage.text || '').trim();
    if (!textVal) return [];

    // Calculate approximate chars per line based on width and font size
    const charsPerLine = Math.max(10, Math.floor(textMaxWidth / (fontSize * 0.52)));
    const rawLines = textVal.split('\n');
    const wrappedLines = [];

    rawLines.forEach((line) => {
      if (line.length <= charsPerLine) {
        wrappedLines.push(line);
      } else {
        let temp = line;
        while (temp.length > 0) {
          if (temp.length <= charsPerLine) {
            wrappedLines.push(temp);
            break;
          }
          let splitIdx = temp.lastIndexOf(' ', charsPerLine);
          if (splitIdx <= 0) splitIdx = charsPerLine;
          wrappedLines.push(temp.substring(0, splitIdx));
          temp = temp.substring(splitIdx).trim();
        }
      }
    });

    return wrappedLines;
  }, [currentPage.text, textMaxWidth, fontSize]);

  // Extract BKZ links from page text
  const pageLinks = useMemo(() => {
    if (isPreview || !currentPage.text) return [];
    const text = currentPage.text;
    const links = [];
    // Matching case-insensitive [Bkz: ...] or [bkz: ...] or [BKZ: ...]
    const matches = [...text.matchAll(/\[[Bb][Kk][Zz]:\s*([^\]]+)\]/g)];
    matches.forEach(match => {
      const targetName = match[1].trim().toLowerCase();
      
      // Look in wall notes
      const matchedWallNote = notes.find(n => {
        if (n.id.toLowerCase() === targetName) return true;
        // First line title matching
        const firstLine = (n.pages?.[0]?.text || '').split('\n')[0].trim().toLowerCase();
        const title = (n.title || firstLine).toLowerCase();
        return title === targetName;
      });

      if (matchedWallNote) {
        const firstLine = (matchedWallNote.pages?.[0]?.text || '').split('\n')[0].trim();
        links.push({
          matchText: match[0],
          targetId: matchedWallNote.id,
          targetTitle: matchedWallNote.title || firstLine || matchedWallNote.id,
          isWallNote: true
        });
        return;
      }

      // Look in item notes
      const matchedItem = placedItems.find(item => {
        if (item.id.toLowerCase() === targetName) return true;
        if (item.linkedNote) {
          const title = (item.linkedNote.title || '').trim().toLowerCase();
          return title === targetName;
        }
        return false;
      });

      if (matchedItem) {
        links.push({
          matchText: match[0],
          targetId: matchedItem.id,
          targetTitle: matchedItem.linkedNote.title || matchedItem.id,
          isWallNote: false
        });
      }
    });
    return links;
  }, [currentPage.text, notes, placedItems, isPreview]);

  const hasImage = !isPreview && !!texture;

  // Calculate dynamic maximum visible lines depending on whether image is currently shown
  const maxVisibleLines = useMemo(() => {
    // If image is present and scroll position is at the top, allocate less space for text
    const showImage = hasImage && scrollLineIndex === 0;
    const visibleHeight = showImage ? h * 0.45 : h * 0.85;
    return Math.max(1, Math.floor(visibleHeight / (fontSize * 1.35)));
  }, [h, fontSize, hasImage, scrollLineIndex]);

  // Text that is actually visible inside the note viewport
  const visibleText = useMemo(() => {
    if (allLines.length === 0) {
      return hasImage ? '' : 'Boş sayfa...';
    }
    return allLines.slice(scrollLineIndex, scrollLineIndex + maxVisibleLines).join('\n');
  }, [allLines, scrollLineIndex, maxVisibleLines, hasImage]);

  // Layout calculations for WebGL image mesh
  const imageLayout = useMemo(() => {
    if (!hasImage || scrollLineIndex > 0) return null; // Hide image when scrolled down
    try {
      const hasText = allLines.length > 0;
      if (hasText) {
        const pw = w * 0.9;
        const ph = h * 0.45;
        const targetAspect = pw / ph;
        let dW = pw, dH = ph;
        if (imageAspect > targetAspect) { dW = pw; dH = pw / imageAspect; }
        else { dH = ph; dW = ph * imageAspect; }
        return { position: [0, h * 0.2, 0.006], width: dW, height: dH };
      } else {
        const pw = w - 0.06;
        const ph = h - 0.06;
        const targetAspect = pw / ph;
        let dW = pw, dH = ph;
        if (imageAspect > targetAspect) { dW = pw; dH = pw / imageAspect; }
        else { dH = ph; dW = ph * imageAspect; }
        return { position: [0, 0, 0.006], width: dW, height: dH };
      }
    } catch {
      return null;
    }
  }, [hasImage, allLines, w, h, imageAspect, scrollLineIndex]);

  const textPosition = useMemo(() => {
    const showImage = hasImage && scrollLineIndex === 0;
    if (showImage) return [0, -h * 0.22, 0.006];
    return [0, 0, 0.006];
  }, [hasImage, h, scrollLineIndex]);

  const handlePointerDown = (e) => {
    if (isAddMode || isPreview) return;
    e.stopPropagation();
    if (onClick) onClick(note.id);
  };

  const handleWheel = (e) => {
    if (!isSelected) return;
    const maxScroll = Math.max(0, allLines.length - maxVisibleLines);
    if (maxScroll <= 0) return;

    e.stopPropagation(); // Stop zoom propagation
    
    if (e.deltaY > 0) {
      setScrollLineIndex((prev) => Math.min(maxScroll, prev + 1));
    } else if (e.deltaY < 0) {
      setScrollLineIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const scale = isSelected ? 1.03 : (hovered || isCrosshairHovered) && !isPreview ? 1.01 : 1;

  useEffect(() => {
    if (!isAddMode && !isPreview) {
      document.body.style.cursor = hovered ? 'pointer' : 'default';
    }
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered, isAddMode, isPreview]);

  const pageCount = (Array.isArray(note.pages) && note.pages.length) || 1;
  const currentPageIndex = note.currentPageIndex || 0;

  // 3D WebGL Scrollbar calculations
  const showScrollbar = isSelected && allLines.length > maxVisibleLines;
  const scrollbarHeight = h * 0.75;
  const indicatorHeight = Math.max(0.06, scrollbarHeight * (maxVisibleLines / allLines.length));
  const maxScroll = Math.max(1, allLines.length - maxVisibleLines);
  const indicatorY = (scrollbarHeight - indicatorHeight) * (0.5 - (scrollLineIndex / maxScroll));

  // If this note has errored, render a simple fallback instead of crashing
  if (hasError && !isPreview) {
    return (
      <group position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[w, h, 0.01]} />
          <meshStandardMaterial color="#ef4444" roughness={0.6} />
        </mesh>
        <Text position={[0, 0, 0.006]} fontSize={0.06} color="#fff" maxWidth={w * 0.8} anchorX="center" anchorY="middle" textAlign="center">
          ⚠ Hatalı not verisi
        </Text>
      </group>
    );
  }

  return (
    <group 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => { 
        e.stopPropagation(); 
        if(!isPreview) {
          setHovered(true); 
          if(onHoverChange) onHoverChange(note.id);
        }
      }}
      onPointerOut={(e) => { 
        e.stopPropagation(); 
        if(!isPreview) {
          setHovered(false); 
          if(onHoverChange) onHoverChange(null);
        }
      }}
      onWheel={handleWheel}
    >
      {/* 3D Sticky Note Paper */}
      <mesh name={`note_mesh_${note.id}`} castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.01]} />
        <meshStandardMaterial 
          color={note.color || '#fef08a'} 
          roughness={0.6}
          metalness={0.1}
          transparent={isPreview}
          opacity={isPreview ? 0.6 : 1.0}
          emissive={isFlashed ? '#00f0ff' : isSelected ? '#ffffff' : isCrosshairHovered ? '#ffffff' : note.color || '#fef08a'}
          emissiveIntensity={isFlashed ? 1.5 : isSelected ? 0.25 : (hovered || isCrosshairHovered) && !isPreview ? 0.15 : 0.0}
        />
      </mesh>
 
      {/* Selected Indicator Outline */}
      {isSelected && !isPreview && (
        <mesh position={[0, 0, -0.002]}>
          <boxGeometry args={[w + 0.06, h + 0.06, 0.008]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>
      )}

      {/* Hologram Flash Indicator Outline */}
      {isFlashed && !isPreview && (
        <mesh position={[0, 0, -0.003]}>
          <boxGeometry args={[w + 0.18, h + 0.18, 0.006]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} />
        </mesh>
      )}

      {/* 3D WebGL Scrollbar Indicator */}
      {showScrollbar && (
        <group position={[w / 2 - 0.03, 0, 0.007]}>
          {/* Track */}
          <mesh>
            <planeGeometry args={[0.008, scrollbarHeight]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.15} />
          </mesh>
          {/* Thumb */}
          <mesh position={[0, indicatorY, 0.001]}>
            <planeGeometry args={[0.014, indicatorHeight]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Render WebGL Image Mesh */}
      {imageLayout && (
        <mesh position={imageLayout.position}>
          <planeGeometry args={[imageLayout.width, imageLayout.height]} />
          <meshBasicMaterial map={texture} transparent opacity={1.0} />
        </mesh>
      )}

      {/* Render WebGL Text */}
      {!isPreview && (
        <Text
          position={textPosition} 
          fontSize={hasImage && scrollLineIndex === 0 ? fontSize * 0.82 : fontSize}
          color="#1e293b" 
          maxWidth={textMaxWidth}
          lineHeight={1.35}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {visibleText}
        </Text>
      )}

      {/* 3D Interactive HTML Overlays for selected note */}
      {isSelected && !isPreview && !hideControls && (
        <>
          <Html position={[-w / 2, h / 2 + 0.04, 0.015]} center distanceFactor={4}>
            <button 
              className="note-edit-btn interactive-ui"
              style={{
                background: (pendingConnectionSource?.id === note.id) ? 'rgba(239, 68, 68, 0.85)' : 'rgba(99, 102, 241, 0.85)',
                borderColor: (pendingConnectionSource?.id === note.id) ? '#fca5a5' : '#818cf8',
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (pendingConnectionSource?.id === note.id) {
                  if (onCancelConnection) onCancelConnection();
                } else {
                  if (onStartConnection) onStartConnection(note.id, 'note');
                }
              }}
            >
              {(pendingConnectionSource?.id === note.id) ? '❌ İptal' : '🔗 Bağlantı'}
            </button>
          </Html>

          <Html position={[w / 2, h / 2 + 0.04, 0.015]} center distanceFactor={4}>
            <button 
              className="note-edit-btn interactive-ui"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); if (onEditClick) onEditClick(); }}
            >
              ✏️ Düzenle
            </button>
          </Html>

          <Html position={[0, -h / 2 - 0.12, 0.015]} center distanceFactor={4}>
            <div 
              className="note-page-controls interactive-ui"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                disabled={currentPageIndex === 0}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (onSetPageIndex) onSetPageIndex(note.id, currentPageIndex - 1); }}
              >◀</button>
              <span
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                Sayfa {currentPageIndex + 1} / {pageCount}
              </span>
              <button 
                disabled={currentPageIndex === pageCount - 1}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (onSetPageIndex) onSetPageIndex(note.id, currentPageIndex + 1); }}
              >▶</button>
            </div>
          </Html>

          {pageLinks.length > 0 && (
            <Html position={[0, -h / 2 - 0.25, 0.015]} center distanceFactor={4}>
              <div 
                className="note-link-controls interactive-ui"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  maxHeight: '80px',
                  overflowY: 'auto'
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {pageLinks.map((link, idx) => (
                  <button
                    key={idx}
                    className="btn-primary-item"
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#a5b4fc',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateToTarget) {
                        onNavigateToTarget(link.targetId, link.isWallNote);
                      }
                    }}
                  >
                    🔗 Git: {link.targetTitle.length > 18 ? link.targetTitle.substring(0, 18) + '...' : link.targetTitle}
                  </button>
                ))}
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

