import { create } from "zustand";
import { CameraApi } from "../api/camera-api";
import { CameraListHelper } from "../helpers/camera-list-helper";
import { ControlFormatHelper } from "../helpers/control-format-helper";
import { ControlStateHelper } from "../helpers/control-state-helper";
import { Messages } from "../i18n/messages";
import type { CameraInfo } from "../models/camera-info";
import type { ControlState } from "../models/control-state";
import { ControlWriteQueue } from "../services/control-write-queue";
import { DebouncedTask } from "../services/debounced-task";

type CameraStatus = "idle" | "loading" | "ready" | "empty";

interface CameraStore {
  cameras: CameraInfo[];
  selectedCameraId: string | null;
  controls: Record<string, ControlState>;
  status: CameraStatus;
  errorMessage: string | null;
  /** Bumped every time a camera is (re)opened, so the preview and presets follow along. */
  sessionId: number;
  loadCameras: () => Promise<void>;
  /** Debounced reaction to USB plug/unplug; reopens only when the camera list changed. */
  scheduleSync: () => void;
  selectCamera: (cameraId: string) => Promise<void>;
  changeControl: (controlId: string, value: number) => void;
  resetControls: () => Promise<void>;
  dismissError: () => void;
}

const writeQueue = new ControlWriteQueue(
  async (controlId, value) => {
    const affected = await CameraApi.setControl(controlId, value);
    useCameraStore.setState((state) => ({
      controls: {
        ...state.controls,
        ...Object.fromEntries(
          Object.entries(ControlStateHelper.byId(affected)).filter(
            // A newer value is already queued for this control: keep the optimistic one.
            ([controlId]) => !writeQueue.hasPending(controlId),
          ),
        ),
      },
    }));
  },
  async (error) => {
    useCameraStore.setState({
      errorMessage: ControlFormatHelper.errorText(Messages.writeFailed, error),
    });
    // The optimistic value never reached the device: show what it really holds.
    try {
      useCameraStore.setState({
        controls: ControlStateHelper.byId(await CameraApi.readControls()),
      });
    } catch {
      useCameraStore.setState({ status: "empty", controls: {} });
    }
  },
);

// USB enumeration settles a few hundred ms after the plug event.
const usbSync = new DebouncedTask(800);

export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: [],
  selectedCameraId: null,
  controls: {},
  status: "idle",
  errorMessage: null,
  sessionId: 0,

  loadCameras: async () => {
    set({ status: "loading" });
    try {
      const cameras = await CameraApi.listCameras();
      set({ cameras });
      const current = get().selectedCameraId;
      const next = cameras.find((camera) => camera.id === current) ?? cameras[0];
      if (!next) {
        set({ status: "empty", selectedCameraId: null, controls: {} });
        return;
      }
      await get().selectCamera(next.id);
    } catch (error) {
      set({
        status: "empty",
        errorMessage: ControlFormatHelper.errorText(Messages.listFailed, error),
      });
    }
  },

  scheduleSync: () =>
    usbSync.schedule(async () => {
      try {
        const cameras = await CameraApi.listCameras();
        if (get().status === "ready" && CameraListHelper.sameCameras(get().cameras, cameras)) {
          return;
        }
        await get().loadCameras();
      } catch (error) {
        set({ errorMessage: ControlFormatHelper.errorText(Messages.listFailed, error) });
      }
    }),

  selectCamera: async (cameraId) => {
    set({ selectedCameraId: cameraId, status: "loading", controls: {} });
    try {
      const controls = ControlStateHelper.byId(await CameraApi.openCamera(cameraId));
      set((state) => ({ controls, status: "ready", sessionId: state.sessionId + 1 }));
    } catch (error) {
      set({
        status: "empty",
        errorMessage: ControlFormatHelper.errorText(Messages.openFailed, error),
      });
    }
  },

  changeControl: (controlId, value) => {
    const control = get().controls[controlId];
    // Log sliders map several positions to one value: skip writes that change nothing.
    if (!control || control.value === value) {
      return;
    }
    set((state) => ({ controls: { ...state.controls, [controlId]: { ...control, value } } }));
    writeQueue.enqueue(controlId, value);
  },

  resetControls: async () => {
    try {
      set({ controls: ControlStateHelper.byId(await CameraApi.resetControls()) });
    } catch (error) {
      set({ errorMessage: ControlFormatHelper.errorText(Messages.resetFailed, error) });
    }
  },

  dismissError: () => set({ errorMessage: null }),
}));
