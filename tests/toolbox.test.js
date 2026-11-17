import { describe, it, expect, beforeAll } from "vitest";
import * as Blockly from "blockly";
import { setupBlockly } from "../src/blocks/setup.js";
import {
  toolbox,
  CATEGORY_NAMES,
  toolboxBlockTypes,
} from "../src/blocks/toolbox.js";

beforeAll(() => setupBlockly());

describe("toolbox", () => {
  it("has the seven categories in order", () => {
    expect(toolbox.contents.map((c) => c.name)).toEqual(CATEGORY_NAMES);
  });
  it("only references defined block types", () => {
    for (const t of toolboxBlockTypes(toolbox))
      expect(Blockly.Blocks[t], t).toBeDefined();
  });
  it("keeps the legacy presets", () => {
    const [mov, , rep, , cores] = toolbox.contents;
    expect(mov.contents.map((b) => b.type)).toEqual([
      "pf",
      "pt",
      "pd",
      "pe",
      "pdv",
      "pev",
    ]);
    expect(mov.contents[2].fields.angulo).toBe(0);
    expect(rep.contents[0].inputs.TIMES.shadow.fields.NUM).toBe(10);
    expect(cores.contents.map((b) => b.type)).toEqual([
      "color",
      "colour_picker",
      "colour_random",
      "text",
      "colour_rgb",
      "colour_blend",
    ]);
    expect(cores.contents[3].fields.TEXT).toBe("#00CCFF");
  });
  it("uses the dynamic variable and procedure categories", () => {
    expect(toolbox.contents[5].custom).toBe("VARIABLE");
    expect(toolbox.contents[6].custom).toBe("PROCEDURE");
  });
});
