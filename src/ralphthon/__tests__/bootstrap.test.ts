import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { bootstrapRalphthonPrdFromExistingArtifacts } from '../bootstrap.js';

describe('bootstrapRalphthonPrdFromExistingArtifacts', () => {
  it('seeds a structured PRD from the latest deep-interview spec', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omx-ralphthon-bootstrap-'));
    try {
      await mkdir(join(cwd, '.omx', 'specs'), { recursive: true });
      await writeFile(join(cwd, '.omx', 'specs', 'deep-interview-demo.md'), `# Demo app\n\n## Desired Outcome\nShip a demo app.\n\n## In-Scope\n- Login flow\n- Dashboard\n\n## Testable acceptance criteria\n- User can sign in\n- Dashboard renders\n`);

      const prd = await bootstrapRalphthonPrdFromExistingArtifacts(cwd, 'fallback');
      assert.ok(prd);
      assert.equal(prd?.project, 'Demo app');
      assert.deepEqual(prd?.stories[0]?.tasks.map((task) => task.desc), ['User can sign in', 'Dashboard renders']);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
