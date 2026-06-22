# Troubleshooting

## Capture format

- **Symptom:** what failed
- **Environment:** machine, shell, and repo path
- **Command:** exact command that failed
- **Output:** the important error lines
- **Fix:** the smallest working change

## Common issues

- Missing `omx` command: use `node dist/cli/omx.js ...`
- Missing Rust toolchain: install `rust` or point OMX at a valid `cargo`
- `AGENTS.md` warning: run `node dist/cli/omx.js setup --scope user --merge-agents`

## Recovery rule

- If a fix is durable and reusable, move it into `Decisions.md` after you confirm it works.
