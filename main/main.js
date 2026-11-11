"use strict";
const electron = require("electron");
const node_path = require("node:path");
const node_url = require("node:url");
const node_crypto = require("node:crypto");
const promises = require("node:fs/promises");
const node_os = require("node:os");
const node_child_process = require("node:child_process");
const node_fs = require("node:fs");
const node_https = require("node:https");
const SCENE_KINDS = [
  "screen",
  "camera",
  "virtual-display",
  "record-only",
  "control-only",
  "otg"
];
const SCENE_MANAGED_FLAGS = [
  ["--video-source", "scene"],
  ["--new-display", "scene"],
  ["--no-video", "scene"],
  ["--otg", "scene"],
  ["--video-encoder", "videoEncoder"],
  ["--audio-codec", "audioCodec"],
  ["--audio-encoder", "audioEncoder"],
  ["--audio-source", "audioSource"],
  ["--audio-dup", "audioDup"],
  ["--angle", "rotation90"],
  ["--time-limit", "timeLimit"],
  ["--record-format", "recordFormat"],
  ["--record-orientation", "recordOrientation"],
  ["--camera-id", "cameraId"],
  ["--camera-facing", "cameraFacing"],
  ["--camera-size", "cameraSize"],
  ["--camera-fps", "cameraFps"],
  ["--camera-high-speed", "cameraHighSpeed"],
  ["--camera-torch", "cameraTorch"],
  ["--camera-zoom", "cameraZoom"],
  ["--v4l2-sink", "v4l2Sink"],
  ["--v4l2-buffer", "v4l2Buffer"],
  ["--no-video-playback", "v4l2Playback"],
  ["--no-vd-system-decorations", "virtualDisplayDecorations"],
  ["--no-vd-destroy-content", "virtualDisplayDestroy"],
  ["--flex-display", "flexDisplay"],
  ["-x", "flexDisplay"],
  ["--start-app", "startApp"],
  ["--keep-active", "keepActive"],
  ["--display-ime-policy", "displayImePolicy"],
  ["--window-borderless", "borderless"]
];
const VISUAL_SCENES = /* @__PURE__ */ new Set(["screen", "camera", "virtual-display", "record-only"]);
const PACKAGE_ID$1 = /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+$/;
const V4L2_DEVICE = /^\/dev\/video\d+$/;
const ENCODER_NAME = /^[A-Za-z0-9._-]+$/;
const CAMERA_ID = /^[A-Za-z0-9._:-]+$/;
function group$1(key, flag, category, helpKey, args) {
  return { key, flag, category, helpKey, args };
}
function validPair$1(width, height, label) {
  if (width > 0 !== height > 0) throw new Error(`${label} width and height must both be set or both be automatic.`);
}
function scenesConflict(left, right) {
  return left === right || left === "otg" || right === "otg";
}
function serializeSceneOptions(config, platform) {
  const result = [];
  const add = (entry) => {
    if (entry.args.length) result.push(entry);
  };
  if (!SCENE_KINDS.includes(config.scene)) throw new Error(`Unsupported launch scene: ${config.scene}.`);
  if (config.videoEncoder.trim() && !ENCODER_NAME.test(config.videoEncoder.trim())) throw new Error("Video encoder name is invalid.");
  if (config.audioEncoder.trim() && !ENCODER_NAME.test(config.audioEncoder.trim())) throw new Error("Audio encoder name is invalid.");
  if (VISUAL_SCENES.has(config.scene)) {
    const hasVideo = config.scene !== "record-only" || config.recordVideo;
    const hasAudio = config.scene !== "record-only" || config.recordAudio;
    add(group$1("videoEncoder", "--video-encoder", "video", "videoEncoder", hasVideo && config.videoEncoder.trim() ? [`--video-encoder=${config.videoEncoder.trim()}`] : []));
    add(group$1("audioCodec", "--audio-codec", "video", "audioCodec", !hasAudio || config.audioCodec === "default" ? [] : [`--audio-codec=${config.audioCodec}`]));
    add(group$1("audioEncoder", "--audio-encoder", "video", "audioEncoder", hasAudio && config.audioEncoder.trim() ? [`--audio-encoder=${config.audioEncoder.trim()}`] : []));
    add(group$1("audioSource", "--audio-source", "video", "audioSource", !hasAudio ? [] : config.audioDup ? ["--audio-source=playback"] : config.audioSource === "default" ? [] : [`--audio-source=${config.audioSource}`]));
    add(group$1("audioDup", "--audio-dup", "video", "audioDup", hasAudio && config.audioDup ? ["--audio-dup"] : []));
    add(group$1("rotation90", "--angle", "video", "rotate90", config.rotation90 ? ["--angle=90"] : []));
    add(group$1("timeLimit", "--time-limit", "recording", "timeLimit", config.timeLimit > 0 ? [`--time-limit=${Math.trunc(config.timeLimit)}`] : []));
    add(group$1("recordFormat", "--record-format", "recording", "recordFormat", config.recordEnabled && config.recordFormat !== "default" ? [`--record-format=${config.recordFormat}`] : []));
    add(group$1("recordOrientation", "--record-orientation", "recording", "recordOrientation", config.recordEnabled && config.recordOrientation !== "default" ? [`--record-orientation=${config.recordOrientation}`] : []));
  }
  if (config.scene === "camera") {
    if (config.cameraId.trim() && !CAMERA_ID.test(config.cameraId.trim())) throw new Error("Camera id is invalid.");
    if (config.cameraId.trim() && config.cameraFacing !== "default") {
      throw new Error("Choose either an explicit camera id or a camera facing, not both.");
    }
    validPair$1(config.cameraSize.width, config.cameraSize.height, "Camera size");
    if (config.cameraSize.width > 0 && config.maxSize > 0) {
      throw new Error("Explicit camera size conflicts with max size.");
    }
    if (config.cameraHighSpeed && (!config.cameraSize.width || !config.cameraFps)) {
      throw new Error("High-speed camera capture requires an explicit size and frame rate.");
    }
    if (config.v4l2Sink.trim()) {
      if (platform !== "linux") throw new Error("V4L2 camera output is only available on Linux.");
      if (!V4L2_DEVICE.test(config.v4l2Sink.trim())) throw new Error("V4L2 sink must be a /dev/videoN device.");
    }
    add(group$1("scene", "--video-source", "video", "sceneCamera", ["--video-source=camera"]));
    add(group$1("cameraId", "--camera-id", "video", "cameraId", config.cameraId.trim() ? [`--camera-id=${config.cameraId.trim()}`] : []));
    add(group$1("cameraFacing", "--camera-facing", "video", "cameraFacing", config.cameraFacing === "default" ? [] : [`--camera-facing=${config.cameraFacing}`]));
    add(group$1("cameraSize", "--camera-size", "video", "cameraSize", config.cameraSize.width > 0 ? [`--camera-size=${Math.trunc(config.cameraSize.width)}x${Math.trunc(config.cameraSize.height)}`] : []));
    add(group$1("cameraFps", "--camera-fps", "video", "cameraFps", config.cameraFps > 0 ? [`--camera-fps=${Math.trunc(config.cameraFps)}`] : []));
    add(group$1("cameraHighSpeed", "--camera-high-speed", "video", "cameraHighSpeed", config.cameraHighSpeed ? ["--camera-high-speed"] : []));
    add(group$1("cameraTorch", "--camera-torch", "video", "cameraTorch", config.cameraTorch ? ["--camera-torch"] : []));
    add(group$1("cameraZoom", "--camera-zoom", "video", "cameraZoom", config.cameraZoom !== 1 ? [`--camera-zoom=${config.cameraZoom}`] : []));
    add(group$1("v4l2Sink", "--v4l2-sink", "video", "v4l2Sink", config.v4l2Sink.trim() ? [`--v4l2-sink=${config.v4l2Sink.trim()}`] : []));
    add(group$1("v4l2Buffer", "--v4l2-buffer", "video", "v4l2Buffer", config.v4l2Sink.trim() && config.v4l2Buffer > 0 ? [`--v4l2-buffer=${Math.trunc(config.v4l2Buffer)}`] : []));
    add(group$1("v4l2Playback", "--no-video-playback", "video", "v4l2Playback", config.v4l2Sink.trim() && !config.v4l2Playback ? ["--no-video-playback"] : []));
  }
  if (config.scene === "virtual-display") {
    validPair$1(config.virtualDisplay.width, config.virtualDisplay.height, "Virtual display size");
    if (!PACKAGE_ID$1.test(config.virtualDisplay.startApp.trim())) {
      throw new Error("Virtual display requires a valid Android package id to start.");
    }
    const size2 = config.virtualDisplay.width > 0 ? `${Math.trunc(config.virtualDisplay.width)}x${Math.trunc(config.virtualDisplay.height)}` : "";
    const dpi = config.virtualDisplay.dpi > 0 ? `/${Math.trunc(config.virtualDisplay.dpi)}` : "";
    add(group$1("scene", "--new-display", "video", "sceneVirtualDisplay", [`--new-display${size2 || dpi ? `=${size2}${dpi}` : ""}`]));
    add(group$1("virtualDisplayDecorations", "--no-vd-system-decorations", "video", "virtualDisplayDecorations", config.virtualDisplay.systemDecorations ? [] : ["--no-vd-system-decorations"]));
    add(group$1("virtualDisplayDestroy", "--no-vd-destroy-content", "video", "virtualDisplayDestroy", config.virtualDisplay.destroyContent ? [] : ["--no-vd-destroy-content"]));
    add(group$1("flexDisplay", "--flex-display", "video", "flexDisplay", config.virtualDisplay.flexDisplay ? ["--flex-display"] : []));
    add(group$1("startApp", "--start-app", "general", "startApp", [`--start-app=${config.virtualDisplay.startApp.trim()}`]));
    add(group$1("keepActive", "--keep-active", "controls", "keepActive", config.virtualDisplay.keepActive ? ["--keep-active"] : []));
    add(group$1("displayImePolicy", "--display-ime-policy", "controls", "displayImePolicy", config.virtualDisplay.imePolicy === "local" ? ["--display-ime-policy=local"] : []));
  }
  if (config.scene === "record-only") {
    if (!config.recordEnabled || !config.recordPath.trim()) throw new Error("Record-only scene requires a recording file.");
    if (!config.recordVideo && !config.recordAudio) throw new Error("Record-only scene must capture video, audio, or both.");
    if (config.recordVideo && !["default", "mp4", "mkv"].includes(config.recordFormat)) {
      throw new Error("Video recording requires the MP4 or MKV container.");
    }
    add(group$1("scene", "--no-playback", "recording", "sceneRecordOnly", [
      "--no-playback",
      "--no-window",
      ...!config.recordVideo ? ["--no-video"] : [],
      ...!config.recordAudio ? ["--no-audio"] : []
    ]));
  }
  if (config.scene === "control-only") {
    if (config.mouseMode === "sdk") throw new Error("Control-only mode cannot use SDK mouse without video playback; use UHID or AOA.");
    add(group$1("scene", "--no-video", "controls", "sceneControlOnly", ["--no-video", "--no-audio"]));
  }
  if (config.scene === "otg") {
    if (config.keyboardMode === "sdk" || config.keyboardMode === "uhid" || config.mouseMode === "sdk" || config.mouseMode === "uhid" || config.gamepadMode === "uhid") {
      throw new Error("OTG input modes must use AOA, disabled, or their OTG defaults.");
    }
    add(group$1("scene", "--otg", "controls", "sceneOtg", ["--otg"]));
  }
  return result;
}
const validPort$1 = (value) => /^\d{1,5}$/.test(value) && Number(value) >= 1 && Number(value) <= 65535;
function validatePortRange(value) {
  const ports = value.trim().split(":");
  if (ports.length < 1 || ports.length > 2 || ports.some((port) => !validPort$1(port))) return false;
  return ports.length === 1 || Number(ports[0]) <= Number(ports[1]);
}
function validPair(name, width, height) {
  return width > 0 === height > 0 ? void 0 : `${name} width and height must either both be zero or both be greater than zero.`;
}
const ok = () => void 0;
const screen = ["screen"];
const visual = ["screen", "camera", "virtual-display", "record-only"];
const visualPlayback = ["screen", "camera", "virtual-display"];
const windowed = ["screen", "camera", "virtual-display"];
const input = ["screen", "virtual-display", "control-only", "otg"];
const adbScenes = ["screen", "camera", "virtual-display", "record-only", "control-only"];
const screenVirtualRecord = ["screen", "virtual-display", "record-only"];
const screenVirtual = ["screen", "virtual-display"];
const OPTION_DESCRIPTORS = [
  { key: "windowTitle", flag: "--window-title", category: "general", valueType: "string", defaultValue: "", helpKey: "windowTitle", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.windowTitle.trim() ? [`--window-title=${c.windowTitle.trim()}`] : [], validate: ok },
  { key: "shortcutModifier", flag: "--shortcut-mod", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "shortcutModifier", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.shortcutModifier === "default" ? [] : [`--shortcut-mod=${c.shortcutModifier}`], validate: ok },
  { key: "keyboardMode", flag: "--keyboard", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "keyboardMode", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.keyboardMode === "default" ? [] : [`--keyboard=${c.keyboardMode}`], validate: ok },
  { key: "mouseMode", flag: "--mouse", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "mouseMode", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.mouseMode === "default" ? [] : [`--mouse=${c.mouseMode}`], validate: ok },
  { key: "gamepadMode", flag: "--gamepad", category: "controls", valueType: "enum", defaultValue: "default", helpKey: "gamepadMode", minScrcpyVersion: "4.0", scenes: input, serialize: (c) => c.gamepadMode === "default" ? [] : [`--gamepad=${c.gamepadMode}`], validate: ok },
  { key: "videoCodec", flag: "--video-codec", category: "video", valueType: "enum", defaultValue: "default", helpKey: "codec", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.videoCodec === "default" ? [] : [`--video-codec=${c.videoCodec}`], validate: ok },
  { key: "videoBitRate", flag: "--video-bit-rate", aliases: ["-b"], category: "video", valueType: "number", defaultValue: 8, helpKey: "bitRate", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.videoBitRate <= 0 || c.videoBitRate === 8 ? [] : [`--video-bit-rate=${c.videoBitRate}M`], validate: ok },
  { key: "videoBuffer", flag: "--video-buffer", category: "video", valueType: "number", defaultValue: 0, helpKey: "videoBuffer", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.videoBuffer > 0 ? [`--video-buffer=${Math.trunc(c.videoBuffer)}`] : [], validate: ok },
  { key: "audioBuffer", flag: "--audio-buffer", category: "video", valueType: "number", defaultValue: 0, helpKey: "audioBuffer", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordAudio || c.audioBuffer <= 0 ? [] : [`--audio-buffer=${Math.trunc(c.audioBuffer)}`], validate: ok },
  { key: "maxSize", flag: "--max-size", aliases: ["-m"], category: "video", valueType: "number", defaultValue: 0, helpKey: "maxSize", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.maxSize <= 0 ? [] : [`--max-size=${Math.trunc(c.maxSize)}`], validate: ok },
  { key: "maxFps", flag: "--max-fps", category: "video", valueType: "number", defaultValue: 0, helpKey: "maxFps", minScrcpyVersion: "4.0", scenes: screenVirtualRecord, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.maxFps <= 0 ? [] : [`--max-fps=${Math.trunc(c.maxFps)}`], validate: ok },
  { key: "displayId", flag: "--display-id", category: "video", valueType: "number", defaultValue: 0, helpKey: "displayId", minScrcpyVersion: "4.0", scenes: screen, conflictsWith: ["newDisplay", "camera"], serialize: (c) => c.displayId > 0 ? [`--display-id=${Math.trunc(c.displayId)}`] : [], validate: ok },
  { key: "orientation", flag: "--orientation", category: "video", valueType: "enum", defaultValue: "0", helpKey: "orientation", minScrcpyVersion: "4.0", scenes: visual, serialize: (c) => c.scene === "record-only" && !c.recordVideo || c.orientation === "0" ? [] : [`--orientation=${c.orientation}`], validate: ok },
  { key: "recording", flag: "--record", aliases: ["-r"], category: "recording", valueType: "path", defaultValue: false, helpKey: "recordEnabled", minScrcpyVersion: "4.0", scenes: visual, requires: ["recordPath"], serialize: (c) => c.recordEnabled ? [`--record=${c.recordPath.trim()}`, ...c.noPlayback && c.scene !== "record-only" ? ["--no-playback", "--no-window"] : []] : [], validate: (c) => c.recordEnabled && !c.recordPath.trim() ? "Choose a recording file before starting scrcpy." : void 0 },
  { key: "alwaysOnTop", flag: "--always-on-top", category: "general", valueType: "boolean", defaultValue: false, helpKey: "alwaysOnTop", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.alwaysOnTop ? ["--always-on-top"] : [], validate: ok },
  { key: "control", flag: "--no-control", aliases: ["-n"], category: "controls", valueType: "boolean", defaultValue: true, helpKey: "control", minScrcpyVersion: "4.0", scenes: screenVirtual, serialize: (c) => c.control ? [] : ["--no-control"], validate: ok },
  { key: "audio", flag: "--no-audio", category: "video", valueType: "boolean", defaultValue: true, helpKey: "audio", minScrcpyVersion: "4.0", scenes: visualPlayback, serialize: (c) => c.audio ? [] : ["--no-audio"], validate: ok },
  { key: "turnScreenOff", flag: "--turn-screen-off", aliases: ["-S"], category: "controls", valueType: "boolean", defaultValue: false, helpKey: "turnScreenOff", minScrcpyVersion: "4.0", scenes: screenVirtual, serialize: (c) => c.turnScreenOff ? ["--turn-screen-off"] : [], validate: ok },
  { key: "stayAwake", flag: "--stay-awake", aliases: ["-w"], category: "controls", valueType: "boolean", defaultValue: false, helpKey: "stayAwake", minScrcpyVersion: "4.0", scenes: screenVirtual, serialize: (c) => c.stayAwake ? ["--stay-awake"] : [], validate: ok },
  { key: "showTouches", flag: "--show-touches", aliases: ["-t"], category: "controls", valueType: "boolean", defaultValue: false, helpKey: "showTouches", minScrcpyVersion: "4.0", scenes: screen, serialize: (c) => c.showTouches ? ["--show-touches"] : [], validate: ok },
  { key: "fullscreen", flag: "--fullscreen", aliases: ["-f"], category: "general", valueType: "boolean", defaultValue: false, helpKey: "fullscreen", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.fullscreen ? ["--fullscreen"] : [], validate: ok },
  { key: "borderless", flag: "--window-borderless", category: "general", valueType: "boolean", defaultValue: false, helpKey: "borderless", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.borderless ? ["--window-borderless"] : [], validate: ok },
  { key: "windowAspectRatioLock", flag: "--no-window-aspect-ratio-lock", category: "geometry", valueType: "boolean", defaultValue: true, helpKey: "aspectRatioLock", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.windowAspectRatioLock ? [] : ["--no-window-aspect-ratio-lock"], validate: ok },
  { key: "pushTarget", flag: "--push-target", category: "advanced", valueType: "path", defaultValue: "", helpKey: "pushTarget", minScrcpyVersion: "4.0", scenes: screenVirtual, serialize: (c) => c.pushTarget.trim() ? [`--push-target=${c.pushTarget.trim()}`] : [], validate: (c) => c.pushTarget.includes("\0") ? "Push target may not contain null bytes." : void 0 },
  { key: "tunnelPort", flag: "--port", category: "advanced", valueType: "string", defaultValue: "", helpKey: "tunnelPort", minScrcpyVersion: "4.0", scenes: adbScenes, serialize: (c) => c.tunnelPort.trim() ? [`--port=${c.tunnelPort.trim()}`] : [], validate: (c) => c.tunnelPort.trim() && !validatePortRange(c.tunnelPort) ? "Tunnel port must be a port or ascending port range from 1 to 65535." : void 0 },
  { key: "crop", flag: "--crop", category: "geometry", valueType: "composite", defaultValue: { x: 0, y: 0, width: 0, height: 0 }, helpKey: "crop", minScrcpyVersion: "4.0", scenes: screen, conflictsWith: ["camera"], serialize: (c) => c.crop.width > 0 ? [`--crop=${Math.trunc(c.crop.width)}:${Math.trunc(c.crop.height)}:${Math.trunc(c.crop.x)}:${Math.trunc(c.crop.y)}`] : [], validate: (c) => validPair("Crop", c.crop.width, c.crop.height) },
  { key: "windowPosition", flag: "--window-x", category: "geometry", valueType: "composite", defaultValue: { x: 0, y: 0 }, helpKey: "initialWindow", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => [...c.window.x !== 0 ? [`--window-x=${Math.trunc(c.window.x)}`] : [], ...c.window.y !== 0 ? [`--window-y=${Math.trunc(c.window.y)}`] : []], validate: ok },
  { key: "windowSize", flag: "--window-width", category: "geometry", valueType: "composite", defaultValue: { width: 0, height: 0 }, helpKey: "initialWindow", minScrcpyVersion: "4.0", scenes: windowed, serialize: (c) => c.window.width > 0 ? [`--window-width=${Math.trunc(c.window.width)}`, `--window-height=${Math.trunc(c.window.height)}`] : [], validate: (c) => validPair("Window", c.window.width, c.window.height) }
];
function optionDefault(key) {
  const descriptor = OPTION_DESCRIPTORS.find((item) => item.key === key);
  if (!descriptor) throw new Error(`Unknown option descriptor: ${key}.`);
  return structuredClone(descriptor.defaultValue);
}
const managedFlags = /* @__PURE__ */ new Map();
for (const descriptor of OPTION_DESCRIPTORS) {
  managedFlags.set(descriptor.flag, descriptor.key);
  for (const alias of descriptor.aliases || []) managedFlags.set(alias, descriptor.key);
}
for (const [flag, key] of SCENE_MANAGED_FLAGS) managedFlags.set(flag, key);
managedFlags.set("--serial", "serial");
managedFlags.set("-s", "serial");
managedFlags.set("--no-playback", "recording");
managedFlags.set("--no-window", "recording");
managedFlags.set("--window-y", "windowPosition");
managedFlags.set("--window-height", "windowSize");
function serializeLaunchOptions(config) {
  const descriptors = OPTION_DESCRIPTORS.filter((descriptor) => descriptor.scenes.includes(config.scene));
  const errors = descriptors.map((descriptor) => descriptor.validate(config)).filter(Boolean);
  if (errors.length) throw new Error(errors[0]);
  return descriptors.map((descriptor) => ({
    key: descriptor.key,
    flag: descriptor.flag,
    category: descriptor.category,
    helpKey: descriptor.helpKey,
    args: descriptor.serialize(config)
  })).filter((entry) => entry.args.length > 0);
}
function analyzeExpertArgs(value) {
  const args = value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
  const warnings = [];
  for (const arg of args) {
    if (arg.includes("\0")) throw new Error("Additional arguments may not contain null bytes.");
    const flag = arg.match(/^(--[a-z0-9-]+|-[A-Za-z])(?:=|$)/)?.[1];
    if (flag && managedFlags.has(flag)) {
      throw new Error(`${flag} is managed by UltimateSCRCPYGui (${managedFlags.get(flag)}) and cannot be overridden in expert arguments.`);
    }
    if (!flag) warnings.push(`Unrecognized expert argument syntax: ${arg}`);
    else warnings.push(`Expert argument ${flag} is not managed by this UltimateSCRCPYGui version; it will be passed through unchanged.`);
  }
  return { args, warnings };
}
const HOST_LABEL = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
function isSupportedScrcpyVersion(version2) {
  const match = version2.match(/\bscrcpy\s+(\d+)(?:\.|\b)/i);
  return Boolean(match && Number(match[1]) >= 4);
}
function parseAdbDevices(output2) {
  return output2.split(/\r?\n/).slice(1).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [serial = "", stateValue = "unknown", ...metadata] = line.split(/\s+/);
    const values = Object.fromEntries(
      metadata.map((entry) => entry.split(/:(.*)/s).slice(0, 2)).filter(([key, value]) => key && value)
    );
    const knownStates = ["device", "offline", "unauthorized", "recovery"];
    const state = knownStates.includes(stateValue) ? stateValue : "unknown";
    return {
      serial,
      state,
      model: (values.model || serial).replaceAll("_", " "),
      product: values.product || "",
      device: values.device || "",
      transportId: values.transport_id,
      connection: serial.includes(":") ? "wireless" : "usb"
    };
  });
}
function validPort(value) {
  if (!/^\d{1,5}$/.test(value)) return false;
  const port = Number(value);
  return port >= 1 && port <= 65535;
}
function validIpv4(value) {
  const octets = value.split(".");
  return octets.length === 4 && octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255);
}
function validHostname(value) {
  return value.length <= 253 && value.split(".").every((label) => HOST_LABEL.test(label));
}
function validateDeviceAddress(value, requirePort = false) {
  const target = value.trim();
  if (!target || /\s/.test(target)) return false;
  if (target.startsWith("[")) {
    const match = target.match(/^\[([0-9a-fA-F:]+)](?::(\d{1,5}))?$/);
    if (!match || !match[1].includes(":")) return false;
    return requirePort ? Boolean(match[2] && validPort(match[2])) : !match[2] || validPort(match[2]);
  }
  const colonCount = (target.match(/:/g) || []).length;
  if (colonCount > 1) return false;
  const [host, port] = target.split(":");
  if (/^[\d.]+$/.test(host) && !validIpv4(host)) return false;
  if (!validIpv4(host) && !validHostname(host)) return false;
  if (requirePort) return Boolean(port && validPort(port));
  return !port || validPort(port);
}
function buildScrcpyArgDetails(config, serial, source = "global", sourceLabel, deviceWindowTitleOverride = false) {
  if (!serial.trim() && config.scene !== "otg") throw new Error("A device serial is required.");
  const details = serial.trim() ? [{ arg: `--serial=${serial.trim()}`, optionKey: "serial", helpKey: "device", source: "session" }] : [];
  const platform = process.platform;
  for (const option of serializeSceneOptions(config, platform)) {
    details.push(...option.args.map((arg) => ({
      arg,
      optionKey: option.key,
      helpKey: option.helpKey,
      source: option.key === "scene" ? "scene-default" : source,
      sourceLabel: source === "profile" && option.key !== "scene" ? sourceLabel : void 0
    })));
  }
  for (const option of serializeLaunchOptions(config)) {
    for (const arg of option.args) {
      const optionSource = option.key === "windowTitle" && deviceWindowTitleOverride ? "device-override" : option.key === "recording" && config.autoRecordName ? "generated" : source;
      details.push({
        arg,
        optionKey: option.key,
        helpKey: option.helpKey,
        source: optionSource,
        sourceLabel: optionSource === "profile" ? sourceLabel : void 0
      });
    }
  }
  if (platform === "darwin" && ["screen", "virtual-display", "control-only", "otg"].includes(config.scene) && config.shortcutModifier === "default" && !details.some((detail) => detail.optionKey === "shortcutModifier")) {
    details.push({
      arg: "--shortcut-mod=lsuper",
      optionKey: "shortcutModifier",
      helpKey: "shortcutModifier",
      source,
      sourceLabel: source === "profile" ? sourceLabel : void 0
    });
  }
  const expert = analyzeExpertArgs(config.extraArgs);
  details.push(...expert.args.map((arg) => ({ arg, optionKey: "expertArgs", helpKey: "extraArgs", source: "expert" })));
  return { args: details.map((detail) => detail.arg), details, warnings: expert.warnings };
}
function prepareLaunchConfig(config, serial, now = /* @__PURE__ */ new Date()) {
  if (!config.recordEnabled || !config.autoRecordName) return config;
  if (!config.recordDirectory.trim()) throw new Error("Choose a recording folder for automatic filenames.");
  const safeSerial = serial.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "device";
  const timestamp = now.toISOString().replaceAll(":", "-").slice(0, 19);
  const suffix = config.scene === "record-only" ? `-${node_crypto.randomUUID()}` : "";
  const extension = config.recordFormat === "default" ? "mp4" : config.recordFormat;
  return { ...config, recordPath: node_path.join(config.recordDirectory.trim(), `scrcpy-${safeSerial}-${timestamp}${suffix}.${extension}`) };
}
function buildScrcpyArgs(config, serial) {
  return buildScrcpyArgDetails(config, serial).args;
}
function structuredError(code, stage, message2, options = {}) {
  return {
    code,
    stage,
    message: message2,
    ...options.detail ? { detail: options.detail } : {},
    ...options.exitCode !== void 0 ? { exitCode: options.exitCode } : {},
    retryable: options.retryable ?? false,
    suggestedActions: [...options.suggestedActions || []]
  };
}
function operationFailure(code, stage, message2, options = {}) {
  return { ok: false, error: structuredError(code, stage, message2, options) };
}
function failureFromUnknown(error, code, stage, fallback, options = {}) {
  return { ok: false, error: structuredErrorFromUnknown(error, code, stage, fallback, options) };
}
function structuredErrorFromUnknown(error, code, stage, fallback, options = {}) {
  const detail = error instanceof Error && error.message.trim() ? error.message : String(error || "");
  const exitCode = typeof error?.exitCode === "number" ? error.exitCode : options.exitCode;
  return structuredError(code, stage, fallback, {
    ...options,
    ...exitCode === void 0 ? {} : { exitCode },
    ...options.detail || !detail ? {} : { detail }
  });
}
function operationErrorMessage(result, fallback) {
  return result.error?.message || fallback;
}
const TERMINAL_STATES = /* @__PURE__ */ new Set(["stopped", "failed"]);
const STARTUP_FATAL_PATTERN = /(?:^|\n)\s*(?:ERROR|FATAL):/i;
const TRANSITIONS = {
  queued: /* @__PURE__ */ new Set(["preflighting", "failed"]),
  preflighting: /* @__PURE__ */ new Set(["launching", "failed"]),
  launching: /* @__PURE__ */ new Set(["running", "stopping", "failed"]),
  running: /* @__PURE__ */ new Set(["stopping", "stopped", "failed"]),
  stopping: /* @__PURE__ */ new Set(["stopped", "failed"]),
  stopped: /* @__PURE__ */ new Set(),
  failed: /* @__PURE__ */ new Set()
};
function canTransitionSession(from, to) {
  return TRANSITIONS[from].has(to);
}
function snapshot(session) {
  return { ...session, args: [...session.args] };
}
class ScrcpySessionManager {
  constructor(options = {}) {
    this.sessions = /* @__PURE__ */ new Map();
    this.active = /* @__PURE__ */ new Map();
    this.reservations = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    this.startupWindowMs = options.startupWindowMs ?? 8e3;
    this.stopGraceMs = options.stopGraceMs ?? 2e3;
    this.now = options.now ?? (() => /* @__PURE__ */ new Date());
    this.createId = options.createId ?? node_crypto.randomUUID;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  list() {
    return [...this.sessions.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).map(snapshot);
  }
  launch(request) {
    const serial = request.serial.trim();
    const session = {
      id: this.createId(),
      serialAtLaunch: serial,
      scene: request.scene,
      state: "queued",
      args: [...request.args],
      createdAt: this.timestamp()
    };
    this.sessions.set(session.id, session);
    this.emit(session, "Session queued.");
    this.transition(session, "preflighting", "Checking session conflicts and launch inputs.");
    if (!serial || !request.executable.trim()) {
      return this.fail(session, "A device serial and scrcpy executable are required.", "launch-error");
    }
    const conflict = [...this.reservations.entries()].find(
      ([, reservation]) => reservation.serial === serial && scenesConflict(reservation.scene, request.scene)
    );
    if (conflict) {
      const activeScene = conflict[1].scene;
      return this.fail(session, `An active ${activeScene} session conflicts with ${request.scene} for this device.`, "launch-error");
    }
    this.reservations.set(session.id, { serial, scene: request.scene });
    this.transition(session, "launching", "Starting scrcpy.");
    let child;
    try {
      child = node_child_process.spawn(request.executable, request.args, {
        windowsHide: true,
        env: { ...process.env, LANG: "en_US.UTF-8" }
      });
    } catch (error) {
      this.releaseConflict(session);
      return this.fail(session, error instanceof Error ? error.message : String(error), "launch-error");
    }
    const active = { child, recentError: "" };
    this.active.set(session.id, active);
    if (child.pid) session.pid = child.pid;
    child.once("spawn", () => {
      if (child.pid) session.pid = child.pid;
      this.emit(session, `scrcpy process spawned${child.pid ? ` with PID ${child.pid}` : ""}.`);
      active.startupTimer = setTimeout(() => {
        if (session.state === "launching" && child.exitCode === null && child.signalCode === null) {
          session.startedAt = this.timestamp();
          this.transition(session, "running", "scrcpy passed the startup window and is running.");
        }
      }, this.startupWindowMs);
    });
    child.stdout.on("data", (chunk) => this.emitOutput(session, String(chunk)));
    child.stderr.on("data", (chunk) => {
      const message2 = String(chunk).trim();
      if (!message2) return;
      active.recentError = `${active.recentError}
${message2}`.trim().slice(-4e3);
      this.emitOutput(session, message2);
      if (session.state === "launching" && STARTUP_FATAL_PATTERN.test(message2)) {
        this.cleanup(session);
        this.fail(session, active.recentError, "launch-error");
        child.kill("SIGTERM");
      }
    });
    child.once("error", (error) => {
      if (TERMINAL_STATES.has(session.state)) return;
      this.cleanup(session);
      this.fail(session, error.message, "launch-error");
    });
    child.once("close", (code, signal) => {
      const previousState = session.state;
      const requestedStop = session.stopReason && session.stopReason !== "process-exit" && session.stopReason !== "launch-error";
      this.cleanup(session);
      if (TERMINAL_STATES.has(session.state)) return;
      session.exitCode = code ?? void 0;
      session.endedAt = this.timestamp();
      if (previousState === "stopping" || requestedStop) {
        this.transition(session, "stopped", `scrcpy stopped${signal ? ` with ${signal}` : ""}.`);
        return;
      }
      if (previousState === "launching" || previousState === "preflighting" || previousState === "queued") {
        this.fail(session, active.recentError || `scrcpy exited before it became ready (code ${code ?? "unknown"}).`, "launch-error");
        return;
      }
      if (code === 0) {
        session.stopReason = "process-exit";
        this.transition(session, "stopped", "scrcpy exited normally.");
      } else {
        this.fail(session, active.recentError || `scrcpy exited with code ${code ?? "unknown"}.`, "process-exit");
      }
    });
    return snapshot(session);
  }
  stop(id, reason = "user") {
    const session = this.sessions.get(id);
    const active = this.active.get(id);
    if (!session || !active || TERMINAL_STATES.has(session.state)) {
      return operationFailure("SESSION_NOT_ACTIVE", "session-stop", "No active scrcpy session found.");
    }
    if (session.state !== "stopping") {
      session.stopReason = reason;
      this.transition(session, "stopping", "Stopping scrcpy.");
    }
    active.child.kill("SIGTERM");
    active.forceStopTimer = setTimeout(() => {
      if (this.active.has(id)) active.child.kill("SIGKILL");
    }, this.stopGraceMs);
    return { ok: true };
  }
  stopBySerial(serial, reason = "user") {
    const normalized = serial.trim();
    const id = [...this.reservations.entries()].find(([, reservation]) => reservation.serial === normalized)?.[0];
    return id ? this.stop(id, reason) : operationFailure(
      "SESSION_NOT_ACTIVE",
      "session-stop",
      "No running scrcpy process found for this device."
    );
  }
  stopAll(reason = "app-quit") {
    for (const id of [...this.active.keys()]) this.stop(id, reason);
  }
  transition(session, state, message2) {
    if (!canTransitionSession(session.state, state)) {
      throw new Error(`Invalid session transition: ${session.state} -> ${state}.`);
    }
    session.state = state;
    this.emit(session, message2);
  }
  fail(session, error, reason) {
    if (!TERMINAL_STATES.has(session.state)) {
      session.error = error;
      session.stopReason = reason;
      session.endedAt = this.timestamp();
      this.transition(session, "failed", error);
    }
    return snapshot(session);
  }
  cleanup(session) {
    const active = this.active.get(session.id);
    if (active?.startupTimer) clearTimeout(active.startupTimer);
    if (active?.forceStopTimer) clearTimeout(active.forceStopTimer);
    this.active.delete(session.id);
    this.releaseConflict(session);
  }
  releaseConflict(session) {
    this.reservations.delete(session.id);
  }
  emitOutput(session, message2) {
    const trimmed = message2.trim();
    if (trimmed) this.emit(session, trimmed, "output");
  }
  emit(session, message2, type = "state") {
    const event = { type, session: snapshot(session), message: message2, timestamp: this.timestamp() };
    for (const listener of this.listeners) listener(event);
  }
  timestamp() {
    return this.now().toISOString();
  }
}
function parseScrcpyHelpFlags(help) {
  return [...help.matchAll(/^\s+(?:-[A-Za-z0-9?],\s+)?(--[a-z0-9-]+)/gim)].map((match) => match[1]).filter((flag, index, flags) => flags.indexOf(flag) === index).sort();
}
function buildCapabilitySnapshot(help, platform = process.platform) {
  const flags = parseScrcpyHelpFlags(help);
  const has = (flag) => flags.includes(flag);
  return {
    flags,
    features: {
      screen: has("--video-source"),
      camera: has("--video-source") && has("--camera-id") && has("--list-cameras"),
      virtualDisplay: has("--new-display"),
      recordOnly: has("--record") && has("--no-playback"),
      controlOnly: has("--no-video"),
      otg: has("--otg"),
      v4l2: platform === "linux" && has("--v4l2-sink"),
      appLaunch: has("--start-app") && has("--list-apps")
    },
    probes: {
      encoders: has("--list-encoders"),
      displays: has("--list-displays"),
      cameras: has("--list-cameras"),
      cameraSizes: has("--list-camera-sizes"),
      apps: has("--list-apps")
    }
  };
}
const MAX_TRACK_FRAME_BYTES = 2 * 1024 * 1024;
class AdbTrackFrameDecoder {
  constructor() {
    this.buffer = Buffer.alloc(0);
  }
  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const frames = [];
    while (this.buffer.length >= 4) {
      const prefix = this.buffer.subarray(0, 4).toString("ascii");
      if (!/^[0-9a-fA-F]{4}$/.test(prefix)) throw new Error(`Invalid adb track-devices frame prefix: ${JSON.stringify(prefix)}.`);
      const length = Number.parseInt(prefix, 16);
      if (length > MAX_TRACK_FRAME_BYTES) throw new Error("adb track-devices frame exceeded the 2 MB safety limit.");
      if (this.buffer.length < 4 + length) break;
      frames.push(this.buffer.subarray(4, 4 + length).toString("utf8"));
      this.buffer = this.buffer.subarray(4 + length);
    }
    if (this.buffer.length > MAX_TRACK_FRAME_BYTES + 4) throw new Error("adb track-devices buffer exceeded the 2 MB safety limit.");
    return frames;
  }
}
function parseTrackDevicesSnapshot(payload) {
  return parseAdbDevices(`List of devices attached
${payload}`);
}
function sameDevice(left, right) {
  return left.state === right.state && left.model === right.model && left.product === right.product && left.device === right.device && left.transportId === right.transportId && left.connection === right.connection;
}
function normalizedDevices(devices) {
  return [...new Map(devices.filter((device) => device.serial).map((device) => [device.serial, device])).values()];
}
class DeviceTracker {
  constructor(options = {}) {
    this.listeners = /* @__PURE__ */ new Set();
    this.executable = "";
    this.stopped = true;
    this.visible = true;
    this.generation = 0;
    this.consecutiveFailures = 0;
    this.revision = 0;
    this.devices = [];
    this.source = "track";
    this.hasSnapshot = false;
    this.spawnProcess = options.spawnProcess ?? node_child_process.spawn;
    this.pollDevices = options.pollDevices;
    this.onAdbOutput = options.onAdbOutput;
    this.restartBaseMs = options.restartBaseMs ?? 250;
    this.restartMaxMs = options.restartMaxMs ?? 1e4;
    this.pollVisibleMs = options.pollVisibleMs ?? 2e3;
    this.pollHiddenMs = options.pollHiddenMs ?? 1e4;
    this.fallbackAfterFailures = options.fallbackAfterFailures ?? 3;
    this.now = options.now ?? (() => /* @__PURE__ */ new Date());
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  start(executable) {
    const path = executable.trim();
    if (!path) throw new Error("adb executable not found.");
    if (!this.stopped && this.executable === path && (this.child || this.restartTimer || this.pollTimer)) return this.snapshot();
    this.stop(false);
    this.stopped = false;
    this.executable = path;
    this.consecutiveFailures = 0;
    this.source = "track";
    this.launchTrack();
    return this.snapshot();
  }
  stop(emit = true) {
    this.stopped = true;
    this.generation += 1;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.restartTimer = void 0;
    this.pollTimer = void 0;
    const child = this.child;
    this.child = void 0;
    child?.kill("SIGTERM");
    if (emit) this.emit("stopped", "Device tracking stopped.");
  }
  setVisible(visible) {
    this.visible = visible;
    if (this.source === "poll" && !this.stopped) this.schedulePoll(0);
  }
  snapshot() {
    return this.devices.map((device) => ({ ...device }));
  }
  synchronize(devices) {
    this.apply(devices, this.source, "ADB device snapshot refreshed.");
    return this.snapshot();
  }
  launchTrack() {
    if (this.stopped) return;
    const generation = ++this.generation;
    const decoder = new AdbTrackFrameDecoder();
    let stderr = "";
    let settled = false;
    this.source = "track";
    this.emit("starting", "Starting adb track-devices -l.");
    const child = this.spawnProcess(this.executable, ["track-devices", "-l"], {
      windowsHide: true,
      env: { ...process.env, LANG: "en_US.UTF-8" }
    });
    this.child = child;
    child.once("spawn", () => {
      if (generation === this.generation && !this.stopped) this.emit("tracking", "ADB tracker connected; waiting for device changes.");
    });
    child.stdout.on("data", (chunk) => {
      if (generation !== this.generation || this.stopped) return;
      try {
        for (const frame of decoder.push(chunk)) {
          this.consecutiveFailures = 0;
          this.apply(parseTrackDevicesSnapshot(frame), "track", "ADB device snapshot updated.");
        }
      } catch (error) {
        stderr = error instanceof Error ? error.message : String(error);
        child.kill("SIGTERM");
      }
    });
    child.stderr.on("data", (chunk) => {
      const output2 = String(chunk);
      this.onAdbOutput?.(output2);
      stderr = `${stderr}
${output2}`.trim().slice(-4e3);
    });
    const failed = (message2) => {
      if (settled || generation !== this.generation || this.stopped) return;
      settled = true;
      this.child = void 0;
      this.consecutiveFailures += 1;
      this.emit("error", message2);
      if (this.pollDevices && this.consecutiveFailures >= this.fallbackAfterFailures) {
        this.source = "poll";
        this.schedulePoll(0);
      } else {
        const delay2 = Math.min(this.restartBaseMs * 2 ** (this.consecutiveFailures - 1), this.restartMaxMs);
        this.emit("restarting", `ADB tracker exited; retrying in ${delay2} ms.`, delay2);
        this.restartTimer = setTimeout(() => {
          this.restartTimer = void 0;
          this.launchTrack();
        }, delay2);
      }
    };
    child.once("error", (error) => failed(error.message));
    child.once("close", (code, signal) => failed(stderr || `adb track-devices exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}.`));
  }
  schedulePoll(delay2 = this.visible ? this.pollVisibleMs : this.pollHiddenMs) {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    if (this.stopped || !this.pollDevices) return;
    this.pollTimer = setTimeout(async () => {
      this.pollTimer = void 0;
      try {
        this.apply(await this.pollDevices(), "poll", "ADB polling snapshot updated.");
      } catch (error) {
        this.emit("error", error instanceof Error ? error.message : String(error));
      }
      this.schedulePoll();
    }, delay2);
  }
  apply(nextValue, source, message2) {
    const next = normalizedDevices(nextValue);
    const previousBySerial = new Map(this.devices.map((device) => [device.serial, device]));
    const nextBySerial = new Map(next.map((device) => [device.serial, device]));
    const added = next.filter((device) => !previousBySerial.has(device.serial));
    const changed = next.filter((device) => {
      const previous = previousBySerial.get(device.serial);
      return previous ? !sameDevice(previous, device) : false;
    });
    const removed = this.devices.filter((device) => !nextBySerial.has(device.serial));
    const changedSnapshot = added.length > 0 || changed.length > 0 || removed.length > 0 || !this.hasSnapshot;
    this.devices = next;
    this.source = source;
    this.hasSnapshot = true;
    if (!changedSnapshot) return;
    this.revision += 1;
    this.emit("tracking", message2, void 0, { added, changed, removed });
  }
  emit(status, message2, retryInMs, delta = { added: [], changed: [], removed: [] }) {
    const event = {
      status,
      source: this.source,
      devices: this.snapshot(),
      added: delta.added.map((device) => ({ ...device })),
      changed: delta.changed.map((device) => ({ ...device })),
      removed: delta.removed.map((device) => ({ ...device })),
      revision: this.revision,
      timestamp: this.now().toISOString(),
      message: message2,
      retryInMs
    };
    for (const listener of this.listeners) listener(event);
  }
}
class CommandExecutionError extends Error {
  constructor(message2, exitCode) {
    super(message2);
    this.exitCode = exitCode;
    this.name = "CommandExecutionError";
  }
}
function executableName(binary) {
  return process.platform === "win32" ? `${binary}.exe` : binary;
}
async function canExecute(path) {
  try {
    await promises.access(path, process.platform === "win32" ? node_fs.constants.F_OK : node_fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
async function resolveBinary(runtime, binary) {
  const name = executableName(binary);
  const configured = runtime.scrcpyPath.trim();
  const candidates = [];
  if (configured && node_fs.existsSync(configured)) {
    const stats = node_fs.statSync(configured);
    if (stats.isDirectory()) candidates.push(node_path.join(configured, name));
    else if (binary === "scrcpy") candidates.push(configured);
    else candidates.push(node_path.join(node_path.dirname(configured), name));
  }
  if (process.resourcesPath) candidates.push(node_path.join(process.resourcesPath, "scrcpy", name));
  candidates.push(node_path.join(electron.app.getPath("userData"), "bin", name));
  const pathFolders = (process.env.PATH || process.env.Path || "").split(node_path.delimiter).filter(Boolean);
  if (process.platform === "darwin") pathFolders.push("/opt/homebrew/bin", "/usr/local/bin", "/opt/local/bin");
  if (process.platform !== "win32") pathFolders.push("/usr/local/bin", "/usr/bin");
  if (binary === "adb") {
    const sdkRoots = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT].filter(Boolean);
    sdkRoots.push(node_path.join(node_os.homedir(), "Library/Android/sdk"), node_path.join(node_os.homedir(), "Android/Sdk"));
    for (const root of sdkRoots) candidates.push(node_path.join(root, "platform-tools", name));
  }
  for (const folder of pathFolders) candidates.push(node_path.join(folder, name));
  for (const candidate of [...new Set(candidates)]) {
    if (await canExecute(candidate)) return candidate;
  }
  return "";
}
function executeCommand(file, args, timeout = 15e3, maxBuffer = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    node_child_process.execFile(
      file,
      args,
      { timeout, windowsHide: true, maxBuffer, env: { ...process.env, LANG: "en_US.UTF-8" } },
      (error, stdout, stderr) => {
        if (error) {
          const details = String(stderr || stdout || error.message).trim();
          reject(new CommandExecutionError(details, typeof error.code === "number" ? error.code : void 0));
          return;
        }
        resolve({ stdout: String(stdout), stderr: String(stderr) });
      }
    );
  });
}
const DAEMON_START_PATTERN = /daemon not running|daemon started successfully/i;
let serverStartedByApp = false;
function noteAdbOutput(output2) {
  if (DAEMON_START_PATTERN.test(output2)) serverStartedByApp = true;
}
function adbServerStartedByApp() {
  return serverStartedByApp;
}
function forgetAdbServerOwnership() {
  serverStartedByApp = false;
}
class AdbService {
  async run(runtime, args, options = {}) {
    const executable = await resolveBinary(runtime, "adb");
    if (!executable) throw new Error("adb executable not found.");
    try {
      const result = await executeCommand(executable, args, options.timeout, options.maxBuffer);
      noteAdbOutput(`${result.stdout}
${result.stderr}`);
      return result;
    } catch (error) {
      noteAdbOutput(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  runForDevice(runtime, serial, args, options) {
    return this.run(runtime, ["-s", serial, ...args], options);
  }
}
const adbService = new AdbService();
const sessionManager = new ScrcpySessionManager();
const MAX_SCREENSHOT_BYTES = 64 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
let trackerRuntime = { scrcpyPath: "" };
const deviceTracker = new DeviceTracker({
  onAdbOutput: noteAdbOutput,
  pollDevices: async () => {
    const result = await listDevices(trackerRuntime);
    if (!result.ok) throw new Error(operationErrorMessage(result, "Unable to poll ADB devices."));
    return result.data || [];
  }
});
const CONTROL_KEYCODES = {
  back: "KEYCODE_BACK",
  home: "KEYCODE_HOME",
  "app-switch": "KEYCODE_APP_SWITCH",
  menu: "KEYCODE_MENU",
  "volume-up": "KEYCODE_VOLUME_UP",
  "volume-down": "KEYCODE_VOLUME_DOWN",
  power: "KEYCODE_POWER",
  "screen-on": "KEYCODE_WAKEUP",
  "screen-off": "KEYCODE_SLEEP"
};
function firstVersionLine(output2, prefix) {
  return output2.split(/\r?\n/).map((line) => line.trim()).find((line) => line.toLowerCase().startsWith(prefix)) || output2.trim().split(/\r?\n/)[0] || "";
}
async function getEnvironment(runtime) {
  const scrcpyPath = await resolveBinary(runtime, "scrcpy");
  const adbPath = await resolveBinary(runtime, "adb");
  const status = {
    scrcpy: { ok: false, path: scrcpyPath, version: "", error: "" },
    adb: { ok: false, path: adbPath, version: "", error: "" }
  };
  if (!scrcpyPath) {
    status.scrcpy.error = "scrcpy executable not found. Choose it in Runtime setup or add it to PATH.";
  } else {
    try {
      const result = await executeCommand(scrcpyPath, ["--version"]);
      status.scrcpy.version = firstVersionLine(`${result.stdout}
${result.stderr}`, "scrcpy");
      status.scrcpy.ok = isSupportedScrcpyVersion(status.scrcpy.version);
      if (!status.scrcpy.ok) {
        status.scrcpy.error = `scrcpy 4.x or newer is required; found ${status.scrcpy.version || "an unknown version"}.`;
      } else {
        try {
          const help = await executeCommand(scrcpyPath, ["--help"]);
          status.scrcpy.capabilities = buildCapabilitySnapshot(`${help.stdout}
${help.stderr}`);
        } catch (error) {
          status.scrcpy.capabilities = buildCapabilitySnapshot("");
          status.scrcpy.capabilityError = error instanceof Error ? error.message : String(error);
        }
      }
    } catch (error) {
      status.scrcpy.error = error instanceof Error ? error.message : String(error);
    }
  }
  if (!adbPath) {
    status.adb.error = "adb executable not found. Install Android platform-tools or use a scrcpy bundle containing adb.";
  } else {
    try {
      const result = await executeCommand(adbPath, ["version"]);
      status.adb.ok = true;
      const adbOutput = `${result.stdout}\n${result.stderr}`;
      status.adb.version = adbOutput.split(/\r?\n/).map((line) => line.trim()).find((line) => /^Version\s+\d+\.\d+\.\d+/i.test(line)) || firstVersionLine(adbOutput, "android debug bridge");
    } catch (error) {
      status.adb.error = error instanceof Error ? error.message : String(error);
    }
  }
  return status;
}
const UPDATE_USER_AGENT = "UltimateSCRCPYGui";
const UPDATE_APP_REPO = { owner: "Ryuupyroxi", repo: "U-S-G-Ultimate-SCRCPYGui" };
const UPDATE_SCRCPY_REPO = { owner: "Genymobile", repo: "scrcpy" };
const UPDATE_ADB_REPOSITORY_XML = "https://dl.google.com/android/repository/repository2-3.xml";
const UPDATE_ADB_DOWNLOAD_BASE = "https://dl.google.com/android/repository/";
function httpGet(url, headers = {}, redirects = 5) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      reject(new TypeError("Invalid URL."));
      return;
    }
    const request = node_https.request(parsed, {
      method: "GET",
      headers: { "User-Agent": UPDATE_USER_AGENT, Accept: "*/*", ...headers }
    }, (response) => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location && redirects > 0) {
        response.resume();
        resolve(httpGet(new URL(response.headers.location, parsed).toString(), headers, redirects - 1));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      response.on("end", () => resolve({ status, headers: response.headers, body: Buffer.concat(chunks) }));
      response.on("error", reject);
    });
    request.on("timeout", () => request.destroy(new Error("Request timed out.")));
    request.on("error", reject);
    request.setTimeout(3e4);
    request.end();
  });
}
function downloadToFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = node_fs.createWriteStream(dest);
    const request = node_https.get(url, { headers: { "User-Agent": UPDATE_USER_AGENT, Accept: "*/*" } }, (response) => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        file.close();
        node_fs.promises.unlink(dest).catch(() => {
        }).finally(() => resolve(downloadToFile(response.headers.location, dest)));
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        file.close();
        reject(new Error(`Download failed (HTTP ${status}).`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
      file.on("error", (error) => {
        file.close();
        reject(error);
      });
    });
    request.on("error", (error) => {
      file.close();
      reject(error);
    });
  });
}
function parseVersion(value) {
  const match = String(value ?? "").match(/(\d+)\.(\d+)(?:\.(\d+))?(?:[-+.]?([0-9A-Za-z.-]+))?/);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3] || 0), prerelease: match[4] || "" };
}
function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return null;
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] - b[key];
  }
  if (a.prerelease === b.prerelease) return 0;
  if (!a.prerelease) return 1;
  if (!b.prerelease) return -1;
  return a.prerelease.localeCompare(b.prerelease);
}
function stripVersionPrefix(value) {
  const match = String(value ?? "").match(/(\d+\.\d+(?:\.\d+)?(?:[-+][0-9A-Za-z.-]+)?)/);
  return match ? match[1] : "";
}
function scrcpyInstalledVersion(value) {
  const match = String(value ?? "").match(/scrcpy\s+(\d+\.\d+(?:\.\d+)?)/i);
  return match ? match[1] : "";
}
function adbInstalledVersion(value) {
  const match = String(value ?? "").match(/^\s*Version\s+(\d+\.\d+\.\d+)/im);
  return match ? match[1] : "";
}
function pickScrcpyAsset(assets) {
  const patterns = {
    "linux-x64": /^scrcpy-linux-x86_64-.*\.tar\.gz$/i,
    "linux-arm64": /^scrcpy-linux-aarch64-.*\.tar\.gz$/i,
    "darwin-arm64": /^scrcpy-macos-aarch64-.*\.tar\.gz$/i,
    "darwin-x64": /^scrcpy-macos-x86_64-.*\.tar\.gz$/i,
    "win32-x64": /^scrcpy-win64-.*\.zip$/i,
    "win32-arm64": /^scrcpy-winarm64-.*\.zip$/i,
    "win32-ia32": /^scrcpy-win32-.*\.zip$/i
  };
  const pattern = patterns[`${process.platform}-${process.arch}`];
  if (!pattern) return null;
  return assets.find((asset) => pattern.test(asset.name)) || null;
}
function pickAppAsset(assets) {
  if (process.platform !== "linux") return null;
  return assets.find((asset) => /\.appimage$/i.test(asset.name)) || null;
}
async function githubLatestRelease(repo) {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`;
  const response = await httpGet(url, { Accept: "application/vnd.github+json" });
  if (response.status === 404) return null;
  if (response.status < 200 || response.status >= 300) throw new Error(`GitHub returned HTTP ${response.status}.`);
  return JSON.parse(response.body.toString("utf8"));
}
function updateItem(id, name, installed, latest, available, extra = {}) {
  return { id, name, installed, latest, available: Boolean(available), ...extra };
}
async function checkAppUpdate() {
  const installed = electron.app.getVersion();
  try {
    const release = await githubLatestRelease(UPDATE_APP_REPO);
    if (!release) return updateItem("app", "UltimateSCRCPYGui", installed, "", false, { error: "No GitHub release found for this repository yet." });
    const latest = stripVersionPrefix(release.tag_name || release.name || "");
    const comparison = compareVersions(installed, latest);
    const asset = pickAppAsset(release.assets || []);
    return updateItem("app", "UltimateSCRCPYGui", installed, latest, comparison !== null && comparison < 0, {
      url: release.html_url || "",
      assetUrl: asset?.browser_download_url || "",
      error: comparison !== null && comparison < 0 && !asset ? "No AppImage asset found in the release." : ""
    });
  } catch (error) {
    return updateItem("app", "UltimateSCRCPYGui", installed, "", false, { error: error instanceof Error ? error.message : String(error) });
  }
}
async function checkScrcpyUpdate(installedVersionRaw) {
  const installed = scrcpyInstalledVersion(installedVersionRaw);
  try {
    const release = await githubLatestRelease(UPDATE_SCRCPY_REPO);
    if (!release) return updateItem("scrcpy", "scrcpy", installed, "", false, { error: "No release found." });
    const latest = stripVersionPrefix(release.tag_name || "");
    const asset = pickScrcpyAsset(release.assets || []);
    const comparison = compareVersions(installed, latest);
    return updateItem("scrcpy", "scrcpy", installed, latest, comparison !== null && comparison < 0 && Boolean(asset), {
      url: asset?.browser_download_url || release.html_url || "",
      error: !asset ? "No matching platform asset found." : ""
    });
  } catch (error) {
    return updateItem("scrcpy", "scrcpy", installed, "", false, { error: error instanceof Error ? error.message : String(error) });
  }
}
async function checkAdbUpdate(installedVersionRaw) {
  const installed = adbInstalledVersion(installedVersionRaw);
  try {
    const response = await httpGet(UPDATE_ADB_REPOSITORY_XML);
    if (response.status < 200 || response.status >= 300) throw new Error(`Repository returned HTTP ${response.status}.`);
    const xml = response.body.toString("utf8");
    const block = xml.match(/<remotePackage[^>]*path="platform-tools"[^>]*>([\s\S]*?)<\/remotePackage>/);
    if (!block) throw new Error("platform-tools entry not found.");
    const revision = block[1].match(/<revision>([\s\S]*?)<\/revision>/)?.[1] || "";
    const latest = `${revision.match(/<major>(\d+)<\/major>/)?.[1] || "0"}.${revision.match(/<minor>(\d+)<\/minor>/)?.[1] || "0"}.${revision.match(/<micro>(\d+)<\/micro>/)?.[1] || "0"}`;
    const archive = block[1].match(/<url>(platform-tools_[^<]*linux[^<]*)<\/url>/i);
    const url = archive ? `${UPDATE_ADB_DOWNLOAD_BASE}${archive[1]}` : "";
    const comparison = compareVersions(installed, latest);
    return updateItem("adb", "adb", installed, latest, comparison !== null && comparison < 0 && Boolean(url), {
      url,
      error: url ? "" : "No Linux archive found."
    });
  } catch (error) {
    return updateItem("adb", "adb", installed, "", false, { error: error instanceof Error ? error.message : String(error) });
  }
}
async function checkForUpdates(runtime) {
  const environment = await getEnvironment(runtime);
  const [app, scrcpy, adb] = await Promise.all([
    checkAppUpdate(),
    checkScrcpyUpdate(environment.scrcpy.version),
    checkAdbUpdate(environment.adb.version)
  ]);
  return [app, scrcpy, adb];
}
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = node_child_process.spawn(command, args, { windowsHide: true, ...options });
    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} failed (${code}): ${stderr.trim()}`));
    });
  });
}
async function targetBinaryDirectory() {
  const bundled = process.resourcesPath ? node_path.join(process.resourcesPath, "scrcpy") : node_path.join(electron.app.getAppPath(), "resources", "scrcpy");
  try {
    await promises.access(bundled, node_fs.constants.W_OK);
    return bundled;
  } catch {
    const fallback = node_path.join(electron.app.getPath("userData"), "bin");
    await promises.mkdir(fallback, { recursive: true });
    return fallback;
  }
}
async function replaceBinary(source, destination) {
  const temp = `${destination}.ultimate-${process.pid}-${Date.now()}`;
  try {
    await promises.copyFile(source, temp);
    await promises.chmod(temp, 493);
    await promises.rename(temp, destination);
  } catch (error) {
    await promises.rm(temp, { force: true });
    throw error;
  }
}
function runningAppImagePath() {
  return process.env.APPIMAGE || "";
}
function bundledToolsDirectory() {
  const base = process.resourcesPath || node_path.join(electron.app.getAppPath(), "resources");
  return node_path.join(base, "tools");
}
function mksquashfsCommand() {
  const bundled = node_path.join(bundledToolsDirectory(), "mksquashfs");
  if (node_fs.existsSync(bundled)) {
    const libDir = node_path.join(bundledToolsDirectory(), "lib");
    const libraryPath = [libDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(node_path.delimiter);
    return { command: bundled, env: { ...process.env, LD_LIBRARY_PATH: libraryPath } };
  }
  return { command: "mksquashfs", env: process.env };
}
function streamPipeline(source, destination) {
  return new Promise((resolve, reject) => {
    source.pipe(destination);
    destination.on("finish", resolve);
    destination.on("error", reject);
    source.on("error", reject);
  });
}
async function findSquashfsOffset(file) {
  const handle = await promises.open(file, "r");
  try {
    const header = Buffer.alloc(64);
    await handle.read(header, 0, 64, 0);
    if (header.toString("latin1", 0, 4) !== "\x7fELF" || header[4] !== 2) return -1;
    const programOffset = Number(header.readBigUInt64LE(0x20));
    const programEntrySize = header.readUInt16LE(0x36);
    const programCount = header.readUInt16LE(0x38);
    const entry = Buffer.alloc(programEntrySize);
    let runtimeEnd = 0;
    for (let index = 0; index < programCount; index++) {
      await handle.read(entry, 0, programEntrySize, programOffset + index * programEntrySize);
      if (entry.readUInt32LE(0) !== 1) continue;
      const offset = Number(entry.readBigUInt64LE(8));
      const size = Number(entry.readBigUInt64LE(32));
      runtimeEnd = Math.max(runtimeEnd, offset + size);
    }
    if (runtimeEnd <= 0) return -1;
    const buffer = Buffer.alloc(8 * 1024 * 1024);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, runtimeEnd);
    const index = buffer.subarray(0, bytesRead).indexOf("hsqs");
    return index >= 0 ? runtimeEnd + index : -1;
  } finally {
    await handle.close();
  }
}
async function rebuildAppImage(appImage, replacements) {
  if (!appImage) return { ok: false, error: "Not running from an AppImage." };
  const offset = await findSquashfsOffset(appImage);
  if (offset <= 0) return { ok: false, error: "Could not locate the AppImage filesystem." };
  const tempDir = await promises.mkdtemp(node_path.join(node_os.tmpdir(), "ultimate-scrcpy-rebuild-"));
  try {
    await runCommand(appImage, ["--appimage-extract"], { cwd: tempDir });
    const root = node_path.join(tempDir, "squashfs-root");
    const bundleDir = node_path.join(root, "resources", "scrcpy");
    await promises.mkdir(bundleDir, { recursive: true });
    for (const replacement of replacements) {
      await replaceBinary(replacement.source, node_path.join(bundleDir, replacement.name));
    }
    const squashfs = node_path.join(tempDir, "bundle.sqfs");
    const mksquashfs = mksquashfsCommand();
    await runCommand(mksquashfs.command, [root, squashfs, "-comp", "gzip", "-root-mode", "755", "-noappend", "-quiet"], { env: mksquashfs.env });
    const staged = `${appImage}.ultimate-new`;
    const handle = await promises.open(appImage, "r");
    const runtime = Buffer.alloc(offset);
    await handle.read(runtime, 0, offset, 0);
    await handle.close();
    const output = node_fs.createWriteStream(staged);
    output.write(runtime);
    await streamPipeline(node_fs.createReadStream(squashfs), output);
    await promises.chmod(staged, 493);
    try {
      await promises.rename(staged, appImage);
      return { ok: true, path: appImage, replaced: true };
    } catch {
      return { ok: true, path: staged, replaced: false };
    }
  } finally {
    await runCommand("rm", ["-rf", tempDir]).catch(() => {
    });
  }
}
async function downloadScrcpyUpdate(url) {
  const tempDir = await promises.mkdtemp(node_path.join(node_os.tmpdir(), "ultimate-scrcpy-scrcpy-"));
  try {
    const archive = node_path.join(tempDir, "scrcpy.tar.gz");
    await downloadToFile(url, archive);
    await runCommand("tar", ["-xzf", archive, "-C", tempDir]);
    const entries = await promises.readdir(tempDir);
    const extracted = entries.find((entry) => entry !== "scrcpy.tar.gz");
    if (!extracted) throw new Error("The scrcpy archive did not contain an expected folder.");
    const sourceDir = node_path.join(tempDir, extracted);
    return { tempDir, replacements: ["scrcpy", "scrcpy-server"].map((name) => ({ name, source: node_path.join(sourceDir, name) })) };
  } catch (error) {
    await promises.rm(tempDir, { recursive: true, force: true }).catch(() => {
    });
    throw error;
  }
}
async function downloadAdbUpdate(url) {
  const tempDir = await promises.mkdtemp(node_path.join(node_os.tmpdir(), "ultimate-scrcpy-adb-"));
  try {
    const archive = node_path.join(tempDir, "platform-tools.zip");
    await downloadToFile(url, archive);
    await runCommand("unzip", ["-o", archive, "-d", tempDir]);
    return { tempDir, replacements: [{ name: "adb", source: node_path.join(tempDir, "platform-tools", "adb") }] };
  } catch (error) {
    await promises.rm(tempDir, { recursive: true, force: true }).catch(() => {
    });
    throw error;
  }
}
async function updateApp(item) {
  if (!item.assetUrl) throw new Error("No download asset found for this release.");
  const updatesDir = node_path.join(electron.app.getPath("userData"), "updates");
  await promises.mkdir(updatesDir, { recursive: true });
  const fileName = item.assetUrl.split("/").pop() || `UltimateSCRCPYGui-${item.latest}.AppImage`;
  const destination = node_path.join(updatesDir, decodeURIComponent(fileName));
  await downloadToFile(item.assetUrl, destination);
  await promises.chmod(destination, 493);
  return destination;
}
async function applyUpdates(runtime, items) {
  const results = [];
  const replacements = [];
  const tempDirs = [];
  for (const item of Array.isArray(items) ? items : []) {
    if (!item.available) {
      results.push({ id: item.id, ok: true, skipped: true });
      continue;
    }
    try {
      if (item.id === "scrcpy") {
        const download = await downloadScrcpyUpdate(item.url);
        tempDirs.push(download.tempDir);
        replacements.push(...download.replacements);
        results.push({ id: item.id, ok: true });
      } else if (item.id === "adb") {
        const download = await downloadAdbUpdate(item.url);
        tempDirs.push(download.tempDir);
        replacements.push(...download.replacements);
        results.push({ id: item.id, ok: true });
      } else if (item.id === "app") {
        const path = await updateApp(item);
        results.push({ id: item.id, ok: true, path });
      } else {
        results.push({ id: item.id, ok: false, error: "Unknown component." });
      }
    } catch (error) {
      results.push({ id: item.id, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }
  if (replacements.length) {
    const target = await targetBinaryDirectory();
    for (const replacement of replacements) {
      await replaceBinary(replacement.source, node_path.join(target, replacement.name));
    }
    const appImage = runningAppImagePath();
    if (appImage) {
      const bundle = await rebuildAppImage(appImage, replacements);
      for (const result of results) if (result.ok && result.id !== "app") result.appImage = bundle;
    }
    if (replacements.some((replacement) => replacement.name === "adb")) {
      try {
        await adbCommand(runtime, ["kill-server"]);
        await adbCommand(runtime, ["start-server"]);
      } catch {
      }
    }
  }
  for (const tempDir of tempDirs) {
    await promises.rm(tempDir, { recursive: true, force: true }).catch(() => {
    });
  }
  return results;
}
async function adbCommand(runtime, args) {
  return adbService.run(runtime, args);
}
function executeBinary(file, args, timeout = 2e4) {
  return new Promise((resolve, reject) => {
    const child = node_child_process.spawn(file, args, { windowsHide: true, env: { ...process.env, LANG: "en_US.UTF-8" } });
    const stdout = [];
    const stderr = [];
    let size2 = 0;
    let settled = false;
    const timer = setTimeout(() => {
      child.kill();
      if (!settled) {
        settled = true;
        reject(new Error("adb screenshot timed out."));
      }
    }, timeout);
    child.stdout.on("data", (chunk) => {
      size2 += chunk.length;
      if (size2 > MAX_SCREENSHOT_BYTES) {
        child.kill();
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error("Device screenshot exceeded the 64 MB safety limit."));
        }
        return;
      }
      stdout.push(chunk);
    });
    child.stderr.on("data", (chunk) => {
      noteAdbOutput(String(chunk));
      stderr.push(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString().trim() || `adb exited with code ${code ?? "unknown"}.`));
        return;
      }
      resolve(Buffer.concat(stdout));
    });
  });
}
const screenshotCommandExecutor = {
  binary: executeBinary,
  command: executeCommand
};
function isPngScreenshot(data) {
  return data.length >= PNG_SIGNATURE.length && data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);
}
function screenshotFailureMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
async function captureScreenshotThroughFile(adbPath, serial, executor) {
  const remotePath = `/data/local/tmp/scrcpy-gui-${node_crypto.randomUUID()}.png`;
  const localDirectory = await promises.mkdtemp(node_path.join(node_os.tmpdir(), "scrcpy-gui-screenshot-"));
  const localPath = node_path.join(localDirectory, "screenshot.png");
  try {
    await executor.command(adbPath, ["-s", serial, "shell", "screencap", "-p", remotePath], 2e4);
    await executor.command(adbPath, ["-s", serial, "pull", remotePath, localPath], 2e4);
    const captured = await promises.stat(localPath);
    if (captured.size > MAX_SCREENSHOT_BYTES) {
      throw new Error("Device screenshot exceeded the 64 MB safety limit.");
    }
    return promises.readFile(localPath);
  } finally {
    await executor.command(adbPath, ["-s", serial, "shell", "rm", "-f", remotePath], 5e3).catch(() => void 0);
    await promises.rm(localDirectory, { recursive: true, force: true }).catch(() => void 0);
  }
}
async function captureScreenshotPng(adbPath, serial, executor = screenshotCommandExecutor) {
  const target = serial.trim();
  let directFailure;
  try {
    const direct = await executor.binary(adbPath, ["-s", target, "exec-out", "screencap", "-p"]);
    if (isPngScreenshot(direct)) return direct;
    directFailure = new Error(`ADB returned ${direct.length} bytes without a PNG signature.`);
  } catch (error) {
    directFailure = error;
  }
  try {
    const fallback = await captureScreenshotThroughFile(adbPath, target, executor);
    if (isPngScreenshot(fallback)) return fallback;
    throw new Error(`ADB pulled ${fallback.length} bytes without a PNG signature.`);
  } catch (fallbackFailure) {
    throw new Error(
      `The device did not return a valid PNG screenshot. Direct capture: ${screenshotFailureMessage(directFailure)} File fallback: ${screenshotFailureMessage(fallbackFailure)}`
    );
  }
}
async function listDevices(runtime) {
  try {
    const result = await adbCommand(runtime, ["devices", "-l"]);
    return { ok: true, data: deviceTracker.synchronize(parseAdbDevices(result.stdout)) };
  } catch (error) {
    return failureFromUnknown(error, "ADB_LIST_FAILED", "device-list", "Unable to list Android devices.", {
      retryable: true,
      suggestedActions: ["Recheck the runtime setup.", "Reconnect the device and try again."]
    });
  }
}
async function startDeviceTracker(runtime) {
  trackerRuntime = runtime;
  const adbPath = await resolveBinary(runtime, "adb");
  if (!adbPath) return operationFailure("ADB_NOT_FOUND", "device-tracker", "adb executable not found.", {
    suggestedActions: ["Recheck the runtime setup."]
  });
  try {
    return { ok: true, data: deviceTracker.start(adbPath) };
  } catch (error) {
    return failureFromUnknown(error, "DEVICE_TRACKER_START_FAILED", "device-tracker", "Unable to start device tracking.", {
      retryable: true,
      suggestedActions: ["Recheck the runtime setup.", "Try refreshing devices manually."]
    });
  }
}
function subscribeDeviceTrackerEvents(listener) {
  return deviceTracker.subscribe(listener);
}
function setDeviceTrackerVisibility(visible) {
  deviceTracker.setVisible(visible);
}
function stopDeviceTracker() {
  deviceTracker.stop();
}
function listTrackedDevices() {
  return deviceTracker.snapshot();
}
async function stopAdbServer(runtime) {
  try {
    await adbCommand(runtime, ["kill-server"]);
  } catch {
  } finally {
    forgetAdbServerOwnership();
  }
}
async function connectDevice(runtime, target) {
  const address = target.trim();
  if (!validateDeviceAddress(address)) {
    return operationFailure("INVALID_DEVICE_ADDRESS", "validation", "Enter a valid host and optional port (1-65535).");
  }
  try {
    const result = await adbCommand(runtime, ["connect", address]);
    const output2 = `${result.stdout}
${result.stderr}`.trim();
    const ok2 = /connected to|already connected to/i.test(output2);
    return ok2 ? { ok: true, data: output2 } : operationFailure("ADB_CONNECT_FAILED", "device-connect", "adb connect failed.", {
      detail: output2 || void 0,
      retryable: true,
      suggestedActions: ["Confirm wireless debugging is enabled.", "Verify that the host and port are reachable."]
    });
  } catch (error) {
    return failureFromUnknown(error, "ADB_CONNECT_FAILED", "device-connect", "Unable to connect to the device.", {
      retryable: true,
      suggestedActions: ["Confirm wireless debugging is enabled.", "Verify that the host and port are reachable."]
    });
  }
}
async function pairDevice(runtime, target, code) {
  const address = target.trim();
  if (!validateDeviceAddress(address, true)) {
    return operationFailure("INVALID_PAIR_ADDRESS", "validation", "Pairing requires a valid host:port.");
  }
  if (!/^\d{6}$/.test(code.trim())) {
    return operationFailure("INVALID_PAIRING_CODE", "validation", "Pairing code must contain exactly six digits.");
  }
  try {
    const result = await adbCommand(runtime, ["pair", address, code.trim()]);
    const output2 = `${result.stdout}
${result.stderr}`.trim();
    const ok2 = /successfully paired/i.test(output2);
    return ok2 ? { ok: true, data: output2 } : operationFailure("ADB_PAIR_FAILED", "device-pair", "adb pair failed.", {
      detail: output2 || void 0,
      retryable: true,
      suggestedActions: ["Request a new pairing code.", "Verify that the pairing host and port are correct."]
    });
  } catch (error) {
    return failureFromUnknown(error, "ADB_PAIR_FAILED", "device-pair", "Unable to pair the device.", {
      retryable: true,
      suggestedActions: ["Request a new pairing code.", "Verify that the pairing host and port are correct."]
    });
  }
}
async function disconnectDevice(runtime, target) {
  const address = target.trim();
  if (!validateDeviceAddress(address)) {
    return operationFailure("INVALID_DEVICE_ADDRESS", "validation", "Enter a valid wireless device address.");
  }
  try {
    const result = await adbCommand(runtime, ["disconnect", address]);
    const output2 = `${result.stdout}
${result.stderr}`.trim();
    return { ok: true, data: output2 };
  } catch (error) {
    return failureFromUnknown(error, "ADB_DISCONNECT_FAILED", "device-disconnect", "Unable to disconnect the device.", {
      retryable: true,
      suggestedActions: ["Refresh the device list and try again."]
    });
  }
}
const PRIVATE_IP = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/;
const MOBILE_IFACE = /^(?:rmnet|ccmni|usb|rndis|data|wwan)/i;
function wifiRouteIp(stdout) {
  for (const line of (stdout || "").split("\n")) {
    const device = line.match(/\bdev\s+([A-Za-z0-9._-]+)/);
    if (device && MOBILE_IFACE.test(device[1])) continue;
    const match = line.match(/\bsrc\s+(\d{1,3}(?:\.\d{1,3}){3})/);
    if (match && PRIVATE_IP.test(match[1])) return match[1];
  }
  return "";
}
async function enableLegacyWireless(runtime, serial) {
  const target = serial.trim();
  if (!target) return operationFailure("DEVICE_REQUIRED", "validation", "Choose a device first.");
  try {
    const tcpip = await adbCommand(runtime, ["-s", target, "tcpip", "5555"]);
    const tcpipOutput = `${tcpip.stdout}\n${tcpip.stderr}`.trim();
    let ip = "";
    const probes = [
      ["ip", "addr", "show", "wlan0"],
      ["ifconfig", "wlan0"],
      ["ip", "route"]
    ];
    for (let attempt = 0; attempt < 3 && !ip; attempt++) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1000));
      for (const probe of probes) {
        if (ip) break;
        try {
          const result = await adbCommand(runtime, ["-s", target, "shell", ...probe]);
          const text = `${result.stdout}\n${result.stderr}`;
          if (probe[0] === "ip" && probe[1] === "route") {
            ip = wifiRouteIp(text);
          } else {
            const match = text.match(/inet\s+(?:addr:)?(\d{1,3}(?:\.\d{1,3}){3})/);
            if (match && PRIVATE_IP.test(match[1])) ip = match[1];
          }
        } catch {
        }
      }
    }
    if (!ip) {
      return operationFailure("ADB_LEGACY_IP_FAILED", "device-legacy-wireless", "Could not determine the device Wi-Fi IP address.", {
        detail: tcpipOutput || void 0,
        retryable: true,
        suggestedActions: ["Confirm the device is connected to Wi-Fi.", "Enter the address manually and use Connect."]
      });
    }
    const connectResult = await adbCommand(runtime, ["connect", `${ip}:5555`]);
    const connectOutput = `${connectResult.stdout}\n${connectResult.stderr}`.trim();
    const connected = /connected to|already connected to/i.test(connectOutput);
    if (!connected) {
      return operationFailure("ADB_LEGACY_CONNECT_FAILED", "device-legacy-wireless", "adb connect failed.", {
        detail: connectOutput || void 0,
        retryable: true,
        suggestedActions: ["Confirm the device and computer are on the same Wi-Fi network.", "Reconnect the USB cable and try again."]
      });
    }
    return { ok: true, data: { ip, port: 5555 } };
  } catch (error) {
    return failureFromUnknown(error, "ADB_LEGACY_WIRELESS_FAILED", "device-legacy-wireless", "Unable to enable wireless ADB.", {
      retryable: true,
      suggestedActions: ["Confirm the device is connected via USB.", "Retry the operation."]
    });
  }
}
async function deviceSdk(runtime, serial) {
  const target = serial.trim();
  if (!target) return operationFailure("DEVICE_REQUIRED", "validation", "Choose a device first.");
  try {
    const sdkResult = await adbCommand(runtime, ["-s", target, "shell", "getprop", "ro.build.version.sdk"]);
    const sdk = Number((sdkResult.stdout || "").trim());
    if (!Number.isFinite(sdk)) {
      return operationFailure("ADB_SDK_PROBE_FAILED", "device-sdk", "Could not read the Android version.", {
        detail: `${sdkResult.stdout}\n${sdkResult.stderr}`.trim() || void 0,
        retryable: true,
        suggestedActions: ["Confirm the device is connected and authorized."]
      });
    }
    let release = "";
    try {
      const releaseResult = await adbCommand(runtime, ["-s", target, "shell", "getprop", "ro.build.version.release"]);
      release = (releaseResult.stdout || "").trim();
    } catch {
    }
    return { ok: true, data: { serial: target, sdk, release } };
  } catch (error) {
    return failureFromUnknown(error, "ADB_SDK_PROBE_FAILED", "device-sdk", "Unable to read the Android version.", {
      retryable: true,
      suggestedActions: ["Confirm the device is connected and authorized."]
    });
  }
}
async function rotateDevice(runtime, serial) {
  const state = await adbCommand(runtime, ["-s", serial, "shell", "dumpsys", "input"]);
  const output2 = `${state.stdout}
${state.stderr}`;
  const match = output2.match(/SurfaceOrientation:\s*([0-3])/i) || output2.match(/orientation=([0-3])/i);
  const next = ((match ? Number(match[1]) : 0) + 1) % 4;
  try {
    await adbCommand(runtime, ["-s", serial, "shell", "wm", "user-rotation", "lock", String(next)]);
  } catch {
    await adbCommand(runtime, ["-s", serial, "shell", "settings", "put", "system", "accelerometer_rotation", "0"]);
    await adbCommand(runtime, ["-s", serial, "shell", "settings", "put", "system", "user_rotation", String(next)]);
  }
  return `Device rotated to orientation ${next}.`;
}
async function controlDevice(runtime, serial, action) {
  const target = serial.trim();
  if (!target) return operationFailure("DEVICE_REQUIRED", "validation", "Choose a device first.");
  try {
    if (action === "rotate") return { ok: true, data: await rotateDevice(runtime, target) };
    if (action === "auto-rotate") {
      try {
        await adbCommand(runtime, ["-s", target, "shell", "wm", "user-rotation", "free"]);
      } catch {
        await adbCommand(runtime, ["-s", target, "shell", "settings", "put", "system", "accelerometer_rotation", "1"]);
      }
      return { ok: true, data: `Automatic rotation restored on ${target}.` };
    }
    if (action === "show-touches-on" || action === "show-touches-off") {
      await adbCommand(runtime, ["-s", target, "shell", "settings", "put", "system", "show_touches", action === "show-touches-on" ? "1" : "0"]);
      return { ok: true, data: `${action} sent to ${target}.` };
    }
    if (action === "swipe-up" || action === "swipe-down" || action === "swipe-left" || action === "swipe-right") {
      const size = await adbCommand(runtime, ["-s", target, "shell", "wm", "size"]);
      const match = (size.stdout || "").match(/(\d+)x(\d+)/);
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
    if (!keyCode) return operationFailure("UNSUPPORTED_CONTROL_ACTION", "validation", "Unsupported device control action.");
    if (action === "screen-on" || action === "screen-off") {
      try {
        await adbCommand(runtime, ["-s", target, "shell", "cmd", "display", action === "screen-on" ? "power-on" : "power-off", "0"]);
        return { ok: true, data: `${action} sent to ${target}.` };
      } catch {
      }
    }
    await adbCommand(runtime, ["-s", target, "shell", "input", "keyevent", keyCode]);
    return { ok: true, data: `${action} sent to ${target}.` };
  } catch (error) {
    return failureFromUnknown(error, "DEVICE_CONTROL_FAILED", "device-control", "Unable to control the device.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is still connected and authorized."]
    });
  }
}
async function captureDeviceScreenshotBuffer(runtime, serial) {
  try {
    const adbPath = await resolveBinary(runtime, "adb");
    if (!adbPath) return operationFailure("ADB_NOT_FOUND", "screenshot", "adb executable not found.", {
      suggestedActions: ["Recheck the runtime setup."]
    });
    const png = await captureScreenshotPng(adbPath, serial.trim());
    return { ok: true, data: png };
  } catch (error) {
    return failureFromUnknown(error, "SCREENSHOT_FAILED", "screenshot", "Unable to capture the screenshot.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is connected and unlocked."]
    });
  }
}
async function captureDeviceScreenshot(runtime, serial, outputPath) {
  const capture = await captureDeviceScreenshotBuffer(runtime, serial);
  if (!capture.ok) return { ok: false, error: capture.error };
  if (!capture.data) return operationFailure("SCREENSHOT_FAILED", "screenshot", "Unable to capture the screenshot.");
  try {
    const png = capture.data;
    await promises.writeFile(outputPath, png);
    return { ok: true, data: outputPath };
  } catch (error) {
    return failureFromUnknown(error, "SCREENSHOT_FAILED", "screenshot", "Unable to capture the screenshot.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is connected and unlocked."]
    });
  }
}
function subscribeScrcpySessionEvents(listener) {
  return sessionManager.subscribe(listener);
}
function listScrcpySessions() {
  return sessionManager.list();
}
function duplicateRecordingPath(launches) {
  const seen = /* @__PURE__ */ new Set();
  for (const { launch } of launches) {
    if (!launch.recordEnabled || launch.autoRecordName || !launch.recordPath.trim()) continue;
    const resolved = node_path.resolve(launch.recordPath.trim());
    const key = process.platform === "win32" ? resolved.toLocaleLowerCase() : resolved;
    if (seen.has(key)) return resolved;
    seen.add(key);
  }
  return void 0;
}
async function startScrcpy(runtime, launches) {
  const scrcpyPath = await resolveBinary(runtime, "scrcpy");
  if (!scrcpyPath) return operationFailure("SCRCPY_NOT_FOUND", "session-preflight", "scrcpy executable not found.", {
    suggestedActions: ["Recheck the runtime setup.", "Choose a scrcpy executable manually."]
  });
  try {
    const result = await executeCommand(scrcpyPath, ["--version"]);
    const version2 = firstVersionLine(`${result.stdout}
${result.stderr}`, "scrcpy");
    if (!isSupportedScrcpyVersion(version2)) {
      return operationFailure("SCRCPY_UNSUPPORTED", "session-preflight", `scrcpy 4.x or newer is required; found ${version2}.`, {
        suggestedActions: ["Install or choose scrcpy 4.x or newer."]
      });
    }
  } catch (error) {
    return failureFromUnknown(error, "SCRCPY_PREFLIGHT_FAILED", "session-preflight", "Unable to verify the scrcpy runtime.", {
      retryable: true,
      suggestedActions: ["Recheck the runtime setup."]
    });
  }
  const uniqueLaunches = [...new Map(
    launches.filter((request) => request && request.serial.trim()).map((request) => [request.serial.trim(), { serial: request.serial.trim(), launch: request.launch }])
  ).values()];
  if (uniqueLaunches.length === 0) return operationFailure("DEVICE_REQUIRED", "validation", "Select at least one device.");
  if (duplicateRecordingPath(uniqueLaunches)) {
    return operationFailure("RECORDING_PATH_CONFLICT", "session-preflight", "Multiple devices cannot record to the same file.", {
      suggestedActions: ["Enable automatic recording names or choose a distinct Profile path for each device."]
    });
  }
  const preparedLaunches = [];
  for (const { serial, launch } of uniqueLaunches) {
    try {
      const prepared = prepareLaunchConfig(launch, serial);
      await preflightLaunchOutputs(prepared);
      preparedLaunches.push({ serial, scene: launch.scene, args: buildScrcpyArgs(prepared, serial) });
    } catch (error) {
      return failureFromUnknown(error, "SESSION_OPTIONS_INVALID", "session-preflight", "Unable to prepare the scrcpy command.", {
        suggestedActions: ["Review the command preview and expert arguments."]
      });
    }
  }
  const started = [];
  for (const { serial, scene, args } of preparedLaunches) {
    const session = sessionManager.launch({ executable: scrcpyPath, serial, scene, args });
    if (session.state !== "failed") started.push(serial);
  }
  return started.length > 0 ? { ok: true, data: started } : operationFailure("SESSION_START_FAILED", "session-launch", "No new scrcpy process was started.", {
    retryable: true,
    suggestedActions: ["Review the Sessions page and structured events for details."]
  });
}
async function preflightLaunchOutputs(launch) {
  if (launch.recordEnabled && launch.recordPath.trim()) {
    const directory = node_path.dirname(launch.recordPath.trim());
    await promises.access(directory, node_fs.constants.W_OK);
    const fileSystem = await promises.statfs(directory);
    const available = Number(fileSystem.bavail) * Number(fileSystem.bsize);
    if (Number.isFinite(available) && available < 64 * 1024 * 1024) {
      throw new Error("Recording destination has less than 64 MiB available.");
    }
  }
  if (launch.v4l2Sink.trim()) {
    const sink = await promises.stat(launch.v4l2Sink.trim());
    if (!sink.isCharacterDevice()) throw new Error("V4L2 sink is not a character device.");
    await promises.access(launch.v4l2Sink.trim(), node_fs.constants.W_OK);
  }
}
async function startOtg(runtime, launch, usbSerial) {
  const scrcpyPath = await resolveBinary(runtime, "scrcpy");
  if (!scrcpyPath) return operationFailure("SCRCPY_NOT_FOUND", "otg-preflight", "scrcpy executable not found.");
  if (launch.scene !== "otg") return operationFailure("OTG_SCENE_REQUIRED", "validation", "OTG launch requires the OTG scene.");
  try {
    const result = await executeCommand(scrcpyPath, ["--version"]);
    const version2 = firstVersionLine(`${result.stdout}
${result.stderr}`, "scrcpy");
    if (!isSupportedScrcpyVersion(version2)) {
      return operationFailure("SCRCPY_UNSUPPORTED", "otg-preflight", `scrcpy 4.x or newer is required; found ${version2}.`);
    }
    const serial = usbSerial.trim();
    const args = buildScrcpyArgs(launch, serial);
    const session = sessionManager.launch({
      executable: scrcpyPath,
      serial: serial || "otg:auto-usb",
      scene: "otg",
      args
    });
    return session.state === "failed" ? operationFailure("OTG_START_FAILED", "otg-launch", session.error || "Unable to start OTG mode.", {
      suggestedActions: ["Disconnect other USB devices or enter the USB serial.", "Review the Sessions page for USB permission errors."]
    }) : { ok: true, data: session.id };
  } catch (error) {
    return failureFromUnknown(error, "OTG_PREFLIGHT_FAILED", "otg-preflight", "Unable to prepare OTG mode.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is connected over USB.", "Review platform USB permissions."]
    });
  }
}
function stopScrcpy(serial) {
  return sessionManager.stopBySerial(serial);
}
function stopScrcpySession(id) {
  return sessionManager.stop(id);
}
function stopAllScrcpy(reason = "app-quit") {
  sessionManager.stopAll(reason);
}
function defaultLaunchConfig() {
  return {
    scene: "screen",
    windowTitle: optionDefault("windowTitle"),
    videoBitRate: optionDefault("videoBitRate"),
    videoBuffer: optionDefault("videoBuffer"),
    audioBuffer: optionDefault("audioBuffer"),
    maxSize: optionDefault("maxSize"),
    maxFps: optionDefault("maxFps"),
    displayId: optionDefault("displayId"),
    orientation: optionDefault("orientation"),
    videoCodec: optionDefault("videoCodec"),
    videoEncoder: "",
    audioCodec: "default",
    audioEncoder: "",
    audioSource: "default",
    audioDup: false,
    rotation90: false,
    shortcutModifier: optionDefault("shortcutModifier"),
    keyboardMode: optionDefault("keyboardMode"),
    mouseMode: optionDefault("mouseMode"),
    gamepadMode: optionDefault("gamepadMode"),
    alwaysOnTop: optionDefault("alwaysOnTop"),
    control: optionDefault("control"),
    audio: optionDefault("audio"),
    turnScreenOff: optionDefault("turnScreenOff"),
    stayAwake: optionDefault("stayAwake"),
    showTouches: optionDefault("showTouches"),
    fullscreen: optionDefault("fullscreen"),
    borderless: optionDefault("borderless"),
    windowAspectRatioLock: optionDefault("windowAspectRatioLock"),
    pushTarget: optionDefault("pushTarget"),
    tunnelPort: optionDefault("tunnelPort"),
    recordEnabled: optionDefault("recording"),
    recordPath: "",
    autoRecordName: false,
    recordDirectory: "",
    noPlayback: false,
    recordFormat: "default",
    recordOrientation: "default",
    timeLimit: 0,
    recordVideo: true,
    recordAudio: true,
    cameraId: "",
    cameraFacing: "default",
    cameraSize: { width: 0, height: 0 },
    cameraFps: 0,
    cameraHighSpeed: false,
    cameraTorch: false,
    cameraZoom: 1,
    virtualDisplay: {
      width: 0,
      height: 0,
      dpi: 0,
      systemDecorations: true,
      destroyContent: true,
      flexDisplay: false,
      startApp: "",
      keepActive: false,
      imePolicy: "default"
    },
    v4l2Sink: "",
    v4l2Buffer: 0,
    v4l2Playback: true,
    crop: optionDefault("crop"),
    window: { ...optionDefault("windowPosition"), ...optionDefault("windowSize") },
    extraArgs: ""
  };
}
function normalizedLaunch(stored) {
  const defaults = defaultLaunchConfig();
  return {
    ...defaults,
    ...stored,
    crop: { ...defaults.crop, ...stored?.crop },
    window: { ...defaults.window, ...stored?.window },
    cameraSize: { ...defaults.cameraSize, ...stored?.cameraSize },
    virtualDisplay: { ...defaults.virtualDisplay, ...stored?.virtualDisplay }
  };
}
function defaultPersistedConfig(locale2) {
  return {
    runtime: { scrcpyPath: "" },
    locale: locale2,
    theme: "light",
    accentScheme: "default",
    accentReversed: false,
    swipePanel: false,
    navBar: false,
    qrPairing: false,
    panelOrder: PANEL_IDS.slice(),
    panelVisibility: { devices: true, toolkit: true, automations: true, sessions: true, artifacts: true, settings: true, logs: true },
    scripts: {},
    muteNotifications: false,
    minimizeToTray: false,
    killAdbOnQuit: false,
    bossKeyEnabled: false,
    bossKeyAccelerator: "CommandOrControl+Shift+B",
    autoSelectFirstDevice: true,
    autoLaunchDevices: {},
    update: { checkOnStartup: false, autoUpdateOnStartup: false, skipConfirmation: false },
    toolkit: { sshEnabled: false, sshHost: "", sshLocalPort: 5555, sshRemotePort: 5555, perInstanceTerminal: false, recentCommands: [], commandUsage: {} },
    launch: defaultLaunchConfig(),
    profiles: [],
    deviceProfiles: {},
    deviceAliases: {},
    wirelessTargets: [],
    automations: [],
    groups: []
  };
}
function legacyConfigView(value, locale2) {
  const defaults = defaultPersistedConfig(locale2);
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const stored = value;
  const profiles = Array.isArray(stored.profiles) ? stored.profiles.map((profile) => {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return profile;
    return { ...profile, launch: normalizedLaunch(profile.launch) };
  }) : [];
  return {
    ...defaults,
    ...stored,
    runtime: { ...defaults.runtime, ...stored.runtime },
    launch: normalizedLaunch(stored.launch),
    profiles,
    deviceProfiles: stored.deviceProfiles || {},
    deviceAliases: stored.deviceAliases || {},
    autoLaunchDevices: stored.autoLaunchDevices || {},
    wirelessTargets: Array.isArray(stored.wirelessTargets) ? stored.wirelessTargets : [],
    automations: Array.isArray(stored.automations) ? stored.automations : [],
    groups: Array.isArray(stored.groups) ? stored.groups : []
  };
}
function previousRecordingDirectory(launch = {}) {
  return launch.recordDirectory?.trim() || launch.recordPath?.trim().replace(/[^/\\]*$/, "") || "";
}
function configView(config) {
  const deviceProfiles = {};
  const deviceAliases = {};
  const autoLaunchDevices = {};
  for (const device of config.knownDevices) {
    if (device.defaultProfileId) deviceProfiles[device.lastSerial] = device.defaultProfileId;
    if (device.alias) deviceAliases[device.lastSerial] = device.alias;
    if (device.autoLaunch) autoLaunchDevices[device.lastSerial] = true;
  }
  const serialByDeviceId = new Map(config.knownDevices.map((device) => [device.id, device.lastSerial]));
  return {
    runtime: { scrcpyPath: config.runtime.mode === "custom" ? config.runtime.customScrcpyPath : "" },
    launch: { ...structuredClone(config.defaults.launch), recordDirectory: previousRecordingDirectory(config.defaults.launch) },
    profiles: structuredClone(config.profiles),
    deviceProfiles,
    deviceAliases,
    wirelessTargets: structuredClone(config.wirelessTargets),
    automations: structuredClone(config.automations),
    groups: config.groups.map((group2) => ({
      id: group2.id,
      name: group2.name,
      serials: group2.deviceIds.map((id) => serialByDeviceId.get(id)).filter(Boolean),
      defaultProfileId: group2.defaultProfileId,
      concurrencyLimit: group2.concurrencyLimit,
      description: group2.description
    })),
    locale: config.locale,
    theme: config.appearance.theme,
    accentScheme: config.appearance.accentScheme,
    accentReversed: config.appearance.accentReversed,
    swipePanel: config.appearance.swipePanel,
    navBar: config.appearance.navBar,
    qrPairing: config.appearance.qrPairing,
    panelOrder: config.appearance.panelOrder,
    panelVisibility: config.appearance.panelVisibility,
    scripts: config.defaults.scripts,
    muteNotifications: config.appearance.muteNotifications,
    minimizeToTray: config.defaults.minimizeToTray,
    killAdbOnQuit: config.defaults.killAdbOnQuit,
    bossKeyEnabled: config.shortcuts.bossKeyEnabled,
    bossKeyAccelerator: config.shortcuts.bossKeyAccelerator,
    autoSelectFirstDevice: config.defaults.autoSelectFirstDevice,
    autoLaunchDevices,
    update: { checkOnStartup: config.update.checkOnStartup, autoUpdateOnStartup: config.update.autoUpdateOnStartup, skipConfirmation: config.update.skipConfirmation },
    toolkit: { sshEnabled: config.toolkit.sshEnabled, sshHost: config.toolkit.sshHost, sshLocalPort: config.toolkit.sshLocalPort, sshRemotePort: config.toolkit.sshRemotePort, perInstanceTerminal: config.toolkit.perInstanceTerminal, recentCommands: [...config.toolkit.recentCommands], commandUsage: { ...config.toolkit.commandUsage } }
  };
}
const MAX_PATH_LENGTH = 4096;
const MAX_SERIAL_LENGTH = 512;
const MAX_EXTRA_ARGS_LENGTH = 65536;
const MAX_EXTRA_ARGS = 200;
const MAX_AUTOMATION_STEPS = 200;
const MAX_AUTOMATION_DURATION_MS = 30 * 60 * 1e3;
const PACKAGE_ID = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+$/;
const SAFE_INPUT_TEXT = /^[\p{L}\p{N} .,_@%+\-/:?=]*$/u;
const orientations = /* @__PURE__ */ new Set(["0", "90", "180", "270"]);
const recordOrientations = /* @__PURE__ */ new Set(["default", "0", "90", "180", "270"]);
const scenes = /* @__PURE__ */ new Set(["screen", "camera", "virtual-display", "record-only", "control-only", "otg"]);
const shortcutModifiers = /* @__PURE__ */ new Set(["default", "lctrl", "rctrl", "lalt", "ralt", "lsuper", "rsuper"]);
const keyboardModes = /* @__PURE__ */ new Set(["default", "sdk", "uhid", "aoa", "disabled"]);
const mouseModes = /* @__PURE__ */ new Set(["default", "sdk", "uhid", "aoa", "disabled"]);
const gamepadModes = /* @__PURE__ */ new Set(["default", "uhid", "aoa"]);
const videoCodecs = /* @__PURE__ */ new Set(["default", "h264", "h265", "av1", "vp8", "vp9"]);
const audioCodecs = /* @__PURE__ */ new Set(["default", "opus", "aac", "flac", "raw"]);
const audioSources = /* @__PURE__ */ new Set([
  "default",
  "output",
  "playback",
  "mic",
  "mic-unprocessed",
  "mic-camcorder",
  "mic-voice-recognition",
  "mic-voice-communication",
  "voice-call",
  "voice-call-uplink",
  "voice-call-downlink",
  "voice-performance"
]);
const cameraFacings = /* @__PURE__ */ new Set(["default", "front", "back", "external"]);
const recordFormats = /* @__PURE__ */ new Set(["default", "mp4", "mkv", "m4a", "mka", "opus", "aac", "flac", "wav"]);
const displayImePolicies = /* @__PURE__ */ new Set(["default", "local"]);
const previewSources = /* @__PURE__ */ new Set(["global", "profile"]);
const controlActions = /* @__PURE__ */ new Set([
  "back",
  "home",
  "app-switch",
  "menu",
  "volume-up",
  "volume-down",
  "power",
  "screen-on",
  "screen-off",
  "rotate",
  "auto-rotate",
  "show-touches-on",
  "show-touches-off"
]);
function record$1(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${name} must be an object.`);
  return value;
}
function boundedString$1(value, name, maxLength, allowEmpty = false) {
  if (typeof value !== "string") throw new TypeError(`${name} must be a string.`);
  if (value.includes("\0")) throw new TypeError(`${name} may not contain null bytes.`);
  if (!allowEmpty && value.length === 0 || value.length > maxLength) {
    throw new TypeError(`${name} must contain ${allowEmpty ? "0" : "1"} to ${maxLength} characters.`);
  }
  return value;
}
function strictBoolean(value, name) {
  if (typeof value !== "boolean") throw new TypeError(`${name} must be a boolean.`);
  return value;
}
function nonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > Number.MAX_SAFE_INTEGER) {
    throw new TypeError(`${name} must be a non-negative safe integer.`);
  }
  return Number(value);
}
function finiteNumber(value, name, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new TypeError(`${name} must be a finite number from ${min} to ${max}.`);
  }
  return value;
}
function enumValue(value, name, values) {
  if (typeof value !== "string" || !values.has(value)) throw new TypeError(`${name} is not supported.`);
  return value;
}
function booleanField(source, key) {
  return strictBoolean(source[key], `launch.${key}`);
}
function geometry(value, name) {
  const source = record$1(value, `launch.${name}`);
  return {
    x: finiteNumber(source.x, `launch.${name}.x`, -32768, 32768),
    y: finiteNumber(source.y, `launch.${name}.y`, -32768, 32768),
    width: finiteNumber(source.width, `launch.${name}.width`, 0, 32768),
    height: finiteNumber(source.height, `launch.${name}.height`, 0, 32768)
  };
}
function size(value, name) {
  const source = record$1(value, `launch.${name}`);
  return {
    width: finiteNumber(source.width, `launch.${name}.width`, 0, 32768),
    height: finiteNumber(source.height, `launch.${name}.height`, 0, 32768)
  };
}
function virtualDisplay(value) {
  const source = record$1(value, "launch.virtualDisplay");
  return {
    width: finiteNumber(source.width, "launch.virtualDisplay.width", 0, 32768),
    height: finiteNumber(source.height, "launch.virtualDisplay.height", 0, 32768),
    dpi: finiteNumber(source.dpi, "launch.virtualDisplay.dpi", 0, 2e3),
    systemDecorations: strictBoolean(source.systemDecorations, "launch.virtualDisplay.systemDecorations"),
    destroyContent: strictBoolean(source.destroyContent, "launch.virtualDisplay.destroyContent"),
    flexDisplay: strictBoolean(source.flexDisplay, "launch.virtualDisplay.flexDisplay"),
    startApp: boundedString$1(source.startApp, "launch.virtualDisplay.startApp", 512, true),
    keepActive: strictBoolean(source.keepActive, "launch.virtualDisplay.keepActive"),
    imePolicy: enumValue(source.imePolicy, "launch.virtualDisplay.imePolicy", displayImePolicies)
  };
}
function runtimeConfig(value) {
  const source = record$1(value, "runtime");
  return { scrcpyPath: boundedString$1(source.scrcpyPath, "runtime.scrcpyPath", MAX_PATH_LENGTH, true) };
}
function deviceSerial(value) {
  return boundedString$1(value, "device serial", MAX_SERIAL_LENGTH);
}
function deviceSerials(value, max = 20) {
  if (!Array.isArray(value) || value.length < 1 || value.length > max) {
    throw new TypeError(`device serials must contain 1 to ${max} items.`);
  }
  return [...new Set(value.map((item) => deviceSerial(item)))];
}
function controlAction(value) {
  return enumValue(value, "device control action", controlActions);
}
function launchConfig(value) {
  const raw = record$1(value, "launch");
  const source = normalizedLaunch(raw);
  const extraArgs = boundedString$1(source.extraArgs, "launch.extraArgs", MAX_EXTRA_ARGS_LENGTH, true);
  const lines2 = extraArgs.split(/\r?\n/).filter((line) => line.trim());
  if (lines2.length > MAX_EXTRA_ARGS || lines2.some((line) => line.length > 4096)) {
    throw new TypeError(`launch.extraArgs supports at most ${MAX_EXTRA_ARGS} lines of 4096 characters.`);
  }
  return {
    scene: enumValue(source.scene, "launch.scene", scenes),
    windowTitle: boundedString$1(source.windowTitle, "launch.windowTitle", 256, true),
    videoBitRate: finiteNumber(source.videoBitRate, "launch.videoBitRate", 0, 1e3),
    videoBuffer: finiteNumber(source.videoBuffer, "launch.videoBuffer", 0, 6e4),
    audioBuffer: finiteNumber(source.audioBuffer, "launch.audioBuffer", 0, 6e4),
    maxSize: finiteNumber(source.maxSize, "launch.maxSize", 0, 32768),
    maxFps: finiteNumber(source.maxFps, "launch.maxFps", 0, 1e3),
    displayId: finiteNumber(source.displayId, "launch.displayId", 0, 65535),
    orientation: enumValue(source.orientation, "launch.orientation", orientations),
    videoCodec: enumValue(source.videoCodec, "launch.videoCodec", videoCodecs),
    videoEncoder: boundedString$1(source.videoEncoder, "launch.videoEncoder", 512, true),
    audioCodec: enumValue(source.audioCodec, "launch.audioCodec", audioCodecs),
    audioEncoder: boundedString$1(source.audioEncoder, "launch.audioEncoder", 512, true),
    audioSource: enumValue(source.audioSource, "launch.audioSource", audioSources),
    audioDup: booleanField(source, "audioDup"),
    rotation90: booleanField(source, "rotation90"),
    shortcutModifier: enumValue(source.shortcutModifier, "launch.shortcutModifier", shortcutModifiers),
    keyboardMode: enumValue(source.keyboardMode, "launch.keyboardMode", keyboardModes),
    mouseMode: enumValue(source.mouseMode, "launch.mouseMode", mouseModes),
    gamepadMode: enumValue(source.gamepadMode, "launch.gamepadMode", gamepadModes),
    alwaysOnTop: booleanField(source, "alwaysOnTop"),
    control: booleanField(source, "control"),
    audio: booleanField(source, "audio"),
    turnScreenOff: booleanField(source, "turnScreenOff"),
    stayAwake: booleanField(source, "stayAwake"),
    showTouches: booleanField(source, "showTouches"),
    fullscreen: booleanField(source, "fullscreen"),
    borderless: booleanField(source, "borderless"),
    windowAspectRatioLock: booleanField(source, "windowAspectRatioLock"),
    pushTarget: boundedString$1(source.pushTarget, "launch.pushTarget", MAX_PATH_LENGTH, true),
    tunnelPort: boundedString$1(source.tunnelPort, "launch.tunnelPort", 11, true),
    recordEnabled: booleanField(source, "recordEnabled"),
    recordPath: boundedString$1(source.recordPath, "launch.recordPath", MAX_PATH_LENGTH, true),
    autoRecordName: booleanField(source, "autoRecordName"),
    recordDirectory: boundedString$1(source.recordDirectory, "launch.recordDirectory", MAX_PATH_LENGTH, true),
    noPlayback: booleanField(source, "noPlayback"),
    recordFormat: enumValue(source.recordFormat, "launch.recordFormat", recordFormats),
    recordOrientation: enumValue(source.recordOrientation, "launch.recordOrientation", recordOrientations),
    timeLimit: finiteNumber(source.timeLimit, "launch.timeLimit", 0, 86400),
    recordVideo: booleanField(source, "recordVideo"),
    recordAudio: booleanField(source, "recordAudio"),
    cameraId: boundedString$1(source.cameraId, "launch.cameraId", 512, true),
    cameraFacing: enumValue(source.cameraFacing, "launch.cameraFacing", cameraFacings),
    cameraSize: size(source.cameraSize, "cameraSize"),
    cameraFps: finiteNumber(source.cameraFps, "launch.cameraFps", 0, 1e3),
    cameraHighSpeed: booleanField(source, "cameraHighSpeed"),
    cameraTorch: booleanField(source, "cameraTorch"),
    cameraZoom: finiteNumber(source.cameraZoom, "launch.cameraZoom", 1, 100),
    virtualDisplay: virtualDisplay(source.virtualDisplay),
    v4l2Sink: boundedString$1(source.v4l2Sink, "launch.v4l2Sink", MAX_PATH_LENGTH, true),
    v4l2Buffer: finiteNumber(source.v4l2Buffer, "launch.v4l2Buffer", 0, 6e4),
    v4l2Playback: booleanField(source, "v4l2Playback"),
    crop: geometry(source.crop, "crop"),
    window: geometry(source.window, "window"),
    extraArgs
  };
}
function deviceLaunches(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) {
    throw new TypeError("launches must contain 1 to 100 devices.");
  }
  return value.map((item, index) => {
    const source = record$1(item, `launches[${index}]`);
    return { serial: deviceSerial(source.serial), launch: launchConfig(source.launch) };
  });
}
function commandPreviewRequests(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) {
    throw new TypeError("preview requests must contain 1 to 100 devices.");
  }
  return value.map((item, index) => {
    const source = record$1(item, `preview[${index}]`);
    const previewSource = enumValue(source.source, `preview[${index}].source`, previewSources);
    const profileName = source.profileName === void 0 ? void 0 : boundedString$1(source.profileName, `preview[${index}].profileName`, 128, true);
    if (previewSource === "profile" && !profileName) throw new TypeError(`preview[${index}].profileName is required for profile sources.`);
    return {
      serial: deviceSerial(source.serial),
      launch: launchConfig(source.launch),
      source: previewSource,
      profileName,
      deviceWindowTitleOverride: strictBoolean(source.deviceWindowTitleOverride, `preview[${index}].deviceWindowTitleOverride`)
    };
  });
}
function automationSteps(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_AUTOMATION_STEPS) {
    throw new TypeError(`automation steps must contain 1 to ${MAX_AUTOMATION_STEPS} actions.`);
  }
  let totalDuration = 0;
  const steps = value.flatMap((item, index) => {
    const source = record$1(item, `steps[${index}]`);
    if (source.type === void 0 && source.action !== void 0) {
      const delayMs = finiteNumber(source.delayMs, `steps[${index}].delayMs`, 0, 6e4);
      totalDuration += delayMs;
      return [
        ...delayMs ? [{ type: "delay", durationMs: delayMs }] : [],
        { type: "control", action: controlAction(source.action) }
      ];
    }
    switch (source.type) {
      case "delay": {
        const durationMs = finiteNumber(source.durationMs, `steps[${index}].durationMs`, 0, 6e4);
        totalDuration += durationMs;
        return [{ type: "delay", durationMs }];
      }
      case "control":
        return [{ type: "control", action: controlAction(source.action) }];
      case "tap":
        return [{
          type: "tap",
          x: finiteNumber(source.x, `steps[${index}].x`, 0, 1),
          y: finiteNumber(source.y, `steps[${index}].y`, 0, 1),
          coordinateSpace: enumValue(source.coordinateSpace, `steps[${index}].coordinateSpace`, /* @__PURE__ */ new Set(["normalized"]))
        }];
      case "swipe": {
        const from = record$1(source.from, `steps[${index}].from`);
        const to = record$1(source.to, `steps[${index}].to`);
        const durationMs = finiteNumber(source.durationMs, `steps[${index}].durationMs`, 1, 1e4);
        totalDuration += durationMs;
        return [{
          type: "swipe",
          from: { x: finiteNumber(from.x, `steps[${index}].from.x`, 0, 1), y: finiteNumber(from.y, `steps[${index}].from.y`, 0, 1) },
          to: { x: finiteNumber(to.x, `steps[${index}].to.x`, 0, 1), y: finiteNumber(to.y, `steps[${index}].to.y`, 0, 1) },
          durationMs,
          coordinateSpace: enumValue(source.coordinateSpace, `steps[${index}].coordinateSpace`, /* @__PURE__ */ new Set(["normalized"]))
        }];
      }
      case "text": {
        const text = boundedString$1(source.value, `steps[${index}].value`, 512);
        if (!SAFE_INPUT_TEXT.test(text)) throw new TypeError(`steps[${index}].value contains characters unsafe for Android input text.`);
        if (source.sensitive !== false) throw new TypeError("Sensitive text cannot be persisted in an automation.");
        return [{ type: "text", value: text, sensitive: false }];
      }
      case "start-app": {
        const packageId = boundedString$1(source.packageId, `steps[${index}].packageId`, 255);
        if (!PACKAGE_ID.test(packageId)) throw new TypeError(`steps[${index}].packageId is invalid.`);
        return [{ type: "start-app", packageId }];
      }
      case "screenshot":
        return [{
          type: "screenshot",
          label: source.label === void 0 ? void 0 : boundedString$1(source.label, `steps[${index}].label`, 80, true)
        }];
      case "assert-device": {
        const condition = record$1(source.condition, `steps[${index}].condition`);
        if (condition.type === "orientation") {
          return [{
            type: "assert-device",
            condition: { type: "orientation", value: enumValue(condition.value, `steps[${index}].condition.value`, /* @__PURE__ */ new Set(["portrait", "landscape"])) }
          }];
        }
        if (condition.type === "aspect-ratio") {
          return [{
            type: "assert-device",
            condition: {
              type: "aspect-ratio",
              value: finiteNumber(condition.value, `steps[${index}].condition.value`, 0.1, 10),
              tolerance: finiteNumber(condition.tolerance, `steps[${index}].condition.tolerance`, 0, 1)
            }
          }];
        }
        throw new TypeError(`steps[${index}].condition.type is not supported.`);
      }
      default:
        throw new TypeError(`steps[${index}].type is not supported.`);
    }
  });
  if (steps.length > MAX_AUTOMATION_STEPS) throw new TypeError(`automation steps expand beyond ${MAX_AUTOMATION_STEPS} actions.`);
  if (totalDuration > MAX_AUTOMATION_DURATION_MS) throw new TypeError("automation duration may not exceed 30 minutes.");
  return steps;
}
function automationMacro(value, name = "automation") {
  const source = record$1(value, name);
  const design = source.design === void 0 ? {} : record$1(source.design, `${name}.design`);
  const orientation = design.orientation === void 0 ? "any" : enumValue(design.orientation, `${name}.design.orientation`, /* @__PURE__ */ new Set(["any", "portrait", "landscape"]));
  return {
    id: boundedString$1(source.id, `${name}.id`, 128),
    name: boundedString$1(source.name, `${name}.name`, 128),
    description: source.description === void 0 ? "" : boundedString$1(source.description, `${name}.description`, 1024, true),
    schemaVersion: 2,
    design: {
      orientation,
      aspectRatio: design.aspectRatio === void 0 ? 0 : finiteNumber(design.aspectRatio, `${name}.design.aspectRatio`, 0, 10)
    },
    steps: automationSteps(source.steps)
  };
}
function batchPreflightRequest(value) {
  const source = record$1(value, "batch preflight");
  const serials = deviceSerials(source.serials, 100);
  const concurrencyLimit = finiteNumber(source.concurrencyLimit, "batch preflight concurrencyLimit", 1, 8);
  if (!Number.isInteger(concurrencyLimit)) throw new TypeError("batch preflight concurrencyLimit must be an integer.");
  const action = record$1(source.action, "batch preflight action");
  switch (action.type) {
    case "launch": {
      const launches = deviceLaunches(action.launches);
      const requested = new Set(serials);
      const launchSerials = new Set(launches.map((item) => item.serial));
      if (launches.length !== serials.length || launchSerials.size !== serials.length || launches.some((item) => !requested.has(item.serial))) {
        throw new TypeError("Batch launch plans must contain exactly one launch for every requested device.");
      }
      return { serials, concurrencyLimit, action: { type: "launch", launches } };
    }
    case "control":
      return { serials, concurrencyLimit, action: { type: "control", action: controlAction(action.action) } };
    case "screenshot":
      return { serials, concurrencyLimit, action: { type: "screenshot" } };
    case "start-app": {
      const packageId = boundedString$1(action.packageId, "batch preflight packageId", 255);
      if (!PACKAGE_ID.test(packageId)) throw new TypeError("batch preflight packageId is invalid.");
      return { serials, concurrencyLimit, action: { type: "start-app", packageId } };
    }
    case "automation":
      return { serials, concurrencyLimit, action: { type: "automation", automation: automationMacro(action.automation) } };
    case "file-push": {
      const target = boundedString$1(action.target, "batch preflight target", 1024).trim();
      if (!target.startsWith("/") || /[\0\r\n\\]/.test(target) || target.split("/").some((part) => part === "." || part === "..")) {
        throw new TypeError("batch preflight target must be a safe absolute Android directory.");
      }
      if (action.conflict !== "replace" && action.conflict !== "skip") throw new TypeError("batch preflight file conflict policy is not supported.");
      return { serials, concurrencyLimit, action: { type: "file-push", target, conflict: action.conflict } };
    }
    case "apk-install":
      return {
        serials,
        concurrencyLimit,
        action: {
          type: "apk-install",
          replace: strictBoolean(action.replace, "batch preflight replace existing app"),
          downgrade: strictBoolean(action.downgrade, "batch preflight allow downgrade")
        }
      };
    default:
      throw new TypeError("Batch action type is not supported.");
  }
}
const PRODUCTION_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join("; ");
function isTrustedRendererUrl(candidate, packagedEntry, devRendererUrl) {
  try {
    const actual = new URL(candidate);
    if (devRendererUrl) {
      const expected2 = new URL(devRendererUrl);
      return (expected2.protocol === "http:" || expected2.protocol === "https:") && actual.protocol === expected2.protocol && actual.origin === expected2.origin;
    }
    const expected = new URL(packagedEntry);
    actual.hash = "";
    expected.hash = "";
    return actual.protocol === "file:" && actual.href === expected.href;
  } catch {
    return false;
  }
}
const READ_CHUNK_BYTES = 64 * 1024;
async function readBoundedRegularUtf8File(path, maxBytes, invalidMessage) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new TypeError("File size limit must be a positive integer.");
  const handle2 = await promises.open(path, node_fs.constants.O_RDONLY | (node_fs.constants.O_NOFOLLOW || 0));
  try {
    const info = await handle2.stat();
    if (!info.isFile() || info.size > maxBytes) throw new TypeError(invalidMessage);
    const chunks = [];
    let totalBytes = 0;
    while (totalBytes <= maxBytes) {
      const remaining = maxBytes + 1 - totalBytes;
      const chunk = Buffer.allocUnsafe(Math.min(READ_CHUNK_BYTES, remaining));
      const { bytesRead } = await handle2.read(chunk, 0, chunk.length, null);
      if (bytesRead === 0) break;
      chunks.push(chunk.subarray(0, bytesRead));
      totalBytes += bytesRead;
    }
    if (totalBytes > maxBytes) throw new TypeError(invalidMessage);
    return Buffer.concat(chunks, totalBytes).toString("utf8");
  } finally {
    await handle2.close();
  }
}
const MAX_CONFIG_BYTES = 2 * 1024 * 1024;
const MAX_COLLECTION_SIZE = 1e3;
const locales = /* @__PURE__ */ new Set(["en", "zh-CN", "zh-TW", "ru"]);
function object(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${name} must be an object.`);
  return value;
}
function array(value, name) {
  if (!Array.isArray(value) || value.length > MAX_COLLECTION_SIZE) {
    throw new TypeError(`${name} must be an array with at most ${MAX_COLLECTION_SIZE} items.`);
  }
  return value;
}
function integer(value, name, min = 0) {
  if (!Number.isInteger(value) || Number(value) < min) throw new TypeError(`${name} must be an integer of at least ${min}.`);
  return Number(value);
}
function locale(value, fallback) {
  if (typeof value === "string" && locales.has(value)) return value;
  if (fallback) return fallback;
  throw new TypeError("locale is not supported.");
}
const themes = /* @__PURE__ */ new Set(["light", "dark", "oled"]);
function themeValue(value, fallback) {
  if (typeof value === "string" && themes.has(value)) return value;
  if (fallback) return fallback;
  return "light";
}
const PANEL_IDS = ["devices", "toolkit", "automations", "sessions", "artifacts", "settings", "logs"];
const panelIds = /* @__PURE__ */ new Set(PANEL_IDS);
function panelOrderValue(value, fallback) {
  const base = Array.isArray(fallback) ? fallback.slice() : PANEL_IDS.slice();
  if (!Array.isArray(value)) return base;
  const seen = /* @__PURE__ */ new Set();
  const ordered = [];
  for (const item of value) {
    if (typeof item !== "string" || seen.has(item) || !panelIds.has(item)) continue;
    seen.add(item);
    ordered.push(item);
  }
  for (const id of PANEL_IDS) if (!seen.has(id)) ordered.push(id);
  return ordered;
}
function panelVisibilityValue(value, fallback) {
  const base = fallback && typeof fallback === "object" && !Array.isArray(fallback) ? fallback : {};
  const source = object(value === void 0 || value === null ? {} : value, "panelVisibility");
  const result = {};
  for (const id of PANEL_IDS) result[id] = source[id] === void 0 ? base[id] !== false : strictBoolean(source[id], `panelVisibility.${id}`);
  return result;
}
const SCRCPY_SCRIPTS = [
  { id: "gaming", label: "Gaming", args: "--no-mipmaps --no-mouse-hover --raw-key-events --disable-screensaver" },
  { id: "battery-saver", label: "Battery saver", args: "--disable-screensaver --no-clipboard-autosync --no-terminal-title --no-cleanup" },
  { id: "presentation", label: "Presentation", args: "--print-fps --disable-screensaver --no-cleanup" },
  { id: "compatibility", label: "Compatibility", args: "--no-mipmaps --legacy-paste --prefer-text --no-mouse-hover --no-key-repeat" },
  { id: "safe-exit", label: "Safe exit", args: "--pause-on-exit --power-off-on-close" },
  { id: "no-cleanup", label: "No cleanup", args: "--no-cleanup --no-clipboard-autosync" }
];
const SCRCPY_SCRIPT_IDS = SCRCPY_SCRIPTS.map((script) => script.id);
function scriptsRecord(value, name = "scripts") {
  const source = object(value === void 0 ? {} : value, name);
  const result = {};
  for (const id of SCRCPY_SCRIPT_IDS) {
    if (typeof source[id] === "boolean") result[id] = source[id];
  }
  return result;
}
const accentSchemes = /* @__PURE__ */ new Set(["default", "purple-orange", "pink-blue", "pink-purple", "blue-orange", "green-pink", "yellow-purple", "red-blue"]);
function accentSchemeValue(value, fallback) {
  if (typeof value === "string" && accentSchemes.has(value)) return value;
  if (fallback) return fallback;
  return "default";
}
function stringRecord(value, name, booleanValues = false) {
  const source = object(value, name);
  if (Object.keys(source).length > MAX_COLLECTION_SIZE) throw new TypeError(`${name} has too many entries.`);
  const result = {};
  for (const [key, item] of Object.entries(source)) {
    const safeKey = boundedString$1(key, `${name} key`, 512);
    result[safeKey] = booleanValues ? strictBoolean(item, `${name}.${safeKey}`) : boundedString$1(item, `${name}.${safeKey}`, 512, true);
  }
  return result;
}
function validateLaunchProfile(value, name = "profile") {
  const source = object(value, name);
  return {
    id: boundedString$1(source.id, `${name}.id`, 128),
    name: boundedString$1(source.name, `${name}.name`, 128),
    launch: launchConfig(source.launch),
    extensions: source.extensions === void 0 ? void 0 : validateExtensions(source.extensions, `${name}.extensions`)
  };
}
function jsonValue(value, name, depth = 0) {
  if (depth > 10) throw new TypeError(`${name} is nested too deeply.`);
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) {
    if (value.length > 1e3) throw new TypeError(`${name} contains too many items.`);
    return value.map((item, index) => jsonValue(item, `${name}[${index}]`, depth + 1));
  }
  const source = object(value, name);
  if (Object.keys(source).length > 1e3) throw new TypeError(`${name} contains too many fields.`);
  return Object.fromEntries(Object.entries(source).map(([key, item]) => [
    boundedString$1(key, `${name} key`, 128),
    jsonValue(item, `${name}.${key}`, depth + 1)
  ]));
}
function validateExtensions(value, name = "extensions") {
  object(value, name);
  if (Buffer.byteLength(JSON.stringify(value)) > 64 * 1024) throw new TypeError(`${name} exceeds the 64 KiB limit.`);
  return jsonValue(value, name);
}
function assertUnique(items, value, name) {
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    const key = value(item);
    if (seen.has(key)) throw new TypeError(`${name} contains duplicate ${key}.`);
    seen.add(key);
  }
}
function wirelessTarget(value, name) {
  const source = object(value, name);
  const address = boundedString$1(source.address, `${name}.address`, 512);
  if (!validateDeviceAddress(address)) throw new TypeError(`${name}.address is invalid.`);
  return {
    id: boundedString$1(source.id, `${name}.id`, 128),
    name: boundedString$1(source.name, `${name}.name`, 128, true),
    address,
    autoConnect: strictBoolean(source.autoConnect, `${name}.autoConnect`)
  };
}
function automation(value, name) {
  return automationMacro(value, name);
}
function groupView(value, name) {
  const source = object(value, name);
  const concurrencyLimit = source.concurrencyLimit === void 0 ? 3 : integer(source.concurrencyLimit, `${name}.concurrencyLimit`, 1);
  if (concurrencyLimit > 8) throw new TypeError(`${name}.concurrencyLimit may not exceed 8.`);
  return {
    id: boundedString$1(source.id, `${name}.id`, 128),
    name: boundedString$1(source.name, `${name}.name`, 128),
    serials: array(source.serials, `${name}.serials`).map((item, index) => boundedString$1(item, `${name}.serials[${index}]`, 512)),
    defaultProfileId: source.defaultProfileId === void 0 || source.defaultProfileId === "" ? void 0 : boundedString$1(source.defaultProfileId, `${name}.defaultProfileId`, 128),
    concurrencyLimit,
    description: source.description === void 0 ? "" : boundedString$1(source.description, `${name}.description`, 1024, true)
  };
}
function validatePersistedConfig(value) {
  const source = object(value, "config");
  const configLocale = locale(source.locale);
  const profiles = array(source.profiles, "config.profiles").map((item, index) => validateLaunchProfile(item, `config.profiles[${index}]`));
  assertUnique(profiles, (item) => item.id, "config.profiles");
  const wirelessTargets = array(source.wirelessTargets, "config.wirelessTargets").map((item, index) => wirelessTarget(item, `config.wirelessTargets[${index}]`));
  const automations = array(source.automations, "config.automations").map((item, index) => automation(item, `config.automations[${index}]`));
  const groups = array(source.groups, "config.groups").map((item, index) => groupView(item, `config.groups[${index}]`));
  assertUnique(wirelessTargets, (item) => item.id, "config.wirelessTargets");
  assertUnique(automations, (item) => item.id, "config.automations");
  assertUnique(groups, (item) => item.id, "config.groups");
  const profileIds = new Set(profiles.map((item) => item.id));
  const deviceProfiles = stringRecord(source.deviceProfiles, "config.deviceProfiles");
  for (const profileId of Object.values(deviceProfiles)) {
    if (profileId && !profileIds.has(profileId)) throw new TypeError("config.deviceProfiles references an unknown profile.");
  }
  for (const group2 of groups) {
    if (group2.defaultProfileId && !profileIds.has(group2.defaultProfileId)) throw new TypeError("config.groups references an unknown profile.");
    if (new Set(group2.serials).size !== group2.serials.length) throw new TypeError("config.groups contains duplicate device serials.");
  }
  return {
    runtime: runtimeConfig(source.runtime),
    launch: launchConfig(source.launch),
    profiles,
    deviceProfiles,
    deviceAliases: stringRecord(source.deviceAliases, "config.deviceAliases"),
    wirelessTargets,
    automations,
    groups,
    locale: configLocale,
    theme: themeValue(source.theme),
    accentScheme: accentSchemeValue(source.accentScheme),
    accentReversed: strictBoolean(source.accentReversed, "config.accentReversed"),
    swipePanel: strictBoolean(source.swipePanel, "config.swipePanel"),
    navBar: strictBoolean(source.navBar, "config.navBar"),
    qrPairing: strictBoolean(source.qrPairing, "config.qrPairing"),
    panelOrder: panelOrderValue(source.panelOrder),
    panelVisibility: panelVisibilityValue(source.panelVisibility),
    update: updateSection(source.update, "config.update"),
    toolkit: toolkitSection(source.toolkit, "config.toolkit"),
    muteNotifications: strictBoolean(source.muteNotifications, "config.muteNotifications"),
    minimizeToTray: strictBoolean(source.minimizeToTray, "config.minimizeToTray"),
    killAdbOnQuit: strictBoolean(source.killAdbOnQuit, "config.killAdbOnQuit"),
    bossKeyEnabled: strictBoolean(source.bossKeyEnabled, "config.bossKeyEnabled"),
    bossKeyAccelerator: boundedString$1(source.bossKeyAccelerator, "config.bossKeyAccelerator", 128),
    autoSelectFirstDevice: strictBoolean(source.autoSelectFirstDevice, "config.autoSelectFirstDevice"),
    scripts: scriptsRecord(source.scripts, "config.scripts"),
    autoLaunchDevices: stringRecord(source.autoLaunchDevices, "config.autoLaunchDevices", true)
  };
}
function safeLegacyConfig(value, fallbackLocale) {
  const defaults = defaultPersistedConfig(fallbackLocale);
  const candidate = legacyConfigView(value, fallbackLocale);
  let imported = 0;
  let skipped = 0;
  let invalid = 0;
  const accept = (factory, fallback) => {
    try {
      const result = factory();
      imported += 1;
      return result;
    } catch {
      invalid += 1;
      return fallback;
    }
  };
  const acceptItems = (values, factory) => {
    if (!Array.isArray(values)) return [];
    const result = [];
    for (const [index, item] of values.slice(0, MAX_COLLECTION_SIZE).entries()) {
      try {
        result.push(factory(item, index));
        imported += 1;
      } catch {
        skipped += 1;
      }
    }
    if (values.length > MAX_COLLECTION_SIZE) skipped += values.length - MAX_COLLECTION_SIZE;
    return result;
  };
  const dedupe = (items, key) => {
    const seen = /* @__PURE__ */ new Set();
    return items.filter((item) => {
      const value2 = key(item);
      if (seen.has(value2)) {
        skipped += 1;
        return false;
      }
      seen.add(value2);
      return true;
    });
  };
  const profiles = dedupe(acceptItems(candidate.profiles, (item, index) => validateLaunchProfile(item, `legacy.profiles[${index}]`)), (item) => item.id);
  const profileIds = new Set(profiles.map((item) => item.id));
  const deviceProfiles = {};
  try {
    for (const [serial, profileId] of Object.entries(stringRecord(candidate.deviceProfiles, "legacy.deviceProfiles"))) {
      if (profileId && profileIds.has(String(profileId))) deviceProfiles[serial] = String(profileId);
      else skipped += 1;
    }
  } catch {
    invalid += 1;
  }
  return {
    config: {
      runtime: accept(() => runtimeConfig(candidate.runtime), defaults.runtime),
      launch: accept(() => launchConfig(candidate.launch), defaults.launch),
      profiles,
      deviceProfiles,
      deviceAliases: accept(() => stringRecord(candidate.deviceAliases, "legacy.deviceAliases"), {}),
      wirelessTargets: dedupe(acceptItems(candidate.wirelessTargets, (item, index) => wirelessTarget(item, `legacy.wirelessTargets[${index}]`)), (item) => item.id),
      automations: dedupe(acceptItems(candidate.automations, (item, index) => automation(item, `legacy.automations[${index}]`)), (item) => item.id),
      groups: dedupe(acceptItems(candidate.groups, (item, index) => groupView(item, `legacy.groups[${index}]`)), (item) => item.id),
      locale: locale(candidate.locale, fallbackLocale),
      muteNotifications: accept(() => strictBoolean(candidate.muteNotifications, "legacy.muteNotifications"), defaults.muteNotifications),
      theme: accept(() => themeValue(candidate.theme), defaults.theme),
      accentScheme: accept(() => accentSchemeValue(candidate.accentScheme), defaults.accentScheme),
      accentReversed: accept(() => strictBoolean(candidate.accentReversed, "legacy.accentReversed"), defaults.accentReversed),
      swipePanel: accept(() => strictBoolean(candidate.swipePanel, "legacy.swipePanel"), defaults.swipePanel),
      navBar: accept(() => strictBoolean(candidate.navBar, "legacy.navBar"), defaults.navBar),
      qrPairing: accept(() => strictBoolean(candidate.qrPairing, "legacy.qrPairing"), defaults.qrPairing),
      panelOrder: accept(() => panelOrderValue(candidate.panelOrder), defaults.panelOrder),
      panelVisibility: accept(() => panelVisibilityValue(candidate.panelVisibility), defaults.panelVisibility),
      scripts: accept(() => scriptsRecord(candidate.scripts, "legacy.scripts"), defaults.scripts),
      update: accept(() => updateSection(candidate.update, "legacy.update"), defaults.update),
      toolkit: accept(() => toolkitSection(candidate.toolkit, "legacy.toolkit"), defaults.toolkit),
      minimizeToTray: accept(() => strictBoolean(candidate.minimizeToTray, "legacy.minimizeToTray"), defaults.minimizeToTray),
      killAdbOnQuit: accept(() => strictBoolean(candidate.killAdbOnQuit, "legacy.killAdbOnQuit"), defaults.killAdbOnQuit),
      bossKeyEnabled: accept(() => strictBoolean(candidate.bossKeyEnabled, "legacy.bossKeyEnabled"), defaults.bossKeyEnabled),
      bossKeyAccelerator: accept(() => boundedString$1(candidate.bossKeyAccelerator, "legacy.bossKeyAccelerator", 128), defaults.bossKeyAccelerator),
      autoSelectFirstDevice: accept(() => strictBoolean(candidate.autoSelectFirstDevice, "legacy.autoSelectFirstDevice"), defaults.autoSelectFirstDevice),
      autoLaunchDevices: accept(() => stringRecord(candidate.autoLaunchDevices, "legacy.autoLaunchDevices", true), {})
    },
    report: { source: "legacy-v2", imported, skipped, invalid }
  };
}
function deviceId(serial) {
  return `device-${node_crypto.createHash("sha256").update(serial).digest("hex").slice(0, 16)}`;
}
function configFromView(view, revision, previous, now) {
  const previousDevices = new Map(previous?.knownDevices.map((device) => [device.lastSerial, device]) || []);
  const serials = /* @__PURE__ */ new Set([
    ...Object.keys(view.deviceAliases),
    ...Object.keys(view.deviceProfiles),
    ...Object.keys(view.autoLaunchDevices),
    ...view.groups.flatMap((group2) => group2.serials),
    ...previous?.knownDevices.map((device) => device.lastSerial) || []
  ]);
  const knownDevices = [...serials].map((serial) => {
    const existing = previousDevices.get(serial);
    return {
      id: existing?.id || deviceId(serial),
      lastSerial: serial,
      alias: view.deviceAliases[serial] || "",
      model: existing?.model || "",
      lastConnection: serial.includes(":") ? "wireless" : "usb",
      defaultProfileId: view.deviceProfiles[serial] || void 0,
      groupIds: existing?.groupIds || [],
      autoConnect: existing?.autoConnect || false,
      autoLaunch: view.autoLaunchDevices[serial] || false,
      firstSeenAt: existing?.firstSeenAt || now,
      lastSeenAt: existing?.lastSeenAt || now
    };
  });
  const idBySerial = new Map(knownDevices.map((device) => [device.lastSerial, device.id]));
  const groups = view.groups.map((group2) => ({
    id: group2.id,
    name: group2.name,
    deviceIds: group2.serials.map((serial) => idBySerial.get(serial)).filter(Boolean),
    defaultProfileId: group2.defaultProfileId,
    concurrencyLimit: group2.concurrencyLimit,
    description: group2.description
  }));
  const groupIdsByDevice = /* @__PURE__ */ new Map();
  for (const group2 of groups) {
    for (const id of group2.deviceIds) groupIdsByDevice.set(id, [...groupIdsByDevice.get(id) || [], group2.id]);
  }
  for (const device of knownDevices) device.groupIds = groupIdsByDevice.get(device.id) || [];
  return {
    schemaVersion: 3,
    revision,
    locale: view.locale,
    appearance: { muteNotifications: view.muteNotifications, theme: view.theme, accentScheme: view.accentScheme, accentReversed: view.accentReversed, swipePanel: view.swipePanel, navBar: view.navBar, qrPairing: view.qrPairing, panelOrder: view.panelOrder, panelVisibility: view.panelVisibility },
    update: { checkOnStartup: view.update.checkOnStartup, autoUpdateOnStartup: view.update.autoUpdateOnStartup, skipConfirmation: view.update.skipConfirmation },
    toolkit: { sshEnabled: view.toolkit.sshEnabled, sshHost: view.toolkit.sshHost, sshLocalPort: view.toolkit.sshLocalPort, sshRemotePort: view.toolkit.sshRemotePort, perInstanceTerminal: view.toolkit.perInstanceTerminal, recentCommands: [...view.toolkit.recentCommands], commandUsage: { ...view.toolkit.commandUsage } },
    runtime: { mode: view.runtime.scrcpyPath ? "custom" : "bundled", customScrcpyPath: view.runtime.scrcpyPath },
    defaults: {
      launch: structuredClone(view.launch),
      minimizeToTray: view.minimizeToTray,
      killAdbOnQuit: view.killAdbOnQuit,
      autoSelectFirstDevice: view.autoSelectFirstDevice,
      scripts: structuredClone(view.scripts)
    },
    shortcuts: { bossKeyEnabled: view.bossKeyEnabled, bossKeyAccelerator: view.bossKeyAccelerator },
    knownDevices,
    profiles: structuredClone(view.profiles),
    wirelessTargets: structuredClone(view.wirelessTargets),
    automations: structuredClone(view.automations),
    groups
  };
}
function knownDevice(value, name) {
  const source = object(value, name);
  const lastConnection = source.lastConnection;
  if (lastConnection !== "usb" && lastConnection !== "wireless") throw new TypeError(`${name}.lastConnection is invalid.`);
  return {
    id: boundedString$1(source.id, `${name}.id`, 128),
    lastSerial: boundedString$1(source.lastSerial, `${name}.lastSerial`, 512),
    alias: boundedString$1(source.alias, `${name}.alias`, 128, true),
    model: boundedString$1(source.model, `${name}.model`, 128, true),
    lastConnection,
    defaultProfileId: source.defaultProfileId === void 0 ? void 0 : boundedString$1(source.defaultProfileId, `${name}.defaultProfileId`, 128),
    groupIds: array(source.groupIds, `${name}.groupIds`).map((item, index) => boundedString$1(item, `${name}.groupIds[${index}]`, 128)),
    autoConnect: strictBoolean(source.autoConnect, `${name}.autoConnect`),
    autoLaunch: strictBoolean(source.autoLaunch, `${name}.autoLaunch`),
    firstSeenAt: boundedString$1(source.firstSeenAt, `${name}.firstSeenAt`, 64),
    lastSeenAt: boundedString$1(source.lastSeenAt, `${name}.lastSeenAt`, 64)
  };
}
function group(value, name) {
  const source = object(value, name);
  const concurrencyLimit = source.concurrencyLimit === void 0 ? 3 : integer(source.concurrencyLimit, `${name}.concurrencyLimit`, 1);
  if (concurrencyLimit > 8) throw new TypeError(`${name}.concurrencyLimit may not exceed 8.`);
  return {
    id: boundedString$1(source.id, `${name}.id`, 128),
    name: boundedString$1(source.name, `${name}.name`, 128),
    deviceIds: array(source.deviceIds, `${name}.deviceIds`).map((item, index) => boundedString$1(item, `${name}.deviceIds[${index}]`, 128)),
    defaultProfileId: source.defaultProfileId === void 0 ? void 0 : boundedString$1(source.defaultProfileId, `${name}.defaultProfileId`, 128),
    concurrencyLimit,
    description: source.description === void 0 ? "" : boundedString$1(source.description, `${name}.description`, 1024, true)
  };
}
function updateSection(value, name = "update") {
  const source = object(value === void 0 ? {} : value, name);
  return {
    checkOnStartup: source.checkOnStartup === void 0 ? false : strictBoolean(source.checkOnStartup, `${name}.checkOnStartup`),
    autoUpdateOnStartup: source.autoUpdateOnStartup === void 0 ? false : strictBoolean(source.autoUpdateOnStartup, `${name}.autoUpdateOnStartup`),
    skipConfirmation: source.skipConfirmation === void 0 ? false : strictBoolean(source.skipConfirmation, `${name}.skipConfirmation`)
  };
}
function toolkitSection(value, name = "toolkit") {
  const source = object(value === void 0 ? {} : value, name);
  const usage = object(source.commandUsage === void 0 ? {} : source.commandUsage, `${name}.commandUsage`);
  const commandUsage = {};
  for (const [key, count] of Object.entries(usage)) {
    commandUsage[boundedString$1(key, `${name}.commandUsage key`, 512)] = nonNegativeInteger(count, `${name}.commandUsage.${key}`);
  }
  return {
    sshEnabled: source.sshEnabled === void 0 ? false : strictBoolean(source.sshEnabled, `${name}.sshEnabled`),
    sshHost: source.sshHost === void 0 ? "" : boundedString$1(source.sshHost, `${name}.sshHost`, 256, true),
    sshLocalPort: source.sshLocalPort === void 0 ? 5555 : nonNegativeInteger(source.sshLocalPort, `${name}.sshLocalPort`),
    sshRemotePort: source.sshRemotePort === void 0 ? 5555 : nonNegativeInteger(source.sshRemotePort, `${name}.sshRemotePort`),
    perInstanceTerminal: source.perInstanceTerminal === void 0 ? false : strictBoolean(source.perInstanceTerminal, `${name}.perInstanceTerminal`),
    recentCommands: array(source.recentCommands, `${name}.recentCommands`).slice(0, 12).map((entry, index) => boundedString$1(entry, `${name}.recentCommands[${index}]`, 512, true)),
    commandUsage
  };
}
function validateAppConfigV3(value) {
  const source = object(value, "configV3");
  if (source.schemaVersion !== 3) throw new TypeError("Unsupported config schema version.");
  const appearance = object(source.appearance, "configV3.appearance");
  const runtime = object(source.runtime, "configV3.runtime");
  const defaults = object(source.defaults, "configV3.defaults");
  const shortcuts = object(source.shortcuts, "configV3.shortcuts");
  const configLocale = locale(source.locale);
  if (runtime.mode !== "bundled" && runtime.mode !== "custom") throw new TypeError("configV3.runtime.mode is invalid.");
  const profiles = array(source.profiles, "configV3.profiles").map((item, index) => validateLaunchProfile(item, `configV3.profiles[${index}]`));
  const profileIds = new Set(profiles.map((item) => item.id));
  const knownDevices = array(source.knownDevices, "configV3.knownDevices").map((item, index) => knownDevice(item, `configV3.knownDevices[${index}]`));
  const wirelessTargets = array(source.wirelessTargets, "configV3.wirelessTargets").map((item, index) => wirelessTarget(item, `configV3.wirelessTargets[${index}]`));
  const automations = array(source.automations, "configV3.automations").map((item, index) => automation(item, `configV3.automations[${index}]`));
  const groups = array(source.groups, "configV3.groups").map((item, index) => group(item, `configV3.groups[${index}]`));
  assertUnique(profiles, (item) => item.id, "configV3.profiles");
  assertUnique(knownDevices, (item) => item.id, "configV3.knownDevices");
  assertUnique(knownDevices, (item) => item.lastSerial, "configV3 known device serials");
  assertUnique(wirelessTargets, (item) => item.id, "configV3.wirelessTargets");
  assertUnique(automations, (item) => item.id, "configV3.automations");
  assertUnique(groups, (item) => item.id, "configV3.groups");
  const groupIds = new Set(groups.map((item) => item.id));
  const deviceIds = new Set(knownDevices.map((item) => item.id));
  for (const device of knownDevices) {
    if (device.defaultProfileId && !profileIds.has(device.defaultProfileId)) throw new TypeError("A known device references an unknown profile.");
    if (device.groupIds.some((id) => !groupIds.has(id))) throw new TypeError("A known device references an unknown group.");
  }
  if (groups.some((item) => item.deviceIds.some((id) => !deviceIds.has(id)))) throw new TypeError("A group references an unknown device.");
  if (groups.some((item) => item.defaultProfileId && !profileIds.has(item.defaultProfileId))) throw new TypeError("A group references an unknown profile.");
  if (groups.some((item) => new Set(item.deviceIds).size !== item.deviceIds.length)) throw new TypeError("A group contains duplicate devices.");
  return {
    schemaVersion: 3,
    revision: integer(source.revision, "configV3.revision"),
    locale: configLocale,
    appearance: { muteNotifications: strictBoolean(appearance.muteNotifications, "configV3.appearance.muteNotifications"), theme: themeValue(appearance.theme), accentScheme: accentSchemeValue(appearance.accentScheme), accentReversed: strictBoolean(appearance.accentReversed, "configV3.appearance.accentReversed"), swipePanel: strictBoolean(appearance.swipePanel, "configV3.appearance.swipePanel"), navBar: strictBoolean(appearance.navBar, "configV3.appearance.navBar"), qrPairing: strictBoolean(appearance.qrPairing, "configV3.appearance.qrPairing"), panelOrder: panelOrderValue(appearance.panelOrder), panelVisibility: panelVisibilityValue(appearance.panelVisibility) },
    update: updateSection(source.update, "configV3.update"),
    toolkit: toolkitSection(source.toolkit, "configV3.toolkit"),
    runtime: {
      mode: runtime.mode,
      customScrcpyPath: runtime.mode === "bundled" ? "" : boundedString$1(runtime.customScrcpyPath, "configV3.runtime.customScrcpyPath", 4096)
    },
    defaults: {
      launch: launchConfig(defaults.launch),
      minimizeToTray: strictBoolean(defaults.minimizeToTray, "configV3.defaults.minimizeToTray"),
      killAdbOnQuit: strictBoolean(defaults.killAdbOnQuit, "configV3.defaults.killAdbOnQuit"),
      autoSelectFirstDevice: strictBoolean(defaults.autoSelectFirstDevice, "configV3.defaults.autoSelectFirstDevice"),
      scripts: scriptsRecord(defaults.scripts, "configV3.defaults.scripts")
    },
    shortcuts: {
      bossKeyEnabled: strictBoolean(shortcuts.bossKeyEnabled, "configV3.shortcuts.bossKeyEnabled"),
      bossKeyAccelerator: boundedString$1(shortcuts.bossKeyAccelerator, "configV3.shortcuts.bossKeyAccelerator", 128)
    },
    knownDevices,
    profiles,
    wirelessTargets,
    automations,
    groups
  };
}
class ConfigRepository {
  constructor(directory, now = () => /* @__PURE__ */ new Date()) {
    this.directory = directory;
    this.now = now;
    this.saveQueue = Promise.resolve();
    this.configPath = node_path.join(directory, "config.json");
    this.backupPath = node_path.join(directory, "config.backup.json");
  }
  load(legacyJson, fallbackLocale) {
    if (this.current) {
      return Promise.resolve(this.use(this.current, { source: "existing-v3", imported: 0, skipped: 0, invalid: 0 }));
    }
    this.loadPromise ||= this.loadOnce(legacyJson, fallbackLocale);
    return this.loadPromise;
  }
  snapshot() {
    return this.current ? structuredClone(configView(this.current)) : void 0;
  }
  async save(expectedRevision, value) {
    let resolveResult;
    const result = new Promise((resolve) => {
      resolveResult = resolve;
    });
    this.saveQueue = this.saveQueue.then(async () => {
      try {
        if (!this.current) throw new Error("Configuration has not been loaded.");
        if (expectedRevision !== this.current.revision) {
          resolveResult(operationFailure(
            "CONFIG_REVISION_CONFLICT",
            "config-save",
            `Configuration changed; expected revision ${expectedRevision}, current revision is ${this.current.revision}.`,
            { retryable: true, suggestedActions: ["Reload the latest configuration and retry the change."] }
          ));
          return;
        }
        const view = validatePersistedConfig(value);
        const next = validateAppConfigV3(configFromView(view, this.current.revision + 1, this.current, this.now().toISOString()));
        await this.atomicWrite(next, true);
        this.current = next;
        resolveResult({ ok: true, data: { config: configView(next), revision: next.revision } });
      } catch (error) {
        resolveResult(failureFromUnknown(
          error,
          "CONFIG_SAVE_FAILED",
          "config-save",
          "Unable to save the configuration.",
          { retryable: true, suggestedActions: ["Retry the change after checking available disk space."] }
        ));
      }
    });
    await this.saveQueue;
    return result;
  }
  async loadOnce(legacyJson, fallbackLocale) {
    await promises.mkdir(this.directory, { recursive: true });
    const primary = await this.readValidated(this.configPath);
    if (primary) return this.use(primary, { source: "existing-v3", imported: 0, skipped: 0, invalid: 0 });
    const backup = await this.readValidated(this.backupPath);
    if (backup) {
      await this.atomicWrite(backup, false);
      return this.use(backup, { source: "backup", imported: 0, skipped: 0, invalid: 1 });
    }
    let legacy = {};
    let source = "defaults";
    if (legacyJson) {
      if (Buffer.byteLength(legacyJson) > MAX_CONFIG_BYTES) throw new TypeError("Legacy configuration exceeds the 2 MB limit.");
      try {
        legacy = JSON.parse(legacyJson);
        source = "legacy-v2";
      } catch {
        legacy = {};
        source = "defaults";
      }
    }
    const migrated = safeLegacyConfig(legacy, fallbackLocale);
    migrated.report.source = source;
    const config = validateAppConfigV3(configFromView(migrated.config, 1, void 0, this.now().toISOString()));
    await this.atomicWrite(config, false);
    return this.use(config, migrated.report);
  }
  use(config, migration) {
    this.current = config;
    return { config: configView(config), revision: config.revision, migration };
  }
  async readValidated(path) {
    let contents;
    try {
      contents = await readBoundedRegularUtf8File(
        path,
        MAX_CONFIG_BYTES,
        "Configuration must be a regular file no larger than 2 MiB."
      );
    } catch {
      return void 0;
    }
    let parsed;
    try {
      parsed = JSON.parse(contents);
    } catch {
      return void 0;
    }
    const schemaVersion = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed.schemaVersion : void 0;
    if (typeof schemaVersion === "number" && schemaVersion > 3) {
      throw new Error(`Configuration schema ${schemaVersion} is newer than supported schema 3; the file was left unchanged.`);
    }
    try {
      return validateAppConfigV3(parsed);
    } catch {
      return void 0;
    }
  }
  async atomicWrite(config, rotateBackup) {
    const temporaryPath = `${this.configPath}.${process.pid}.${node_crypto.randomUUID()}.tmp`;
    try {
      const handle2 = await promises.open(temporaryPath, "wx", 384);
      try {
        await handle2.writeFile(`${JSON.stringify(config, null, 2)}
`, "utf8");
        await handle2.sync();
      } finally {
        await handle2.close();
      }
      if (rotateBackup && await this.exists(this.configPath)) await promises.copyFile(this.configPath, this.backupPath);
      await promises.rename(temporaryPath, this.configPath);
    } catch (error) {
      await promises.rm(temporaryPath, { force: true });
      throw error;
    }
  }
  async exists(path) {
    try {
      await promises.access(path, node_fs.constants.F_OK);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }
}
const MAX_EVENT_MESSAGE_BYTES = 16 * 1024;
const MAX_EVENT_DATA_BYTES = 16 * 1024;
function truncateUtf8(value, maxBytes) {
  const originalLength = Buffer.byteLength(value);
  if (originalLength <= maxBytes) return { value };
  let end = value.length;
  while (end > 0 && Buffer.byteLength(value.slice(0, end)) > maxBytes - 3) end -= Math.max(1, Math.ceil((Buffer.byteLength(value.slice(0, end)) - maxBytes) / 2));
  while (end > 0 && Buffer.byteLength(value.slice(0, end)) > maxBytes - 3) end -= 1;
  return { value: `${value.slice(0, end)}…`, originalLength };
}
function boundedData(data) {
  if (!data) return void 0;
  try {
    const encoded = JSON.stringify(data);
    if (Buffer.byteLength(encoded) <= MAX_EVENT_DATA_BYTES) return structuredClone(data);
    return { truncated: true, originalLength: Buffer.byteLength(encoded) };
  } catch {
    return { truncated: true, reason: "non-serializable event data" };
  }
}
class EventStore {
  constructor(capacity = 5e3, now = () => /* @__PURE__ */ new Date()) {
    this.capacity = capacity;
    this.now = now;
    this.events = [];
    this.listeners = /* @__PURE__ */ new Set();
    if (!Number.isInteger(capacity) || capacity < 1) throw new TypeError("EventStore capacity must be a positive integer.");
  }
  publish(input2) {
    const message2 = truncateUtf8(input2.message, MAX_EVENT_MESSAGE_BYTES);
    const data = boundedData(input2.data);
    const event = {
      ...input2,
      id: input2.id || node_crypto.randomUUID(),
      timestamp: input2.timestamp || this.now().toISOString(),
      message: message2.value,
      data: message2.originalLength ? { ...data, messageTruncated: true, originalLength: message2.originalLength } : data
    };
    this.events.push(event);
    if (this.events.length > this.capacity) this.events.splice(0, this.events.length - this.capacity);
    for (const listener of this.listeners) listener(structuredClone(event));
    return structuredClone(event);
  }
  list(query) {
    const levels = query.levels?.length ? new Set(query.levels) : void 0;
    const domains = query.domains?.length ? new Set(query.domains) : void 0;
    return this.events.filter((event) => (!levels || levels.has(event.level)) && (!domains || domains.has(event.domain))).slice(-query.limit).map((event) => structuredClone(event));
  }
  clear() {
    this.events.length = 0;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
function validateEventQuery(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("event query must be an object.");
  const source = value;
  if (!Number.isInteger(source.limit) || Number(source.limit) < 1 || Number(source.limit) > 5e3) {
    throw new TypeError("event query limit must be an integer from 1 to 5000.");
  }
  const validLevels = /* @__PURE__ */ new Set(["debug", "info", "warn", "error"]);
  const validDomains = /* @__PURE__ */ new Set(["runtime", "device", "session", "config", "automation", "artifact", "update"]);
  const enumArray = (input2, name, allowed) => {
    if (input2 === void 0) return void 0;
    if (!Array.isArray(input2) || input2.length > allowed.size || input2.some((item) => typeof item !== "string" || !allowed.has(item))) {
      throw new TypeError(`${name} contains an unsupported value.`);
    }
    return [...new Set(input2)];
  };
  return {
    limit: Number(source.limit),
    levels: enumArray(source.levels, "event query levels", validLevels),
    domains: enumArray(source.domains, "event query domains", validDomains)
  };
}
function output(stdout, stderr) {
  const value = `${stdout}
${stderr}`.trim();
  return value.length > 16384 ? `${value.slice(0, 16383)}…` : value;
}
function redactSourcePath(value, sourcePath, sourceName) {
  return sourcePath ? value.split(sourcePath).join(sourceName) : value;
}
function lines(value) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
function parsePackageIds(value) {
  return [...new Set(lines(value).map((line) => {
    if (!line.startsWith("package:")) return void 0;
    const body = line.slice("package:".length);
    return body.includes("=") ? body.slice(body.lastIndexOf("=") + 1) : body;
  }).filter((packageId) => packageId && /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+$/.test(packageId)))];
}
function parseLauncherPackages(value) {
  const result = /* @__PURE__ */ new Set();
  for (const line of lines(value)) {
    const match = line.match(/(?:^|\s)([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\/[a-zA-Z0-9_.$]+/);
    if (match) result.add(match[1]);
  }
  return result;
}
function mergeInstalledApps(userOutput, systemOutput, launcherOutput) {
  const user = new Set(parsePackageIds(userOutput));
  const system = new Set(parsePackageIds(systemOutput));
  const launchable = parseLauncherPackages(launcherOutput);
  return [.../* @__PURE__ */ new Set([...user, ...system])].sort((left, right) => left.localeCompare(right)).slice(0, 1e4).map((packageId) => ({ packageId, label: packageId, system: system.has(packageId), launchable: launchable.has(packageId) }));
}
function parseGetprop(value) {
  const properties = {};
  for (const line of lines(value)) {
    const match = line.match(/^\[([^\]]+)\]: \[(.*)\]$/);
    if (match) properties[match[1]] = match[2];
  }
  return properties;
}
function parseDisplaySize(value) {
  return value.match(/(?:Physical|Override) size:\s*(\d+x\d+)/i)?.[1] || value.match(/\b(\d+x\d+)\b/)?.[1] || "";
}
function parseBatteryLevel(value) {
  const level = Number(value.match(/^\s*level:\s*(\d+)\s*$/mi)?.[1]);
  return Number.isInteger(level) && level >= 0 && level <= 100 ? level : void 0;
}
function validateRemoteDirectory(value) {
  const target = value.trim();
  if (!target.startsWith("/") || target.length > 1024 || /[\0\r\n\\]/.test(target)) {
    throw new TypeError("Remote target must be an absolute Android path of at most 1024 characters.");
  }
  if (target.split("/").some((segment) => segment === "." || segment === "..")) {
    throw new TypeError("Remote target may not contain dot path segments.");
  }
  return target === "/" ? "/" : `${target.replace(/\/+$/, "")}/`;
}
function validatePackageId(value) {
  const packageId = value.trim();
  if (packageId.length > 255 || !/^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+$/.test(packageId)) {
    throw new TypeError("Android package id is invalid.");
  }
  return packageId;
}
function validateRemoteFileName(value) {
  if (!value || value.length > 255 || value === "." || value === ".." || /[\0\r\n/\\]/.test(value)) {
    throw new TypeError("Selected filename cannot be represented safely on the Android target.");
  }
  return value;
}
async function mapLimit$1(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}
class DeviceWorkspaceService {
  constructor(adb = adbService, now = () => /* @__PURE__ */ new Date()) {
    this.adb = adb;
    this.now = now;
    this.appCache = /* @__PURE__ */ new Map();
  }
  async overview(runtime, serial) {
    const [propertiesResult, displayResult, batteryResult] = await Promise.all([
      this.adb.runForDevice(runtime, serial, ["shell", "getprop"]),
      this.adb.runForDevice(runtime, serial, ["shell", "wm", "size"]),
      this.adb.runForDevice(runtime, serial, ["shell", "dumpsys", "battery"])
    ]);
    const properties = parseGetprop(propertiesResult.stdout);
    return {
      serial,
      manufacturer: properties["ro.product.manufacturer"] || "",
      model: properties["ro.product.model"] || "",
      androidVersion: properties["ro.build.version.release"] || "",
      sdk: properties["ro.build.version.sdk"] || "",
      abi: properties["ro.product.cpu.abi"] || "",
      displaySize: parseDisplaySize(output(displayResult.stdout, displayResult.stderr)),
      batteryLevel: parseBatteryLevel(output(batteryResult.stdout, batteryResult.stderr))
    };
  }
  async listApps(runtime, serial, refresh = false) {
    if (!refresh) {
      const cached = this.appCache.get(serial);
      if (cached) return structuredClone(cached);
    }
    const [userResult, systemResult, launcherResult] = await Promise.all([
      this.adb.runForDevice(runtime, serial, ["shell", "pm", "list", "packages", "-3"]),
      this.adb.runForDevice(runtime, serial, ["shell", "pm", "list", "packages", "-s"]),
      this.adb.runForDevice(runtime, serial, ["shell", "cmd", "package", "query-activities", "--brief", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.LAUNCHER"]).catch(() => ({ stdout: "", stderr: "" }))
    ]);
    const apps = mergeInstalledApps(userResult.stdout, systemResult.stdout, launcherResult.stdout);
    this.appCache.set(serial, apps);
    return structuredClone(apps);
  }
  async startApp(runtime, serial, packageId) {
    const safePackageId = validatePackageId(packageId);
    const result = await this.adb.runForDevice(runtime, serial, [
      "shell",
      "monkey",
      "-p",
      safePackageId,
      "-c",
      "android.intent.category.LAUNCHER",
      "1"
    ]);
    const message2 = output(result.stdout, result.stderr);
    if (/no activities found|monkey aborted|error:/i.test(message2)) throw new Error(message2 || "No launchable activity was found.");
    return message2 || `Started ${safePackageId}.`;
  }
  async pushFiles(runtime, serials, files, target, conflict, onProgress) {
    const id = node_crypto.randomUUID();
    const startedAt = this.now().toISOString();
    const directory = validateRemoteDirectory(target);
    const tasks = serials.flatMap((serial) => files.map((file) => ({
      serial,
      file: { ...file, name: validateRemoteFileName(file.name) }
    })));
    const names = new Set(tasks.filter((task) => task.serial === serials[0]).map((task) => task.file.name));
    if (names.size !== files.length) throw new TypeError("Selected files must have unique target filenames.");
    const results = await mapLimit$1(tasks, 2, async ({ serial, file }) => {
      const targetPath = node_path.posix.join(directory, file.name);
      const targetId = `${serial}:${file.name}`;
      onProgress?.({ batchId: id, kind: "file-push", deviceId: serial, targetId, status: "running", timestamp: this.now().toISOString(), message: `Pushing ${file.name}.`, size: file.size });
      try {
        if (conflict === "skip" && await this.remoteExists(runtime, serial, targetPath)) {
          const result2 = {
            targetId,
            ok: true,
            data: { serial, sourceName: file.name, size: file.size, targetPath, skipped: true, output: "Skipped because the target already exists." }
          };
          onProgress?.({ batchId: id, kind: "file-push", deviceId: serial, targetId, status: "skipped", timestamp: this.now().toISOString(), message: result2.data.output, size: file.size });
          return result2;
        }
        const result = await this.adb.runForDevice(runtime, serial, ["push", file.path, targetPath], { timeout: 10 * 6e4, maxBuffer: 4 * 1024 * 1024 });
        const item = {
          targetId,
          ok: true,
          data: { serial, sourceName: file.name, size: file.size, targetPath, skipped: false, output: redactSourcePath(output(result.stdout, result.stderr), file.path, file.name) }
        };
        onProgress?.({ batchId: id, kind: "file-push", deviceId: serial, targetId, status: "success", timestamp: this.now().toISOString(), message: item.data.output || "File pushed.", size: file.size });
        return item;
      } catch (error) {
        const item = {
          targetId,
          ok: false,
          error: structuredErrorFromUnknown(error, "FILE_PUSH_FAILED", "file-push", `Unable to push ${file.name} to ${serial}.`, {
            retryable: true,
            suggestedActions: ["Confirm that the device is connected and the target directory is writable."]
          })
        };
        if (item.error?.detail) item.error.detail = redactSourcePath(item.error.detail, file.path, file.name);
        onProgress?.({ batchId: id, kind: "file-push", deviceId: serial, targetId, status: "failed", timestamp: this.now().toISOString(), message: item.error.message, size: file.size });
        return item;
      }
    });
    return { id, startedAt, completedAt: this.now().toISOString(), results };
  }
  async installApk(runtime, serials, file, replace, downgrade, onProgress) {
    const id = node_crypto.randomUUID();
    const startedAt = this.now().toISOString();
    const results = await mapLimit$1(serials, 2, async (serial) => {
      onProgress?.({ batchId: id, kind: "apk-install", deviceId: serial, targetId: serial, status: "running", timestamp: this.now().toISOString(), message: `Installing ${file.name}.`, size: file.size });
      try {
        const args = ["install", ...replace ? ["-r"] : [], ...downgrade ? ["-d"] : [], file.path];
        const result = await this.adb.runForDevice(runtime, serial, args, { timeout: 10 * 6e4, maxBuffer: 4 * 1024 * 1024 });
        const message2 = redactSourcePath(output(result.stdout, result.stderr), file.path, file.name);
        if (!/^success\b/im.test(message2)) throw new Error(message2 || "Android package manager did not report success.");
        const item = {
          targetId: serial,
          ok: true,
          data: { serial, sourceName: file.name, size: file.size, replace, downgrade, output: message2 }
        };
        onProgress?.({ batchId: id, kind: "apk-install", deviceId: serial, targetId: serial, status: "success", timestamp: this.now().toISOString(), message: message2, size: file.size });
        return item;
      } catch (error) {
        const item = {
          targetId: serial,
          ok: false,
          error: structuredErrorFromUnknown(error, "APK_INSTALL_FAILED", "apk-install", `Unable to install ${file.name} on ${serial}.`, {
            retryable: true,
            suggestedActions: ["Review the package-manager detail for signature, version, or storage errors."]
          })
        };
        if (item.error?.detail) item.error.detail = redactSourcePath(item.error.detail, file.path, file.name);
        onProgress?.({ batchId: id, kind: "apk-install", deviceId: serial, targetId: serial, status: "failed", timestamp: this.now().toISOString(), message: item.error.message, size: file.size });
        return item;
      }
    });
    return { id, startedAt, completedAt: this.now().toISOString(), results };
  }
  async remoteExists(runtime, serial, path) {
    try {
      await this.adb.runForDevice(runtime, serial, ["shell", "ls", "-d", path]);
      return true;
    } catch {
      return false;
    }
  }
}
const deviceWorkspaceService = new DeviceWorkspaceService();
const MAX_INDEX_BYTES = 4 * 1024 * 1024;
const MAX_ARTIFACTS = 5e3;
const kinds = /* @__PURE__ */ new Set(["screenshot", "recording", "transfer-report", "diagnostic"]);
function clone(record2) {
  return { ...record2, metadata: { ...record2.metadata } };
}
function recordPathFromArgs(args) {
  return args.find((arg) => arg.startsWith("--record="))?.slice("--record=".length) || void 0;
}
function recordingPathForSession(session) {
  return recordPathFromArgs(session.args);
}
function validateQuery(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Artifact query must be an object.");
  const query = value;
  if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > MAX_ARTIFACTS) {
    throw new TypeError(`Artifact query limit must be an integer from 1 to ${MAX_ARTIFACTS}.`);
  }
  if (query.kinds && (!Array.isArray(query.kinds) || query.kinds.some((kind) => !kinds.has(kind)))) {
    throw new TypeError("Artifact query contains an unsupported kind.");
  }
  if (query.deviceId !== void 0 && (typeof query.deviceId !== "string" || query.deviceId.length > 512)) {
    throw new TypeError("Artifact device filter is invalid.");
  }
  return { limit: query.limit, kinds: query.kinds ? [...new Set(query.kinds)] : void 0, deviceId: query.deviceId };
}
function artifactRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const source = value;
  if (typeof source.id !== "string" || source.id.length < 1 || source.id.length > 128 || !kinds.has(source.kind) || !["available", "missing", "incomplete"].includes(String(source.status)) || typeof source.createdAt !== "string" || source.createdAt.length > 64 || typeof source.updatedAt !== "string" || source.updatedAt.length > 64 || typeof source.name !== "string" || typeof source.path !== "string" || source.path.length > 4096 || !node_path.isAbsolute(source.path) || typeof source.size !== "number" || !Number.isFinite(source.size) || source.size < 0 || !source.metadata || typeof source.metadata !== "object" || Array.isArray(source.metadata)) return void 0;
  const metadata = {};
  for (const [key, item] of Object.entries(source.metadata)) {
    if (key.length > 128 || typeof item !== "string" && typeof item !== "number" && typeof item !== "boolean" || typeof item === "string" && item.length > 4096 || typeof item === "number" && !Number.isFinite(item)) return void 0;
    metadata[key] = item;
  }
  return {
    id: source.id,
    kind: source.kind,
    status: source.status,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    name: source.name.slice(0, 512),
    path: source.path,
    size: source.size,
    deviceId: typeof source.deviceId === "string" ? source.deviceId : void 0,
    sessionId: typeof source.sessionId === "string" ? source.sessionId : void 0,
    metadata
  };
}
class ArtifactService {
  constructor(directory, now = () => /* @__PURE__ */ new Date()) {
    this.directory = directory;
    this.now = now;
    this.index = { schemaVersion: 1, revision: 0, artifacts: [] };
    this.writeQueue = Promise.resolve();
    this.indexPath = node_path.join(directory, "artifacts.json");
    this.reportsDirectory = node_path.join(directory, "artifacts", "reports");
  }
  async list(rawQuery) {
    await this.load();
    const query = validateQuery(rawQuery);
    await this.reconcile();
    const allowedKinds = query.kinds?.length ? new Set(query.kinds) : void 0;
    return this.index.artifacts.filter((item) => (!allowedKinds || allowedKinds.has(item.kind)) && (!query.deviceId || item.deviceId === query.deviceId)).sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, query.limit).map(clone);
  }
  async register(input2) {
    await this.load();
    if (!kinds.has(input2.kind) || !node_path.isAbsolute(input2.path)) throw new TypeError("Artifact kind or path is invalid.");
    const existing = input2.sessionId ? this.index.artifacts.find((item) => item.sessionId === input2.sessionId && item.path === input2.path) : void 0;
    const file = await this.fileSnapshot(input2.path);
    const requestedStatus = input2.status === "incomplete" && file.status === "missing" ? "missing" : input2.status;
    const timestamp = this.now().toISOString();
    if (existing) {
      existing.status = requestedStatus || file.status;
      existing.size = file.size;
      existing.updatedAt = timestamp;
      existing.metadata = { ...existing.metadata, ...input2.metadata || {} };
      await this.persist();
      return clone(existing);
    }
    const record2 = {
      id: node_crypto.randomUUID(),
      kind: input2.kind,
      status: requestedStatus || file.status,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: node_path.basename(input2.path),
      path: input2.path,
      size: file.size,
      deviceId: input2.deviceId,
      sessionId: input2.sessionId,
      metadata: { ...input2.metadata || {} }
    };
    this.index.artifacts.unshift(record2);
    if (this.index.artifacts.length > MAX_ARTIFACTS) this.index.artifacts.length = MAX_ARTIFACTS;
    await this.persist();
    return clone(record2);
  }
  async registerRecording(session) {
    const path = recordingPathForSession(session);
    if (!path) return void 0;
    const incomplete = session.state === "failed" || session.exitCode !== void 0 && session.exitCode !== 0;
    return this.register({
      kind: "recording",
      path,
      deviceId: session.serialAtLaunch,
      sessionId: session.id,
      status: incomplete ? "incomplete" : void 0,
      metadata: { scene: session.scene, incomplete, ...session.exitCode === void 0 ? {} : { exitCode: session.exitCode } }
    });
  }
  async registerTransferReport(kind, batch) {
    await this.load();
    await promises.mkdir(this.reportsDirectory, { recursive: true });
    const path = node_path.join(this.reportsDirectory, `${kind}-${batch.id}.json`);
    await this.atomicFile(path, `${JSON.stringify({ schemaVersion: 1, kind, ...batch }, null, 2)}
`);
    return this.register({
      kind: "transfer-report",
      path,
      metadata: {
        operation: kind,
        total: batch.results.length,
        succeeded: batch.results.filter((item) => item.ok).length,
        failed: batch.results.filter((item) => !item.ok).length
      }
    });
  }
  async registerBatchRunReport(report) {
    await this.load();
    await promises.mkdir(this.reportsDirectory, { recursive: true });
    const path = node_path.join(this.reportsDirectory, `batch-${report.actionType}-${report.id}.json`);
    await this.atomicFile(path, `${JSON.stringify({ schemaVersion: 1, kind: "batch-run", ...report }, null, 2)}
`);
    return this.register({
      kind: "transfer-report",
      path,
      metadata: {
        operation: report.actionType,
        state: report.state,
        canceled: report.canceled,
        total: report.results.length,
        succeeded: report.results.filter((item) => item.ok).length,
        failed: report.results.filter((item) => !item.ok).length
      }
    });
  }
  async getExisting(id) {
    await this.load();
    const record2 = this.index.artifacts.find((item) => item.id === id);
    if (!record2) throw new Error("Artifact record was not found.");
    const file = await this.fileSnapshot(record2.path);
    if (file.status === "missing") {
      record2.status = "missing";
      record2.size = 0;
      record2.updatedAt = this.now().toISOString();
      await this.persist();
      throw new Error("Artifact file is missing.");
    }
    return clone(record2);
  }
  async delete(id, deleteFile) {
    await this.load();
    const index = this.index.artifacts.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Artifact record was not found.");
    const record2 = this.index.artifacts[index];
    if (deleteFile) {
      try {
        const info = await promises.stat(record2.path);
        if (!info.isFile()) throw new Error("Artifact path is not a regular file.");
        await promises.unlink(record2.path);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    this.index.artifacts.splice(index, 1);
    await this.persist();
  }
  async load() {
    this.loadPromise ||= this.loadOnce();
    return this.loadPromise;
  }
  async loadOnce() {
    await promises.mkdir(this.directory, { recursive: true });
    let contents;
    try {
      contents = await readBoundedRegularUtf8File(
        this.indexPath,
        MAX_INDEX_BYTES,
        "Artifact index must be a regular file no larger than 4 MiB."
      );
    } catch {
      return;
    }
    try {
      const parsed = JSON.parse(contents);
      if (parsed.schemaVersion !== 1 || !Number.isInteger(parsed.revision) || !Array.isArray(parsed.artifacts)) return;
      const artifacts = parsed.artifacts.slice(0, MAX_ARTIFACTS).map(artifactRecord).filter(Boolean);
      this.index = { schemaVersion: 1, revision: Number(parsed.revision), artifacts };
    } catch {
    }
  }
  async reconcile() {
    let changed = false;
    await Promise.all(this.index.artifacts.map(async (record2) => {
      const file = await this.fileSnapshot(record2.path);
      const nextStatus = record2.status === "incomplete" && file.status === "available" ? "incomplete" : file.status;
      if (record2.status !== nextStatus || record2.size !== file.size) {
        record2.status = nextStatus;
        record2.size = file.size;
        record2.updatedAt = this.now().toISOString();
        changed = true;
      }
    }));
    if (changed) await this.persist();
  }
  async fileSnapshot(path) {
    try {
      const info = await promises.stat(path);
      return info.isFile() ? { status: "available", size: info.size } : { status: "missing", size: 0 };
    } catch {
      return { status: "missing", size: 0 };
    }
  }
  async persist() {
    this.index.revision += 1;
    const snapshot2 = structuredClone(this.index);
    this.writeQueue = this.writeQueue.catch(() => void 0).then(() => this.atomicFile(this.indexPath, `${JSON.stringify(snapshot2, null, 2)}
`));
    await this.writeQueue;
  }
  async atomicFile(path, contents) {
    const temporaryPath = `${path}.${process.pid}.${node_crypto.randomUUID()}.tmp`;
    await promises.mkdir(node_path.dirname(path), { recursive: true });
    try {
      const handle2 = await promises.open(temporaryPath, "wx", 384);
      try {
        await handle2.writeFile(contents, "utf8");
        await handle2.sync();
      } finally {
        await handle2.close();
      }
      await promises.rename(temporaryPath, path);
    } catch (error) {
      await promises.rm(temporaryPath, { force: true });
      throw error;
    }
  }
}
const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
  crcTable[index] = value >>> 0;
}
function crc32(data) {
  let crc = 4294967295;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 4294967295) >>> 0;
}
function dosTimestamp(date) {
  const year = Math.max(1980, Math.min(2107, date.getFullYear()));
  return {
    time: date.getHours() << 11 | date.getMinutes() << 5 | Math.floor(date.getSeconds() / 2),
    date: year - 1980 << 9 | date.getMonth() + 1 << 5 | date.getDate()
  };
}
function createZip(entries, modifiedAt = /* @__PURE__ */ new Date()) {
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 1e3) {
    throw new TypeError("ZIP must contain 1 to 1000 entries.");
  }
  const timestamp = dosTimestamp(modifiedAt);
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    if (!entry.name || entry.name.length > 512 || entry.name.startsWith("/") || entry.name.includes("\\") || entry.name.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) {
      throw new TypeError(`Unsafe ZIP entry name: ${entry.name}.`);
    }
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(67324752, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(2048, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(timestamp.time, 10);
    local.writeUInt16LE(timestamp.date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(33639248, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(2048, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(timestamp.time, 12);
    central.writeUInt16LE(timestamp.date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(101010256, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}
const MAX_DIAGNOSTIC_BYTES = 20 * 1024 * 1024;
function stableDeviceId(serial) {
  return `device-${node_crypto.createHash("sha256").update(serial).digest("hex").slice(0, 10)}`;
}
function replaceLiteral(value, source, target) {
  if (!source || !value.includes(source)) return { value, count: 0 };
  const pieces = value.split(source);
  return { value: pieces.join(target), count: pieces.length - 1 };
}
function addCount(summary, kind, count) {
  if (count > 0) summary.counts.set(kind, (summary.counts.get(kind) || 0) + count);
}
function redactText(input2, summary) {
  let value = input2;
  for (const replacement of summary.replacements) {
    const result = replaceLiteral(value, replacement.source, replacement.target);
    value = result.value;
    addCount(summary, replacement.kind, result.count);
  }
  value = value.replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?\b/g, (address) => {
    let token = summary.addressTokens.get(address);
    if (!token) {
      token = `<device-address-${summary.addressTokens.size + 1}>`;
      summary.addressTokens.set(address, token);
    }
    addCount(summary, "device-address", 1);
    return token;
  });
  value = value.replace(/\b\d{6}\b/g, () => {
    addCount(summary, "pairing-code", 1);
    return "<redacted-code>";
  });
  value = value.replace(/(--record=)([^\s"']+)/g, (_match, prefix) => {
    addCount(summary, "local-path", 1);
    return `${prefix}<local-path>`;
  });
  return value;
}
function redactValue(value, summary) {
  if (typeof value === "string") return redactText(value, summary);
  if (Array.isArray(value)) return value.map((item) => redactValue(item, summary));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item, summary)]));
  }
  return value;
}
function json(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
function configSummary(config) {
  if (!config) return { available: false };
  return {
    available: true,
    locale: config.locale,
    runtime: { mode: config.runtime.scrcpyPath ? "custom" : "bundled" },
    counts: {
      profiles: config.profiles.length,
      knownDeviceAliases: Object.keys(config.deviceAliases).length,
      wirelessTargets: config.wirelessTargets.length,
      automations: config.automations.length,
      deviceGroups: config.groups.length
    },
    settings: {
      minimizeToTray: config.minimizeToTray,
      killAdbOnQuit: config.killAdbOnQuit,
      autoSelectFirstDevice: config.autoSelectFirstDevice,
      bossKeyEnabled: config.bossKeyEnabled,
      muteNotifications: config.muteNotifications
    }
  };
}
const descriptions = {
  "diagnostic-manifest.json": "Bundle schema, generation time, included files, and redaction summary.",
  "environment.json": "Application, Electron, operating-system, scrcpy, ADB, and capability summary.",
  "devices.json": "Current ADB device snapshot with stable hashed identifiers.",
  "sessions.json": "Current application session history, final argv, states, timings, and exit information.",
  "events.json": "Recent structured application events.",
  "config-summary.json": "Non-sensitive setting modes and object counts; no automation text or wireless addresses.",
  "README.txt": "Review and issue-attachment instructions."
};
function entriesFor(context, eventLimit) {
  const serials = /* @__PURE__ */ new Set([
    ...context.devices.map((device) => device.serial),
    ...context.sessions.map((session) => session.serialAtLaunch)
  ]);
  const addresses = context.config?.wirelessTargets.map((target) => target.address) || [];
  const localPaths = context.config ? [
    context.config.runtime.scrcpyPath,
    context.config.launch.recordPath,
    context.config.launch.recordDirectory
  ].filter(Boolean) : [];
  const summary = { counts: /* @__PURE__ */ new Map(), replacements: [], addressTokens: /* @__PURE__ */ new Map() };
  if (context.userDataPath) summary.replacements.push({ source: context.userDataPath, target: "$APP_DATA", kind: "app-data-path" });
  if (context.homePath && context.homePath !== context.userDataPath) summary.replacements.push({ source: context.homePath, target: "$HOME", kind: "home-path" });
  for (const serial of serials) summary.replacements.push({ source: serial, target: stableDeviceId(serial), kind: "device-serial" });
  addresses.forEach((address, index) => summary.replacements.push({ source: address, target: `<device-address-${index + 1}>`, kind: "device-address" }));
  localPaths.forEach((path) => summary.replacements.push({ source: path, target: "<local-path>", kind: "local-path" }));
  summary.replacements.sort((left, right) => right.source.length - left.source.length);
  const environment = redactValue({
    app: { version: context.appVersion, electron: context.electronVersion, node: context.nodeVersion },
    os: { platform: context.platform, release: context.release, arch: context.arch },
    runtime: context.environment
  }, summary);
  const devices = redactValue(context.devices, summary);
  const sessions = redactValue(context.sessions, summary);
  const events = redactValue(context.events.slice(-eventLimit), summary);
  const config = redactValue(configSummary(context.config), summary);
  const dataEntries = [
    { name: "environment.json", data: json(environment) },
    { name: "devices.json", data: json(devices) },
    { name: "sessions.json", data: json(sessions) },
    { name: "events.json", data: json(events) },
    { name: "config-summary.json", data: json(config) },
    {
      name: "README.txt",
      data: "Review every file before attaching this bundle to a public issue.\nThe bundle is stored locally and is never uploaded by UltimateSCRCPYGui.\n"
    }
  ];
  const manifest = {
    schemaVersion: 1,
    generatedAt: context.generatedAt,
    privacy: "default-redacted",
    files: ["diagnostic-manifest.json", ...dataEntries.map((entry) => entry.name)].map((name) => ({ name, description: descriptions[name] })),
    redactions: [...summary.counts.entries()].map(([kind, count]) => ({ kind, count }))
  };
  return { entries: [{ name: "diagnostic-manifest.json", data: json(manifest) }, ...dataEntries], summary };
}
class DiagnosticsService {
  prepare(context) {
    let eventLimit = Math.min(1e3, context.events.length);
    let built = entriesFor(context, eventLimit);
    let archive = createZip(built.entries, new Date(context.generatedAt));
    while (archive.length > MAX_DIAGNOSTIC_BYTES && eventLimit > 50) {
      eventLimit = Math.max(50, Math.floor(eventLimit / 2));
      built = entriesFor(context, eventLimit);
      archive = createZip(built.entries, new Date(context.generatedAt));
    }
    if (archive.length > MAX_DIAGNOSTIC_BYTES) throw new Error("Diagnostic bundle exceeds the 20 MiB safety limit.");
    const preview = {
      files: built.entries.map((entry) => ({
        name: entry.name,
        description: descriptions[entry.name],
        bytes: Buffer.isBuffer(entry.data) ? entry.data.length : Buffer.byteLength(entry.data)
      })),
      redactions: [...built.summary.counts.entries()].map(([kind, count]) => ({ kind, count })),
      estimatedBytes: archive.length,
      maxBytes: MAX_DIAGNOSTIC_BYTES,
      eventCount: eventLimit
    };
    return { preview, archive };
  }
  async write(path, prepared) {
    const temporaryPath = `${path}.${process.pid}.${node_crypto.randomUUID()}.tmp`;
    await promises.mkdir(node_path.dirname(path), { recursive: true });
    try {
      const handle2 = await promises.open(temporaryPath, "wx", 384);
      try {
        await handle2.writeFile(prepared.archive);
        await handle2.sync();
      } finally {
        await handle2.close();
      }
      await promises.rename(temporaryPath, path);
    } catch (error) {
      await promises.rm(temporaryPath, { force: true });
      throw error;
    }
  }
}
const diagnosticsService = new DiagnosticsService();
const MAX_PROFILE_BYTES = 2 * 1024 * 1024;
const CURRENT_SCRCPY_VERSION = "4.1";
const knownDocumentFields = /* @__PURE__ */ new Set(["schemaVersion", "kind", "appVersion", "minScrcpyVersion", "profile"]);
const knownProfileFields = /* @__PURE__ */ new Set(["name", "scene", "options", "expertArgs", "extensions", "machineLocalFields"]);
const knownOptionFields = new Set(Object.keys(normalizedLaunch()).filter((key) => key !== "extraArgs" && key !== "scene"));
function record(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${name} must be an object.`);
  return value;
}
function boundedString(value, name, max) {
  if (typeof value !== "string" || !value.trim() || value.length > max || value.includes("\0")) {
    throw new TypeError(`${name} must be a non-empty string of at most ${max} characters.`);
  }
  return value.trim();
}
function version(value, name) {
  const result = boundedString(value, name, 32);
  if (!/^\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.-]+)?$/.test(result)) throw new TypeError(`${name} is not a supported version.`);
  return result;
}
function compareVersions(left, right) {
  const values = (input2) => input2.split("-")[0].split(".").map(Number);
  const a = values(left);
  const b = values(right);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) - (b[index] || 0);
  }
  return 0;
}
function nameKey(value, locale2) {
  return value.trim().toLocaleLowerCase(locale2);
}
function conflictFor(name, profiles, locale2) {
  const key = nameKey(name, locale2);
  return profiles.find((profile) => nameKey(profile.name, locale2) === key);
}
function duplicateName(name, profiles, locale2) {
  const existing = new Set(profiles.map((profile) => nameKey(profile.name, locale2)));
  if (!existing.has(nameKey(name, locale2))) return name;
  for (let index = 2; index < 1e4; index += 1) {
    const suffix = ` (${index})`;
    const candidate = `${name.slice(0, 80 - suffix.length).trimEnd()}${suffix}`;
    if (!existing.has(nameKey(candidate, locale2))) return candidate;
  }
  throw new Error("Unable to generate a unique profile name.");
}
function expertArgs(value) {
  if (!Array.isArray(value) || value.length > 200 || value.some(
    (item) => typeof item !== "string" || !item.trim() || item.length > 4096 || /[\r\n\0]/.test(item)
  )) throw new TypeError("profile.expertArgs must contain at most 200 single-line arguments.");
  return analyzeExpertArgs(value.join("\n")).args.join("\n");
}
function unknownKeys(source, known, prefix) {
  return Object.keys(source).filter((key) => !known.has(key)).map((key) => `${prefix}${key}`);
}
class ProfileTransferService {
  constructor(now = () => Date.now()) {
    this.now = now;
    this.pending = /* @__PURE__ */ new Map();
  }
  serialize(profile, appVersion) {
    const launch = launchConfig(profile.launch);
    serializeSceneOptions(launch, process.platform);
    serializeLaunchOptions(launch);
    const args = analyzeExpertArgs(launch.extraArgs).args;
    const { extraArgs: _extraArgs, scene: _scene, ...options } = structuredClone(launch);
    const machineLocalFields = [
      ...launch.recordPath ? ["profile.options.recordPath"] : [],
      ...launch.recordDirectory ? ["profile.options.recordDirectory"] : [],
      ...launch.v4l2Sink ? ["profile.options.v4l2Sink"] : []
    ];
    return `${JSON.stringify({
      schemaVersion: 1,
      kind: "scrcpy-gui-profile",
      appVersion,
      minScrcpyVersion: "4.0",
      profile: {
        name: boundedString(profile.name, "profile.name", 80),
        scene: launch.scene,
        options,
        expertArgs: args,
        extensions: structuredClone(profile.extensions || {}),
        machineLocalFields
      }
    }, null, 2)}
`;
  }
  preview(contents, existingProfiles, locale2, currentScrcpyVersion = CURRENT_SCRCPY_VERSION) {
    for (const [token2, pending] of this.pending) {
      if (pending.expiresAt < this.now()) this.pending.delete(token2);
    }
    if (this.pending.size >= 20) this.pending.delete(this.pending.keys().next().value);
    if (Buffer.byteLength(contents) > MAX_PROFILE_BYTES) throw new TypeError("Profile file exceeds the 2 MiB limit.");
    let value;
    try {
      value = JSON.parse(contents);
    } catch {
      throw new TypeError("Profile file is not valid JSON.");
    }
    const document = record(value, "profile document");
    if (document.schemaVersion !== 1 || document.kind !== "scrcpy-gui-profile") {
      throw new TypeError("Unsupported profile document schema or kind.");
    }
    const appVersion = version(document.appVersion, "profile document appVersion");
    const minScrcpyVersion = version(document.minScrcpyVersion, "profile document minScrcpyVersion");
    const rawProfile = record(document.profile, "profile");
    const name = boundedString(rawProfile.name, "profile.name", 80);
    if (typeof rawProfile.scene !== "string" || !SCENE_KINDS.includes(rawProfile.scene)) {
      throw new TypeError("Profile scene is not supported by this version.");
    }
    const scene = rawProfile.scene;
    const rawOptions = record(rawProfile.options, "profile.options");
    const extraArgs = expertArgs(rawProfile.expertArgs);
    const launch = launchConfig({ ...normalizedLaunch(rawOptions), scene, extraArgs });
    serializeSceneOptions(launch, process.platform);
    serializeLaunchOptions(launch);
    const extensions = rawProfile.extensions === void 0 ? void 0 : validateExtensions(rawProfile.extensions, "profile.extensions");
    const unknownFields = [
      ...unknownKeys(document, knownDocumentFields, ""),
      ...unknownKeys(rawProfile, knownProfileFields, "profile."),
      ...unknownKeys(rawOptions, knownOptionFields, "profile.options.")
    ];
    const machineLocalPaths = [
      ...launch.recordPath ? [{ field: "recordPath", value: launch.recordPath }] : [],
      ...launch.recordDirectory ? [{ field: "recordDirectory", value: launch.recordDirectory }] : [],
      ...launch.v4l2Sink ? [{ field: "v4l2Sink", value: launch.v4l2Sink }] : []
    ];
    const warnings = [
      ...unknownFields.length ? [`${unknownFields.length} unknown fields will be reported and ignored.`] : [],
      ...machineLocalPaths.length ? ["Machine-local output paths are disabled by default during import."] : [],
      ...compareVersions(minScrcpyVersion, currentScrcpyVersion) > 0 ? [`This profile requires scrcpy ${minScrcpyVersion}; the selected runtime is ${currentScrcpyVersion}.`] : []
    ];
    const token = node_crypto.randomUUID();
    this.pending.set(token, {
      expiresAt: this.now() + 10 * 6e4,
      profile: { id: "", name, launch, extensions },
      appVersion,
      minScrcpyVersion,
      machineLocalPaths,
      unknownFields,
      warnings,
      locale: locale2
    });
    const conflict = conflictFor(name, existingProfiles, locale2);
    return {
      token,
      name,
      scene,
      appVersion,
      minScrcpyVersion,
      compatible: compareVersions(minScrcpyVersion, currentScrcpyVersion) <= 0,
      warnings: [...warnings],
      unknownFields: [...unknownFields],
      machineLocalPaths: structuredClone(machineLocalPaths),
      conflict: conflict ? { profileId: conflict.id, name: conflict.name } : void 0
    };
  }
  commit(token, strategy, keepMachinePaths, existingProfiles) {
    const pending = this.pending.get(token);
    this.pending.delete(token);
    if (!pending || pending.expiresAt < this.now()) throw new Error("Profile import preview expired; preview the file again.");
    if (strategy !== "keep" && strategy !== "replace" && strategy !== "duplicate") throw new TypeError("Profile import strategy is invalid.");
    if (typeof keepMachinePaths !== "boolean") throw new TypeError("keepMachinePaths must be a boolean.");
    const conflict = conflictFor(pending.profile.name, existingProfiles, pending.locale);
    if (strategy === "keep" && conflict) return { keptExisting: true, replacedProfileId: conflict.id };
    const launch = structuredClone(pending.profile.launch);
    if (!keepMachinePaths) {
      launch.recordPath = "";
      launch.recordDirectory = "";
      launch.v4l2Sink = "";
      launch.recordEnabled = false;
      launch.autoRecordName = false;
    }
    const replacing = strategy === "replace" ? conflict : void 0;
    const profile = {
      ...structuredClone(pending.profile),
      id: replacing?.id || node_crypto.randomUUID(),
      name: replacing ? replacing.name : duplicateName(pending.profile.name, existingProfiles, pending.locale),
      launch
    };
    return { profile, replacedProfileId: replacing?.id };
  }
  async write(path, contents) {
    const temporaryPath = `${path}.${process.pid}.${node_crypto.randomUUID()}.tmp`;
    await promises.mkdir(node_path.dirname(path), { recursive: true });
    try {
      const handle2 = await promises.open(temporaryPath, "wx", 384);
      try {
        await handle2.writeFile(contents, "utf8");
        await handle2.sync();
      } finally {
        await handle2.close();
      }
      await promises.rename(temporaryPath, path);
    } catch (error) {
      await promises.rm(temporaryPath, { force: true });
      throw error;
    }
  }
}
const profileTransferService = new ProfileTransferService();
const CACHE_TTL_MS = 5 * 6e4;
const MAX_CACHE_ENTRIES = 50;
const PROBE_TIMEOUT_MS = 2e4;
const PROBE_MAX_BUFFER = 1024 * 1024;
function numbers(value = "") {
  if (!value.trim()) return [];
  return value.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item));
}
function message(error) {
  return (error instanceof Error ? error.message : String(error)).trim().slice(0, 1e3) || "Probe failed.";
}
function parseEncoderList(output2) {
  const result = [];
  const pattern = /--(video|audio)-codec=([^\s]+)\s+--\1-encoder=([^\s]+)([^\r\n]*)/g;
  for (const match of output2.matchAll(pattern)) {
    const metadata = match[4] || "";
    const implementation = metadata.match(/\((hw|sw|hybrid)\)/)?.[1];
    result.push({
      kind: match[1],
      codec: match[2],
      name: match[3],
      implementation: implementation || "unknown",
      vendor: metadata.includes("[vendor]"),
      aliasFor: metadata.match(/\(alias for ([^)]+)\)/)?.[1]
    });
  }
  return result;
}
function parseDisplayList(output2) {
  return [...output2.matchAll(/--display-id=(\d+)\s+\((?:(\d+)x(\d+)|size unknown)\)/g)].map((match) => ({
    id: Number(match[1]),
    ...match[2] && match[3] ? { width: Number(match[2]), height: Number(match[3]) } : {}
  }));
}
function cameraHeader(line) {
  const match = line.match(/--camera-id=([^\s]+)\s+\((front|back|external|unknown),\s*(\d+)x(\d+)(?:,\s*fps=\{([^}]*)\})?(?:,\s*zoom-range=\[([^,\]]+),\s*([^\]]+)\])?\)/);
  if (!match) return void 0;
  const zoomMin = Number(match[6]);
  const zoomMax = Number(match[7]);
  return {
    id: match[1],
    facing: match[2],
    sensorWidth: Number(match[3]),
    sensorHeight: Number(match[4]),
    fps: numbers(match[5]),
    ...Number.isFinite(zoomMin) && Number.isFinite(zoomMax) ? { zoomRange: { min: zoomMin, max: zoomMax } } : {},
    sizes: []
  };
}
function parseCameraList(output2) {
  const cameras = [];
  let current;
  let highSpeed = false;
  for (const line of output2.split(/\r?\n/)) {
    const header = cameraHeader(line);
    if (header) {
      current = header;
      cameras.push(current);
      highSpeed = false;
      continue;
    }
    if (!current) continue;
    if (line.includes("High speed capture (--camera-high-speed)")) {
      highSpeed = true;
      continue;
    }
    const size2 = line.match(/-\s+(\d+)x(\d+)(?:\s+\(fps=\{([^}]*)\}\))?/);
    if (!size2) continue;
    const entry = {
      width: Number(size2[1]),
      height: Number(size2[2]),
      highSpeed,
      fps: numbers(size2[3])
    };
    if (!current.sizes.some(
      (item) => item.width === entry.width && item.height === entry.height && item.highSpeed === entry.highSpeed
    )) current.sizes.push(entry);
  }
  return cameras;
}
function mergeCameras(base, detailed) {
  const merged = new Map(base.map((camera) => [camera.id, structuredClone(camera)]));
  for (const camera of detailed) {
    const existing = merged.get(camera.id);
    merged.set(camera.id, existing ? { ...existing, ...structuredClone(camera), sizes: structuredClone(camera.sizes) } : structuredClone(camera));
  }
  return [...merged.values()];
}
class DeviceCapabilityService {
  constructor(run = executeCommand, resolve = resolveBinary, now = () => Date.now()) {
    this.run = run;
    this.resolve = resolve;
    this.now = now;
    this.cache = /* @__PURE__ */ new Map();
  }
  async probe(runtime, serial, refresh = false) {
    const executable = await this.resolve(runtime, "scrcpy");
    if (!executable) throw new Error("scrcpy executable not found.");
    const key = `${executable}\0${serial}`;
    const cached = this.cache.get(key);
    if (!refresh && cached && cached.expiresAt > this.now()) {
      return { ...structuredClone(cached.snapshot), cached: true };
    }
    if (cached) this.cache.delete(key);
    const outputs = {};
    const errors = {};
    const commands = [
      ["encoders", "--list-encoders"],
      ["displays", "--list-displays"],
      ["cameras", "--list-cameras"],
      ["cameraSizes", "--list-camera-sizes"]
    ];
    for (const [kind, flag] of commands) {
      try {
        const result = await this.run(
          executable,
          [`--serial=${serial}`, flag],
          PROBE_TIMEOUT_MS,
          PROBE_MAX_BUFFER
        );
        outputs[kind] = `${result.stdout}
${result.stderr}`;
        if (outputs[kind]?.includes("(access denied)")) errors[kind] = "Android denied camera access.";
      } catch (error) {
        errors[kind] = message(error);
      }
    }
    const encoders = parseEncoderList(outputs.encoders || "");
    const snapshot2 = {
      serial,
      capturedAt: new Date(this.now()).toISOString(),
      cached: false,
      videoEncoders: encoders.filter((encoder) => encoder.kind === "video"),
      audioEncoders: encoders.filter((encoder) => encoder.kind === "audio"),
      displays: parseDisplayList(outputs.displays || ""),
      cameras: mergeCameras(parseCameraList(outputs.cameras || ""), parseCameraList(outputs.cameraSizes || "")),
      errors
    };
    if (this.cache.size >= MAX_CACHE_ENTRIES) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { expiresAt: this.now() + CACHE_TTL_MS, snapshot: structuredClone(snapshot2) });
    return snapshot2;
  }
  clear() {
    this.cache.clear();
  }
}
const deviceCapabilityService = new DeviceCapabilityService();
const SIZE_PATTERN = /(?:Physical|Override) size:\s*(\d+)x(\d+)/i;
function parseDeviceGeometry(sizeOutput, orientationOutput) {
  const size2 = sizeOutput.match(SIZE_PATTERN) || sizeOutput.match(/\b(\d+)x(\d+)\b/);
  if (!size2) throw new Error("Android did not report a usable display size.");
  let width = Number(size2[1]);
  let height = Number(size2[2]);
  const rotation = Number(
    orientationOutput.match(/SurfaceOrientation:\s*([0-3])/i)?.[1] || orientationOutput.match(/orientation=([0-3])/i)?.[1] || 0
  );
  if ((rotation === 1 || rotation === 3) && height > width) [width, height] = [height, width];
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error("Android reported an invalid display size.");
  }
  const orientation = width > height ? "landscape" : "portrait";
  return { width, height, orientation, aspectRatio: Math.max(width, height) / Math.min(width, height) };
}
function abortError() {
  const error = new Error("Automation canceled.");
  error.name = "AbortError";
  return error;
}
function ensureActive(signal) {
  if (signal.aborted) throw abortError();
}
function delay(durationMs, signal) {
  ensureActive(signal);
  if (!durationMs) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, durationMs);
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      reject(abortError());
    };
    signal.addEventListener("abort", cancel, { once: true });
  });
}
function inputText(value) {
  return value.replaceAll("%", "%%").replaceAll(" ", "%s");
}
function messageFor(step) {
  if (step.type === "control") return `Control: ${step.action}`;
  if (step.type === "delay") return `Wait ${step.durationMs} ms`;
  if (step.type === "start-app") return `Start ${step.packageId}`;
  if (step.type === "screenshot") return step.label ? `Screenshot: ${step.label}` : "Screenshot";
  if (step.type === "assert-device") return `Assert ${step.condition.type}`;
  return step.type === "text" ? "Input non-sensitive text" : step.type === "tap" ? "Normalized tap" : "Normalized swipe";
}
class AutomationRunner {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.adb = dependencies.adb || adbService;
    this.now = dependencies.now || (() => /* @__PURE__ */ new Date());
  }
  async inspect(runtime, serial) {
    const [size2, orientation] = await Promise.all([
      this.adb.runForDevice(runtime, serial, ["shell", "wm", "size"]),
      this.adb.runForDevice(runtime, serial, ["shell", "dumpsys", "input"])
    ]);
    return parseDeviceGeometry(`${size2.stdout}
${size2.stderr}`, `${orientation.stdout}
${orientation.stderr}`);
  }
  async run(runtime, serial, steps, options) {
    let geometry2;
    let completedSteps = 0;
    const emit = (status, step, stepIndex, message2) => {
      options.onEvent?.({
        runId: options.runId,
        actionType: "automation",
        targetId: serial,
        stepIndex,
        stepType: step.type,
        status,
        timestamp: this.now().toISOString(),
        message: message2
      });
    };
    const getGeometry = async () => {
      geometry2 ||= await this.inspect(runtime, serial);
      return geometry2;
    };
    for (const [stepIndex, step] of steps.entries()) {
      ensureActive(options.signal);
      emit("step-start", step, stepIndex, messageFor(step));
      try {
        if (step.type === "delay") {
          await delay(step.durationMs, options.signal);
        } else if (step.type === "control") {
          const result = await this.dependencies.control(runtime, serial, step.action);
          if (!result.ok) throw new Error(result.error?.detail || result.error?.message || "Device control failed.");
        } else if (step.type === "tap") {
          const display = await getGeometry();
          await this.adb.runForDevice(runtime, serial, [
            "shell",
            "input",
            "tap",
            String(Math.round(step.x * (display.width - 1))),
            String(Math.round(step.y * (display.height - 1)))
          ]);
        } else if (step.type === "swipe") {
          const display = await getGeometry();
          await this.adb.runForDevice(runtime, serial, [
            "shell",
            "input",
            "swipe",
            String(Math.round(step.from.x * (display.width - 1))),
            String(Math.round(step.from.y * (display.height - 1))),
            String(Math.round(step.to.x * (display.width - 1))),
            String(Math.round(step.to.y * (display.height - 1))),
            String(step.durationMs)
          ]);
        } else if (step.type === "text") {
          await this.adb.runForDevice(runtime, serial, ["shell", "input", "text", inputText(step.value)]);
        } else if (step.type === "start-app") {
          await this.dependencies.startApp(runtime, serial, step.packageId);
        } else if (step.type === "screenshot") {
          await this.dependencies.screenshot(runtime, serial, step.label);
        } else {
          const display = await getGeometry();
          if (step.condition.type === "orientation" && display.orientation !== step.condition.value) {
            throw new Error(`Device orientation is ${display.orientation}; expected ${step.condition.value}.`);
          }
          if (step.condition.type === "aspect-ratio" && Math.abs(display.aspectRatio - step.condition.value) > step.condition.tolerance) {
            throw new Error(`Device aspect ratio ${display.aspectRatio.toFixed(3)} is outside the expected tolerance.`);
          }
        }
        ensureActive(options.signal);
        completedSteps += 1;
        emit("step-success", step, stepIndex, `${messageFor(step)} completed.`);
      } catch (error) {
        emit(options.signal.aborted ? "step-skipped" : "step-failure", step, stepIndex, error instanceof Error ? error.message : String(error));
        for (let skippedIndex = stepIndex + 1; skippedIndex < steps.length; skippedIndex += 1) {
          emit("step-skipped", steps[skippedIndex], skippedIndex, "Skipped because the automation stopped before this step.");
        }
        throw error;
      }
    }
    return { completedSteps, message: `Completed ${completedSteps} automation steps on ${serial}.` };
  }
}
const PREFLIGHT_TTL_MS = 10 * 6e4;
const TERMINAL_SESSION_STATES = /* @__PURE__ */ new Set(["stopped", "failed"]);
function featureForScene(scene) {
  return scene === "virtual-display" ? "virtualDisplay" : scene === "record-only" ? "recordOnly" : scene === "control-only" ? "controlOnly" : scene;
}
function actionLabel(action, serial, resource) {
  if (action.type === "launch") return `Launch ${action.launches.find((item) => item.serial === serial)?.launch.scene || "scene"}`;
  if (action.type === "control") return `Control: ${action.action}`;
  if (action.type === "start-app") return `Start ${action.packageId}`;
  if (action.type === "automation") return `Run ${action.automation.name} (${action.automation.steps.length} steps)`;
  if (action.type === "file-push") return `Push ${resource?.kind === "file-push" ? resource.files.length : 0} files to ${action.target}`;
  if (action.type === "apk-install") return `Install ${resource?.kind === "apk-install" ? resource.file.name : "APK"}`;
  return "Capture screenshot";
}
function needsConfirmation(action) {
  return action.type === "automation" ? action.automation.steps.some((step) => step.type === "tap" || step.type === "swipe" || step.type === "text") : action.type === "file-push" ? action.conflict === "replace" : action.type === "apk-install" && action.downgrade;
}
function confirmationKind(action) {
  return action.type === "automation" ? "input" : action.type === "file-push" ? "overwrite" : action.type === "apk-install" ? "downgrade" : void 0;
}
function actionConcurrency(action, requested) {
  const limit = action.type === "file-push" || action.type === "apk-install" ? 2 : action.type === "automation" || action.type === "launch" ? 3 : action.type === "screenshot" ? 4 : 8;
  return Math.min(requested, limit);
}
async function mapLimit(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}
class BatchAutomationService {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.plans = /* @__PURE__ */ new Map();
    this.controllers = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    this.now = dependencies.now || (() => /* @__PURE__ */ new Date());
    this.createId = dependencies.createId || node_crypto.randomUUID;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  async preflight(runtime, request, capabilities, resource) {
    this.prunePlans();
    if (request.action.type === "file-push" && (resource?.kind !== "file-push" || !resource.files.length)) {
      throw new TypeError("Batch file push requires selected local files.");
    }
    if (request.action.type === "apk-install" && resource?.kind !== "apk-install") {
      throw new TypeError("Batch APK install requires a selected package.");
    }
    const devices = new Map(this.dependencies.devices().map((device) => [device.serial, device]));
    const sessions = this.dependencies.sessions().filter((session) => !TERMINAL_SESSION_STATES.has(session.state));
    const recordingPathBySerial = /* @__PURE__ */ new Map();
    const duplicateRecordingPaths = /* @__PURE__ */ new Set();
    if (request.action.type === "launch") {
      const seen = /* @__PURE__ */ new Set();
      for (const launch of request.action.launches) {
        if (!launch.launch.recordEnabled || launch.launch.autoRecordName || !launch.launch.recordPath.trim()) continue;
        const path = node_path.resolve(launch.launch.recordPath.trim());
        const key = process.platform === "win32" ? path.toLocaleLowerCase() : path;
        recordingPathBySerial.set(launch.serial, key);
        if (seen.has(key)) duplicateRecordingPaths.add(key);
        seen.add(key);
      }
    }
    const items = await Promise.all(request.serials.map(async (serial) => {
      const device = devices.get(serial);
      const online = Boolean(device && device.state !== "offline");
      const authorized = device?.state === "device";
      let capability = "pass";
      let sessionConflict = false;
      const reasons = [];
      if (!device) reasons.push("Device is not currently connected.");
      else if (device.state !== "device") reasons.push(`Device state is ${device.state}; authorization is required.`);
      if (request.action.type === "launch") {
        const launch = request.action.launches.find((item) => item.serial === serial);
        if (!launch) {
          capability = "fail";
          reasons.push("No launch configuration is assigned to this device.");
        } else {
          const feature = featureForScene(launch.launch.scene);
          if (capabilities && !capabilities.features[feature]) {
            capability = "fail";
            reasons.push(`The selected runtime does not report ${launch.launch.scene} support.`);
          } else if (!capabilities) {
            capability = "warning";
            reasons.push("Runtime capabilities could not be confirmed.");
          }
          sessionConflict = sessions.some(
            (session) => session.serialAtLaunch === serial && scenesConflict(session.scene, launch.launch.scene)
          );
          if (sessionConflict) reasons.push("An active session conflicts with the selected scene.");
          const recordingPath = recordingPathBySerial.get(serial);
          if (recordingPath && duplicateRecordingPaths.has(recordingPath)) {
            capability = "fail";
            reasons.push("Multiple devices would write to the same recording file.");
          }
        }
      }
      if (authorized && request.action.type === "automation") {
        const automation2 = request.action.automation;
        const needsGeometry = automation2.design.orientation !== "any" || automation2.design.aspectRatio > 0 || automation2.steps.some((step) => step.type === "tap" || step.type === "swipe" || step.type === "assert-device");
        if (needsGeometry) {
          try {
            const geometry2 = await this.dependencies.automationRunner.inspect(runtime, serial);
            if (automation2.design.orientation !== "any" && automation2.design.orientation !== geometry2.orientation) {
              capability = "warning";
              reasons.push(`Current orientation is ${geometry2.orientation}; automation was designed for ${automation2.design.orientation}.`);
            }
            if (automation2.design.aspectRatio > 0 && Math.abs(geometry2.aspectRatio - automation2.design.aspectRatio) > 0.08) {
              capability = "warning";
              reasons.push(`Current aspect ratio ${geometry2.aspectRatio.toFixed(3)} differs from the design ratio ${automation2.design.aspectRatio.toFixed(3)}.`);
            }
          } catch (error) {
            capability = "fail";
            reasons.push(error instanceof Error ? error.message : String(error));
          }
        }
      }
      return {
        serial,
        online,
        authorized,
        capability,
        sessionConflict,
        eligible: online && authorized && capability !== "fail" && !sessionConflict,
        estimatedAction: actionLabel(request.action, serial, resource),
        reasons
      };
    }));
    const token = this.createId();
    const createdAt = this.now();
    const expiresAt = new Date(createdAt.getTime() + PREFLIGHT_TTL_MS);
    const preflight = {
      token,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      actionType: request.action.type,
      confirmationRequired: needsConfirmation(request.action),
      confirmationKind: needsConfirmation(request.action) ? confirmationKind(request.action) : void 0,
      items
    };
    this.plans.set(token, {
      runtime: structuredClone(runtime),
      request: structuredClone(request),
      preflight: structuredClone(preflight),
      resource: resource ? structuredClone(resource) : void 0
    });
    return preflight;
  }
  start(runtime, token, passingOnly, confirmedDangerous) {
    this.prunePlans();
    const plan = this.plans.get(token);
    if (!plan) return operationFailure("BATCH_PREFLIGHT_EXPIRED", "batch-start", "Batch preflight is missing or expired.");
    if (JSON.stringify(plan.runtime) !== JSON.stringify(runtime)) {
      return operationFailure("BATCH_RUNTIME_CHANGED", "batch-start", "Runtime changed after preflight; inspect the batch again.");
    }
    if (plan.preflight.confirmationRequired && !confirmedDangerous) {
      return operationFailure("BATCH_CONFIRMATION_REQUIRED", "batch-start", "Tap, swipe, or text steps require explicit batch confirmation.");
    }
    const eligible = plan.preflight.items.filter((item) => item.eligible);
    if (!passingOnly && eligible.length !== plan.preflight.items.length) {
      return operationFailure("BATCH_PREFLIGHT_FAILED", "batch-start", "One or more devices failed preflight. Choose only passing devices or cancel.");
    }
    if (!eligible.length) return operationFailure("BATCH_NO_ELIGIBLE_TARGETS", "batch-start", "No devices passed preflight.");
    this.plans.delete(token);
    const runId = this.createId();
    const controller = new AbortController();
    this.controllers.set(runId, controller);
    void this.execute(runId, plan, new Set(eligible.map((item) => item.serial)), controller);
    return { ok: true, data: runId };
  }
  cancel(runId) {
    const controller = this.controllers.get(runId);
    if (!controller) return operationFailure("BATCH_RUN_NOT_ACTIVE", "batch-cancel", "No active batch run was found.");
    controller.abort();
    return { ok: true };
  }
  stopAll() {
    for (const controller of this.controllers.values()) controller.abort();
  }
  async execute(runId, plan, eligible, controller) {
    const startedAt = this.now().toISOString();
    this.emit({ runId, actionType: plan.request.action.type, status: "started", timestamp: startedAt, message: `Batch run started for ${eligible.size} devices.` });
    const skipped = plan.preflight.items.filter((item) => !eligible.has(item.serial)).map((item) => ({
      targetId: item.serial,
      ok: false,
      error: {
        code: "BATCH_TARGET_SKIPPED",
        stage: "batch-preflight",
        message: "Target was skipped after preflight.",
        detail: item.reasons.join(" "),
        retryable: true,
        suggestedActions: ["Reconnect or authorize the device, then run preflight again."]
      }
    }));
    const results = await mapLimit(
      [...eligible],
      actionConcurrency(plan.request.action, plan.request.concurrencyLimit),
      async (serial) => this.executeTarget(runId, plan.runtime, plan.request.action, serial, controller.signal, plan.resource)
    );
    const allResults = [...results, ...skipped];
    const succeeded = results.filter((item) => item.ok).length;
    const canceled = controller.signal.aborted;
    const state = canceled ? "canceled" : succeeded === eligible.size && skipped.length === 0 ? "completed" : succeeded > 0 ? "partial" : "failed";
    const report = {
      id: runId,
      actionType: plan.request.action.type,
      state,
      canceled,
      startedAt,
      completedAt: this.now().toISOString(),
      results: allResults
    };
    this.controllers.delete(runId);
    this.emit({
      runId,
      actionType: plan.request.action.type,
      status: canceled ? "canceled" : "completed",
      timestamp: report.completedAt,
      message: canceled ? "Batch run canceled; no new steps will be scheduled." : `Batch run finished with ${succeeded}/${eligible.size} successful targets.`,
      report
    });
  }
  async executeTarget(runId, runtime, action, serial, signal, resource) {
    if (signal.aborted) return this.canceledTarget(serial);
    try {
      let result;
      if (action.type === "launch") {
        const launch = action.launches.find((item) => item.serial === serial);
        if (!launch) throw new Error("Frozen launch plan is missing this device.");
        const launched = await this.dependencies.launch(runtime, [launch]);
        if (!launched.ok) throw new Error(launched.error?.detail || launched.error?.message || "Launch failed.");
        result = { serial, actionType: action.type, message: "scrcpy session queued.", sessionIds: launched.data || [] };
      } else if (action.type === "control") {
        const controlled = await this.dependencies.control(runtime, serial, action.action);
        if (!controlled.ok) throw new Error(controlled.error?.detail || controlled.error?.message || "Control action failed.");
        result = { serial, actionType: action.type, message: controlled.data || `Control action sent to ${serial}.` };
      } else if (action.type === "screenshot") {
        const captured = await this.dependencies.screenshot(runtime, serial);
        result = { serial, actionType: action.type, message: captured.message, artifactId: captured.artifactId };
      } else if (action.type === "start-app") {
        result = { serial, actionType: action.type, message: await this.dependencies.startApp(runtime, serial, action.packageId) };
      } else if (action.type === "automation") {
        const completed = await this.dependencies.automationRunner.run(runtime, serial, action.automation.steps, {
          runId,
          signal,
          onEvent: (event) => this.emit(event)
        });
        result = { serial, actionType: action.type, message: completed.message, completedSteps: completed.completedSteps };
      } else if (action.type === "file-push") {
        if (resource?.kind !== "file-push") throw new Error("Frozen file selection is missing.");
        const batch = await this.dependencies.pushFiles(runtime, [serial], resource.files, action.target, action.conflict);
        const failed = batch.results.find((item) => !item.ok);
        if (failed) throw new Error(failed.error?.detail || failed.error?.message || "File push failed.");
        result = { serial, actionType: action.type, message: `Pushed ${batch.results.length} files to ${serial}.` };
      } else {
        if (resource?.kind !== "apk-install") throw new Error("Frozen APK selection is missing.");
        const batch = await this.dependencies.installApk(runtime, [serial], resource.file, action.replace, action.downgrade);
        const installed = batch.results[0];
        if (!installed?.ok) throw new Error(installed?.error?.detail || installed?.error?.message || "APK install failed.");
        result = { serial, actionType: action.type, message: installed.data?.output || `Installed ${resource.file.name}.` };
      }
      if (signal.aborted) return this.canceledTarget(serial);
      this.emit({ runId, actionType: action.type, targetId: serial, status: "target-success", timestamp: this.now().toISOString(), message: result.message });
      return { targetId: serial, ok: true, data: result };
    } catch (error) {
      if (signal.aborted || error instanceof Error && error.name === "AbortError") return this.canceledTarget(serial);
      const structured = structuredErrorFromUnknown(error, "BATCH_TARGET_FAILED", `batch-${action.type}`, `Unable to complete ${actionLabel(action, serial, resource)} on ${serial}.`, {
        retryable: true,
        suggestedActions: ["Review the target result and device state before retrying."]
      });
      this.emit({ runId, actionType: action.type, targetId: serial, status: "target-failure", timestamp: this.now().toISOString(), message: structured.message });
      return { targetId: serial, ok: false, error: structured };
    }
  }
  canceledTarget(serial) {
    return {
      targetId: serial,
      ok: false,
      error: {
        code: "BATCH_TARGET_CANCELED",
        stage: "batch-cancel",
        message: "Target canceled before completing.",
        retryable: true,
        suggestedActions: ["Run preflight again to retry this target."]
      }
    };
  }
  emit(event) {
    for (const listener of this.listeners) listener(structuredClone(event));
  }
  prunePlans() {
    const now = this.now().getTime();
    for (const [token, plan] of this.plans) {
      if (new Date(plan.preflight.expiresAt).getTime() <= now) this.plans.delete(token);
    }
  }
}
const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const IMPORT_TTL_MS = 10 * 6e4;
class AutomationTransferService {
  constructor(now = () => /* @__PURE__ */ new Date(), createId = node_crypto.randomUUID) {
    this.now = now;
    this.createId = createId;
    this.pending = /* @__PURE__ */ new Map();
  }
  serialize(value, appVersion) {
    const automation2 = automationMacro(value, "automation export");
    const document = { schemaVersion: 1, kind: "scrcpy-gui-automation", appVersion, automation: automation2 };
    return `${JSON.stringify(document, null, 2)}
`;
  }
  preview(contents) {
    this.prune();
    if (Buffer.byteLength(contents) > MAX_IMPORT_BYTES) throw new TypeError("Automation file exceeds the 2 MiB limit.");
    let raw;
    try {
      raw = JSON.parse(contents);
    } catch {
      throw new TypeError("Automation file is not valid JSON.");
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError("Automation document must be an object.");
    const document = raw;
    if (document.schemaVersion !== 1 || document.kind !== "scrcpy-gui-automation") {
      throw new TypeError("Automation document schema or kind is not supported.");
    }
    const automation2 = automationMacro(document.automation, "automation import");
    const dangerousStepCount = automation2.steps.filter(
      (step) => step.type === "tap" || step.type === "swipe" || step.type === "text"
    ).length;
    const warnings = [];
    if (dangerousStepCount) warnings.push(`${dangerousStepCount} tap, swipe, or text steps require explicit confirmation before batch execution.`);
    if (automation2.design.orientation === "any" && automation2.steps.some((step) => step.type === "tap" || step.type === "swipe")) {
      warnings.push("Normalized coordinates have no design orientation; inspect target geometry before running.");
    }
    const token = this.createId();
    this.pending.set(token, { automation: structuredClone(automation2), expiresAt: this.now().getTime() + IMPORT_TTL_MS });
    return { token, automation: structuredClone(automation2), warnings, dangerousStepCount, trusted: false };
  }
  commit(token) {
    this.prune();
    const pending = this.pending.get(token);
    if (!pending) throw new Error("Automation import preview is missing or expired.");
    this.pending.delete(token);
    return structuredClone(pending.automation);
  }
  prune() {
    const now = this.now().getTime();
    for (const [token, pending] of this.pending) {
      if (pending.expiresAt <= now) this.pending.delete(token);
    }
  }
}
const automationTransferService = new AutomationTransferService();
function buildIssueHelperUrl(environment) {
  const url = new URL("https://github.com/SimonAKing/scrcpy-gui/issues/new");
  url.searchParams.set("template", "bug.yml");
  url.searchParams.set("version", environment.appVersion);
  url.searchParams.set("scrcpy-version", environment.scrcpyVersion || "See diagnostic bundle");
  url.searchParams.set("os", `${environment.platform} ${environment.release} / ${environment.arch}`);
  const attachment = environment.bundleName ? `Attach \`${environment.bundleName}\` manually after reviewing its contents.` : "Attach the exported diagnostic bundle manually after reviewing it.";
  url.searchParams.set("diagnostics", `${attachment}

Scrcpy GUI did not upload any file or submit this issue.`);
  return url.toString();
}
async function installOpenedApk(runtime, file, dependencies) {
  const listed = await dependencies.listDevices(runtime);
  if (!listed.ok) throw new Error(listed.error?.message || "Unable to list Android devices.");
  const devices = (listed.data || []).filter((device) => device.state === "device");
  if (!devices.length) {
    await dependencies.showMessageBox({
      type: "warning",
      message: `Cannot install ${file.name}`,
      detail: "Connect and authorize an Android device, then open the APK again.",
      buttons: ["OK"]
    });
    return;
  }
  let target = devices[0];
  if (devices.length > 1) {
    const choice = await dependencies.showMessageBox({
      type: "question",
      message: `Install ${file.name} on which device?`,
      buttons: ["Cancel", ...devices.map((device) => `${device.model} · ${device.serial}`)],
      defaultId: 0,
      cancelId: 0,
      noLink: true
    });
    const selected = devices[choice.response - 1];
    if (!selected) return;
    target = selected;
  }
  const confirmation = await dependencies.showMessageBox({
    type: "warning",
    message: `Install ${file.name}?`,
    detail: `File: ${file.path}
Device: ${target.model} · ${target.serial}
Only install APKs from sources you trust.`,
    buttons: ["Cancel", "Install"],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
    checkboxLabel: "Allow replacing an existing app (Android signature checks still apply)",
    checkboxChecked: false
  });
  if (confirmation.response !== 1) return;
  const batch = await dependencies.installApk(runtime, [target.serial], file, confirmation.checkboxChecked === true, false);
  return { batch, target };
}
function deviceShortcut(input2) {
  if (input2.type !== "keyDown" || input2.isAutoRepeat || input2.isComposing || !input2.meta || input2.control) return;
  const key = input2.key.toLowerCase();
  if (input2.shift && !input2.alt && (key === "s" || key === "c")) {
    return { channel: "app:screenshot-shortcut", action: key === "s" ? "save" : "copy" };
  }
  if (input2.alt && key === "r" && !input2.shift) return { channel: "app:control-shortcut", action: "auto-rotate" };
  if (input2.alt && key === "t") {
    return { channel: "app:control-shortcut", action: input2.shift ? "show-touches-off" : "show-touches-on" };
  }
}
let mainWindow = null;
let tray = null;
let minimizeToTray = false;
let isQuitting = false;
let registeredBossKey = "";
let killAdbOnQuit = false;
let quitRuntime = { scrcpyPath: "" };
let shutdownPromise = null;
let shutdownFinished = false;
let configRepository;
let artifactService;
let diagnosticDraft;
let lastDiagnosticScrcpyVersion = "";
const eventStore = new EventStore();
const rendererEntryUrl = node_url.pathToFileURL(node_path.join(__dirname, "../renderer/index.html")).toString();
const SHUTDOWN_TIMEOUT_MS = 5e3;
const pendingOpenApks = [];
let openingApk = false;
electron.app.on("open-file", (event, path) => {
  event.preventDefault();
  if (isQuitting || pendingOpenApks.length >= 50 || pendingOpenApks.includes(path)) return;
  pendingOpenApks.push(path);
  if (electron.app.isReady() && configRepository && !mainWindow) createWindow();
  void processQueuedOpenApks();
});
function rendererUrlIsTrusted(url) {
  return isTrustedRendererUrl(url, rendererEntryUrl, process.env.ELECTRON_RENDERER_URL);
}
function assertTrustedIpcSender(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame !== mainWindow.webContents.mainFrame || !rendererUrlIsTrusted(event.senderFrame.url)) {
    throw new Error("Rejected IPC request from an untrusted renderer.");
  }
}
function domainForChannel(channel) {
  if (channel.includes("automation") || channel.startsWith("batch:")) return "automation";
  if (channel.includes("screenshot") || channel.startsWith("dialog:record") || channel.startsWith("artifact:") || channel.startsWith("diagnostics:")) return "artifact";
  if (channel.startsWith("device:")) return "device";
  if (channel.startsWith("session:") || channel.startsWith("scrcpy:")) return "session";
  if (channel.startsWith("config:") || channel.startsWith("profile:")) return "config";
  if (channel.startsWith("capability:")) return "runtime";
  return "runtime";
}
function isOperationResult(value) {
  return Boolean(value && typeof value === "object" && "ok" in value && typeof value.ok === "boolean");
}
const handle = (channel, listener) => {
  electron.ipcMain.handle(channel, async (event, ...args) => {
    assertTrustedIpcSender(event);
    const requestId = node_crypto.randomUUID();
    const audit = !channel.startsWith("events:");
    try {
      const result = await listener(event, ...args);
      const operation = isOperationResult(result) ? result : void 0;
      const failed = operation?.ok === false;
      if (audit) eventStore.publish({
        level: failed ? "warn" : "debug",
        domain: domainForChannel(channel),
        action: channel,
        requestId,
        stage: operation?.error?.stage || "ipc",
        message: operation?.error?.message || `${channel} completed.`,
        data: operation?.error ? { error: operation.error } : void 0
      });
      return operation ? { ...operation, requestId } : result;
    } catch (error) {
      if (audit) eventStore.publish({
        level: "error",
        domain: domainForChannel(channel),
        action: channel,
        requestId,
        stage: "ipc",
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  });
};
function configureSessionSecurity() {
  electron.session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  if (!electron.app.isPackaged) return;
  electron.session.defaultSession.webRequest.onHeadersReceived({ urls: ["file://*/*"] }, (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [PRODUCTION_CSP]
      }
    });
  });
}
function sendStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("scrcpy:status", status);
}
function sendSessionEvent(event) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("session:event", event);
  const status = event.type === "output" ? "log" : event.session.state === "launching" ? "starting" : event.session.state === "running" ? "running" : event.session.state === "stopped" ? "stopped" : event.session.state === "failed" ? "error" : "log";
  sendStatus({
    serial: event.session.serialAtLaunch,
    status,
    message: event.message,
    timestamp: event.timestamp
  });
  eventStore.publish({
    level: event.type === "output" ? "debug" : event.session.state === "failed" ? "error" : "info",
    domain: "session",
    action: event.type === "output" ? "output" : event.session.state,
    deviceId: event.session.serialAtLaunch,
    sessionId: event.session.id,
    stage: event.session.state,
    message: event.message,
    data: { scene: event.session.scene, pid: event.session.pid, exitCode: event.session.exitCode }
  });
  if (event.type === "state" && (event.session.state === "stopped" || event.session.state === "failed")) {
    void artifactService?.registerRecording(event.session).then((artifact) => {
      if (artifact) eventStore.publish({
        level: artifact.status === "incomplete" ? "warn" : artifact.status === "missing" ? "error" : "info",
        domain: "artifact",
        action: "recording-indexed",
        deviceId: artifact.deviceId,
        sessionId: artifact.sessionId,
        stage: artifact.status,
        message: `Recording artifact indexed as ${artifact.status}.`,
        data: { artifactId: artifact.id, size: artifact.size }
      });
    }).catch((error) => eventStore.publish({
      level: "error",
      domain: "artifact",
      action: "recording-index-failed",
      deviceId: event.session.serialAtLaunch,
      sessionId: event.session.id,
      stage: "artifact-index",
      message: error instanceof Error ? error.message : String(error)
    }));
  }
}
subscribeScrcpySessionEvents(sendSessionEvent);
subscribeDeviceTrackerEvents((event) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("device:event", event);
  eventStore.publish({
    level: event.status === "error" ? "error" : event.status === "restarting" ? "warn" : event.status === "tracking" ? "debug" : "info",
    domain: "device",
    action: `tracker-${event.status}`,
    stage: event.source,
    message: event.message,
    data: { revision: event.revision, added: event.added.length, changed: event.changed.length, removed: event.removed.length, retryInMs: event.retryInMs }
  });
});
eventStore.subscribe((event) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("app:event", event);
});
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 880,
    minHeight: 640,
    title: "UltimateSCRCPYGui",
    show: false,
    backgroundColor: "#0b1020",
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!rendererUrlIsTrusted(url)) event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("before-input-event", (event, input2) => {
    if (process.platform !== "darwin" || !mainWindow?.isFocused() || !rendererUrlIsTrusted(mainWindow.webContents.getURL())) return;
    const shortcut = deviceShortcut(input2);
    if (!shortcut) return;
    event.preventDefault();
    if (shortcut.channel === "app:screenshot-shortcut") mainWindow.webContents.send("app:screenshot-shortcut", shortcut.action);
    else mainWindow.webContents.send("app:control-shortcut", shortcut.action);
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("close", (event) => {
    if (minimizeToTray && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(node_path.join(__dirname, "../renderer/index.html"));
  }
}
function trayIconPath(name) {
  return electron.app.isPackaged
    ? node_path.join(process.resourcesPath, "icons", name)
    : node_path.join(electron.app.getAppPath(), "resources", "icons", name);
}
function updateTray() {
  if (!tray) return;
  const devices = deviceTracker.devices || [];
  const running = sessionManager.list().filter((session) => !TERMINAL_SESSION_STATES.has(session.state));
  const connected = devices.filter((device) => device.state === "device").length;
  const iconName = running.length > 0 ? "tray-green.png" : connected > 0 ? "tray-orange.png" : "tray-red.png";
  const image = electron.nativeImage.createFromPath(trayIconPath(iconName));
  if (!image.isEmpty()) {
    tray.setImage(process.platform === "darwin" ? image.resize({ width: 16, height: 16 }) : image.resize({ width: 22, height: 22 }));
  }
  const template = [
    { label: "UltimateSCRCPYGui", enabled: false },
    { type: "separator" }
  ];
  if (devices.length === 0) {
    template.push({ label: "No devices connected", enabled: false });
  } else {
    for (const device of devices) {
      const session = running.find((item) => item.serial === device.serial);
      const label = `${device.model || device.serial} · ${device.serial}`;
      template.push({
        label,
        submenu: [
          {
            label: session ? "Stop scrcpy" : "Start scrcpy",
            click: () => {
              if (session) {
                sessionManager.stopBySerial(device.serial);
              } else {
                mainWindow?.show();
                mainWindow?.webContents.send("app:tray-start-device", device.serial);
              }
            }
          },
          {
            label: `Copy serial (${device.serial})`,
            click: () => electron.clipboard.writeText(device.serial)
          }
        ]
      });
    }
  }
  template.push({ type: "separator" });
  template.push({ label: "Show UltimateSCRCPYGui", click: () => mainWindow?.show() });
  template.push({ label: "Quit", click: () => electron.app.quit() });
  tray.setContextMenu(electron.Menu.buildFromTemplate(template));
  tray.setToolTip(`UltimateSCRCPYGui · ${connected} device(s) · ${running.length} running`);
}
function createTray() {
  const iconPath = trayIconPath("tray-orange.png");
  const icon = electron.nativeImage.createFromPath(iconPath);
  tray = new electron.Tray(process.platform === "darwin" ? icon.resize({ width: 16, height: 16 }) : icon.resize({ width: 22, height: 22 }));
  tray.setToolTip("UltimateSCRCPYGui");
  tray.on("click", () => mainWindow?.show());
  deviceTracker.subscribe(() => updateTray());
  sessionManager.subscribe(() => updateTray());
  updateTray();
}
function setBossKey(enabled, accelerator) {
  if (registeredBossKey) {
    electron.globalShortcut.unregister(registeredBossKey);
    registeredBossKey = "";
  }
  if (!enabled) return { ok: true, data: "Boss key disabled." };
  const shortcut = accelerator.trim();
  if (!shortcut) return operationFailure("BOSS_KEY_REQUIRED", "validation", "Enter a boss key shortcut.");
  try {
    const registered = electron.globalShortcut.register(shortcut, () => {
      stopAllScrcpy("boss-key");
      mainWindow?.hide();
    });
    if (!registered) return operationFailure("BOSS_KEY_UNAVAILABLE", "boss-key", `The shortcut ${shortcut} is already in use.`);
    registeredBossKey = shortcut;
    return { ok: true, data: shortcut };
  } catch (error) {
    return failureFromUnknown(error, "BOSS_KEY_REGISTRATION_FAILED", "boss-key", "Unable to register the boss key.");
  }
}
function sendBatchProgress(progress) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("batch:progress", progress);
  eventStore.publish({
    level: progress.status === "failed" ? "error" : progress.status === "running" ? "debug" : "info",
    domain: "artifact",
    action: progress.kind,
    deviceId: progress.deviceId,
    stage: progress.status,
    message: progress.message,
    data: { batchId: progress.batchId, targetId: progress.targetId, size: progress.size }
  });
}
async function captureIndexedScreenshot(runtime, serial, label) {
  const safeSerial = serial.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "device";
  const safeLabel = label?.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").slice(0, 19);
  const directory = node_path.join(electron.app.getPath("pictures"), "UltimateSCRCPYGui");
  await promises.mkdir(directory, { recursive: true });
  const path = node_path.join(directory, `scrcpy-${safeSerial}-${safeLabel ? `${safeLabel}-` : ""}${timestamp}-${node_crypto.randomUUID().slice(0, 8)}.png`);
  const capture = await captureDeviceScreenshot(runtime, serial, path);
  if (!capture.ok) throw new Error(capture.error?.detail || capture.error?.message || "Screenshot failed.");
  const artifact = artifactService ? await artifactService.register({ kind: "screenshot", path, deviceId: serial }) : void 0;
  if (artifact) eventStore.publish({
    level: "info",
    domain: "artifact",
    action: "screenshot-indexed",
    deviceId: serial,
    stage: artifact.status,
    message: "Screenshot added to the artifact library.",
    data: { artifactId: artifact.id, size: artifact.size }
  });
  return { message: `Screenshot saved to ${path}.`, artifactId: artifact?.id };
}
const automationRunner = new AutomationRunner({
  control: controlDevice,
  startApp: (runtime, serial, packageId) => deviceWorkspaceService.startApp(runtime, serial, packageId),
  screenshot: captureIndexedScreenshot
});
const batchAutomationService = new BatchAutomationService({
  devices: listTrackedDevices,
  sessions: listScrcpySessions,
  launch: startScrcpy,
  control: controlDevice,
  screenshot: captureIndexedScreenshot,
  startApp: (runtime, serial, packageId) => deviceWorkspaceService.startApp(runtime, serial, packageId),
  pushFiles: (runtime, serials, files, target, conflict) => deviceWorkspaceService.pushFiles(runtime, serials, files, target, conflict, sendBatchProgress),
  installApk: (runtime, serials, file, replace, downgrade) => deviceWorkspaceService.installApk(runtime, serials, file, replace, downgrade, sendBatchProgress),
  automationRunner
});
batchAutomationService.subscribe((event) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("batch:run-event", event);
  eventStore.publish({
    level: event.status === "target-failure" || event.status === "step-failure" ? "error" : event.status === "canceled" || event.report?.state === "partial" ? "warn" : event.status === "step-start" || event.status === "step-success" ? "debug" : "info",
    domain: "automation",
    action: `batch-${event.status}`,
    deviceId: event.targetId,
    stage: event.stepType || event.report?.state || event.status,
    message: event.message,
    data: {
      runId: event.runId,
      actionType: event.actionType,
      stepIndex: event.stepIndex,
      ...event.report ? {
        state: event.report.state,
        total: event.report.results.length,
        succeeded: event.report.results.filter((item) => item.ok).length
      } : {}
    }
  });
  if (event.report) {
    void artifactService?.registerBatchRunReport(event.report).then((artifact) => eventStore.publish({
      level: "info",
      domain: "artifact",
      action: "batch-report-indexed",
      stage: artifact.status,
      message: "Batch run report added to the artifact library.",
      data: { artifactId: artifact.id, runId: event.runId, actionType: event.actionType }
    })).catch((error) => eventStore.publish({
      level: "error",
      domain: "artifact",
      action: "batch-report-index-failed",
      stage: "artifact-index",
      message: error instanceof Error ? error.message : String(error),
      data: { runId: event.runId }
    }));
  }
});
async function selectedFiles(paths, extensions) {
  if (paths.length < 1 || paths.length > 50) throw new TypeError("Select 1 to 50 files.");
  return Promise.all(paths.map(async (path) => {
    const info = await promises.stat(path);
    const name = node_path.basename(path);
    if (!info.isFile()) throw new TypeError(`${name} is not a regular file.`);
    if (extensions && !extensions.has(node_path.extname(name).toLowerCase())) throw new TypeError(`${name} is not a supported package file.`);
    return { path, name, size: info.size };
  }));
}
async function processQueuedOpenApks() {
  if (!electron.app.isReady() || !mainWindow || !configRepository?.snapshot() || openingApk || isQuitting) return;
  openingApk = true;
  try {
    while (pendingOpenApks.length && mainWindow && !isQuitting) {
      const path = pendingOpenApks.shift();
      mainWindow.show();
      mainWindow.focus();
      try {
        const [file] = await selectedFiles([path], /* @__PURE__ */ new Set([".apk"]));
        const runtime = runtimeConfig(configRepository.snapshot().runtime);
        const installed = await installOpenedApk(runtime, file, {
          listDevices,
          showMessageBox: (options) => {
            if (!mainWindow || mainWindow.isDestroyed() || isQuitting) throw new Error("APK opening canceled.");
            return electron.dialog.showMessageBox(mainWindow, options);
          },
          installApk: (...args) => {
            if (!mainWindow || mainWindow.isDestroyed() || isQuitting) throw new Error("APK installation canceled.");
            return deviceWorkspaceService.installApk(...args, sendBatchProgress);
          }
        });
        if (!installed) continue;
        const { batch, target } = installed;
        await artifactService?.registerTransferReport("apk-install", batch).catch((error) => eventStore.publish({
          level: "error",
          domain: "artifact",
          action: "transfer-report-index-failed",
          stage: "artifact-index",
          message: error instanceof Error ? error.message : String(error),
          data: { batchId: batch.id, operation: "apk-install" }
        }));
        const result = batch.results[0];
        if (!mainWindow || mainWindow.isDestroyed() || isQuitting) continue;
        await electron.dialog.showMessageBox(mainWindow, {
          type: result?.ok ? "info" : "error",
          message: result?.ok ? `${file.name} installed` : `Could not install ${file.name}`,
          detail: result?.ok ? `Device: ${target.model} · ${target.serial}` : result?.error?.detail || result?.error?.message || "Installation failed.",
          buttons: ["OK"]
        });
      } catch (error) {
        if (!mainWindow || mainWindow.isDestroyed() || isQuitting) continue;
        await electron.dialog.showMessageBox(mainWindow, {
          type: "error",
          message: "Could not open APK",
          detail: error instanceof Error ? error.message : String(error),
          buttons: ["OK"]
        });
      }
    }
  } catch (error) {
    eventStore.publish({
      level: "error",
      domain: "device",
      action: "apk-open-failed",
      stage: "apk-open",
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    openingApk = false;
  }
}
async function prepareDiagnostics(runtime, allowDraft) {
  const validatedRuntime = runtimeConfig(runtime);
  const runtimeKey = JSON.stringify(validatedRuntime);
  if (allowDraft && diagnosticDraft?.runtimeKey === runtimeKey && Date.now() - diagnosticDraft.createdAt < 10 * 6e4) {
    return diagnosticDraft.prepared;
  }
  const context = {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    appVersion: electron.app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    platform: node_os.platform(),
    release: node_os.release(),
    arch: node_os.arch(),
    homePath: node_os.homedir(),
    userDataPath: electron.app.getPath("userData"),
    environment: await getEnvironment(validatedRuntime),
    devices: listTrackedDevices(),
    sessions: listScrcpySessions(),
    events: eventStore.list({ limit: 1e3 }),
    config: configRepository?.snapshot()
  };
  const prepared = diagnosticsService.prepare(context);
  lastDiagnosticScrcpyVersion = context.environment.scrcpy.version || "Unavailable";
  diagnosticDraft = { runtimeKey, createdAt: Date.now(), prepared };
  return prepared;
}
function availableDeviceSerial(value) {
  return availableDeviceSerials([value])[0];
}
function optionalUsbSerial(value) {
  const serial = boundedString$1(value, "OTG USB serial", 512, true).trim();
  if (serial && !/^[A-Za-z0-9._:-]+$/.test(serial)) throw new TypeError("OTG USB serial contains unsupported characters.");
  return serial;
}
function availableDeviceSerials(value) {
  const serials = deviceSerials(value);
  const available = new Set(listTrackedDevices().filter((device) => device.state === "device").map((device) => device.serial));
  const missing = serials.filter((serial) => !available.has(serial));
  if (missing.length) throw new TypeError(`Device is no longer available: ${missing.join(", ")}.`);
  return serials;
}
handle("app:version", () => electron.app.getVersion());
handle("events:list", (_event, query) => eventStore.list(validateEventQuery(query)));
handle("events:clear", () => eventStore.clear());
handle("diagnostics:preview", async (_event, runtime) => {
  try {
    return { ok: true, data: (await prepareDiagnostics(runtime, false)).preview };
  } catch (error) {
    return failureFromUnknown(error, "DIAGNOSTIC_PREVIEW_FAILED", "diagnostic-preview", "Unable to prepare the diagnostic preview.");
  }
});
handle("diagnostics:export", async (_event, runtime) => {
  if (!artifactService) return operationFailure("ARTIFACT_SERVICE_UNAVAILABLE", "diagnostic-export", "Artifact service is not ready.");
  try {
    const prepared = await prepareDiagnostics(runtime, true);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").slice(0, 19);
    const destination = await electron.dialog.showSaveDialog({
      title: "Export redacted diagnostic bundle",
      defaultPath: node_path.join(electron.app.getPath("downloads"), `ultimate-scrcpy-diagnostics-${timestamp}.zip`),
      filters: [{ name: "ZIP archive", extensions: ["zip"] }]
    });
    if (destination.canceled || !destination.filePath) {
      return operationFailure("DIAGNOSTIC_EXPORT_CANCELED", "diagnostic-export", "Diagnostic export canceled.");
    }
    await diagnosticsService.write(destination.filePath, prepared);
    const artifact = await artifactService.register({
      kind: "diagnostic",
      path: destination.filePath,
      metadata: { appVersion: electron.app.getVersion(), eventCount: prepared.preview.eventCount, redacted: true }
    });
    diagnosticDraft = void 0;
    eventStore.publish({
      level: "info",
      domain: "artifact",
      action: "diagnostic-exported",
      stage: "complete",
      message: "Redacted diagnostic bundle exported.",
      data: { artifactId: artifact.id, size: artifact.size }
    });
    return { ok: true, data: artifact };
  } catch (error) {
    return failureFromUnknown(error, "DIAGNOSTIC_EXPORT_FAILED", "diagnostic-export", "Unable to export the diagnostic bundle.", {
      retryable: true,
      suggestedActions: ["Choose another writable destination and try again."]
    });
  }
});
handle("diagnostics:issue-helper", async (_event, artifactId) => {
  try {
    let bundleName;
    if (artifactId !== void 0) {
      if (!artifactService) throw new Error("Artifact service is not ready.");
      const artifact = await artifactService.getExisting(boundedString$1(artifactId, "diagnostic artifact id", 128));
      if (artifact.kind !== "diagnostic") throw new TypeError("Selected artifact is not a diagnostic bundle.");
      bundleName = artifact.name;
    }
    await electron.shell.openExternal(buildIssueHelperUrl({
      appVersion: electron.app.getVersion(),
      scrcpyVersion: lastDiagnosticScrcpyVersion,
      platform: node_os.platform(),
      release: node_os.release(),
      arch: node_os.arch(),
      bundleName
    }));
    return { ok: true };
  } catch (error) {
    return failureFromUnknown(error, "ISSUE_HELPER_FAILED", "issue-helper", "Unable to open the GitHub issue helper.");
  }
});
handle("artifact:list", async (_event, query) => {
  if (!artifactService) return operationFailure("ARTIFACT_SERVICE_UNAVAILABLE", "artifact-list", "Artifact service is not ready.");
  try {
    return { ok: true, data: await artifactService.list(query) };
  } catch (error) {
    return failureFromUnknown(error, "ARTIFACT_LIST_FAILED", "artifact-list", "Unable to load the artifact library.", { retryable: true });
  }
});
handle("artifact:open", async (_event, id) => {
  if (!artifactService) return operationFailure("ARTIFACT_SERVICE_UNAVAILABLE", "artifact-open", "Artifact service is not ready.");
  try {
    const artifact = await artifactService.getExisting(boundedString$1(id, "artifact id", 128));
    const error = await electron.shell.openPath(artifact.path);
    return error ? operationFailure("ARTIFACT_OPEN_FAILED", "artifact-open", "Unable to open the artifact.", { detail: error }) : { ok: true };
  } catch (error) {
    return failureFromUnknown(error, "ARTIFACT_OPEN_FAILED", "artifact-open", "Unable to open the artifact.");
  }
});
handle("artifact:reveal", async (_event, id) => {
  if (!artifactService) return operationFailure("ARTIFACT_SERVICE_UNAVAILABLE", "artifact-reveal", "Artifact service is not ready.");
  try {
    const artifact = await artifactService.getExisting(boundedString$1(id, "artifact id", 128));
    electron.shell.showItemInFolder(artifact.path);
    return { ok: true };
  } catch (error) {
    return failureFromUnknown(error, "ARTIFACT_REVEAL_FAILED", "artifact-reveal", "Unable to reveal the artifact.");
  }
});
handle("artifact:copy-path", async (_event, id) => {
  if (!artifactService) return operationFailure("ARTIFACT_SERVICE_UNAVAILABLE", "artifact-copy-path", "Artifact service is not ready.");
  try {
    const artifact = await artifactService.getExisting(boundedString$1(id, "artifact id", 128));
    electron.clipboard.writeText(artifact.path);
    return { ok: true };
  } catch (error) {
    return failureFromUnknown(error, "ARTIFACT_COPY_FAILED", "artifact-copy-path", "Unable to copy the artifact path.");
  }
});
handle("artifact:delete", async (_event, id, deleteFile) => {
  if (!artifactService) return operationFailure("ARTIFACT_SERVICE_UNAVAILABLE", "artifact-delete", "Artifact service is not ready.");
  try {
    const validatedId = boundedString$1(id, "artifact id", 128);
    const shouldDeleteFile = strictBoolean(deleteFile, "delete artifact file");
    if (shouldDeleteFile) {
      const artifact = await artifactService.getExisting(validatedId);
      const confirmation = await electron.dialog.showMessageBox(mainWindow, {
        type: "warning",
        title: "Delete artifact file permanently?",
        message: `Delete ${artifact.name}?`,
        detail: `${artifact.path}

This action cannot be undone.`,
        buttons: ["Cancel", "Delete permanently"],
        defaultId: 0,
        cancelId: 0,
        noLink: true
      });
      if (confirmation.response !== 1) {
        return operationFailure("ARTIFACT_DELETE_CANCELED", "artifact-delete", "Artifact deletion canceled.");
      }
    }
    await artifactService.delete(
      validatedId,
      shouldDeleteFile
    );
    return { ok: true };
  } catch (error) {
    return failureFromUnknown(error, "ARTIFACT_DELETE_FAILED", "artifact-delete", "Unable to delete the artifact.", {
      retryable: true,
      suggestedActions: ["Close applications using the file and retry, or remove only the library entry."]
    });
  }
});
handle("app:minimize-to-tray", (_event, enabled) => {
  minimizeToTray = strictBoolean(enabled, "minimizeToTray");
});
handle("app:quit-behavior", (_event, runtime, shouldKillAdb) => {
  quitRuntime = runtimeConfig(runtime);
  killAdbOnQuit = strictBoolean(shouldKillAdb, "killAdbOnQuit");
});
handle(
  "app:boss-key",
  (_event, enabled, accelerator) => setBossKey(strictBoolean(enabled, "bossKeyEnabled"), boundedString$1(accelerator, "bossKeyAccelerator", 128, true))
);
handle("dialog:scrcpy", async () => {
  const result = await electron.dialog.showOpenDialog({
    title: "Choose the scrcpy executable",
    properties: ["openFile"],
    filters: process.platform === "win32" ? [{ name: "scrcpy", extensions: ["exe"] }] : []
  });
  return result.canceled ? "" : result.filePaths[0] || "";
});
handle("dialog:record", async () => {
  const result = await electron.dialog.showSaveDialog({
    title: "Choose recording destination",
    defaultPath: `scrcpy-${(/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").slice(0, 19)}.mp4`,
    filters: [
      { name: "MP4 video", extensions: ["mp4"] },
      { name: "Matroska video", extensions: ["mkv"] },
      { name: "Audio recording", extensions: ["m4a", "mka", "opus", "aac", "flac", "wav"] }
    ]
  });
  return result.canceled ? "" : result.filePath || "";
});
handle("dialog:record-directory", async () => {
  const result = await electron.dialog.showOpenDialog({
    title: "Choose recording folder",
    defaultPath: electron.app.getPath("videos"),
    properties: ["openDirectory", "createDirectory"]
  });
  return result.canceled ? "" : result.filePaths[0] || "";
});
handle("config:load", async (_event, legacyJson, requestedLocale) => {
  const legacy = boundedString$1(legacyJson, "legacy config", 2 * 1024 * 1024, true);
  if (!["en", "zh-CN", "zh-TW", "ru"].includes(requestedLocale)) throw new TypeError("locale is not supported.");
  if (!configRepository) throw new Error("Configuration repository is not ready.");
  const loaded = await configRepository.load(legacy, requestedLocale);
  quitRuntime = runtimeConfig(loaded.config.runtime);
  killAdbOnQuit = loaded.config.killAdbOnQuit;
  void processQueuedOpenApks();
  return loaded;
});
handle("config:export", async (_event, format, configView, launches) => {
  try {
    const format2 = ["json", "sh", "bat", "command"].includes(format) ? format : "json";
    const extension = format2 === "json" ? "json" : format2;
    let contents = "";
    if (format2 === "json") {
      contents = `${JSON.stringify(configView, null, 2)}\n`;
    } else {
      const commands = commandPreviewRequests(launches).map((request) => {
        const prepared = prepareLaunchConfig(request.launch, request.serial);
        const details = buildScrcpyArgDetails(prepared, request.serial, request.source, request.profileName, request.deviceWindowTitleOverride);
        return `scrcpy ${details.map((detail) => detail.arg).join(" ")}`.trim();
      });
      const banner = format2 === "bat" ? "@echo off\r\nrem UltimateSCRCPYGui exported launch\r\n" : "#!/usr/bin/env bash\n# UltimateSCRCPYGui exported launch\n";
      const eol = format2 === "bat" ? "\r\n" : "\n";
      contents = `${banner}${commands.join(eol)}${eol}`;
    }
    const destination = await electron.dialog.showSaveDialog({
      title: "Export configuration",
      defaultPath: node_path.join(electron.app.getPath("downloads"), `ultimate-scrcpygui-config.${extension}`),
      filters: [{ name: format2 === "json" ? "JSON document" : "Launch script", extensions: [extension] }]
    });
    if (destination.canceled || !destination.filePath) {
      return operationFailure("CONFIG_EXPORT_CANCELED", "config-export", "Configuration export canceled.");
    }
    await promises.writeFile(destination.filePath, contents, { encoding: "utf8", mode: 384 });
    return { ok: true, data: { path: destination.filePath, format: format2 } };
  } catch (error) {
    return failureFromUnknown(error, "CONFIG_EXPORT_FAILED", "config-export", "Unable to export the configuration.");
  }
});
handle("config:save", (_event, revision, config) => {
  if (!configRepository) throw new Error("Configuration repository is not ready.");
  return configRepository.save(nonNegativeInteger(revision, "config revision"), config);
});
handle("profile:export", async (_event, value) => {
  try {
    const profile = validateLaunchProfile(value, "profile export");
    const safeName = profile.name.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "profile";
    const destination = await electron.dialog.showSaveDialog({
      title: "Export launch profile",
      defaultPath: node_path.join(electron.app.getPath("documents"), `${safeName}.scrcpy-profile.json`),
      filters: [{ name: "UltimateSCRCPYGui profile", extensions: ["json"] }]
    });
    if (destination.canceled || !destination.filePath) {
      return operationFailure("PROFILE_EXPORT_CANCELED", "profile-export", "Profile export canceled.");
    }
    await profileTransferService.write(destination.filePath, profileTransferService.serialize(profile, electron.app.getVersion()));
    return { ok: true, data: destination.filePath };
  } catch (error) {
    return failureFromUnknown(error, "PROFILE_EXPORT_FAILED", "profile-export", "Unable to export the profile.");
  }
});
handle("profile:import-preview", async (_event, runtime) => {
  try {
    const selection = await electron.dialog.showOpenDialog({
      title: "Import launch profile",
      properties: ["openFile"],
      filters: [{ name: "UltimateSCRCPYGui profile", extensions: ["json"] }]
    });
    if (selection.canceled || !selection.filePaths[0]) {
      return operationFailure("PROFILE_IMPORT_CANCELED", "profile-import-preview", "Profile import canceled.");
    }
    const contents = await readBoundedRegularUtf8File(
      selection.filePaths[0],
      2 * 1024 * 1024,
      "Profile file must be a regular file no larger than 2 MiB."
    );
    const snapshot2 = configRepository?.snapshot();
    if (!snapshot2) throw new Error("Configuration repository is not ready.");
    const environment = await getEnvironment(runtimeConfig(runtime));
    const selectedVersion = environment.scrcpy.version.match(/\b(\d+\.\d+(?:\.\d+)?)/)?.[1] || "0.0";
    return {
      ok: true,
      data: profileTransferService.preview(
        contents,
        snapshot2.profiles,
        snapshot2.locale,
        selectedVersion
      )
    };
  } catch (error) {
    return failureFromUnknown(error, "PROFILE_IMPORT_PREVIEW_FAILED", "profile-import-preview", "Unable to preview the profile import.");
  }
});
handle("profile:import-commit", (_event, token, strategy, keepMachinePaths) => {
  try {
    const snapshot2 = configRepository?.snapshot();
    if (!snapshot2) throw new Error("Configuration repository is not ready.");
    return {
      ok: true,
      data: profileTransferService.commit(
        boundedString$1(token, "profile import token", 128),
        strategy,
        strictBoolean(keepMachinePaths, "keep machine-local paths"),
        snapshot2.profiles
      )
    };
  } catch (error) {
    return failureFromUnknown(error, "PROFILE_IMPORT_COMMIT_FAILED", "profile-import-commit", "Unable to import the profile.");
  }
});
handle("automation:export", async (_event, value) => {
  try {
    const automation2 = automationMacro(value, "automation export");
    const safeName = automation2.name.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "automation";
    const destination = await electron.dialog.showSaveDialog({
      title: "Export automation",
      defaultPath: node_path.join(electron.app.getPath("documents"), `${safeName}.scrcpy-automation.json`),
      filters: [{ name: "UltimateSCRCPYGui automation", extensions: ["json"] }]
    });
    if (destination.canceled || !destination.filePath) {
      return operationFailure("AUTOMATION_EXPORT_CANCELED", "automation-export", "Automation export canceled.");
    }
    await promises.writeFile(destination.filePath, automationTransferService.serialize(automation2, electron.app.getVersion()), { encoding: "utf8", mode: 384 });
    return { ok: true, data: destination.filePath };
  } catch (error) {
    return failureFromUnknown(error, "AUTOMATION_EXPORT_FAILED", "automation-export", "Unable to export the automation.");
  }
});
handle("automation:import-preview", async () => {
  try {
    const selection = await electron.dialog.showOpenDialog({
      title: "Import automation",
      properties: ["openFile"],
      filters: [{ name: "UltimateSCRCPYGui automation", extensions: ["json"] }]
    });
    if (selection.canceled || !selection.filePaths[0]) {
      return operationFailure("AUTOMATION_IMPORT_CANCELED", "automation-import-preview", "Automation import canceled.");
    }
    const contents = await readBoundedRegularUtf8File(
      selection.filePaths[0],
      2 * 1024 * 1024,
      "Automation file must be a regular file no larger than 2 MiB."
    );
    return { ok: true, data: automationTransferService.preview(contents) };
  } catch (error) {
    return failureFromUnknown(error, "AUTOMATION_IMPORT_PREVIEW_FAILED", "automation-import-preview", "Unable to preview the automation import.");
  }
});
handle("automation:import-commit", (_event, token) => {
  try {
    return { ok: true, data: automationTransferService.commit(boundedString$1(token, "automation import token", 128)) };
  } catch (error) {
    return failureFromUnknown(error, "AUTOMATION_IMPORT_COMMIT_FAILED", "automation-import-commit", "Unable to import the automation.");
  }
});
handle("batch:preflight", async (_event, runtime, rawRequest) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    const request = batchPreflightRequest(rawRequest);
    const environment = await getEnvironment(validatedRuntime);
    let resource;
    if (request.action.type === "file-push") {
      request.action.target = validateRemoteDirectory(request.action.target);
      const selection = await electron.dialog.showOpenDialog({ title: "Choose files for batch preflight", properties: ["openFile", "multiSelections"] });
      if (selection.canceled || !selection.filePaths.length) {
        return operationFailure("FILE_SELECTION_CANCELED", "batch-preflight", "Batch file selection canceled.");
      }
      resource = { kind: "file-push", files: await selectedFiles(selection.filePaths) };
    } else if (request.action.type === "apk-install") {
      const selection = await electron.dialog.showOpenDialog({
        title: "Choose an APK for batch preflight",
        properties: ["openFile"],
        filters: [{ name: "Android package", extensions: ["apk"] }]
      });
      if (selection.canceled || !selection.filePaths[0]) {
        return operationFailure("APK_SELECTION_CANCELED", "batch-preflight", "Batch APK selection canceled.");
      }
      const [file] = await selectedFiles([selection.filePaths[0]], /* @__PURE__ */ new Set([".apk"]));
      resource = { kind: "apk-install", file };
    }
    return {
      ok: true,
      data: await batchAutomationService.preflight(validatedRuntime, request, environment.scrcpy.capabilities, resource)
    };
  } catch (error) {
    return failureFromUnknown(error, "BATCH_PREFLIGHT_FAILED", "batch-preflight", "Unable to inspect the batch plan.", {
      retryable: true,
      suggestedActions: ["Refresh device state and inspect the batch again."]
    });
  }
});
handle("batch:start", async (_event, runtime, token, passingOnly, confirmedDangerous) => {
  const validatedRuntime = runtimeConfig(runtime);
  const validatedToken = boundedString$1(token, "batch preflight token", 128);
  const onlyPassing = strictBoolean(passingOnly, "only passing targets");
  const confirmed = strictBoolean(confirmedDangerous, "dangerous batch confirmation");
  if (confirmed) {
    const choice = await electron.dialog.showMessageBox(mainWindow, {
      type: "warning",
      title: "Run confirmed batch on multiple devices?",
      message: "This batch contains an explicitly confirmed input, overwrite, or downgrade action.",
      detail: "Review every target in the preflight table. The action may change application state or replace data on all passing devices.",
      buttons: ["Cancel", "Run confirmed batch"],
      defaultId: 0,
      cancelId: 0,
      noLink: true
    });
    if (choice.response !== 1) return operationFailure("BATCH_CONFIRMATION_CANCELED", "batch-start", "Batch execution canceled.");
  }
  return batchAutomationService.start(validatedRuntime, validatedToken, onlyPassing, confirmed);
});
handle(
  "batch:cancel",
  (_event, runId) => batchAutomationService.cancel(boundedString$1(runId, "batch run id", 128))
);
handle("system:environment", (_event, runtime) => getEnvironment(runtimeConfig(runtime)));
handle("update:check", async (_event, runtime) => {
  try {
    return { ok: true, data: await checkForUpdates(runtimeConfig(runtime)) };
  } catch (error) {
    return failureFromUnknown(error, "UPDATE_CHECK_FAILED", "update-check", "Unable to check for updates.");
  }
});
handle("update:apply", async (_event, runtime, items) => {
  try {
    return { ok: true, data: await applyUpdates(runtimeConfig(runtime), items) };
  } catch (error) {
    return failureFromUnknown(error, "UPDATE_APPLY_FAILED", "update-apply", "Unable to apply updates.");
  }
});
handle("capability:device-probe", async (_event, runtime, serial, refresh = false) => {
  try {
    return {
      ok: true,
      data: await deviceCapabilityService.probe(
        runtimeConfig(runtime),
        deviceSerial(serial),
        strictBoolean(refresh, "refresh capabilities")
      )
    };
  } catch (error) {
    return failureFromUnknown(error, "CAPABILITY_PROBE_FAILED", "capability-probe", "Unable to inspect device capabilities.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is online.", "Recheck the selected scrcpy runtime."]
    });
  }
});
handle("device:list", (_event, runtime) => listDevices(runtimeConfig(runtime)));
handle("device:track", (_event, runtime) => startDeviceTracker(runtimeConfig(runtime)));
handle("device:visibility", (_event, visible) => setDeviceTrackerVisibility(strictBoolean(visible, "window visibility")));
handle(
  "device:connect",
  (_event, runtime, target) => connectDevice(runtimeConfig(runtime), boundedString$1(target, "wireless target", 512))
);
handle(
  "device:pair",
  (_event, runtime, target, code) => pairDevice(
    runtimeConfig(runtime),
    boundedString$1(target, "pairing target", 512),
    boundedString$1(code, "pairing code", 6)
  )
);
handle(
  "device:disconnect",
  (_event, runtime, target) => disconnectDevice(runtimeConfig(runtime), boundedString$1(target, "wireless target", 512))
);
handle(
  "device:legacy-wireless",
  (_event, runtime, serial) => enableLegacyWireless(runtimeConfig(runtime), deviceSerial(serial))
);
handle("device:sdk", (_event, runtime, serial) => deviceSdk(runtimeConfig(runtime), deviceSerial(serial)));
handle("device:qr-pair-start", (_event, runtime, serial) => {
  const validatedSerial = deviceSerial(serial);
  const name = `ultimate-${node_crypto.randomBytes(4).toString("hex")}`;
  const password = node_crypto.randomBytes(9).toString("hex");
  const payload = `WIFI:T:ADB;S:${name};P:${password};;`;
  return Promise.resolve({ ok: true, data: { serial: validatedSerial, name, password, payload } });
});
function mdnsServiceAddress(services, name) {
  const line = services.split(/\r?\n/).map((entry) => entry.trim()).find((entry) => entry.includes(name));
  if (!line) return "";
  const parts = line.split(/\s+/).filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 1] : "";
}
const qrPairCancellations = /* @__PURE__ */ new Set();
const sshTunnels = /* @__PURE__ */ new Map();
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
      let pid = "";
      try {
        const result = await adbCommand(validatedRuntime, ["-s", validatedSerial, "shell", "pidof", "shizuku"]);
        pid = (result.stdout || "").trim();
      } catch {
        pid = "";
      }
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
handle("device:qr-pair-cancel", (_event, name) => {
  if (typeof name === "string" && name) qrPairCancellations.add(name);
  return Promise.resolve({ ok: true, data: { cancelled: true } });
});
handle("device:qr-pair-wait", async (_event, runtime, serial, name, password, timeoutMs = 90000) => {
  const validatedRuntime = runtimeConfig(runtime);
  const validatedSerial = deviceSerial(serial);
  const deadline = Date.now() + Math.min(Math.max(Number(timeoutMs) || 90000, 5000), 180000);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  while (Date.now() < deadline) {
    if (qrPairCancellations.has(name)) {
      qrPairCancellations.delete(name);
      return { ok: true, data: { serial: validatedSerial, cancelled: true } };
    }
    let services = "";
    try {
      const result = await adbCommand(validatedRuntime, ["mdns", "services"]);
      services = `${result.stdout}\n${result.stderr}`;
    } catch {
    }
    const address = mdnsServiceAddress(services, name);
    if (address) {
      const pairResult = await adbCommand(validatedRuntime, ["pair", address, password]);
      const output = `${pairResult.stdout}\n${pairResult.stderr}`.trim();
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
          const text = `${listed.stdout}\n${listed.stderr}`;
          const connectLine = text.split(/\r?\n/).map((entry) => entry.trim()).find((entry) => /_adb-tls-connect\.tcp|_adb\.tcp/.test(entry));
          if (connectLine) {
            const parts = connectLine.split(/\s+/).filter(Boolean);
            connectAddress = parts.length >= 3 ? parts[parts.length - 1] : "";
            if (connectAddress) break;
          }
        } catch {
        }
        await sleep(1500);
      }
      if (connectAddress) {
        const connectResult = await adbCommand(validatedRuntime, ["connect", connectAddress]);
        const connectOutput = `${connectResult.stdout}\n${connectResult.stderr}`.trim();
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
});
handle(
  "scrcpy:start",
  (_event, runtime, launches) => startScrcpy(runtimeConfig(runtime), deviceLaunches(launches))
);
handle("scrcpy:preview", (_event, launches) => {
  try {
    return {
      ok: true,
      data: commandPreviewRequests(launches).map((request) => {
        const prepared = prepareLaunchConfig(request.launch, request.serial);
        return {
          serial: request.serial,
          ...buildScrcpyArgDetails(prepared, request.serial, request.source, request.profileName, request.deviceWindowTitleOverride)
        };
      })
    };
  } catch (error) {
    return failureFromUnknown(error, "COMMAND_PREVIEW_FAILED", "command-preview", "Unable to build the command preview.");
  }
});
handle(
  "scrcpy:start-otg",
  (_event, runtime, launch, usbSerial) => startOtg(
    runtimeConfig(runtime),
    launchConfig(launch),
    optionalUsbSerial(usbSerial)
  )
);
handle("scrcpy:preview-otg", (_event, launch, usbSerial) => {
  try {
    const validated = launchConfig(launch);
    if (validated.scene !== "otg") throw new TypeError("OTG preview requires the OTG scene.");
    const serial = optionalUsbSerial(usbSerial);
    return {
      ok: true,
      data: {
        serial: serial || "otg:auto-usb",
        ...buildScrcpyArgDetails(validated, serial)
      }
    };
  } catch (error) {
    return failureFromUnknown(error, "OTG_PREVIEW_FAILED", "otg-preview", "Unable to preview OTG mode.");
  }
});
handle("session:list", () => listScrcpySessions());
handle("session:stop", (_event, id) => stopScrcpySession(boundedString$1(id, "session id", 128)));
handle("scrcpy:stop", (_event, serial) => stopScrcpy(deviceSerial(serial)));
handle(
  "device:control",
  (_event, runtime, serial, action) => controlDevice(runtimeConfig(runtime), deviceSerial(serial), controlAction(action))
);
handle("device:screenshot", async (_event, runtime, serial) => {
  const validatedRuntime = runtimeConfig(runtime);
  const validatedSerial = deviceSerial(serial);
  const safeSerial = validatedSerial.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "device";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").slice(0, 19);
  const fallbackDirectory = node_path.join(electron.app.getPath("pictures"), "UltimateSCRCPYGui");
  let screenshotDirectory = fallbackDirectory;
  try {
    const [lastScreenshot] = await artifactService?.list({ limit: 1, kinds: ["screenshot"] }) || [];
    if (lastScreenshot) {
      const previousDirectory = node_path.dirname(lastScreenshot.path);
      if ((await promises.stat(previousDirectory)).isDirectory()) screenshotDirectory = previousDirectory;
    }
  } catch {
  }
  if (screenshotDirectory === fallbackDirectory) await promises.mkdir(fallbackDirectory, { recursive: true });
  const result = await electron.dialog.showSaveDialog({
    title: "Save device screenshot",
    defaultPath: node_path.join(screenshotDirectory, `scrcpy-${safeSerial}-${timestamp}.png`),
    filters: [{ name: "PNG image", extensions: ["png"] }]
  });
  if (result.canceled || !result.filePath) {
    return operationFailure("SCREENSHOT_CANCELED", "screenshot-destination", "Screenshot canceled.");
  }
  const capture = await captureDeviceScreenshot(validatedRuntime, validatedSerial, result.filePath);
  if (capture.ok && artifactService) {
    try {
      const artifact = await artifactService.register({ kind: "screenshot", path: result.filePath, deviceId: validatedSerial });
      eventStore.publish({
        level: "info",
        domain: "artifact",
        action: "screenshot-indexed",
        deviceId: validatedSerial,
        stage: artifact.status,
        message: "Screenshot added to the artifact library.",
        data: { artifactId: artifact.id, size: artifact.size }
      });
    } catch (error) {
      eventStore.publish({
        level: "error",
        domain: "artifact",
        action: "screenshot-index-failed",
        deviceId: validatedSerial,
        stage: "artifact-index",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
  return capture;
});
handle("device:screenshot-copy", async (_event, runtime, serial) => {
  const capture = await captureDeviceScreenshotBuffer(runtimeConfig(runtime), deviceSerial(serial));
  if (!capture.ok) return { ok: false, error: capture.error };
  if (!capture.data) return operationFailure("SCREENSHOT_CLIPBOARD_FAILED", "screenshot-clipboard", "Unable to copy the screenshot.");
  try {
    const image = electron.nativeImage.createFromBuffer(capture.data);
    if (image.isEmpty()) throw new Error("Electron could not decode the captured PNG image.");
    electron.clipboard.writeImage(image);
    return { ok: true, data: "Screenshot copied to the system clipboard." };
  } catch (error) {
    return failureFromUnknown(error, "SCREENSHOT_CLIPBOARD_FAILED", "screenshot-clipboard", "Unable to copy the screenshot.", {
      retryable: true,
      suggestedActions: ["Try saving the screenshot to a file instead."]
    });
  }
});
handle("device:overview", async (_event, runtime, serial) => {
  try {
    return { ok: true, data: await deviceWorkspaceService.overview(runtimeConfig(runtime), availableDeviceSerial(serial)) };
  } catch (error) {
    return failureFromUnknown(error, "DEVICE_OVERVIEW_FAILED", "device-overview", "Unable to read device details.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is connected and authorized."]
    });
  }
});
handle("device:push-paths", async (_event, runtime, serials, target, conflict, paths) => {
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
handle("device:push-files", async (_event, runtime, serials, target, conflict) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    const validatedSerials = availableDeviceSerials(serials);
    const validatedTarget = validateRemoteDirectory(boundedString$1(target, "remote target", 1024));
    if (conflict !== "replace" && conflict !== "skip") throw new TypeError("file conflict policy is not supported.");
    const selection = await electron.dialog.showOpenDialog({ title: "Choose files to push", properties: ["openFile", "multiSelections"] });
    if (selection.canceled || selection.filePaths.length === 0) {
      return operationFailure("FILE_SELECTION_CANCELED", "file-selection", "File selection canceled.");
    }
    const batch = await deviceWorkspaceService.pushFiles(
      validatedRuntime,
      validatedSerials,
      await selectedFiles(selection.filePaths),
      validatedTarget,
      conflict,
      sendBatchProgress
    );
    await artifactService?.registerTransferReport("file-push", batch).catch((error) => eventStore.publish({
      level: "error",
      domain: "artifact",
      action: "transfer-report-index-failed",
      stage: "artifact-index",
      message: error instanceof Error ? error.message : String(error),
      data: { batchId: batch.id, operation: "file-push" }
    }));
    return { ok: true, data: batch };
  } catch (error) {
    return failureFromUnknown(error, "FILE_PUSH_PREPARE_FAILED", "file-push", "Unable to prepare the file transfer.");
  }
});
handle("device:install-apk", async (_event, runtime, serials, replace, downgrade) => {
  try {
    const validatedRuntime = runtimeConfig(runtime);
    const validatedSerials = availableDeviceSerials(serials);
    const allowReplace = strictBoolean(replace, "replace existing app");
    const allowDowngrade = strictBoolean(downgrade, "allow downgrade");
    const selection = await electron.dialog.showOpenDialog({
      title: "Choose an APK to install",
      properties: ["openFile"],
      filters: [{ name: "Android package", extensions: ["apk"] }]
    });
    if (selection.canceled || !selection.filePaths[0]) {
      return operationFailure("APK_SELECTION_CANCELED", "apk-selection", "APK selection canceled.");
    }
    const [file] = await selectedFiles([selection.filePaths[0]], /* @__PURE__ */ new Set([".apk"]));
    const batch = await deviceWorkspaceService.installApk(
      validatedRuntime,
      validatedSerials,
      file,
      allowReplace,
      allowDowngrade,
      sendBatchProgress
    );
    await artifactService?.registerTransferReport("apk-install", batch).catch((error) => eventStore.publish({
      level: "error",
      domain: "artifact",
      action: "transfer-report-index-failed",
      stage: "artifact-index",
      message: error instanceof Error ? error.message : String(error),
      data: { batchId: batch.id, operation: "apk-install" }
    }));
    return { ok: true, data: batch };
  } catch (error) {
    return failureFromUnknown(error, "APK_INSTALL_PREPARE_FAILED", "apk-install", "Unable to prepare the APK installation.");
  }
});
handle("device:apps", async (_event, runtime, serial, refresh) => {
  try {
    return {
      ok: true,
      data: await deviceWorkspaceService.listApps(
        runtimeConfig(runtime),
        availableDeviceSerial(serial),
        strictBoolean(refresh, "refresh app list")
      )
    };
  } catch (error) {
    return failureFromUnknown(error, "APP_LIST_FAILED", "app-list", "Unable to list installed applications.", {
      retryable: true,
      suggestedActions: ["Confirm that the device is connected and authorized."]
    });
  }
});
handle("device:start-app", async (_event, runtime, serial, packageId) => {
  try {
    return {
      ok: true,
      data: await deviceWorkspaceService.startApp(
        runtimeConfig(runtime),
        availableDeviceSerial(serial),
        validatePackageId(boundedString$1(packageId, "package id", 255))
      )
    };
  } catch (error) {
    return failureFromUnknown(error, "APP_START_FAILED", "app-start", "Unable to start the application.", {
      retryable: true,
      suggestedActions: ["Confirm that the package has a launcher activity."]
    });
  }
});
handle("shell:open", async (_event, rawUrl) => {
  const url = new URL(boundedString$1(rawUrl, "external URL", 2048));
  const allowedHosts = /* @__PURE__ */ new Set(["github.com", "scrcpyapp.org"]);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) throw new Error("External URL is not allowed.");
  await electron.shell.openExternal(url.toString());
});
electron.app.whenReady().then(() => {
  configRepository = new ConfigRepository(electron.app.getPath("userData"));
  artifactService = new ArtifactService(electron.app.getPath("userData"));
  configureSessionSecurity();
  createWindow();
  createTray();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow?.show();
  });
});
function withShutdownTimeout(task) {
  return new Promise((settle) => {
    const timer = setTimeout(settle, SHUTDOWN_TIMEOUT_MS);
    void task.finally(() => {
      clearTimeout(timer);
      settle();
    });
  });
}
function beginShutdown() {
  if (shutdownPromise) return shutdownPromise;
  isQuitting = true;
  electron.globalShortcut.unregisterAll();
  batchAutomationService.stopAll();
  stopAllScrcpy();
  stopDeviceTracker();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
  const shouldStopAdb = killAdbOnQuit || adbServerStartedByApp();
  shutdownPromise = shouldStopAdb ? withShutdownTimeout(stopAdbServer(quitRuntime)) : Promise.resolve();
  return shutdownPromise;
}
electron.app.on("before-quit", (event) => {
  if (shutdownFinished) return;
  event.preventDefault();
  void beginShutdown().then(() => {
    shutdownFinished = true;
    electron.app.quit();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
