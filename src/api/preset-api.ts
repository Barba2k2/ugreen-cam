import { invoke } from "@tauri-apps/api/core";
import type { ControlState } from "../models/control-state";
import type { PresetsView } from "../models/preset";
import { TauriCommands } from "./tauri-commands";

/** Presets always refer to the camera currently open in the Rust session. */
export class PresetApi {
  private constructor() {}

  static listPresets(): Promise<PresetsView> {
    return invoke(TauriCommands.listPresets);
  }

  /** Captures the camera's current values; an existing name is overwritten. */
  static savePreset(name: string): Promise<PresetsView> {
    return invoke(TauriCommands.savePreset, { name });
  }

  static applyPreset(presetId: string): Promise<ControlState[]> {
    return invoke(TauriCommands.applyPreset, { presetId });
  }

  static deletePreset(presetId: string): Promise<PresetsView> {
    return invoke(TauriCommands.deletePreset, { presetId });
  }

  static setStartupPreset(presetId: string | null): Promise<PresetsView> {
    return invoke(TauriCommands.setStartupPreset, { presetId });
  }
}
