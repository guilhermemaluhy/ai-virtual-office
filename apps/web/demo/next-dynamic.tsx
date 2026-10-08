// Stand-in for `next/dynamic` in the standalone demo bundle (no Next.js runtime there).
import { type ComponentType, lazy, type ReactNode, Suspense } from 'react';

export default function dynamic<P extends object>(
  load: () => Promise<ComponentType<P>>,
  options: { loading?: () => ReactNode } = {},
): ComponentType<P> {
  const Lazy = lazy(async () => ({ default: await load() }));
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={options.loading?.() ?? null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}
