use std::fmt;

pub const RUNTIME_SCHEMA_VERSION: u32 = 1;
pub const RUNTIME_COMMAND_NAMES: &[&str] = &[
    "acquire-authority",
    "renew-authority",
    "queue-dispatch",
    "mark-notified",
    "mark-delivered",
    "mark-failed",
    "request-replay",
    "capture-snapshot",
];
pub const RUNTIME_EVENT_NAMES: &[&str] = &[
    "authority-acquired",
    "authority-renewed",
    "dispatch-queued",
    "dispatch-notified",
    "dispatch-delivered",
    "dispatch-failed",
    "replay-requested",
    "snapshot-captured",
];

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeCommand {
    AcquireAuthority {
        owner: String,
        lease_id: String,
        leased_until: String,
    },
    RenewAuthority {
        owner: String,
        lease_id: String,
        leased_until: String,
    },
    QueueDispatch {
        request_id: String,
        target: String,
    },
    MarkNotified {
        request_id: String,
        channel: String,
    },
    MarkDelivered {
        request_id: String,
    },
    MarkFailed {
        request_id: String,
        reason: String,
    },
    RequestReplay {
        cursor: Option<String>,
    },
    CaptureSnapshot,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeEvent {
    AuthorityAcquired {
        owner: String,
        lease_id: String,
        leased_until: String,
    },
    AuthorityRenewed {
        owner: String,
        lease_id: String,
        leased_until: String,
    },
    DispatchQueued {
        request_id: String,
        target: String,
    },
    DispatchNotified {
        request_id: String,
        channel: String,
    },
    DispatchDelivered {
        request_id: String,
    },
    DispatchFailed {
        request_id: String,
        reason: String,
    },
    ReplayRequested {
        cursor: Option<String>,
    },
    SnapshotCaptured,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimeSnapshot {
    pub schema_version: u32,
    pub authority: AuthoritySnapshot,
    pub backlog: BacklogSnapshot,
    pub replay: ReplaySnapshot,
    pub readiness: ReadinessSnapshot,
}

impl RuntimeSnapshot {
    pub fn new() -> Self {
        Self {
            schema_version: RUNTIME_SCHEMA_VERSION,
            authority: AuthoritySnapshot::default(),
            backlog: BacklogSnapshot::default(),
            replay: ReplaySnapshot::default(),
            readiness: ReadinessSnapshot::default(),
        }
    }

    pub fn ready(&self) -> bool {
        self.readiness.ready
    }
}

impl Default for RuntimeSnapshot {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for RuntimeSnapshot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "schema={} authority={} backlog={} replay={} readiness={}",
            self.schema_version, self.authority, self.backlog, self.replay, self.readiness
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AuthoritySnapshot {
    pub owner: Option<String>,
    pub lease_id: Option<String>,
    pub leased_until: Option<String>,
    pub stale: bool,
    pub stale_reason: Option<String>,
}

impl AuthoritySnapshot {
    pub fn acquire(
        owner: impl Into<String>,
        lease_id: impl Into<String>,
        leased_until: impl Into<String>,
    ) -> Self {
        Self {
            owner: Some(owner.into()),
            lease_id: Some(lease_id.into()),
            leased_until: Some(leased_until.into()),
            stale: false,
            stale_reason: None,
        }
    }

    pub fn mark_stale(&mut self, reason: impl Into<String>) {
        self.stale = true;
        self.stale_reason = Some(reason.into());
    }

    pub fn clear_stale(&mut self) {
        self.stale = false;
        self.stale_reason = None;
    }
}

impl Default for AuthoritySnapshot {
    fn default() -> Self {
        Self {
            owner: None,
            lease_id: None,
            leased_until: None,
            stale: false,
            stale_reason: None,
        }
    }
}

impl fmt::Display for AuthoritySnapshot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let owner = self.owner.as_deref().unwrap_or("none");
        let lease_id = self.lease_id.as_deref().unwrap_or("none");
        let leased_until = self.leased_until.as_deref().unwrap_or("none");
        let stale_reason = self.stale_reason.as_deref().unwrap_or("none");
        write!(
            f,
            "owner={} lease_id={} leased_until={} stale={} stale_reason={}",
            owner, lease_id, leased_until, self.stale, stale_reason
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BacklogSnapshot {
    pub pending: u64,
    pub notified: u64,
    pub delivered: u64,
    pub failed: u64,
}

impl BacklogSnapshot {
    pub fn queue_dispatch(&mut self) {
        self.pending += 1;
    }

    pub fn mark_notified(&mut self) -> bool {
        if self.pending == 0 {
            return false;
        }
        self.pending -= 1;
        self.notified += 1;
        true
    }

    pub fn mark_delivered(&mut self) -> bool {
        if self.notified == 0 {
            return false;
        }
        self.notified -= 1;
        self.delivered += 1;
        true
    }

    pub fn mark_failed(&mut self) -> bool {
        if self.notified == 0 {
            return false;
        }
        self.notified -= 1;
        self.failed += 1;
        true
    }
}

impl Default for BacklogSnapshot {
    fn default() -> Self {
        Self {
            pending: 0,
            notified: 0,
            delivered: 0,
            failed: 0,
        }
    }
}

impl fmt::Display for BacklogSnapshot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "pending={} notified={} delivered={} failed={}",
            self.pending, self.notified, self.delivered, self.failed
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReplaySnapshot {
    pub cursor: Option<String>,
    pub pending_events: u64,
    pub last_replayed_event_id: Option<String>,
    pub deferred_leader_notification: bool,
}

impl ReplaySnapshot {
    pub fn queue_event(&mut self) {
        self.pending_events += 1;
    }

    pub fn mark_replayed(&mut self, event_id: impl Into<String>) {
        if self.pending_events > 0 {
            self.pending_events -= 1;
        }
        self.last_replayed_event_id = Some(event_id.into());
    }

    pub fn defer_leader_notification(&mut self) {
        self.deferred_leader_notification = true;
    }

    pub fn clear_deferred_leader_notification(&mut self) {
        self.deferred_leader_notification = false;
    }
}

impl Default for ReplaySnapshot {
    fn default() -> Self {
        Self {
            cursor: None,
            pending_events: 0,
            last_replayed_event_id: None,
            deferred_leader_notification: false,
        }
    }
}

impl fmt::Display for ReplaySnapshot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let cursor = self.cursor.as_deref().unwrap_or("none");
        let last_replayed = self.last_replayed_event_id.as_deref().unwrap_or("none");
        write!(
            f,
            "cursor={} pending_events={} last_replayed_event_id={} deferred_leader_notification={}",
            cursor, self.pending_events, last_replayed, self.deferred_leader_notification
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReadinessSnapshot {
    pub ready: bool,
    pub reasons: Vec<String>,
}

impl ReadinessSnapshot {
    pub fn ready() -> Self {
        Self {
            ready: true,
            reasons: Vec::new(),
        }
    }

    pub fn blocked(reason: impl Into<String>) -> Self {
        Self {
            ready: false,
            reasons: vec![reason.into()],
        }
    }

    pub fn add_reason(&mut self, reason: impl Into<String>) {
        self.ready = false;
        self.reasons.push(reason.into());
    }
}

impl Default for ReadinessSnapshot {
    fn default() -> Self {
        Self::blocked("authority lease not acquired")
    }
}

impl fmt::Display for ReadinessSnapshot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.ready {
            return write!(f, "ready");
        }

        write!(f, "blocked({})", self.reasons.join("; "))
    }
}

pub fn runtime_contract_summary() -> String {
    format!(
        "runtime-schema={version}\ncommands={commands}\nevents={events}\nsnapshot=authority, backlog, replay, readiness",
        version = RUNTIME_SCHEMA_VERSION,
        commands = RUNTIME_COMMAND_NAMES.join(", "),
        events = RUNTIME_EVENT_NAMES.join(", "),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn snapshot_defaults_to_blocked_state() {
        let snapshot = RuntimeSnapshot::new();
        assert_eq!(snapshot.schema_version, RUNTIME_SCHEMA_VERSION);
        assert!(!snapshot.ready());
        assert_eq!(snapshot.backlog, BacklogSnapshot::default());
        assert_eq!(snapshot.authority.owner, None);
        assert_eq!(
            snapshot.readiness.reasons,
            vec!["authority lease not acquired"]
        );
    }

    #[test]
    fn backlog_transitions_preserve_pending_notified_flow() {
        let mut backlog = BacklogSnapshot::default();
        backlog.queue_dispatch();
        assert_eq!(backlog.pending, 1);
        assert!(backlog.mark_notified());
        assert_eq!(backlog.pending, 0);
        assert_eq!(backlog.notified, 1);
        assert!(backlog.mark_delivered());
        assert_eq!(backlog.notified, 0);
        assert_eq!(backlog.delivered, 1);
        assert!(!backlog.mark_failed());
    }

    #[test]
    fn authority_state_can_be_marked_stale() {
        let mut authority =
            AuthoritySnapshot::acquire("worker-1", "lease-1", "2026-03-19T01:40:37Z");
        authority.mark_stale("lease expired");
        assert!(authority.stale);
        assert_eq!(authority.stale_reason.as_deref(), Some("lease expired"));
        authority.clear_stale();
        assert!(!authority.stale);
        assert_eq!(authority.stale_reason, None);
    }
}
