import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractRalphthonTaskDescription, filterRalphthonCodexArgs, parseRalphthonArgs } from '../ralphthon.js';

describe('parseRalphthonArgs', () => {
  it('parses resume/skip-interview and numeric overrides', () => {
    const parsed = parseRalphthonArgs(['--resume', '--skip-interview', '--max-waves', '5', '--poll-interval=60', '--model', 'gpt-5', 'build', 'demo']);
    assert.equal(parsed.resume, true);
    assert.equal(parsed.skipInterview, true);
    assert.equal(parsed.maxWaves, 5);
    assert.equal(parsed.pollIntervalSec, 60);
    assert.equal(parsed.taskDescription, 'build demo');
  });

  it('rejects non-positive numeric flags', () => {
    assert.throws(() => parseRalphthonArgs(['--max-waves', '0']), /--max-waves requires a positive integer/i);
    assert.throws(() => parseRalphthonArgs(['--poll-interval=-1']), /--poll-interval requires a positive integer/i);
  });
});

describe('extractRalphthonTaskDescription', () => {
  it('ignores OMX and value-taking codex flags', () => {
    assert.equal(
      extractRalphthonTaskDescription(['--skip-interview', '--model', 'gpt-5', 'ship', 'the', 'thing']),
      'ship the thing',
    );
  });
});

describe('filterRalphthonCodexArgs', () => {
  it('strips ralphthon control flags before launching Codex', () => {
    assert.deepEqual(
      filterRalphthonCodexArgs(['--resume', '--skip-interview', '--max-waves', '3', '--poll-interval=90', '--model', 'gpt-5', 'task']),
      ['--model', 'gpt-5', 'task'],
    );
  });
});
