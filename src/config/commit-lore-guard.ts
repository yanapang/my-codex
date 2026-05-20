export const OMX_LORE_COMMIT_GUARD_ENV = "OMX_LORE_COMMIT_GUARD";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isLoreCommitGuardEnabled(
	env: NodeJS.ProcessEnv = process.env,
): boolean {
	const raw = env[OMX_LORE_COMMIT_GUARD_ENV];
	if (typeof raw !== "string") return false;
	return ENABLED_VALUES.has(raw.trim().toLowerCase());
}
