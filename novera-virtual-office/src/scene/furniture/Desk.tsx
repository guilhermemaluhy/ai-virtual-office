import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';
import { DeskItems } from './DeskItems.js';
import { DeskLamp } from './DeskLamp.js';
import { Keyboard } from './Keyboard.js';
import { Monitor } from './Monitor.js';
import { Mouse } from './Mouse.js';

export const DESK_HEIGHT = 0.74;
const TOP_THICKNESS = 0.035;
const WIDTH = 1.6;
const DEPTH = 0.8;

/**
 * Mesa de trabalho: tampo de carvalho sobre dois pés tipo trenó em metal escuro.
 * Quem usa senta em -Z (local) e olha para +Z; o monitor fica na borda +Z.
 */
export function Desk() {
  const m = useMaterials();
  const legX = WIDTH / 2 - 0.1;
  const legHeight = DESK_HEIGHT - TOP_THICKNESS;

  return (
    <group name="desk">
      <RoundedBox
        args={[WIDTH, TOP_THICKNESS, DEPTH]}
        radius={0.01}
        smoothness={3}
        position={[0, DESK_HEIGHT - TOP_THICKNESS / 2, 0]}
        material={m.oak}
        castShadow
        receiveShadow
      />
      {[-legX, legX].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-DEPTH / 2 + 0.08, DEPTH / 2 - 0.08].map((z) => (
            <mesh key={z} position={[0, legHeight / 2, z]} material={m.darkMetal} castShadow>
              <boxGeometry args={[0.05, legHeight, 0.05]} />
            </mesh>
          ))}
          <mesh position={[0, 0.02, 0]} material={m.darkMetal} castShadow>
            <boxGeometry args={[0.05, 0.04, DEPTH - 0.1]} />
          </mesh>
          <mesh position={[0, legHeight - 0.03, 0]} material={m.darkMetal}>
            <boxGeometry args={[0.05, 0.05, DEPTH - 0.1]} />
          </mesh>
        </group>
      ))}
      {/* travessa e calha de cabos */}
      <mesh position={[0, legHeight - 0.03, DEPTH / 2 - 0.08]} material={m.darkMetal}>
        <boxGeometry args={[WIDTH - 0.25, 0.05, 0.05]} />
      </mesh>
      <mesh position={[0, legHeight - 0.09, 0.25]} material={m.darkMetal}>
        <boxGeometry args={[0.9, 0.06, 0.14]} />
      </mesh>
      {/* mesa-pad */}
      <mesh position={[0.05, DESK_HEIGHT + 0.002, -0.06]} material={m.blackPlastic} receiveShadow>
        <boxGeometry args={[0.85, 0.004, 0.42]} />
      </mesh>

      <group position={[0, DESK_HEIGHT, 0]}>
        <Monitor position={[0, 0, 0.22]} />
        <Keyboard position={[0, 0, -0.1]} />
        <Mouse position={[0.36, 0, -0.1]} />
        <DeskLamp position={[-0.6, 0, 0.25]} />
        <DeskItems />
      </group>
    </group>
  );
}
