use tauri::State;

use super::blocking_task::BlockingTask;
use crate::presets::preset_store::PresetStore;
use crate::session::camera_session::CameraSession;
use crate::uvc::camera_info::CameraInfo;
use crate::uvc::camera_registry::CameraRegistry;
use crate::uvc::control_catalog::ControlCatalog;
use crate::uvc::control_state::ControlState;
use crate::uvc::uvc_error::UvcError;

#[tauri::command]
pub async fn list_cameras() -> Result<Vec<CameraInfo>, UvcError> {
    BlockingTask::run(CameraRegistry::list).await
}

/// Opens the camera and applies its startup preset, if one is set for this model.
#[tauri::command]
pub async fn open_camera(
    camera_id: String,
    session: State<'_, CameraSession>,
    presets: State<'_, PresetStore>,
) -> Result<Vec<ControlState>, UvcError> {
    let session = session.inner().clone();
    let presets = presets.inner().clone();
    BlockingTask::run(move || {
        session.replace(CameraRegistry::open(&camera_id)?);
        session.with_camera(|camera| {
            let startup = presets.read(|library| {
                library
                    .startup_preset(camera.model())
                    .map(|preset| preset.values.clone())
            });
            Ok(match startup {
                Some(values) => camera.apply_values(&values),
                None => camera.read_all(),
            })
        })
    })
    .await
}

#[tauri::command]
pub async fn read_controls(
    session: State<'_, CameraSession>,
) -> Result<Vec<ControlState>, UvcError> {
    let session = session.inner().clone();
    BlockingTask::run(move || session.with_camera(|camera| Ok(camera.read_all()))).await
}

#[tauri::command]
pub async fn set_control(
    control_id: String,
    value: i64,
    session: State<'_, CameraSession>,
) -> Result<Vec<ControlState>, UvcError> {
    let session = session.inner().clone();
    BlockingTask::run(move || {
        let spec = ControlCatalog::find(&control_id).ok_or(UvcError::UnknownControl(control_id))?;
        session.with_camera(|camera| {
            camera.write(spec, value)?;
            camera.read_affected(spec)
        })
    })
    .await
}

#[tauri::command]
pub async fn reset_controls(
    session: State<'_, CameraSession>,
) -> Result<Vec<ControlState>, UvcError> {
    let session = session.inner().clone();
    BlockingTask::run(move || session.with_camera(|camera| Ok(camera.reset_all()))).await
}
