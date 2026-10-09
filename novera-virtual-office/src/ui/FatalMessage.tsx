import { AlertTriangle } from 'lucide-react';

interface FatalMessageProps {
  readonly title: string;
  readonly description: string;
  readonly canRetry?: boolean;
}

/** Mensagem amigável que substitui a cena quando ela não pode ser exibida. */
export function FatalMessage({ title, description, canRetry = true }: FatalMessageProps) {
  return (
    <div className="fatal-message" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <h1>{title}</h1>
      <p>{description}</p>
      {canRetry && (
        <button type="button" className="icon-button" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      )}
    </div>
  );
}
