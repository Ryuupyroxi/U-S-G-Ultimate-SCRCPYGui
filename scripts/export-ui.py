#!/usr/bin/env python3
"""Add the export UI to Settings > General + the exportConfigAs() helper."""
import pathlib
B = pathlib.Path('renderer/assets')
p = B / 'index-Df8DQ038.js'
s = p.read_text(encoding='utf-8')

# 1) helper next to previewSelected
anchor = '''    function sceneSupported(scene) {'''
assert s.count(anchor) == 1
helper = '''    async function exportConfigAs(format) {
      try {
        const base = selectedSerials.value.length ? selectedSerials.value : controlSerial.value ? [controlSerial.value] : [];
        const launches = base.map((serial) => {
          const profileId = config.deviceProfiles[serial];
          const profile = profileId ? config.profiles.find((item) => item.id === profileId) : void 0;
          const baseLaunch = config.launch.scene === "record-only" ? config.launch : profile?.launch || config.launch;
          return {
            serial,
            launch: launchSnapshot(serial),
            source: profile && config.launch.scene !== "record-only" ? "profile" : "global",
            profileName: profile?.name,
            deviceWindowTitleOverride: Boolean(config.deviceAliases[serial]?.trim() && !baseLaunch.windowTitle.trim())
          };
        });
        const result = await window.scrcpy.exportConfig(format, structuredClone(/* @__PURE__ */ toRaw(config)), launches);
        if (!result?.ok) {
          toast("error", `${t("configExportFailed")} ${result?.error?.message || ""}`);
          return;
        }
        toast("success", t("configExported").replace("{path}", result.data.path));
      } catch (error) {
        toast("error", `${t("configExportFailed")} ${error instanceof Error ? error.message : String(error)}`);
      }
    }
'''
s = s.replace(anchor, helper + anchor, 1)

# 2) UI block at the end of the General section
ui_anchor = '''                    ])
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "video"'''
assert s.count(ui_anchor) == 1, s.count(ui_anchor)
ui_block = '''                    ])
                  ])
                ]),
                createBaseVNode("div", { class: "panel settings-section wide export-section" }, [
                  createBaseVNode("div", { class: "panel-title" }, [
                    createBaseVNode("div", null, [
                      createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("exportConfig")), 1),
                      createBaseVNode("p", { class: "muted" }, toDisplayString(t("exportConfigHint")), 1)
                    ]),
                    createBaseVNode("div", { class: "button-row" }, [
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("json")
                      }, toDisplayString(t("exportJson")), 1),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("sh")
                      }, toDisplayString(t("exportShell")), 1),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("bat")
                      }, toDisplayString(t("exportBatch")), 1),
                      createBaseVNode("button", {
                        class: "secondary compact",
                        onClick: () => exportConfigAs("command")
                      }, toDisplayString(t("exportCommand")), 1)
                    ])
                  ])
                ])
              ])) : createCommentVNode("", true),
              activeSettingsSection.value === "video"'''
s = s.replace(ui_anchor, ui_block, 1)
p.write_text(s, encoding='utf-8')
print("export UI added")
