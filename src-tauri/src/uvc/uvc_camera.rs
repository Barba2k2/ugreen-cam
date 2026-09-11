use std::collections::BTreeMap;
use std::time::Duration;

use rusb::{DeviceHandle, GlobalContext};

use super::control_catalog::ControlCatalog;
use super::control_spec::ControlSpec;
use super::control_state::ControlState;
use super::control_type::ControlType;
use super::uvc_error::UvcError;
use super::uvc_request::UvcRequest;
use super::uvc_topology::UvcTopology;
use super::value_codec::ValueCodec;

/// Open UVC device; talks to its VideoControl interface over the default control pipe.
pub struct UvcCamera {
    handle: DeviceHandle<GlobalContext>,
    topology: UvcTopology,
    /// `vid:pid`, the key presets are stored under (bus address changes on replug).
    model: String,
}

impl UvcCamera {
    pub fn new(handle: DeviceHandle<GlobalContext>, topology: UvcTopology, model: String) -> Self {
        Self {
            handle,
            topology,
            model,
        }
    }

    pub fn model(&self) -> &str {
        &self.model
    }

    /// Current value of every writable control, as stored in a preset.
    pub fn snapshot(&self) -> BTreeMap<String, i64> {
        self.read_all()
            .into_iter()
            .filter(|state| state.writable)
            .map(|state| (state.id.to_string(), state.value))
            .collect()
    }

    /// Writes automatic modes first so the controls they lock are free (or skipped) afterwards.
    /// Controls this camera lacks, or that stay locked by an automatic mode, are skipped.
    pub fn apply_values(&self, values: &BTreeMap<String, i64>) -> Vec<ControlState> {
        for (spec, value) in ControlCatalog::apply_order(values) {
            if self.topology.unit_for(spec).is_none() {
                continue;
            }
            match self.write(spec, value) {
                Ok(()) | Err(UvcError::ControlLocked(_)) => {}
                Err(error) => eprintln!("apply {} = {value} failed: {error}", spec.id),
            }
        }
        self.read_all()
    }

    /// Every advertised control that answers GET_CUR; broken ones are skipped.
    pub fn read_all(&self) -> Vec<ControlState> {
        let mut states: Vec<ControlState> = ControlCatalog::all()
            .iter()
            .filter_map(|spec| self.read_state(spec).ok())
            .collect();
        self.apply_locks(&mut states);
        states
    }

    /// The control itself plus the controls its automatic mode locks.
    pub fn read_affected(&self, spec: &'static ControlSpec) -> Result<Vec<ControlState>, UvcError> {
        let mut states = vec![self.read_state(spec)?];
        states.extend(
            ControlCatalog::dependents_of(spec.id)
                .filter_map(|dependent| self.read_state(dependent).ok()),
        );
        self.apply_locks(&mut states);
        Ok(states)
    }

    pub fn write(&self, spec: &'static ControlSpec, value: i64) -> Result<(), UvcError> {
        let state = self.read_state(spec)?;
        let mut states = vec![state];
        self.apply_locks(&mut states);
        let state = &states[0];
        if state.value == value {
            return Ok(());
        }
        if state.locked {
            return Err(UvcError::ControlLocked(spec.id.to_string()));
        }
        let in_range = match state.control_type {
            ControlType::Menu => state.options.contains(&value),
            _ => (state.min..=state.max).contains(&value),
        };
        if !in_range {
            return Err(UvcError::OutOfRange {
                id: spec.id.to_string(),
                value,
            });
        }
        let unit = self.unit_for(spec)?;
        let mut payload = if spec.shares_payload() {
            self.request(UvcRequest::GetCur, spec, unit, spec.payload_size)?
        } else {
            vec![0; spec.payload_size as usize]
        };
        let start = spec.value_offset as usize;
        ValueCodec::encode_into(value, &mut payload[start..start + spec.value_size as usize]);
        self.handle.write_control(
            0x21,
            UvcRequest::SetCur as u8,
            (spec.selector as u16) << 8,
            self.index(unit),
            &payload,
            Duration::from_millis(500),
        )?;
        Ok(())
    }

    pub fn reset_all(&self) -> Vec<ControlState> {
        let defaults = self
            .read_all()
            .into_iter()
            .filter_map(|state| Some((state.id.to_string(), state.default_value?)))
            .collect();
        self.apply_values(&defaults)
    }

