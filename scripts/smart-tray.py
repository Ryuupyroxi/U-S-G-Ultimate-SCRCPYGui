#!/usr/bin/env python3
"""Smart tray icon (green/orange/red) + per-device start/stop menu."""
import pathlib
B = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out')

m = B / 'main/main.js'
s = m.read_text(encoding='utf-8')
old = '''function createTray() {
  const iconPath = electron.app.isPackaged ? node_path.join(process.resourcesPath, "icons/tray.png") : node_path.join(electron.app.getAppPath(), "build/icons/16x16.png");
  const icon = electron.nativeImage.createFromPath(iconPath);
  tray = new electron.Tray(process.platform === "darwin" ? icon.resize({ width: 16, height: 16 }) : icon);
  tray.setToolTip("UltimateSCRCPYGui");
  tray.setContextMenu(
    electron.Menu.buildFromTemplate([
      { label: "Show UltimateSCRCPYGui", click: () => mainWindow?.show() },
      { label: "Quit", click: () => electron.app.quit() }
    ])
  );
  tray.on("click", () => mainWindow?.show());
}'''
assert s.count(old) == 1
new = '''function trayIconPath(name) {
  return electron.app.isPackaged
    ? node_path.join(process.resourcesPath, "icons", name)
    : node_path.join(electron.app.getAppPath(), "resources", "icons", name);
}
function updateTray() {
  if (!tray) return;
  const devices = deviceTracker.devices || [];
  const running = sessionManager.list().filter((session) => !TERMINAL_SESSION_STATES.has(session.state));
  const connected = devices.filter((device) => device.state === "device").length;
  const iconName = running.length > 0 ? "tray-green.png" : connected > 0 ? "tray-orange.png" : "tray-red.png";
  const image = electron.nativeImage.createFromPath(trayIconPath(iconName));
  if (!image.isEmpty()) {
    tray.setImage(process.platform === "darwin" ? image.resize({ width: 16, height: 16 }) : image.resize({ width: 22, height: 22 }));
  }
  const template = [
    { label: "UltimateSCRCPYGui", enabled: false },
    { type: "separator" }
  ];
  if (devices.length === 0) {
    template.push({ label: "No devices connected", enabled: false });
  } else {
    for (const device of devices) {
      const session = running.find((item) => item.serial === device.serial);
      const label = `${device.model || device.serial} · ${device.serial}`;
      template.push({
        label,
        submenu: [
          {
            label: session ? "Stop scrcpy" : "Start scrcpy",
            click: () => {
              if (session) {
                sessionManager.stopBySerial(device.serial);
              } else {
                mainWindow?.show();
                mainWindow?.webContents.send("app:tray-start-device", device.serial);
              }
            }
          },
          {
            label: `Copy serial (${device.serial})`,
            click: () => electron.clipboard.writeText(device.serial)
          }
        ]
      });
    }
  }
  template.push({ type: "separator" });
  template.push({ label: "Show UltimateSCRCPYGui", click: () => mainWindow?.show() });
  template.push({ label: "Quit", click: () => electron.app.quit() });
  tray.setContextMenu(electron.Menu.buildFromTemplate(template));
  tray.setToolTip(`UltimateSCRCPYGui · ${connected} device(s) · ${running.length} running`);
}
function createTray() {
  const iconPath = trayIconPath("tray-orange.png");
  const icon = electron.nativeImage.createFromPath(iconPath);
  tray = new electron.Tray(process.platform === "darwin" ? icon.resize({ width: 16, height: 16 }) : icon.resize({ width: 22, height: 22 }));
  tray.setToolTip("UltimateSCRCPYGui");
  tray.on("click", () => mainWindow?.show());
  deviceTracker.subscribe(() => updateTray());
  sessionManager.subscribe(() => updateTray());
  updateTray();
}'''
s = s.replace(old, new, 1)
m.write_text(s, encoding='utf-8')
print("main tray updated")

# preload bridge
p = B / 'preload/preload.js'
t = p.read_text(encoding='utf-8')
old_p = '  onControlShortcut: (listener) => {'
assert t.count(old_p) == 1
new_p = '''  onTrayStartDevice: (listener) => {
    electron.ipcRenderer.on("app:tray-start-device", (_event, serial) => listener(serial));
    return () => electron.ipcRenderer.removeAllListeners("app:tray-start-device");
  },
  onControlShortcut: (listener) => {'''
t = t.replace(old_p, new_p, 1)
p.write_text(t, encoding='utf-8')
print("preload bridge added")

# renderer listener
r = B / 'renderer/assets/index-Df8DQ038.js'
u = r.read_text(encoding='utf-8')
old_r = '''    let removeControlShortcutListener;'''
assert u.count(old_r) == 1
u = u.replace(old_r, '''    let removeControlShortcutListener;
    let removeTrayStartListener;''', 1)

old_mount = '''      removeControlShortcutListener = window.scrcpy.onControlShortcut((action) => void sendControlAction(action));'''
assert u.count(old_mount) == 1
u = u.replace(old_mount, old_mount + '''
      removeTrayStartListener = window.scrcpy.onTrayStartDevice((serial) => {
        selectedSerials.value = [serial];
        void launchSelected();
      });''', 1)

old_unmount = '''      removeControlShortcutListener?.();'''
assert u.count(old_unmount) == 1
u = u.replace(old_unmount, old_unmount + '''
      removeTrayStartListener?.();''', 1)
r.write_text(u, encoding='utf-8')
print("renderer listener added")
