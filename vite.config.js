import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  plugins: [react()],
  base: "/ar-game-template/",
  server: { host: true, port: 3000 },
  // Camera tracking is lazy-loaded; the illustrated landing page stays small.
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        legacy: resolve(root, "Game/index.html"),
      },
    },
  },
});
