#!/usr/bin/env python3
"""Add QR pairing cancel: main flag, preload bridge, renderer wiring."""
MP = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/main/main.js'
s = open(MP, encoding='utf-8').read()

def rep(s, old, new):
    assert s.count(old) == 1, "MISS(%d): %s" % (s.count(old), old[:80])
    return s.replace(old, new, 1)

s = rep(s, '''handle("device:qr-pair-wait", async (_event, runtime, serial, name, password, timeoutMs = 90000) => {''',
'''const qrPairCancellations = /* @__PURE__ */ new Set();
handle("device:qr-pair-cancel", (_event, name) => {
  if (typeof name === "string" && name) qrPairCancellations.add(name);
  return Promise.resolve({ ok: true, data: { cancelled: true } });
});
handle("device:qr-pair-wait", async (_event, runtime, serial, name, password, timeoutMs = 90000) => {''')

s = rep(s, '''  while (Date.now() < deadline) {
    let services = "";''',
'''  while (Date.now() < deadline) {
    if (qrPairCancellations.has(name)) {
      qrPairCancellations.delete(name);
      return { ok: true, data: { serial: validatedSerial, cancelled: true } };
    }
    let services = "";''')
open(MP, 'w', encoding='utf-8').write(s)
print("main patched")

# preload
PP = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/preload/preload.js'
t = open(PP, encoding='utf-8').read()
old = '  waitQrPairing: (runtime, serial, name, password, timeout) => electron.ipcRenderer.invoke("device:qr-pair-wait", runtime, serial, name, password, timeout),'
assert t.count(old) == 1
t = t.replace(old, old + '\n  cancelQrPairing: (name) => electron.ipcRenderer.invoke("device:qr-pair-cancel", name),', 1)
open(PP, 'w', encoding='utf-8').write(t)
print("preload patched")

# renderer
RP = '/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets/index-Df8DQ038.js'
u = open(RP, encoding='utf-8').read()
old2 = '''    function closeQrModal() {
      qrModal.value = false;
      qrInfo.value = null;
      qrStatus.value = "";
    }'''
new2 = '''    function closeQrModal() {
      const name = qrInfo.value?.name;
      qrModal.value = false;
      qrInfo.value = null;
      qrStatus.value = "";
      if (name) void window.scrcpy.cancelQrPairing(name);
    }'''
assert u.count(old2) == 1
u = u.replace(old2, new2, 1)

old3 = '''        if (waitResult?.ok) {
          qrStatus.value = "done";
          toast("success", t("qrSuccess"));'''
new3 = '''        if (waitResult?.ok && waitResult?.data?.cancelled) {
          closeQrModal();
          return;
        }
        if (waitResult?.ok) {
          qrStatus.value = "done";
          toast("success", t("qrSuccess"));'''
assert u.count(old3) == 1
u = u.replace(old3, new3, 1)
open(RP, 'w', encoding='utf-8').write(u)
print("renderer patched")
