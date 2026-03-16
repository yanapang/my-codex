import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function buildFakeTmux(tmuxLogPath: string): string {
  return `#!/usr/bin/env bash
set -eu
echo "$@" >> "${tmuxLogPath}"
cmd="$1"
shift || true
if [[ "$cmd" == "capture-pane" ]]; then
  if [[ -n "\${OMX_TEST_CAPTURE_FILE:-}" && -f "\${OMX_TEST_CAPTURE_FILE}" ]]; then
    cat "\${OMX_TEST_CAPTURE_FILE}"
  fi
  exit 0
fi
if [[ "$cmd" == "display-message" ]]; then
  if [[ "$*" == *"#S"* ]]; then
    echo "ralphthon-session"
    exit 0
  fi
  if [[ "$*" == *"#{pane_current_command}"* ]]; then
    echo "codex"
    exit 0
  fi
  exit 0
fi
if [[ "$cmd" == "list-panes" ]]; then
  echo "%42\tbash\tcodex"
  exit 0
fi
if [[ "$cmd" == "send-keys" ]]; then
  if [[ -n "\${OMX_TEST_FAIL_SEND_KEYS:-}" ]]; then
    exit 1
  fi
  exit 0
fi
exit 0
`;
}

async function seedActiveRalphthonState(wd: string, captureFile: string, extra: { runtime?: Record<string, unknown>; prd?: Record<string, unknown>; modeState?: Record<string, unknown> } = {}) {
  await mkdir(join(wd, '.omx', 'logs'), { recursive: true });
  await mkdir(join(wd, '.omx', 'state'), { recursive: true });
  await mkdir(join(wd, '.omx', 'ralphthon'), { recursive: true });
  await writeFile(captureFile, 'idle prompt\n› ');
  await writeFile(join(wd, '.omx', 'state', 'session.json'), JSON.stringify({ session_id: 'sess-1' }, null, 2));
  await mkdir(join(wd, '.omx', 'state', 'sessions', 'sess-1'), { recursive: true });
  await writeFile(join(wd, '.omx', 'state', 'sessions', 'sess-1', 'ralphthon-state.json'), JSON.stringify({
    active: true,
    mode: 'ralphthon',
    iteration: 0,
    max_iterations: 1000,
    current_phase: 'bootstrapping',
    started_at: new Date().toISOString(),
    leader_pane_id: '%42',
    ...extra.modeState,
  }, null, 2));
  await writeFile(join(wd, '.omx', 'ralphthon', 'runtime.json'), JSON.stringify({
    schemaVersion: 1,
    leaderTarget: '%42',
    processedMarkers: [],
    ...extra.runtime,
  }, null, 2));
  await writeFile(join(wd, '.omx', 'ralphthon', 'prd.json'), JSON.stringify({
    mode: 'ralphthon',
    schemaVersion: 1,
    project: 'demo',
    phase: 'development',
    stories: [{ id: 'S1', title: 'Story 1', status: 'pending', tasks: [{ id: 'T1', desc: 'Build feature', status: 'pending', retries: 0 }] }],
    hardening: [],
    config: { maxHardeningWaves: null, maxRetries: 3, pollIntervalSec: 1, idleTimeoutSec: 1 },
    runtime: { currentHardeningWave: 0, consecutiveHardeningNoIssueWaves: 0 },
    ...extra.prd,
  }, null, 2));
}

