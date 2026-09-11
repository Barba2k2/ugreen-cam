import { ControlScales } from "../config/control-scales";
import type { ControlState } from "../models/control-state";
import { LogScaleHelper } from "./log-scale-helper";

interface SliderRange {
  value: number;
  min: number;
  max: number;
  step: number;
}

/** Translates between a control's value and its slider, linear or logarithmic. */
export class ControlSliderHelper {
  private constructor() {}

  static range(control: ControlState): SliderRange {
    if (!ControlScales.logarithmic.has(control.id)) {
      return { value: control.value, min: control.min, max: control.max, step: control.step };
    }
    return {
      value: LogScaleHelper.toPosition(control.value, control.min, control.max),
      min: 0,
      max: LogScaleHelper.resolution,
      step: 1,
    };
  }

  static controlValue(control: ControlState, sliderValue: number): number {
    if (!ControlScales.logarithmic.has(control.id)) {
      return sliderValue;
    }
    return LogScaleHelper.toValue(sliderValue, control.min, control.max, control.step);
  }
}
