import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import { constants as osConstants } from 'os';
import { getPackageRoot } from '../utils/package.js';

export const ASK_USAGE = [
  'Usage: omx ask <claude|gemini> <question or task>',
  '   or: omx ask <claude|gemini> -p "<prompt>"',
].join('\n');

const ASK_PROVIDERS = ['claude', 'gemini'] as const;
type AskProvider = typeof ASK_PROVIDERS[number];
const ASK_PROVIDER_SET = new Set<string>(ASK_PROVIDERS);
const ASK_ADVISOR_SCRIPT_ENV = 'OMX_ASK_ADVISOR_SCRIPT';

export interface ParsedAskArgs {
  provider: AskProvider;
  prompt: string;
}

function askUsageError(reason: string): Error {
  return new Error(`${reason}\n${ASK_USAGE}`);
}

export function parseAskArgs(args: readonly string[]): ParsedAskArgs {
  const [providerRaw, ...rest] = args;
  const provider = (providerRaw || '').toLowerCase();

  if (!provider || !ASK_PROVIDER_SET.has(provider)) {
    throw askUsageError(`Invalid provider "${providerRaw || ''}". Expected one of: ${ASK_PROVIDERS.join(', ')}.`);
  }

  if (rest.length === 0) {
    throw askUsageError('Missing prompt text.');
  }

  const [maybePromptFlag, ...promptRest] = rest;
  if (maybePromptFlag === '-p' || maybePromptFlag === '--prompt') {
    const prompt = promptRest.join(' ').trim();
    if (!prompt) throw askUsageError('Missing prompt text after -p/--prompt.');
    return { provider: provider as AskProvider, prompt };
  }

  const prompt = rest.join(' ').trim();
  if (!prompt) {
    throw askUsageError('Missing prompt text.');
  }

  return { provider: provider as AskProvider, prompt };
}

export function resolveAskAdvisorScriptPath(
  packageRoot = getPackageRoot(),
  env: NodeJS.ProcessEnv = process.env,
): string {
  const override = env[ASK_ADVISOR_SCRIPT_ENV]?.trim();
  if (override) {
    return isAbsolute(override) ? override : join(packageRoot, override);
  }
  return join(packageRoot, 'scripts', 'run-provider-advisor.js');
}

function resolveSignalExitCode(signal: NodeJS.Signals | null): number {
  if (!signal) return 1;
  const signalNumber = osConstants.signals[signal];
  if (typeof signalNumber === 'number' && Number.isFinite(signalNumber)) {
    return 128 + signalNumber;
  }
  return 1;
}

export async function askCommand(args: string[]): Promise<void> {
  const parsed = parseAskArgs(args);
  const packageRoot = getPackageRoot();
  const advisorScriptPath = resolveAskAdvisorScriptPath(packageRoot);

  if (!existsSync(advisorScriptPath)) {
    throw new Error(`[ask] advisor script not found: ${advisorScriptPath}`);
  }

  const child = spawnSync(
    process.execPath,
    [advisorScriptPath, parsed.provider, parsed.prompt],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  if (child.stdout && child.stdout.length > 0) {
    process.stdout.write(child.stdout);
  }
  if (child.stderr && child.stderr.length > 0) {
    process.stderr.write(child.stderr);
  }

  if (child.error) {
    throw new Error(`[ask] failed to launch advisor script: ${child.error.message}`);
  }

  const status = typeof child.status === 'number'
    ? child.status
    : resolveSignalExitCode(child.signal);

  if (status !== 0) {
    process.exitCode = status;
  }
}
