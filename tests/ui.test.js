// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { bindUi } from "../src/ui.js";

const dom = () => {
  document.body.innerHTML = `
    <button id="play"></button><button id="stop" disabled></button>
    <button id="undo"></button><button id="redo"></button>
    <input id="velocidade" type="range" value="25"><input id="passo" type="range" value="8"><output id="passo-valor">8</output>
    <div id="preloader"></div><div id="welcome"></div><button id="start"></button>`;
};
const deps = () => ({
  runner: { run: vi.fn(), stop: vi.fn(), setSpeed: vi.fn() },
  workspace: { undo: vi.fn() },
  scene: { resetScene: vi.fn() },
  turtle: { step: 8 },
});

describe("ui", () => {
  it("toggles buttons with setRunning", () => {
    dom();
    const ui = bindUi(deps());
    ui.setRunning(true);
    expect(document.getElementById("play").disabled).toBe(true);
    expect(document.getElementById("stop").disabled).toBe(false);
    ui.setRunning(false);
    expect(document.getElementById("play").disabled).toBe(false);
    expect(document.getElementById("stop").disabled).toBe(false);
    document.getElementById("stop").click();
    expect(document.getElementById("stop").disabled).toBe(true);
  });
  it("maps the speed slider to 55 - value and the step slider to the turtle", () => {
    dom();
    const d = deps();
    bindUi(d);
    expect(d.runner.setSpeed).toHaveBeenCalledWith(30);
    expect(d.turtle.step).toBe(8);
    const v = document.getElementById("velocidade");
    v.value = "50";
    v.dispatchEvent(new Event("input"));
    expect(d.runner.setSpeed).toHaveBeenCalledWith(5);
    const p = document.getElementById("passo");
    p.value = "12";
    p.dispatchEvent(new Event("input"));
    expect(d.turtle.step).toBe(12);
    expect(document.getElementById("passo-valor").textContent).toBe("12");
  });
  it("stop resets the scene and undo/redo map to workspace.undo", () => {
    dom();
    const d = deps();
    const ui = bindUi(d);
    ui.setRunning(true);
    document.getElementById("stop").click();
    expect(d.runner.stop).toHaveBeenCalledOnce();
    expect(d.scene.resetScene).toHaveBeenCalledOnce();
    document.getElementById("redo").click();
    expect(d.workspace.undo).toHaveBeenCalledWith(true);
  });
});
