use rusb::{Device, GlobalContext, Hotplug, HotplugBuilder, UsbContext};
use tauri::{AppHandle, Emitter};

/// Tells the frontend whenever a USB device is plugged or unplugged, so a camera that
/// comes back (and resets its controls) is reopened and gets its startup preset again.
pub struct UsbHotplugWatcher {
    app: AppHandle,
}

impl UsbHotplugWatcher {
    pub fn start(app: AppHandle) {
        if !rusb::has_hotplug() {
            eprintln!("USB hotplug not supported here; use Atualizar after reconnecting");
            return;
        }
        std::thread::spawn(move || {
            let context = GlobalContext::default();
            let registration = HotplugBuilder::new()
                .enumerate(false)
                .register(context, Box::new(Self { app }));
            let _registration = match registration {
                Ok(registration) => registration,
                Err(error) => {
                    eprintln!("USB hotplug registration failed: {error}");
                    return;
                }
            };
            loop {
                if let Err(error) = context.handle_events(None) {
                    eprintln!("USB event loop failed: {error}");
                    return;
                }
            }
        });
    }

    /// Event name mirrored in the frontend `TauriEvents` class.
    fn notify(&self) {
        let event = "usb-devices-changed";
        if let Err(error) = self.app.emit(event, ()) {
            eprintln!("could not emit {event}: {error}");
        }
    }
}

impl Hotplug<GlobalContext> for UsbHotplugWatcher {
    fn device_arrived(&mut self, _device: Device<GlobalContext>) {
        self.notify();
    }

    fn device_left(&mut self, _device: Device<GlobalContext>) {
        self.notify();
    }
}
