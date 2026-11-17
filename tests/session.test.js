import { describe, it, expect } from "vitest";
import { saveSession, takeSession } from "../src/session.js";

const fakeStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};

describe("session handoff across a language switch", () => {
  it("round-trips the workspace state and slider values, then clears", () => {
    const storage = fakeStorage();
    const state = { blocks: { languageVersion: 0, blocks: [{ type: "pf" }] } };
    saveSession(storage, { workspace: state, speed: 40, step: 12 });
    expect(takeSession(storage)).toEqual({
      workspace: state,
      speed: 40,
      step: 12,
    });
    expect(takeSession(storage)).toBeNull();
  });

  it("returns null when nothing was saved or the payload is corrupt", () => {
    const storage = fakeStorage();
    expect(takeSession(storage)).toBeNull();
    storage.setItem("jabuti.session", "{not json");
    expect(takeSession(storage)).toBeNull();
  });

  it("survives a storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() =>
      saveSession(broken, { workspace: {}, speed: 1, step: 1 }),
    ).not.toThrow();
    expect(takeSession(broken)).toBeNull();
  });
});
