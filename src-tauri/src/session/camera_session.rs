use std::sync::{Arc, Mutex};

use crate::uvc::uvc_camera::UvcCamera;
use crate::uvc::uvc_error::UvcError;

/// Camera currently open by the app, shared across Tauri commands.
#[derive(Default, Clone)]
pub struct CameraSession {
    camera: Arc<Mutex<Option<UvcCamera>>>,
}

impl CameraSession {
    pub fn replace(&self, camera: UvcCamera) {
        *self
            .camera
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner()) = Some(camera);
    }

    pub fn with_camera<T>(
        &self,
        action: impl FnOnce(&UvcCamera) -> Result<T, UvcError>,
    ) -> Result<T, UvcError> {
        let guard = self
            .camera
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        action(guard.as_ref().ok_or(UvcError::NoCameraOpen)?)
    }
}
