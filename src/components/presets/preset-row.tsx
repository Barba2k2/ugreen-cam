import { ButtonDs } from "../../design-system/button-ds";
import { IconButtonDs } from "../../design-system/icon-button-ds";
import { ListRowDs } from "../../design-system/list-row-ds";
import { Messages } from "../../i18n/messages";
import type { Preset } from "../../models/preset";
import { usePresetStore } from "../../stores/preset-store";

interface PresetRowProps {
  preset: Preset;
}

export function PresetRow({ preset }: PresetRowProps) {
  const isStartup = usePresetStore((state) => state.startupPresetId === preset.id);
  const busy = usePresetStore((state) => state.busy);
  const applyPreset = usePresetStore((state) => state.applyPreset);
  const deletePreset = usePresetStore((state) => state.deletePreset);
  const toggleStartup = usePresetStore((state) => state.toggleStartup);

  return (
    <ListRowDs label={preset.name} caption={isStartup ? Messages.startupPresetCaption : undefined}>
      <IconButtonDs
        icon={isStartup ? "★" : "☆"}
        ariaLabel={Messages.startupPresetToggle}
        pressed={isStartup}
        disabled={busy}
        onClick={() => void toggleStartup(preset.id)}
      />
      <ButtonDs
        label={Messages.applyPreset}
        variant="ghost"
        disabled={busy}
        onClick={() => void applyPreset(preset.id)}
      />
      <IconButtonDs
        icon="✕"
        ariaLabel={Messages.deletePreset}
        disabled={busy}
        onClick={() => void deletePreset(preset.id)}
      />
    </ListRowDs>
  );
}
