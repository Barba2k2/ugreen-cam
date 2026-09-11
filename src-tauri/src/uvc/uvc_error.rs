use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum UvcError {
    #[error("camera not found: {0}")]
    CameraNotFound(String),
    #[error("no camera open")]
    NoCameraOpen,
    #[error("device has no UVC VideoControl interface")]
    NotUvc,
    #[error("unknown control: {0}")]
    UnknownControl(String),
    #[error("control not supported by this camera: {0}")]
    UnsupportedControl(String),
    #[error("control is driven by an automatic mode: {0}")]
    ControlLocked(String),
    #[error("value {value} out of range for {id}")]
    OutOfRange { id: String, value: i64 },
    #[error("preset not found: {0}")]
    PresetNotFound(String),
    #[error("preset name is empty")]
    EmptyPresetName,
    #[error("could not save presets: {0}")]
    Storage(String),
    #[error("background task failed: {0}")]
    Worker(String),
    #[error("USB error: {0}")]
    Usb(#[from] rusb::Error),
}

impl Serialize for UvcError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}
