import { saveState as persist } from "../storage.js";

export function persistStateSafely(state) {
  persist(state).catch((err) => console.error("Failed to save state", err));
}
