use tauri::State;

use super::blocking_task::BlockingTask;
use crate::presets::preset_store::PresetStore;
use crate::presets::presets_view::PresetsView;
use crate::session::camera_session::CameraSession;
use crate::uvc::control_state::ControlState;
use crate::uvc::uvc_error::UvcError;

#[tauri::command]
pub async fn list_presets(
    session: State<'_, CameraSession>,
    presets: State<'_, PresetStore>,
) -> Result<PresetsView, UvcError> {
    let session = session.inner().clone();
    let presets = presets.inner().clone();
    BlockingTask::run(move || {
        session.with_camera(|camera| Ok(presets.read(|library| library.view(camera.model()))))
    })
    .await
}

/// Captures the camera's current values under `name`.
#[tauri::command]
pub async fn save_preset(
    name: String,
    session: State<'_, CameraSession>,
    presets: State<'_, PresetStore>,
) -> Result<PresetsView, UvcError> {
    let session = session.inner().clone();
    let presets = presets.inner().clone();
    BlockingTask::run(move || {
        session.with_camera(|camera| {
            let values = camera.snapshot();
            presets.update(|library| {
                library.save(camera.model(), &name, values, PresetStore::new_id())?;
                Ok(library.view(camera.model()))
            })
        })
    })
    .await
}

#[tauri::command]
pub async fn apply_preset(
    preset_id: String,
    session: State<'_, CameraSession>,
    presets: State<'_, PresetStore>,
) -> Result<Vec<ControlState>, UvcError> {
    let session = session.inner().clone();
    let presets = presets.inner().clone();
    BlockingTask::run(move || {
        session.with_camera(|camera| {
            let values = presets.read(|library| {
                library
                    .find(camera.model(), &preset_id)
                    .map(|preset| preset.values.clone())
            })?;
            Ok(camera.apply_values(&values))
        })
    })
    .await
}

#[tauri::command]
pub async fn delete_preset(
    preset_id: String,
    session: State<'_, CameraSession>,
    presets: State<'_, PresetStore>,
) -> Result<PresetsView, UvcError> {
    let session = session.inner().clone();
    let presets = presets.inner().clone();
    BlockingTask::run(move || {
        session.with_camera(|camera| {
            presets.update(|library| {
                library.remove(camera.model(), &preset_id)?;
                Ok(library.view(camera.model()))
            })
        })
    })
    .await
}

/// `None` turns the startup preset off for this camera model.
#[tauri::command]
pub async fn set_startup_preset(
    preset_id: Option<String>,
    session: State<'_, CameraSession>,
    presets: State<'_, PresetStore>,
) -> Result<PresetsView, UvcError> {
    let session = session.inner().clone();
    let presets = presets.inner().clone();
    BlockingTask::run(move || {
        session.with_camera(|camera| {
            presets.update(|library| {
                library.set_startup(camera.model(), preset_id.as_deref())?;
                Ok(library.view(camera.model()))
            })
        })
    })
    .await
}
