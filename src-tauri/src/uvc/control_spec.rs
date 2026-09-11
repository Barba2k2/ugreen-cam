use super::control_type::ControlType;
use super::unit_kind::UnitKind;

/// Static description of one UVC control (UVC 1.5, sections 4.2.2.1 and 4.2.2.3).
#[derive(Debug)]
pub struct ControlSpec {
    pub id: &'static str,
    pub unit: UnitKind,
    pub selector: u8,
    /// Bit in the unit's bmControls bitmap that advertises support.
    pub bitmap_bit: u8,
    /// Full wLength of the control payload.
    pub payload_size: u8,
    /// Byte offset of this value inside the payload (pan/tilt share one payload).
    pub value_offset: u8,
    pub value_size: u8,
    pub signed: bool,
    pub control_type: ControlType,
    /// Control that, while in an automatic value, makes this one read-only.
    pub auto_control: Option<&'static str>,
    /// Values of this control that mean "automatic" for its dependents.
    pub automatic_values: &'static [i64],
    /// Menu whose options come from the GET_RES bitmap (auto-exposure mode).
    pub options_from_resolution: bool,
}

impl ControlSpec {
    pub fn is_automatic(&self, value: i64) -> bool {
        self.automatic_values.contains(&value)
    }

    pub fn shares_payload(&self) -> bool {
        self.payload_size > self.value_size
    }
}
