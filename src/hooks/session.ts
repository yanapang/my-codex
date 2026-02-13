/**
 * Session Lifecycle Manager for oh-my-codex
 *
 * Tracks session start/end, detects stale sessions from crashed launches,
 * and provides structured logging for session events.
 */

import { readFile, writeFile, mkdir, unlink, appendFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { omxStateDir, omxLogsDir } from '../utils/paths.js';

export interface SessionState {
  session_id: string;
  started_at: string;
  cwd: string;
  pid: number;
}

const SESSION_FILE = 'session.json';
const HISTORY_FILE = 'session-history.jsonl';
const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

function sessionPath(cwd: string): string {
  return join(omxStateDir(cwd), SESSION_FILE);
}

function historyPath(cwd: string): string {
  return join(omxLogsDir(cwd), HISTORY_FILE);
}

/**
 * Read current session state. Returns null if no session file exists.
 */
export async function readSessionState(cwd: string): Promise<SessionState | null> {
  const path = sessionPath(cwd);
  if (!existsSync(path)) return null;

  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as SessionState;
  } catch {
    return null;
  }
}

/**
 * Check if a session is stale (PID dead or started >2h ago).
 */
export function isSessionStale(state: SessionState): boolean {
  // Check if PID is still alive
  try {
    process.kill(state.pid, 0);
  } catch {
    // PID is dead
    return true;
  }

  // Check if session is older than threshold
  const startedAt = new Date(state.started_at).getTime();
  if (Date.now() - startedAt > STALE_THRESHOLD_MS) {
    return true;
  }

  return false;
}

/**
 * Write session start state.
 */
export async function writeSessionStart(cwd: string, sessionId: string): Promise<void> {
  const stateDir = omxStateDir(cwd);
  await mkdir(stateDir, { recursive: true });

  const state: SessionState = {
    session_id: sessionId,
    started_at: new Date().toISOString(),
    cwd,
    pid: process.pid,
  };

  await writeFile(sessionPath(cwd), JSON.stringify(state, null, 2));
  await appendToLog(cwd, {
    event: 'session_start',
    session_id: sessionId,
    pid: process.pid,
    timestamp: state.started_at,
  });
}

/**
 * Write session end: archive to history, delete session.json.
 */
export async function writeSessionEnd(cwd: string, sessionId: string): Promise<void> {
  const state = await readSessionState(cwd);
  const endTime = new Date().toISOString();

  // Archive to session history
  const logsDir = omxLogsDir(cwd);
  await mkdir(logsDir, { recursive: true });

  const historyEntry = {
    session_id: sessionId,
    started_at: state?.started_at || 'unknown',
    ended_at: endTime,
    cwd,
    pid: state?.pid || process.pid,
  };

  await appendFile(historyPath(cwd), JSON.stringify(historyEntry) + '\n');

  // Delete session.json
  try {
    await unlink(sessionPath(cwd));
  } catch { /* already gone */ }

  await appendToLog(cwd, {
    event: 'session_end',
    session_id: sessionId,
    timestamp: endTime,
  });
}

/**
 * Append a structured JSONL entry to the daily log file.
 */
export async function appendToLog(cwd: string, entry: Record<string, unknown>): Promise<void> {
  const logsDir = omxLogsDir(cwd);
  await mkdir(logsDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logFile = join(logsDir, `omx-${date}.jsonl`);
  const line = JSON.stringify({ ...entry, _ts: new Date().toISOString() }) + '\n';

  await appendFile(logFile, line);
}
