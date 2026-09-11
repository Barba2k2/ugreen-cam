import { describe, expect, it } from "vitest";
import { LogScaleHelper } from "./log-scale-helper";

// Exposure time range reported by the UGREEN camera 2K, in 100 µs units.
const min = 3;
const max = 768;

describe("LogScaleHelper", () => {
  it("maps the ends of the range to the ends of the slider", () => {
    expect(LogScaleHelper.toPosition(min, min, max)).toBe(0);
    expect(LogScaleHelper.toPosition(max, min, max)).toBe(LogScaleHelper.resolution);
    expect(LogScaleHelper.toValue(0, min, max, 1)).toBe(min);
    expect(LogScaleHelper.toValue(LogScaleHelper.resolution, min, max, 1)).toBe(max);
  });

  it("gives short exposures most of the travel", () => {
    // 10 ms sits past the middle of the slider instead of at 13% as on a linear scale.
    expect(LogScaleHelper.toPosition(100, min, max)).toBeGreaterThan(600);
  });

  it("reaches every short exposure exactly", () => {
    // Up to ~17 ms each integer still owns at least one slider position.
    for (let value = min; value <= 160; value++) {
      const position = LogScaleHelper.toPosition(value, min, max);
      expect(LogScaleHelper.toValue(position, min, max, 1)).toBe(value);
    }
  });

  it("stays within 1% on long exposures, where neighbours share a position", () => {
    for (let value = 161; value <= max; value++) {
      const position = LogScaleHelper.toPosition(value, min, max);
      const back = LogScaleHelper.toValue(position, min, max, 1);
      expect(Math.abs(back - value) / value).toBeLessThanOrEqual(0.01);
    }
  });

  it("never moves backwards as the slider moves forward", () => {
    let previous = min;
    for (let position = 0; position <= LogScaleHelper.resolution; position++) {
      const value = LogScaleHelper.toValue(position, min, max, 1);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it("snaps to the control's step and handles a zero minimum", () => {
    expect(LogScaleHelper.toValue(500, 0, 1000, 10) % 10).toBe(0);
    expect(LogScaleHelper.toPosition(0, 0, 1000)).toBe(0);
  });

  it("clamps out-of-range values and degenerate ranges", () => {
    expect(LogScaleHelper.toPosition(9999, min, max)).toBe(LogScaleHelper.resolution);
    expect(LogScaleHelper.toPosition(5, 5, 5)).toBe(0);
    expect(LogScaleHelper.toValue(700, 5, 5, 1)).toBe(5);
  });
});
