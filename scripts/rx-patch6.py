#!/usr/bin/env python3
"""Renderer part 6: replace conditional root blocks with always-rendered style toggles."""
P = 'renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) == 1, "MISS(%d): %s" % (s.count(old), old[:80])
    s = s.replace(old, new, count)

# nav float
rep('''        config.navBar ? (openBlock(), createElementBlock("div", { key: 3, class: "float-nav-bar" }, [''',
'''        createBaseVNode("div", {
          class: "float-nav-bar",
          style: { display: config.navBar ? "flex" : "none" }
        }, [''')
rep('''          }, "▢")
        ])) : createCommentVNode("", true),
        config.swipePanel ? (openBlock(), createElementBlock("div", { key: 4, class: "float-swipe" }, [''',
'''          }, "▢")
        ], 4),
        createBaseVNode("div", {
          class: "float-swipe",
          style: { display: config.swipePanel ? "grid" : "none" }
        }, [''')

# swipe float close + qr modal
rep('''          }, "↓")
        ])) : createCommentVNode("", true),
        qrModal.value ? (openBlock(), createElementBlock("div", { key: 6, class: "modal-backdrop" }, [''',
'''          }, "↓")
        ], 4),
        createBaseVNode("div", {
          class: "modal-backdrop",
          style: { display: qrModal.value ? "flex" : "none" }
        }, [''')

# qr modal close + drop overlay
rep('''          ])
        ])) : createCommentVNode("", true),
        dragActive.value ? (openBlock(), createElementBlock("div", { key: 5, class: "drop-overlay" }, [
          createBaseVNode("div", { class: "drop-overlay-card" }, toDisplayString(t("dropHint")), 1)
        ])) : createCommentVNode("", true)
      ]);''',
'''          ])
        ], 4),
        createBaseVNode("div", {
          class: "drop-overlay",
          style: { display: dragActive.value ? "grid" : "none" }
        }, [
          createBaseVNode("div", { class: "drop-overlay-card" }, toDisplayString(t("dropHint")), 1)
        ], 4)
      ]);''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
