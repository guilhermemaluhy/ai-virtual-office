export interface Worker {
  stop(): Promise<void>;
}

/**
 * Runs `tick` every `intervalMs`, never overlapping executions. Queue consumers
 * (Redis-backed) replace this loop in a later phase.
 */
export function startWorker(
  tick: () => Promise<void>,
  intervalMs: number,
  onError: (error: unknown) => void = console.error,
): Worker {
  let running: Promise<void> = Promise.resolve();
  let stopped = false;

  const timer = setInterval(() => {
    running = running.then(tick).catch(onError);
  }, intervalMs);

  return {
    async stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      await running;
    },
  };
}
