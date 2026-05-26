import path from "node:path";
import { app, type BrowserWindow, Menu, nativeImage, Tray } from "electron";
import { getBasePath } from "../utils/path";

let tray: Tray | null = null;

export function createTray(getWindow: () => BrowserWindow | null) {
  const iconPath = path.join(
    getBasePath(),
    "../renderer/main_window/assets/icon.png"
  );
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 16, height: 16 });

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
