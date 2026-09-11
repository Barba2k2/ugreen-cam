import { describe, expect, it } from "vitest";
import type { ControlState } from "../models/control-state";
import { ControlSliderHelper } from "./control-slider-helper";
import { LogScaleHelper } from "./log-scale-helper";

const control = (id: string, value: number, min: number, max: number): ControlState => ({
  id,
  controlType: "range",
  value,
  min,
  max,
  step: 1,
  defaultValue: null,
  options: [],
  writable: true,
  locked: false,
});

describe("ControlSliderHelper", () => {
  it("passes linear controls straight through", () => {
    const brightness = control("brightness", 120, 0, 255);

    expect(ControlSliderHelper.range(brightness)).toEqual({
      value: 120,
      min: 0,
      max: 255,
      step: 1,
    });
    expect(ControlSliderHelper.controlValue(brightness, 42)).toBe(42);
  });

  it("drives exposure time through the logarithmic curve", () => {
    const exposure = control("exposureTime", 166, 3, 768);
    const range = ControlSliderHelper.range(exposure);

    expect(range.min).toBe(0);
    expect(range.max).toBe(LogScaleHelper.resolution);
    expect(ControlSliderHelper.controlValue(exposure, range.value)).toBe(166);
    expect(ControlSliderHelper.controlValue(exposure, range.max)).toBe(768);
  });
});
