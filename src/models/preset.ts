export interface Preset {
  id: string;
  name: string;
  cameraModel: string;
  values: Record<string, number>;
}

export interface PresetsView {
  presets: Preset[];
  startupPresetId: string | null;
}
