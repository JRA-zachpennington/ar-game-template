import { FINDS, findById } from "./quest.js";

export const SAVE_KEY = "elf-and-seek:v1";
export const initialQuest = () => ({
  version: 1,
  found: [],
  hints: [],
  mistakes: 0,
  elapsed: 0,
  complete: false,
});
export const counts = (state) => ({
  elves: state.found.filter((id) => findById(id)?.kind === "elf").length,
  cookies: state.found.filter((id) => findById(id)?.kind === "cookie").length,
});
export const isGathered = (state) =>
  FINDS.every((find) => state.found.includes(find.id));
export function questReducer(state, action) {
  switch (action.type) {
    case "collect":
      if (
        !action.allowed ||
        !findById(action.id) ||
        state.found.includes(action.id) ||
        state.complete
      )
        return state;
      return { ...state, found: [...state.found, action.id] };
    case "hint":
      if (!findById(action.id) || state.hints.includes(action.id)) return state;
      return { ...state, hints: [...state.hints, action.id] };
    case "mistake":
      return { ...state, mistakes: state.mistakes + 1 };
    case "tick":
      return state.complete
        ? state
        : {
            ...state,
            elapsed: state.elapsed + Math.max(0, Math.min(action.seconds, 2)),
          };
    case "complete":
      return action.allowed && isGathered(state)
        ? { ...state, complete: true }
        : state;
    case "reset":
      return initialQuest();
    default:
      return state;
  }
}

export function readQuest(storage) {
  try {
    const value = JSON.parse(storage.getItem(SAVE_KEY));
    if (value?.version !== 1) return initialQuest();
    const ids = (values) =>
      Array.isArray(values)
        ? [
            ...new Set(
              values.filter((id) => Number.isInteger(id) && findById(id)),
            ),
          ]
        : [];
    const state = {
      ...initialQuest(),
      found: ids(value.found),
      hints: ids(value.hints),
      mistakes: Number.isInteger(value.mistakes)
        ? Math.max(0, Math.min(value.mistakes, 10000))
        : 0,
      elapsed: Number.isFinite(value.elapsed)
        ? Math.max(0, Math.min(value.elapsed, 86400))
        : 0,
    };
    state.complete = value.complete === true && isGathered(state);
    return state;
  } catch {
    return initialQuest();
  }
}
export function writeQuest(state, storage) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
