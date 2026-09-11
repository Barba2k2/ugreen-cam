import { ButtonDs } from "../../design-system/button-ds";
import { SelectDs } from "../../design-system/select-ds";
import { SwitchDs } from "../../design-system/switch-ds";
import { ToggleRowDs } from "../../design-system/toggle-row-ds";
import { Messages } from "../../i18n/messages";
import { useCameraStore } from "../../stores/camera-store";
import { usePreviewStore } from "../../stores/preview-store";

export function CameraToolbar() {
  const cameras = useCameraStore((state) => state.cameras);
  const selectedCameraId = useCameraStore((state) => state.selectedCameraId);
  const status = useCameraStore((state) => state.status);
  const loadCameras = useCameraStore((state) => state.loadCameras);
  const selectCamera = useCameraStore((state) => state.selectCamera);
  const mirrored = usePreviewStore((state) => state.mirrored);
  const setMirrored = usePreviewStore((state) => state.setMirrored);

  return (
    <div className="camera-toolbar">
      <div className="camera-toolbar__picker">
        <SelectDs
          options={cameras.map((camera) => ({ value: camera.id, label: camera.name }))}
          value={selectedCameraId ?? ""}
          disabled={cameras.length === 0 || status === "loading"}
          ariaLabel={Messages.cameraPickerLabel}
          onChange={(cameraId) => void selectCamera(cameraId)}
        />
        <ButtonDs
          label={Messages.refreshCameras}
          variant="ghost"
          disabled={status === "loading"}
          onClick={() => void loadCameras()}
        />
      </div>
      <ToggleRowDs label={Messages.mirrorPreview} disabled={false}>
        <SwitchDs
          checked={mirrored}
          disabled={false}
          ariaLabel={Messages.mirrorPreview}
          onChange={setMirrored}
        />
      </ToggleRowDs>
    </div>
  );
}
