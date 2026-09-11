/// UVC entity that owns a control inside the VideoControl interface.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UnitKind {
    CameraTerminal,
    ProcessingUnit,
}
