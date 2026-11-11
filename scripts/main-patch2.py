#!/usr/bin/env python3
"""Main: swipe control action + push-paths handler."""
P = 'main/main.js'
s = open(P, encoding='utf-8').read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, "MISS: " + old[:90]
    s = s.replace(old, new, count)

# 1) swipe action in controlDevice
rep('''    const keyCode = CONTROL_KEYCODES[action];
    if (!keyCode) return operationFailure("UNSUPPORTED_CONTROL_ACTION", "validation", "Unsupported device control action.");''',
'''    if (action === "swipe-up" || action === "swipe-down" || action === "swipe-left" || action === "swipe-right") {
      const size = await adbCommand(runtime, ["-s", target, "shell", "wm", "size"]);
      const match = (size.stdout || "").match(/(\\d+)x(\\d+)/);
      const width = match ? Number(match[1]) : 1080;
      const height = match ? Number(match[2]) : 1920;
      const cx = Math.round(width / 2);
      const cy = Math.round(height / 2);
      const dx = Math.round(width * 0.28);
      const dy = Math.round(height * 0.28);
      const coords = {
        "swipe-up": [cx, cy + dy, cx, cy - dy],
        "swipe-down": [cx, cy - dy, cx, cy + dy],
        "swipe-left": [cx + dx, cy, cx - dx, cy],
        "swipe-right": [cx - dx, cy, cx + dx, cy]
      }[action];
      await adbCommand(runtime, ["-s", target, "shell", "input", "swipe", ...coords.map(String), "300"]);
      return { ok: true, data: `${action} sent to ${target}.` };
    }
    const keyCode = CONTROL_KEYCODES[action];
    if (!keyCode) return operationFailure("UNSUPPORTED_CONTROL_ACTION", "validation", "Unsupported device control action.");''')

# 2) push-paths handler
rep('''handle("device:push-files", async (_event, runtime, serials, target, conflict) => {''',
'''handle("device:push-paths", async (_event, runtime, serials, target, conflict, paths) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    const validatedSerials = availableDeviceSerials(serials);
    const validatedTarget = validateRemoteDirectory(boundedString$1(target, "remote target", 1024));
    if (conflict !== "replace" && conflict !== "skip") throw new TypeError("file conflict policy is not supported.");
    const filePaths = array(paths, "dropped files").map((path, index) => boundedString$1(path, `dropped files[${index}]`, 4096, true));
    const batch = await deviceWorkspaceService.pushFiles(
      validatedRuntime,
      validatedSerials,
      await selectedFiles(filePaths),
      validatedTarget,
      conflict,
      sendBatchProgress
    );
    await artifactService?.registerTransferReport("file-push", batch).catch(() => {
    });
    return { ok: true, data: batch };
  } catch (error) {
    return failureFromUnknown(error, "FILE_PUSH_PREPARE_FAILED", "file-push", "Unable to push the dropped file.");
  }
});
handle("device:push-files", async (_event, runtime, serials, target, conflict) => {''')

open(P, 'w', encoding='utf-8').write(s)
print("changed:", s != orig, "| delta:", len(s) - len(orig))
