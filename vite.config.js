import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { APP_PATHS } from "./src/game/routes.js";

const root = fileURLToPath(new URL(".", import.meta.url));
// ESLint 8 cannot parse import attributes, so read the host config as text.
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
// Exact screen paths only. /instructions/*.mp3 stays the briefing audio.
function appRoutes() {
  const exact = new Set(APP_PATHS.flatMap((path) => [path, `${path}/`]));
  const rewrite = (req, _res, next) => {
    const [path, query] = (req.url || "").split("?");
    if (exact.has(path)) req.url = query ? `/?${query}` : "/";
    next();
  };
  return {
    name: "app-routes",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [react(), appRoutes()],
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
