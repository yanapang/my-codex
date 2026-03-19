use std::process::Command;

#[test]
fn schema_subcommand_prints_contract_summary() {
    let output = Command::new(env!("CARGO_BIN_EXE_omx-runtime"))
        .arg("schema")
        .output()
        .expect("ran omx-runtime");

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("runtime-schema=1"));
    assert!(stdout.contains("acquire-authority"));
    assert!(stdout.contains("dispatch-queued"));
    assert!(stdout.contains("transport=tmux"));
    assert!(stdout.contains("queue-transition=notified"));
}

#[test]
fn snapshot_subcommand_prints_runtime_snapshot() {
    let output = Command::new(env!("CARGO_BIN_EXE_omx-runtime"))
        .arg("snapshot")
        .output()
        .expect("ran omx-runtime");

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("authority="));
    assert!(stdout.contains("readiness=blocked"));
}

#[test]
fn mux_contract_subcommand_reports_placeholder_adapter() {
    let output = Command::new(env!("CARGO_BIN_EXE_omx-runtime"))
        .arg("mux-contract")
        .output()
        .expect("ran omx-runtime");

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).expect("utf8 stdout");
    assert!(stdout.contains("adapter-status=tmux adapter placeholder"));
    assert!(stdout.contains("resolve-target"));
    assert!(stdout.contains("submit-policy=enter(presses=2, delay_ms=100)"));
    assert!(stdout.contains("confirmation=Confirmed"));
}
