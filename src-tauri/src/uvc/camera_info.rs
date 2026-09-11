use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CameraInfo {
    /// `bus-address`, stable while the camera stays plugged in.
    pub id: String,
    pub name: String,
    pub vendor_id: u16,
    pub product_id: u16,
}
