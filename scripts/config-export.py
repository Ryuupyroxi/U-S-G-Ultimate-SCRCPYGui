#!/usr/bin/env python3
"""Add config export (JSON / .sh / .bat / .command) IPC + UI in Settings > General."""
import pathlib
B = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out')

# ---------- main ----------
m = B / 'main/main.js'
s = m.read_text(encoding='utf-8')
anchor = 'handle("config:save", (_event, revision, config) => {'
assert s.count(anchor) == 1
new_handler = '''handle("config:export", async (_event, format, configView, launches) => {
  try {
    const format2 = ["json", "sh", "bat", "command"].includes(format) ? format : "json";
    const extension = format2 === "json" ? "json" : format2;
    let contents = "";
    if (format2 === "json") {
      contents = `${JSON.stringify(configView, null, 2)}\\n`;
    } else {
      const commands = commandPreviewRequests(launches).map((request) => {
        const prepared = prepareLaunchConfig(request.launch, request.serial);
        const details = buildScrcpyArgDetails(prepared, request.serial, request.source, request.profileName, request.deviceWindowTitleOverride);
        return `scrcpy ${details.map((detail) => detail.arg).join(" ")}`.trim();
      });
      const banner = format2 === "bat" ? "@echo off\\r\\nrem UltimateSCRCPYGui exported launch\\r\\n" : "#!/usr/bin/env bash\\n# UltimateSCRCPYGui exported launch\\n";
      const eol = format2 === "bat" ? "\\r\\n" : "\\n";
      contents = `${banner}${commands.join(eol)}${eol}`;
    }
    const destination = await electron.dialog.showSaveDialog({
      title: "Export configuration",
      defaultPath: node_path.join(electron.app.getPath("downloads"), `ultimate-scrcpygui-config.${extension}`),
      filters: [{ name: format2 === "json" ? "JSON document" : "Launch script", extensions: [extension] }]
    });
    if (destination.canceled || !destination.filePath) {
      return operationFailure("CONFIG_EXPORT_CANCELED", "config-export", "Configuration export canceled.");
    }
    await promises.writeFile(destination.filePath, contents, { encoding: "utf8", mode: 384 });
    return { ok: true, data: { path: destination.filePath, format: format2 } };
  } catch (error) {
    return failureFromUnknown(error, "CONFIG_EXPORT_FAILED", "config-export", "Unable to export the configuration.");
  }
});
'''
s = s.replace(anchor, new_handler + anchor, 1)
m.write_text(s, encoding='utf-8')
print("main handler added")

# ---------- preload ----------
p = B / 'preload/preload.js'
t = p.read_text(encoding='utf-8')
old = '  saveConfig: (revision, config) => electron.ipcRenderer.invoke("config:save", revision, config),'
assert t.count(old) == 1
t = t.replace(old, old + '\n  exportConfig: (format, config, launches) => electron.ipcRenderer.invoke("config:export", format, config, launches),', 1)
p.write_text(t, encoding='utf-8')
print("preload bridge added")

# ---------- renderer: i18n ----------
r = B / 'renderer/assets/index-Df8DQ038.js'
u = r.read_text(encoding='utf-8')
old_i18n = '  configSaveFailed: "Could not save configuration."'
assert u.count(old_i18n) == 1
u = u.replace(old_i18n, old_i18n + '''
  exportConfig: "Export configuration",
  exportConfigHint: "Save the app settings as JSON, or export the current launch command as a shell / batch script.",
  exportJson: "Export as JSON",
  exportShell: "Export as .sh",
  exportBatch: "Export as .bat",
  exportCommand: "Export as .command",
  configExported: "Configuration exported to {path}.",
  configExportFailed: "Could not export the configuration.",''', 1)
r.write_text(u, encoding='utf-8')
print("i18n added")
