import { RoundedBox } from '@react-three/drei';
import { useMaterials } from '../materials/MaterialsProvider.js';
import { WallArt } from './WallArt.js';

const WIDTH = 1.8;
const DEPTH = 0.45;
const BODY_H = 0.62;
const LEG_H = 0.12;
const STACK_COLORS = ['#1f2d3d', '#c89b6d', '#e0b354'] as const;

/** Aparador em nogueira com três portas, pés metálicos e objetos sobre o tampo. Frente em +Z. */
export function Sideboard() {
  const m = useMaterials();
  const top = LEG_H + BODY_H + 0.02;
  return (
    <group name="sideboard">
      <RoundedBox
        args={[WIDTH, BODY_H, DEPTH]}
        radius={0.006}
        smoothness={2}
        position={[0, LEG_H + BODY_H / 2, 0]}
        material={m.walnut}
        castShadow
        receiveShadow
      />
      <mesh position={[0, LEG_H + BODY_H + 0.01, 0]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[WIDTH + 0.03, 0.02, DEPTH + 0.03]} />
      </mesh>
      {[-0.59, 0, 0.59].map((x) => (
        <group key={x} position={[x, LEG_H + BODY_H / 2, DEPTH / 2 + 0.004]}>
          <RoundedBox
            args={[0.56, BODY_H - 0.06, 0.01]}
            radius={0.004}
            smoothness={2}
            material={m.walnut}
            castShadow
          />
          <mesh position={[0.2, 0, 0.012]} material={m.chrome}>
            <boxGeometry args={[0.012, 0.16, 0.012]} />
          </mesh>
        </group>
      ))}
      {[-WIDTH / 2 + 0.08, WIDTH / 2 - 0.08].flatMap((x) =>
        [-DEPTH / 2 + 0.06, DEPTH / 2 - 0.06].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, LEG_H / 2, z]} material={m.darkMetal} castShadow>
            <cylinderGeometry args={[0.012, 0.012, LEG_H, 10]} />
          </mesh>
        )),
      )}
      {/* objetos sobre o aparador */}
      <mesh position={[-0.55, top + 0.14, 0]} material={m.ceramicDark} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.28, 24]} />
      </mesh>
      <mesh position={[-0.55, top + 0.33, 0]}>
        <sphereGeometry args={[0.09, 14, 10]} />
        <meshStandardMaterial color="#5a7a4a" roughness={0.9} />
      </mesh>
      <group position={[0.1, top, 0.02]}>
        {STACK_COLORS.map((color, i) => (
          <mesh
            key={color}
            position={[(i - 1) * 0.01, 0.015 + i * 0.03, 0]}
            rotation-y={(i - 1) * 0.08}
            castShadow
          >
            <boxGeometry args={[0.22, 0.03, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        ))}
      </group>
      <WallArt
        size={[0.18, 0.24]}
        variant={1}
        position={[0.65, top + 0.12, -0.05]}
        rotation={[-0.15, 0, 0]}
      />
    </group>
  );
}
