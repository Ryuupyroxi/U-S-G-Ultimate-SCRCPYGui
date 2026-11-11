#!/usr/bin/env python3
"""Renderer part 2: Scripts column in Settings > Advanced."""
P = 'renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:100]
    s = s.replace(old, new, count)

# open the two-column wrapper before the first toggle
rep('''                createBaseVNode("label", _hoisted_454, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[147] || (_cache[147] = ($event) => config.muteNotifications = $event),''',
'''                createBaseVNode("div", { class: "toggle-columns" }, [
                createBaseVNode("div", { class: "toggle-col" }, [
                createBaseVNode("label", _hoisted_454, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[147] || (_cache[147] = ($event) => config.muteNotifications = $event),''')

# close the first column and add the scripts column after skipUpdateConfirmation
rep('''                  createBaseVNode("span", null, toDisplayString(t("skipUpdateConfirmation")), 1)
                ]),
                createBaseVNode("div", _hoisted_457, [''',
'''                  createBaseVNode("span", null, toDisplayString(t("skipUpdateConfirmation")), 1)
                ])
                ]),
                createBaseVNode("div", { class: "toggle-col scripts-col" }, [
                  createBaseVNode("p", { class: "eyebrow" }, toDisplayString(t("scripts")), 1),
                  createBaseVNode("p", { class: "muted scripts-hint" }, toDisplayString(t("scriptsHint")), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(SCRCPY_SCRIPTS, (script) => {
                    return openBlock(), createElementBlock("label", { key: script.id, class: "toggle" }, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": ($event) => config.scripts[script.id] = $event,
                        type: "checkbox"
                      }, null, 512), [
                        [vModelCheckbox, config.scripts[script.id]]
                      ]),
                      createBaseVNode("span", { title: script.args }, toDisplayString(script.label), 1)
                    ]);
                  }), 128))
                ])
                ]),
                createBaseVNode("div", _hoisted_457, [''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
