#!/usr/bin/env python3
"""Add swipePanel / navBar / qrPairing / scripts to the config schema and flow."""
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/main/main.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:90]
    s = s.replace(old, new, count)

# 1) constants + validator, placed next to the theme/accent validators
rep('''const accentSchemes = /* @__PURE__ */ new Set(["default", "purple-orange", "pink-blue", "pink-purple", "blue-orange", "green-pink", "yellow-purple", "red-blue"]);''',
'''const SCRCPY_SCRIPTS = [
  { id: "gaming", label: "Gaming", args: "--no-mipmaps --no-mouse-hover --raw-key-events --disable-screensaver" },
  { id: "battery-saver", label: "Battery saver", args: "--disable-screensaver --no-clipboard-autosync --no-terminal-title --no-cleanup" },
  { id: "presentation", label: "Presentation", args: "--print-fps --disable-screensaver --no-cleanup" },
  { id: "compatibility", label: "Compatibility", args: "--no-mipmaps --legacy-paste --prefer-text --no-mouse-hover --no-key-repeat" },
  { id: "safe-exit", label: "Safe exit", args: "--pause-on-exit --power-off-on-close" },
  { id: "no-cleanup", label: "No cleanup", args: "--no-cleanup --no-clipboard-autosync" }
];
const SCRCPY_SCRIPT_IDS = SCRCPY_SCRIPTS.map((script) => script.id);
function scriptsRecord(value, name = "scripts") {
  const source = object(value === void 0 ? {} : value, name);
  const result = {};
  for (const id of SCRCPY_SCRIPT_IDS) {
    if (typeof source[id] === "boolean") result[id] = source[id];
  }
  return result;
}
const accentSchemes = /* @__PURE__ */ new Set(["default", "purple-orange", "pink-blue", "pink-purple", "blue-orange", "green-pink", "yellow-purple", "red-blue"]);''')

# 2) defaultPersistedConfig
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

# 3) configView
rep('''    theme: config.appearance.theme,
    accentScheme: config.appearance.accentScheme,
    accentReversed: config.appearance.accentReversed,
    muteNotifications: config.appearance.muteNotifications,''',
'''    theme: config.appearance.theme,
    accentScheme: config.appearance.accentScheme,
    accentReversed: config.appearance.accentReversed,
    swipePanel: config.appearance.swipePanel,
    navBar: config.appearance.navBar,
    qrPairing: config.appearance.qrPairing,
    scripts: config.defaults.scripts,
    muteNotifications: config.appearance.muteNotifications,''')

# 4) validatePersistedConfig
rep('''    accentReversed: strictBoolean(source.accentReversed, "config.accentReversed"),
    update: updateSection(source.update, "config.update"),''',
'''    accentReversed: strictBoolean(source.accentReversed, "config.accentReversed"),
    swipePanel: strictBoolean(source.swipePanel, "config.swipePanel"),
    navBar: strictBoolean(source.navBar, "config.navBar"),
    qrPairing: strictBoolean(source.qrPairing, "config.qrPairing"),
    update: updateSection(source.update, "config.update"),''')
rep('''    autoSelectFirstDevice: strictBoolean(source.autoSelectFirstDevice, "config.autoSelectFirstDevice"),
    autoLaunchDevices: stringRecord(source.autoLaunchDevices, "config.autoLaunchDevices", true)''',
'''    autoSelectFirstDevice: strictBoolean(source.autoSelectFirstDevice, "config.autoSelectFirstDevice"),
    scripts: scriptsRecord(source.scripts, "config.scripts"),
    autoLaunchDevices: stringRecord(source.autoLaunchDevices, "config.autoLaunchDevices", true)''')

# 5) safeLegacyConfig
rep('''      accentReversed: accept(() => strictBoolean(candidate.accentReversed, "legacy.accentReversed"), defaults.accentReversed),
      update: accept(() => updateSection(candidate.update, "legacy.update"), defaults.update),''',
'''      accentReversed: accept(() => strictBoolean(candidate.accentReversed, "legacy.accentReversed"), defaults.accentReversed),
      swipePanel: accept(() => strictBoolean(candidate.swipePanel, "legacy.swipePanel"), defaults.swipePanel),
      navBar: accept(() => strictBoolean(candidate.navBar, "legacy.navBar"), defaults.navBar),
      qrPairing: accept(() => strictBoolean(candidate.qrPairing, "legacy.qrPairing"), defaults.qrPairing),
      scripts: accept(() => scriptsRecord(candidate.scripts, "legacy.scripts"), defaults.scripts),
      update: accept(() => updateSection(candidate.update, "legacy.update"), defaults.update),''')

# 6) validateAppConfigV3
rep('''    appearance: { muteNotifications: strictBoolean(appearance.muteNotifications, "configV3.appearance.muteNotifications"), theme: themeValue(appearance.theme), accentScheme: accentSchemeValue(appearance.accentScheme), accentReversed: strictBoolean(appearance.accentReversed, "configV3.appearance.accentReversed") },''',
'''    appearance: { muteNotifications: strictBoolean(appearance.muteNotifications, "configV3.appearance.muteNotifications"), theme: themeValue(appearance.theme), accentScheme: accentSchemeValue(appearance.accentScheme), accentReversed: strictBoolean(appearance.accentReversed, "configV3.appearance.accentReversed"), swipePanel: strictBoolean(appearance.swipePanel, "configV3.appearance.swipePanel"), navBar: strictBoolean(appearance.navBar, "configV3.appearance.navBar"), qrPairing: strictBoolean(appearance.qrPairing, "configV3.appearance.qrPairing") },''')
rep('''      killAdbOnQuit: strictBoolean(defaults.killAdbOnQuit, "configV3.defaults.killAdbOnQuit"),
      autoSelectFirstDevice: strictBoolean(defaults.autoSelectFirstDevice, "configV3.defaults.autoSelectFirstDevice")
    },''',
'''      killAdbOnQuit: strictBoolean(defaults.killAdbOnQuit, "configV3.defaults.killAdbOnQuit"),
      autoSelectFirstDevice: strictBoolean(defaults.autoSelectFirstDevice, "configV3.defaults.autoSelectFirstDevice"),
      scripts: scriptsRecord(defaults.scripts, "configV3.defaults.scripts")
    },''')

# 7) configFromView
rep('''    appearance: { muteNotifications: view.muteNotifications, theme: view.theme, accentScheme: view.accentScheme, accentReversed: view.accentReversed },''',
'''    appearance: { muteNotifications: view.muteNotifications, theme: view.theme, accentScheme: view.accentScheme, accentReversed: view.accentReversed, swipePanel: view.swipePanel, navBar: view.navBar, qrPairing: view.qrPairing },''')
rep('''      killAdbOnQuit: view.killAdbOnQuit,
      autoSelectFirstDevice: view.autoSelectFirstDevice
    },''',
'''      killAdbOnQuit: view.killAdbOnQuit,
      autoSelectFirstDevice: view.autoSelectFirstDevice,
      scripts: structuredClone(view.scripts)
    },''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
