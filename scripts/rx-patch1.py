#!/usr/bin/env python3
"""Renderer part 1: defaults, script constants, launch args, Controls toggles, app labels."""
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:100]
    s = s.replace(old, new, count)

# 1) defaultPersistedConfig
rep('''    theme: "light",
    accentScheme: "default",
    accentReversed: false,
    muteNotifications: false,''',
'''    theme: "light",
    accentScheme: "default",
    accentReversed: false,
    swipePanel: false,
    navBar: false,
    qrPairing: false,
    scripts: {},
    muteNotifications: false,''')

# 2) script constants + launch arg merge
rep('''function launchForDevice(config, serial) {''',
'''const SCRCPY_SCRIPTS = [
  { id: "gaming", label: "Gaming", args: "--no-mipmaps --no-mouse-hover --raw-key-events --disable-screensaver" },
  { id: "battery-saver", label: "Battery saver", args: "--disable-screensaver --no-clipboard-autosync --no-terminal-title --no-cleanup" },
  { id: "presentation", label: "Presentation", args: "--print-fps --disable-screensaver --no-cleanup" },
  { id: "compatibility", label: "Compatibility", args: "--no-mipmaps --legacy-paste --prefer-text --no-mouse-hover --no-key-repeat" },
  { id: "safe-exit", label: "Safe exit", args: "--pause-on-exit --power-off-on-close" },
  { id: "no-cleanup", label: "No cleanup", args: "--no-cleanup --no-clipboard-autosync" }
];
function enabledScriptArgs(config) {
  const enabled = config.scripts || {};
  return SCRCPY_SCRIPTS.filter((script) => enabled[script.id]).map((script) => script.args).join(" ");
}
function launchForDevice(config, serial) {''')

rep('''  const alias = serial ? config.deviceAliases[serial]?.trim() : "";
  if (alias && !launch.windowTitle.trim()) launch.windowTitle = alias;
  return launch;
}''',
'''  const alias = serial ? config.deviceAliases[serial]?.trim() : "";
  if (alias && !launch.windowTitle.trim()) launch.windowTitle = alias;
  const scriptArgs = enabledScriptArgs(config);
  if (scriptArgs) launch.extraArgs = [launch.extraArgs.trim(), scriptArgs].filter(Boolean).join("\\n");
  return launch;
}''')

# 3) i18n (en)
rep('''  muteNotifications: "Mute popup notifications",''',
'''  showSwipePanel: "Show swipe panel (on-screen swipe buttons)",
  showSwipePanelHint: "Adds a floating panel with horizontal and vertical swipe buttons.",
  showNavBar: "Show Android navigation bar",
  showNavBarHint: "Adds a floating back / home / recents bar for devices without on-screen navigation.",
  showQrPairing: "Show QR code pairing",
  showQrPairingHint: "Adds a QR option under Android 11+. It reads the pairing QR from the device screen over ADB, so no camera is needed. Your manual address/code fields stay exactly as they are.",
  scripts: "Scripts",
  scriptsHint: "Toggle preset argument packs. Enabled scripts are appended to the launch command, after the additional arguments above.",
  muteNotifications: "Mute popup notifications",''')

# 4) Controls toggles (after showTouches block)
rep('''                  createBaseVNode("label", _hoisted_430, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[126] || (_cache[126] = ($event) => config.launch.showTouches = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.showTouches]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showTouches")), 1)
                  ]),''',
'''                  createBaseVNode("label", _hoisted_430, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[126] || (_cache[126] = ($event) => config.launch.showTouches = $event),
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.launch.showTouches]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showTouches")), 1)
                  ]),
                  createBaseVNode("label", { class: "toggle" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.swipePanel = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.swipePanel]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showSwipePanel")), 1)
                  ]),
                  createBaseVNode("label", { class: "toggle" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.navBar = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.navBar]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showNavBar")), 1)
                  ]),''')

# 5) app list: inline label + package
rep('''                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(app.label), 1),
                        createBaseVNode("code", null, toDisplayString(app.packageId), 1)
                      ]),''',
'''                      createBaseVNode("span", null, [
                        createBaseVNode("strong", null, toDisplayString(app.label), 1),
                        createTextVNode(" "),
                        createBaseVNode("code", null, toDisplayString(app.packageId), 1)
                      ]),''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
