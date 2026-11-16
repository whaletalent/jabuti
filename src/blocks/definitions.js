import * as Blockly from "blockly";

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

export function defineTurtleBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "pf",
      message0: "%1",
      args0: [icon("pf.png")],
      previousStatement: null,
      nextStatement: null,
      colour: 185,
      tooltip: "Move-o para frente",
    },
    {
      type: "pt",
      message0: "%1",
      args0: [icon("pt.png")],
      previousStatement: null,
      nextStatement: null,
      colour: 185,
      tooltip: "Move-o para trás",
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
      tooltip: "Gira-o para a direita",
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
      tooltip: "Gira-o para a esquerda",
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
      tooltip: "Gira-o para a direita (Aceita blocos e variáveis)",
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
      tooltip: "Gira-o para a esquerda (Aceita blocos e variáveis)",
    },
    {
      type: "color",
      message0: "%1 %2",
      args0: [icon("tint.png"), { type: "input_value", name: "NAME" }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: 20,
      tooltip: "Modifica a cor do Rastro",
    },
  ]);
}
