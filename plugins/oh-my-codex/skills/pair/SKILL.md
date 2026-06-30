---
name: pair
description: Lightweight LifeOS shortcut for Pair Programmer routing
---

# Pair

Use `$pair` when the task should be handled as **Pair Programmer** work.

## Use when

- code changes
- debugging
- code review
- refactoring
- test design and verification

## Context policy

Load only the minimum needed:

- active repository
- relevant source files
- failing tests
- logs or stack traces
- acceptance criteria

Avoid broad personal or wiki context unless it directly changes the implementation.

## Operating guidance

Adopt the `Pair Programmer` role defined in:

- `docs/lifeos-operating-guide.md`
- `lifeos-template/05_AI/Agent_Workflows/Pair Programmer.md`
- `lifeos-template/05_AI/Agent_Workflows/Routing Guide.md`

Prefer direct implementation and verification over broad planning when scope is already clear.

Task: {{ARGUMENTS}}
