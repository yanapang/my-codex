import { join } from 'path';

export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function validateSessionId(sessionId: unknown): string | undefined {
  if (sessionId == null) return undefined;
  if (typeof sessionId !== 'string') {
    throw new Error('session_id must be a string');
  }
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    throw new Error('session_id must match ^[A-Za-z0-9_-]{1,64}$');
  }
  return sessionId;
}

export function getBaseStateDir(workingDirectory?: string): string {
  return join(workingDirectory || process.cwd(), '.omx', 'state');
}

export function getStateDir(workingDirectory?: string, sessionId?: string): string {
  const base = getBaseStateDir(workingDirectory);
  return sessionId ? join(base, 'sessions', sessionId) : base;
}

export function getStatePath(mode: string, workingDirectory?: string, sessionId?: string): string {
  return join(getStateDir(workingDirectory, sessionId), `${mode}-state.json`);
}
