import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, MeshTransmissionMaterial, Torus } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

// Pizza: flat cylinder with toppings
function Pizza({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.3;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={ref} position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.08, 32]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.05, 32]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
        {[[0.3, 0.2], [-0.3, 0.1], [0.1, -0.3], [-0.2, -0.25], [0.35, -0.1]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.1, z]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#8b2820" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Burger: stacked layers
function Burger({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.5}>
      <group position={position}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c68e4a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.12, 32]} />
          <meshStandardMaterial color="#3a7d1f" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.18, 32]} />
          <meshStandardMaterial color="#5a2d1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.1, 32]} />
          <meshStandardMaterial color="#f0c060" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.45, 0]} castShadow>
          <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#9c6b35" roughness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

// Wine glass
function WineGlass({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={1.3}>
      <group position={position}>
        {/* Bowl */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          <MeshTransmissionMaterial
            thickness={0.2}
            roughness={0.05}
            transmission={1}
            ior={1.4}
            chromaticAberration={0.05}
            backside
          />
        </mesh>
        {/* Wine */}
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, Math.PI / 2.5, Math.PI / 2.5]} />
          <meshStandardMaterial color="#5a0a1a" transparent opacity={0.85} roughness={0.2} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
          <MeshTransmissionMaterial thickness={0.1} roughness={0.05} transmission={1} ior={1.4} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
          <MeshTransmissionMaterial thickness={0.1} roughness={0.1} transmission={1} ior={1.4} />
        </mesh>
      </group>
    </Float>
  );
}

// Chair
function Chair({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#3a2418" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[0.7, 1.2, 0.1]} />
        <meshStandardMaterial color="#3a2418" roughness={0.8} />
      </mesh>
      {[[-0.3, -0.4, -0.3], [0.3, -0.4, -0.3], [-0.3, -0.4, 0.3], [0.3, -0.4, 0.3]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#2a1810" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Restaurant table with candle
function RestaurantTable() {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 8) * 0.1 + Math.sin(t * 13) * 0.08;
    if (flameRef.current) {
      flameRef.current.scale.set(flicker, flicker * 1.2, flicker);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3 * flicker;
    }
  });

  return (
    <group position={[0, -1.8, -2]}>
      {/* Tabletop */}
      <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.12, 64]} />
        <meshStandardMaterial color="#4a2c1a" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 1.2, 16]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.75, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>

      {/* Candle */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.5} emissive="#3a2410" emissiveIntensity={0.2} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffb347" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.3, 0]} color="#ff9040" intensity={3} distance={8} decay={1.5} castShadow />

      {/* Chairs */}
      <Chair position={[0, 0, 2.4]} rotation={[0, Math.PI, 0]} />
      <Chair position={[0, 0, -2.4]} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.5, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        {/* Warm ambient */}
        <ambientLight intensity={0.15} color="#3a1f10" />
        {/* Key warm light */}
        <directionalLight position={[3, 5, 4]} intensity={0.6} color="#ffaa66" castShadow />
        {/* Rim */}
        <pointLight position={[-4, 2, -2]} intensity={1.2} color="#d4824a" distance={12} />

        <Pizza position={[-2.6, 1.2, 0]} />
        <Burger position={[2.5, 0.8, -0.5]} />
        <WineGlass position={[-1.6, -0.5, 1.5]} />

        <RestaurantTable />

        <ContactShadows position={[0, -2.3, 0]} opacity={0.55} scale={12} blur={3} far={4} color="#1a0a05" />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
