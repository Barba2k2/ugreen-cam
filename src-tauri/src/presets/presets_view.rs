use serde::Serialize;

use super::preset::Preset;

/// Presets of the open camera model, sent to the frontend.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetsView {
    pub presets: Vec<Preset>,
    /// Preset applied automatically whenever this camera model is opened.
    pub startup_preset_id: Option<String>,
}
