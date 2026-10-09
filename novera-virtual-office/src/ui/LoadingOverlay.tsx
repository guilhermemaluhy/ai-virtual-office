import { useProgress } from '@react-three/drei';

interface LoadingOverlayProps {
  readonly sceneReady: boolean;
}

/** Cobre a tela até o renderizador estar pronto e os recursos (texturas/modelos) carregados. */
export function LoadingOverlay({ sceneReady }: LoadingOverlayProps) {
  const { active, progress } = useProgress();
  const visible = !sceneReady || active;

  return (
    <div className="loading-overlay" data-visible={visible} aria-hidden={!visible}>
      <div className="loading-overlay__spinner" />
      <p>Preparando o escritório{active ? ` · ${Math.round(progress)}%` : '…'}</p>
    </div>
  );
}
