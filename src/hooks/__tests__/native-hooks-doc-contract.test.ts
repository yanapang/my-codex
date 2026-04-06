import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const hooksExtensionDoc = readFileSync(join(__dirname, '../../../docs/hooks-extension.md'), 'utf-8');
const readme = readFileSync(join(__dirname, '../../../README.md'), 'utf-8');
const hooksCli = readFileSync(join(__dirname, '../../cli/hooks.ts'), 'utf-8');
const tmuxHookCli = readFileSync(join(__dirname, '../../cli/tmux-hook.ts'), 'utf-8');

describe('native hooks documentation contract', () => {
  it('documents native-hook-first non-team ownership and tmux team-only positioning', () => {
    assert.match(hooksExtensionDoc, /Non-team sessions are native-hook-first\./);
    assert.match(hooksExtensionDoc, /`omx tmux-hook` is reserved for team runtime behavior and legacy tmux troubleshooting\./);
    assert.match(readme, /For non-team sessions, OMX is now native-hook-first:/);
  });

  it('documents setup and unsupported-runtime expectations', () => {
    assert.match(hooksExtensionDoc, /`omx setup` is expected to force-enable `\[features\]\.codex_hooks = true`/);
    assert.match(hooksExtensionDoc, /Unsupported or disabled native-hook runtimes must surface explicit setup\/doctor status/);
  });

  it('keeps CLI help aligned with the ownership contract', () => {
    assert.match(hooksCli, /Non-team OMX automation is native-hook-first\./);
    assert.match(tmuxHookCli, /Team runtime \/ legacy workflow only\./);
    assert.doesNotMatch(hooksCli, /Existing `omx tmux-hook` behavior is unchanged/);
  });
});
