import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveManagedSessionContext } from '../../scripts/notify-hook/managed-tmux.js';
import { writeSessionStart } from '../session.js';

describe('notify-hook managed tmux windows fallback', () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  const originalTmux = process.env.TMUX;
  const originalTmuxPane = process.env.TMUX_PANE;
  const originalTeamWorker = process.env.OMX_TEAM_WORKER;

  afterEach(() => {
    if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
    if (originalTmux !== undefined) process.env.TMUX = originalTmux;
    else delete process.env.TMUX;
    if (originalTmuxPane !== undefined) process.env.TMUX_PANE = originalTmuxPane;
    else delete process.env.TMUX_PANE;
    if (originalTeamWorker !== undefined) process.env.OMX_TEAM_WORKER = originalTeamWorker;
    else delete process.env.OMX_TEAM_WORKER;
  });

  it('does not rely on ps ancestry checks on native Windows', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omx-managed-tmux-win32-'));
    try {
      const stateDir = join(cwd, '.omx', 'state');
      const sessionId = 'omx-test-session';
      await mkdir(stateDir, { recursive: true });
      await writeFile(join(stateDir, 'session.json'), JSON.stringify({
        session_id: sessionId,
        started_at: new Date().toISOString(),
        cwd,
        pid: 999999,
        platform: 'win32',
      }, null, 2));

      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
      delete process.env.TMUX;
      delete process.env.TMUX_PANE;
      process.env.OMX_TEAM_WORKER = '';

      const result = await resolveManagedSessionContext(cwd, { session_id: sessionId }, { allowTeamWorker: false });
      assert.equal(result.managed, false);
      assert.equal(result.reason, 'stale_session');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('accepts native payload session ids when session state stores a separate native_session_id', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omx-managed-tmux-native-session-'));
    try {
      const stateDir = join(cwd, '.omx', 'state');
      await mkdir(stateDir, { recursive: true });
      await writeSessionStart(cwd, 'omx-canonical-session');
      const current = JSON.parse(await readFile(join(stateDir, 'session.json'), 'utf-8'));
      await writeFile(join(stateDir, 'session.json'), JSON.stringify({
        ...current,
        native_session_id: 'codex-native-session',
      }, null, 2));

      delete process.env.TMUX;
      delete process.env.TMUX_PANE;
      process.env.OMX_TEAM_WORKER = '';

      const result = await resolveManagedSessionContext(cwd, { session_id: 'codex-native-session' }, { allowTeamWorker: false });
      assert.equal(result.managed, true);
      assert.equal(result.invocationSessionId, 'codex-native-session');
      assert.equal(result.canonicalSessionId, 'omx-canonical-session');
      assert.equal(result.nativeSessionId, 'codex-native-session');
      assert.match(result.expectedTmuxSessionName, /omx-canonical-session|canonical-session/);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
