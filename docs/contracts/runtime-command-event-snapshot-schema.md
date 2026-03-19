# Runtime command / event / snapshot schema

This document defines the Rust-owned runtime contract used by the first greenfield cutover.

## Scope
- Commands describe semantic requests.
- Events describe semantic outcomes.
- Snapshots describe the current truth of the runtime.
- Transport details (JSON, IPC, files) are implementation details layered on top.

## Command shapes

| Command | Required fields | Meaning |
|---|---|---|
| `acquire-authority` | `owner`, `lease_id`, `leased_until` | Claim the single semantic authority lease. |
| `renew-authority` | `owner`, `lease_id`, `leased_until` | Extend the current lease without changing ownership. |
| `queue-dispatch` | `request_id`, `target` | Add one dispatch request to the backlog. |
| `mark-notified` | `request_id`, `channel` | Record that a queued dispatch has been delivered to an observer or target. |
| `mark-delivered` | `request_id` | Record successful delivery completion. |
| `mark-failed` | `request_id`, `reason` | Record failed delivery completion. |
| `request-replay` | `cursor` | Ask the runtime to replay from a durable cursor. |
| `capture-snapshot` | none | Emit the current semantic snapshot. |

## Event shapes

| Event | Required fields | Meaning |
|---|---|---|
| `authority-acquired` | `owner`, `lease_id`, `leased_until` | A new authority lease is active. |
| `authority-renewed` | `owner`, `lease_id`, `leased_until` | The active lease was renewed. |
| `dispatch-queued` | `request_id`, `target` | A request entered backlog. |
| `dispatch-notified` | `request_id`, `channel` | A request moved out of pending and into notification. |
| `dispatch-delivered` | `request_id` | The request completed successfully. |
| `dispatch-failed` | `request_id`, `reason` | The request completed with failure. |
| `replay-requested` | `cursor` | Replay or recovery work was requested. |
| `snapshot-captured` | none | A snapshot was emitted for observers. |

## Snapshot fields

| Field | Meaning |
|---|---|
| `schema_version` | Contract version for the runtime snapshot. |
| `authority.owner` | The current semantic owner, if any. |
| `authority.lease_id` | Lease identifier for the current owner. |
| `authority.leased_until` | Lease expiry marker. |
| `authority.stale` | Whether the current owner is stale or expired. |
| `backlog.pending` | Dispatches awaiting notification. |
| `backlog.notified` | Dispatches that were notified and are waiting for completion. |
| `backlog.delivered` | Dispatches that completed successfully. |
| `backlog.failed` | Dispatches that completed with failure. |
| `replay.cursor` | Durable replay cursor, if any. |
| `replay.pending_events` | Number of replayable events not yet applied. |
| `replay.last_replayed_event_id` | Last replayed event marker. |
| `replay.deferred_leader_notification` | Whether leader notification was intentionally deferred. |
| `readiness.ready` | Whether the runtime is ready for operator traffic. |
| `readiness.reasons` | Human-readable blockers when the runtime is not ready. |

## Invariants
- Exactly one semantic authority owner may be active at a time.
- Dispatches must move `pending -> notified -> delivered|failed`.
- Replay state must be durable and deduplicated.
- Readiness is derived from Rust-owned truth, not from JS-side inference.

