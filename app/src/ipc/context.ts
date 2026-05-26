import { os } from "@orpc/server";
import type { BrowserWindow } from "electron";

class IPCContext {
  mainWindow: BrowserWindow | undefined;

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  get mainWindowContext() {
    return os.middleware(({ next }) =>
      next({
        context: {
          window: this.mainWindow as BrowserWindow,
        },
      })
    );
  }
}

export const ipcContext = new IPCContext();
