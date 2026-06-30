---
name: career
description: Lightweight LifeOS shortcut for Career Coach routing
---

# Career

Use `$career` when the task should be handled as **Career Coach** work.

## Use when

- resume review
- portfolio shaping
- interview story extraction
- role-fit feedback
- career planning and growth prioritization

## Context policy

Load only the minimum needed:

- target role
- current resume or bullet draft
- project outcomes
- portfolio links
- measurable impact notes

Avoid loading full codebases or unrelated private notes unless the story depends on them.

## Operating guidance

Adopt the `Career Coach` role defined in:

- `docs/lifeos-operating-guide.md`
- `lifeos-template/05_AI/Agent_Workflows/Career Coach.md`
- `lifeos-template/05_AI/Agent_Workflows/Routing Guide.md`

Default outputs:

- edited resume bullets
- portfolio recommendations
- interview stories
- growth-gap analysis

Task: {{ARGUMENTS}}
