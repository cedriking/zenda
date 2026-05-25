import path from "node:path";
import { app, BrowserWindow } from "electron";
import { ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { UpdateSourceType, updateElectronApp } from "update-electron-app";
import { ipcContext } from "@/ipc/context";
import { IPC_CHANNELS, inDevelopment } from "./constants";
import { setAutoStart } from "./main/auto-start";
import { startHealthMonitor } from "./main/health-monitor";
import { createTray } from "./main/tray";
import { getBasePath } from "./utils/path";

function createWindow() {
  const basePath = getBasePath();
  const preload = path.join(basePath, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,

      preload,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
  });
  ipcContext.setMainWindow(mainWindow);

  // Minimize to tray instead of closing
  mainWindow.on("close", (event) => {
    if (!(app as unknown as { isQuitting?: boolean }).isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  app.on("before-quit", async () => {
    (app as unknown as { isQuitting: boolean }).isQuitting = true;
    try {
      const { shutdownWhatsApp } = await import("./main/whatsapp/client.js");
      const { disconnectBridge } = await import("./main/whatsapp/bridge.js");
      const { stopHealthMonitor } = await import("./main/health-monitor.js");
      shutdownWhatsApp();
      disconnectBridge();
      stopHealthMonitor();
    } catch {
      // best-effort cleanup
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(basePath, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

async function installExtensions() {
  // Only install dev extensions in development mode
  if (!inDevelopment) {
    return;
  }
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

function checkForUpdates() {
  const baseUrl =
    import.meta.env.VITE_UPDATE_BASE_URL ?? "https://zenda.bot/updates";
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
      baseUrl: `${baseUrl}/${process.platform}/${process.arch}`,
    },
  });
}

async function setupORPC() {
  const { rpcHandler } = await import("./ipc/handler");

  ipcMain.on(IPC_CHANNELS.START_ORPC_SERVER, (event) => {
    const [serverPort] = event.ports;

    serverPort.start();
    rpcHandler.upgrade(serverPort);
  });
}

app.whenReady().then(async () => {
  try {
    createWindow();
    await installExtensions();
    checkForUpdates();
    await setupORPC();

    // Register WhatsApp IPC handlers
    const { registerWhatsAppIPC } = await import("./ipc/modules/whatsapp");
    if (ipcContext.mainWindow) {
      registerWhatsAppIPC(ipcContext.mainWindow);

      // Auto-init WhatsApp if session exists (user already connected before)
      const { hasSession } = await import("./main/whatsapp/session.js");
      if (hasSession()) {
        console.log(
          "[main] Existing WhatsApp session found, auto-initializing..."
        );
        const { initWhatsAppClient } = await import(
          "./main/whatsapp/client.js"
        );
        initWhatsAppClient(ipcContext.mainWindow).catch((err) => {
          console.error("[main] Auto-init WhatsApp error:", err);
        });
      }

      // Auto-connect bridge using saved credentials (independent of renderer)
      const { autoConnectBridge } = await import("./main/whatsapp/bridge.js");
      autoConnectBridge(ipcContext.mainWindow);

      // System tray
      createTray(ipcContext.mainWindow);

      // Auto-start on boot
      setAutoStart(true);

      // Health monitor
      const apiBase = import.meta.env.VITE_API_URL ?? "https://api.zenda.bot";
      startHealthMonitor(ipcContext.mainWindow, apiBase);
    }
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
});

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
