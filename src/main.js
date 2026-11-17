import * as Blockly from "blockly";
import "./styles/main.css";
import { setupBlockly } from "./blocks/setup.js";
import { toolbox } from "./blocks/toolbox.js";
import { loadExampleIfEmpty } from "./blocks/example.js";
import { createTurtle } from "./game/turtle.js";
import { createGame } from "./game/createGame.js";
import { createRunner } from "./runner.js";
import { bindUi } from "./ui.js";

setupBlockly();

const workspace = Blockly.inject("blocklyDiv", {
  toolbox,
  trashcan: true,
  horizontalLayout: true,
  scrollbars: true,
});
loadExampleIfEmpty(workspace);
window.addEventListener("resize", () => Blockly.svgResize(workspace));

const parent = document.getElementById("simulacao");
const width = parent.clientWidth || 800;
const height = parent.clientHeight || 600;
const turtle = createTurtle({ width, height });
const { ready } = createGame({ parent, turtle, width, height });

ready.then((scene) => {
  const api = {
    jabutiPF: () => scene.moveForward(),
    jabutiPT: () => scene.moveBack(),
    jabutiPD: (d) => scene.turnRight(d),
    jabutiPE: (d) => scene.turnLeft(d),
    setColor: (c) => scene.setColour(c),
    highlightBlock: (id) => workspace.highlightBlock(id),
  };
  let ui;
  const runner = createRunner({
    workspace,
    api,
    speedMs: 30,
    onStart: () => ui.setRunning(true),
    onFinish: (r) => {
      if (r?.error) console.error(r.error);
      ui.setRunning(false);
    },
  });
  ui = bindUi({ runner, workspace, scene, turtle });
});
