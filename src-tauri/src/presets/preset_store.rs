use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use super::preset_library::PresetLibrary;
use crate::uvc::uvc_error::UvcError;

/// Preset library backed by a JSON file in the app config directory.
#[derive(Clone)]
pub struct PresetStore {
    path: Arc<PathBuf>,
    library: Arc<Mutex<PresetLibrary>>,
}

impl PresetStore {
    /// A missing file starts an empty library; an unreadable one is kept aside, not overwritten.
    pub fn load(path: PathBuf) -> Self {
        let library = match fs::read_to_string(&path) {
            Ok(json) => serde_json::from_str(&json).unwrap_or_else(|error| {
                eprintln!("presets file unreadable ({error}), starting empty");
                let _ = fs::rename(&path, path.with_extension("json.broken"));
                PresetLibrary::default()
            }),
            Err(_) => PresetLibrary::default(),
        };
        Self {
            path: Arc::new(path),
            library: Arc::new(Mutex::new(library)),
        }
    }

    pub fn read<T>(&self, action: impl FnOnce(&PresetLibrary) -> T) -> T {
        action(
            &self
                .library
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner()),
        )
    }

    /// Changes a copy, writes it to disk, and only then makes it the current library.
    pub fn update<T>(
        &self,
        action: impl FnOnce(&mut PresetLibrary) -> Result<T, UvcError>,
    ) -> Result<T, UvcError> {
        let mut guard = self
            .library
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let mut next = guard.clone();
        let result = action(&mut next)?;
        self.persist(&next)?;
        *guard = next;
        Ok(result)
    }

    pub fn new_id() -> String {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|elapsed| elapsed.as_nanos())
            .unwrap_or_default();
        format!("{nanos:x}")
    }

    fn persist(&self, library: &PresetLibrary) -> Result<(), UvcError> {
        let storage = |error: std::io::Error| UvcError::Storage(error.to_string());
        if let Some(directory) = self.path.parent() {
            fs::create_dir_all(directory).map_err(storage)?;
        }
        let json = serde_json::to_string_pretty(library)
            .map_err(|error| UvcError::Storage(error.to_string()))?;
        let temporary = self.path.with_extension("json.tmp");
        fs::write(&temporary, json).map_err(storage)?;
        fs::rename(&temporary, self.path.as_ref()).map_err(storage)
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::*;

    fn temporary_path(name: &str) -> PathBuf {
        let directory = std::env::temp_dir().join(format!("ugreen-cam-{}", PresetStore::new_id()));
        directory.join(name)
    }

    #[test]
    fn persists_and_reloads_the_library() {
        let path = temporary_path("presets.json");
        let store = PresetStore::load(path.clone());
        store
            .update(|library| {
                library.save(
                    "1bcf:2284",
                    "Live",
                    BTreeMap::from([("gain".to_string(), 3)]),
                    "a".into(),
                )
            })
            .unwrap();

        let reloaded = PresetStore::load(path);

        assert_eq!(
            reloaded.read(|library| library.view("1bcf:2284").presets.len()),
            1
        );
    }

    #[test]
    fn failed_update_leaves_library_untouched() {
        let store = PresetStore::load(temporary_path("presets.json"));

        let result = store.update(|library| library.set_startup("1bcf:2284", Some("missing")));

        assert!(result.is_err());
        assert_eq!(
            store.read(|library| library.clone()),
            PresetLibrary::default()
        );
    }

    #[test]
    fn corrupt_file_is_moved_aside() {
        let path = temporary_path("presets.json");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, "{not json").unwrap();

        let store = PresetStore::load(path.clone());

        assert_eq!(
            store.read(|library| library.clone()),
            PresetLibrary::default()
        );
        assert!(path.with_extension("json.broken").exists());
    }
}
