#!/usr/bin/env python3
"""Guard: the main-process script allowlist must cover every renderer preset.

main.js persists only the IDs listed in its SCRCPY_SCRIPTS array (scriptsRecord),
while the renderer renders its own SCRCPY_SCRIPTS list. If the two drift,
preset toggles silently stop persisting across restarts.

Exit code 0 = in sync, 1 = drift.
"""
import re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
main = (root / "main/main.js").read_text(encoding="utf-8")
bundle = (root / "renderer/assets/index-Df8DQ038.js").read_text(encoding="utf-8", errors="replace")


def ids(src, label):
    m = re.search(r"const SCRCPY_SCRIPTS = \[(.*?)\n\];", src, re.S)
    if not m:
        raise SystemExit(f"SCRCPY_SCRIPTS array not found in {label}")
    return re.findall(r'\{ id: "([^"]+)"', m.group(1))


main_ids = ids(main, "main/main.js")
bundle_ids = ids(bundle, "renderer bundle")
missing = [i for i in bundle_ids if i not in main_ids]
extra = [i for i in main_ids if i not in bundle_ids]
print(f"main/main.js: {len(main_ids)} ids, renderer: {len(bundle_ids)} ids")
if missing:
    print("MISSING from main.js (these presets will NOT persist):", ", ".join(missing))
if extra:
    print("EXTRA in main.js (not rendered):", ", ".join(extra))
if missing or extra:
    sys.exit(1)
print("OK: every renderer preset has a main.js allowlist entry.")
