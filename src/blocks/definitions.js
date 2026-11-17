import * as Blockly from "blockly";
import { t } from "../i18n/index.js";

export const TURTLE_BLOCK_TYPES = [
  "pf",
  "pt",
  "pd",
  "pe",
  "pdv",
  "pev",
  "color",
];

export function assetUrl(name) {
  return `${import.meta.env.BASE_URL}assets/${name}`;
}

const icon = (name) => ({
  type: "field_image",
  src: assetUrl(name),
  width: 26,
  height: 26,
  alt: "*",
});

export function defineTurtleBlocks(lang = "pt") {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "pf",
      message0: "%1",
      args0: [icon("pf.png")],
      previousStatement: null,
      nextStatement: null,
      colour: 185,
      tooltip: t("tip.pf", lang),
    },
    {
      type: "pt",
      message0: "%1",
      args0: [icon("pt.png")],
      previousStatement: null,
      nextStatement: null,
      colour: 185,
      tooltip: t("tip.pt", lang),
    },
    {
      type: "pd",
      message0: "%1 %2",
      args0: [
        icon("pd.png"),
        { type: "field_angle", name: "angulo", angle: 90 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 290,
      tooltip: t("tip.pd", lang),
    },
    {
      type: "pe",
      message0: "%1 %2",
      args0: [
        icon("pe.png"),
        { type: "field_angle", name: "angulo", angle: 90 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 290,
      tooltip: t("tip.pe", lang),
    },
    {
      type: "pdv",
      message0: "%1 %2",
      args0: [
        icon("pd.png"),
        { type: "input_value", name: "grau", check: "Number" },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: 290,
      tooltip: t("tip.pdv", lang),
    },
    {
      type: "pev",
      message0: "%1 %2",
      args0: [
        icon("pe.png"),
        { type: "input_value", name: "grau", check: "Number" },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: 290,
      tooltip: t("tip.pev", lang),
    },
    {
      type: "color",
      message0: "%1 %2",
      args0: [icon("tint.png"), { type: "input_value", name: "NAME" }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: 20,
      tooltip: t("tip.color", lang),
    },
  ]);
}
