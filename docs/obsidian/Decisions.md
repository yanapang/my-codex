# Decisions

## Decision log template

- **Date:** YYYY-MM-DD
- **Decision:** what we chose
- **Reason:** why we chose it
- **Impact:** what changed because of it
- **Follow-up:** what to revisit later

## Example entry

- **Date:** 2026-06-22
- **Decision:** keep runtime state local and Git only for shared repo assets
- **Reason:** it makes the setup reproducible across machines
- **Impact:** `.omx/`, `.codex/`, and similar machine state stay out of Git
- **Follow-up:** update the wiki when a new shared convention appears
