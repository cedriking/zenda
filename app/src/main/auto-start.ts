import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const AUTO_START_KEY = "com.zenda.app";

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function setAutoStart(enabled: boolean): boolean {
  try {
    if (process.platform === "darwin") {
      return setAutoStartMac(enabled);
    }
    if (process.platform === "win32") {
      return setAutoStartWindows(enabled);
    }
    return false;
  } catch {
    return false;
  }
}

function setAutoStartMac(enabled: boolean): boolean {
  const plistPath = path.join(
    app.getPath("home"),
    "Library",
    "LaunchAgents",
    `${AUTO_START_KEY}.plist`
  );

  if (enabled) {
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${AUTO_START_KEY}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xmlEscape(process.execPath)}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
</dict>
</plist>`;
    fs.writeFileSync(plistPath, plist, "utf-8");
  } else if (fs.existsSync(plistPath)) {
    fs.unlinkSync(plistPath);
  }
  return true;
}

function setAutoStartWindows(enabled: boolean): boolean {
  const exePath = app.getPath("exe");
  const escapedPath = exePath.replace(/"/g, '\\"');

  if (enabled) {
    const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTO_START_KEY}" /t REG_SZ /d "${escapedPath}" /f`;
    execSync(regCommand);
  } else {
    try {
      const regCommand = `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTO_START_KEY}" /f`;
      execSync(regCommand);
    } catch {
      /* key doesn't exist */
    }
  }
  return true;
}
