#!/usr/bin/env python3
"""Renderer part 4: preload pushPaths, swipe/nav float UI, drag-and-drop push."""
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:90]
    s = s.replace(old, new, count)

# 1) i18n
rep('''  toggleSidebar: "Collapse / expand the sidebar",''',
'''  toggleSidebar: "Collapse / expand the sidebar",
  swipePanelLabel: "Swipe",
  navBarLabel: "Navigation",
  dropHint: "Drag and drop files anywhere in this window to copy them to the device.",
  filesPushed: "{count} file(s) copied to the device.",
  pushFailed: "Could not copy the file to the device.",''')

# 2) refs
rep('    const sidebarCollapsed = /* @__PURE__ */ ref(false);',
    '    const sidebarCollapsed = /* @__PURE__ */ ref(false);\n    const dragActive = /* @__PURE__ */ ref(false);')

# 3) drop handler + float actions
rep('''    async function sendControlAction(action) {''',
'''    async function handleWindowDrop(event) {
      const files = [...(event.dataTransfer?.files || [])].map((file) => file.path || "").filter(Boolean);
      if (!files.length) return;
      event.preventDefault();
      dragActive.value = false;
      const target = config.launch.pushTarget.trim() || "/sdcard/Download";
      const serials = workspaceTargets.value.length ? workspaceTargets.value : controlSerial.value ? [controlSerial.value] : [];
      if (!serials.length) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      const result = await window.scrcpy.pushPaths(runtimeSnapshot(), serials, target, "replace", files);
      if (!result?.ok) {
        toast("error", `${t("pushFailed")} ${operationErrorMessage(result, "")}`);
        return;
      }
      toast("success", t("filesPushed").replace("{count}", String(files.length)));
    }
    function swipeAction(direction) {
      void sendControlAction(`swipe-${direction}`);
    }
    async function sendControlAction(action) {''')

# 4) mount listeners
rep('''      document.addEventListener("visibilitychange", handleVisibilityChange);
      handleVisibilityChange();''',
'''      document.addEventListener("visibilitychange", handleVisibilityChange);
      handleVisibilityChange();
      document.addEventListener("dragover", (event) => {
        event.preventDefault();
        dragActive.value = true;
      });
      document.addEventListener("dragleave", (event) => {
        if (event.relatedTarget === null) dragActive.value = false;
      });
      document.addEventListener("drop", handleWindowDrop);''')

# 5) float UI before the root close
rep('''        ])) : createCommentVNode("", true)
      ], 2);
    };''',
'''        ])) : createCommentVNode("", true),
        config.navBar ? (openBlock(), createElementBlock("div", { key: 3, class: "float-nav-bar" }, [
          createBaseVNode("span", { class: "float-label" }, toDisplayString(t("navBarLabel")), 1),
          createBaseVNode("button", {
            class: "float-nav-btn",
            onClick: () => sendControlAction("back")
          }, "‹"),
          createBaseVNode("button", {
            class: "float-nav-btn float-home",
            onClick: () => sendControlAction("home")
          }, "●"),
          createBaseVNode("button", {
            class: "float-nav-btn",
            onClick: () => sendControlAction("app-switch")
          }, "▢")
        ])) : createCommentVNode("", true),
        config.swipePanel ? (openBlock(), createElementBlock("div", { key: 4, class: "float-swipe" }, [
          createBaseVNode("span", { class: "float-label" }, toDisplayString(t("swipePanelLabel")), 1),
          createBaseVNode("button", {
            class: "swipe-btn",
            onClick: () => swipeAction("up")
          }, "↑"),
          createBaseVNode("div", { class: "swipe-mid" }, [
            createBaseVNode("button", {
              class: "swipe-btn",
              onClick: () => swipeAction("left")
            }, "←"),
            createBaseVNode("button", {
              class: "swipe-btn",
              onClick: () => swipeAction("right")
            }, "→")
          ]),
          createBaseVNode("button", {
            class: "swipe-btn",
            onClick: () => swipeAction("down")
          }, "↓")
        ])) : createCommentVNode("", true),
        dragActive.value ? (openBlock(), createElementBlock("div", { key: 5, class: "drop-overlay" }, [
          createBaseVNode("div", { class: "drop-overlay-card" }, toDisplayString(t("dropHint")), 1)
        ])) : createCommentVNode("", true)
      ], 2);
    };''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
