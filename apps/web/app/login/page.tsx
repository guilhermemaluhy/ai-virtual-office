import { LoginForm } from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Escritório IA da Loja
        </p>
        <h1 className="mt-1 text-2xl font-bold">Entrar</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Só o dono da loja tem acesso.</p>
        <LoginForm />
      </section>
    </main>
  );
}
