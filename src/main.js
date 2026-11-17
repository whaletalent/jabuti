import * as Blockly from "blockly";
import "./styles/main.css";
import { setupBlockly } from "./blocks/setup.js";
import { buildToolbox } from "./blocks/toolbox.js";
import { loadExampleIfEmpty } from "./blocks/example.js";
import { createTurtle } from "./game/turtle.js";
import { createGame } from "./game/createGame.js";
import { createRunner } from "./runner.js";
import { bindUi } from "./ui.js";
import { getLang, setLang, translateDocument } from "./i18n/index.js";
import { STACKED_QUERY, canvasSize } from "./layout.js";
import { saveSession, takeSession } from "./session.js";
import {
  createIcons,
  Play,
  Square,
  Undo2,
  Redo2,
  Gauge,
  Ruler,
  Languages,
} from "lucide";

const lang = getLang();
translateDocument(document, lang);
document.getElementById("lang-code").textContent = lang.toUpperCase();
createIcons({ icons: { Play, Square, Undo2, Redo2, Gauge, Ruler, Languages } });
setupBlockly({ lang });

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: buildToolbox(lang),
  trashcan: true,
  horizontalLayout: true,
  scrollbars: true,
});
// A language switch hands the program over the reload; otherwise show the example.
const session = takeSession(sessionStorage);
if (session) {
  Blockly.serialization.workspaces.load(session.workspace, workspace);
  document.getElementById("velocidade").value = session.speed;
  document.getElementById("passo").value = session.step;
  document.getElementById("welcome").style.display = "none";
} else {
  loadExampleIfEmpty(workspace);
  document.getElementById("start").focus();
}

const parent = document.getElementById("simulacao");
// Stacked (phone/tablet) layout: keep the canvas at its real 800x600 size and
// let the container scroll. Side-by-side layout: fit the canvas to the column.
const stacked = window.matchMedia(STACKED_QUERY).matches;
const { width, height } = canvasSize({
  stacked,
  clientWidth: parent.clientWidth,
  clientHeight: parent.clientHeight,
});
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
  ui = bindUi({
    runner,
    workspace,
    scene,
    turtle,
    onToggleLang: () => {
      const next = lang === "pt" ? "en" : "pt";
      saveSession(sessionStorage, {
        workspace: Blockly.serialization.workspaces.save(workspace),
        speed: document.getElementById("velocidade").value,
        step: document.getElementById("passo").value,
      });
      setLang(next);
      const url = new URL(location.href);
      url.searchParams.set("lang", next);
      location.assign(url);
    },
  });
});
