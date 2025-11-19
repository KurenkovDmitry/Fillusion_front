import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "node:path";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://176.123.165.26",
        changeOrigin: true,
      },
      "/avatars": {
        target: "http://176.123.165.26",
        changeOrigin: true,
      },
    },
  },
});
