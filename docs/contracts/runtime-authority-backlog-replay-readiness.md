# Runtime authority, backlog, replay, and readiness semantics

This document captures the Rust-owned runtime semantics that replace JS-side truth.

## Authority
- The runtime has one active authority lease at most.
- A lease has:
  - `owner`
  - `lease_id`
  - `leased_until`
- A stale or expired lease must be marked stale before another owner is granted authority.

## Backlog
- New work enters the backlog as `pending`.
- Notification moves work from `pending` to `notified`.
- Completion moves work from `notified` to either `delivered` or `failed`.
- `pending`, `notified`, `delivered`, and `failed` are counts in the runtime snapshot.

## Replay / recovery
- Replay is cursor-based and durable.
- Replayed items must be deduplicated.
- Deferred leader notification is tracked explicitly so observers can tell why delivery has not been surfaced yet.

## Readiness
- Readiness is a Rust-authored snapshot, not an inferred CLI opinion.
- The runtime is not ready when the lease is missing, stale, or otherwise invalid.
- The snapshot should include the exact blockers so operators can see why recovery is paused.

## Dispatch classification
- `WorkerCli` selects the submit policy (`Claude` => 1 press, `Codex`/other => 2 presses).
- `DispatchOutcomeReason` and `QueueTransition` classify send success, retry, pending, and failure outcomes.
- Deferred leader-missing cases stay pending so the runtime can retry when a pane becomes available.
- Unconfirmed sends can stay pending while retries remain; otherwise they fail with an unconfirmed reason.
