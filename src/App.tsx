import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { TauriEvents } from "./api/tauri-events";
import { CameraPreview } from "./components/camera/camera-preview";
import { CameraToolbar } from "./components/camera/camera-toolbar";
import { ControlPanel } from "./components/camera/control-panel";
import { NoticeDs } from "./design-system/notice-ds";
import { Messages } from "./i18n/messages";
import { useCameraStore } from "./stores/camera-store";

export default function App() {
  const loadCameras = useCameraStore((state) => state.loadCameras);
  const errorMessage = useCameraStore((state) => state.errorMessage);
  const dismissError = useCameraStore((state) => state.dismissError);
  const scheduleSync = useCameraStore((state) => state.scheduleSync);

  useEffect(() => {
    void loadCameras();
  }, [loadCameras]);

  useEffect(() => {
    const unlisten = listen(TauriEvents.usbDevicesChanged, scheduleSync);
    return () => void unlisten.then((stop) => stop());
  }, [scheduleSync]);

  return (
    <div className="app">
      <main className="app__stage">
        <CameraToolbar />
        <CameraPreview />
        {errorMessage && (
          <NoticeDs
            message={errorMessage}
            dismissLabel={Messages.dismiss}
            onDismiss={dismissError}
          />
        )}
      </main>
      <ControlPanel />
    </div>
  );
}
