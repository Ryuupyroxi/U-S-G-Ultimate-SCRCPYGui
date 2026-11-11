#!/usr/bin/env python3
"""List checkbox bindings in the renderer bundle and flag duplicates."""
import re, sys, collections

path = sys.argv[1]
s = open(path, encoding="utf-8").read()

# checkbox vmodel bindings: "onUpdate:modelValue": ($event) => EXPR, type: "checkbox"
bindings = re.findall(r'"onUpdate:modelValue": \(\$event\) => (.+?), type: "checkbox"', s)
counts = collections.Counter(b.strip() for b in bindings)

print(f"{path}: {len(bindings)} checkbox bindings, {len(counts)} distinct")
print("\n== bound more than once ==")
for b, n in counts.most_common():
    if n > 1:
        print(f"  {n}x  {b}")

print("\n== all bindings ==")
for b in sorted(counts):
    print(f"  {counts[b]}x  {b}")
