import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";

function CandleGlow() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 14.3) * 0.08;
    if (lightRef.current) lightRef.current.intensity = 2.4 * flicker;
  });
  return (
    <pointLight
      ref={lightRef}
      position={[0, 2.2, 0]}
      color="#ff9040"
      intensity={2.4}
      distance={12}
      decay={1.6}
    />
  );
}

function PlatedDish() {
  return (
    <group position={[0, 0, 0]}>
      {/* Round wooden table */}
      <mesh position={[0, -0.55, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.4, 0.18, 48]} />
        <meshStandardMaterial color="#5a3a24" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Table edge ring */}
      <mesh position={[0, -0.46, 0]}>
        <torusGeometry args={[2.4, 0.04, 12, 64]} />
        <meshStandardMaterial color="#3d2715" roughness={0.6} />
      </mesh>

      {/* Ceramic plate */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.35, 1.2, 0.08, 48]} />
        <meshStandardMaterial color="#f5efe6" roughness={0.25} metalness={0.05} />
      </mesh>
      {/* Plate inner well */}
      <mesh position={[0, -0.36, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.04, 48]} />
        <meshStandardMaterial color="#ece4d4" roughness={0.3} />
      </mesh>

      {/* Food mound (steak/protein) */}
      <mesh position={[0.15, -0.22, 0.05]} rotation={[0, 0.4, 0]}>
        <sphereGeometry args={[0.45, 24, 16]} />
        <meshStandardMaterial color="#7a3818" roughness={0.85} />
      </mesh>
      {/* Sauce drizzle */}
      <mesh position={[0.15, -0.3, 0.05]}>
        <torusGeometry args={[0.55, 0.04, 8, 32]} />
        <meshStandardMaterial color="#8b1a1a" roughness={0.4} />
      </mesh>
      {/* Garnish (greens) */}
      <mesh position={[-0.35, -0.25, -0.1]}>
        <sphereGeometry args={[0.18, 12, 8]} />
        <meshStandardMaterial color="#3a6e2a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.45, -0.27, 0.15]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#4a8a36" roughness={0.8} />
      </mesh>
      {/* Lemon wedge */}
      <mesh position={[0.5, -0.28, -0.4]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.16, 16, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#e8c14a" roughness={0.5} />
      </mesh>

      {/* Wine glass left */}
      <group position={[-1.7, 0.1, -0.6]}>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          <meshPhysicalMaterial
            color="#7a1428"
            transparent
            opacity={0.75}
            roughness={0.05}
            metalness={0.1}
            transmission={0.5}
            ior={1.4}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.05} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.05} />
        </mesh>
      </group>

      {/* Wine glass right */}
      <group position={[1.7, 0.1, -0.6]}>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          <meshPhysicalMaterial
            color="#7a1428"
            transparent
            opacity={0.75}
            roughness={0.05}
            transmission={0.5}
            ior={1.4}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.05} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.05} />
        </mesh>
      </group>

      {/* Fork */}
      <group position={[-1.5, -0.36, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <boxGeometry args={[0.04, 0.7, 0.02]} />
          <meshStandardMaterial color="#c8c8d0" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.02]} />
          <meshStandardMaterial color="#c8c8d0" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* Knife */}
      <group position={[1.5, -0.36, 0.6]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh>
          <boxGeometry args={[0.04, 0.7, 0.02]} />
          <meshStandardMaterial color="#c8c8d0" roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.08, 0.22, 0.015]} />
          <meshStandardMaterial color="#dcdce0" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Candle in center back */}
      <group position={[0, -0.3, -1.4]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
          <meshStandardMaterial color="#f0e0c0" roughness={0.6} emissive="#ff9040" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.05, 0.15, 12]} />
          <meshStandardMaterial color="#ffaa44" emissive="#ff8020" emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  );
}

export default function HeroScene() {
  const controlsRef = useRef<any>(null);
  const resumeTimer = useRef<number | undefined>(undefined);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("hero-hint-seen") === "1") {
      setHintVisible(false);
    }
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const handleStart = () => {
    if (controlsRef.current) controlsRef.current.autoRotate = false;
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    if (hintVisible) {
      setHintVisible(false);
      try { localStorage.setItem("hero-hint-seen", "1"); } catch {}
    }
  };

  const handleEnd = () => {
    resumeTimer.current = window.setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    }, 2000);
  };

  return (
    <div className="relative w-full h-full" style={{ touchAction: "none" }}>
      <Canvas
        camera={{ position: [0, 1.5, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} color="#f0c098" />
          <directionalLight position={[3, 4, 5]} intensity={0.9} color="#ffd9a8" />
          <pointLight position={[-4, 3, 2]} intensity={1.2} color="#d4824a" distance={15} />
          <pointLight position={[4, 2, 3]} intensity={0.8} color="#ff9040" distance={12} />
          <CandleGlow />

          <PlatedDish />

          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.6}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            onStart={handleStart}
            onEnd={handleEnd}
          />
        </Suspense>
      </Canvas>

      {hintVisible && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-xs uppercase tracking-widest text-primary/80 animate-pulse">
            Drag to rotate · Auto-rotates when idle
          </span>
        </div>
      )}
    </div>
  );
}
