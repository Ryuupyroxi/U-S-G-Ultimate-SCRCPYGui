#!/usr/bin/env python3
"""Add Boot + Toolkit side panels, their functions and i18n."""
import pathlib
B = pathlib.Path('/home/Ryuu/.hermes/profiles/fenrys/cache/scratch/app-asar/out/renderer/assets')
p = B / 'index-Df8DQ038.js'
s = p.read_text(encoding='utf-8')

def rep(old, new):
    global s
    assert s.count(old) == 1, "MISS(%d): %s" % (s.count(old), old[:70])
    s = s.replace(old, new, 1)

# 1) tabs
rep('renderList(["devices", "automations", "sessions", "artifacts", "settings", "logs"]',
    'renderList(["devices", "boot", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"]')

# 2) i18n
rep('  toggleSidebar: "Collapse / expand the sidebar",',
    '''  toggleSidebar: "Collapse / expand the sidebar",
  boot: "Boot",
  toolkit: "Toolkit",
  bootHint: "Reboot the device or switch its boot mode. These use adb and take effect immediately.",
  bootDevice: "Device",
  bootReboot: "Reboot",
  bootRecovery: "Reboot to recovery",
  bootBootloader: "Reboot to bootloader",
  bootSafeMode: "Safe mode",
  bootWake: "Wake up",
  bootSleep: "Sleep",
  bootPowerOff: "Power off",
  bootSafeModeHint: "Safe mode uses the documented REBOOT intent and may not work on every manufacturer build.",
  toolkitHint: "Extra tools, scripts and commands. Optional integrations stay off until you enable them.",
  toolkitAdbTitle: "ADB quick actions",
  toolkitShizukuTitle: "Shizuku",
  toolkitCommandTitle: "Run a command",
  toolkitCommandPlaceholder: "shell getprop ro.product.model",
  toolkitRun: "Run",
  toolkitRecent: "Recent",
  toolkitMostUsed: "Most used",
  toolkitNoCommands: "No commands yet.",
  toolkitSshTitle: "SSH tunnel",
  toolkitSshHint: "Forwards a local port to the device over SSH, then scrcpy connects to it.",
  toolkitTerminalTitle: "Per-instance terminal",
  toolkitTerminalHint: "Opens a terminal running adb shell for the selected device.",
  toolkitTerminalOpen: "Open terminal for device",
  toolkitEnableSsh: "Enable SSH tunnel",
  toolkitEnableTerminal: "Per-instance terminal",
  toolkitSshHost: "user@host",
  toolkitStart: "Start tunnel",
  toolkitStop: "Stop",
  toolkitStatus: "Status",
  toolkitShizukuStart: "Start Shizuku",
  toolkitShizukuStop: "Stop Shizuku",
  toolkitShizukuStatus: "Shizuku status",
  toolkitShizukuHint: "Requires Shizuku to have been started via adb at least once.",
  toolkitNoOutput: "(no output)",''')

# 3) refs + functions
rep('    const logs = /* @__PURE__ */ ref([]);',
    '''    const bootSerial = /* @__PURE__ */ ref("");
    const toolkitSerial = /* @__PURE__ */ ref("");
    const toolkitCommand = /* @__PURE__ */ ref("");
    const toolkitOutput = /* @__PURE__ */ ref("");
    const toolkitBusy = /* @__PURE__ */ ref(false);
    const logs = /* @__PURE__ */ ref([]);''')

