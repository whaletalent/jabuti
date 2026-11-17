import * as Blockly from "blockly";
import "./styles/main.css";
import { setupBlockly } from "./blocks/setup.js";
import { toolbox } from "./blocks/toolbox.js";
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

const parent = document.getElementById("simulacao");
const turtle = createTurtle({
  width: parent.clientWidth,
  height: parent.clientHeight,
});
const { ready } = createGame({ parent, turtle });

ready.then((scene) => {
  // Phaser 4 buffers RenderTexture commands until render(); 'all' mode renders
  // every frame and `preserve` keeps the buffer so the trail accumulates.
  scene.trail.setRenderMode("all", true);
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
    onFinish: () => ui.setRunning(false),
  });
  ui = bindUi({ runner, workspace, scene, turtle });
  ui.setRunning(false);
});
