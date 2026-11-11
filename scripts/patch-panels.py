#!/usr/bin/env python3
"""UltimateSCRCPYGui: add Settings > Panels (sidebar order + visibility)."""
import re, sys, pathlib

APP = pathlib.Path(".")
MAIN = APP / "main/main.js"
RENDER = APP / "renderer/assets/index-Df8DQ038.js"
CSS = APP / "renderer/assets/index-BTfMtGJj.css"

def patch(path, repls):
    s = path.read_text(encoding="utf-8")
    for old, new, cnt in repls:
        n = s.count(old)
        if n != cnt:
            sys.exit(f"ANCHOR FAIL ({path.name}): found {n}, expected {cnt}\n---\n{old[:300]}")
        s = s.replace(old, new)
    path.write_text(s, encoding="utf-8")
    print(f"patched {path.name}: {len(repls)} edits")

# ---------------------------------------------------------------- main.js
PANEL_HELPERS = '''const PANEL_IDS = ["devices", "boot", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"];
const panelIds = /* @__PURE__ */ new Set(PANEL_IDS);
function panelOrderValue(value, fallback) {
  const base = Array.isArray(fallback) ? fallback.slice() : PANEL_IDS.slice();
  if (!Array.isArray(value)) return base;
  const seen = /* @__PURE__ */ new Set();
  const ordered = [];
  for (const item of value) {
    if (typeof item !== "string" || seen.has(item) || !panelIds.has(item)) continue;
    seen.add(item);
    ordered.push(item);
  }
  for (const id of PANEL_IDS) if (!seen.has(id)) ordered.push(id);
  return ordered;
}
function panelVisibilityValue(value, fallback) {
  const base = fallback && typeof fallback === "object" && !Array.isArray(fallback) ? fallback : {};
  const source = object(value === void 0 || value === null ? {} : value, "panelVisibility");
  const result = {};
  for (const id of PANEL_IDS) result[id] = source[id] === void 0 ? base[id] !== false : strictBoolean(source[id], `panelVisibility.${id}`);
  return result;
}
'''

main_repls = [
    # 1. helpers next to the theme helpers
    ('return "light";\n}\nconst SCRCPY_SCRIPTS = [',
     'return "light";\n}\n' + PANEL_HELPERS + 'const SCRCPY_SCRIPTS = [', 1),
    # 2. defaultPersistedConfig
    ('    qrPairing: false,\n    scripts: {},',
     '    qrPairing: false,\n    panelOrder: PANEL_IDS.slice(),\n    panelVisibility: { devices: true, boot: true, toolkit: true, automations: true, sessions: true, artifacts: true, settings: true, logs: true },\n    scripts: {},', 1),
    # 3. configView
    ('    qrPairing: config.appearance.qrPairing,\n    scripts: config.defaults.scripts,',
     '    qrPairing: config.appearance.qrPairing,\n    panelOrder: config.appearance.panelOrder,\n    panelVisibility: config.appearance.panelVisibility,\n    scripts: config.defaults.scripts,', 1),
    # 4. validatePersistedConfig
    ('    qrPairing: strictBoolean(source.qrPairing, "config.qrPairing"),\n    update: updateSection(source.update, "config.update")',
     '    qrPairing: strictBoolean(source.qrPairing, "config.qrPairing"),\n    panelOrder: panelOrderValue(source.panelOrder),\n    panelVisibility: panelVisibilityValue(source.panelVisibility),\n    update: updateSection(source.update, "config.update")', 1),
    # 5. safeLegacyConfig
    ('      qrPairing: accept(() => strictBoolean(candidate.qrPairing, "legacy.qrPairing"), defaults.qrPairing),\n      scripts: accept(() => scriptsRecord(candidate.scripts, "legacy.scripts"), defaults.scripts),',
     '      qrPairing: accept(() => strictBoolean(candidate.qrPairing, "legacy.qrPairing"), defaults.qrPairing),\n      panelOrder: accept(() => panelOrderValue(candidate.panelOrder), defaults.panelOrder),\n      panelVisibility: accept(() => panelVisibilityValue(candidate.panelVisibility), defaults.panelVisibility),\n      scripts: accept(() => scriptsRecord(candidate.scripts, "legacy.scripts"), defaults.scripts),', 1),
    # 6. configFromView
    ('accentReversed: view.accentReversed, swipePanel: view.swipePanel, navBar: view.navBar, qrPairing: view.qrPairing },',
     'accentReversed: view.accentReversed, swipePanel: view.swipePanel, navBar: view.navBar, qrPairing: view.qrPairing, panelOrder: view.panelOrder, panelVisibility: view.panelVisibility },', 1),
    # 7. validateAppConfigV3
    ('qrPairing: strictBoolean(appearance.qrPairing, "configV3.appearance.qrPairing") },',
     'qrPairing: strictBoolean(appearance.qrPairing, "configV3.appearance.qrPairing"), panelOrder: panelOrderValue(appearance.panelOrder), panelVisibility: panelVisibilityValue(appearance.panelVisibility) },', 1),
    # 8. fix latent AppImage offset bug: Buffer.indexOf's 3rd arg is encoding, not length
    ('    const index = buffer.indexOf("hsqs", 0, bytesRead);',
     '    const index = buffer.subarray(0, bytesRead).indexOf("hsqs");', 1),
]
patch(MAIN, main_repls)

