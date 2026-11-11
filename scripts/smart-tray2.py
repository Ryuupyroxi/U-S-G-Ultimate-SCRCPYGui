#!/usr/bin/env python3
"""Tray preload bridge + renderer listener (main already patched)."""
import pathlib
B = pathlib.Path('.')

p = B / 'preload/preload.js'
t = p.read_text(encoding='utf-8')
old_p = '  onControlShortcut: (callback) => {'
assert t.count(old_p) == 1
new_p = '''  onTrayStartDevice: (callback) => {
    const listener = (_event, serial) => callback(serial);
    electron.ipcRenderer.on("app:tray-start-device", listener);
    return () => electron.ipcRenderer.removeListener("app:tray-start-device", listener);
  },
  onControlShortcut: (callback) => {'''
t = t.replace(old_p, new_p, 1)
p.write_text(t, encoding='utf-8')
print("preload bridge added")

r = B / 'renderer/assets/index-Df8DQ038.js'
u = r.read_text(encoding='utf-8')
old_r = '    let removeControlShortcutListener;'
assert u.count(old_r) == 1, u.count(old_r)
u = u.replace(old_r, '''    let removeControlShortcutListener;
    let removeTrayStartListener;''', 1)

old_mount = '      removeControlShortcutListener = window.scrcpy.onControlShortcut((action) => void sendControlAction(action));'
assert u.count(old_mount) == 1, u.count(old_mount)
u = u.replace(old_mount, old_mount + '''
      removeTrayStartListener = window.scrcpy.onTrayStartDevice((serial) => {
        selectedSerials.value = [serial];
        void launchSelected();
      });''', 1)

old_unmount = '      removeControlShortcutListener?.();'
assert u.count(old_unmount) == 1, u.count(old_unmount)
u = u.replace(old_unmount, old_unmount + '''
      removeTrayStartListener?.();''', 1)
r.write_text(u, encoding='utf-8')
print("renderer listener added")
