const KEY = "jabuti.session";

/**
 * Hands the current program and slider values over a page reload (used when
 * the language is switched). Storage errors are swallowed: the worst case is
 * starting over with the example, never a crash.
 */
export function saveSession(storage, { workspace, speed, step }) {
  try {
    storage.setItem(KEY, JSON.stringify({ workspace, speed, step }));
  } catch {
    /* storage blocked */
  }
}

/** Reads and clears the saved session; null when absent or unreadable. */
export function takeSession(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return null;
    storage.removeItem(KEY);
    const data = JSON.parse(raw);
    return data && typeof data === "object" && data.workspace ? data : null;
  } catch {
    return null;
  }
}
