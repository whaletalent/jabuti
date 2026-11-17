// Toolbox ported from the 2019 XML (v1-legacy:public/turtle.html) to Blockly JSON.
import { t } from "../i18n/index.js";

const num = (value) => ({
  shadow: { type: "math_number", fields: { NUM: value } },
});
const colour = (value) => ({
  shadow: { type: "colour_picker", fields: { COLOUR: value } },
});

const CATEGORY_KEYS = [
  "movimento",
  "logica",
  "repeticao",
  "matematica",
  "cores",
  "variaveis",
  "funcoes",
];

export const categoryNames = (lang = "pt") =>
  CATEGORY_KEYS.map((k) => t(`category.${k}`, lang));

/** Category names in the source language (pt), as in the 2019 toolbox. */
export const CATEGORY_NAMES = categoryNames("pt");

export const buildToolbox = (lang = "pt") => ({
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: t("category.movimento", lang),
      colour: "185",
      contents: [
        { kind: "block", type: "pf" },
        { kind: "block", type: "pt" },
        { kind: "block", type: "pd", fields: { angulo: 0 } },
        { kind: "block", type: "pe", fields: { angulo: 0 } },
        { kind: "block", type: "pdv", inputs: { grau: num(90) } },
        { kind: "block", type: "pev", inputs: { grau: num(90) } },
      ],
    },
    {
      kind: "category",
      name: t("category.logica", lang),
      colour: "210",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" },
      ],
    },
    {
      kind: "category",
      name: t("category.repeticao", lang),
      colour: "120",
      contents: [
        {
          kind: "block",
          type: "controls_repeat_ext",
          inputs: { TIMES: num(10) },
        },
        {
          kind: "block",
          type: "controls_for",
          inputs: { FROM: num(1), TO: num(10), BY: num(1) },
        },
        { kind: "block", type: "controls_flow_statements" },
      ],
    },
    {
      kind: "category",
      name: t("category.matematica", lang),
      colour: "230",
      contents: [
        { kind: "block", type: "math_number", fields: { NUM: 1 } },
        {
          kind: "block",
          type: "math_arithmetic",
          inputs: { A: num(1), B: num(1) },
        },
        {
          kind: "block",
          type: "math_number_property",
          inputs: { NUMBER_TO_CHECK: num(1) },
        },
        {
          kind: "block",
          type: "math_modulo",
          inputs: { DIVIDEND: num(2), DIVISOR: num(5) },
        },
        {
          kind: "block",
          type: "math_constrain",
          inputs: { VALUE: num(5), LOW: num(1), HIGH: num(10) },
        },
        {
          kind: "block",
          type: "math_random_int",
          inputs: { FROM: num(1), TO: num(1) },
        },
      ],
    },
    {
      kind: "category",
      name: t("category.cores", lang),
      colour: "20",
      contents: [
        { kind: "block", type: "color" },
        { kind: "block", type: "colour_picker" },
        { kind: "block", type: "colour_random" },
        { kind: "block", type: "text", fields: { TEXT: "#00CCFF" } },
        {
          kind: "block",
          type: "colour_rgb",
          inputs: { RED: num(255), GREEN: num(255), BLUE: num(255) },
        },
        {
          kind: "block",
          type: "colour_blend",
          inputs: {
            COLOUR1: colour("#00ccff"),
            COLOUR2: colour("#00FFAA"),
            RATIO: num(0.5),
          },
        },
      ],
    },
    {
      kind: "category",
      name: t("category.variaveis", lang),
      colour: "330",
      custom: "VARIABLE",
    },
    {
      kind: "category",
      name: t("category.funcoes", lang),
      colour: "290",
      custom: "PROCEDURE",
    },
  ],
});

/** The toolbox in the source language (pt). */
export const toolbox = buildToolbox("pt");

/** Every block type referenced by the toolbox, including shadows and nested blocks. */
export function toolboxBlockTypes(tb) {
  const types = new Set();
  const visitBlock = (b) => {
    if (b.type) types.add(b.type);
    for (const input of Object.values(b.inputs ?? {})) {
      if (input.shadow) visitBlock(input.shadow);
      if (input.block) visitBlock(input.block);
    }
  };
  const visit = (entry) => {
    if (entry.kind === "block") visitBlock(entry);
    for (const child of entry.contents ?? []) visit(child);
  };
  visit(tb);
  return [...types];
}
