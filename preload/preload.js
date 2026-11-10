"use strict";
const electron = require("electron");
const api = {
  getVersion: () => electron.ipcRenderer.invoke("app:version"),
  listEvents: (query) => electron.ipcRenderer.invoke("events:list", query),
  clearEvents: () => electron.ipcRenderer.invoke("events:clear"),
  chooseScrcpy: () => electron.ipcRenderer.invoke("dialog:scrcpy"),
  chooseRecordPath: () => electron.ipcRenderer.invoke("dialog:record"),
  chooseRecordDirectory: () => electron.ipcRenderer.invoke("dialog:record-directory"),
  loadConfig: (legacyJson, locale) => electron.ipcRenderer.invoke("config:load", legacyJson, locale),
  saveConfig: (revision, config) => electron.ipcRenderer.invoke("config:save", revision, config),
  exportConfig: (format, config, launches) => electron.ipcRenderer.invoke("config:export", format, config, launches),
  exportConfig: (format, config, launches) => electron.ipcRenderer.invoke("config:export", format, config, launches),
  exportConfig: (format, config, launches) => electron.ipcRenderer.invoke("config:export", format, config, launches),
  getEnvironment: (runtime) => electron.ipcRenderer.invoke("system:environment", runtime),
  checkForUpdates: (runtime) => electron.ipcRenderer.invoke("update:check", runtime),
  applyUpdates: (runtime, items) => electron.ipcRenderer.invoke("update:apply", runtime, items),
  listDevices: (runtime) => electron.ipcRenderer.invoke("device:list", runtime),
  trackDevices: (runtime) => electron.ipcRenderer.invoke("device:track", runtime),
  setDeviceTrackerVisibility: (visible) => electron.ipcRenderer.invoke("device:visibility", visible),
  connect: (runtime, target) => electron.ipcRenderer.invoke("device:connect", runtime, target),
  pair: (runtime, target, code) => electron.ipcRenderer.invoke("device:pair", runtime, target, code),
  enableLegacyWireless: (runtime, serial) => electron.ipcRenderer.invoke("device:legacy-wireless", runtime, serial),
  deviceSdk: (runtime, serial) => electron.ipcRenderer.invoke("device:sdk", runtime, serial),
  startQrPairing: (runtime, serial) => electron.ipcRenderer.invoke("device:qr-pair-start", runtime, serial),
  waitQrPairing: (runtime, serial, name, password, timeout) => electron.ipcRenderer.invoke("device:qr-pair-wait", runtime, serial, name, password, timeout),
  cancelQrPairing: (name) => electron.ipcRenderer.invoke("device:qr-pair-cancel", name),
  runToolkitCommand: (runtime, serial, args) => electron.ipcRenderer.invoke("toolkit:adb", runtime, serial, args),
  shizuku: (runtime, serial, action) => electron.ipcRenderer.invoke("toolkit:shizuku", runtime, serial, action),
  adbServer: (runtime, action) => electron.ipcRenderer.invoke("toolkit:server", runtime, action),
  sshTunnel: (runtime, action, host, localPort, remotePort) => electron.ipcRenderer.invoke("toolkit:tunnel", runtime, action, host, localPort, remotePort),
  openTerminal: (runtime, serial) => electron.ipcRenderer.invoke("toolkit:terminal", runtime, serial),
  disconnect: (runtime, target) => electron.ipcRenderer.invoke("device:disconnect", runtime, target),
  start: (runtime, launches) => electron.ipcRenderer.invoke("scrcpy:start", runtime, launches),
  preview: (launches) => electron.ipcRenderer.invoke("scrcpy:preview", launches),
  startOtg: (runtime, launch, usbSerial) => electron.ipcRenderer.invoke("scrcpy:start-otg", runtime, launch, usbSerial),
  previewOtg: (launch, usbSerial) => electron.ipcRenderer.invoke("scrcpy:preview-otg", launch, usbSerial),
  listSessions: () => electron.ipcRenderer.invoke("session:list"),
  stopSession: (id) => electron.ipcRenderer.invoke("session:stop", id),
  stop: (serial) => electron.ipcRenderer.invoke("scrcpy:stop", serial),
  control: (runtime, serial, action) => electron.ipcRenderer.invoke("device:control", runtime, serial, action),
  screenshot: (runtime, serial) => electron.ipcRenderer.invoke("device:screenshot", runtime, serial),
  copyScreenshot: (runtime, serial) => electron.ipcRenderer.invoke("device:screenshot-copy", runtime, serial),
  onScreenshotShortcut: (callback) => {
    const listener = (_event, action) => callback(action);
    electron.ipcRenderer.on("app:screenshot-shortcut", listener);
    return () => electron.ipcRenderer.removeListener("app:screenshot-shortcut", listener);
  },
  onTrayStartDevice: (callback) => {
    const listener = (_event, serial) => callback(serial);
    electron.ipcRenderer.on("app:tray-start-device", listener);
    return () => electron.ipcRenderer.removeListener("app:tray-start-device", listener);
  },
  onControlShortcut: (callback) => {
    const listener = (_event, action) => callback(action);
    electron.ipcRenderer.on("app:control-shortcut", listener);
    return () => electron.ipcRenderer.removeListener("app:control-shortcut", listener);
  },
  previewAutomationImport: () => electron.ipcRenderer.invoke("automation:import-preview"),
  commitAutomationImport: (token) => electron.ipcRenderer.invoke("automation:import-commit", token),
  exportAutomation: (automation) => electron.ipcRenderer.invoke("automation:export", automation),
  preflightBatch: (runtime, request) => electron.ipcRenderer.invoke("batch:preflight", runtime, request),
  startBatch: (runtime, token, passingOnly, confirmedDangerous) => electron.ipcRenderer.invoke("batch:start", runtime, token, passingOnly, confirmedDangerous),
  cancelBatch: (runId) => electron.ipcRenderer.invoke("batch:cancel", runId),
  getDeviceOverview: (runtime, serial) => electron.ipcRenderer.invoke("device:overview", runtime, serial),
  pushFiles: (runtime, serials, target, conflict) => electron.ipcRenderer.invoke("device:push-files", runtime, serials, target, conflict),
  pushPaths: (runtime, serials, target, conflict, paths) => electron.ipcRenderer.invoke("device:push-paths", runtime, serials, target, conflict, paths),
  installApk: (runtime, serials, replace, downgrade) => electron.ipcRenderer.invoke("device:install-apk", runtime, serials, replace, downgrade),
  listApps: (runtime, serial, refresh) => electron.ipcRenderer.invoke("device:apps", runtime, serial, refresh),
  startApp: (runtime, serial, packageId) => electron.ipcRenderer.invoke("device:start-app", runtime, serial, packageId),
  listArtifacts: (query) => electron.ipcRenderer.invoke("artifact:list", query),
  openArtifact: (id) => electron.ipcRenderer.invoke("artifact:open", id),
  revealArtifact: (id) => electron.ipcRenderer.invoke("artifact:reveal", id),
  copyArtifactPath: (id) => electron.ipcRenderer.invoke("artifact:copy-path", id),
  deleteArtifact: (id, deleteFile) => electron.ipcRenderer.invoke("artifact:delete", id, deleteFile),
  previewDiagnostics: (runtime) => electron.ipcRenderer.invoke("diagnostics:preview", runtime),
  exportDiagnostics: (runtime) => electron.ipcRenderer.invoke("diagnostics:export", runtime),
  openIssueHelper: (artifactId) => electron.ipcRenderer.invoke("diagnostics:issue-helper", artifactId),
  exportProfile: (profile) => electron.ipcRenderer.invoke("profile:export", profile),
  previewProfileImport: (runtime) => electron.ipcRenderer.invoke("profile:import-preview", runtime),
  commitProfileImport: (token, strategy, keepMachinePaths) => electron.ipcRenderer.invoke("profile:import-commit", token, strategy, keepMachinePaths),
  probeDeviceCapabilities: (runtime, serial, refresh = false) => electron.ipcRenderer.invoke("capability:device-probe", runtime, serial, refresh),
  setMinimizeToTray: (enabled) => electron.ipcRenderer.invoke("app:minimize-to-tray", enabled),
  setQuitBehavior: (runtime, killAdbOnQuit) => electron.ipcRenderer.invoke("app:quit-behavior", runtime, killAdbOnQuit),
  setBossKey: (enabled, accelerator) => electron.ipcRenderer.invoke("app:boss-key", enabled, accelerator),
  openExternal: (url) => electron.ipcRenderer.invoke("shell:open", url),
  onStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    electron.ipcRenderer.on("scrcpy:status", listener);
    return () => electron.ipcRenderer.removeListener("scrcpy:status", listener);
  },
  onSession: (callback) => {
    const listener = (_event, sessionEvent) => callback(sessionEvent);
    electron.ipcRenderer.on("session:event", listener);
    return () => electron.ipcRenderer.removeListener("session:event", listener);
  },
  onDevices: (callback) => {
    const listener = (_event, deviceEvent) => callback(deviceEvent);
    electron.ipcRenderer.on("device:event", listener);
    return () => electron.ipcRenderer.removeListener("device:event", listener);
  },
  onEvent: (callback) => {
    const listener = (_event, appEvent) => callback(appEvent);
    electron.ipcRenderer.on("app:event", listener);
    return () => electron.ipcRenderer.removeListener("app:event", listener);
  },
  onBatchProgress: (callback) => {
    const listener = (_event, progress) => callback(progress);
    electron.ipcRenderer.on("batch:progress", listener);
    return () => electron.ipcRenderer.removeListener("batch:progress", listener);
  },
  onBatchRun: (callback) => {
    const listener = (_event, runEvent) => callback(runEvent);
    electron.ipcRenderer.on("batch:run-event", listener);
    return () => electron.ipcRenderer.removeListener("batch:run-event", listener);
  }
};
electron.contextBridge.exposeInMainWorld("scrcpy", api);
