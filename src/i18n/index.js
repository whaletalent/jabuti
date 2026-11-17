import { messages } from "./messages.js";

export { messages };
export const LANGS = ["pt", "en"];
const STORAGE_KEY = "jabuti.lang";

/** A `?lang=` query wins, then the stored choice; otherwise English. */
export function detectLang({ query, stored } = {}) {
  if (LANGS.includes(query)) return query;
  return LANGS.includes(stored) ? stored : "en";
}

function readQuery() {
  try {
    return new URLSearchParams(location.search).get("lang");
  } catch {
    return null;
  }
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let current = null;

export function getLang() {
  if (!current) {
    const query = readQuery();
    current = detectLang({ query, stored: readStored() });
    if (LANGS.includes(query)) setLang(query); // remember a shared ?lang= link
  }
  return current;
}

/** Persists the choice; the caller reloads so Blockly picks up its locale. */
export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode: the choice just will not persist */
  }
}

export function t(key, lang = getLang()) {
  return messages[lang]?.[key] ?? messages.pt[key] ?? key;
}

/**
 * Applies `data-i18n` (text), `data-i18n-title` and `data-i18n-aria`
 * attributes and sets <html lang>.
 */
export function translateDocument(doc, lang = getLang()) {
  doc.documentElement.lang = t("html.lang", lang);
  for (const el of doc.querySelectorAll("[data-i18n]"))
    el.textContent = t(el.dataset.i18n, lang);
  for (const el of doc.querySelectorAll("[data-i18n-title]"))
    el.title = t(el.dataset.i18nTitle, lang);
  for (const el of doc.querySelectorAll("[data-i18n-aria]"))
    el.setAttribute("aria-label", t(el.dataset.i18nAria, lang));
}
