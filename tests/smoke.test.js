import { describe, it, expect } from "vitest";
import config from "../vite.config.js";

describe("build config", () => {
  it("serves under the /jabuti/ base path", () => {
    expect(config.base).toBe("/jabuti/");
  });
});
