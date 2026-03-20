import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface TempTmuxSessionFixture {
  sessionName: string;
  serverName: string;
  windowTarget: string;
  leaderPaneId: string;
  socketPath: string;
  env: {
    TMUX: string;
    TMUX_PANE: string;
  };
  sessionExists: () => boolean;
}

function runTmux(
  args: string[],
  options: { ignoreTmuxEnv?: boolean; env?: NodeJS.ProcessEnv; serverName?: string } = {},
): string {
  const env = options.env
    ?? (options.ignoreTmuxEnv ? { ...process.env, TMUX: undefined, TMUX_PANE: undefined } : process.env);
  const argv = options.serverName ? ['-L', options.serverName, ...args] : args;
  const result = spawnSync('tmux', argv, {
    encoding: 'utf-8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error((result.stderr || '').trim() || `tmux exited ${result.status}`);
  }
  return (result.stdout || '').trim();
}

export function isRealTmuxAvailable(): boolean {
  try {
    runTmux(['-V'], { ignoreTmuxEnv: true });
    return true;
  } catch {
    return false;
  }
}

export function tmuxSessionExists(sessionName: string, serverName?: string): boolean {
  try {
    runTmux(['has-session', '-t', sessionName], {
      ignoreTmuxEnv: true,
      serverName,
    });
    return true;
  } catch {
    return false;
  }
}

function uniqueTmuxIdentifier(prefix: string): string {
  return `${prefix}-${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function withTempTmuxSession<T>(fn: (fixture: TempTmuxSessionFixture) => Promise<T> | T): Promise<T> {
  if (!isRealTmuxAvailable()) {
    throw new Error('tmux is not available');
  }

  const fixtureCwd = await mkdtemp(join(tmpdir(), 'omx-tmux-fixture-'));
  const sessionName = uniqueTmuxIdentifier('omx-test');
  const serverName = uniqueTmuxIdentifier('omx-fixture');
  const tmuxOptions = { ignoreTmuxEnv: true, serverName } as const;
  const created = runTmux([
    'new-session',
    '-d',
    '-P',
    '-F',
    '#{session_name}:#{window_index} #{pane_id}',
    '-s',
    sessionName,
    '-c',
    fixtureCwd,
    'sleep 300',
  ], tmuxOptions);
  const [windowTarget = '', leaderPaneId = ''] = created.split(/\s+/, 2);
  if (windowTarget === '' || leaderPaneId === '') {
    try {
      runTmux(['kill-server'], tmuxOptions);
    } catch {}
    await rm(fixtureCwd, { recursive: true, force: true });
    throw new Error(`failed to create temporary tmux fixture: ${created}`);
  }

  const socketPath = runTmux(['display-message', '-p', '-t', leaderPaneId, '#{socket_path}'], tmuxOptions);
  const previousTmux = process.env.TMUX;
  const previousTmuxPane = process.env.TMUX_PANE;
  process.env.TMUX = `${socketPath},${process.pid},0`;
  process.env.TMUX_PANE = leaderPaneId;

  const fixture: TempTmuxSessionFixture = {
    sessionName,
    serverName,
    windowTarget,
    leaderPaneId,
    socketPath,
    env: {
      TMUX: process.env.TMUX,
      TMUX_PANE: leaderPaneId,
    },
    sessionExists: () => tmuxSessionExists(sessionName, serverName),
  };

  try {
    return await fn(fixture);
  } finally {
    try {
      runTmux(['kill-server'], tmuxOptions);
    } catch {}
    if (typeof previousTmux === 'string') process.env.TMUX = previousTmux;
    else delete process.env.TMUX;
    if (typeof previousTmuxPane === 'string') process.env.TMUX_PANE = previousTmuxPane;
    else delete process.env.TMUX_PANE;
    await rm(fixtureCwd, { recursive: true, force: true });
  }
}
