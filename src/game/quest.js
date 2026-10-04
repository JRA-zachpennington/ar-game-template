import { config } from "./config.js";
import { theme } from "./theme.js";

export const VENUE = config.venue;

const REQUIRED = ["name", "hint", "kind"];

export const FINDS = Object.freeze(
  theme.finds.map((find) => {
    for (const key of REQUIRED) {
      if (!String(find[key] ?? "").trim()) {
        throw new Error(
          `themes/${theme.id} is missing ${key} for marker ${find.id}`,
        );
      }
    }
    return Object.freeze({ ...find });
  }),
);

export const findById = (id) => FINDS.find((find) => find.id === Number(id));
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
