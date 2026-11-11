# U-S-G Ultimate SCRCPYGui

A custom build of the [Scrcpy GUI](https://github.com/SimonAKing/scrcpy-gui) (v2.5.0, MIT) with one-click wireless ADB, QR pairing, an advanced theme engine, a toolkit/boot panel, a smart tray icon and a built-in updater.

![Logo](build/icon.png)

## Features

- **One-click wireless ADB for Android 10 and below** — plug in a device, press the button, and the app enables `tcpip 5555`, reads the IP and connects. Constant caption, dynamic status line.
- **QR code pairing (Android 11+)** — optional toggle in the wireless panel. The app generates the pairing QR (`WIFI:T:ADB;S:…;P:…;;`), the phone scans it with its camera, then the app polls mDNS, runs `adb pair` and auto-connects. Manual address/code pairing is untouched.
- **Swipe panel + Android navigation bar** — optional floating panels (Settings → Controls), off by default.
- **Scripts** — 27 scrcpy argument presets as checkboxes in Settings → Advanced, appended to the launch arguments.
- **Drag-and-drop file push** — drop a file anywhere in the window to copy it to the Drag-and-drop target folder on the device.
- **Themes** — light / dark / OLED, 8 accent schemes, primary/secondary reversal.
- **Toolkit panel** — ADB quick actions, Shizuku start/stop/status, a command runner with recent and most-used commands, optional SSH tunnel and per-instance terminal.
- **Boot panel** — reboot, recovery, bootloader, safe mode, wake/sleep, power off.
- **Smart tray icon** — green while scrcpy is running, orange when devices are connected, red when none are. Right-click for per-device start/stop.
- **Updater** — checks and applies updates for the app itself (GitHub releases), bundled scrcpy and bundled adb, and can rebuild the AppImage in place.
- **Config export** — Settings → General: JSON, `.sh`, `.bat` or `.command`.
- **Settings → Panels** — drag to reorder the sidebar panels, toggle any panel's visibility, or reset to the defaults. Your layout persists across restarts.
- **Collapsible sidebar** with a manila-folder tab on its edge (always visible, open or collapsed), collapsible panels, app labels beside package names.

## Requirements

- Linux or Windows
- `adb` and `scrcpy` are bundled — no separate install needed

## Download

See [Releases](https://github.com/Ryuupyroxi/U-S-G-Ultimate-SCRCPYGui/releases) for the Linux AppImage and the Windows build.

## Building from source

This repository contains the patched Electron application source (`main/`, `preload/`, `renderer/`) plus `package.json`. It is a fork of `SimonAKing/scrcpy-gui` v2.5.0 — the original MIT license is in `resources/LICENSE.scrcpy-gui.txt` and the full list of modifications is in `resources/THIRD_PARTY_NOTICES.md`.

```bash
npm install
npm run build:linux    # AppImage
npm run build:windows  # Windows portable + installer (requires wine on Linux)
```

## License

MIT for the original Scrcpy GUI code. scrcpy is Apache-2.0. See `resources/THIRD_PARTY_NOTICES.md`.
