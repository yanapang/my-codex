import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { ralphthonDir } from './prd.js';

const PROCESSED_MARKER_LIMIT = 200;

export const RALPHTHON_RUNTIME_SCHEMA_VERSION = 1;

export const ralphthonRuntimeStateSchema = z.object({
  schemaVersion: z.literal(RALPHTHON_RUNTIME_SCHEMA_VERSION).default(RALPHTHON_RUNTIME_SCHEMA_VERSION),
  leaderTarget: z.string().trim().default(''),
  lastCaptureHash: z.string().trim().min(1).optional(),
  lastOutputChangeAt: z.string().trim().min(1).optional(),
  lastPollAt: z.string().trim().min(1).optional(),
  lastInjectionAt: z.string().trim().min(1).optional(),
  lastInjectedTaskId: z.string().trim().min(1).optional(),
  activeTaskId: z.string().trim().min(1).optional(),
  processedMarkers: z.array(z.string().trim().min(1)).default([]),
});

export type RalphthonRuntimeState = z.infer<typeof ralphthonRuntimeStateSchema>;

export function canonicalRalphthonRuntimePath(cwd: string): string {
  return join(ralphthonDir(cwd), 'runtime.json');
}

export function createRalphthonRuntimeState(leaderTarget: string): RalphthonRuntimeState {
  return {
    schemaVersion: RALPHTHON_RUNTIME_SCHEMA_VERSION,
    leaderTarget: leaderTarget.trim(),
    processedMarkers: [],
  };
}

export function parseRalphthonRuntimeState(input: unknown): RalphthonRuntimeState {
  const parsed = ralphthonRuntimeStateSchema.parse(input);
  return {
    ...parsed,
    processedMarkers: parsed.processedMarkers.slice(-PROCESSED_MARKER_LIMIT),
  };
}

export async function readRalphthonRuntimeState(cwd: string): Promise<RalphthonRuntimeState | null> {
  const path = canonicalRalphthonRuntimePath(cwd);
  if (!existsSync(path)) return null;
  const raw = await readFile(path, 'utf-8');
  return parseRalphthonRuntimeState(JSON.parse(raw));
}

export async function writeRalphthonRuntimeState(cwd: string, state: RalphthonRuntimeState): Promise<string> {
  const normalized = parseRalphthonRuntimeState(state);
  const path = canonicalRalphthonRuntimePath(cwd);
  await mkdir(ralphthonDir(cwd), { recursive: true });
  await writeFile(path, `${JSON.stringify(normalized, null, 2)}\n`);
  return path;
}

export function hashPaneCapture(capture: string): string {
  return createHash('sha1').update(capture).digest('hex');
}

export function rememberProcessedMarker(state: RalphthonRuntimeState, marker: string): RalphthonRuntimeState {
  const processedMarkers = [...state.processedMarkers, marker].slice(-PROCESSED_MARKER_LIMIT);
  return {
    ...state,
    processedMarkers,
  };
}
