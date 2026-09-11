import { describe, expect, it } from "vitest";
import type { CameraInfo } from "../models/camera-info";
import { CameraListHelper } from "./camera-list-helper";

const camera = (id: string): CameraInfo => ({
  id,
  name: "UGREEN camera 2K",
  vendorId: 0x1bcf,
  productId: 0x2284,
});

describe("CameraListHelper", () => {
  it("treats the same ids in any order as unchanged", () => {
    expect(
      CameraListHelper.sameCameras([camera("0-3"), camera("0-5")], [camera("0-5"), camera("0-3")]),
    ).toBe(true);
  });

  it("detects a camera that came back on a new address", () => {
    expect(CameraListHelper.sameCameras([camera("0-3")], [camera("0-7")])).toBe(false);
  });

  it("detects a camera that was unplugged", () => {
    expect(CameraListHelper.sameCameras([camera("0-3")], [])).toBe(false);
  });
});
