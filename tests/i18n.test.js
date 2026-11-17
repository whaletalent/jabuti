// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  LANGS,
  detectLang,
  t,
  translateDocument,
  messages,
} from "../src/i18n/index.js";

describe("i18n", () => {
  it("supports exactly pt and en with the same keys", () => {
    expect(LANGS).toEqual(["pt", "en"]);
    expect(Object.keys(messages.en).sort()).toEqual(
      Object.keys(messages.pt).sort(),
    );
  });

  it("detects the language: URL query, then stored choice, otherwise English", () => {
    expect(detectLang({ query: "pt", stored: "en" })).toBe("pt");
    expect(detectLang({ query: null, stored: "pt" })).toBe("pt");
    expect(detectLang({ query: "xx", stored: "pt" })).toBe("pt");
    expect(detectLang({ query: null, stored: null })).toBe("en");
    expect(detectLang({ query: null, stored: "xx" })).toBe("en");
    expect(detectLang({})).toBe("en");
  });

  it("translates keys and falls back to the key itself", () => {
    expect(t("ui.run", "pt")).toBe("Executar");
    expect(t("ui.run", "en")).toBe("Run");
    expect(t("category.movimento", "en")).toBe("Movement");
    expect(t("nope.missing", "en")).toBe("nope.missing");
  });

  it("translates a document via data-i18n attributes and sets <html lang>", () => {
    document.documentElement.lang = "pt-BR";
    document.body.innerHTML = `
      <h1 data-i18n="welcome.title"></h1>
      <button data-i18n-title="ui.run" data-i18n-aria="ui.run"></button>`;
    translateDocument(document, "en");
    expect(document.querySelector("h1").textContent).toBe(
      t("welcome.title", "en"),
    );
    expect(document.querySelector("button").title).toBe("Run");
    expect(document.querySelector("button").getAttribute("aria-label")).toBe(
      "Run",
    );
    expect(document.documentElement.lang).toBe("en");
    translateDocument(document, "pt");
    expect(document.documentElement.lang).toBe("pt-BR");
  });
});
