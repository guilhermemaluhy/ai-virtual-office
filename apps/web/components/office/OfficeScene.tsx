'use client';

import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { MARKETPLACES } from '@aivo/shared';
import { useMemo, useState } from 'react';
import {
  APPROVAL_BOARD,
  CEO_DESK,
  deskFor,
  FLOOR_PLAN,
  MEETING_TABLE,
  MEETING_TABLE_RADIUS,
  meetingSeats,
} from '../../lib/office/layout';
import { MARKETPLACE_COLORS, PALETTE, SHARED_COLORS } from '../../lib/office/theme';
import type { AgentDto } from '../../lib/types';
import { Avatar } from './Avatar';
import {
  ApprovalBoard,
  Box,
  Chair,
  Desk,
  FloorArea,
  MeetingTable,
  Plant,
  RoomLabel,
  Shelf,
} from './Furniture';

export interface OfficeSceneProps {
  agents: AgentDto[];
  currentTasks: Record<string, string>;
  pendingApprovals: number;
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
  onOpenApprovals: () => void;
}

const WALL_HEIGHT = 2.8;
const [minX, maxX] = FLOOR_PLAN.bounds.x;
const [minZ, maxZ] = FLOOR_PLAN.bounds.z;

function Walls() {
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const glass = { color: PALETTE.glass, opacity: 0.35 };
  return (
    <>
      {/* Back and left walls (the camera looks from the front-right). */}
      <Box
        position={[0, WALL_HEIGHT / 2, minZ - 0.1]}
        size={[width + 0.4, WALL_HEIGHT, 0.2]}
        color={PALETTE.wall}
      />
      <Box
        position={[minX - 0.1, WALL_HEIGHT / 2, (minZ + maxZ) / 2]}
        size={[0.2, WALL_HEIGHT, depth]}
        color={PALETTE.wall}
      />
      <Box position={[0, 0.05, minZ + 0.02]} size={[width, 0.1, 0.06]} color={PALETTE.wallTrim} />
      {/* CEO room partition, with doors to each wing and the meeting room. */}
      {[
        [-13.5, 5],
        [-2.75, 4.5],
        [2.75, 4.5],
        [13.5, 5],
      ].map(([x = 0, w = 0]) => (
        <Box key={x} position={[x, 0.55, -5]} size={[w, 1.1, 0.12]} color={PALETTE.wallTrim} />
      ))}
      {/* Glass meeting room. */}
      {[-5, 5].map((x) => (
        <Box
          key={x}
          position={[x, 1.2, -1.5]}
          size={[0.06, 2.4, 7]}
          color={glass.color}
          opacity={glass.opacity}
          castShadow={false}
        />
      ))}
      <Box
        position={[-3, 1.2, 2]}
        size={[4, 2.4, 0.06]}
        color={glass.color}
        opacity={glass.opacity}
        castShadow={false}
      />
      <Box
        position={[3, 1.2, 2]}
        size={[4, 2.4, 0.06]}
        color={glass.color}
        opacity={glass.opacity}
        castShadow={false}
      />
    </>
  );
}

/** Isometric camera whose zoom fits the whole floor, from phones to wide screens. */
function FittedCamera() {
  const { width, height } = useThree((state) => state.size);
  // Phones show about half the floor (pan to see the rest); larger screens show all of it.
  const zoom = width < 720 ? width / 22 : Math.max(8, Math.min(width / 40, height / 25));
  return (
    <OrthographicCamera makeDefault position={[24, 26, 28]} zoom={zoom} near={-100} far={200} />
  );
}

function CeoRoom() {
  const [x, , z] = CEO_DESK;
  return (
    <>
      <FloorArea rect={{ x: [-7, 1], z: [-10.6, -6] }} color="#e5dcf7" y={0.012} />
      <Desk position={CEO_DESK} large monitorOn />
      <Chair position={[x, 0, z - 0.9]} color={PALETTE.ceo} scale={1.25} />
      <Box position={[x - 0.6, 0.8, z]} size={[0.25, 0.08, 0.18]} color={PALETTE.ceoAccent} />
      {/* Sofa */}
      <Box position={[-11, 0.3, -9.6]} size={[3.2, 0.6, 1]} color="#8f7fc4" />
      <Box position={[-11, 0.75, -10.05]} size={[3.2, 0.6, 0.25]} color="#8f7fc4" />
      <Box position={[-11, 0.25, -8.2]} size={[1.4, 0.5, 0.8]} color={PALETTE.wood} />
      <Plant position={[-15, 0, -10.2]} size={1.3} />
      <Plant position={[15, 0, -10.2]} size={1.3} />
      <Plant position={[1.6, 0, -10.2]} />
    </>
  );
}

