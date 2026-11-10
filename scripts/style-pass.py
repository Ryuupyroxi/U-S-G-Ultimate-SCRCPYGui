#!/usr/bin/env python3
"""Styling pass: more contrast, bolder borders, slightly bolder type."""
import pathlib
p = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-BTfMtGJj.css')
s = p.read_text(encoding='utf-8')
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:70]
    s = s.replace(old, new, count)

# 1) borders darker / more solid
rep('  --border: #e3e6e9; --border-strong: #d9dde2; --border-hover: #c8ccd2;',
    '  --border: #d2d7de; --border-strong: #bfc6cf; --border-hover: #a6adb7;')
rep('  --divider: #eceef1; --border-dashed: #d4d8dd;',
    '  --divider: #dfe3e8; --border-dashed: #c3c9d1;')
rep('  --neutral: #eef0f2; --neutral-2: #eceef1;',
    '  --neutral: #e5e8ec; --neutral-2: #dde1e6;')

# 2) text a touch darker for contrast
rep('--text-muted: #6d737b;', '--text-muted: #5c626b;')
rep('--text-subtle: #858b93;', '--text-subtle: #737983;')
rep('--text-faint: #a4a9b0;', '--text-faint: #8f959e;')

# 3) background slightly deeper so white panels separate
rep('  --bg: #f5f6f8; --bg-subtle: #fafbfc; --bg-soft: #f8f9fa; --panel: #fff;',
    '  --bg: #edeef1; --bg-subtle: #f7f8fa; --bg-soft: #f4f5f7; --panel: #fff;')

# 4) bolder type
rep('body { margin: 0; min-width: 880px; min-height: 100vh; background: var(--bg); }',
    'body { margin: 0; min-width: 880px; min-height: 100vh; background: var(--bg); font-weight: 500; letter-spacing: .002em; }')

# 5) bolder borders on panels, cards and controls (box-sizing is border-box, so no reflow)
s += '''
/* bolder, more solid borders */
.panel, .scene-choice, .app-row, .overview-grid > div, .file-action-card, .group-card,
.automation-step-row, .step-builder, .v4l2-fields, .batch-result, .active-batch,
.diagnostic-files, .diagnostic-redactions, .preflight-table-wrap, .artifact-card,
.session-card, .workspace-pane, .import-step-list li, .settings-section,
.preflight-table th, .preflight-table td, .toggle, .modal, .toast, .app-header, .topbar,
button, input, select, textarea, .capability-pill, .app-badge, .session-state,
.artifact-status, .preflight-status, .device-options input, .device-options select,
.scene-form-card, .automation-editor, .automation-library, .batch-console, .groups-panel {
  border-width: 1.5px;
}
h1, h2, h3, h4, .panel-title, .brand-copy strong { font-weight: 700; }
'''
p.write_text(s, encoding='utf-8')
print("changed:", s != orig, "| delta:", len(s) - len(orig))
