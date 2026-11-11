#!/usr/bin/env python3
"""Validate the Toolkit script presets against scrcpy --help and the GUI's
managed-flag list.

Presets are read from the renderer bundle (the single source of truth for what
the Toolkit renders); the managed flags come from main/main.js. A preset flag
that scrcpy does not know, or that the GUI already owns, is a problem: the GUI
would either pass an invalid flag or fight the preset.

Usage: python3 scripts/validate-scripts.py
Exit code 0 = clean, 1 = problems.
"""
import re, subprocess, pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent
bundle_path = root / "renderer/assets/index-Df8DQ038.js"
main_path = root / "main/main.js"

scrcpy = None
for candidate in (root / "resources/scrcpy/scrcpy",
                  pathlib.Path("/home/Ryuu/Applications/Ultimate-Scrcpy/resources/scrcpy/scrcpy")):
    if candidate.exists():
        scrcpy = candidate
        break
if scrcpy is None:
    raise SystemExit("scrcpy binary not found (run scripts/prepare-resources.mjs first)")

help_text = subprocess.run([str(scrcpy), "--help"], capture_output=True, text=True).stdout
valid = set(re.findall(r"^\s+(?:-[a-zA-Z], )?(--[a-z0-9-]+)", help_text, re.M))

main = main_path.read_text(encoding="utf-8")
managed = set(re.findall(r'flag: "([^"]+)"', main))
managed |= set(re.findall(r'\["(--[a-z0-9-]+)",', main))
managed |= {"--serial", "-s", "--no-playback", "--no-window", "--window-y", "--window-height"}
known_keys = set(re.findall(r'\{ key: "([^"]+)"', main))
known_keys |= set(re.findall(r'flag: "[^"]+",\s*[^,]+,\s*"([A-Za-z0-9_]+)"', main))
known_keys |= {"audio", "audioDup", "rotation90", "borderless", "turnScreenOff", "stayAwake",
               "fullscreen", "audioSource", "recordEnabled", "videoEncoder", "videoCodec",
               "audioCodec", "audioEncoder", "mouseMode", "keyboardMode", "shortcutModifier"}

src = bundle_path.read_text(encoding="utf-8", errors="replace")
m = re.search(r"const SCRCPY_SCRIPTS = \[(.*?)\n\];", src, re.S)
if not m:
    raise SystemExit("SCRCPY_SCRIPTS array not found in the renderer bundle")
body = m.group(1)
presets = re.findall(r'\{ id: "([^"]+)", label: "([^"]+)", desc: "(?:[^"\\]|\\.)*", (args: "(?:[^"\\]|\\.)*"|set: \{[^}]*\}) \}', body)

bad = []
for pid, label, tail in presets:
    if tail.startswith("args:"):
        args = tail[len("args: "):].strip().strip('"')
        for tok in args.split():
            flag = tok.split("=")[0]
            if flag not in valid:
                bad.append((pid, tok, "NOT IN scrcpy --help"))
            elif flag in managed:
                bad.append((pid, tok, "MANAGED by GUI"))
    else:
        sett = tail[len("set: "):].strip().strip("{}")
        for key in re.findall(r'([A-Za-z0-9_]+):', sett):
            if key not in known_keys:
                bad.append((pid, key, "UNKNOWN launch key"))

print(f"presets checked: {len(presets)}")
if bad:
    print("PROBLEMS:")
    for b in bad:
        print("  ", b)
    sys.exit(1)
print("all preset flags valid, unmanaged, and all set keys known")
