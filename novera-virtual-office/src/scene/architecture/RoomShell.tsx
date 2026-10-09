import { ROOM } from '../../config/office.js';

/**
 * Casca provisória da sala (Etapa 1): piso, paredes e uma peça de referência de escala.
 * Materiais simples e sem textura — serão substituídos por materiais PBR na Etapa 2.
 */
export function RoomShell() {
  const { width, depth, height, wallThickness: t } = ROOM;
  const wallColor = '#d9d4cc';

  return (
    <group name="room-shell">
      <mesh name="floor" rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#8a7563" roughness={0.75} />
      </mesh>

      <mesh name="ceiling" position={[0, height, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#efece6" roughness={1} />
      </mesh>

      {/* Parede do fundo (Z-) e lateral esquerda (X-) */}
      <mesh name="wall-back" position={[0, height / 2, -depth / 2 - t / 2]} receiveShadow>
        <boxGeometry args={[width + 2 * t, height, t]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh name="wall-left" position={[-width / 2 - t / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[t, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Paredes da frente (Z+) e direita (X+): só visíveis por dentro, para não bloquear a vista. */}
      <mesh name="wall-front" position={[0, height / 2, depth / 2 + t / 2]} receiveShadow>
        <boxGeometry args={[width + 2 * t, height, t]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh name="wall-right" position={[width / 2 + t / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[t, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Referência de escala: 1 m × 0,75 m (altura de uma mesa). Removida na Etapa 3. */}
      <mesh name="scale-reference" position={[-0.5, 0.375, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.75, 1]} />
        <meshStandardMaterial color="#5b6573" roughness={0.6} />
      </mesh>
    </group>
  );
}
