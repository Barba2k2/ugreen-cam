/// Little-endian integer packing used by every UVC control payload.
pub struct ValueCodec;

impl ValueCodec {
    pub fn decode(bytes: &[u8], signed: bool) -> i64 {
        let raw = bytes.iter().enumerate().fold(0u64, |value, (index, byte)| {
            value | (*byte as u64) << (index * 8)
        });
        let bits = bytes.len() as u32 * 8;
        if signed && bits > 0 && bits < 64 && raw & (1 << (bits - 1)) != 0 {
            (raw | (u64::MAX << bits)) as i64
        } else {
            raw as i64
        }
    }

    pub fn encode_into(value: i64, target: &mut [u8]) {
        let bytes = value.to_le_bytes();
        target.copy_from_slice(&bytes[..target.len()]);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_unsigned_little_endian() {
        assert_eq!(ValueCodec::decode(&[0xf8, 0x11], false), 4600);
    }

    #[test]
    fn decodes_negative_signed_values() {
        assert_eq!(ValueCodec::decode(&[0xc0, 0xff], true), -64);
        assert_eq!(
            ValueCodec::decode(&[0x00, 0x00, 0xfd, 0xff], true),
            -196_608
        );
    }

    #[test]
    fn keeps_high_bit_when_unsigned() {
        assert_eq!(ValueCodec::decode(&[0xff], false), 255);
    }

    #[test]
    fn encodes_round_trip() {
        let mut buffer = [0u8; 2];
        ValueCodec::encode_into(-64, &mut buffer);

        assert_eq!(buffer, [0xc0, 0xff]);
        assert_eq!(ValueCodec::decode(&buffer, true), -64);
    }
}
