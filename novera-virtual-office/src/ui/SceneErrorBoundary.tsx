import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FatalMessage } from './FatalMessage.js';

interface Props {
  readonly children: ReactNode;
  readonly onError: () => void;
}

interface State {
  readonly failed: boolean;
}

/** Captura falhas da cena 3D sem derrubar o restante da interface. */
export class SceneErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha na cena 3D', error, info.componentStack);
    this.props.onError();
  }

  override render() {
    if (this.state.failed) {
      return (
        <FatalMessage
          title="Não foi possível exibir o escritório"
          description="Ocorreu um erro ao montar a cena 3D. Recarregue a página; se persistir, atualize o navegador ou os drivers de vídeo."
        />
      );
    }
    return this.props.children;
  }
}
