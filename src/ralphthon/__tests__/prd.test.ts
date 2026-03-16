import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  appendHardeningTasks,
  allStoryTasksDone,
  canonicalRalphthonPrdPath,
  completeRalphthonPrd,
  createRalphthonPrd,
  ensureHardeningPhase,
  findTaskRef,
  markTaskStatus,
  nextPendingTask,
  readRalphthonPrd,
  recordHardeningWaveResult,
  resolveExistingRalphthonPrdPath,
  shouldTerminateHardening,
  writeRalphthonPrd,
} from '../prd.js';

describe('ralphthon PRD utilities', () => {
  it('creates defaults that match the requested hackathon workflow', () => {
    const prd = createRalphthonPrd({
      project: 'demo-app',
      stories: [{
        id: 'S1',
        title: 'Auth flow',
        tasks: [{ id: 'T1', desc: 'Implement OAuth login', status: 'pending', retries: 0 }],
        status: 'pending',
      }],
    });

    assert.equal(prd.project, 'demo-app');
    assert.equal(prd.phase, 'development');
    assert.equal(prd.config.maxRetries, 3);
    assert.equal(prd.config.pollIntervalSec, 120);
    assert.equal(prd.config.idleTimeoutSec, 30);
    assert.equal(prd.runtime.currentHardeningWave, 0);
    assert.equal(prd.runtime.consecutiveHardeningNoIssueWaves, 0);
  });

  it('persists to the canonical ralphthon path and can read it back', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omx-ralphthon-prd-'));
    try {
      const prd = createRalphthonPrd({ project: 'persist-me' });
      const writtenPath = await writeRalphthonPrd(cwd, prd);
      assert.equal(writtenPath, canonicalRalphthonPrdPath(cwd));
      assert.equal(resolveExistingRalphthonPrdPath(cwd), writtenPath);

      const loaded = await readRalphthonPrd(cwd);
      assert.equal(loaded?.project, 'persist-me');
      assert.equal(loaded?.schemaVersion, 1);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('selects development work before hardening work', () => {
    const prd = createRalphthonPrd({
      project: 'selector',
      stories: [{
        id: 'S1',
        title: 'Story 1',
        status: 'pending',
        tasks: [{ id: 'T1', desc: 'First task', status: 'pending', retries: 0 }],
      }],
      hardening: [{ id: 'H1', desc: 'Edge tests', status: 'pending', retries: 0, wave: 1 }],
    });

    assert.equal(nextPendingTask(prd)?.task.id, 'T1');

    const hardeningOnly = {
      ...markTaskStatus(prd, 'T1', 'done'),
      phase: 'hardening' as const,
    };
    assert.equal(nextPendingTask(hardeningOnly)?.task.id, 'H1');
  });

  it('recomputes story status from task status transitions', () => {
    const prd = createRalphthonPrd({
      project: 'statuses',
      stories: [{
        id: 'S1',
        title: 'Story 1',
        status: 'pending',
        tasks: [{ id: 'T1', desc: 'Ship it', status: 'pending', retries: 0 }],
      }],
    });

    const inProgress = markTaskStatus(prd, 'T1', 'in_progress');
    assert.equal(findTaskRef(inProgress, 'T1')?.task.status, 'in_progress');
    assert.equal(inProgress.stories[0]?.status, 'in_progress');

    const done = markTaskStatus(inProgress, 'T1', 'done');
    assert.equal(done.stories[0]?.status, 'done');
    assert.equal(allStoryTasksDone(done), true);
  });

  it('transitions into hardening once all story work is terminal', () => {
    const prd = createRalphthonPrd({
      project: 'hardening',
      stories: [{
        id: 'S1',
        title: 'Story 1',
        status: 'pending',
        tasks: [{ id: 'T1', desc: 'Core feature', status: 'pending', retries: 0 }],
      }],
    });

    const done = markTaskStatus(prd, 'T1', 'done');
    const hardening = ensureHardeningPhase(done);
    assert.equal(hardening.phase, 'hardening');
    assert.equal(hardening.runtime.currentHardeningWave, 0);
  });

  it('tracks hardening waves and termination after repeated no-issue waves', () => {
    const prd = createRalphthonPrd({ project: 'hardening-loops' });
    const hardening = ensureHardeningPhase(prd);
    const withTasks = appendHardeningTasks(hardening, ['Edge-case tests'], 1);
    assert.equal(withTasks.hardening.length, 1);
    assert.equal(withTasks.runtime.consecutiveHardeningNoIssueWaves, 0);

    const noIssues1 = recordHardeningWaveResult(withTasks, 0);
    const noIssues2 = recordHardeningWaveResult({
      ...noIssues1,
      hardening: noIssues1.hardening.map((task: (typeof noIssues1.hardening)[number]) => ({ ...task, status: 'done' as const })),
    }, 0);
    const noIssues3 = recordHardeningWaveResult(noIssues2, 0);

    assert.equal(shouldTerminateHardening(noIssues3), true);
    assert.equal(completeRalphthonPrd(noIssues3).phase, 'complete');
  });

  it('falls back to legacy .omx/prd.json only when it matches the ralphthon schema', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omx-ralphthon-legacy-'));
    try {
      const legacyPath = join(cwd, '.omx', 'prd.json');
      const prd = createRalphthonPrd({ project: 'legacy-ok' });
      await (await import('node:fs/promises')).mkdir(join(cwd, '.omx'), { recursive: true });
      await (await import('node:fs/promises')).writeFile(legacyPath, JSON.stringify(prd, null, 2));
      assert.equal(resolveExistingRalphthonPrdPath(cwd), legacyPath);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