    fn read_state(&self, spec: &'static ControlSpec) -> Result<ControlState, UvcError> {
        let unit = self.unit_for(spec)?;
        // GET_INFO: bit 1 = SET supported, bit 2 = disabled by an automatic mode.
        let info = self
            .request(UvcRequest::GetInfo, spec, unit, 1)
            .map(|bytes| bytes[0])
            .unwrap_or(0x03);
        let value = self.read_value(UvcRequest::GetCur, spec, unit)?;
        let default_value = self.read_value(UvcRequest::GetDef, spec, unit).ok();
        let (min, max, step, options) = match spec.control_type {
            ControlType::Range => (
                self.read_value(UvcRequest::GetMin, spec, unit)?,
                self.read_value(UvcRequest::GetMax, spec, unit)?,
                self.read_value(UvcRequest::GetRes, spec, unit)
                    .unwrap_or(1)
                    .max(1),
                Vec::new(),
            ),
            ControlType::Toggle => (0, 1, 1, Vec::new()),
            ControlType::Menu => {
                let options = self.menu_options(spec, unit);
                let min = options.first().copied().unwrap_or(value);
                let max = options.last().copied().unwrap_or(value);
                (min, max, 1, options)
            }
        };
        Ok(ControlState {
            id: spec.id,
            control_type: spec.control_type,
            value,
            min,
            max,
            step,
            default_value,
            options,
            writable: info & 0x02 != 0,
            locked: info & 0x04 != 0,
        })
    }

    fn menu_options(&self, spec: &ControlSpec, unit: u8) -> Vec<i64> {
        if spec.options_from_resolution {
            let bitmap = self.read_value(UvcRequest::GetRes, spec, unit).unwrap_or(0);
            return (0..8)
                .map(|bit| 1 << bit)
                .filter(|mode| bitmap & mode != 0)
                .collect();
        }
        // UVC 1.1 devices often stall GET_MIN/GET_MAX on menus: fall back to 0..=2.
        let min = self.read_value(UvcRequest::GetMin, spec, unit).unwrap_or(0);
        let max = self.read_value(UvcRequest::GetMax, spec, unit).unwrap_or(2);
        (min..=max).collect()
    }

    fn apply_locks(&self, states: &mut [ControlState]) {
        let parents: Vec<Option<i64>> = states
            .iter()
            .map(|state| {
                let parent = ControlCatalog::find(state.id)?.auto_control?;
                states
                    .iter()
                    .find(|candidate| candidate.id == parent)
                    .map(|candidate| candidate.value)
                    .or_else(|| {
                        let spec = ControlCatalog::find(parent)?;
                        let unit = self.topology.unit_for(spec)?;
                        self.read_value(UvcRequest::GetCur, spec, unit).ok()
                    })
            })
            .collect();
        for (state, parent_value) in states.iter_mut().zip(parents) {
            let parent_spec = ControlCatalog::find(state.id)
                .and_then(|spec| spec.auto_control)
                .and_then(ControlCatalog::find);
            if let (Some(parent_spec), Some(parent_value)) = (parent_spec, parent_value) {
                state.locked |= parent_spec.is_automatic(parent_value);
            }
        }
    }

    fn read_value(
        &self,
        request: UvcRequest,
        spec: &ControlSpec,
        unit: u8,
    ) -> Result<i64, UvcError> {
        let payload = self.request(request, spec, unit, spec.payload_size)?;
        let start = spec.value_offset as usize;
        Ok(ValueCodec::decode(
            &payload[start..start + spec.value_size as usize],
            spec.signed,
        ))
    }

    fn request(
        &self,
        request: UvcRequest,
        spec: &ControlSpec,
        unit: u8,
        length: u8,
    ) -> Result<Vec<u8>, UvcError> {
        let mut buffer = vec![0; length as usize];
        let read = self.handle.read_control(
            0xa1,
            request as u8,
            (spec.selector as u16) << 8,
            self.index(unit),
            &mut buffer,
            Duration::from_millis(500),
        )?;
        if read < buffer.len() {
            return Err(UvcError::Usb(rusb::Error::Io));
        }
        Ok(buffer)
    }

    fn unit_for(&self, spec: &ControlSpec) -> Result<u8, UvcError> {
        self.topology
            .unit_for(spec)
            .ok_or_else(|| UvcError::UnsupportedControl(spec.id.to_string()))
    }

    fn index(&self, unit: u8) -> u16 {
        (unit as u16) << 8 | self.topology.interface_number as u16
    }
}
