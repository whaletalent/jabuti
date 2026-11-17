import Interpreter from "js-interpreter";
import { javascriptGenerator } from "blockly/javascript";

const CONVERTERS = {
  jabutiPF: () => [],
  jabutiPT: () => [],
  jabutiPD: (args) => [Number(args[0])],
  jabutiPE: (args) => [Number(args[0])],
  setColor: (args) => [String(args[0])],
  highlightBlock: (args) => [args[0]],
};

export function createRunner({
  workspace,
  api,
  speedMs = 30,
  onStart = () => {},
  onFinish = () => {},
  timers = { setTimeout, clearTimeout },
}) {
  const { setTimeout: later, clearTimeout: cancel } = timers;
  let interpreter = null;
  let timer = null;
  let running = false;
  let speed = speedMs;

  const finish = (result) => {
    running = false;
    timer = null;
    interpreter = null;
    api.highlightBlock(null);
    onFinish(result);
  };

  const step = () => {
    timer = null;
    if (!running) return;
    // speed > 0: one interpreter step every `speed` ms.
    // speed <= 0 ("turbo"): several steps per tick with no delay.
    const batch = speed > 0 ? 1 : 1 + Math.ceil(-speed / 5);
    let more = true;
    try {
      for (let i = 0; i < batch && more; i++) more = interpreter.step();
    } catch (error) {
      finish({ error });
      return;
    }
    if (more) {
      timer = later(step, Math.max(speed, 0));
    } else {
      finish({ error: null });
    }
  };

  const run = () => {
    if (running) return;
    javascriptGenerator.STATEMENT_PREFIX = "highlightBlock(%1);\n";
    javascriptGenerator.addReservedWords("highlightBlock,code");
    const code = javascriptGenerator.workspaceToCode(workspace);
    interpreter = new Interpreter(code, (interp, globalScope) => {
      for (const [name, convert] of Object.entries(CONVERTERS)) {
        interp.setProperty(
          globalScope,
          name,
          interp.createNativeFunction((...args) => api[name](...convert(args))),
        );
      }
    });
    running = true;
    onStart();
    timer = later(step, Math.max(speed, 0));
  };

  const stop = () => {
    if (!running) return;
    if (timer !== null) cancel(timer);
    finish({ stopped: true });
  };

  return {
    run,
    stop,
    setSpeed: (ms) => {
      speed = ms;
    },
    isRunning: () => running,
  };
}
