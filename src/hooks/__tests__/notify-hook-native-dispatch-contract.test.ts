import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it } from 'node:test';

describe('notify-hook native dispatch contract', () => {
  it('force-enables hook dispatch for notify-hook native and derived events', async () => {
    const source = await readFile(join(process.cwd(), 'scripts', 'notify-hook.js'), 'utf-8');
    assert.match(source, /dispatchHookEvent\(event, \{ cwd, enabled: true \}\);/);
    assert.match(source, /dispatchHookEvent\(derivedEvent, \{ cwd, enabled: true \}\);/);
    const matches = source.match(/dispatchHookEvent\(event, \{ cwd, enabled: true \}\);/g) ?? [];
    assert.ok(matches.length >= 2, `expected notify-hook to force-enable native dispatch twice, found ${matches.length}`);
  });
});
