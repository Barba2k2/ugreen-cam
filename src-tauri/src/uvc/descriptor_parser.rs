use super::unit_descriptor::UnitDescriptor;
use super::uvc_topology::UvcTopology;

pub struct DescriptorParser;

impl DescriptorParser {
    /// Walks the class-specific VideoControl descriptors (UVC 1.5, section 3.7.2).
    pub fn parse(interface_number: u8, extra: &[u8]) -> UvcTopology {
        let mut topology = UvcTopology {
            interface_number,
            camera_terminal: None,
            processing_unit: None,
        };
        let mut cursor = 0;
        while cursor + 3 <= extra.len() {
            let length = extra[cursor] as usize;
            if length < 3 || cursor + length > extra.len() {
                break;
            }
            let descriptor = &extra[cursor..cursor + length];
            // 0x24 = CS_INTERFACE
            if descriptor[1] == 0x24 {
                match descriptor[2] {
                    0x02 => Self::read_input_terminal(descriptor, &mut topology),
                    0x05 => Self::read_processing_unit(descriptor, &mut topology),
                    _ => {}
                }
            }
            cursor += length;
        }
        topology
    }

    fn read_input_terminal(descriptor: &[u8], topology: &mut UvcTopology) {
        // wTerminalType 0x0201 = ITT_CAMERA; bControlSize at 14, bmControls from 15.
        if descriptor.len() < 15 || u16::from_le_bytes([descriptor[4], descriptor[5]]) != 0x0201 {
            return;
        }
        topology.camera_terminal = Some(UnitDescriptor {
            id: descriptor[3],
            bitmap: Self::bitmap(descriptor, 14),
        });
    }

    fn read_processing_unit(descriptor: &[u8], topology: &mut UvcTopology) {
        // bControlSize at 7, bmControls from 8.
        if descriptor.len() < 8 {
            return;
        }
        topology.processing_unit = Some(UnitDescriptor {
            id: descriptor[3],
            bitmap: Self::bitmap(descriptor, 7),
        });
    }

    fn bitmap(descriptor: &[u8], size_offset: usize) -> u32 {
        let size = descriptor[size_offset] as usize;
        descriptor
            .iter()
            .skip(size_offset + 1)
            .take(size.min(4))
            .enumerate()
            .fold(0, |bitmap, (index, byte)| {
                bitmap | (*byte as u32) << (index * 8)
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::uvc::control_catalog::ControlCatalog;

    // VideoControl descriptors captured from the UGREEN camera 2K (1bcf:2284).
    fn ugreen_2k() -> &'static [u8] {
        &[
            0x0d, 0x24, 0x01, 0x00, 0x01, 0x6d, 0x00, 0x00, 0x6c, 0xdc, 0x02, 0x01, 0x01, //
            0x12, 0x24, 0x02, 0x01, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x03, 0x2a, 0x7e, 0x02, //
            0x0b, 0x24, 0x05, 0x02, 0x01, 0x00, 0x40, 0x02, 0x7b, 0x17, 0x00, //
            0x09, 0x24, 0x03, 0x05, 0x01, 0x01, 0x00, 0x04, 0x00,
        ]
    }

    #[test]
    fn parses_camera_terminal_and_processing_unit() {
        let topology = DescriptorParser::parse(0, ugreen_2k());

        assert_eq!(
            topology.camera_terminal,
            Some(UnitDescriptor {
                id: 1,
                bitmap: 0x027e2a
            })
        );
        assert_eq!(
            topology.processing_unit,
            Some(UnitDescriptor {
                id: 2,
                bitmap: 0x177b
            })
        );
    }

    #[test]
    fn resolves_only_advertised_controls() {
        let topology = DescriptorParser::parse(0, ugreen_2k());
        let supported: Vec<&str> = ControlCatalog::all()
            .iter()
            .filter(|spec| topology.unit_for(spec).is_some())
            .map(|spec| spec.id)
            .collect();

        assert_eq!(
            supported,
            [
                "brightness",
                "contrast",
                "saturation",
                "sharpness",
                "gamma",
                "whiteBalanceAuto",
                "whiteBalanceTemperature",
                "backlightCompensation",
                "gain",
                "powerLineFrequency",
                "autoExposureMode",
                "exposureTime",
                "focusAuto",
                "focus",
                "zoom",
                "pan",
                "tilt",
                "roll",
            ]
        );
    }

    #[test]
    fn stops_on_truncated_descriptor() {
        let topology = DescriptorParser::parse(0, &[0x12, 0x24, 0x02, 0x01]);

        assert_eq!(topology.camera_terminal, None);
    }
}
