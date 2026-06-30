# Personal OMX repo setup

Use this repository as a personal, Git-backed OMX workspace:

1. Clone your fork or custom repo on every machine you want to use.
2. Run `npm ci` to install the local Node dependencies.
3. Run `npm run setup` to refresh OMX prompts, skills, hooks, and config.
4. Run `npm run doctor` to verify the install is healthy.

## What to commit

Keep these in Git when you want them shared across PCs:

- source changes under `src/`, `crates/`, `docs/`, `prompts/`, `skills/`, `templates/`, and `plugins/`
- repo-level docs like usage notes, custom workflows, and setup guidance
- small helper scripts that should be reproducible on every machine

## What to leave local

Do not commit machine-specific or generated runtime state:

- `node_modules/`
- `dist/`
- `target/`
- `.omx/`
- `.codex/`
- `coverage/`
- local agent or workspace artifacts that are already ignored

## Recommended sync flow

When you change something you want on other PCs:

1. Edit the repo.
2. Run `npm run doctor` or your narrower check.
3. Commit the change.
4. Push to your custom GitHub repo.
5. Pull the repo on the other PC and rerun `npm ci` and `npm run setup` if needed.

## Nested wiki repositories

This repo uses Git submodules for cross-machine knowledge stores:

- `personal-wiki` -> `git@github.com:yanapang/personal-wiki.git`
- `work-wiki` -> `git@github.com:yanapang/work-wiki.git`
- `lifeos-template` -> `git@github.com:yanapang/lifeos-template.git`

Clone on a new PC with submodules:

```bash
git clone --recurse-submodules git@github.com:yanapang/my-codex.git
```

If the repo was cloned without submodules:

```bash
git submodule update --init --recursive
```

To pull the latest wiki commits from their `main` branches:

```bash
git submodule update --remote --merge personal-wiki work-wiki lifeos-template
```

After updating a wiki, commit inside that wiki repo first, then commit the updated submodule pointer in this parent repo.

## LifeOS template and local vault

`lifeos-template` is the reproducible, sanitized Obsidian vault template. It
contains structure, dashboards, examples, and safety rules only.

`/Users/yana/Codex/LifeOS` is the real local vault on this PC. It is
intentionally local-only because it may contain sensitive personal, finance,
health, or journal material. Keep private records in ignored local-only paths
such as `99_Private/`, `Private/`, `Secrets/`, `Sensitive/`, `Actuals/`, or
`Raw/`.

This repo can resolve that local vault through an ignored root file named
`.lifeos.local.json`. Use it when your vault is not at the default relative
path `../LifeOS`.

Example:

```json
{
  "vaultPath": "../LifeOS"
}
```

Validation commands:

```bash
npm run lifeos:doctor
npm run lifeos:path
```

To create a local LifeOS vault on another PC, clone or copy the template into a
local vault path and open it in Obsidian:

```bash
git clone git@github.com:yanapang/lifeos-template.git LifeOS
```

Do not commit machine-local private records back to `lifeos-template`.

## Personalization tips

- Put durable cross-machine preferences in tracked docs or scripts.
- Put secrets and login state in the local Codex home, not in Git.
- Prefer a small number of shared conventions over large per-machine overrides.
- If you need a machine-specific tweak, keep it in a separate local note and do not commit it.
- For longer-running personal notes, use the Obsidian wiki under `docs/obsidian/`.

## Repo boundary checklist

- If another machine should reproduce it, keep it in the repo.
- If it is a thought draft, meeting note, or private journal entry, keep it in Obsidian.
- If it contains secrets, tokens, or personal data, keep it outside Git.
- If it only matters on one machine, exclude it or store it locally.
- If you are unsure, default to the wiki first, then promote only the durable part into the repo.
