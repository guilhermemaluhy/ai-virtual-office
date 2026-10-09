import { RoundedBox } from '@react-three/drei';
import type { Vec3 } from '../../lib/math.js';
import { useMaterials } from '../materials/MaterialsProvider.js';

const PANEL_W = 0.615;
const PANEL_H = 0.37;
const PANEL_T = 0.018;
const CENTER_Y = 0.39;

/** Monitor de 27" em base fina. A tela olha para -Z (para quem usa a mesa). */
export function Monitor({ position }: { readonly position: Vec3 }) {
  const m = useMaterials();
  return (
    <group name="monitor" position={position}>
      <mesh position={[0, 0.006, 0]} material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.012, 32]} />
      </mesh>
      <mesh position={[0, 0.17, 0.03]} material={m.darkMetal} castShadow>
        <boxGeometry args={[0.06, 0.32, 0.025]} />
      </mesh>
      <RoundedBox
        args={[PANEL_W, PANEL_H, PANEL_T]}
        radius={0.004}
        smoothness={2}
        position={[0, CENTER_Y, 0]}
        material={m.blackPlastic}
        castShadow
      />
      <mesh
        position={[0, CENTER_Y, -PANEL_T / 2 - 0.0005]}
        rotation-y={Math.PI}
        material={m.screen}
      >
        <planeGeometry args={[PANEL_W - 0.02, PANEL_H - 0.02]} />
      </mesh>
      <mesh position={[0, CENTER_Y - PANEL_H / 2 + 0.008, -PANEL_T / 2 - 0.001]} material={m.bulb}>
        <boxGeometry args={[0.012, 0.003, 0.001]} />
      </mesh>
    </group>
  );
}
