export const WHITE = 0xffffff;
export const DEFAULT_STEP = 8;
export const MIN_STEP = 1;
export const MAX_STEP = 32;

const MARGIN = 8;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toAmount(deg) {
  const n = Number(deg);
  return Number.isFinite(n) ? n : 0;
}

export function createTurtle({ width, height, step = DEFAULT_STEP }) {
  return {
    x: width / 2,
    y: height / 2,
    heading: 0,
    colour: WHITE,
    step,
    width,
    height,
  };
}

function advance(t, direction) {
  const rad = (t.heading * Math.PI) / 180;
  const dx = direction * t.step * Math.cos(rad);
  const dy = direction * t.step * Math.sin(rad);
  t.x = clamp(t.x + dx, MARGIN, t.width - MARGIN);
  t.y = clamp(t.y + dy, MARGIN, t.height - MARGIN);
  return t;
}

export function forward(t) {
  return advance(t, 1);
}

export function back(t) {
  return advance(t, -1);
}

export function turnRight(t, deg) {
  t.heading += toAmount(deg);
  return t;
}

export function turnLeft(t, deg) {
  t.heading -= toAmount(deg);
  return t;
}

const HEX_COLOUR = /^#([0-9a-f]{6})$/i;

export function setColour(t, value) {
  const match = typeof value === "string" ? HEX_COLOUR.exec(value) : null;
  t.colour = match ? parseInt(match[1], 16) : WHITE;
  return t.colour;
}

export function setStep(t, n) {
  const value = Number(n);
  if (!Number.isFinite(value)) {
    t.step = DEFAULT_STEP;
    return t;
  }
  t.step = clamp(Math.trunc(value), MIN_STEP, MAX_STEP);
  return t;
}

export function reset(t) {
  t.x = t.width / 2;
  t.y = t.height / 2;
  t.heading = 0;
  t.colour = WHITE;
  return t;
}
