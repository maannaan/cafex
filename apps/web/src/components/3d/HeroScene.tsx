'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneFallback } from './SceneFallback';

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(true);

  useEffect(() => {
    // 1. WebGL capability check
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        setIsLoadingModel(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      setIsLoadingModel(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Setup Scene, Camera & WebGL Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.75, 2.7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Warm Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0dd, 3.2);
    keyLight.position.set(3.5, 4.5, 3.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd98838, 2.2);
    rimLight.position.set(-3.5, 2, -2.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffe4cc, 1.8, 10);
    fillLight.position.set(0, 2.5, 2);
    scene.add(fillLight);

    const bottomBounce = new THREE.DirectionalLight(0x5c4033, 0.8);
    bottomBounce.position.set(0, -3, 1);
    scene.add(bottomBounce);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 5;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(0, 0, 0);

    // 5. Procedural Instanced Coffee Beans (Particles)
    const beanCount = prefersReducedMotion ? 0 : 24;
    let beansMesh: THREE.InstancedMesh | null = null;
    const beanData: Array<{
      x: number;
      y: number;
      z: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      speedY: number;
      scale: number;
    }> = [];

    if (beanCount > 0) {
      const beanGeo = new THREE.SphereGeometry(1, 14, 14);
      const beanMat = new THREE.MeshStandardMaterial({
        color: 0x2e1a12,
        roughness: 0.35,
        metalness: 0.1,
      });

      beansMesh = new THREE.InstancedMesh(beanGeo, beanMat, beanCount);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < beanCount; i++) {
        const x = (Math.random() - 0.5) * 5.5;
        const y = (Math.random() - 0.5) * 3.5;
        const z = (Math.random() - 0.5) * 2.5 - 0.5;
        const scale = 0.06 + Math.random() * 0.05;

        beanData.push({
          x,
          y,
          z,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          rotZ: Math.random() * Math.PI,
          speedY: 0.002 + Math.random() * 0.003,
          scale,
        });

        dummy.position.set(x, y, z);
        dummy.scale.set(scale, scale * 1.35, scale * 0.75);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        dummy.updateMatrix();
        beansMesh.setMatrixAt(i, dummy.matrix);
      }

      beansMesh.instanceMatrix.needsUpdate = true;
      scene.add(beansMesh);
    }

    // 6. Realistic Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(15, 10, 8, 0.85)');
    grad.addColorStop(0.3, 'rgba(20, 13, 10, 0.5)');
    grad.addColorStop(0.7, 'rgba(20, 13, 10, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.62;
    scene.add(shadowMesh);

    // 7. Load User's Pasted 3D Coffee Mug Model & Center Properly
    const modelGroup = new THREE.Group();
    modelGroup.rotation.y = 0.8; // Gentle angle showing handle and coffee depth
    scene.add(modelGroup);

    const loader = new GLTFLoader();
    // Try primary path, fallback to pasted folder path if needed
    const modelPath = '/models/hero/scene.gltf';

    loader.load(
      modelPath,
      (gltf) => {
        const root = gltf.scene;

        // 1. Scale to fit comfortably within viewport (~1.15 units)
        const initialBox = new THREE.Box3().setFromObject(root);
        const size = initialBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 1.15;
        const scaleFactor = maxDim > 0 ? targetSize / maxDim : 1;
        root.scale.setScalar(scaleFactor);
        root.updateMatrixWorld(true);

        // 2. Center at (0, 0, 0)
        const scaledBox = new THREE.Box3().setFromObject(root);
        const center = scaledBox.getCenter(new THREE.Vector3());
        root.position.sub(center);
        root.position.y += 0.02; // Position gracefully above shadow plane
        root.updateMatrixWorld(true);

        // 3. Materials and Shadow tuning
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.max(0.15, mat.roughness);
              mat.needsUpdate = true;
            }
          }
        });

        modelGroup.add(root);
        setIsLoadingModel(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D coffee cup model from', modelPath, err);
        setIsLoadingModel(false);
      }
    );

    // 8. Render & Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const dummy = new THREE.Object3D();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle floating hover motion for the mug
      if (!prefersReducedMotion && modelGroup) {
        modelGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
      }

      // Animate floating beans
      if (beansMesh && beanData.length > 0) {
        for (let i = 0; i < beanData.length; i++) {
          const b = beanData[i];
          b.y += b.speedY;
          b.rotX += 0.008;
          b.rotY += 0.01;
          if (b.y > 2) b.y = -2;

          dummy.position.set(b.x, b.y, b.z);
          dummy.rotation.set(b.rotX, b.rotY, b.rotZ);
          dummy.scale.set(b.scale, b.scale * 1.35, b.scale * 0.75);
          dummy.updateMatrix();
          beansMesh.setMatrixAt(i, dummy.matrix);
        }
        beansMesh.instanceMatrix.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!hasWebGL) {
    return <SceneFallback />;
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[580px] rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900/40 via-stone-950/70 to-stone-950 border border-stone-800/60 shadow-2xl">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading state overlay */}
      {isLoadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm pointer-events-none transition-opacity duration-500">
          <SceneFallback />
        </div>
      )}

      {/* Floating Interactive Helper Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-stone-900/90 backdrop-blur-md border border-stone-800 text-[11px] font-medium text-stone-300 flex items-center gap-2 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        Interactive 3D · Drag to rotate signature cup
      </div>
    </div>
  );
}
