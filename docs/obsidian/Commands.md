# Commands

## Common commands

```bash
npm ci
npm run setup
npm run doctor
node dist/cli/omx.js setup --scope user --merge-agents
node dist/cli/omx.js doctor
```

## Useful checks

- `git status --short --branch`
- `codex --version`
- `node -v`
- `cargo --version`

## Notes

- Prefer repo-local commands when the global wrapper is unavailable.
- Keep commands short and repeatable.
