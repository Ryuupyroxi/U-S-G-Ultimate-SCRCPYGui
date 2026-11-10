#!/usr/bin/env python3
"""Render the Boot and Toolkit panel markup."""
import pathlib
B = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets')
p = B / 'index-Df8DQ038.js'
s = p.read_text(encoding='utf-8')

anchor = '''          ], 64)) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", _hoisted_490, ['''
assert s.count(anchor) == 1, s.count(anchor)

block = '''          ], 64)) : activeTab.value === "boot" ? (openBlock(), createElementBlock("section", { key: 7, class: "panel" }, [
            createBaseVNode("div", { class: "panel-title" }, [
              createBaseVNode("div", null, [
                createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("boot")), 1),
                createBaseVNode("p", { class: "muted" }, toDisplayString(t("bootHint")), 1)
              ]),
              createBaseVNode("label", { class: "inline-form" }, [
                createBaseVNode("span", null, toDisplayString(t("bootDevice")), 1),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": ($event) => bootSerial.value = $event
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(usableDevices.value, (device) => {
                    return openBlock(), createElementBlock("option", {
                      key: device.serial,
                      value: device.serial
                    }, toDisplayString(config.deviceAliases[device.serial] || device.model) + " \\u00b7 " + toDisplayString(device.serial), 9);
                  }), 128))
                ], 512), [
                  [vModelSelect, bootSerial.value]
                ])
              ])
            ]),
            createBaseVNode("div", { class: "toolkit-grid" }, [
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("reboot") }, toDisplayString(t("bootReboot")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("recovery") }, toDisplayString(t("bootRecovery")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("bootloader") }, toDisplayString(t("bootBootloader")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("safe-mode") }, toDisplayString(t("bootSafeMode")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("wake") }, toDisplayString(t("bootWake")), 1),
              createBaseVNode("button", { class: "secondary", onClick: () => bootAction("sleep") }, toDisplayString(t("bootSleep")), 1),
              createBaseVNode("button", { class: "danger", onClick: () => bootAction("power-off") }, toDisplayString(t("bootPowerOff")), 1)
            ]),
            createBaseVNode("p", { class: "muted" }, toDisplayString(t("bootSafeModeHint")), 1)
          ])) : activeTab.value === "toolkit" ? (openBlock(), createElementBlock("section", { key: 8, class: "panel" }, [
            createBaseVNode("div", { class: "panel-title" }, [
              createBaseVNode("div", null, [
                createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("toolkit")), 1),
                createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitHint")), 1)
              ]),
              createBaseVNode("label", { class: "inline-form" }, [
                createBaseVNode("span", null, toDisplayString(t("bootDevice")), 1),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": ($event) => toolkitSerial.value = $event
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(usableDevices.value, (device) => {
                    return openBlock(), createElementBlock("option", {
                      key: device.serial,
                      value: device.serial
                    }, toDisplayString(config.deviceAliases[device.serial] || device.model) + " \\u00b7 " + toDisplayString(device.serial), 9);
                  }), 128))
                ], 512), [
                  [vModelSelect, toolkitSerial.value]
                ])
              ])
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("div", { class: "toolkit-section-title" }, toDisplayString(t("toolkitAdbTitle")), 1),
              createBaseVNode("div", { class: "toolkit-row" }, [
                createBaseVNode("button", { class: "secondary compact", onClick: () => adbServerAction("restart") }, toDisplayString(t("restartAdbServer")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => adbServerAction("stop") }, toDisplayString(t("stopAdbServer")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => refreshDevices() }, toDisplayString(t("refresh")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => runToolkitAdb(["devices", "-l"]) }, toDisplayString(t("listDevices")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => runToolkitAdb(["shell", "getprop", "ro.build.version.release"]) }, toDisplayString(t("androidVersion")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => runToolkitAdb(["shell", "dumpsys", "battery"]) }, toDisplayString(t("battery")), 1)
              ])
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("div", { class: "toolkit-section-title" }, toDisplayString(t("toolkitShizukuTitle")), 1),
              createBaseVNode("div", { class: "toolkit-row" }, [
                createBaseVNode("button", { class: "secondary compact", onClick: () => shizukuAction("start") }, toDisplayString(t("toolkitShizukuStart")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => shizukuAction("stop") }, toDisplayString(t("toolkitShizukuStop")), 1),
                createBaseVNode("button", { class: "secondary compact", onClick: () => shizukuAction("status") }, toDisplayString(t("toolkitShizukuStatus")), 1)
              ]),
              createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitShizukuHint")), 1)
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("div", { class: "toolkit-section-title" }, toDisplayString(t("toolkitCommandTitle")), 1),
              createBaseVNode("div", { class: "toolkit-row" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => toolkitCommand.value = $event,
                  placeholder: t("toolkitCommandPlaceholder")
                }, null, 512), [
                  [vModelText, toolkitCommand.value, void 0, { trim: false }]
                ]),
                createBaseVNode("button", {
                  class: "secondary compact",
                  disabled: toolkitBusy.value,
                  onClick: runToolkitCommand
                }, toDisplayString(t("toolkitRun")), 9, ["disabled"])
              ]),
              createBaseVNode("pre", { class: "toolkit-output" }, toDisplayString(toolkitOutput.value || t("toolkitNoOutput")), 1),
              createBaseVNode("div", { class: "toolkit-subtitle" }, toDisplayString(t("toolkitRecent")), 1),
              recentCommands.value.length ? (openBlock(), createElementBlock("div", { key: 0, class: "toolkit-chips" }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(recentCommands.value, (command) => {
                  return openBlock(), createElementBlock("button", {
                    key: command,
                    class: "ghost compact",
                    onClick: () => runRecent(command)
                  }, toDisplayString(command), 1);
                }), 128))
              ])) : createBaseVNode("p", { key: 1, class: "muted" }, toDisplayString(t("toolkitNoCommands")), 1),
              createBaseVNode("div", { class: "toolkit-subtitle" }, toDisplayString(t("toolkitMostUsed")), 1),
              mostUsedCommands.value.length ? (openBlock(), createElementBlock("div", { key: 2, class: "toolkit-chips" }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(mostUsedCommands.value, (command) => {
                  return openBlock(), createElementBlock("button", {
                    key: command,
                    class: "ghost compact",
                    onClick: () => runRecent(command)
                  }, toDisplayString(command) + " (" + toDisplayString(config.toolkit.commandUsage[command] || 0) + ")", 1);
                }), 128))
              ])) : createBaseVNode("p", { key: 3, class: "muted" }, toDisplayString(t("toolkitNoCommands")), 1)
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("label", { class: "toggle" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshEnabled = $event,
                  type: "checkbox"
                }, null, 512), [
                  [vModelCheckbox, config.toolkit.sshEnabled]
                ]),
                createBaseVNode("span", null, toDisplayString(t("toolkitEnableSsh")), 1)
              ]),
              config.toolkit.sshEnabled ? (openBlock(), createElementBlock("div", { key: 0, class: "toolkit-row" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshHost = $event,
                  placeholder: t("toolkitSshHost")
                }, null, 512), [
                  [vModelText, config.toolkit.sshHost, void 0, { trim: true }]
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshLocalPort = $event,
                  type: "number",
                  min: "1",
                  max: "65535"
                }, null, 512), [
                  [vModelText, config.toolkit.sshLocalPort, void 0, { number: true }]
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.sshRemotePort = $event,
                  type: "number",
                  min: "1",
                  max: "65535"
                }, null, 512), [
                  [vModelText, config.toolkit.sshRemotePort, void 0, { number: true }]
                ]),
                createBaseVNode("button", { class: "secondary compact", onClick: () => sshTunnelAction("start") }, toDisplayString(t("toolkitStart")), 1),
                createBaseVNode("button", { class: "ghost compact", onClick: () => sshTunnelAction("stop") }, toDisplayString(t("toolkitStop")), 1),
                createBaseVNode("button", { class: "ghost compact", onClick: () => sshTunnelAction("status") }, toDisplayString(t("toolkitStatus")), 1)
              ])) : createCommentVNode("", true),
              createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitSshHint")), 1)
            ]),
            createBaseVNode("div", { class: "toolkit-section" }, [
              createBaseVNode("label", { class: "toggle" }, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": ($event) => config.toolkit.perInstanceTerminal = $event,
                  type: "checkbox"
                }, null, 512), [
                  [vModelCheckbox, config.toolkit.perInstanceTerminal]
                ]),
                createBaseVNode("span", null, toDisplayString(t("toolkitEnableTerminal")), 1)
              ]),
              config.toolkit.perInstanceTerminal ? (openBlock(), createElementBlock("div", { key: 0, class: "toolkit-row" }, [
                createBaseVNode("button", { class: "secondary compact", onClick: () => openDeviceTerminal() }, toDisplayString(t("toolkitTerminalOpen")), 1)
              ])) : createCommentVNode("", true),
              createBaseVNode("p", { class: "muted" }, toDisplayString(t("toolkitTerminalHint")), 1)
            ])
          ])) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", _hoisted_490, ['''

s = s.replace(anchor, block, 1)
p.write_text(s, encoding='utf-8')
print("panel markup added")
