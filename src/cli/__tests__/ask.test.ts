import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseAskArgs } from '../ask.js';

function runOmx(
  cwd: string,
  argv: string[],
  envOverrides: Record<string, string> = {},
): { status: number | null; stdout: string; stderr: string; error?: string } {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omxBin = join(repoRoot, 'bin', 'omx.js');
  const r = spawnSync(process.execPath, [omxBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...envOverrides },
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message };
}

function shouldSkipForSpawnPermissions(err?: string): boolean {
  return typeof err === 'string' && /(EPERM|EACCES)/i.test(err);
}

describe('parseAskArgs', () => {
  it('parses positional prompt form', () => {
    assert.deepEqual(parseAskArgs(['claude', 'review', 'this']), {
      provider: 'claude',
      prompt: 'review this',
    });
  });

  it('parses -p prompt form', () => {
    assert.deepEqual(parseAskArgs(['gemini', '-p', 'brainstorm', 'ideas']), {
      provider: 'gemini',
      prompt: 'brainstorm ideas',
    });
  });

  it('throws for invalid provider', () => {
    assert.throws(() => parseAskArgs(['openai', 'hello']), /Invalid provider/);
  });

  it('throws when prompt is missing', () => {
    assert.throws(() => parseAskArgs(['claude']), /Missing prompt text/);
  });
});

describe('omx ask', () => {
  it('preserves child stdout/stderr and exact non-zero exit code', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-ask-contract-'));
    try {
      const res = runOmx(wd, ['ask', 'claude', 'pass-through'], {
        OMX_ASK_ADVISOR_SCRIPT: 'scripts/fixtures/ask-advisor-stub.js',
        OMX_ASK_STUB_STDOUT: 'artifact-path-from-stub.md\n',
        OMX_ASK_STUB_STDERR: 'stub-warning-line\n',
        OMX_ASK_STUB_EXIT_CODE: '7',
      });
      if (shouldSkipForSpawnPermissions(res.error)) return;

      assert.equal(res.status, 7, res.stderr || res.stdout);
      assert.equal(res.stdout, 'artifact-path-from-stub.md\n');
      assert.equal(res.stderr, 'stub-warning-line\n');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('resolves relative advisor override path from package root even on non-root cwd', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-ask-relative-'));
    try {
      const res = runOmx(wd, ['ask', 'gemini', 'relative-check'], {
        OMX_ASK_ADVISOR_SCRIPT: 'scripts/fixtures/ask-advisor-stub.js',
        OMX_ASK_STUB_STDOUT: 'relative-override-ok\n',
        OMX_ASK_STUB_EXIT_CODE: '0',
      });
      if (shouldSkipForSpawnPermissions(res.error)) return;

      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.equal(res.stdout, 'relative-override-ok\n');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('uses package-root advisor script path from non-package cwd and still writes artifact', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omx-ask-nonroot-'));
    try {
      const fakeBin = join(wd, 'bin');
      await mkdir(fakeBin, { recursive: true });
      await writeFile(
        join(fakeBin, 'claude'),
        '#!/bin/sh\nif [ "$1" = "--version" ]; then echo "fake-claude"; exit 0; fi\nif [ "$1" = "-p" ]; then echo "NONROOT_DEFAULT_OK"; exit 0; fi\necho "unexpected" 1>&2\nexit 3\n',
      );
      await chmod(join(fakeBin, 'claude'), 0o755);

      const res = runOmx(wd, ['ask', 'claude', 'non-root-default'], {
        PATH: `${fakeBin}:${process.env.PATH || ''}`,
      });
      if (shouldSkipForSpawnPermissions(res.error)) return;

      assert.equal(res.status, 0, res.stderr || res.stdout);
      const artifactPath = res.stdout.trim();
      assert.ok(artifactPath.startsWith(join(wd, '.omx', 'artifacts', 'claude-')));
      assert.equal(existsSync(artifactPath), true);
      const artifact = await readFile(artifactPath, 'utf-8');
      assert.match(artifact, /NONROOT_DEFAULT_OK/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});
