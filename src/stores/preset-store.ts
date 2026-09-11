import { create } from "zustand";
import { PresetApi } from "../api/preset-api";
import { ControlFormatHelper } from "../helpers/control-format-helper";
import { ControlStateHelper } from "../helpers/control-state-helper";
import { Messages } from "../i18n/messages";
import type { Preset, PresetsView } from "../models/preset";
import { useCameraStore } from "./camera-store";

interface PresetStore {
  presets: Preset[];
  startupPresetId: string | null;
  draftName: string;
  busy: boolean;
  loadPresets: () => Promise<void>;
  setDraftName: (draftName: string) => void;
  savePreset: () => Promise<void>;
  applyPreset: (presetId: string) => Promise<void>;
  deletePreset: (presetId: string) => Promise<void>;
  toggleStartup: (presetId: string) => Promise<void>;
}

export const usePresetStore = create<PresetStore>((set, get) => {
  const fromView = (view: PresetsView) => ({
    presets: view.presets,
    startupPresetId: view.startupPresetId,
  });

  /** Runs one preset call; failures land in the app's error banner. */
  const guarded = async (action: () => Promise<void>) => {
    set({ busy: true });
    try {
      await action();
    } catch (error) {
      useCameraStore.setState({
        errorMessage: ControlFormatHelper.errorText(Messages.presetsFailed, error),
      });
    } finally {
      set({ busy: false });
    }
  };

  return {
    presets: [],
    startupPresetId: null,
    draftName: "",
    busy: false,

    loadPresets: () => guarded(async () => set(fromView(await PresetApi.listPresets()))),

    setDraftName: (draftName) => set({ draftName }),

    savePreset: () =>
      guarded(async () => {
        set({ ...fromView(await PresetApi.savePreset(get().draftName)), draftName: "" });
      }),

    applyPreset: (presetId) =>
      guarded(async () => {
        const controls = await PresetApi.applyPreset(presetId);
        useCameraStore.setState({ controls: ControlStateHelper.byId(controls) });
      }),

    deletePreset: (presetId) =>
      guarded(async () => set(fromView(await PresetApi.deletePreset(presetId)))),

    toggleStartup: (presetId) =>
      guarded(async () => {
        const next = get().startupPresetId === presetId ? null : presetId;
        set(fromView(await PresetApi.setStartupPreset(next)));
      }),
  };
});
