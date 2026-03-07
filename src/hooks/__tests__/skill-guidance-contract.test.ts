import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadSkill(name: string): string {
  return readFileSync(join(__dirname, `../../../skills/${name}/SKILL.md`), 'utf-8');
}

describe('execution-heavy skill guidance contract', () => {
  const skills = {
    analyze: loadSkill('analyze'),
    autopilot: loadSkill('autopilot'),
    buildFix: loadSkill('build-fix'),
    codeReview: loadSkill('code-review'),
    securityReview: loadSkill('security-review'),
    plan: loadSkill('plan'),
    ralph: loadSkill('ralph'),
    ralplan: loadSkill('ralplan'),
    team: loadSkill('team'),
    ultraqa: loadSkill('ultraqa'),
  };

  for (const [label, content] of Object.entries(skills)) {
    it(`${label} includes guidance for concise reporting, local overrides, and continue scenarios`, () => {
      assert.match(content, /concise, evidence-dense progress and completion reporting|concise, evidence-dense progress and completion reporting/i);
      assert.match(content, /local overrides for the active workflow branch|local overrides for the active workflow branch while preserving/i);
      assert.match(content, /user says `continue`/i);
    });
  }
});
