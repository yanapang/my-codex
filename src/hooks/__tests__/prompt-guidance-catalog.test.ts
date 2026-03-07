import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadPrompt(name: string): string {
  return readFileSync(join(__dirname, `../../../prompts/${name}.md`), 'utf-8');
}

describe('prompt guidance catalog coverage', () => {
  const markdownPrompts = [
    'analyst',
    'api-reviewer',
    'build-fixer',
    'dependency-expert',
    'designer',
    'git-master',
    'information-architect',
    'performance-reviewer',
    'product-analyst',
    'product-manager',
    'qa-tester',
    'quality-strategist',
    'style-reviewer',
    'ux-researcher',
    'vision',
    'writer',
  ] as const;

  for (const name of markdownPrompts) {
    const content = loadPrompt(name);
    it(`${name} includes concise output, local overrides, and scenario examples`, () => {
      assert.match(content, /Default final-output shape: concise and evidence-dense/i);
      assert.match(content, /Treat newer user task updates as local overrides/i);
      assert.match(content, /user says `continue`/i);
    });
  }

  it('code-simplifier legacy prompt includes local overrides and grounded simplification guidance', () => {
    const content = loadPrompt('code-simplifier');
    assert.match(content, /local overrides for the active simplification scope/i);
    assert.match(content, /until the simplification result is grounded/i);
    assert.match(content, /<Scenario_Examples>/i);
  });
});
