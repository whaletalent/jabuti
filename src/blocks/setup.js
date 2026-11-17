import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import * as ptBr from "blockly/msg/pt-br";
import * as en from "blockly/msg/en";
import { registerFieldAngle } from "@blockly/field-angle";
import { registerFieldColour, installAllBlocks } from "@blockly/field-colour";
import { defineTurtleBlocks } from "./definitions.js";
import { installTurtleGenerators } from "./generators.js";

let done = false;

export function setupBlockly({ lang = "pt" } = {}) {
  if (done) return;
  done = true;
  Blockly.setLocale(lang === "en" ? en : ptBr);
  registerFieldAngle();
  registerFieldColour();
  installAllBlocks({ javascript: javascriptGenerator });
  defineTurtleBlocks(lang);
  installTurtleGenerators();
}
