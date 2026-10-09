import { Stats } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

/**
 * Ativado com `?stats` na URL: mostra FPS e registra no console draw calls,
 * triângulos e memória de GPU após alguns quadros. Não entra no fluxo normal.
 */
export function RenderStats() {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  const frames = useRef(0);
  useEffect(() => {
    // Acesso de depuração no console do navegador (só com ?stats).
    Object.assign(window, { __novera: { gl, camera, controls } });
  }, [gl, camera, controls]);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 10) {
      const { render, memory } = gl.info;
      console.info('[novera] render', {
        drawCalls: render.calls,
        triangles: render.triangles,
        geometries: memory.geometries,
        textures: memory.textures,
      });
    }
  });
  return <Stats />;
}
