import type { ControlState } from "../models/control-state";

export class ControlStateHelper {
  private constructor() {}

  static byId(controls: ControlState[]): Record<string, ControlState> {
    return Object.fromEntries(controls.map((control) => [control.id, control]));
  }

  static isAtDefault(control: ControlState): boolean {
    return control.defaultValue === null || control.defaultValue === control.value;
  }

  static isEditable(control: ControlState): boolean {
    return control.writable && !control.locked;
  }
}
