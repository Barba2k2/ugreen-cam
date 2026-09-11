use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use super::preset::Preset;
use super::presets_view::PresetsView;
use crate::uvc::uvc_error::UvcError;

/// Every saved preset plus the startup choice per camera model. Persisted as JSON.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetLibrary {
    pub presets: Vec<Preset>,
    /// camera model -> preset id
    pub startup: BTreeMap<String, String>,
}

impl PresetLibrary {
    pub fn view(&self, model: &str) -> PresetsView {
        PresetsView {
            presets: self
                .presets
                .iter()
                .filter(|preset| preset.camera_model == model)
                .cloned()
                .collect(),
            startup_preset_id: self.startup.get(model).cloned(),
        }
    }

    pub fn find(&self, model: &str, id: &str) -> Result<&Preset, UvcError> {
        self.presets
            .iter()
            .find(|preset| preset.camera_model == model && preset.id == id)
            .ok_or_else(|| UvcError::PresetNotFound(id.to_string()))
    }

    pub fn startup_preset(&self, model: &str) -> Option<&Preset> {
        let id = self.startup.get(model)?;
        self.find(model, id).ok()
    }

    /// Saving under an existing name (case-insensitive) replaces that preset's values.
    pub fn save(
        &mut self,
        model: &str,
        name: &str,
        values: BTreeMap<String, i64>,
        new_id: String,
    ) -> Result<(), UvcError> {
        let name = name.trim();
        if name.is_empty() {
            return Err(UvcError::EmptyPresetName);
        }
        let existing = self
            .presets
            .iter_mut()
            .find(|preset| preset.camera_model == model && preset.name.eq_ignore_ascii_case(name));
        match existing {
            Some(preset) => {
                preset.name = name.to_string();
                preset.values = values;
            }
            None => self.presets.push(Preset {
                id: new_id,
                name: name.to_string(),
                camera_model: model.to_string(),
                values,
            }),
        }
        Ok(())
    }

    pub fn remove(&mut self, model: &str, id: &str) -> Result<(), UvcError> {
        self.find(model, id)?;
        self.presets
            .retain(|preset| !(preset.camera_model == model && preset.id == id));
        if self.startup.get(model).is_some_and(|startup| startup == id) {
            self.startup.remove(model);
        }
        Ok(())
    }

    pub fn set_startup(&mut self, model: &str, id: Option<&str>) -> Result<(), UvcError> {
        match id {
            Some(id) => {
                self.find(model, id)?;
                self.startup.insert(model.to_string(), id.to_string());
            }
            None => {
                self.startup.remove(model);
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn values(brightness: i64) -> BTreeMap<String, i64> {
        BTreeMap::from([("brightness".to_string(), brightness)])
    }

    #[test]
    fn saving_an_existing_name_overwrites_it() {
        let mut library = PresetLibrary::default();
        library
            .save("1bcf:2284", "Reunião", values(100), "a".into())
            .unwrap();
        library
            .save("1bcf:2284", "  reunião ", values(140), "b".into())
            .unwrap();

        let view = library.view("1bcf:2284");
        assert_eq!(view.presets.len(), 1);
        assert_eq!(view.presets[0].id, "a");
        assert_eq!(view.presets[0].values, values(140));
    }

    #[test]
    fn rejects_blank_names() {
        let mut library = PresetLibrary::default();

        let result = library.save("1bcf:2284", "   ", values(1), "a".into());

        assert!(matches!(result, Err(UvcError::EmptyPresetName)));
    }

    #[test]
    fn scopes_presets_by_camera_model() {
        let mut library = PresetLibrary::default();
        library
            .save("1bcf:2284", "Dia", values(1), "a".into())
            .unwrap();
        library
            .save("046d:085e", "Dia", values(2), "b".into())
            .unwrap();

        assert_eq!(library.view("1bcf:2284").presets[0].id, "a");
        assert!(library.find("1bcf:2284", "b").is_err());
    }

    #[test]
    fn removing_the_startup_preset_clears_the_startup_choice() {
        let mut library = PresetLibrary::default();
        library
            .save("1bcf:2284", "Noite", values(1), "a".into())
            .unwrap();
        library.set_startup("1bcf:2284", Some("a")).unwrap();
        assert_eq!(library.startup_preset("1bcf:2284").unwrap().name, "Noite");

        library.remove("1bcf:2284", "a").unwrap();

        assert_eq!(library.view("1bcf:2284").startup_preset_id, None);
    }

    #[test]
    fn startup_must_point_to_an_existing_preset() {
        let mut library = PresetLibrary::default();

        assert!(library.set_startup("1bcf:2284", Some("missing")).is_err());
    }
}
