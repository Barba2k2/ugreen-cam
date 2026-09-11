import { describe, expect, it } from "vitest";
import type { ControlState } from "../models/control-state";
import { ControlFormatHelper } from "./control-format-helper";

const control = (id: string, value: number): ControlState => ({
  id,
  controlType: "range",
  value,
  min: 0,
  max: 10000,
  step: 1,
  defaultValue: null,
  options: [],
  writable: true,
  locked: false,
});

describe("ControlFormatHelper", () => {
  it("shows exposure time in milliseconds from 100 µs units", () => {
    expect(ControlFormatHelper.valueText(control("exposureTime", 156))).toBe("15.6 ms");
  });

  it("shows white balance in kelvin", () => {
    expect(ControlFormatHelper.valueText(control("whiteBalanceTemperature", 4600))).toBe("4600 K");
  });

  it("labels known menu options and falls back to the raw value", () => {
    expect(ControlFormatHelper.optionLabel("powerLineFrequency", 1)).toBe("50 Hz");
    expect(ControlFormatHelper.optionLabel("powerLineFrequency", 9)).toBe("9");
  });
});
