import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/", "public/"] },
  js.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  prettier,
];
