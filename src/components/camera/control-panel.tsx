import { ControlGroups } from "../../config/control-groups";
import { ButtonDs } from "../../design-system/button-ds";
import { SectionDs } from "../../design-system/section-ds";
import { Messages } from "../../i18n/messages";
import { useCameraStore } from "../../stores/camera-store";
import { PresetPanel } from "../presets/preset-panel";
import { ControlField } from "./control-field";

export function ControlPanel() {
  const controls = useCameraStore((state) => state.controls);
  const status = useCameraStore((state) => state.status);
  const resetControls = useCameraStore((state) => state.resetControls);

  return (
    <aside className="control-panel">
      <header className="control-panel__header">
        <h1 className="control-panel__title">{Messages.controlsTitle}</h1>
        <ButtonDs
          label={Messages.resetAll}
          variant="ghost"
          disabled={status !== "ready"}
          onClick={() => void resetControls()}
        />
      </header>
      <div className="control-panel__scroll">
        {status === "loading" && <p className="control-panel__hint">{Messages.loadingControls}</p>}
        {status === "empty" && <p className="control-panel__hint">{Messages.noCameras}</p>}
        {status === "ready" && <PresetPanel />}
        {status === "ready" &&
          ControlGroups.all.map((group) => {
            const present = group.controlIds.flatMap((id) => controls[id] ?? []);
            return (
              present.length > 0 && (
                <SectionDs key={group.id} title={Messages.groupTitles[group.id]}>
                  {present.map((control) => (
                    <ControlField key={control.id} control={control} />
                  ))}
                </SectionDs>
              )
            );
          })}
      </div>
    </aside>
  );
}
