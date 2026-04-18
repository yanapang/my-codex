import { inferRunOutcome, isTerminalRunOutcome, type RunOutcome } from './run-outcome.js';

export interface RunContinuationStateLike {
  current_phase?: unknown;
  run_outcome?: unknown;
  active?: unknown;
  completed_at?: unknown;
  [key: string]: unknown;
}

export interface RunContinuationSnapshot {
  outcome: RunOutcome;
  terminal: boolean;
  phase: string;
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function getRunContinuationSnapshot(
  candidate: RunContinuationStateLike | null | undefined,
  options: { phaseFallback?: string } = {},
): RunContinuationSnapshot | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const outcome = inferRunOutcome(candidate as Record<string, unknown>);
  const phase = safeString(candidate.current_phase) || options.phaseFallback || 'active';
  return {
    outcome,
    terminal: isTerminalRunOutcome(outcome),
    phase,
  };
}

export function shouldContinueRun(
  candidate: RunContinuationStateLike | null | undefined,
  options: { phaseFallback?: string } = {},
): boolean {
  const snapshot = getRunContinuationSnapshot(candidate, options);
  return snapshot !== null && !snapshot.terminal;
}