rep('    async function exportConfigAs(format) {',
    '''    const toolkitDevice = () => toolkitSerial.value || bootSerial.value || controlSerial.value || selectedSerials.value[0] || "";
    const recentCommands = computed(() => config.toolkit.recentCommands || []);
    const mostUsedCommands = computed(() => Object.entries(config.toolkit.commandUsage || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cmd]) => cmd));
    watch(usableDevices, (list) => {
      const serials = list.map((device) => device.serial);
      if (!serials.includes(toolkitSerial.value)) toolkitSerial.value = serials[0] || "";
      if (!serials.includes(bootSerial.value)) bootSerial.value = serials[0] || "";
    }, { immediate: true });
    function rememberCommand(command) {
      const trimmed = command.trim();
      if (!trimmed) return;
      const recent = [trimmed, ...(config.toolkit.recentCommands || []).filter((entry) => entry !== trimmed)].slice(0, 12);
      config.toolkit.recentCommands = recent;
      config.toolkit.commandUsage = { ...(config.toolkit.commandUsage || {}), [trimmed]: (config.toolkit.commandUsage?.[trimmed] || 0) + 1 };
    }
    async function runToolkitAdb(args) {
      const serial = toolkitDevice();
      if (!serial) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      toolkitBusy.value = true;
      try {
        const result = await window.scrcpy.runToolkitCommand(runtimeSnapshot(), serial, args);
        if (!result?.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        toolkitOutput.value = result.data.output || t("toolkitNoOutput");
        rememberCommand(args.join(" "));
      } catch (error) {
        toast("error", String(error));
      } finally {
        toolkitBusy.value = false;
      }
    }
    async function bootAction(action) {
      const commands = {
        reboot: ["reboot"],
        recovery: ["reboot", "recovery"],
        bootloader: ["reboot", "bootloader"],
        "safe-mode": ["shell", "am", "start", "-a", "android.intent.action.REBOOT", "--ez", "safe_mode", "true"],
        wake: ["shell", "input", "keyevent", "224"],
        sleep: ["shell", "input", "keyevent", "223"],
        "power-off": ["shell", "reboot", "-p"]
      };
      await runToolkitAdb(commands[action] || []);
    }
    async function shizukuAction(action) {
      const serial = toolkitDevice();
      if (!serial) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      toolkitBusy.value = true;
      try {
        const result = await window.scrcpy.shizuku(runtimeSnapshot(), serial, action);
        if (!result?.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        toolkitOutput.value = result.data.output || (result.data.running ? `Shizuku is running (pid ${result.data.pid})` : "Shizuku is not running.");
        rememberCommand(`shizuku ${action}`);
      } catch (error) {
        toast("error", String(error));
      } finally {
        toolkitBusy.value = false;
      }
    }
    async function runToolkitCommand() {
      const parts = toolkitCommand.value.trim().split(/\\s+/).filter(Boolean);
      if (!parts.length) return;
      await runToolkitAdb(parts);
    }
    async function runRecent(command) {
      toolkitCommand.value = command;
      await runToolkitAdb(command.split(/\\s+/).filter(Boolean));
    }
    async function sshTunnelAction(action) {
      try {
        const result = await window.scrcpy.sshTunnel(runtimeSnapshot(), action, config.toolkit.sshHost.trim(), config.toolkit.sshLocalPort, config.toolkit.sshRemotePort);
        if (!result?.ok) {
          toast("error", operationErrorMessage(result, t("operationFailed")));
          return;
        }
        toolkitOutput.value = action === "status" ? `Tunnel ${result.data.running ? "running" : "stopped"}${result.data.pid ? ` (pid ${result.data.pid})` : ""}` : `Tunnel ${action} requested.`;
      } catch (error) {
        toast("error", String(error));
      }
    }
    async function openDeviceTerminal(serial) {
      const target = serial || toolkitDevice();
      if (!target) {
        toast("error", t("noDevicesSelected"));
        return;
      }
      try {
        const result = await window.scrcpy.openTerminal(runtimeSnapshot(), target);
        if (!result?.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
      } catch (error) {
        toast("error", String(error));
      }
    }
    async function adbServerAction(action) {
      try {
        const result = await window.scrcpy.adbServer(runtimeSnapshot(), action);
        if (!result?.ok) toast("error", operationErrorMessage(result, t("operationFailed")));
        else toast("success", `ADB server ${action}`);
      } catch (error) {
        toast("error", String(error));
      }
    }
    async function exportConfigAs(format) {''')

p.write_text(s, encoding='utf-8')
print("boot/toolkit logic added")
