/**
 * Maps a control value to a slider position (0..resolution) on a logarithmic curve,
 * so short exposures get as much travel as long ones. Offset by one so `min` may be 0.
 */
export class LogScaleHelper {
  static readonly resolution = 1000;

  private constructor() {}

  static toPosition(value: number, min: number, max: number): number {
    if (max <= min) {
      return 0;
    }
    const clamped = Math.min(Math.max(value, min), max);
    const ratio = Math.log(clamped - min + 1) / Math.log(max - min + 1);
    return Math.round(ratio * LogScaleHelper.resolution);
  }

  static toValue(position: number, min: number, max: number, step: number): number {
    if (max <= min) {
      return min;
    }
    const ratio = position / LogScaleHelper.resolution;
    const raw = min - 1 + (max - min + 1) ** ratio;
    const snapped = min + Math.round((raw - min) / step) * step;
    return Math.min(Math.max(snapped, min), max);
  }
}
