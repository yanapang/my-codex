import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadPrompt(name: string): string {
  return readFileSync(join(__dirname, `../../../prompts/${name}.md`), 'utf-8');
}

describe('prompt guidance wave two contract', () => {
  const prompts = {
    architect: loadPrompt('architect'),
    critic: loadPrompt('critic'),
    debugger: loadPrompt('debugger'),
    testEngineer: loadPrompt('test-engineer'),
    codeReviewer: loadPrompt('code-reviewer'),
    qualityReviewer: loadPrompt('quality-reviewer'),
    securityReviewer: loadPrompt('security-reviewer'),
    researcher: loadPrompt('researcher'),
    explore: loadPrompt('explore'),
  };

  for (const [label, content] of Object.entries(prompts)) {
    it(`${label} defaults to concise output and localized task-update handling`, () => {
      assert.match(content, /Default final-output shape: concise and evidence-dense/i);
      assert.match(content, /Treat newer user task updates as local overrides/i);
    });
  }

  it('wave two prompts encode persistent evidence gathering with role-appropriate wording', () => {
    assert.match(prompts.architect, /keep using those tools until the analysis is grounded/i);
    assert.match(prompts.critic, /keep doing so until the verdict is grounded/i);
    assert.match(prompts.debugger, /keep using those tools until the diagnosis is grounded/i);
    assert.match(prompts.testEngineer, /keep using those tools until the recommendation is grounded/i);
    assert.match(prompts.codeReviewer, /keep using those tools until the review is grounded/i);
    assert.match(prompts.qualityReviewer, /keep using those tools until the review is grounded/i);
    assert.match(prompts.securityReviewer, /keep using those tools until the security verdict is grounded/i);
    assert.match(prompts.researcher, /keep researching until the answer is grounded/i);
    assert.match(prompts.explore, /keep using those tools until the answer is grounded/i);
  });

  it('wave two prompts contain scenario examples for continue and scoped update handling', () => {
    assert.match(prompts.architect, /user says `continue`/i);
    assert.match(prompts.critic, /user says `continue`/i);
    assert.match(prompts.debugger, /user says `continue`/i);
    assert.match(prompts.testEngineer, /user says `continue`/i);
    assert.match(prompts.codeReviewer, /user says `continue`/i);
    assert.match(prompts.qualityReviewer, /user says `continue`/i);
    assert.match(prompts.securityReviewer, /user says `continue`/i);
    assert.match(prompts.researcher, /user says `continue`/i);
    assert.match(prompts.explore, /user says `continue`/i);
  });

  it('security and verifier-adjacent prompts preserve merge-if-green as downstream context, not replacement evidence', () => {
    assert.match(prompts.securityReviewer, /merge if CI green/i);
    assert.match(prompts.critic, /later workflow condition|downstream context/i);
    assert.match(prompts.testEngineer, /merge if CI green/i);
  });
});
