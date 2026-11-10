#!/usr/bin/env python3
"""Renderer part 5: QR pairing UI."""
P = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-Df8DQ038.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:90]
    s = s.replace(old, new, count)

# 1) i18n
rep('''  showQrPairing: "Show QR code pairing",
  showQrPairingHint: "Adds a QR option under Android 11+. It reads the pairing QR from the device screen over ADB, so no camera is needed. Your manual address/code fields stay exactly as they are.",''',
'''  showQrPairing: "Show QR code pairing",
  showQrPairingHint: "Adds a QR option under Android 11+. The code is generated in this app and scanned with the device camera \\u2014 your manual address/code fields above stay exactly as they are.",
  qrPair: "Pair with QR code",
  qrWaiting: "Waiting\\u2026",
  qrTitle: "Scan with your device",
  qrSubtitle: "On the device: Settings \\u2192 Developer options \\u2192 Wireless debugging \\u2192 Pair device with QR code, then scan the code below.",
  qrWaitingDevice: "Waiting for the device to scan the code\\u2026",
  qrSuccess: "Paired with the device.",
  qrFailed: "QR pairing failed.",''')

# 2) refs
rep('    const dragActive = /* @__PURE__ */ ref(false);',
    '''    const dragActive = /* @__PURE__ */ ref(false);
    const qrModal = /* @__PURE__ */ ref(false);
    const qrInfo = /* @__PURE__ */ ref(null);
    const qrBusy = /* @__PURE__ */ ref(false);
    const qrStatus = /* @__PURE__ */ ref("");''')

# 3) functions
rep('''    function swipeAction(direction) {''',
'''    function drawQrCode(payload) {
      const canvas = document.querySelector(".qr-canvas");
      if (!canvas || !window.qrcode) return;
      const qr = window.qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      const count = qr.getModuleCount();
      const cell = Math.max(2, Math.floor(320 / (count + 8)));
      canvas.width = cell * (count + 8);
      canvas.height = cell * (count + 8);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
          if (qr.isDark(row, col)) ctx.fillRect((col + 4) * cell, (row + 4) * cell, cell, cell);
        }
      }
    }
    async function startQrPairing() {
      if (qrBusy.value) return;
      const serial = controlSerial.value || selectedSerials.value[0] || "";
      if (!serial) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      qrBusy.value = true;
      qrStatus.value = "waiting";
      try {
        const result = await window.scrcpy.startQrPairing(runtimeSnapshot(), serial);
        if (!result?.ok) throw new Error(result?.error?.message || "Unable to start QR pairing.");
        qrInfo.value = result.data;
        qrModal.value = true;
        await nextTick();
        drawQrCode(result.data.payload);
        const waitResult = await window.scrcpy.waitQrPairing(runtimeSnapshot(), serial, result.data.name, result.data.password, 120000);
        if (waitResult?.ok) {
          qrStatus.value = "done";
          toast("success", t("qrSuccess"));
          await refreshDevices();
          await startTrackingDevices();
        } else {
          qrStatus.value = "failed";
          toast("error", `${t("qrFailed")} ${waitResult?.error?.message || ""}`);
        }
      } catch (error) {
        qrStatus.value = "failed";
        toast("error", `${t("qrFailed")} ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        qrBusy.value = false;
      }
    }
    function closeQrModal() {
      qrModal.value = false;
      qrInfo.value = null;
      qrStatus.value = "";
    }
    function swipeAction(direction) {''')

# 4) markup: QR block after the pair form, before legacy-wireless
rep('''                createBaseVNode("div", { class: "legacy-wireless" }, [''',
'''                createBaseVNode("div", { class: "qr-pair" }, [
                  createBaseVNode("label", { class: "inline-check" }, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => config.qrPairing = $event,
                      type: "checkbox"
                    }, null, 512), [
                      [vModelCheckbox, config.qrPairing]
                    ]),
                    createBaseVNode("span", null, toDisplayString(t("showQrPairing")), 1)
                  ]),
                  createBaseVNode("small", { class: "muted qr-hint" }, toDisplayString(t("showQrPairingHint")), 1),
                  config.qrPairing ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    class: "secondary compact",
                    disabled: qrBusy.value || !environment.value?.adb.ok,
                    onClick: startQrPairing
                  }, toDisplayString(qrBusy.value ? t("qrWaiting") : t("qrPair")), 9)) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", { class: "legacy-wireless" }, [''')

# 5) modal before the root close
rep('''        dragActive.value ? (openBlock(), createElementBlock("div", { key: 5, class: "drop-overlay" }, [''',
'''        qrModal.value ? (openBlock(), createElementBlock("div", { key: 6, class: "modal-backdrop" }, [
          createBaseVNode("div", { class: "modal qr-modal", role: "dialog", "aria-modal": "true" }, [
            createBaseVNode("h3", null, toDisplayString(t("qrTitle")), 1),
            createBaseVNode("p", { class: "modal-subtitle" }, toDisplayString(t("qrSubtitle")), 1),
            createBaseVNode("div", { class: "qr-body" }, [
              createBaseVNode("canvas", { class: "qr-canvas", width: "320", height: "320" }, null, 512),
              createBaseVNode("p", { class: "muted qr-status" }, toDisplayString(qrStatus.value === "done" ? t("qrSuccess") : qrStatus.value === "failed" ? t("qrFailed") : t("qrWaitingDevice")), 1)
            ]),
            createBaseVNode("div", { class: "modal-actions" }, [
              createBaseVNode("button", {
                class: "ghost compact",
                onClick: closeQrModal
              }, toDisplayString(t("close")), 1)
            ])
          ])
        ])) : createCommentVNode("", true),
        dragActive.value ? (openBlock(), createElementBlock("div", { key: 5, class: "drop-overlay" }, [''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
