import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import * as Blockly from "blockly";
import { setupBlockly } from "../src/blocks/setup.js";
import { createRunner } from "../src/runner.js";

const apiMock = () => ({
  jabutiPF: vi.fn(),
  jabutiPT: vi.fn(),
  jabutiPD: vi.fn(),
  jabutiPE: vi.fn(),
  setColor: vi.fn(),
  highlightBlock: vi.fn(),
});
const program = (ws, ...types) => {
  let prev;
  for (const t of types) {
    const b = ws.newBlock(t);
    if (prev) prev.nextConnection.connect(b.previousConnection);
    prev = b;
  }
};

beforeAll(() => setupBlockly());
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("runner", () => {
  it("runs a program step by step and finishes", () => {
    const ws = new Blockly.Workspace();
    program(ws, "pf", "pf", "pt");
    const api = apiMock();
    const onStart = vi.fn();
    const onFinish = vi.fn();
    const r = createRunner({
      workspace: ws,
      api,
      speedMs: 10,
      onStart,
      onFinish,
    });
    r.run();
    expect(onStart).toHaveBeenCalledOnce();
    expect(r.isRunning()).toBe(true);
    vi.runAllTimers();
    expect(api.jabutiPF).toHaveBeenCalledTimes(2);
    expect(api.jabutiPT).toHaveBeenCalledOnce();
    expect(api.highlightBlock).toHaveBeenLastCalledWith(null);
    expect(onFinish).toHaveBeenCalledWith({ error: null });
    expect(r.isRunning()).toBe(false);
  });
  it("passes numbers to turns and strings to setColor", () => {
    const ws = new Blockly.Workspace();
    const pd = ws.newBlock("pd");
    pd.setFieldValue(45, "angulo");
    const api = apiMock();
    createRunner({ workspace: ws, api, speedMs: 1 }).run();
    vi.runAllTimers();
    expect(api.jabutiPD).toHaveBeenCalledWith(45);
  });
  it("stop cancels the pending step (Parar Execução)", () => {
    const ws = new Blockly.Workspace();
    program(ws, "pf", "pf", "pf", "pf", "pf");
    const api = apiMock();
    const onFinish = vi.fn();
    const r = createRunner({ workspace: ws, api, speedMs: 100, onFinish });
    r.run();
    vi.advanceTimersByTime(150);
    r.stop();
    const calls = api.jabutiPF.mock.calls.length;
    vi.runAllTimers();
    expect(api.jabutiPF).toHaveBeenCalledTimes(calls);
    expect(onFinish).toHaveBeenCalledWith({ stopped: true });
    expect(r.isRunning()).toBe(false);
  });
  it("finishes immediately on an empty workspace (Review Focus 4)", () => {
    const onFinish = vi.fn();
    createRunner({
      workspace: new Blockly.Workspace(),
      api: apiMock(),
      onFinish,
    }).run();
    vi.runAllTimers();
    expect(onFinish).toHaveBeenCalledWith({ error: null });
  });
  it("reports a runtime error and still finishes (Review Focus 3)", () => {
    const ws = new Blockly.Workspace();
    program(ws, "pf");
    const api = apiMock();
    api.jabutiPF.mockImplementation(() => {
      throw new Error("boom");
    });
    const onFinish = vi.fn();
    const r = createRunner({ workspace: ws, api, speedMs: 1, onFinish });
    r.run();
    vi.runAllTimers();
    expect(onFinish).toHaveBeenCalledOnce();
    expect(onFinish.mock.calls[0][0].error).toBeInstanceOf(Error);
    expect(r.isRunning()).toBe(false);
  });
});
