#!/usr/bin/env python3
"""CSS: top header + collapsible sidebar."""
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-BTfMtGJj.css'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:80]
    s = s.replace(old, new, count)

rep('.app-shell { min-height: 100vh; padding-left: 218px; }',
    '.app-shell { min-height: 100vh; padding-left: 218px; padding-top: 62px; }')

rep('.topbar { position: fixed; z-index: 20; inset: 0 auto 0 0; display: flex; flex-direction: column; width: 218px; padding: 26px 18px 20px; border-right: 1px solid var(--border); background: var(--topbar-bg); backdrop-filter: blur(20px); }',
    '''.app-header { position: fixed; z-index: 30; inset: 0 0 auto 0; display: flex; align-items: center; gap: 14px; height: 62px; padding: 0 20px; border-bottom: 1px solid var(--border); background: var(--topbar-bg); backdrop-filter: blur(20px); }
.app-header .brand { padding: 0; }
.app-header .brand-copy { display: grid; }
.app-header .brand-copy strong { font-size: 14px; letter-spacing: .02em; }
.app-header .brand-copy small { color: var(--text-muted); font-size: 10px; }
.brand-mark-us { width: 34px; height: 34px; border-radius: 10px; font-size: 11px; letter-spacing: -.02em; }
.app-header .top-actions { display: flex; align-items: center; gap: 8px; margin: 0 0 0 auto; }
.app-header .top-actions select { width: auto; min-width: 92px; }
.sidebar-toggle { flex: 0 0 auto; width: 32px; height: 32px; padding: 0; border-radius: 8px; font-size: 14px; line-height: 1; }
.topbar { position: fixed; z-index: 20; top: 62px; bottom: 0; left: 0; display: flex; flex-direction: column; width: 218px; padding: 18px 14px 20px; border-right: 1px solid var(--border); background: var(--topbar-bg); backdrop-filter: blur(20px); transition: transform .18s ease; }
.app-shell.sidebar-collapsed { padding-left: 0; }
.app-shell.sidebar-collapsed .topbar { transform: translateX(-100%); }''')

rep('main { width: min(1120px, calc(100% - 64px)); margin: 0 auto; padding: 40px 0 64px; }',
    'main { width: min(1120px, calc(100% - 64px)); margin: 0 auto; padding: 26px 0 64px; }')

rep('.brand { display: flex; align-items: center; gap: 11px; width: 100%; padding: 0 6px 25px; border: 0; background: transparent; cursor: pointer; text-align: left; }',
    '.brand { display: flex; align-items: center; gap: 11px; width: 100%; padding: 0 6px 25px; border: 0; background: transparent; cursor: pointer; text-align: left; }\n.brand-copy { display: grid; }')

rep('.top-actions { display: grid; gap: 8px; margin-top: auto; }',
    '.top-actions { display: grid; gap: 8px; margin-top: auto; }')

# responsive block
rep('.app-shell { padding-left: 190px; }.topbar { width: 190px; padding-inline: 14px; }',
    '.app-shell { padding-left: 190px; }.app-shell.sidebar-collapsed { padding-left: 0; }.topbar { width: 190px; padding-inline: 14px; }')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
