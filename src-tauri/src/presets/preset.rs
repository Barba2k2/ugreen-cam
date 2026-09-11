use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// Named set of control values for one camera model.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: String,
    pub name: String,
    /// `vid:pid` of the camera the values were captured from.
    pub camera_model: String,
    pub values: BTreeMap<String, i64>,
}
