import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useTexture, Billboard } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

import pizzaImg from "@/assets/food-pizza.png";
import burgerImg from "@/assets/food-burger.png";
import wineImg from "@/assets/food-wine.png";
import steakImg from "@/assets/food-steak.png";
import dessertImg from "@/assets/food-dessert.png";

type FoodProps = {
  url: string;
  position: [number, number, number];
  scale?: number;
  speed?: number;
  rotIntensity?: number;
  floatIntensity?: number;
  spin?: number;
};

function FloatingFood({
  url,
  position,
  scale = 1.6,
  speed = 1.5,
  rotIntensity = 0.6,
  floatIntensity = 1.2,
  spin = 0.15,
}: FoodProps) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * spin) * 0.25;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={rotIntensity} floatIntensity={floatIntensity}>
      <group ref={groupRef} position={position}>
        <mesh>
          <planeGeometry args={[scale, scale]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
            roughness={0.5}
            metalness={0.1}
            emissive="#ffaa66"
            emissiveIntensity={0.08}
            emissiveMap={texture}
          />
        </mesh>
      </group>
    </Float>
  );
}

function CandleGlow() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 14.3) * 0.08;
    if (lightRef.current) lightRef.current.intensity = 2.2 * flicker;
  });
  return (
    <pointLight
      ref={lightRef}
      position={[0, -0.5, 2.5]}
      color="#ff9040"
      intensity={2.2}
      distance={14}
      decay={1.6}
    />
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        {/* Warm cinematic lighting */}
        <ambientLight intensity={0.45} color="#f0c098" />
        <directionalLight position={[3, 4, 5]} intensity={0.9} color="#ffd9a8" />
        <pointLight position={[-4, 3, 2]} intensity={1.2} color="#d4824a" distance={15} />
        <CandleGlow />

        {/* Foreground hero items */}
        <FloatingFood url={pizzaImg} position={[-2.8, 1.3, 0]} scale={2.1} speed={1.6} />
        <FloatingFood url={burgerImg} position={[2.7, 1.0, -0.3]} scale={2.0} speed={1.4} />
        <FloatingFood url={wineImg} position={[-1.5, -1.2, 1.2]} scale={2.4} speed={1.8} rotIntensity={0.3} />
        <FloatingFood url={steakImg} position={[2.2, -1.4, 0.8]} scale={2.0} speed={1.3} />
        <FloatingFood url={dessertImg} position={[0, 0.2, -1.2]} scale={1.8} speed={1.7} floatIntensity={1.6} />
      </Suspense>
    </Canvas>
  );
}
