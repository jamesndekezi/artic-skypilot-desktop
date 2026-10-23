// A.R.T.I.C SkyPilot Desktop — Tauri backend
// All flight behaviour is SIMULATED. No real hardware commands are sent.

/// Greet command — used for basic IPC smoke-testing.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("A.R.T.I.C SkyPilot says hello, {}! [SIMULATION MODE]", name)
}

/// Return the current simulation status.
/// This will be expanded to expose simulated telemetry over IPC.
#[tauri::command]
fn get_simulation_status() -> serde_json::Value {
    serde_json::json!({
        "mode": "simulation",
        "live_aircraft_connected": false,
        "disclaimer": "SIMULATION ONLY — NO LIVE AIRCRAFT CONNECTED"
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_simulation_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
