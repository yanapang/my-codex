import { execFileSync } from 'node:child_process';

function runTmux(args: string[]): string {
  return execFileSync('tmux', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function resolveCurrentTmuxSessionName(paneId?: string): string | null {
  const target = typeof paneId === 'string' && paneId.trim().startsWith('%') ? paneId.trim() : process.env.TMUX_PANE?.trim();
  try {
    const argv = target ? ['display-message', '-p', '-t', target, '#S'] : ['display-message', '-p', '#S'];
    const value = runTmux(argv);
    return value || null;
  } catch {
    return null;
  }
}

export function resolveSessionLeaderPaneId(sessionName: string): string | null {
  try {
    const output = runTmux(['list-panes', '-t', sessionName, '-F', '#{pane_id}\t#{pane_start_command}\t#{pane_current_command}']);
    const lines = output.split('\n').map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      const [paneId = '', startCommand = '', currentCommand = ''] = line.split('\t');
      if (!paneId.startsWith('%')) continue;
      const combined = `${startCommand} ${currentCommand}`.toLowerCase();
      if (/\bomx(?:\.js)?\b/.test(combined) && /\bhud\b/.test(combined) && /--watch\b/.test(combined)) {
        continue;
      }
      return paneId;
    }
  } catch {
    return null;
  }
  return null;
}
