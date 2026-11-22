'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, PresentationControls, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';
import { SceneFallback } from './SceneFallback';

// 3D Model Component for the downloaded Coffee Mug
function CoffeeMugModel() {
  // Load the audited glTF asset
  const gltf = useGLTF('/models/hero/scene.gltf');
  const groupRef = useRef<THREE.Group>(null);

  // Subtle auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Centering the raw geometry to fix the FBX offset */}
      <Center top position={[0, -0.4, 0]}>
        <primitive object={gltf.scene} scale={0.9} />
      </Center>
    </group>
  );
}

// Procedural Floating Coffee Beans (Instanced particles)
function FloatingBeans({ count = 25 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 3 - 0.5,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      speedX: (Math.random() - 0.5) * 0.008,
      speedY: (Math.random() - 0.5) * 0.006,
      scale: 0.07 + Math.random() * 0.06,
    }))
  );

  useFrame(() => {
    if (!meshRef.current) return;
    particles.current.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x > 2.5) p.x = -2.5;
      if (p.x < -2.5) p.x = 2.5;
      if (p.y > 2) p.y = -2;
      if (p.y < -2) p.y = 2;

      dummy.current.position.set(p.x, p.y, p.z);
      dummy.current.rotation.set(p.rotX += 0.005, p.rotY += 0.008, 0);
      dummy.current.scale.set(p.scale, p.scale * 1.4, p.scale * 0.7);
      dummy.current.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.current.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Coffee bean egg-like capsule shape */}
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#2B1810"
        roughness={0.4}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

// Top-level Hero 3D Scene with performance and error boundary guards
export function HeroScene() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Check reduced motion media query
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!hasWebGL) {
    return <SceneFallback />;
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[580px] rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900/40 via-stone-950/70 to-stone-950 border border-stone-800/60 shadow-2xl">
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.4, 3.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Studio Lighting */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[4, 5, 4]} intensity={2.0} color="#FFF5EB" />
          <directionalLight position={[-4, 2, -2]} intensity={0.9} color="#D98838" />
          <spotLight position={[0, 4, 2]} intensity={1.5} angle={0.6} penumbra={0.8} />

          {/* Interactive Presentation Controls (drag & rotate) */}
          <PresentationControls
            global={false}
            cursor={true}
            speed={1.5}
            zoom={0.9}
            rotation={[0.1, 0, 0]}
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 3, Math.PI / 3]}
          >
            <Float
              speed={prefersReducedMotion ? 0 : 2}
              rotationIntensity={prefersReducedMotion ? 0 : 0.4}
              floatIntensity={prefersReducedMotion ? 0 : 0.6}
            >
              <CoffeeMugModel />
            </Float>
          </PresentationControls>

          {/* Ambient Floating Beans */}
          {!prefersReducedMotion && <FloatingBeans count={20} />}

          {/* Ground Contact Shadow */}
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.65}
            scale={6}
            blur={2.4}
            far={3}
            color="#140D09"
          />
        </Canvas>
      </Suspense>

      {/* Floating Interactive Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-800 text-[11px] font-medium text-stone-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        Interactive 3D · Drag to rotate signature cup
      </div>
    </div>
  );
}

// Preload glTF model for instantaneous rendering
useGLTF.preload('/models/hero/scene.gltf');
