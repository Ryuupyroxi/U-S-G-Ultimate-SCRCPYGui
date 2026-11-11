#!/usr/bin/env python3
"""Scan a Vue 3 renderer bundle for vnodes that set patchFlag bit 8 (PROPS)
without passing a dynamicProps array as the next argument.

Vue's patchElement does `for (let i = 0; i < n2.dynamicProps.length; i++)`
whenever `patchFlag & 8`. If dynamicProps is null the render throws
`TypeError: Cannot read properties of null (reading 'length')` from
patchKeyedChildren, which silently kills the subtree on the next re-render.

Hoisted identifiers (`_hoisted_12`) are resolved against their `const` initialiser.

Usage: python3 scripts/scan-patchflags.py <bundle.js> [...]
Exit code 0 = clean, 1 = problems found.
"""
import re
import sys

CALL = re.compile(r"\bcreate(?:Base|Element)?(?:VNode|Block)\s*\(")
HOIST = re.compile(r"\b(_hoisted_\d+)\s*=\s*(\[[^\]]*\])")
PROPS_BIT = 8


def strip_strings(src):
    """Blank out comment and string/template literal contents so their brackets/commas do not count."""
    out, i, n = [], 0, len(src)
    quote = None
    while i < n:
        ch = src[i]
        if quote:
            if ch == "\\":
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch == "/" and i + 1 < n and src[i + 1] == "/":
            end = src.find("\n", i)
            i = n if end < 0 else end
            continue
        if ch == "/" and i + 1 < n and src[i + 1] == "*":
            end = src.find("*/", i + 2)
            i = n if end < 0 else end + 2
            continue
        if ch in "\"'`":
            quote = ch
            i += 1
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def find_calls(src):
    """Yield (offset, call_text) for every create*VNode(...) call, paren-matched."""
    for m in CALL.finditer(src):
        i = m.end()
        depth = 1
        j = i
        while j < len(src) and depth:
            ch = src[j]
            if ch in "([{":
                depth += 1
            elif ch in ")]}":
                depth -= 1
            j += 1
        if depth == 0:
            yield m.start(), src[m.start():j]


def split_args(safe):
    """Split a call's argument text (including the outer parens) on top-level commas."""
    body = safe[safe.index("(") + 1 : -1]
    args, depth, cur = [], 0, ""
    for ch in body:
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        if ch == "," and depth == 0:
            args.append(cur.strip())
            cur = ""
        else:
            cur += ch
    args.append(cur.strip())
    return args


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    bad = 0
    for path in argv:
        src = open(path, encoding="utf-8", errors="replace").read()
        hoists = dict(HOIST.findall(src))
        safe_src = strip_strings(src)
        for offset, call in find_calls(safe_src):
            args = split_args(call)
            if len(args) < 4:
                continue
            flag_arg = args[3]
            if not re.fullmatch(r"\d{1,4}", flag_arg):
                continue
            flag = int(flag_arg)
            if not flag & PROPS_BIT:
                continue
            nxt = args[4] if len(args) > 4 else ""
            ok = nxt.startswith("[")
            if not ok and re.fullmatch(r"_hoisted_\d+", nxt):
                ok = hoists.get(nxt, "").startswith("[")
            if not ok:
                line = src.count("\n", 0, offset) + 1
                snippet = call.splitlines()[0].strip()
                print(f"{path}:{line}: patchFlag {flag} without dynamicProps -> {snippet[:110]}")
                bad += 1
    if bad:
        print(f"\n{bad} vnode(s) with a PROPS patchFlag but no dynamicProps array.")
        return 1
    print(f"clean: {len(argv)} file(s), no PROPS patchFlag without dynamicProps.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
