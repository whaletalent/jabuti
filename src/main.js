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
// Stacked (phone/tablet) layout: keep the canvas at its real 800x600 size and
// let the container scroll. Side-by-side layout: fit the canvas to the column.
const stacked = window.matchMedia(
  "(max-width: 899px), (orientation: portrait)",
).matches;
const width = stacked
  ? Math.max(parent.clientWidth, 800)
  : parent.clientWidth || 800;
const height = stacked
  ? Math.max(parent.clientHeight, 600)
  : parent.clientHeight || 600;
const turtle = createTurtle({ width, height });
const { ready } = createGame({
  parent,
  turtle,
  width,
  height,
  fit: !stacked,
});

ready.then((scene) => {
  if (stacked) {
    // Start scrolled to the middle, where the turtle is.
    parent.scrollTo(
      (width - parent.clientWidth) / 2,
      (height - parent.clientHeight) / 2,
    );
  }
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
