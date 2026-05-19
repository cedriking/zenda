import path from "node:path";
import { defineConfig } from "vite";

const srcRoot = path.resolve(import.meta.dirname, "./src");
const whatsappDir = path.resolve(srcRoot, "./main/whatsapp");

export default defineConfig({
  resolve: {
    alias: {
      "@": srcRoot,
    },
  },
  build: {
    rollupOptions: {
      external(id, parentId, isResolved) {
        // Externalize npm packages
        const npmExternals = [
          "@whiskeysockets/baileys",
          "whatsapp-web.js",
          "puppeteer",
          "puppeteer-core",
          "qrcode",
          "pino",
          "ws",
          "bufferutil",
          "utf-8-validate",
        ];
        if (typeof id === "string" && npmExternals.some((p) => id === p || id.startsWith(p + "/"))) {
          return true;
        }
        // Externalize all whatsapp modules — they use Node-only deps
        if (typeof id === "string" && isResolved) {
          const absPath = path.resolve(id);
          if (absPath.startsWith(whatsappDir)) {
            return true;
          }
        }
        return false;
      },
    },
  },
});
