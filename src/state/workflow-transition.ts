import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { getReadScopedStatePaths } from '../mcp/state-paths.js';

export const TRACKED_WORKFLOW_MODES = [
  'autopilot',
  'autoresearch',
  'team',
  'ralph',
  'ultrawork',
  'ultraqa',
  'ralplan',
  'deep-interview',
] as const;

export type TrackedWorkflowMode = (typeof TRACKED_WORKFLOW_MODES)[number];
export type WorkflowTransitionAction = 'activate' | 'start' | 'write';

const ALLOWED_OVERLAP_PAIRS = new Set([
  'ralph|team',
  'team|ultrawork',
]);

function safeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeTrackedModes(modes: Iterable<string>): TrackedWorkflowMode[] {
  const deduped = new Set<TrackedWorkflowMode>();
  for (const mode of modes) {
    if (isTrackedWorkflowMode(mode)) {
      deduped.add(mode);
    }
  }
  return [...deduped];
}

function buildPairKey(a: string, b: string): string {
  return [a, b].sort((left, right) => left.localeCompare(right)).join('|');
}

function isAllowedOverlap(a: TrackedWorkflowMode, b: TrackedWorkflowMode): boolean {
  return ALLOWED_OVERLAP_PAIRS.has(buildPairKey(a, b));
}

function formatActiveModes(modes: readonly string[]): string {
  if (modes.length === 0) return 'no tracked workflows';
  if (modes.length === 1) return `${modes[0]} is already active`;
  if (modes.length === 2) return `${modes[0]} and ${modes[1]} are already active`;
  return `${modes.slice(0, -1).join(', ')}, and ${modes[modes.length - 1]} are already active`;
}

export interface WorkflowTransitionDecision {
  allowed: boolean;
  currentModes: TrackedWorkflowMode[];
  requestedMode: TrackedWorkflowMode;
  resultingModes: TrackedWorkflowMode[];
}

export function isTrackedWorkflowMode(mode: string): mode is TrackedWorkflowMode {
  return (TRACKED_WORKFLOW_MODES as readonly string[]).includes(mode);
}

export function evaluateWorkflowTransition(
  currentActiveModes: Iterable<string>,
  requestedMode: TrackedWorkflowMode,
): WorkflowTransitionDecision {
  const currentModes = normalizeTrackedModes(currentActiveModes);

  if (currentModes.includes(requestedMode)) {
    return {
      allowed: true,
      currentModes,
      requestedMode,
      resultingModes: currentModes,
    };
  }

  if (currentModes.length === 0) {
    return {
      allowed: true,
      currentModes,
      requestedMode,
      resultingModes: [requestedMode],
    };
  }

  if (currentModes.length === 1 && isAllowedOverlap(currentModes[0], requestedMode)) {
    return {
      allowed: true,
      currentModes,
      requestedMode,
      resultingModes: [currentModes[0], requestedMode],
    };
  }

  return {
    allowed: false,
    currentModes,
    requestedMode,
    resultingModes: currentModes,
  };
}

export function buildWorkflowTransitionError(
  currentActiveModes: Iterable<string>,
  requestedMode: TrackedWorkflowMode,
  action: WorkflowTransitionAction = 'activate',
): string {
  const currentModes = normalizeTrackedModes(currentActiveModes);
  const activeModesMessage = formatActiveModes(currentModes);
  const overlap = [...currentModes, requestedMode].join(' + ');
  return [
    `Cannot ${action} ${requestedMode}: ${activeModesMessage}.`,
    `Unsupported workflow overlap: ${overlap}.`,
    'Current state is unchanged.',
    `Clear incompatible workflow state via \`omx state clear --mode <mode>\` or the \`omx_state.*\` MCP tools, then retry.`,
  ].join(' ');
}

export function assertWorkflowTransitionAllowed(
  currentActiveModes: Iterable<string>,
  requestedMode: TrackedWorkflowMode,
  action: WorkflowTransitionAction = 'activate',
): void {
  const decision = evaluateWorkflowTransition(currentActiveModes, requestedMode);
  if (decision.allowed) return;
  throw new Error(buildWorkflowTransitionError(currentActiveModes, requestedMode, action));
}

export async function readActiveWorkflowModes(
  cwd: string,
  sessionId?: string,
): Promise<TrackedWorkflowMode[]> {
  const activeModes: TrackedWorkflowMode[] = [];

  for (const mode of TRACKED_WORKFLOW_MODES) {
    const candidatePaths = await getReadScopedStatePaths(mode, cwd, sessionId);
    for (const candidatePath of candidatePaths) {
      if (!existsSync(candidatePath)) continue;
      try {
        const parsed = JSON.parse(await readFile(candidatePath, 'utf-8')) as { active?: unknown };
        if (parsed.active === true) {
          activeModes.push(mode);
        }
        break;
      } catch {
        throw new Error(
          `Cannot read ${mode} workflow state at ${candidatePath}. Clear or repair state via \`omx state clear --mode ${mode}\` or the \`omx_state.*\` MCP tools.`,
        );
      }
    }
  }

  return activeModes;
}

export function pickPrimaryWorkflowMode(
  currentPrimary: unknown,
  resultingModes: readonly string[],
  fallbackMode: string,
): string {
  const normalizedCurrent = safeString(currentPrimary).trim();
  if (normalizedCurrent && resultingModes.includes(normalizedCurrent)) {
    return normalizedCurrent;
  }
  return resultingModes[0] || fallbackMode;
}
