import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import * as ptBr from "blockly/msg/pt-br";
import { registerFieldAngle } from "@blockly/field-angle";
import { registerFieldColour, installAllBlocks } from "@blockly/field-colour";
import { defineTurtleBlocks } from "./definitions.js";
import { installTurtleGenerators } from "./generators.js";

let done = false;

export function setupBlockly() {
  if (done) return;
  done = true;
  Blockly.setLocale(ptBr);
  registerFieldAngle();
  registerFieldColour();
  installAllBlocks({ javascript: javascriptGenerator });
  defineTurtleBlocks();
  installTurtleGenerators();
}
