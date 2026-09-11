use std::collections::BTreeMap;

use super::control_spec::ControlSpec;
use super::control_type::ControlType;
use super::unit_kind::UnitKind;

pub struct ControlCatalog;

impl ControlCatalog {
    pub fn all() -> &'static [ControlSpec] {
        &catalog
    }

    pub fn find(id: &str) -> Option<&'static ControlSpec> {
        Self::all().iter().find(|spec| spec.id == id)
    }

    /// Known controls from `values`, automatic modes first, in catalog order otherwise.
    pub fn apply_order(values: &BTreeMap<String, i64>) -> Vec<(&'static ControlSpec, i64)> {
        let (automatic, manual): (Vec<&'static ControlSpec>, Vec<&'static ControlSpec>) =
            Self::all()
                .iter()
                .filter(|spec| values.contains_key(spec.id))
                .partition(|spec| !spec.automatic_values.is_empty());
        automatic
            .into_iter()
            .chain(manual)
            .map(|spec| (spec, values[spec.id]))
            .collect()
    }

    pub fn dependents_of(id: &str) -> impl Iterator<Item = &'static ControlSpec> + '_ {
        Self::all()
            .iter()
            .filter(move |spec| spec.auto_control == Some(id))
    }
}

const fn spec(
    id: &'static str,
    unit: UnitKind,
    selector: u8,
    bitmap_bit: u8,
    value_size: u8,
    signed: bool,
    control_type: ControlType,
) -> ControlSpec {
    ControlSpec {
        id,
        unit,
        selector,
        bitmap_bit,
        payload_size: value_size,
        value_offset: 0,
        value_size,
        signed,
        control_type,
        auto_control: None,
        automatic_values: &[],
        options_from_resolution: false,
    }
}

const fn bitmap_menu(base: ControlSpec) -> ControlSpec {
    ControlSpec {
        options_from_resolution: true,
        ..base
    }
}

const fn automatic(base: ControlSpec, values: &'static [i64]) -> ControlSpec {
    ControlSpec {
        automatic_values: values,
        ..base
    }
}

const fn locked_by(base: ControlSpec, auto_control: &'static str) -> ControlSpec {
    ControlSpec {
        auto_control: Some(auto_control),
        ..base
    }
}

const fn packed(base: ControlSpec, payload_size: u8, value_offset: u8) -> ControlSpec {
    ControlSpec {
        payload_size,
        value_offset,
        ..base
    }
}

use ControlType::{Menu, Range, Toggle};
use UnitKind::{CameraTerminal as Ct, ProcessingUnit as Pu};

// Auto-exposure mode bitmap: 1 manual, 2 auto, 4 shutter priority, 8 aperture priority.
// Exposure time is automatic in "auto" and "aperture priority".
#[allow(non_upper_case_globals)]
static catalog: [ControlSpec; 20] = [
    spec("brightness", Pu, 0x02, 0, 2, true, Range),
    spec("contrast", Pu, 0x03, 1, 2, false, Range),
    automatic(spec("hueAuto", Pu, 0x10, 11, 1, false, Toggle), &[1]),
    locked_by(spec("hue", Pu, 0x06, 2, 2, true, Range), "hueAuto"),
    spec("saturation", Pu, 0x07, 3, 2, false, Range),
    spec("sharpness", Pu, 0x08, 4, 2, false, Range),
    spec("gamma", Pu, 0x09, 5, 2, false, Range),
    automatic(
        spec("whiteBalanceAuto", Pu, 0x0b, 12, 1, false, Toggle),
        &[1],
    ),
    locked_by(
        spec("whiteBalanceTemperature", Pu, 0x0a, 6, 2, false, Range),
        "whiteBalanceAuto",
    ),
    spec("backlightCompensation", Pu, 0x01, 8, 2, false, Range),
    spec("gain", Pu, 0x04, 9, 2, false, Range),
    spec("powerLineFrequency", Pu, 0x05, 10, 1, false, Menu),
    automatic(
        bitmap_menu(spec("autoExposureMode", Ct, 0x02, 1, 1, false, Menu)),
        &[2, 8],
    ),
    locked_by(
        spec("exposureTime", Ct, 0x04, 3, 4, false, Range),
        "autoExposureMode",
    ),
    automatic(spec("focusAuto", Ct, 0x08, 17, 1, false, Toggle), &[1]),
    locked_by(spec("focus", Ct, 0x06, 5, 2, false, Range), "focusAuto"),
    spec("zoom", Ct, 0x0b, 9, 2, false, Range),
    packed(spec("pan", Ct, 0x0d, 11, 4, true, Range), 8, 0),
    packed(spec("tilt", Ct, 0x0d, 11, 4, true, Range), 8, 4),
    spec("roll", Ct, 0x0f, 13, 2, true, Range),
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn apply_order_puts_automatic_modes_before_the_controls_they_lock() {
        let values = BTreeMap::from([
            ("whiteBalanceTemperature".to_string(), 5000),
            ("brightness".to_string(), 120),
            ("whiteBalanceAuto".to_string(), 0),
            ("unknownControl".to_string(), 1),
        ]);

        let order: Vec<(&str, i64)> = ControlCatalog::apply_order(&values)
            .into_iter()
            .map(|(spec, value)| (spec.id, value))
            .collect();

        assert_eq!(
            order,
            [
                ("whiteBalanceAuto", 0),
                ("brightness", 120),
                ("whiteBalanceTemperature", 5000)
            ]
        );
    }
}
