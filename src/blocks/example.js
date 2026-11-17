import * as Blockly from "blockly";

/**
 * The program shown when Jabuti opens with an empty workspace:
 * repeat 6 × { cyan; repeat 5 × (forward, right 15°); pink; repeat 5 × (forward, right 45°) }
 * — a two-colour flower.
 * Blockly 13 workspace-serialization format.
 */
export const exampleState = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: "controls_repeat_ext",
        x: 20,
        y: 20,
        inputs: {
          TIMES: { shadow: { type: "math_number", fields: { NUM: 6 } } },
          DO: {
            block: {
              type: "color",
              inputs: {
                NAME: {
                  block: {
                    type: "colour_picker",
                    fields: { COLOUR: "#66ffff" },
                  },
                },
              },
              next: {
                block: {
                  type: "controls_repeat_ext",
                  inputs: {
                    TIMES: {
                      shadow: { type: "math_number", fields: { NUM: 5 } },
                    },
                    DO: {
                      block: {
                        type: "pf",
                        next: { block: { type: "pd", fields: { angulo: 15 } } },
                      },
                    },
                  },
                  next: {
                    block: {
                      type: "color",
                      inputs: {
                        NAME: {
                          block: {
                            type: "colour_picker",
                            fields: { COLOUR: "#ff66ff" },
                          },
                        },
                      },
                      next: {
                        block: {
                          type: "controls_repeat_ext",
                          inputs: {
                            TIMES: {
                              shadow: {
                                type: "math_number",
                                fields: { NUM: 5 },
                              },
                            },
                            DO: {
                              block: {
                                type: "pf",
                                next: {
                                  block: { type: "pd", fields: { angulo: 45 } },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
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
