import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const repoRoot = process.cwd();

function read(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf-8');
}

describe('install docs contract', () => {
  const installSurfaces = [
    'README.md',
    'docs/getting-started.html',
    'docs/readme/README.pl.md',
    'docs/readme/README.uk.md',
    'docs/readme/README.el.md',
    'docs/readme/README.vi.md',
  ];

  it('does not recommend a combined Codex and OMX global npm install', () => {
    for (const surface of installSurfaces) {
      assert.doesNotMatch(
        read(surface),
        /(^|\n)npm install -g @openai\/codex oh-my-codex(\n|$)/,
        `${surface} must not show the combined install command as an executable shell line`,
      );
    }
  });

  it('keeps install docs explicit about verified existing Codex installs', () => {
    for (const surface of installSurfaces) {
      const content = read(surface);
      assert.match(content, /Homebrew/i, `${surface} must mention Homebrew installs`);
      assert.match(content, /codex --version/, `${surface} must tell users to verify the existing Codex CLI`);
      assert.match(content, /npm install -g oh-my-codex/, `${surface} must keep the OMX-only npm install command`);
    }
  });

  it('keeps primary install docs explicit about the Homebrew-owned binary conflict', () => {
    for (const surface of ['README.md', 'docs/getting-started.html']) {
      assert.match(
        read(surface),
        /EEXIST|\/opt\/homebrew\/bin\/codex/,
        `${surface} must explain the npm binary conflict`,
      );
    }
  });
});
