import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

async function withAmbientTmuxEnv<T>(env: NodeJS.ProcessEnv, run: () => Promise<T>): Promise<T> {
  const previousTmux = process.env.TMUX;
  const previousTmuxPane = process.env.TMUX_PANE;
  if (typeof env.TMUX === 'string') process.env.TMUX = env.TMUX;
  else delete process.env.TMUX;
  if (typeof env.TMUX_PANE === 'string') process.env.TMUX_PANE = env.TMUX_PANE;
  else delete process.env.TMUX_PANE;

  try {
    return await run();
  } finally {
    if (typeof previousTmux === 'string') process.env.TMUX = previousTmux;
    else delete process.env.TMUX;
    if (typeof previousTmuxPane === 'string') process.env.TMUX_PANE = previousTmuxPane;
    else delete process.env.TMUX_PANE;
  }
}

describe('state-server directory initialization', () => {
  it('creates .omx/state for state tools without setup', async () => {
    process.env.OMX_STATE_SERVER_DISABLE_AUTO_START = '1';
    const { handleStateToolCall } = await import('../state-server.js');

    const wd = await mkdtemp(join(tmpdir(), 'omx-state-server-test-'));
    try {
      const stateDir = join(wd, '.omx', 'state');
      const tmuxHookConfig = join(wd, '.omx', 'tmux-hook.json');
      assert.equal(existsSync(stateDir), false);
      assert.equal(existsSync(tmuxHookConfig), false);

      const response = await handleStateToolCall({
        params: {
          name: 'state_list_active',
          arguments: { workingDirectory: wd },
        },
      });

      assert.equal(existsSync(stateDir), true);
      assert.equal(existsSync(tmuxHookConfig), true);
      const tmuxConfig = JSON.parse(await readFile(tmuxHookConfig, 'utf-8')) as {
        target?: { type?: string; value?: string };
      };
      assert.deepEqual(tmuxConfig.target, { type: 'pane', value: 'replace-with-tmux-pane-id' });
      assert.deepEqual(
        JSON.parse(response.content[0]?.text || '{}'),
        { active_modes: [] },
      );
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('keeps state-tool tmux-hook bootstrap on a placeholder target even with ambient tmux env', async () => {
    process.env.OMX_STATE_SERVER_DISABLE_AUTO_START = '1';
    const { handleStateToolCall } = await import('../state-server.js');

    const wd = await mkdtemp(join(tmpdir(), 'omx-state-server-test-live-'));
    try {
      const tmuxHookConfig = join(wd, '.omx', 'tmux-hook.json');

      await withAmbientTmuxEnv(
        { TMUX: '/tmp/maintainer-default,123,0', TMUX_PANE: '%777' },
        async () => {
          const response = await handleStateToolCall({
            params: {
              name: 'state_list_active',
              arguments: { workingDirectory: wd },
            },
          });
          assert.deepEqual(JSON.parse(response.content[0]?.text || '{}'), { active_modes: [] });
        },
      );

      const tmuxConfig = JSON.parse(await readFile(tmuxHookConfig, 'utf-8')) as {
        target?: { type?: string; value?: string };
      };
      assert.deepEqual(tmuxConfig.target, { type: 'pane', value: 'replace-with-tmux-pane-id' });
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('creates session-scoped state directory when session_id is provided', async () => {
    process.env.OMX_STATE_SERVER_DISABLE_AUTO_START = '1';
    const { handleStateToolCall } = await import('../state-server.js');

    const wd = await mkdtemp(join(tmpdir(), 'omx-state-server-test-'));
    try {
      const sessionDir = join(wd, '.omx', 'state', 'sessions', 'sess1');
      assert.equal(existsSync(sessionDir), false);

      const response = await handleStateToolCall({
        params: {
          name: 'state_get_status',
          arguments: { workingDirectory: wd, session_id: 'sess1' },
        },
      });

      assert.equal(existsSync(sessionDir), true);
      assert.deepEqual(
        JSON.parse(response.content[0]?.text || '{}'),
        { statuses: {} },
      );
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('serializes concurrent state_write calls per mode file and preserves merged fields', async () => {
    process.env.OMX_STATE_SERVER_DISABLE_AUTO_START = '1';
    const { handleStateToolCall } = await import('../state-server.js');

    const wd = await mkdtemp(join(tmpdir(), 'omx-state-server-test-'));
    try {
      const writes = Array.from({ length: 16 }, (_, i) => handleStateToolCall({
        params: {
          name: 'state_write',
          arguments: {
            workingDirectory: wd,
            mode: 'team',
            state: { [`k${i}`]: i },
          },
        },
      }));

      const responses = await Promise.all(writes);
      for (const response of responses) {
        assert.equal(response.isError, undefined);
      }

      const filePath = join(wd, '.omx', 'state', 'team-state.json');
      const state = JSON.parse(await readFile(filePath, 'utf-8')) as Record<string, unknown>;
      for (let i = 0; i < 16; i++) {
        assert.equal(state[`k${i}`], i);
      }
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});
