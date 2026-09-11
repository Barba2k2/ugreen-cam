import type { CameraInfo } from "../models/camera-info";

export class CameraListHelper {
  private constructor() {}

  /** Same cameras on the same bus addresses: an unrelated USB device came or went. */
  static sameCameras(current: CameraInfo[], next: CameraInfo[]): boolean {
    const ids = (cameras: CameraInfo[]) =>
      cameras
        .map((camera) => camera.id)
        .sort()
        .join(",");
    return ids(current) === ids(next);
  }
}
