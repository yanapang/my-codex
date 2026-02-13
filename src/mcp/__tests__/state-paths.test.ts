import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getBaseStateDir,
  getStateDir,
  getStatePath,
  validateSessionId,
} from '../state-paths.js';

describe('validateSessionId', () => {
  it('accepts undefined and valid ids', () => {
    assert.equal(validateSessionId(undefined), undefined);
    assert.equal(validateSessionId('abc_123-XYZ'), 'abc_123-XYZ');
  });

  it('rejects invalid ids', () => {
    assert.throws(() => validateSessionId(''), /session_id must match/);
    assert.throws(() => validateSessionId('bad/id'), /session_id must match/);
    assert.throws(() => validateSessionId(123), /session_id must be a string/);
  });
});

describe('state paths', () => {
  it('builds global state paths', () => {
    const base = getBaseStateDir('/repo');
    assert.equal(base, '/repo/.omx/state');
    assert.equal(getStateDir('/repo'), '/repo/.omx/state');
    assert.equal(getStatePath('team', '/repo'), '/repo/.omx/state/team-state.json');
  });

  it('builds session state paths', () => {
    assert.equal(getStateDir('/repo', 'sess1'), '/repo/.omx/state/sessions/sess1');
    assert.equal(
      getStatePath('ralph', '/repo', 'sess1'),
      '/repo/.omx/state/sessions/sess1/ralph-state.json'
    );
  });
});
