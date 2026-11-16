// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { setupBlockly } from "../src/blocks/setup.js";
import { TURTLE_BLOCK_TYPES, assetUrl } from "../src/blocks/definitions.js";

let ws;
beforeAll(() => {
  setupBlockly();
  ws = new Blockly.Workspace();
});
const code = (b) => javascriptGenerator.blockToCode(b);

describe("turtle blocks", () => {
  it("defines all seven block types", () => {
    for (const t of TURTLE_BLOCK_TYPES)
      expect(Blockly.Blocks[t], t).toBeDefined();
  });
  it("block icons resolve under the Pages base path (Review Focus 5)", () => {
    expect(assetUrl("pf.png")).toBe("/jabuti/assets/pf.png");
  });
  it("pf / pt emit fixed calls", () => {
    expect(code(ws.newBlock("pf"))).toBe("jabutiPF(1);\n");
    expect(code(ws.newBlock("pt"))).toBe("jabutiPT(1);\n");
  });
  it("pd / pe use the angle field", () => {
    const pd = ws.newBlock("pd");
    pd.setFieldValue(45, "angulo");
    expect(code(pd)).toBe("jabutiPD(45);\n");
    const pe = ws.newBlock("pe");
    pe.setFieldValue(30, "angulo");
    expect(code(pe)).toBe("jabutiPE(30);\n");
  });
  it("pdv / pev take a value input and default to 0", () => {
    const pdv = ws.newBlock("pdv");
    const n = ws.newBlock("math_number");
    n.setFieldValue(60, "NUM");
    pdv.getInput("grau").connection.connect(n.outputConnection);
    expect(code(pdv)).toBe("jabutiPD(60);\n");
    expect(code(ws.newBlock("pev"))).toBe("jabutiPE(0);\n");
  });
  it("color passes the colour expression through", () => {
    const c = ws.newBlock("color");
    const p = ws.newBlock("colour_picker");
    p.setFieldValue("#ff0000", "COLOUR");
    c.getInput("NAME").connection.connect(p.outputConnection);
    expect(code(c)).toBe("setColor('#ff0000');\n");
  });
  it("messages are pt-BR", () => {
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toBe("repita %1 vezes");
  });
});
