/** Names of the Rust commands registered in `src-tauri/src/lib.rs`. */
export class TauriCommands {
  static readonly listCameras = "list_cameras";
  static readonly openCamera = "open_camera";
  static readonly readControls = "read_controls";
  static readonly setControl = "set_control";
  static readonly resetControls = "reset_controls";
  static readonly listPresets = "list_presets";
  static readonly savePreset = "save_preset";
  static readonly applyPreset = "apply_preset";
  static readonly deletePreset = "delete_preset";
  static readonly setStartupPreset = "set_startup_preset";
}
