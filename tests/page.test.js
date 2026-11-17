// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { messages } from "../src/i18n/messages.js";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const css = readFileSync(resolve(process.cwd(), "src/styles/main.css"), "utf8");
const { STACKED_QUERY } = await import("../src/layout.js");

describe("index.html", () => {
  it("only uses i18n keys that exist, and never on elements with children", () => {
    document.body.innerHTML = html;
    for (const el of document.querySelectorAll(
      "[data-i18n],[data-i18n-title],[data-i18n-aria]",
    )) {
      for (const key of [
        el.dataset.i18n,
        el.dataset.i18nTitle,
        el.dataset.i18nAria,
      ].filter(Boolean)) {
        expect(messages.en, key).toHaveProperty(key);
      }
      if (el.dataset.i18n) expect(el.children.length, el.outerHTML).toBe(0);
    }
  });

  it("keeps the stacked-layout media query identical in CSS and JS", () => {
    expect(css).toContain(`@media ${STACKED_QUERY} {`);
  });

  it("loads the welcome font", () => {
    expect(css).toMatch(/@font-face\s*{[^}]*VCR OSD Mono[^}]*retro\.ttf/s);
  });
});
