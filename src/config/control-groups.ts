import type { ControlGroup } from "../models/control-group";

/** Display order of the controls; ids match the Rust `ControlCatalog`. */
export class ControlGroups {
  static readonly all: ControlGroup[] = [
    {
      id: "image",
      controlIds: [
        "brightness",
        "contrast",
        "saturation",
        "hueAuto",
        "hue",
        "sharpness",
        "gamma",
        "backlightCompensation",
      ],
    },
    { id: "color", controlIds: ["whiteBalanceAuto", "whiteBalanceTemperature"] },
    {
      id: "exposure",
      controlIds: ["autoExposureMode", "exposureTime", "gain", "powerLineFrequency"],
    },
    { id: "optics", controlIds: ["focusAuto", "focus", "zoom", "pan", "tilt", "roll"] },
  ];
}
