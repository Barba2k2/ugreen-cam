# UGREEN Cam

Tauri 2 + React app that drives UVC camera controls (brightness, contrast, saturation, white balance, exposure, focus, zoom…) straight over USB, with a live preview.

## How it works

- `src-tauri/src/uvc/` talks UVC over the USB control pipe via `rusb` (vendored libusb). The VideoControl descriptors are parsed to find the Camera Terminal / Processing Unit and which controls each advertises, so any UVC camera works, not only the UGREEN.
- macOS keeps the video interface claimed by its own driver; class requests on endpoint 0 still go through, no root needed.
- The preview is plain `getUserMedia` in the WebView, matched to the USB product name.

## Commands

```bash
pnpm install
pnpm tauri dev
```

```bash
pnpm typecheck && pnpm lint && pnpm test
```

```bash
cd src-tauri && cargo clippy --all-targets && cargo test
```

Real-camera tests (write, read back and restore brightness; white-balance lock) run only with the camera plugged in:

```bash
cd src-tauri && UVC_TEST_CAMERA=1 cargo test
```
