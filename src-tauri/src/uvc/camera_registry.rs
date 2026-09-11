use rusb::{Device, GlobalContext};

use super::camera_info::CameraInfo;
use super::descriptor_parser::DescriptorParser;
use super::uvc_camera::UvcCamera;
use super::uvc_error::UvcError;
use super::uvc_topology::UvcTopology;

/// Finds UVC cameras on the USB bus.
pub struct CameraRegistry;

impl CameraRegistry {
    pub fn list() -> Result<Vec<CameraInfo>, UvcError> {
        Ok(rusb::devices()?
            .iter()
            .filter(|device| Self::topology(device).is_some())
            .filter_map(|device| Self::info(&device).ok())
            .collect())
    }

    pub fn open(id: &str) -> Result<UvcCamera, UvcError> {
        let device = rusb::devices()?
            .iter()
            .find(|device| Self::device_id(device) == id)
            .ok_or_else(|| UvcError::CameraNotFound(id.to_string()))?;
        let topology = Self::topology(&device).ok_or(UvcError::NotUvc)?;
        // macOS keeps the interface claimed by its UVC driver; control transfers
        // on endpoint 0 still go through without claiming it.
        let descriptor = device.device_descriptor()?;
        let model = format!(
            "{:04x}:{:04x}",
            descriptor.vendor_id(),
            descriptor.product_id()
        );
        Ok(UvcCamera::new(device.open()?, topology, model))
    }

    fn info(device: &Device<GlobalContext>) -> Result<CameraInfo, UvcError> {
        let descriptor = device.device_descriptor()?;
        let fallback = format!(
            "USB camera {:04x}:{:04x}",
            descriptor.vendor_id(),
            descriptor.product_id()
        );
        let name = device
            .open()
            .and_then(|handle| handle.read_product_string_ascii(&descriptor))
            .unwrap_or(fallback);
        Ok(CameraInfo {
            id: Self::device_id(device),
            name,
            vendor_id: descriptor.vendor_id(),
            product_id: descriptor.product_id(),
        })
    }

    /// VideoControl interface = class 0x0E (video), subclass 0x01.
    fn topology(device: &Device<GlobalContext>) -> Option<UvcTopology> {
        let config = device.active_config_descriptor().ok()?;
        config
            .interfaces()
            .flat_map(|interface| interface.descriptors())
            .find(|alternate| alternate.class_code() == 0x0e && alternate.sub_class_code() == 0x01)
            .map(|alternate| {
                DescriptorParser::parse(alternate.interface_number(), alternate.extra())
            })
    }

    fn device_id(device: &Device<GlobalContext>) -> String {
        format!("{}-{}", device.bus_number(), device.address())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::uvc::control_catalog::ControlCatalog;

    /// Hits the real device. Run with `UVC_TEST_CAMERA=1 cargo test`.
    #[test]
    fn writes_and_restores_brightness_on_real_camera() {
        if std::env::var("UVC_TEST_CAMERA").is_err() {
            eprintln!("skipped: UVC_TEST_CAMERA not set");
            return;
        }
        let info = CameraRegistry::list()
            .unwrap()
            .into_iter()
            .next()
            .expect("no UVC camera plugged in");
        let camera = CameraRegistry::open(&info.id).unwrap();
        let brightness = ControlCatalog::find("brightness").unwrap();
        let original = camera.read_affected(brightness).unwrap()[0].clone();
        let target = if original.value < original.max {
            original.value + original.step
        } else {
            original.min
        };

        camera.write(brightness, target).unwrap();
        let written = camera.read_affected(brightness).unwrap()[0].value;
        camera.write(brightness, original.value).unwrap();

        assert_eq!(written, target);
        assert_eq!(
            camera.read_affected(brightness).unwrap()[0].value,
            original.value
        );
        assert!(camera.read_all().len() > 1);
    }

    #[test]
    fn locks_white_balance_temperature_while_auto() {
        if std::env::var("UVC_TEST_CAMERA").is_err() {
            eprintln!("skipped: UVC_TEST_CAMERA not set");
            return;
        }
        let info = CameraRegistry::list()
            .unwrap()
            .into_iter()
            .next()
            .expect("no UVC camera plugged in");
        let camera = CameraRegistry::open(&info.id).unwrap();
        let auto = ControlCatalog::find("whiteBalanceAuto").unwrap();
        let original = camera.read_affected(auto).unwrap()[0].value;

        camera.write(auto, 1).unwrap();
        let states = camera.read_affected(auto).unwrap();
        camera.write(auto, original).unwrap();

        let temperature = states
            .iter()
            .find(|state| state.id == "whiteBalanceTemperature")
            .unwrap();
        assert!(temperature.locked);
    }

    #[test]
    fn applying_a_snapshot_restores_values_on_real_camera() {
        if std::env::var("UVC_TEST_CAMERA").is_err() {
            eprintln!("skipped: UVC_TEST_CAMERA not set");
            return;
        }
        let info = CameraRegistry::list()
            .unwrap()
            .into_iter()
            .next()
            .expect("no UVC camera plugged in");
        let camera = CameraRegistry::open(&info.id).unwrap();
        let snapshot = camera.snapshot();
        let contrast = ControlCatalog::find("contrast").unwrap();
        let original = snapshot["contrast"];
        let changed = if original > 0 {
            original - 1
        } else {
            original + 1
        };

        camera.write(contrast, changed).unwrap();
        let states = camera.apply_values(&snapshot);

        let restored = states.iter().find(|state| state.id == "contrast").unwrap();
        assert_eq!(restored.value, original);
        assert_eq!(camera.snapshot(), snapshot);
    }
}
