#!/usr/bin/env python3
"""Validate the proposed script preset flags against scrcpy --help and the managed-flag list."""
import re, subprocess, pathlib

SCRCPY = '/home/Ryuu/Applications/Ultimate-Scrcpy/resources/scrcpy/scrcpy'
help_text = subprocess.run([SCRCPY, '--help'], capture_output=True, text=True).stdout
valid = set(re.findall(r'^\s+(?:-[a-zA-Z], )?(--[a-z0-9-]+)', help_text, re.M))

main = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/main/main.js').read_text()
managed = set(re.findall(r'flag: "([^"]+)"', main))
managed |= set(re.findall(r'\["(--[a-z0-9-]+)",', main))
managed |= {'--serial', '-s', '--no-playback', '--no-window', '--window-y', '--window-height'}

SCRIPTS = [
    ("gaming", "Gaming", "--no-mipmaps --no-mouse-hover --raw-key-events --disable-screensaver"),
    ("battery-saver", "Battery saver", "--disable-screensaver --no-clipboard-autosync --no-terminal-title --no-cleanup"),
    ("presentation", "Presentation", "--print-fps --disable-screensaver --no-cleanup"),
    ("compatibility", "Compatibility", "--no-mipmaps --legacy-paste --prefer-text --no-mouse-hover --no-key-repeat"),
    ("safe-exit", "Safe exit", "--pause-on-exit --power-off-on-close"),
    ("no-cleanup", "No cleanup", "--no-cleanup --no-clipboard-autosync"),
    ("low-latency", "Low latency", "--no-mipmaps --no-mouse-hover --raw-key-events --no-downsize-on-error --min-size-alignment=1"),
    ("screen-off-timeout", "Long screen-off timeout", "--screen-off-timeout=1800"),
    ("fill-display", "Fill display", "--render-fit=fill"),
    ("black-background", "Black background", "--background-color=#000000"),
    ("rotate-90", "Rotate 90 degrees", "--angle=90"),
    ("force-adb-forward", "Force ADB forward", "--force-adb-forward"),
    ("kill-adb-on-close", "Kill ADB on close", "--kill-adb-on-close"),
    ("no-terminal-title", "No terminal title", "--no-terminal-title"),
    ("print-fps", "Print FPS", "--print-fps"),
    ("require-audio", "Require audio", "--require-audio"),
    ("audio-dup", "Duplicate audio", "--audio-dup"),
    ("no-key-repeat", "No key repeat", "--no-key-repeat"),
    ("no-mouse-hover", "No mouse hover", "--no-mouse-hover"),
    ("raw-key-events", "Raw key events", "--raw-key-events"),
    ("prefer-text", "Prefer text", "--prefer-text"),
    ("legacy-paste", "Legacy paste", "--legacy-paste"),
    ("no-downsize-on-error", "No downsize on error", "--no-downsize-on-error"),
    ("no-clipboard-autosync", "No clipboard sync", "--no-clipboard-autosync"),
    ("disable-screensaver", "Disable screensaver", "--disable-screensaver"),
    ("no-mipmaps", "No mipmaps", "--no-mipmaps"),
    ("no-power-on", "No power on", "--no-power-on"),
]

bad = []
for sid, label, args in SCRIPTS:
    for tok in args.split():
        flag = tok.split('=')[0]
        if flag not in valid:
            bad.append((sid, tok, 'NOT IN scrcpy --help'))
        elif flag in managed:
            bad.append((sid, tok, 'MANAGED by GUI'))
print("total presets:", len(SCRIPTS))
if bad:
    print("PROBLEMS:")
    for b in bad: print("  ", b)
else:
    print("all flags valid and unmanaged")
