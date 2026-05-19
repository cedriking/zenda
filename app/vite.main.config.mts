import path from "node:path";
import { defineConfig } from "vite";
import { builtinModules } from "node:module";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        ...builtinModules.flatMap((m) => [m, `node:${m}`]),
        "@whiskeysockets/baileys",
        "whatsapp-web.js",
        "puppeteer",
        "puppeteer-core",
        "qrcode",
        "pino",
        "ws",
        "bufferutil",
        "utf-8-validate",
      ],
    },
  },
});
