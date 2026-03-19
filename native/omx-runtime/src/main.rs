use omx_mux::{canonical_contract_summary, MuxAdapter, MuxOperation, MuxTarget, TmuxAdapter};
use omx_runtime_core::{runtime_contract_summary, RuntimeSnapshot};
use std::env;
use std::process;

fn main() {
    if let Err(error) = run() {
        eprintln!("omx-runtime: {error}");
        process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let mut args = env::args().skip(1);
    match args.next().as_deref() {
        None | Some("--help") | Some("-h") => {
            print_usage();
            Ok(())
        }
        Some("schema") => {
            println!("{}", runtime_contract_summary());
            Ok(())
        }
        Some("snapshot") => {
            println!("{}", RuntimeSnapshot::new());
            Ok(())
        }
        Some("mux-contract") => {
            let adapter = TmuxAdapter::new();
            println!("adapter-status={}", adapter.status());
            println!("{}", canonical_contract_summary());
            let sample = MuxOperation::InspectLiveness {
                target: MuxTarget::Detached,
            };
            if let Err(error) = adapter.execute(&sample) {
                println!("sample-operation={error}");
            }
            Ok(())
        }
        Some(other) => Err(format!("unknown subcommand `{other}`")),
    }
}

fn print_usage() {
    println!(concat!(
        "usage: omx-runtime <schema|snapshot|mux-contract>\n",
        "\n",
        "schema        print the runtime command/event/snapshot contract summary\n",
        "snapshot      print a baseline runtime snapshot\n",
        "mux-contract  print the mux boundary summary and adapter status\n"
    ));
}
