import { create } from "zustand";
import { PreviewDeviceHelper } from "../helpers/preview-device-helper";

type PreviewStatus = "idle" | "starting" | "live" | "notFound" | "denied";

interface PreviewStore {
  stream: MediaStream | null;
  status: PreviewStatus;
  mirrored: boolean;
  /** Raw WebKit error, shown next to the friendly message to make failures diagnosable. */
  errorDetail: string | null;
  /** Bumped on every start/stop so a slow getUserMedia from an old request is discarded. */
  requestId: number;
  startPreview: (cameraName: string) => Promise<void>;
  stopPreview: () => void;
  setMirrored: (mirrored: boolean) => void;
}

export const usePreviewStore = create<PreviewStore>((set, get) => ({
  stream: null,
  status: "idle",
  mirrored: true,
  errorDetail: null,
  requestId: 0,

  startPreview: async (cameraName) => {
    PreviewDeviceHelper.stop(get().stream);
    const requestId = get().requestId + 1;
    set({ stream: null, status: "starting", errorDetail: null, requestId });
    const isStale = () => get().requestId !== requestId;
    try {
      let devices = await navigator.mediaDevices.enumerateDevices();
      // Labels stay empty until the user grants camera access once.
      if (devices.every((device) => device.label === "")) {
        PreviewDeviceHelper.stop(await navigator.mediaDevices.getUserMedia({ video: true }));
        devices = await navigator.mediaDevices.enumerateDevices();
      }
      const device = PreviewDeviceHelper.findVideoInput(devices, cameraName);
      if (!device) {
        if (!isStale()) {
          set({ status: "notFound" });
        }
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: device.deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (isStale()) {
        PreviewDeviceHelper.stop(stream);
        return;
      }
      set({ stream, status: "live" });
    } catch (error) {
      if (!isStale()) {
        set({
          status: "denied",
          errorDetail: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
        });
      }
    }
  },

  stopPreview: () => {
    PreviewDeviceHelper.stop(get().stream);
    set((state) => ({ stream: null, status: "idle", requestId: state.requestId + 1 }));
  },

  setMirrored: (mirrored) => set({ mirrored }),
}));
