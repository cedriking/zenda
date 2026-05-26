import { os } from "@orpc/server";
import { nativeTheme } from "electron";
import { setThemeModeInputSchema } from "./schemas";

export const getCurrentThemeMode = os.handler(() => nativeTheme.themeSource);

export const toggleThemeMode = os.handler(() => {
  const themeSource = nativeTheme.shouldUseDarkColors ? "light" : "dark";
  nativeTheme.themeSource = themeSource;

  return themeSource === "dark";
});

export const setThemeMode = os
  .input(setThemeModeInputSchema)
  .handler(({ input: mode }) => {
    switch (mode) {
      case "light":
        nativeTheme.themeSource = "light";
        break;
      case "dark":
        nativeTheme.themeSource = "dark";
        break;
      case "system":
        nativeTheme.themeSource = "system";
        break;
      default:
        nativeTheme.themeSource = "system";
        break;
    }

    return nativeTheme.themeSource;
  });
