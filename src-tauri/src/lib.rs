mod commands;
mod presets;
mod session;
mod uvc;

use commands::{camera_commands, preset_commands};
use presets::preset_store::PresetStore;
use session::camera_session::CameraSession;
use tauri::Manager;
use uvc::usb_hotplug_watcher::UsbHotplugWatcher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(CameraSession::default())
        .setup(|app| {
            let presets_path = app.path().app_config_dir()?.join("presets.json");
            app.manage(PresetStore::load(presets_path));
            UsbHotplugWatcher::start(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            camera_commands::list_cameras,
            camera_commands::open_camera,
            camera_commands::read_controls,
            camera_commands::set_control,
            camera_commands::reset_controls,
            preset_commands::list_presets,
            preset_commands::save_preset,
            preset_commands::apply_preset,
            preset_commands::delete_preset,
            preset_commands::set_startup_preset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
