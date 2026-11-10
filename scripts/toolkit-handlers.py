#!/usr/bin/env python3
"""Toolkit IPC handlers: adb runner, Shizuku, SSH tunnel, per-device terminal, adb server."""
import pathlib
p = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/main/main.js')
s = p.read_text(encoding='utf-8')
anchor = 'handle("device:qr-pair-cancel", (_event, name) => {'
assert s.count(anchor) == 1

block = '''const sshTunnels = /* @__PURE__ */ new Map();
function resolvedAdbPath(runtime) {
  return runtime.scrcpyPath ? node_path.dirname(runtime.scrcpyPath) : process.resourcesPath;
}
handle("toolkit:adb", async (_event, runtime, serial, args) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    const validatedSerial = deviceSerial(serial);
    const validatedArgs = array(args, "toolkit arguments").map((arg, index) => boundedString$1(arg, `toolkit arguments[${index}]`, 512, true));
    if (validatedArgs.length < 1) throw new TypeError("No command given.");
    const result = await adbCommand(validatedRuntime, ["-s", validatedSerial, ...validatedArgs]);
    const output = `${result.stdout}${result.stderr}`.trim();
    return { ok: true, data: { serial: validatedSerial, args: validatedArgs, output } };
  } catch (error) {
    return failureFromUnknown(error, "TOOLKIT_ADB_FAILED", "toolkit-adb", "Unable to run the command.");
  }
});
handle("toolkit:shizuku", async (_event, runtime, serial, action) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    const validatedSerial = deviceSerial(serial);
    if (action !== "start" && action !== "stop" && action !== "status") throw new TypeError("Unsupported Shizuku action.");
    if (action === "status") {
      const result = await adbCommand(validatedRuntime, ["-s", validatedSerial, "shell", "pidof", "shizuku"]);
      const pid = (result.stdout || "").trim();
      return { ok: true, data: { action, running: Boolean(pid), pid: pid || void 0 } };
    }
    const script = action === "start" ? "start.sh" : "stop.sh";
    const result = await adbCommand(validatedRuntime, ["-s", validatedSerial, "shell", "sh", `/storage/emulated/0/Android/data/moe.shizuku.privileged.api/${script}`]);
    return { ok: true, data: { action, output: `${result.stdout}${result.stderr}`.trim() } };
  } catch (error) {
    return failureFromUnknown(error, "TOOLKIT_SHIZUKU_FAILED", "toolkit-shizuku", "Unable to control Shizuku.");
  }
});
handle("toolkit:server", async (_event, runtime, action) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    if (action !== "start" && action !== "stop" && action !== "restart") throw new TypeError("Unsupported adb server action.");
    const command = action === "stop" ? "kill-server" : action === "restart" ? "kill-server" : "start-server";
    await adbCommand(validatedRuntime, [command]);
    if (action === "restart") await adbCommand(validatedRuntime, ["start-server"]);
    return { ok: true, data: { action } };
  } catch (error) {
    return failureFromUnknown(error, "TOOLKIT_ADB_SERVER_FAILED", "toolkit-adb-server", "Unable to control the adb server.");
  }
});
handle("toolkit:tunnel", async (_event, runtime, action, host, localPort, remotePort) => {
  try {
    const key = `${host}:${localPort}`;
    if (action === "start") {
      const sshHost = boundedString$1(host, "ssh host", 256, true);
      const local = nonNegativeInteger(localPort, "local port");
      const remote = nonNegativeInteger(remotePort, "remote port");
      if (local > 65535 || remote > 65535) throw new TypeError("Port out of range.");
      if (sshTunnels.has(key)) return { ok: true, data: { action, alreadyRunning: true } };
      const child = node_child_process.spawn("ssh", ["-N", "-o", "ExitOnForwardFailure=yes", "-L", `${local}:127.0.0.1:${remote}`, sshHost], { stdio: "ignore" });
      sshTunnels.set(key, child);
      child.on("exit", () => sshTunnels.delete(key));
      return { ok: true, data: { action, pid: child.pid || void 0 } };
    }
    if (action === "stop") {
      const child = sshTunnels.get(key);
      if (child) {
        child.kill("SIGTERM");
        sshTunnels.delete(key);
      }
      return { ok: true, data: { action, stopped: Boolean(child) } };
    }
    const runningChild = sshTunnels.get(key);
    return { ok: true, data: { action: "status", running: Boolean(runningChild), pid: runningChild?.pid || void 0 } };
  } catch (error) {
    return failureFromUnknown(error, "TOOLKIT_TUNNEL_FAILED", "toolkit-tunnel", "Unable to control the SSH tunnel.");
  }
});
handle("toolkit:terminal", async (_event, runtime, serial) => {
  try {
    const validatedSerial = deviceSerial(serial);
    const adbPath = node_path.join(resolvedAdbPath(runtimeConfig(runtime)), "adb");
    const candidates = process.platform === "win32"
      ? ["cmd.exe", "/c", "start", "cmd", "/k", `"${adbPath}" -s ${validatedSerial} shell`]
      : ["xterm", "-e", `"${adbPath}" -s ${validatedSerial} shell`];
    const child = node_child_process.spawn(candidates[0], candidates.slice(1), { detached: true, stdio: "ignore" });
    child.unref();
    return { ok: true, data: { serial: validatedSerial, spawned: true } };
  } catch (error) {
    return failureFromUnknown(error, "TOOLKIT_TERMINAL_FAILED", "toolkit-terminal", "Unable to open a terminal.");
  }
});
'''
s = s.replace(anchor, block + anchor, 1)
p.write_text(s, encoding='utf-8')
print("toolkit handlers added")
