#!/usr/bin/env python3
"""Rename to UltimateSCRCPYGui + image logo/title in the header."""
import re, json, pathlib

BASE = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar')

def sub_file(path, pairs, must=True):
    p = BASE / path
    s = p.read_text(encoding='utf-8')
    orig = s
    for old, new in pairs:
        n = s.count(old)
        if n == 0 and must:
            raise SystemExit("MISS in %s: %r" % (path, old[:70]))
        s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')
    print("%s: %d -> %d bytes" % (path, len(orig), len(s)))

# 1) renderer markup: images instead of the red square + plain text
sub_file('out/renderer/assets/index-Df8DQ038.js', [
    ('_cache[157] || (_cache[157] = createBaseVNode("span", { class: "brand-mark brand-mark-us" }, "U-S", -1)),',
     'createBaseVNode("img", { class: "brand-logo", src: "./assets/logo.png", alt: "", draggable: false }),'),
    ('_cache[156] || (_cache[156] = createBaseVNode("strong", null, "UltimateSCRCPY", -1)),',
     'createBaseVNode("img", { class: "brand-title", src: "./assets/title.png", alt: "UltimateSCRCPYGui", draggable: false }),'),
], must=False)

# 2) global rename in main + renderer
sub_file('out/main/main.js', [("Ultimate Scrcpy", "UltimateSCRCPYGui")])
sub_file('out/renderer/assets/index-Df8DQ038.js', [("Ultimate Scrcpy", "UltimateSCRCPYGui")])

# 3) package.json identity
pkg = BASE / 'package.json'
d = json.loads(pkg.read_text(encoding='utf-8'))
d['name'] = 'ultimate-scrcpygui'
d['productName'] = 'UltimateSCRCPYGui'
d['description'] = 'UltimateSCRCPYGui - a custom Scrcpy GUI build with one-click wireless ADB for Android 10 and below'
pkg.write_text(json.dumps(d, indent=2) + "\n", encoding='utf-8')
print("package.json updated:", d['name'], '/', d['productName'])

# 4) CSS for the image brand
css = BASE / 'out/renderer/assets/index-BTfMtGJj.css'
s = css.read_text(encoding='utf-8')
add = (".brand-logo { display: block; width: 32px; height: auto; }\n"
       ".brand-title { display: block; height: 25px; width: auto; }\n"
       ".brand-copy { display: grid; gap: 2px; }\n")
s += add
css.write_text(s, encoding='utf-8')
print("css appended")
