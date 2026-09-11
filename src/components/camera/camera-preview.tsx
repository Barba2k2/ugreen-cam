import { useEffect, useRef } from "react";
import { Messages } from "../../i18n/messages";
import { useCameraStore } from "../../stores/camera-store";
import { usePreviewStore } from "../../stores/preview-store";

export function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraName = useCameraStore(
    (state) => state.cameras.find((camera) => camera.id === state.selectedCameraId)?.name,
  );
  const sessionId = useCameraStore((state) => state.sessionId);
  const stream = usePreviewStore((state) => state.stream);
  const status = usePreviewStore((state) => state.status);
  const mirrored = usePreviewStore((state) => state.mirrored);
  const errorDetail = usePreviewStore((state) => state.errorDetail);
  const startPreview = usePreviewStore((state) => state.startPreview);
  const stopPreview = usePreviewStore((state) => state.stopPreview);

  // A reconnected camera keeps its name but gets a new session: restart the stream too.
  useEffect(() => {
    if (cameraName === undefined || sessionId === 0) {
      return;
    }
    void startPreview(cameraName);
    return stopPreview;
  }, [cameraName, sessionId, startPreview, stopPreview]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hint = {
    idle: null,
    live: null,
    starting: Messages.previewStarting,
    notFound: Messages.previewNotFound,
    denied: Messages.previewDenied,
  }[status];

  return (
    <div className="camera-preview">
      <video
        ref={videoRef}
        className="camera-preview__video"
        data-mirrored={mirrored}
        autoPlay
        playsInline
        muted
      />
      {hint && (
        <p className="camera-preview__hint">
          {hint}
          {errorDetail && <span className="camera-preview__detail">{errorDetail}</span>}
        </p>
      )}
    </div>
  );
}