function StockRoom() {
  return (
    <>
      <Shelf position={[-3.2, 0, 8.4]} />
      <Shelf position={[3.2, 0, 8.4]} />
      <Shelf position={[-4.4, 0, 4.6]} rotationY={Math.PI / 2} />
      <Box position={[3.6, 0.25, 4]} size={[0.6, 0.5, 0.6]} color="#c8a06e" />
      <Box position={[4.1, 0.2, 4.5]} size={[0.5, 0.4, 0.5]} color="#b98d58" />
      <Box position={[3.7, 0.65, 4.1]} size={[0.45, 0.3, 0.45]} color="#d6b585" />
    </>
  );
}

export function OfficeScene({
  agents,
  currentTasks,
  pendingApprovals,
  selectedAgentId,
  onSelectAgent,
  onOpenApprovals,
}: OfficeSceneProps) {
  const inMeeting = useMemo(() => agents.filter((a) => a.state === 'meeting'), [agents]);
  const seats = useMemo(() => meetingSeats(inMeeting.length), [inMeeting.length]);
  // drei <Html> loses its content if it mounts before the canvas is attached to the DOM
  // (its portal target changes after the first render), so the scene mounts once ready.
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      onCreated={() => {
        setReady(true);
      }}
      onPointerMissed={() => {
        onSelectAgent(null);
      }}
    >
      <color attach="background" args={[PALETTE.background]} />
      {ready && (
        <>
          <FittedCamera />
          <OrbitControls
            target={[0, 0, -1]}
            screenSpacePanning
            minZoom={6}
            maxZoom={80}
            minPolarAngle={0.55}
            maxPolarAngle={1.15}
            minAzimuthAngle={0.15}
            maxAzimuthAngle={1.25}
          />
          <hemisphereLight args={['#ffffff', '#cfd6e3', 1.6]} />
          <directionalLight
            position={[12, 22, 14]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-22}
            shadow-camera-right={22}
            shadow-camera-top={18}
            shadow-camera-bottom={-18}
          />

          {/* Floors */}
          <FloorArea rect={FLOOR_PLAN.bounds} color={PALETTE.floorBase} y={0} />
          <FloorArea rect={FLOOR_PLAN.ceoRoom} color="#f1ecfb" />
          {MARKETPLACES.map((m) => (
            <FloorArea key={m} rect={FLOOR_PLAN.wings[m]} color={MARKETPLACE_COLORS[m].floor} />
          ))}
          <FloorArea rect={FLOOR_PLAN.meetingRoom} color="#e3eef6" />
          <FloorArea rect={FLOOR_PLAN.stockRoom} color={SHARED_COLORS.floor} />

          <Walls />
          <CeoRoom />
          <StockRoom />
          <MeetingTable position={MEETING_TABLE} radius={MEETING_TABLE_RADIUS} />
          <ApprovalBoard
            position={APPROVAL_BOARD}
            pending={pendingApprovals}
            onOpen={onOpenApprovals}
          />

          <RoomLabel position={[CEO_DESK[0] + 3.2, 0.1, CEO_DESK[2] + 1.6]}>
            Sala do CEO (você)
          </RoomLabel>
          <RoomLabel position={[-14.2, 0.1, -4.2]}>Mercado Livre</RoomLabel>
          <RoomLabel position={[14.2, 0.1, -4.2]}>Shopee</RoomLabel>
          <RoomLabel position={[0, 0.1, -4.4]}>Sala de reunião</RoomLabel>
          <RoomLabel position={[3.2, 0.1, 3]}>Estoque</RoomLabel>
          <Plant position={[-15.3, 0, 8.3]} />
          <Plant position={[15.3, 0, 8.3]} />
          <Plant position={[-5.6, 0, -4.4]} size={0.9} />
          <Plant position={[5.6, 0, -4.4]} size={0.9} />

          {agents.map((agent) => {
            const spot = deskFor(agent.role, agent.marketplace);
            const meetingIndex = inMeeting.indexOf(agent);
            const seat = meetingIndex >= 0 ? seats[meetingIndex] : undefined;
            const facing = seat
              ? Math.atan2(MEETING_TABLE[0] - seat[0], MEETING_TABLE[2] - seat[2])
              : 0;
            return (
              <group key={agent.id}>
                <Desk
                  position={spot.desk}
                  large={spot.large}
                  alert={agent.state === 'alert'}
                  monitorOn={agent.state === 'working' || agent.state === 'awaiting_approval'}
                />
                <Avatar
                  agent={agent}
                  position={seat ?? spot.seat}
                  facing={facing}
                  currentTask={currentTasks[agent.id]}
                  selected={agent.id === selectedAgentId}
                  onSelect={onSelectAgent}
                />
              </group>
            );
          })}
        </>
      )}
    </Canvas>
  );
}
