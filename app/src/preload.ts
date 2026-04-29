import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./constants";

// Expose IPC to renderer via window.electron
contextBridge.exposeInMainWorld("electron", {
  invoke: (channel: string, ...args: unknown[]) => {
    const allowed = [
      "whatsapp:init",
      "whatsapp:disconnect",
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
    ];
    if (allowed.includes(channel)) {
      const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    }
    return () => {};
  },
  send: (channel: string, ...args: unknown[]) => {
    const allowed = [
      "whatsapp:forward-message",
      "whatsapp:forward-status",
    ];
    if (allowed.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
});

// ORPC server setup
window.addEventListener("message", (event) => {
  if (event.data === IPC_CHANNELS.START_ORPC_SERVER) {
    const [serverPort] = event.ports;

    ipcRenderer.postMessage(IPC_CHANNELS.START_ORPC_SERVER, null, [serverPort]);
  }
});
