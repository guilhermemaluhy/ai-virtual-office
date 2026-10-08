'use client';

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { type Rect, type Vec3 } from '../../lib/office/layout';
import { PALETTE } from '../../lib/office/theme';

export function Box({
  position,
  size,
  color,
  opacity,
  emissive,
  castShadow = true,
}: {
  position: Vec3;
  size: Vec3;
  color: string;
  opacity?: number | undefined;
  emissive?: string | undefined;
  castShadow?: boolean;
}) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? 0.9 : 0}
        roughness={0.8}
      />
    </mesh>
  );
}

/** Flat colored area on the floor (rug / wing carpet). */
export function FloorArea({ rect, color, y = 0.005 }: { rect: Rect; color: string; y?: number }) {
  const width = rect.x[1] - rect.x[0];
  const depth = rect.z[1] - rect.z[0];
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[(rect.x[0] + rect.x[1]) / 2, y, (rect.z[0] + rect.z[1]) / 2]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

export function RoomLabel({ position, children }: { position: Vec3; children: string }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div className="room-label">{children}</div>
    </Html>
  );
}

export function Desk({
  position,
  large = false,
  alert = false,
  monitorOn = false,
}: {
  position: Vec3;
  large?: boolean;
  alert?: boolean;
  monitorOn?: boolean;
}) {
  const width = large ? 2.3 : 1.7;
  const [x, , z] = position;
  return (
    <group position={[x, 0, z]}>
      <Box
        position={[0, 0.74, 0]}
        size={[width, 0.06, 0.85]}
        color={alert ? PALETTE.alert : large ? PALETTE.wood : PALETTE.desk}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[side * (width / 2 - 0.08), 0.37, 0]}
          size={[0.06, 0.74, 0.75]}
          color={PALETTE.deskLeg}
        />
      ))}
      {/* Monitor faces the agent sitting behind the desk (−z). */}
      <Box position={[0, 1.02, 0.22]} size={[0.72, 0.42, 0.04]} color={PALETTE.monitorOff} />
      <Box
        position={[0, 1.02, 0.195]}
        size={[0.66, 0.36, 0.01]}
        color={monitorOn ? PALETTE.monitorOn : '#3a3f4b'}
        emissive={monitorOn ? PALETTE.monitorOn : undefined}
      />
      <Box position={[0, 0.8, 0.22]} size={[0.06, 0.1, 0.06]} color={PALETTE.deskLeg} />
      <Box position={[0, 0.775, -0.12]} size={[0.5, 0.02, 0.16]} color="#d9dde5" />
    </group>
  );
}

export function Chair({
  position,
  color = '#59627a',
  scale = 1,
}: {
  position: Vec3;
  color?: string;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Box position={[0, 0.45, 0]} size={[0.5, 0.08, 0.5]} color={color} />
      <Box position={[0, 0.78, -0.24]} size={[0.5, 0.62, 0.07]} color={color} />
      <Box position={[0, 0.22, 0]} size={[0.06, 0.44, 0.06]} color={PALETTE.deskLeg} />
    </group>
  );
}

export function Plant({ position, size = 1 }: { position: Vec3; size?: number }) {
  return (
    <group position={position} scale={size}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.44, 12]} />
        <meshStandardMaterial color="#d8cbb8" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color="#5fae6b" flatShading />
      </mesh>
      <mesh position={[0.12, 1.02, 0.05]} castShadow>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#77c283" flatShading />
      </mesh>
    </group>
  );
}

export function Shelf({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const boxColors = ['#c8a06e', '#b98d58', '#d6b585', '#a97d4c'];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[0.05, 0.75, 1.45].map((y) => (
        <Box key={y} position={[0, y, 0]} size={[2.4, 0.05, 0.6]} color="#8d96a8" />
      ))}
      {[-1.17, 1.17].map((x) => (
        <Box key={x} position={[x, 0.85, 0]} size={[0.06, 1.7, 0.6]} color="#8d96a8" />
      ))}
      {[0.08, 0.78, 1.48].flatMap((y, row) =>
        [-0.8, -0.2, 0.45].map((x, col) => (
          <Box
            key={`${String(row)}-${String(col)}`}
            position={[x, y + 0.2, 0]}
            size={[0.5, 0.36, 0.45]}
            color={boxColors[(row + col) % boxColors.length] ?? '#c8a06e'}
          />
        )),
      )}
    </group>
  );
}

export function MeetingTable({ position, radius }: { position: Vec3; radius: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.08, 40]} />
        <meshStandardMaterial color={PALETTE.wood} />
      </mesh>
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.74, 16]} />
        <meshStandardMaterial color={PALETTE.woodDark} />
      </mesh>
    </group>
  );
}

export function ApprovalBoard({
  position,
  pending,
  onOpen,
}: {
  position: Vec3;
  pending: number;
  onOpen: () => void;
}) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onOpen();
  };
  const cards = Math.min(pending, 8);
  return (
    <group position={position} onClick={handleClick}>
      <Box position={[0, 1.7, 0]} size={[3.6, 1.9, 0.08]} color={PALETTE.woodDark} />
      <Box position={[0, 1.7, 0.05]} size={[3.4, 1.7, 0.02]} color="#d9b98c" />
      {Array.from({ length: cards }, (_, i) => (
        <Box
          key={i}
          position={[-1.3 + (i % 4) * 0.86, 2.15 - Math.floor(i / 4) * 0.75, 0.08]}
          size={[0.62, 0.5, 0.01]}
          color={i % 2 ? '#fff6c9' : '#ffffff'}
          castShadow={false}
        />
      ))}
      <Html position={[0, 2.95, 0.1]} center zIndexRange={[20, 0]}>
        <button
          type="button"
          className={`board-tag${pending ? ' board-tag--pending' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          📌 Aprovações pendentes: <strong>{pending}</strong>
        </button>
      </Html>
    </group>
  );
}