# ---------------------------------------------------------------- renderer
SETUP_BLOCK = '''    const panelOrderDefault = ["devices", "boot", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"];
    const panelVisibilityDefault = { devices: true, boot: true, toolkit: true, automations: true, sessions: true, artifacts: true, settings: true, logs: true };
    const visibleTabs = computed(() => (Array.isArray(config.panelOrder) && config.panelOrder.length ? config.panelOrder : panelOrderDefault).filter((tab) => config.panelVisibility?.[tab] !== false));
    watch(visibleTabs, (tabs) => {
      if (!tabs.includes(activeTab.value)) activeTab.value = tabs[0] || "devices";
    }, { immediate: true });
    const panelDragging = ref(null);
    const panelDragOver = ref(null);
    function panelDragStart(tab, event) {
      panelDragging.value = tab;
      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        try {
          event.dataTransfer.setData("text/plain", tab);
        } catch {
        }
      }
    }
    function panelDragEnter(tab, event) {
      if (!panelDragging.value) return;
      event?.preventDefault();
      if (event?.dataTransfer) event.dataTransfer.dropEffect = "move";
      panelDragOver.value = tab;
    }
    function panelDropOn(tab, event) {
      event?.preventDefault();
      const source = panelDragging.value || (event?.dataTransfer?.getData("text/plain") || "");
      panelDragging.value = null;
      panelDragOver.value = null;
      if (!source || source === tab) return;
      const order = (Array.isArray(config.panelOrder) && config.panelOrder.length ? config.panelOrder : panelOrderDefault).slice();
      const from = order.indexOf(source);
      const to = order.indexOf(tab);
      if (from < 0 || to < 0) return;
      order.splice(from, 1);
      order.splice(to, 0, source);
      config.panelOrder = order;
    }
    function panelDragEnd() {
      panelDragging.value = null;
      panelDragOver.value = null;
    }
    function togglePanelVisibility(tab, event) {
      const next = { ...(config.panelVisibility || panelVisibilityDefault) };
      next[tab] = !!event?.target?.checked;
      config.panelVisibility = next;
    }
    function resetPanelOrder() {
      config.panelOrder = panelOrderDefault.slice();
      config.panelVisibility = { ...panelVisibilityDefault };
      toast("success", t("panelOrderReset"));
    }
'''

SECTION = '''              activeSettingsSection.value === "panels" ? (openBlock(), createElementBlock("section", { key: 7, class: "panel settings-section wide" }, [
                createBaseVNode("h2", null, toDisplayString(t("panels")), 1),
                createBaseVNode("p", { class: "muted" }, toDisplayString(t("panelsHint")), 1),
                createBaseVNode("div", { class: "panel-order-list" }, [
                  (openBlock(), createElementBlock(Fragment, null, renderList(visibleTabs.value, (tab) => {
                    return createBaseVNode("div", {
                      key: tab,
                      class: normalizeClass(["panel-order-item", { dragging: panelDragging.value === tab, "drop-target": panelDragOver.value === tab }]),
                      draggable: "true",
                      onDragstart: ($event) => panelDragStart(tab, $event),
                      onDragenter: ($event) => panelDragEnter(tab, $event),
                      onDragover: ($event) => panelDragEnter(tab, $event),
                      onDrop: ($event) => panelDropOn(tab, $event),
                      onDragend: panelDragEnd
                    }, [
                      createBaseVNode("span", { class: "drag-handle" }, "\\u283f", 1),
                      createBaseVNode("span", { class: "panel-order-label" }, toDisplayString(t(tab)), 1),
                      createBaseVNode("label", { class: "toggle panel-visibility" }, [
                        createBaseVNode("input", {
                          type: "checkbox",
                          checked: config.panelVisibility?.[tab] !== false,
                          onChange: ($event) => togglePanelVisibility(tab, $event)
                        }, null, 8, ["checked", "onChange"]),
                        createBaseVNode("span", null, toDisplayString(t("showPanel")), 1)
                      ])
                    ], 10, ["onDragstart", "onDragenter", "onDragover", "onDrop", "onDragend"]);
                  }), 64))
                ]),
                createBaseVNode("div", { class: "button-row" }, [
                  createBaseVNode("button", { class: "ghost compact", onClick: resetPanelOrder }, toDisplayString(t("resetPanelOrder")), 1)
                ])
              ])) : createCommentVNode("", true)'''

