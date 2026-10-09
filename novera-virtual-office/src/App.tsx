import { useCallback, useRef, useState } from 'react';
import { isStatsEnabled } from './config/app.js';
import { supportsWebGL2 } from './lib/webgl.js';
import type { CameraControllerRef } from './scene/camera/cameraController.js';
import { OfficeCanvas } from './scene/OfficeCanvas.js';
import type { SystemStatus } from './systemStatus.js';
import { FatalMessage } from './ui/FatalMessage.js';
import { LoadingOverlay } from './ui/LoadingOverlay.js';
import { SceneErrorBoundary } from './ui/SceneErrorBoundary.js';
import { TopBar } from './ui/TopBar.js';
import { ViewControls } from './ui/ViewControls.js';

interface AppProps {
  /** Injetável para testes (jsdom não tem WebGL). */
  readonly webglAvailable?: boolean;
}

export function App({ webglAvailable = supportsWebGL2() }: AppProps) {
  const [status, setStatus] = useState<SystemStatus>(webglAvailable ? 'loading' : 'unsupported');
  const controllerRef = useRef<CameraControllerRef['current']>(null);

  const handleReady = useCallback(() => setStatus('ready'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  return (
    <div className="app">
      <main className="viewport">
        {status === 'unsupported' ? (
          <FatalMessage
            title="Seu navegador não suporta WebGL 2"
            description="O escritório 3D precisa de aceleração gráfica. Use uma versão atual do Chrome, Edge, Firefox ou Safari e verifique se a aceleração de hardware está ativada."
            canRetry={false}
          />
        ) : status === 'error' ? (
          <FatalMessage
            title="A renderização foi interrompida"
            description="O contexto gráfico foi perdido ou a cena falhou. Recarregue a página para continuar."
          />
        ) : (
          <SceneErrorBoundary onError={handleError}>
            <OfficeCanvas
              controllerRef={controllerRef}
              onReady={handleReady}
              onContextLost={handleError}
              showStats={isStatsEnabled()}
            />
            <LoadingOverlay sceneReady={status === 'ready'} />
          </SceneErrorBoundary>
        )}
      </main>

      <TopBar status={status} />
      {status === 'ready' && (
        <ViewControls onResetView={() => controllerRef.current?.resetView()} />
      )}
    </div>
  );
}
