// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { setupBlockly } from "../src/blocks/setup.js";
import { exampleState, loadExampleIfEmpty } from "../src/blocks/example.js";

beforeAll(() => setupBlockly());

const EXPECTED =
  "setColor('#00ccff');\nfor (var count = 0; count < 36; count++) {\n  jabutiPF(1);\n  jabutiPD(15);\n}\n";

const types = (node, acc = new Set()) => {
  if (!node || typeof node !== "object") return acc;
  if (node.type) acc.add(node.type);
  for (const v of Object.values(node)) types(v, acc);
  return acc;
};

describe("example program", () => {
  it("loads into an empty workspace and generates the circle program", () => {
    const ws = new Blockly.Workspace();
    expect(loadExampleIfEmpty(ws)).toBe(true);
    expect(ws.getTopBlocks(false)).toHaveLength(1);
    expect(javascriptGenerator.workspaceToCode(ws)).toBe(EXPECTED);
  });

  it("does nothing when the workspace already has blocks (Review Focus 1)", () => {
    const ws = new Blockly.Workspace();
    ws.newBlock("pf");
    expect(loadExampleIfEmpty(ws)).toBe(false);
    expect(ws.getAllBlocks(false)).toHaveLength(1);
  });

  it("only uses defined block types (Review Focus 2)", () => {
    for (const t of types(exampleState))
      expect(Blockly.Blocks[t], t).toBeDefined();
  });
});
