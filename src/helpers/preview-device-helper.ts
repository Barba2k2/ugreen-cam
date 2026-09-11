export class PreviewDeviceHelper {
  private constructor() {}

  /** Matches the USB product name against the WebView's video input labels. */
  static findVideoInput(
    devices: MediaDeviceInfo[],
    cameraName: string,
  ): MediaDeviceInfo | undefined {
    const wanted = cameraName.trim().toLowerCase();
    return devices
      .filter((device) => device.kind === "videoinput")
      .find((device) => {
        const label = device.label.toLowerCase();
        return label.includes(wanted) || wanted.includes(label);
      });
  }

  static stop(stream: MediaStream | null): void {
    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }
  }
}
