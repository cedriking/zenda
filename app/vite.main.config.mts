import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["whatsapp-web.js", "puppeteer", "puppeteer-core", "qrcode", "ws", "bufferutil", "utf-8-validate"],
    },
  },
});
