#!/usr/bin/env python3
"""Replace SCRCPY_SCRIPTS with the comprehensive validated preset list."""
import pathlib
B = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets')
p = B / 'index-Df8DQ038.js'
s = p.read_text(encoding='utf-8')

start = s.find('const SCRCPY_SCRIPTS = [')
end = s.find('];', start)
assert start > 0 and end > start
new_block = '''const SCRCPY_SCRIPTS = [
  { id: "gaming", label: "Gaming", args: "--no-mipmaps --no-mouse-hover --raw-key-events --disable-screensaver" },
  { id: "battery-saver", label: "Battery saver", args: "--disable-screensaver --no-clipboard-autosync --no-terminal-title --no-cleanup" },
  { id: "presentation", label: "Presentation", args: "--print-fps --disable-screensaver --no-cleanup" },
  { id: "compatibility", label: "Compatibility", args: "--no-mipmaps --legacy-paste --prefer-text --no-mouse-hover --no-key-repeat" },
  { id: "safe-exit", label: "Safe exit", args: "--pause-on-exit --power-off-on-close" },
  { id: "no-cleanup", label: "No cleanup", args: "--no-cleanup --no-clipboard-autosync" },
  { id: "low-latency", label: "Low latency", args: "--no-mipmaps --no-mouse-hover --raw-key-events --no-downsize-on-error --min-size-alignment=1" },
  { id: "screen-off-timeout", label: "Long screen-off timeout", args: "--screen-off-timeout=1800" },
  { id: "fill-display", label: "Fill display", args: "--render-fit=fill" },
  { id: "black-background", label: "Black background", args: "--background-color=#000000" },
  { id: "rotate-90", label: "Rotate 90 degrees", args: "--angle=90" },
  { id: "force-adb-forward", label: "Force ADB forward", args: "--force-adb-forward" },
  { id: "kill-adb-on-close", label: "Kill ADB on close", args: "--kill-adb-on-close" },
  { id: "no-terminal-title", label: "No terminal title", args: "--no-terminal-title" },
  { id: "print-fps", label: "Print FPS", args: "--print-fps" },
  { id: "require-audio", label: "Require audio", args: "--require-audio" },
  { id: "audio-dup", label: "Duplicate audio", args: "--audio-dup" },
  { id: "no-key-repeat", label: "No key repeat", args: "--no-key-repeat" },
  { id: "no-mouse-hover", label: "No mouse hover", args: "--no-mouse-hover" },
  { id: "raw-key-events", label: "Raw key events", args: "--raw-key-events" },
  { id: "prefer-text", label: "Prefer text", args: "--prefer-text" },
  { id: "legacy-paste", label: "Legacy paste", args: "--legacy-paste" },
  { id: "no-downsize-on-error", label: "No downsize on error", args: "--no-downsize-on-error" },
  { id: "no-clipboard-autosync", label: "No clipboard sync", args: "--no-clipboard-autosync" },
  { id: "disable-screensaver", label: "Disable screensaver", args: "--disable-screensaver" },
  { id: "no-mipmaps", label: "No mipmaps", args: "--no-mipmaps" },
  { id: "no-power-on", label: "No power on", args: "--no-power-on" }
'''
s = s[:start] + new_block + s[end:]
p.write_text(s, encoding='utf-8')
print("SCRCPY_SCRIPTS replaced; presets:", s.count('{ id: "', start, start + len(new_block)))
