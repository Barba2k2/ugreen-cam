use super::control_spec::ControlSpec;
use super::unit_descriptor::UnitDescriptor;
use super::unit_kind::UnitKind;

/// Units discovered in the VideoControl interface descriptors.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UvcTopology {
    pub interface_number: u8,
    pub camera_terminal: Option<UnitDescriptor>,
    pub processing_unit: Option<UnitDescriptor>,
}

impl UvcTopology {
    /// Unit id to address when the device advertises the control, `None` otherwise.
    pub fn unit_for(&self, spec: &ControlSpec) -> Option<u8> {
        let unit = match spec.unit {
            UnitKind::CameraTerminal => self.camera_terminal,
            UnitKind::ProcessingUnit => self.processing_unit,
        }?;
        unit.supports(spec.bitmap_bit).then_some(unit.id)
    }
}
