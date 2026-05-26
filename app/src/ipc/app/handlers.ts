import { os } from "@orpc/server";
import { app } from "electron";

export const currentPlatform = os.handler(() => process.platform);

export const appVersion = os.handler(() => app.getVersion());
