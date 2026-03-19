# OMX ↔ mux canonical operation space

This document defines the mux boundary owned by OMX core semantics.

## Canonical operations

| Operation | Purpose |
|---|---|
| `resolve-target` | Convert a logical delivery target into an adapter-specific endpoint. |
| `send-input` | Forward literal input to a resolved target. |
| `capture-tail` | Read a bounded tail of adapter output. |
| `inspect-liveness` | Check whether a target is still alive. |
| `attach` | Attach the operator to a live target. |
| `detach` | Detach the operator from a live target. |

## Target kinds
- `delivery-handle`
- `detached`

## Transport primitives
- `SubmitPolicy` controls how many isolated `C-m` submissions the adapter emits.
- `InputEnvelope` holds literal text plus newline-normalization rules.
- `InjectionPreflight` captures readiness checks before delivery.
- `PaneReadinessReason` explains why a target is or is not injectable.
- `DeliveryConfirmation` records whether a send was confirmed, active-task confirmed, or left unconfirmed.
- `ConfirmationPolicy` defines the retry/verification window used by the adapter.

## Rules
- The semantic contract must not depend on tmux-native nouns.
- Tmux is the first adapter, not the model.
- Adapter results may include tmux identifiers for debugging, but those identifiers are not semantic truth.
- Retry, confirmation, and delivery decisions belong to the runtime contract, not the adapter implementation.

## Adapter placeholder
The first release may ship a tmux-first adapter that reports unsupported operations for unimplemented paths, but the canonical shape above remains stable.
