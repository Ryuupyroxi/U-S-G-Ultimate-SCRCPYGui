#!/usr/bin/env python3
"""Header: logo left, title centred in the window, controls right."""
import pathlib
B = pathlib.Path('renderer/assets')

# --- markup: pull the title out of .brand so it can centre against the header
p = B / 'index-Df8DQ038.js'
s = p.read_text(encoding='utf-8')
old = '''          createBaseVNode("div", { class: "brand" }, [
            createBaseVNode("img", { class: "brand-logo", src: "./assets/logo.png", alt: "", draggable: false }),
            createBaseVNode("span", { class: "brand-copy" }, [
              createBaseVNode("img", { class: "brand-title", src: "./assets/title.png", alt: "UltimateSCRCPYGui", draggable: false }),
              createBaseVNode("small", null, "v" + toDisplayString(version2.value), 1)
            ])
          ]),'''
new = '''          createBaseVNode("div", { class: "brand" }, [
            createBaseVNode("img", { class: "brand-logo", src: "./assets/logo.png", alt: "", draggable: false }),
            createBaseVNode("small", { class: "brand-version" }, "v" + toDisplayString(version2.value), 1)
          ]),
          createBaseVNode("img", { class: "brand-title", src: "./assets/title.png", alt: "UltimateSCRCPYGui", draggable: false }),'''
assert s.count(old) == 1, s.count(old)
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print("markup updated")

# --- css
c = B / 'index-BTfMtGJj.css'
t = c.read_text(encoding='utf-8')
pairs = [
 ('.brand { position: absolute; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 14px; width: auto; padding: 0; }',
  '.brand { display: grid; justify-items: center; gap: 3px; width: auto; padding: 0; }'),
 ('.brand-copy { display: grid; gap: 3px; justify-items: start; }',
  '.brand-version { color: var(--text-subtle); font-size: 10px; }'),
 ('.brand-title { display: block; height: 33px; width: auto; }',
  '.brand-title { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: block; height: 40px; width: auto; }'),
]
for old, new in pairs:
    assert t.count(old) == 1, (t.count(old), old[:60])
    t = t.replace(old, new, 1)
c.write_text(t, encoding='utf-8')
print("css updated")
