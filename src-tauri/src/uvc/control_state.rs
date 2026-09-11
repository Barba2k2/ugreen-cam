use serde::Serialize;

use super::control_type::ControlType;

/// Snapshot of one control as read from the device, sent to the frontend.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ControlState {
    pub id: &'static str,
    pub control_type: ControlType,
    pub value: i64,
    pub min: i64,
    pub max: i64,
    pub step: i64,
    pub default_value: Option<i64>,
    /// Allowed values for menu controls.
    pub options: Vec<i64>,
    pub writable: bool,
    /// Read-only right now because an automatic mode drives it.
    pub locked: bool,
}
