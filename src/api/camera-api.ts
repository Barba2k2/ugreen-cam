import { invoke } from "@tauri-apps/api/core";
import type { CameraInfo } from "../models/camera-info";
import type { ControlState } from "../models/control-state";
import { TauriCommands } from "./tauri-commands";

export class CameraApi {
  private constructor() {}

  static listCameras(): Promise<CameraInfo[]> {
    return invoke(TauriCommands.listCameras);
  }

  static openCamera(cameraId: string): Promise<ControlState[]> {
    return invoke(TauriCommands.openCamera, { cameraId });
  }

  static readControls(): Promise<ControlState[]> {
    return invoke(TauriCommands.readControls);
  }

  /** Returns the written control plus the controls its automatic mode affects. */
  static setControl(controlId: string, value: number): Promise<ControlState[]> {
    return invoke(TauriCommands.setControl, { controlId, value });
  }

  static resetControls(): Promise<ControlState[]> {
    return invoke(TauriCommands.resetControls);
  }
}
