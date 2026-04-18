export const RUN_OUTCOMES = [
  'continue',
  'finish',
  'blocked_on_user',
  'failed',
  'cancelled',
] as const;

export type RunOutcome = (typeof RUN_OUTCOMES)[number];

const RUN_OUTCOME_SET = new Set<RunOutcome>(RUN_OUTCOMES);
const TERMINAL_RUN_OUTCOME_SET = new Set<RunOutcome>([
  'finish',
  'blocked_on_user',
  'failed',
  'cancelled',
]);

const RUN_OUTCOME_ALIASES: Record<string, RunOutcome> = {
  complete: 'finish',
  completed: 'finish',
  done: 'finish',
  blocked: 'blocked_on_user',
  'blocked-on-user': 'blocked_on_user',
  cancel: 'cancelled',
  fail: 'failed',
  error: 'failed',
};

const TERMINAL_PHASE_TO_RUN_OUTCOME: Record<string, RunOutcome> = {
  complete: 'finish',
  completed: 'finish',
  blocked: 'blocked_on_user',
  blocked_on_user: 'blocked_on_user',
  'blocked-on-user': 'blocked_on_user',
  failed: 'failed',
  cancelled: 'cancelled',
  cancel: 'cancelled',
};

export interface RunOutcomeValidationResult {
  ok: boolean;
  state?: Record<string, unknown>;
  warning?: string;
  error?: string;
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isTerminalRunOutcome(outcome: RunOutcome): boolean {
  return TERMINAL_RUN_OUTCOME_SET.has(outcome);
}

export function normalizeRunOutcome(rawOutcome: unknown): {
  outcome?: RunOutcome;
  warning?: string;
  error?: string;
} {
  const normalized = safeString(rawOutcome).toLowerCase();
  if (!normalized) return {};
  if (RUN_OUTCOME_SET.has(normalized as RunOutcome)) {
    return { outcome: normalized as RunOutcome };
  }
  const alias = RUN_OUTCOME_ALIASES[normalized];
  if (alias) {
    return {
      outcome: alias,
      warning: `normalized legacy run outcome "${rawOutcome}" -> "${alias}"`,
    };
  }
  return {
    error: `run_outcome must be one of: ${RUN_OUTCOMES.join(', ')}`,
  };
}

export function inferRunOutcome(candidate: Record<string, unknown>): RunOutcome {
  const explicit = normalizeRunOutcome(candidate.run_outcome);
  if (explicit.outcome) return explicit.outcome;

  const phase = safeString(candidate.current_phase).toLowerCase();
  if (phase && TERMINAL_PHASE_TO_RUN_OUTCOME[phase]) {
    return TERMINAL_PHASE_TO_RUN_OUTCOME[phase];
  }

  if (candidate.active === true) return 'continue';
  if (safeString(candidate.completed_at)) return 'finish';
  if (candidate.active === false) return 'finish';
  return 'continue';
}

export function applyRunOutcomeContract(
  candidate: Record<string, unknown>,
  options?: { nowIso?: string },
): RunOutcomeValidationResult {
  const nowIso = options?.nowIso ?? new Date().toISOString();
  const next: Record<string, unknown> = { ...candidate };
  const normalized = normalizeRunOutcome(next.run_outcome);
  if (normalized.error) return { ok: false, error: normalized.error };

  const outcome = normalized.outcome ?? inferRunOutcome(next);
  next.run_outcome = outcome;

  if (isTerminalRunOutcome(outcome)) {
    if (next.active === true) {
      return { ok: false, error: `terminal run outcome "${outcome}" requires active=false` };
    }
    next.active = false;
    if (!safeString(next.completed_at)) {
      next.completed_at = nowIso;
    }
  } else {
    if (next.active === false) {
      return { ok: false, error: 'non-terminal run outcome "continue" requires active=true' };
    }
    next.active = true;
    if (safeString(next.completed_at)) {
      delete next.completed_at;
    }
  }

  return {
    ok: true,
    state: next,
    warning: normalized.warning,
  };
}
