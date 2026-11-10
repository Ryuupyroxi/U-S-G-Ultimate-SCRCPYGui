#!/usr/bin/env python3
"""Renderer part 3: top header (U-S + UltimateSCRCPY + version) + collapsible sidebar."""
import re
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

# --- extract blocks ---
brand_start = s.find('          createBaseVNode("button", {\n            class: "brand",')
assert brand_start > 0
brand_end = s.find('          createBaseVNode("nav", _hoisted_3, [', brand_start)
brand = s[brand_start:brand_end]

nav_end = s.find('          createBaseVNode("div", _hoisted_7, [', brand_end)
nav = s[brand_end:nav_end]

ta_end = s.find('        ]),\n        createBaseVNode("main", null, [', nav_end)
topactions = s[nav_end:ta_end]

# --- new brand (U-S + UltimateSCRCPY) ---
new_brand = '''          createBaseVNode("div", { class: "brand" }, [
            _cache[157] || (_cache[157] = createBaseVNode("span", { class: "brand-mark brand-mark-us" }, "U-S", -1)),
            createBaseVNode("span", { class: "brand-copy" }, [
              _cache[156] || (_cache[156] = createBaseVNode("strong", null, "UltimateSCRCPY", -1)),
              createBaseVNode("small", null, "v" + toDisplayString(version2.value), 1)
            ])
          ]),
'''

# --- reindent nav for the aside (keep as-is, indentation is cosmetic) ---
toggle = '''          createBaseVNode("button", {
            class: "icon-button sidebar-toggle",
            type: "button",
            title: t("toggleSidebar"),
            onClick: () => sidebarCollapsed.value = !sidebarCollapsed.value
          }, toDisplayString(sidebarCollapsed.value ? "❯" : "❮"), 1)
'''

replacement = (
    new_brand
    + topactions.rstrip('\n') + ',\n'
    + toggle + '        ]),\n'
    + '        createBaseVNode("aside", _hoisted_2, [\n'
    + nav.rstrip('\n') + '\n'
    + '        ]),\n'
    + '        createBaseVNode("main", null, ['
)

s = s[:brand_start] + replacement + s[ta_end + len('        ]),\n        createBaseVNode("main", null, ['):]

# --- app-shell dynamic class ---
s = s.replace('return openBlock(), createElementBlock("div", _hoisted_1, [\n        createBaseVNode("header", _hoisted_2, [',
              'return openBlock(), createElementBlock("div", normalizeClass(["app-shell", { "sidebar-collapsed": sidebarCollapsed.value }]), [\n        createBaseVNode("header", { class: "app-header" }, [', 1)

# --- ref ---
s = s.replace('    const activeTab = /* @__PURE__ */ ref("devices");',
              '    const activeTab = /* @__PURE__ */ ref("devices");\n    const sidebarCollapsed = /* @__PURE__ */ ref(false);', 1)

# --- i18n ---
s = s.replace('  showSwipePanel: "Show swipe panel (on-screen swipe buttons)",',
              '  toggleSidebar: "Collapse / expand the sidebar",\n  showSwipePanel: "Show swipe panel (on-screen swipe buttons)",', 1)

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
