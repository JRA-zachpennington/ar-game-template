// Kept apart from config.js: ESLint 8 cannot parse import attributes, and
// Node needs them for JSON. This file is lint-ignored; config.js is not.
import pkg from "../../package.json" with { type: "json" };

export const version = pkg.version;
