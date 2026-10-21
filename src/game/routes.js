// Screen names are the ones the game already uses. Paths are the public URLs.
const PATHS = {
  home: "/",
  setup: "/instructions",
  play: "/game",
  victory: "/win",
  journal: "/journal",
};

// Every screen except home. The server rewrites these exact paths to the app.
export const APP_PATHS = Object.values(PATHS).filter((path) => path !== "/");

function normalize(pathname, base) {
  const root = base.endsWith("/") ? base.slice(0, -1) : base;
  let path = pathname || "/";
  if (root && (path === root || path.startsWith(`${root}/`))) {
    path = path.slice(root.length) || "/";
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

export function screenFromPath(pathname, base = "/") {
  const path = normalize(pathname, base);
  return Object.keys(PATHS).find((screen) => PATHS[screen] === path) ?? "home";
}

export function isAppPath(pathname, base = "/") {
  return Object.values(PATHS).includes(normalize(pathname, base));
}

export function pathForScreen(screen, base = "/") {
  const root = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${root}${PATHS[screen] || "/"}`;
}
