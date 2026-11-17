import { setStep } from "./game/turtle.js";

export function bindUi({
  runner,
  workspace,
  scene,
  turtle,
  onToggleLang = () => {},
  doc = document,
}) {
  const $ = (id) => doc.getElementById(id);
  const play = $("play");
  const stop = $("stop");

  play.addEventListener("click", () => runner.run());
  stop.addEventListener("click", () => {
    runner.stop();
    scene.resetScene();
    stop.disabled = true;
  });
  $("undo").addEventListener("click", () => workspace.undo(false));
  $("redo").addEventListener("click", () => workspace.undo(true));

  const applySpeed = (value) => runner.setSpeed(55 - Number(value));
  const applyStep = (value) => {
    setStep(turtle, Number(value));
    $("passo-valor").textContent = value;
  };
  $("velocidade").addEventListener("input", (e) => applySpeed(e.target.value));
  $("passo").addEventListener("input", (e) => applyStep(e.target.value));

  const preloader = $("preloader");
  setTimeout(() => {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.visibility = "hidden";
    }, 500);
  }, 1000);

  $("start").addEventListener("click", () => {
    $("welcome").style.display = "none";
  });
  $("lang")?.addEventListener("click", onToggleLang);

  const setRunning = (running) => {
    play.disabled = running;
    // After a run ends, Stop stays enabled so it can reset the drawing.
    if (running) stop.disabled = false;
  };
  setRunning(false);
  stop.disabled = true;
  applySpeed($("velocidade").value);
  applyStep($("passo").value);
  return { setRunning };
}
