/// Entity id plus its bmControls support bitmap.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct UnitDescriptor {
    pub id: u8,
    pub bitmap: u32,
}

impl UnitDescriptor {
    pub fn supports(&self, bit: u8) -> bool {
        self.bitmap & (1 << bit) != 0
    }
}
