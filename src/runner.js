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
    let more;
    try {
      more = interpreter.step();
    } catch (error) {
      finish({ error });
      return;
    }
    if (more) {
      timer = timers.setTimeout(step, speed);
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
    timer = timers.setTimeout(step, speed);
  };

  const stop = () => {
    if (!running) return;
    if (timer !== null) timers.clearTimeout(timer);
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
