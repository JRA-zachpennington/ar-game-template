import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
// ESLint 8 cannot parse import attributes, so read the host config as text.
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: { host: true, port: 3000 },
  // Fills %ACCESS_EMAIL% in accessibility.html at serve and build time, from the
  // same package.json field the app reads, so the address is never typed twice.
  define: {
    "import.meta.env.ACCESS_EMAIL": JSON.stringify(pkg.accessibilityEmail),
  },
  // Camera tracking is lazy-loaded; the illustrated landing page stays small.
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        legacy: resolve(root, "Game/index.html"),
        accessibility: resolve(root, "accessibility.html"),
      },
    },
  },
});