render_repls = [
    # 1. defaultPersistedConfig
    ('    qrPairing: false,\n    scripts: {},',
     '    qrPairing: false,\n    panelOrder: ["devices", "boot", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"],\n    panelVisibility: { devices: true, boot: true, toolkit: true, automations: true, sessions: true, artifacts: true, settings: true, logs: true },\n    scripts: {},', 1),
    # 2. settingsSections + setup block
    ('    const settingsSections = ["general", "video", "controls", "recording", "geometry", "advanced"];',
     '    const settingsSections = ["general", "video", "controls", "recording", "geometry", "advanced", "panels"];\n' + SETUP_BLOCK, 1),
    # 3. sidebar renderList
    ('renderList(["devices", "boot", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"], (tab) => {',
     'renderList(visibleTabs.value, (tab) => {', 1),
    # 3b. sidebar fragment: non-keyed -> keyed, so a dynamic list patches correctly
    ('], 10, _hoisted_4);\n            }), 64))',
     '], 10, _hoisted_4);\n            }), 128))', 1),
    # 4. settings section markup, appended to the _hoisted_393 array
    ('              ])) : createCommentVNode("", true)\n            ])\n          ], 64)) : activeTab.value === "logs" ? (',
     '              ])) : createCommentVNode("", true),\n' + SECTION + '\n            ])\n          ], 64)) : activeTab.value === "logs" ? (', 1),
    # 4b. panels fragment: non-keyed -> keyed (fixes patchEvent on null el)
    ('}), 64))\n                ]),\n                createBaseVNode("div", { class: "button-row" }',
     '}), 128))\n                ]),\n                createBaseVNode("div", { class: "button-row" }', 1),
    # 5. i18n - en
    ('  settingsSection_advanced: "Advanced",\n',
     '  settingsSection_advanced: "Advanced",\n  settingsSection_panels: "Panels",\n  panels: "Panels",\n  panelsHint: "Drag panels to reorder the sidebar. Untick a panel to hide it from the sidebar.",\n  showPanel: "Show",\n  resetPanelOrder: "Reset order",\n  panelOrderReset: "Sidebar order restored.",\n', 1),
    # 6. i18n - zhCN
    ('  settingsSection_advanced: "高级",\n',
     '  settingsSection_advanced: "高级",\n  settingsSection_panels: "面板",\n  panels: "面板",\n  panelsHint: "拖拽面板可调整侧边栏顺序。取消勾选即可在侧边栏中隐藏该面板。",\n  showPanel: "显示",\n  resetPanelOrder: "重置顺序",\n  panelOrderReset: "侧边栏顺序已恢复。",\n', 1),
]
patch(RENDER, render_repls)

# ---------------------------------------------------------------- css
css = CSS.read_text(encoding="utf-8")
css += '''
/* Settings > Panels: sidebar order + visibility */
.panel-order-list { display: grid; gap: 7px; }
.panel-order-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-subtle); cursor: grab; transition: border-color .15s ease, box-shadow .15s ease, opacity .15s ease; }
.panel-order-item:hover { border-color: var(--border-hover); }
.panel-order-item.dragging { opacity: .45; cursor: grabbing; }
.panel-order-item.drop-target { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.panel-order-item .drag-handle { color: var(--text-faint); font-size: 13px; user-select: none; }
.panel-order-item .panel-order-label { flex: 1; font-weight: 600; }
.panel-order-item .toggle { min-height: 0; }
'''
CSS.write_text(css, encoding="utf-8")
print("patched CSS")

print("OK")
