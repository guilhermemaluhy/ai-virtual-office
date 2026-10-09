import { Keyboard, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface ViewControlsProps {
  readonly onResetView: () => void;
}

/** Controles discretos da câmera, no canto inferior esquerdo. */
export function ViewControls({ onResetView }: ViewControlsProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="view-controls">
      {showHelp && (
        <div className="view-controls__help" id="navigation-help">
          <p>
            <strong>Mouse:</strong> arrastar gira · botão direito desloca · roda aproxima
          </p>
          <p>
            <strong>Teclado:</strong> W A S D / setas movem · Q E giram · + − aproximam · R volta à
            visão inicial
          </p>
        </div>
      )}
      <div className="view-controls__buttons">
        <button
          type="button"
          className="icon-button"
          onClick={onResetView}
          title="Voltar à visão inicial (R)"
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Visão inicial</span>
        </button>
        <button
          type="button"
          className="icon-button"
          aria-expanded={showHelp}
          aria-controls="navigation-help"
          onClick={() => setShowHelp((value) => !value)}
          title="Atalhos de navegação"
        >
          <Keyboard size={16} aria-hidden="true" />
          <span className="visually-hidden">Atalhos de navegação</span>
        </button>
      </div>
    </div>
  );
}
