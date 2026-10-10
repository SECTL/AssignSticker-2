import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

function materialGbCss(): Plugin {
  return {
    name: "material-web-gb-css",
    enforce: "pre",
    resolveId(source, importer) {
      if (
        source.endsWith(".css") &&
        !source.endsWith(".cssresult.js") &&
        importer?.includes("/labs/gb/")
      ) {
        return this.resolve(source.replace(/\.css$/, ".cssresult.js"), importer);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), materialGbCss()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // @material/web uses CSS import attributes handled by materialGbCss();
  // keep it out of esbuild pre-bundling so the raw modules are served.
  optimizeDeps: {
    exclude: ["@material/web"],
  },
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