describe('notify-fallback watcher ralphthon integration', () => {
  it('runs the ralphthon watchdog and injects the next pending task', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-fallback-ralphthon-'));
    const fakeBin = await mkdtemp(join(tmpdir(), 'omx-fallback-ralphthon-bin-'));
    const tmuxLog = join(wd, 'tmux.log');
    const captureFile = join(wd, 'capture.txt');
    const tmuxPath = join(fakeBin, 'tmux');

    try {
      await writeFile(tmuxPath, buildFakeTmux(tmuxLog));
      await chmod(tmuxPath, 0o755);
      await seedActiveRalphthonState(wd, captureFile);

      const watcherScript = new URL('../../../scripts/notify-fallback-watcher.js', import.meta.url).pathname;
      const notifyHook = new URL('../../../scripts/notify-hook.js', import.meta.url).pathname;
      const result = spawnSync(process.execPath, [watcherScript, '--once', '--cwd', wd, '--notify-script', notifyHook, '--poll-ms', '25'], {
        cwd: wd,
        encoding: 'utf-8',
        env: {
          ...process.env,
          PATH: `${fakeBin}:${process.env.PATH || ''}`,
          OMX_TEST_CAPTURE_FILE: captureFile,
        },
      });

      assert.equal(result.status, 0, result.stderr || result.stdout);
      const tmuxContent = await readFile(tmuxLog, 'utf-8');
      assert.match(tmuxContent, /send-keys -t %42 -l \[RALPHTHON_ASSIGN\] id=T1/);

      const runtime = JSON.parse(await readFile(join(wd, '.omx', 'ralphthon', 'runtime.json'), 'utf-8')) as { activeTaskId?: string; lastInjectedTaskId?: string };
      assert.equal(runtime.activeTaskId, 'T1');
      assert.equal(runtime.lastInjectedTaskId, 'T1');
    } finally {
      await rm(wd, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('suppresses ralphthon injection when the pane is not ready', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-fallback-ralphthon-pane-guard-'));
    const fakeBin = await mkdtemp(join(tmpdir(), 'omx-fallback-ralphthon-pane-guard-bin-'));
    const tmuxLog = join(wd, 'tmux.log');
    const captureFile = join(wd, 'capture.txt');
    const tmuxPath = join(fakeBin, 'tmux');

    try {
      await writeFile(tmuxPath, buildFakeTmux(tmuxLog));
      await chmod(tmuxPath, 0o755);
      await seedActiveRalphthonState(wd, captureFile);
      await writeFile(captureFile, 'model: loading\n› ');

      const watcherScript = new URL('../../../scripts/notify-fallback-watcher.js', import.meta.url).pathname;
      const notifyHook = new URL('../../../scripts/notify-hook.js', import.meta.url).pathname;
      const result = spawnSync(process.execPath, [watcherScript, '--once', '--cwd', wd, '--notify-script', notifyHook, '--poll-ms', '25'], {
        cwd: wd,
        encoding: 'utf-8',
        env: {
          ...process.env,
          PATH: `${fakeBin}:${process.env.PATH || ''}`,
          OMX_TEST_CAPTURE_FILE: captureFile,
        },
      });

      assert.equal(result.status, 0, result.stderr || result.stdout);
      const tmuxContent = await readFile(tmuxLog, 'utf-8');
      assert.doesNotMatch(tmuxContent, /\[RALPHTHON_ASSIGN\]/);

      const watcherState = JSON.parse(await readFile(join(wd, '.omx', 'state', 'notify-fallback-state.json'), 'utf-8')) as { ralphthon_watchdog?: { last_result?: { injectedPrompt?: string } } };
      assert.equal(watcherState.ralphthon_watchdog?.last_result?.injectedPrompt, undefined);
    } finally {
      await rm(wd, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('marks ralphthon failed and emits a user-visible alert when watchdog restart limit is reached', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-fallback-ralphthon-restart-limit-'));
    const fakeBin = await mkdtemp(join(tmpdir(), 'omx-fallback-ralphthon-restart-limit-bin-'));
    const tmuxLog = join(wd, 'tmux.log');
    const captureFile = join(wd, 'capture.txt');
    const tmuxPath = join(fakeBin, 'tmux');

    try {
      await writeFile(tmuxPath, buildFakeTmux(tmuxLog));
      await chmod(tmuxPath, 0o755);
      await seedActiveRalphthonState(wd, captureFile);

      const watcherStatePath = join(wd, '.omx', 'state', 'notify-fallback-state.json');
      await writeFile(watcherStatePath, JSON.stringify({
        ralphthon_watchdog: {
          restart_count: 3,
          restart_window_started_at: new Date().toISOString(),
        },
      }, null, 2));

      const watcherScript = new URL('../../../scripts/notify-fallback-watcher.js', import.meta.url).pathname;
      const notifyHook = new URL('../../../scripts/notify-hook.js', import.meta.url).pathname;
      const result = spawnSync(process.execPath, [watcherScript, '--once', '--cwd', wd, '--notify-script', notifyHook, '--poll-ms', '25'], {
        cwd: wd,
        encoding: 'utf-8',
        env: {
          ...process.env,
          PATH: `${fakeBin}:${process.env.PATH || ''}`,
          OMX_TEST_CAPTURE_FILE: captureFile,
          OMX_TEST_FAIL_SEND_KEYS: '1',
        },
      });

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stderr || '', /watchdog failed permanently/i);

      const modeState = JSON.parse(await readFile(join(wd, '.omx', 'state', 'sessions', 'sess-1', 'ralphthon-state.json'), 'utf-8')) as { active?: boolean; current_phase?: string; stop_reason?: string };
      assert.equal(modeState.active, false);
      assert.equal(modeState.current_phase, 'failed');
      assert.equal(modeState.stop_reason, 'ralphthon_watchdog_restart_limit_reached');

      const logPath = join(wd, '.omx', 'logs', `notify-fallback-${new Date().toISOString().split('T')[0]}.jsonl`);
      const logEntries = (await readFile(logPath, 'utf-8')).trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
      const alertEvent = logEntries.find((entry: { type?: string; user_visible?: boolean }) => entry.type === 'ralphthon_alert' && entry.user_visible === true);
      assert.ok(alertEvent, 'expected user-visible watchdog alert event');
      const notificationEvent = logEntries.find((entry: { type?: string; status?: string }) => entry.type === 'ralphthon_alert_notification' && typeof entry.status === 'string');
      assert.ok(notificationEvent, 'expected platform notification attempt event');
    } finally {
      await rm(wd, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });
});
