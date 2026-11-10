#!/usr/bin/env python3
"""Renderer part 7: imperative overlay watchers + debug locale."""
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) == 1, "MISS(%d): %s" % (s.count(old), old[:80])
    s = s.replace(old, new, count)

# debug bar: add locale
rep('"nav=" + toDisplayString(config.navBar) + " qr=" + toDisplayString(qrModal.value) + " swipe=" + toDisplayString(config.swipePanel)',
    '"nav=" + toDisplayString(config.navBar) + " qr=" + toDisplayString(qrModal.value) + " swipe=" + toDisplayString(config.swipePanel) + " loc=" + toDisplayString(config.locale)')

# qr backdrop class
rep('''        createBaseVNode("div", {
          class: "modal-backdrop",
          style: { display: qrModal.value ? "flex" : "none" }
        }, [''',
'''        createBaseVNode("div", {
          class: "modal-backdrop qr-backdrop",
          style: { display: qrModal.value ? "flex" : "none" }
        }, [''')

# watchers: insert before onMounted
rep('''    onMounted(async () => {''',
'''    watch(sidebarCollapsed, (value) => {
      document.querySelector(".app-shell")?.classList.toggle("sidebar-collapsed", value);
    }, { immediate: true, flush: "post" });
    watch(() => config.navBar, (value) => {
      const el = document.querySelector(".float-nav-bar");
      if (el) el.style.display = value ? "flex" : "none";
    }, { immediate: true, flush: "post" });
    watch(() => config.swipePanel, (value) => {
      const el = document.querySelector(".float-swipe");
      if (el) el.style.display = value ? "grid" : "none";
    }, { immediate: true, flush: "post" });
    watch(qrModal, (value) => {
      const el = document.querySelector(".qr-backdrop");
      if (el) el.style.display = value ? "flex" : "none";
    }, { immediate: true, flush: "post" });
    watch(dragActive, (value) => {
      const el = document.querySelector(".drop-overlay");
      if (el) el.style.display = value ? "grid" : "none";
    }, { immediate: true, flush: "post" });
    onMounted(async () => {''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
