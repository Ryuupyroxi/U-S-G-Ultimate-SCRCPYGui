#!/usr/bin/env python3
"""Make the Android 10- description structurally identical to the Android 11+ one."""
import pathlib
B = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets')

p = B / 'index-Df8DQ038.js'
s = p.read_text(encoding='utf-8')

old_i18n = '  legacyWirelessLabel: "Android 10-: Enable wireless ADB over the USB connection.",'
new_i18n = '  legacyWirelessEyebrow: "Android 10 and below",\n  legacyWirelessLabel: "Enable wireless ADB over the USB connection.",'
assert s.count(old_i18n) == 1
s = s.replace(old_i18n, new_i18n, 1)

old_mark = '''                createBaseVNode("div", { class: "legacy-wireless" }, [
                  createBaseVNode("p", { class: "muted legacy-wireless-label" }, toDisplayString(t("legacyWirelessLabel")), 1),
                  createBaseVNode("div", { class: "legacy-wireless-row" }, ['''
new_mark = '''                createBaseVNode("div", { class: "legacy-wireless" }, [
                  createBaseVNode("div", { class: "panel-title" }, [
                    createBaseVNode("div", null, [
                      createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("legacyWirelessEyebrow")), 1),
                      createBaseVNode("p", { class: "muted" }, toDisplayString(t("legacyWirelessLabel")), 1)
                    ])
                  ]),
                  createBaseVNode("div", { class: "legacy-wireless-row" }, ['''
assert s.count(old_mark) == 1, s.count(old_mark)
s = s.replace(old_mark, new_mark, 1)
p.write_text(s, encoding='utf-8')
print("renderer updated")

c = B / 'index-BTfMtGJj.css'
t = c.read_text(encoding='utf-8')
old_css = '.legacy-wireless { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }'
new_css = '.legacy-wireless { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }.legacy-wireless .panel-title { gap: 0; }'
assert t.count(old_css) == 1
t = t.replace(old_css, new_css, 1)
c.write_text(t, encoding='utf-8')
print("css updated")
