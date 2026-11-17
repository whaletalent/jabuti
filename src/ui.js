import { setStep } from "./game/turtle.js";

export function bindUi({ runner, workspace, scene, turtle, doc = document }) {
  const $ = (id) => doc.getElementById(id);
  const play = $("play");
  const stop = $("stop");

  play.addEventListener("click", () => runner.run());
  stop.addEventListener("click", () => {
    runner.stop();
    scene.resetScene();
  });
  $("clear").addEventListener("click", () => {
    if (confirm("Remover os blocos da tela?")) workspace.clear();
  });
  $("undo").addEventListener("click", () => workspace.undo(false));
  $("redo").addEventListener("click", () => workspace.undo(true));

  $("velocidade").addEventListener("input", (e) =>
    runner.setSpeed(55 - Number(e.target.value)),
  );
  $("passo").addEventListener("input", (e) => {
    setStep(turtle, Number(e.target.value));
    $("passo-valor").textContent = e.target.value;
  });

  const preloader = $("preloader");
  setTimeout(() => {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.visibility = "hidden";
    }, 500);
  }, 1000);

  $("tutorial").addEventListener("click", (e) => {
    e.target.style.display = "none";
  });

  const setRunning = (running) => {
    play.disabled = running;
    stop.disabled = !running;
  };
  // The markup ships "Parar Execução" disabled; bindUi hands control to
  // setRunning, which callers invoke with the initial state.
  stop.disabled = false;
  return { setRunning };
}
