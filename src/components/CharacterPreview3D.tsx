import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterDef } from '../types/game';
import { CharacterModel3D } from '../game/character3d';

interface CharacterPreview3DProps {
  character: CharacterDef;
  actionState?: 'IDLE' | 'KICK' | 'BICYCLE' | 'SPIKE';
}

export const CharacterPreview3D: React.FC<CharacterPreview3DProps> = ({
  character,
  actionState = 'IDLE',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 240;

    // Three scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    camera.position.set(0, 38, 140);
    camera.lookAt(0, 36, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8e7, 1.5);
    keyLight.position.set(40, 90, 80);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-50, 60, -60);
    scene.add(rimLight);

    // 3D Model
    const model = new CharacterModel3D(character);
    model.root.position.set(0, 0, 0);
    scene.add(model.root);

    // Ground platform ring
    const ringGeo = new THREE.CylinderGeometry(28, 30, 2, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = -1;
    ringMesh.receiveShadow = true;
    scene.add(ringMesh);

    let animId: number;
    let time = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let targetRotation = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      targetRotation += deltaX * 0.02;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.03;

      if (!isDragging) {
        targetRotation += 0.008; // slow continuous showcase turntable
      }
      model.root.rotation.y += (targetRotation - model.root.rotation.y) * 0.1;

      // Mock physics object for character animation in showcase
      const mockPlayer = {
        x: 0,
        y: 560,
        vx: 0,
        vy: 0,
        width: 38,
        height: 84,
        isGrounded: true,
        facing: 1 as const,
        team: 'LEFT' as const,
        playerIndex: 0 as const,
        characterId: character.id,
        actionState: actionState,
        actionTimer: 0,
        cooldown: 0,
        scoreTouches: 0,
      };
      model.update(mockPlayer, time, false, false, 560);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      model.dispose();
      renderer.dispose();
    };
  }, [character, actionState]);

  return (
    <div
      ref={mountRef}
      className="w-full h-48 sm:h-52 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center relative bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-slate-700/50"
      title="Потяните мышью для вращения 3D модели"
    >
      <span className="absolute bottom-2 text-[10px] font-bold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
        3D Модель (вращайте мышью)
      </span>
    </div>
  );
};
