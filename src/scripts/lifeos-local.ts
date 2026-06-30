import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

type LifeOsLocalConfig = {
  vaultPath?: string;
};

const repoRoot = process.cwd();
const defaultVaultPath = '../LifeOS';
const localConfigPath = resolve(repoRoot, '.lifeos.local.json');

function readLocalConfig(): LifeOsLocalConfig {
  if (!existsSync(localConfigPath)) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(localConfigPath, 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[lifeos] Failed to parse .lifeos.local.json: ${message}`);
    process.exit(1);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error('[lifeos] .lifeos.local.json must contain a JSON object.');
    process.exit(1);
  }

  return parsed as LifeOsLocalConfig;
}

function resolveVaultPath(config: LifeOsLocalConfig): string {
  const configured = config.vaultPath?.trim();
  const rawPath = configured && configured.length > 0 ? configured : defaultVaultPath;
  return isAbsolute(rawPath) ? rawPath : resolve(repoRoot, rawPath);
}

function main(): void {
  const config = readLocalConfig();
  const vaultPath = resolveVaultPath(config);
  const printPathOnly = process.argv.includes('--print-path');

  if (printPathOnly) {
    console.log(vaultPath);
    return;
  }

  const source = config.vaultPath?.trim() ? '.lifeos.local.json' : 'default ../LifeOS';

  if (!existsSync(vaultPath)) {
    console.error(`[lifeos] Missing local vault: ${vaultPath}`);
    console.error(`[lifeos] Path source: ${source}`);
    console.error('[lifeos] Create ../LifeOS or set "vaultPath" in .lifeos.local.json.');
    process.exit(1);
  }

  console.log(`[lifeos] OK: ${vaultPath}`);
  console.log(`[lifeos] Path source: ${source}`);
}

main();
