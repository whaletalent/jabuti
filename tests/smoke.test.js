import { describe, it, expect } from "vitest";
describe("build config", () => {
  it("serves under the /jabuti/ base path", () => {
    expect(import.meta.env.BASE_URL).toBe("/jabuti/");
  });
});
