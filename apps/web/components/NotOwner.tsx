import { SignOutButton } from './SignOutButton';

export function NotOwner({ email }: { email: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold">Esta conta não é a do dono</h1>
        <p className="mt-2 text-sm text-muted">
          {email ? `${email} entrou, mas ` : 'Você entrou, mas '}
          só o dono da loja pode usar o escritório. Se este é o seu caso, peça para o primeiro
          usuário criado liberar o acesso.
        </p>
        <div className="mt-6 flex justify-center">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
