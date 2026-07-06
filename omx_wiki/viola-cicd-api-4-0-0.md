# viola-cicd-api 4.0.0

Category: reference
Tags: viola-cicd-api, 4.0.0, backend, project-hub

## Definition

- Canonical agent-facing summary for `/Users/yeeunhwang/Project/vio400/viola-cicd-api`.
- Backend API service for the `viola-cicd` product family.
- Stack: Spring Boot 3.5.12, Java 21, Gradle 8.14.4.

## Core responsibilities

- Repository integration
- Build orchestration
- Test orchestration
- Deploy orchestration
- Pipeline orchestration
- Dashboard, SSE, scheduling, and external integration APIs

## Actual project shape

- Top-level directories:
  - `docs/`
  - `gradle/`
  - `src/main/java/com/okestro/viola/cicdapi/`
  - `src/main/resources/`
  - `src/test/`
- Package layers:
  - `api`
  - `application`
  - `domain`
  - `infrastructure`
  - `shared`

## Important correction

- The real 4.0.0 repository is broader than only `build/test/deploy/pipeline`.
- Present code areas also include:
  - `imageregistry`
  - `notification`
  - `permission`
  - `registry`
  - `messaging`
  - `redis`
  - `rbac`

## Working guidance

- Start with `api/*/controller` for endpoint contracts.
- Move to `application/*/service` for orchestration.
- Move to `domain/*/model` for execution models.
- Move to `infrastructure/persistence/*` for DB mappings.

## Human wiki source

- `/Users/yeeunhwang/Codex/work-wiki/20_Projects/viola-cicd-api/README.md`
- `/Users/yeeunhwang/Codex/work-wiki/20_Projects/viola-cicd-api/OVERVIEW.md`
- `/Users/yeeunhwang/Codex/work-wiki/20_Projects/viola-cicd-api/STRUCTURE.md`
- `/Users/yeeunhwang/Codex/work-wiki/20_Projects/viola-cicd-api/SETTINGS.md`

## Related

- [[viola-cicd-api-4-0-0-pipeline]]

