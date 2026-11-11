#!/usr/bin/env python3
"""Add the toolkit config section (SSH tunnel, per-instance terminal, recent/most-used commands)."""
import pathlib
B = pathlib.Path('.')
m = B / 'main/main.js'
s = m.read_text(encoding='utf-8')

def rep(old, new):
    global s
    assert s.count(old) == 1, "MISS(%d): %s" % (s.count(old), old[:70])
    s = s.replace(old, new, 1)

# 1) defaults
rep('    update: { checkOnStartup: false, autoUpdateOnStartup: false, skipConfirmation: false },',
    '''    update: { checkOnStartup: false, autoUpdateOnStartup: false, skipConfirmation: false },
    toolkit: { sshEnabled: false, sshHost: "", sshLocalPort: 5555, sshRemotePort: 5555, perInstanceTerminal: false, recentCommands: [], commandUsage: {} },''')

# 2) configView
rep('    update: { checkOnStartup: config.update.checkOnStartup, autoUpdateOnStartup: config.update.autoUpdateOnStartup, skipConfirmation: config.update.skipConfirmation }',
    '''    update: { checkOnStartup: config.update.checkOnStartup, autoUpdateOnStartup: config.update.autoUpdateOnStartup, skipConfirmation: config.update.skipConfirmation },
    toolkit: { sshEnabled: config.toolkit.sshEnabled, sshHost: config.toolkit.sshHost, sshLocalPort: config.toolkit.sshLocalPort, sshRemotePort: config.toolkit.sshRemotePort, perInstanceTerminal: config.toolkit.perInstanceTerminal, recentCommands: [...config.toolkit.recentCommands], commandUsage: { ...config.toolkit.commandUsage } }''')

# 3) section validator (next to updateSection)
rep('function validateAppConfigV3(value) {',
    '''function toolkitSection(value, name = "toolkit") {
  const source = object(value === void 0 ? {} : value, name);
  const usage = object(source.commandUsage === void 0 ? {} : source.commandUsage, `${name}.commandUsage`);
  const commandUsage = {};
  for (const [key, count] of Object.entries(usage)) {
    commandUsage[boundedString$1(key, `${name}.commandUsage key`, 512)] = nonNegativeInteger(count, `${name}.commandUsage.${key}`);
  }
  return {
    sshEnabled: source.sshEnabled === void 0 ? false : strictBoolean(source.sshEnabled, `${name}.sshEnabled`),
    sshHost: source.sshHost === void 0 ? "" : boundedString$1(source.sshHost, `${name}.sshHost`, 256, true),
    sshLocalPort: source.sshLocalPort === void 0 ? 5555 : nonNegativeInteger(source.sshLocalPort, `${name}.sshLocalPort`),
    sshRemotePort: source.sshRemotePort === void 0 ? 5555 : nonNegativeInteger(source.sshRemotePort, `${name}.sshRemotePort`),
    perInstanceTerminal: source.perInstanceTerminal === void 0 ? false : strictBoolean(source.perInstanceTerminal, `${name}.perInstanceTerminal`),
    recentCommands: array(source.recentCommands, `${name}.recentCommands`).slice(0, 12).map((entry, index) => boundedString$1(entry, `${name}.recentCommands[${index}]`, 512, true)),
    commandUsage
  };
}
function validateAppConfigV3(value) {''')

# 4) safeLegacyConfig
rep('    update: updateSection(source.update, "config.update"),',
    '''    update: updateSection(source.update, "config.update"),
    toolkit: toolkitSection(source.toolkit, "config.toolkit"),''')

# 5) legacy migration
rep('      update: accept(() => updateSection(candidate.update, "legacy.update"), defaults.update),',
    '''      update: accept(() => updateSection(candidate.update, "legacy.update"), defaults.update),
      toolkit: accept(() => toolkitSection(candidate.toolkit, "legacy.toolkit"), defaults.toolkit),''')

# 6) configFromView
rep('    update: { checkOnStartup: view.update.checkOnStartup, autoUpdateOnStartup: view.update.autoUpdateOnStartup, skipConfirmation: view.update.skipConfirmation },',
    '''    update: { checkOnStartup: view.update.checkOnStartup, autoUpdateOnStartup: view.update.autoUpdateOnStartup, skipConfirmation: view.update.skipConfirmation },
    toolkit: { sshEnabled: view.toolkit.sshEnabled, sshHost: view.toolkit.sshHost, sshLocalPort: view.toolkit.sshLocalPort, sshRemotePort: view.toolkit.sshRemotePort, perInstanceTerminal: view.toolkit.perInstanceTerminal, recentCommands: [...view.toolkit.recentCommands], commandUsage: { ...view.toolkit.commandUsage } },''')

# 7) validateAppConfigV3 output
rep('    update: updateSection(source.update, "configV3.update"),',
    '''    update: updateSection(source.update, "configV3.update"),
    toolkit: toolkitSection(source.toolkit, "configV3.toolkit"),''')

m.write_text(s, encoding='utf-8')
print("main toolkit section added")

# renderer defaults
r = B / 'renderer/assets/index-Df8DQ038.js'
u = r.read_text(encoding='utf-8')
old = '    update: { checkOnStartup: false, autoUpdateOnStartup: false, skipConfirmation: false },'
assert u.count(old) == 1
u = u.replace(old, old + '''
    toolkit: { sshEnabled: false, sshHost: "", sshLocalPort: 5555, sshRemotePort: 5555, perInstanceTerminal: false, recentCommands: [], commandUsage: {} },''', 1)
r.write_text(u, encoding='utf-8')
print("renderer defaults added")
