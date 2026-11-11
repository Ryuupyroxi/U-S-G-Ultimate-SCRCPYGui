#!/usr/bin/env python3
"""Main: QR pairing handlers (start + wait/pair)."""
P = 'main/main.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:90]
    s = s.replace(old, new, count)

rep('''handle("device:sdk", (_event, runtime, serial) => deviceSdk(runtimeConfig(runtime), deviceSerial(serial)));''',
'''handle("device:sdk", (_event, runtime, serial) => deviceSdk(runtimeConfig(runtime), deviceSerial(serial)));
handle("device:qr-pair-start", (_event, runtime, serial) => {
  const validatedSerial = deviceSerial(serial);
  const name = `ultimate-${node_crypto.randomBytes(4).toString("hex")}`;
  const password = node_crypto.randomBytes(9).toString("hex");
  const payload = `WIFI:T:ADB;S:${name};P:${password};;`;
  return Promise.resolve({ ok: true, data: { serial: validatedSerial, name, password, payload } });
});
function mdnsServiceAddress(services, name) {
  const line = services.split(/\\r?\\n/).map((entry) => entry.trim()).find((entry) => entry.includes(name));
  if (!line) return "";
  const parts = line.split(/\\s+/).filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 1] : "";
}
handle("device:qr-pair-wait", async (_event, runtime, serial, name, password, timeoutMs = 90000) => {
  const validatedRuntime = runtimeConfig(runtime);
  const validatedSerial = deviceSerial(serial);
  const deadline = Date.now() + Math.min(Math.max(Number(timeoutMs) || 90000, 5000), 180000);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  while (Date.now() < deadline) {
    let services = "";
    try {
      const result = await adbCommand(validatedRuntime, ["mdns", "services"]);
      services = `${result.stdout}\\n${result.stderr}`;
    } catch {
    }
    const address = mdnsServiceAddress(services, name);
    if (address) {
      const pairResult = await adbCommand(validatedRuntime, ["pair", address, password]);
      const output = `${pairResult.stdout}\\n${pairResult.stderr}`.trim();
      if (!/Pairing successful|Successfully paired|already paired/i.test(output)) {
        return operationFailure("QR_PAIR_FAILED", "qr-pair", "adb pair failed.", {
          detail: output || void 0,
          retryable: true,
          suggestedActions: ["Generate a new QR code and scan it again."]
        });
      }
      let connectAddress = "";
      const connectDeadline = Date.now() + 15000;
      while (Date.now() < connectDeadline) {
        try {
          const listed = await adbCommand(validatedRuntime, ["mdns", "services"]);
          const text = `${listed.stdout}\\n${listed.stderr}`;
          const connectLine = text.split(/\\r?\\n/).map((entry) => entry.trim()).find((entry) => /_adb-tls-connect\\.tcp|_adb\\.tcp/.test(entry));
          if (connectLine) {
            const parts = connectLine.split(/\\s+/).filter(Boolean);
            connectAddress = parts.length >= 3 ? parts[parts.length - 1] : "";
            if (connectAddress) break;
          }
        } catch {
        }
        await sleep(1500);
      }
      if (connectAddress) {
        const connectResult = await adbCommand(validatedRuntime, ["connect", connectAddress]);
        const connectOutput = `${connectResult.stdout}\\n${connectResult.stderr}`.trim();
        if (!/connected to|already connected to/i.test(connectOutput)) connectAddress = "";
      }
      return { ok: true, data: { serial: validatedSerial, address, connectAddress, output } };
    }
    await sleep(2000);
  }
  return operationFailure("QR_PAIR_TIMEOUT", "qr-pair", "Timed out waiting for the device to scan the QR code.", {
    retryable: true,
    suggestedActions: ["Keep the QR code visible and scan it with the device camera.", "Make sure the device and computer are on the same Wi-Fi network."]
  });
});''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
