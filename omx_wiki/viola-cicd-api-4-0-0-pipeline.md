# viola-cicd-api 4.0.0 pipeline

Category: reference
Tags: viola-cicd-api, 4.0.0, pipeline, execution, persistence

## Subsystem definition

- The pipeline subsystem owns pipeline config, execution, retry, cancellation, status lookup, log lookup, and execution statistics.
- It spans:
  - `api/pipeline`
  - `application/pipeline`
  - `domain/pipeline`
  - `infrastructure/persistence/pipeline`

## Execution flow

- `PipelineExecutorController` exposes execute, retry, status, and cancel.
- `PipelineExecutor` validates running state, checks source readiness, loads script, creates execution logs, and delegates async execution.
- `PipelineStageService` runs stages sequentially and steps in parallel.
- `PipelineRecordService` seeds and updates pipeline/detail logs.

## Persistence flow

- `cicd_pipeline_config`
  - durable pipeline definition
- `cicd_pipeline_config_detail`
  - stage membership and order
- `cicd_pipeline_log`
  - execution header row
- `cicd_pipeline_detail_log`
  - per-step execution rows
- `cicd_pipeline_config_history`
  - versioned snapshot for flow-data recovery

## Operational notes

- The execution engine is async, but start is guarded by a single running check.
- Config rows and execution log rows are separate contracts.
- Historical flow data is restored through config history, not only the live config table.

## Human wiki source

- `/Users/yeeunhwang/Codex/work-wiki/20_Projects/viola-cicd-api/PIPELINE.md`
- `/Users/yeeunhwang/Codex/work-wiki/20_Projects/viola-cicd-api/viola-cicd-api-4.0.0-pipeline-analysis.md`

## Related

- [[viola-cicd-api-4-0-0]]

