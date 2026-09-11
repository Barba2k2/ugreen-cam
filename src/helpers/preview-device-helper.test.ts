import { describe, expect, it } from "vitest";
import { PreviewDeviceHelper } from "./preview-device-helper";

const device = (kind: MediaDeviceKind, label: string): MediaDeviceInfo =>
  ({ kind, label, deviceId: label, groupId: "", toJSON: () => ({}) }) as MediaDeviceInfo;

describe("PreviewDeviceHelper", () => {
  const devices = [
    device("audioinput", "UGREEN camera 2K"),
    device("videoinput", "OBS Virtual Camera"),
    device("videoinput", "UGREEN camera 2K"),
  ];

  it("matches the USB product name to a video input, ignoring case", () => {
    expect(PreviewDeviceHelper.findVideoInput(devices, "ugreen CAMERA 2k")?.kind).toBe(
      "videoinput",
    );
  });

  it("returns undefined when no video input matches", () => {
    expect(PreviewDeviceHelper.findVideoInput(devices, "Logitech C920")).toBeUndefined();
  });
});
