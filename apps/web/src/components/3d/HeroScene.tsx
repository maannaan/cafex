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
    // 1. WebGL capability detection
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

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Setup Scene, Camera & WebGL Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 3.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff5eb, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd98838, 1.8);
    rimLight.position.set(-4, 2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 1.2, 10);
    fillLight.position.set(0, 3, 2);
    scene.add(fillLight);

    // 4. OrbitControls (constrained for pleasant showcase)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Keep hero framing stable
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 1.2;

    // 5. Procedural Instanced Coffee Beans
    const beanCount = prefersReducedMotion ? 0 : 22;
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
          speedY: 0.002 + Math.random() * 0.004,
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

    // 6. Ground Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(3, 3);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(15, 10, 8, 0.7)');
    grad.addColorStop(0.5, 'rgba(15, 10, 8, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.75;
    scene.add(shadowMesh);

    // 7. Load Audited Coffee Mug Model and Normalize Pivot
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const loader = new GLTFLoader();
    loader.load(
      '/models/hero/scene.gltf',
      (gltf) => {
        const root = gltf.scene;

        // Compute bounding box to fix FBX export offset
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center root object at origin (0, 0, 0)
        root.position.x = -center.x;
        root.position.y = -center.y + 0.15;
        root.position.z = -center.z;

        // Normalize scale to ~1.2 units height
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scaleFactor = 1.35 / maxDim;
          root.scale.setScalar(scaleFactor);
        }

        // Enable shadows and enhance ceramic glossiness
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.envMapIntensity = 1.2;
              mat.needsUpdate = true;
            }
          }
        });

        modelGroup.add(root);
        setIsLoadingModel(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D coffee cup model:', err);
        setIsLoadingModel(false);
      }
    );

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const dummy = new THREE.Object3D();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle floating hover motion for the mug
      if (!prefersReducedMotion && modelGroup) {
        modelGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;
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

    // 10. Cleanup on Unmount
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
      {/* 3D Canvas Mount Point */}
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
        Interactive 3D · Drag to inspect signature cup
      </div>
    </div>
  );
}
