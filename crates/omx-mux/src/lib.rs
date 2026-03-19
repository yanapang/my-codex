use std::fmt;

pub const MUX_OPERATION_NAMES: &[&str] = &[
    "resolve-target",
    "send-input",
    "capture-tail",
    "inspect-liveness",
    "attach",
    "detach",
];
pub const MUX_TARGET_KINDS: &[&str] = &["delivery-handle", "detached"];

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MuxTarget {
    DeliveryHandle(String),
    Detached,
}

impl MuxTarget {
    pub fn delivery_handle(handle: impl Into<String>) -> Self {
        Self::DeliveryHandle(handle.into())
    }
}

impl fmt::Display for MuxTarget {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DeliveryHandle(handle) => write!(f, "delivery-handle({handle})"),
            Self::Detached => write!(f, "detached"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MuxOperation {
    ResolveTarget {
        target: MuxTarget,
    },
    SendInput {
        target: MuxTarget,
        literal_input: String,
    },
    CaptureTail {
        target: MuxTarget,
        visible_lines: usize,
    },
    InspectLiveness {
        target: MuxTarget,
    },
    Attach {
        target: MuxTarget,
    },
    Detach {
        target: MuxTarget,
    },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MuxOutcome {
    TargetResolved { resolved_handle: String },
    InputAccepted { bytes_written: usize },
    TailCaptured { visible_lines: usize, body: String },
    LivenessChecked { alive: bool },
    Attached { handle: String },
    Detached { handle: String },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MuxError {
    Unsupported(String),
    InvalidTarget(String),
    AdapterFailed(String),
}

impl fmt::Display for MuxError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Unsupported(message) => write!(f, "unsupported: {message}"),
            Self::InvalidTarget(message) => write!(f, "invalid target: {message}"),
            Self::AdapterFailed(message) => write!(f, "adapter failed: {message}"),
        }
    }
}

impl std::error::Error for MuxError {}

pub trait MuxAdapter {
    fn adapter_name(&self) -> &'static str;

    fn execute(&self, operation: &MuxOperation) -> Result<MuxOutcome, MuxError>;
}

#[derive(Debug, Clone, Copy, Default)]
pub struct TmuxAdapter;

impl TmuxAdapter {
    pub fn new() -> Self {
        Self
    }

    pub fn status(&self) -> &'static str {
        "tmux adapter placeholder"
    }
}

impl MuxAdapter for TmuxAdapter {
    fn adapter_name(&self) -> &'static str {
        "tmux"
    }

    fn execute(&self, operation: &MuxOperation) -> Result<MuxOutcome, MuxError> {
        Err(MuxError::Unsupported(format!(
            "{} is not wired yet",
            describe_operation(operation)
        )))
    }
}

fn describe_operation(operation: &MuxOperation) -> &'static str {
    match operation {
        MuxOperation::ResolveTarget { .. } => "resolve-target",
        MuxOperation::SendInput { .. } => "send-input",
        MuxOperation::CaptureTail { .. } => "capture-tail",
        MuxOperation::InspectLiveness { .. } => "inspect-liveness",
        MuxOperation::Attach { .. } => "attach",
        MuxOperation::Detach { .. } => "detach",
    }
}

pub fn canonical_contract_summary() -> String {
    format!(
        "mux-operations={operations}\nmux-target-kinds={target_kinds}\nadapter=tmux-first placeholder",
        operations = MUX_OPERATION_NAMES.join(", "),
        target_kinds = MUX_TARGET_KINDS.join(", "),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_contract_names_remain_generic() {
        assert_eq!(
            MUX_OPERATION_NAMES,
            &[
                "resolve-target",
                "send-input",
                "capture-tail",
                "inspect-liveness",
                "attach",
                "detach",
            ]
        );
        assert_eq!(MUX_TARGET_KINDS, &["delivery-handle", "detached"]);
    }

    #[test]
    fn placeholder_adapter_reports_unimplemented_state() {
        let adapter = TmuxAdapter::new();
        assert_eq!(adapter.adapter_name(), "tmux");
        assert_eq!(adapter.status(), "tmux adapter placeholder");

        let error = adapter
            .execute(&MuxOperation::Detach {
                target: MuxTarget::Detached,
            })
            .expect_err("expected placeholder adapter to reject execution");
        assert!(matches!(error, MuxError::Unsupported(message) if message.contains("detach")));
    }
}
