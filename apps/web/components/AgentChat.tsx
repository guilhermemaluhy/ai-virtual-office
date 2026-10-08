'use client';

import { type SyntheticEvent, useState } from 'react';
import { api } from '../lib/api';
import type { AgentDto, ChatTurnDto } from '../lib/types';

/** Conversation between the CEO and one agent. History lives only in this panel. */
export function AgentChat({ agent }: { agent: AgentDto }) {
  const [messages, setMessages] = useState<ChatTurnDto[]>([]);
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'ai' | 'offline' | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (event: SyntheticEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    const next: ChatTurnDto[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setDraft('');
    setSending(true);
    setError(null);
    try {
      const answer = await api.chat(agent.id, next);
      setMessages([...next, { role: 'assistant', content: answer.reply }]);
      setMode(answer.mode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setMessages(messages);
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chat" aria-label={`Conversa com ${agent.name}`}>
      <h3>
        Conversar com {agent.name}
        {mode && (
          <span className={`chat__mode chat__mode--${mode}`}>
            {mode === 'ai' ? 'IA' : 'modo offline'}
          </span>
        )}
      </h3>
      {messages.length > 0 && (
        <ol className="chat__log">
          {messages.map((message, index) => (
            <li key={index} className={`chat__msg chat__msg--${message.role}`}>
              {message.content}
            </li>
          ))}
          {sending && (
            <li className="chat__msg chat__msg--assistant chat__msg--typing">digitando…</li>
          )}
        </ol>
      )}
      {error && <p className="panel__error">{error}</p>}
      <form className="chat__form" onSubmit={(event) => void send(event)}>
        <label htmlFor={`chat-${agent.id}`} className="sr-only">
          Mensagem para {agent.name}
        </label>
        <input
          id={`chat-${agent.id}`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          placeholder={`Pergunte algo para ${agent.name}…`}
          maxLength={4000}
          autoComplete="off"
        />
        <button
          type="submit"
          className="button button--primary"
          disabled={sending || !draft.trim()}
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
