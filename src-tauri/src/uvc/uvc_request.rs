/// bRequest codes for class-specific UVC requests (UVC 1.5, table A-8).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum UvcRequest {
    SetCur = 0x01,
    GetCur = 0x81,
    GetMin = 0x82,
    GetMax = 0x83,
    GetRes = 0x84,
    GetInfo = 0x86,
    GetDef = 0x87,
}
