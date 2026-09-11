import { Messages } from "../i18n/messages";
import type { ControlState } from "../models/control-state";

export class ControlFormatHelper {
  private constructor() {}

  static label(controlId: string): string {
    return Messages.controlLabels[controlId] ?? controlId;
  }

  static valueText(control: ControlState): string {
    switch (control.id) {
      // UVC exposure time is expressed in 100 µs units.
      case "exposureTime":
        return `${(control.value / 10).toFixed(1)} ${Messages.units.milliseconds}`;
      case "whiteBalanceTemperature":
        return `${control.value} ${Messages.units.kelvin}`;
      default:
        return String(control.value);
    }
  }

  static optionLabel(controlId: string, value: number): string {
    return Messages.menuOptionLabels[controlId]?.[value] ?? String(value);
  }

  static errorText(prefix: string, error: unknown): string {
    return `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
  }
}
