// Kept apart from config.js: ESLint 8 cannot parse import attributes, and
// Node needs them for JSON. This file is lint-ignored; config.js is not.
import pkg from "../../package.json" with { type: "json" };

export const version = pkg.version;
// Host-set mailbox for the accessibility statement. The same package.json field
// fills the static statement at build time (see vite.config.js), so the address
// lives in exactly one place. config.test.js checks it is a single address.
export const accessibilityEmail = pkg.accessibilityEmail;
