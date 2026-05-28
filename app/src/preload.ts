import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./constants";

console.log("[preload] Loaded, exposing window.electron");

// Expose IPC to renderer via window.electron
contextBridge.exposeInMainWorld("electron", {
  invoke: (channel: string, ...args: unknown[]) => {
    const allowed = [
      "whatsapp:init",
      "whatsapp:disconnect",
      "whatsapp:disconnect-and-clear",
      "bridge:connect",
    ];
    if (allowed.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`IPC channel not allowed: ${channel}`));
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const allowed = [
      "whatsapp:status",
      "bridge:status",
      "whatsapp:send-response",
      "notification:new",
      "conversation:update",
      "appointment:update",
      "deep-link:integrations-callback",
    ];
    if (allowed.includes(channel)) {
      const listener = (
        _event: Electron.IpcRendererEvent,
        ...args: unknown[]
      ) => callback(...args);
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    }
    return () => {
      // no-op: channel not allowed
    };
  },
  send: (channel: string, ...args: unknown[]) => {
    const allowed = ["whatsapp:forward-message", "whatsapp:forward-status"];
    if (allowed.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
});

// ORPC server setup
const allowedOrigin =
  typeof location === "undefined" ? "file://" : location.origin;
window.addEventListener("message", (event) => {
  if (event.origin !== allowedOrigin && event.origin !== "file://") {
    return;
  }
  if (event.data === IPC_CHANNELS.START_ORPC_SERVER) {
    const [serverPort] = event.ports;

    ipcRenderer.postMessage(IPC_CHANNELS.START_ORPC_SERVER, null, [serverPort]);
  }
});
