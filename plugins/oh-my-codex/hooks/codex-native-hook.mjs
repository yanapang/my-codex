#!/usr/bin/env node
import { spawn } from 'node:child_process';

const command = process.env.OMX_NATIVE_HOOK_COMMAND || 'omx';
const child = spawn(command, ['codex-native-hook'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
  shell: process.platform === 'win32',
});

process.stdin.pipe(child.stdin);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on('error', (error) => {
  console.error(`[oh-my-codex] failed to launch ${command} codex-native-hook: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[oh-my-codex] codex-native-hook terminated by ${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 0;
});
