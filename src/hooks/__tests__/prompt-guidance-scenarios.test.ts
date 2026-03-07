import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const executorPrompt = readFileSync(join(__dirname, '../../../prompts/executor.md'), 'utf-8');
const plannerPrompt = readFileSync(join(__dirname, '../../../prompts/planner.md'), 'utf-8');
const verifierPrompt = readFileSync(join(__dirname, '../../../prompts/verifier.md'), 'utf-8');

describe('prompt guidance scenario examples', () => {
  it('executor prompt documents scoped updates for continue / PR / merge-if-green flows', () => {
    assert.match(executorPrompt, /user says `continue`/i);
    assert.match(executorPrompt, /make a PR targeting dev/i);
    assert.match(executorPrompt, /merge to dev if CI green/i);
    assert.match(executorPrompt, /Check the PR checks, confirm CI is green, then merge/i);
  });

  it('planner prompt documents scoped planning updates for continue / PR / merge-if-green flows', () => {
    assert.match(plannerPrompt, /user says `continue`/i);
    assert.match(plannerPrompt, /user says `make a PR`/i);
    assert.match(plannerPrompt, /user says `merge if CI green`/i);
    assert.match(plannerPrompt, /scoped condition on the next operational step/i);
  });

  it('verifier prompt documents evidence-first handling of merge-if-green and continue flows', () => {
    assert.match(verifierPrompt, /user says `merge if CI green`/i);
    assert.match(verifierPrompt, /confirm they are green/i);
    assert.match(verifierPrompt, /user says `continue`/i);
    assert.match(verifierPrompt, /keep gathering the required evidence/i);
  });
});
