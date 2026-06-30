# LifeOS Operating Guide

This guide defines how to run `yanapang/my-codex`, `LifeOS`, `personal-wiki`,
and `work-wiki` as one practical AI-assisted engineering workspace.

## 1. System Roles

- `my-codex`
  - Runtime, automation, prompts, hooks, scripts, and reproducible setup.
- `LifeOS`
  - Local-first personal operating system.
  - Holds private planning, dashboards, goals, weekly reviews, and sensitive raw notes.
- `personal-wiki`
  - Git-synced personal knowledge that is safe to keep in a repo.
  - Holds reusable learning notes, personal project notes, and durable decisions.
- `work-wiki`
  - Git-synced work knowledge that is safe to keep in a repo.
  - Holds reusable work project context, work logs, and shareable presentation drafts.

## 2. Where Information Goes

- Put private or raw data in local `LifeOS`.
- Put durable personal knowledge in `personal-wiki`.
- Put durable work knowledge in `work-wiki`.
- Put tool behavior, scripts, and AI runtime configuration in `my-codex`.

Use this promotion rule:

1. Capture first in `LifeOS` or the relevant wiki inbox/log area.
2. Refine only after the note proves useful.
3. Promote reusable, non-sensitive knowledge into the correct wiki.
4. Convert repeated patterns into templates, guides, or automation in `my-codex`.

## 3. Daily Workflow

### Start of day

1. Open `LifeOS/00_Dashboard/Home.md`.
2. Choose the top 1-3 outcomes for the day.
3. Decide whether each task is personal, work, or system-maintenance work.

### During work

- Personal study or project work
  - Capture in `personal-wiki/00_Inbox` or `personal-wiki/10_Learning`.
- Work execution
  - Capture in `work-wiki/30_Logs` or the relevant `work-wiki/20_Projects/<project>/`.
- Sensitive drafts, raw exports, or private planning
  - Keep in local `LifeOS` only.

### End of day

1. Promote useful notes from inbox/logs to durable pages.
2. Extract one reusable lesson, one decision, or one artifact candidate.
3. Mark possible portfolio outputs:
   - `resume_bullet`
   - `blog_candidate`
   - `presentation_candidate`
   - `interview_story`

## 4. Agent Routing

Use these six agents as the default routing model:

- `Career Coach`
  - Resume review, portfolio shaping, interview stories, growth planning.
- `Platform Mentor`
  - Kubernetes, Terraform, system design, backend/platform learning, operations review.
- `Pair Programmer`
  - Code changes, debugging, code review, refactors, test design.
- `Writing Coach`
  - Blog posts, documentation polishing, summaries, presentation scripts.
- `Research Agent`
  - Fact-checking, source-backed comparisons, official docs lookup, technology surveys.
- `Life Manager`
  - Weekly planning, prioritization, dashboards, routines, review workflows.

### Shortcut skills

Use these aliases for faster routing in Codex/OMX:

- `$career` -> `Career Coach`
- `$platform` -> `Platform Mentor`
- `$pair` -> `Pair Programmer`
- `$writing` -> `Writing Coach`
- `$research` -> `Research Agent`
- `$life` -> `Life Manager`

### Request routing examples

- Resume review -> `Career Coach`
- Kubernetes troubleshooting -> `Platform Mentor`
- Terraform learning plan -> `Platform Mentor`
- System design critique -> `Platform Mentor`
- Blog writing -> `Writing Coach`
- Weekly planning -> `Life Manager`
- Code review -> `Pair Programmer`
- Source-backed comparison or official-doc verification -> `Research Agent`

### Mixed requests

Use a lead + support model:

- `Platform Mentor` + `Research Agent`
  - For architecture or operations questions that need verified references.
- `Pair Programmer` + `Research Agent`
  - For implementation questions that depend on framework or API changes.
- `Writing Coach` + `Career Coach`
  - For portfolio pieces that need both narrative quality and career relevance.

## 5. Context Boundaries

Each agent should load only the minimum context required.

- `Career Coach`
  - Load resume drafts, role targets, achievement notes, portfolio artifacts.
  - Do not load detailed codebases unless the story depends on them.
- `Platform Mentor`
  - Load architecture notes, runbooks, diagrams, failure logs, and technical goals.
  - Do not load unrelated career or private journal notes.
- `Pair Programmer`
  - Load the active repo, failing tests, stack traces, and implementation notes.
  - Do not load full personal/wiki context by default.
- `Writing Coach`
  - Load source notes, target audience, draft structure, and style constraints.
  - Do not load raw logs beyond what supports the writing task.
- `Research Agent`
  - Load the question, constraints, and current stack choices.
  - Avoid large local note dumps unless they affect evaluation criteria.
- `Life Manager`
  - Load goals, calendar/planning notes, weekly review inputs, and dashboard status.
  - Do not load work project internals unless planning depends on them.

## 6. Security Rules

- Never place secrets, credentials, customer exports, finance actuals, identity documents,
  private journals, or health raw data in any Git-synced wiki.
- `LifeOS` is the default landing zone for sensitive personal material.
- `work-wiki` is for shareable work knowledge only, not raw customer or company secrets.
- `personal-wiki` is for reusable personal knowledge only, not private records.
- Ignore rules reduce accidental commits; they are not encryption.
- Before sending content to a cloud LLM, remove:
  - secrets
  - credentials
  - customer data
  - employer-confidential material
  - personal identity/finance/health raw data

## 7. Portfolio Pipeline

Every substantial task should be able to produce one or more career artifacts.

- GitHub project
  - Promote polished code or automation from `my-codex` or personal repos.
- Technical blog post
  - Convert a durable project note or learning note into a narrative draft.
- Resume bullet
  - Extract impact, scope, technology, and measurable outcome.
- Interview story
  - Capture situation, constraint, action, tradeoff, and result.
- Presentation
  - Promote recurring work lessons into a talk outline.

## 8. Weekly Review

Once per week:

1. Review `LifeOS` goals and dashboards.
2. Archive stale notes.
3. Promote one learning note and one project note into durable form.
4. Tag portfolio-worthy work.
5. Verify wiki and runtime health:
   - `npm run lifeos:doctor`
   - `npm run doctor`

## 9. Minimum Ready State

Treat the workspace as healthy only when all of the following are true:

- `npm run lifeos:doctor` passes.
- `npm run doctor` has no critical OMX setup warnings.
- `LifeOS` is a valid standalone local repo or intentionally non-Git local vault.
- `personal-wiki` and `work-wiki` ignore private data patterns.
- Agent definitions and routing rules are documented and current.

## 10. Immediate Next Steps

1. Restore OMX user setup and AGENTS contract.
2. Repair the local `LifeOS` Git state.
3. Use the agent definitions in `lifeos-template/05_AI/Agent_Workflows/`.
4. Start capturing notes with the routing and promotion rules in this guide.
