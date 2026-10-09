import { useMaterials } from '../materials/MaterialsProvider.js';

/** Mesa de centro redonda com três pés inclinados e uma bandeja. */
export function CoffeeTable() {
  const m = useMaterials();
  return (
    <group name="coffee-table">
      <mesh position={[0, 0.4, 0]} material={m.oak} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.03, 40]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 0.26, 0.195, Math.cos(angle) * 0.26]}
            rotation={[Math.cos(angle) * 0.14, 0, -Math.sin(angle) * 0.14]}
            material={m.darkMetal}
            castShadow
          >
            <cylinderGeometry args={[0.014, 0.018, 0.39, 10]} />
          </mesh>
        );
      })}
      <mesh position={[0.05, 0.423, -0.05]} material={m.darkMetal} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.014, 32]} />
      </mesh>
      <mesh position={[-0.12, 0.43, 0.14]} rotation-y={0.4} castShadow>
        <boxGeometry args={[0.2, 0.025, 0.26]} />
        <meshStandardMaterial color="#8c3b3b" roughness={0.85} />
      </mesh>
    </group>
  );
}
