import path from "node:path";
import { app, type BrowserWindow, Menu, nativeImage, Tray } from "electron";
import { getBasePath } from "../utils/path";

let tray: Tray | null = null;

export function createTray(getWindow: () => BrowserWindow | null) {
  const basePath = getBasePath();
  const iconPath =
    process.platform === "darwin"
      ? path.join(basePath, "../resources/icon-16.png")
      : path.join(basePath, "../resources/icon-32.png");
  let icon = nativeImage.createFromPath(iconPath);

  // macOS: mark as template for proper dark/light menu bar rendering
  if (process.platform === "darwin") {
    icon = icon.resize({ width: 22, height: 22 });
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip("Zenda — AI Receptionist");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Zenda",
      click: () => {
        const win = getWindow();
        win?.show();
        win?.focus();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click shows window
  tray.on("double-click", () => {
    const win = getWindow();
    win?.show();
    win?.focus();
  });
}

export function updateTrayStatus(connected: boolean) {
  if (!tray) {
    return;
  }
  tray.setToolTip(
    connected ? "Zenda — WhatsApp Connected" : "Zenda — WhatsApp Disconnected"
  );
}
