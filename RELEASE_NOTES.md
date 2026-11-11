# UltimateSCRCPYGui v1.1.1

A stable maintenance release of the **Ultimate Scrcpy** custom build — a fork of [Scrcpy GUI](https://github.com/SimonAKing/scrcpy-gui) v2.5.0 (MIT).

## Fixed

- **Wireless ADB for Android 10 and below no longer "refuses to work".** `adb tcpip 5555` restarts adbd, which made the USB device vanish for about a second; the app dropped it from the selection and auto-selected the first (usually too-new) device, leaving the button disabled until the app was restarted. The target is now any eligible USB Android 10- device, a selection lost to the restart is restored, and a failed Android-version probe is retried instead of latching the button off.
- **Device IP detection no longer picks the wrong network.** `ip addr show wlan0` and `ifconfig wlan0` are now tried before `ip route`, and the routing table is parsed per-line: mobile interfaces (`rmnet*`, `ccmni*`, `usb*`, `rndis*`, `data*`, `wwan*`) are skipped and only private addresses are accepted. Previously the first `src` won, so a phone with mobile data active could hand back an unreachable cellular IP that looked exactly like a network fault.
- **Shizuku status / Toolkit commands did nothing.** Three Vue vnodes were built with a PROPS patch flag but no `dynamicProps` array (the QR-pair button and the device `<option>` in the Boot and Toolkit selects). Vue threw `Cannot read properties of null (reading 'length')` on every device-list update, which aborted rendering on those panels so command output never appeared. All three are fixed, and a scanner (`scripts/scan-patchflags.py`) now guards against regressions.
- **Settings → Panels ate its own rows.** Unticking a panel removed it from the settings list as well as the sidebar, so it could not be re-enabled. The list now shows every panel; only the sidebar hides.

## Changed

- **Boot moved into the Toolkit.** The Boot side panel is gone (7 panels instead of 8); reboot / recovery / bootloader / safe mode / wake / sleep / power off are the first Toolkit section and share its device selector.
- **Scripts moved into the Toolkit.** The 27 scrcpy argument presets are no longer a column in Settings → Advanced.
- **ADB quick actions expanded from 6 to 21**, grouped into Server, Device information, Device control and Apps & files. Hovering a command shows a pop-up with a one-line description and the exact command, capped at 75 characters so it can never bloat the window.
- **Settings → Controls is now just two switches** — "Show swipe panel" and "Show Android navigation bar". The other ten options moved to Settings → Window.
- **Every checkbox is now a switch** filled with the secondary accent colour (it follows the selected accent scheme and the "Reverse order" toggle).
- **Virtual display options** are laid out so "Resize with window" sits directly under "Destroy content on close".

## Features carried over from v1.0.0-alpha

- One-click wireless ADB for Android 10 and below.
- QR code pairing (Android 11+), swipe panel and Android navigation bar.
- 27 scrcpy argument presets, drag-and-drop file push, themes (light / dark / OLED) with 8 accent schemes.
- Toolkit (ADB actions, Shizuku, command runner with recent/most-used, SSH tunnel, per-instance terminal), smart tray icon, built-in updater, config export, collapsible sidebar, Settings → Panels.

## Requirements

- Linux (the AppImage is self-contained); `adb` and `scrcpy` are bundled.

## Install

```bash
chmod +x UltimateSCRCPYGui-1.1.1.AppImage
./UltimateSCRCPYGui-1.1.1.AppImage
```

Settings are stored in `~/.config/UltimateSCRCPYGui/`.

## Source

Patched Electron application source (`main/`, `preload/`, `renderer/`) plus `package.json` is in this repository. Build with `npm install && npm run build:linux`.

## License

MIT for the original Scrcpy GUI code. scrcpy is Apache-2.0. See `resources/THIRD_PARTY_NOTICES.md`.
