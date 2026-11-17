import * as Blockly from "blockly";

/**
 * The program shown when Jabuti opens with an empty workspace:
 * trail colour cyan, then repeat 36 × (forward, turn right 15°) — a circle.
 * Blockly 13 workspace-serialization format.
 */
export const exampleState = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: "color",
        x: 20,
        y: 20,
        inputs: {
          NAME: {
            block: { type: "colour_picker", fields: { COLOUR: "#00ccff" } },
          },
        },
        next: {
          block: {
            type: "controls_repeat_ext",
            inputs: {
              TIMES: { shadow: { type: "math_number", fields: { NUM: 36 } } },
              DO: {
                block: {
                  type: "pf",
                  next: { block: { type: "pd", fields: { angulo: 15 } } },
                },
              },
            },
          },
        },
      },
    ],
  },
};

/**
 * Loads the example into `workspace` when it has no blocks.
 * @returns {boolean} true when the example was loaded, false when the workspace already had blocks.
 */
export function loadExampleIfEmpty(workspace) {
  if (workspace.getAllBlocks(false).length > 0) return false;
  Blockly.serialization.workspaces.load(exampleState, workspace);
  return true;
}
