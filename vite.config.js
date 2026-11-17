import { defineConfig } from "vitest/config";

const base = "/jabuti/";

export default defineConfig({
  base,
  test: { environment: "node", env: { BASE_URL: base } },
});
