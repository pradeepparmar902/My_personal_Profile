import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  pointerRef: React.MutableRefObject<{ x: number; y: number; isDragging: boolean; dragStart: { x: number; y: number } }>;
}

function ParticleField({ pointerRef }: ParticleFieldProps) {
  const count = 1200;
  const pointsRef = useRef<THREE.Points>(null);
  const { size, camera } = useThree();

  // Generate random positions and colors for particles
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorChoices = [
      new THREE.Color("#d4af37"), // Elegant Gold
      new THREE.Color("#aa7c11"), // Dark Gold
      new THREE.Color("#f3e5ab"), // Vanilla/Champagne
      new THREE.Color("#1a1a1a"), // Deep Charcoal
      new THREE.Color("#4a3b10"), // Bronze
    ];

    for (let i = 0; i < count; i++) {
      // Create a spherical/cloud distribution
      const r = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      // Gentle wavy rotation over time
      pointsRef.current.rotation.y = time * 0.04;
      pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;

      // React to pointer coordinates (Gaze-tracking simulation)
      const targetX = pointerRef.current.x * 4;
      const targetY = pointerRef.current.y * 3;

      // Smoothly interpolate the camera coordinates (Camera sway following eye/cursor)
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Interactive distortion of the particles based on mouse drag/touch gesture
      if (pointerRef.current.isDragging) {
        pointsRef.current.rotation.y += pointerRef.current.x * 0.08;
        pointsRef.current.rotation.z += pointerRef.current.y * 0.05;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        depthWrite={false}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Subtle abstract rings that frame the background
function BackgroundRings() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.z = time * 0.02;
      meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[18, 0.02, 16, 100]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[25, 0.015, 8, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export default function Background3D() {
  const pointer = useRef({ x: 0, y: 0, isDragging: false, dragStart: { x: 0, y: 0 } });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize pointer coordinates to -1 to +1 range
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    // Gestures for touchscreens and dragging
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        pointer.current.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = (event.touches[0].clientY / window.innerHeight) * 2 - 1;
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      pointer.current.isDragging = true;
      pointer.current.dragStart = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      pointer.current.isDragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-radial from-[#121212] via-[#0d0d0d] to-[#050505] overflow-hidden">
      {/* Dynamic Ambient Background Shader Effect - represented as absolute glow circles */}
      <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#d4af37]/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#8a6d1c]/10 to-transparent blur-[150px]" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 35], fov: 60 }}
        style={{ pointerEvents: "none" }} // Keeps canvas interactive to pointer sways but clicks pass through to content
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <ParticleField pointerRef={pointer} />
        <BackgroundRings />
      </Canvas>
    </div>
  );
}
