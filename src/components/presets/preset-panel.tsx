import { useEffect } from "react";
import { ButtonDs } from "../../design-system/button-ds";
import { SectionDs } from "../../design-system/section-ds";
import { TextFieldDs } from "../../design-system/text-field-ds";
import { Messages } from "../../i18n/messages";
import { useCameraStore } from "../../stores/camera-store";
import { usePresetStore } from "../../stores/preset-store";
import { PresetRow } from "./preset-row";

export function PresetPanel() {
  const sessionId = useCameraStore((state) => state.sessionId);
  const presets = usePresetStore((state) => state.presets);
  const draftName = usePresetStore((state) => state.draftName);
  const busy = usePresetStore((state) => state.busy);
  const loadPresets = usePresetStore((state) => state.loadPresets);
  const setDraftName = usePresetStore((state) => state.setDraftName);
  const savePreset = usePresetStore((state) => state.savePreset);
  const canSave = !busy && draftName.trim() !== "";

  useEffect(() => {
    if (sessionId > 0) {
      void loadPresets();
    }
  }, [sessionId, loadPresets]);

  return (
    <SectionDs title={Messages.presetsTitle}>
      <div className="preset-panel__form">
        <TextFieldDs
          value={draftName}
          placeholder={Messages.presetNamePlaceholder}
          ariaLabel={Messages.presetNamePlaceholder}
          disabled={busy}
          onChange={setDraftName}
          onSubmit={() => canSave && void savePreset()}
        />
        <ButtonDs
          label={Messages.savePreset}
          variant="primary"
          disabled={!canSave}
          onClick={() => void savePreset()}
        />
      </div>
      {presets.length === 0 ? (
        <p className="control-panel__hint">{Messages.noPresets}</p>
      ) : (
        <div className="preset-panel__list">
          {presets.map((preset) => (
            <PresetRow key={preset.id} preset={preset} />
          ))}
        </div>
      )}
    </SectionDs>
  );
}
