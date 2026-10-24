import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line } from '@react-three/drei';
import type { AircraftTelemetry } from '@/types/simulation';

// Coordinate conversion constants
const ORIGIN_LAT = -1.2921;
const ORIGIN_LNG = 36.8219;
const SCALE = 1000; // degrees → scene units (approx 111 m per 0.001 deg)

function latLngToScene(lat: number, lng: number): [number, number, number] {
  return [
    (lng - ORIGIN_LNG) * SCALE,
    0,
    (lat - ORIGIN_LAT) * SCALE,
  ];
}

// Fixed simulated waypoints visibly distributed around origin
const WAYPOINTS: [number, number, number][] = [
  [0, 0, 0],
  [50, 0, 50],
  [90, 0, -20],
  [-80, 0, 30],
  [-40, 0, -70],
  [20, 0, -100],
  [110, 0, 60],
  [-60, 0, 90],
];

// Drone geometry: box body + 4 arms + 4 propeller discs
function DroneModel({ heading }: { heading: number }) {
  const group = useRef<THREE.Group>(null!);
  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = (heading * Math.PI) / 180;
    }
  }, [heading]);
  const armOffsets: [number, number, number][] = [
    [1.2, 0, 1.2], [-1.2, 0, 1.2], [1.2, 0, -1.2], [-1.2, 0, -1.2],
  ];
  return (
    <group ref={group}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[1.2, 0.3, 1.2]} />
        <meshStandardMaterial color="#00e5ff" />
      </mesh>
      {/* Arms */}
      {armOffsets.map(([x, y, z], i) => (
        <mesh key={i} position={[x * 0.6, y, z * 0.6]}>
          <boxGeometry args={[1.0, 0.1, 0.1]} />
          <meshStandardMaterial color="#1a3a5c" />
        </mesh>
      ))}
      {/* Propeller discs */}
      {armOffsets.map(([x, y, z], i) => (
        <mesh key={`prop-${i}`} position={[x, y + 0.2, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05, 16]} />
          <meshStandardMaterial color="#00e5ff" opacity={0.5} transparent />
        </mesh>
      ))}
    </group>
  );
}

interface AircraftMeshProps {
  telemetry: AircraftTelemetry;
  simState: 'idle' | 'running' | 'paused';
}

function AircraftMesh({ telemetry, simState }: AircraftMeshProps) {
  const group = useRef<THREE.Group>(null!);
  const targetPos = useRef(new THREE.Vector3());

  // Update target only when simulation is actively running
  useEffect(() => {
    if (simState !== 'running') return;
    const [sx, , sz] = latLngToScene(telemetry.position.lat, telemetry.position.lng);
    targetPos.current.set(sx, telemetry.altitudeM, sz);
  }, [telemetry, simState]);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.lerp(targetPos.current, 0.05);
  });

  return (
    <group ref={group}>
      <DroneModel heading={telemetry.headingDeg} />
    </group>
  );
}

function WaypointMarkers() {
  return (
    <>
      {WAYPOINTS.map(([x, _y, z], i) => (
        <mesh key={i} position={[x, 2, z]}>
          <sphereGeometry args={[1.5, 8, 8]} />
          <meshStandardMaterial color="#00e5ff" emissive="#007f8f" />
        </mesh>
      ))}
    </>
  );
}

function RouteLine() {
  // Lift waypoints slightly above ground
  const points = WAYPOINTS.map(([x, _y, z]) => new THREE.Vector3(x, 3, z));
  return <Line points={points} color="#00e5ff" lineWidth={1.5} />;
}

export interface FlightSceneProps {
  telemetry: AircraftTelemetry;
  simState: 'idle' | 'running' | 'paused';
}

export default function FlightScene({ telemetry, simState }: FlightSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 80, 200], fov: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#050d1a'));
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1.0} />
      <Grid
        args={[400, 400]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#1a3a5c"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#0e6e8a"
        fadeDistance={500}
        infiniteGrid
      />
      <axesHelper args={[30]} />
      <WaypointMarkers />
      <RouteLine />
      <AircraftMesh telemetry={telemetry} simState={simState} />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </Canvas>
  );
}
