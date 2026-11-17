import { describe, it, expect } from "vitest";
import {
  createTurtle,
  forward,
  back,
  turnRight,
  turnLeft,
  setColour,
  setStep,
  reset,
  WHITE,
} from "../src/game/turtle.js";

const make = () => createTurtle({ width: 400, height: 300 });

describe("turtle", () => {
  it("starts centred, facing right, white, step 8", () => {
    expect(make()).toMatchObject({
      x: 200,
      y: 150,
      heading: 0,
      colour: WHITE,
      step: 8,
    });
  });
  it("moves 8px along heading 0 and 90", () => {
    const t = make();
    forward(t);
    expect([t.x, t.y]).toEqual([208, 150]);
    turnRight(t, 90);
    forward(t);
    expect([Math.round(t.x), Math.round(t.y)]).toEqual([208, 158]);
    back(t);
    expect([Math.round(t.x), Math.round(t.y)]).toEqual([208, 150]);
  });
  it("right adds, left subtracts, no normalisation", () => {
    const t = make();
    turnRight(t, 90);
    turnLeft(t, 180);
    expect(t.heading).toBe(-90);
  });
  it("treats a non-numeric turn as 0 (Review Focus 2)", () => {
    const t = make();
    turnRight(t, "abc");
    turnLeft(t, undefined);
    expect(t.heading).toBe(0);
  });
  it("clamps to the canvas", () => {
    const t = make();
    t.x = 395;
    forward(t);
    expect(t.x).toBe(392);
    t.heading = 180;
    t.x = 3;
    forward(t);
    expect(t.x).toBe(8);
  });
  it("parses #rrggbb and falls back to white (Review Focus 1)", () => {
    const t = make();
    expect(setColour(t, "#FF0000")).toBe(0xff0000);
    expect(setColour(t, "vermelho")).toBe(WHITE);
    expect(setColour(t, "#abc")).toBe(WHITE);
  });
  it("clamps step to 1..32 and defaults to 8", () => {
    const t = make();
    setStep(t, 100);
    expect(t.step).toBe(32);
    setStep(t, 0);
    expect(t.step).toBe(1);
    setStep(t, NaN);
    expect(t.step).toBe(8);
  });
  it("reset keeps step", () => {
    const t = make();
    setStep(t, 4);
    forward(t);
    turnRight(t, 45);
    setColour(t, "#00ff00");
    reset(t);
    expect(t).toMatchObject({
      x: 200,
      y: 150,
      heading: 0,
      colour: WHITE,
      step: 4,
    });
  });
});
