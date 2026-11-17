# Jabuti Example Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Jabuti opens with an empty workspace, pre-load a small example program (trail colour cyan, then `repita 36 vezes { pf; pd 15° }`) so a first-time player can press "Executar" and see a circle.

**Architecture:** A data module `src/blocks/example.js` holds the program as Blockly 13 workspace-serialization JSON. `src/main.js` loads it with `Blockly.serialization.workspaces.load` right after `inject` when the workspace has no blocks. No persistence, no flag.

**Tech Stack:** Blockly 13 serialization API, Vitest (jsdom, because the state instantiates a `colour_picker`).

**Spec:** short design agreed in chat on 2026-11-16 (owner approved): load whenever the workspace is empty at open; include the colour block; example = cyan `#00CCFF` + 36 × (`pf`, `pd` 15°); README gets one line; screenshot refreshed.

## Global Constraints

- Plain JavaScript, ES modules; Prettier defaults; `npm run lint && npm run format:check && npm test && npm run build` green.
- Generated code for the example must be exactly: `setColor('#00ccff');\nfor (var count = 0; count < 36; count++) {\n  jabutiPF(1);\n  jabutiPD(15);\n}\n` (verified with a probe on 2026-11-16; `#00ccff` lower-case is how `colour_picker` stores it).
- The example loads only when `workspace.getAllBlocks(false).length === 0`; "Limpar Tela", undo/redo and everything else unchanged.
- Commits: `whaletalent` noreply author, SSH-signed, conventional-commit style, English. Work on branch `feat/example-program`, PR against `main`, merge when CI is green, verify the live site.

## Review Focus

1. A workspace that is not empty at open (e.g. Blockly restoring state in a future version) must not get the example appended — pinned in Task 1 (`load` is skipped when blocks exist).
2. The example must reference only block types the toolbox defines — pinned in Task 1 (every type in the state exists in `Blockly.Blocks`).
3. Pressing "Executar" on the example must draw: the generated code must call the five API names with the values above — pinned in Task 1 (exact code string).
4. Clearing the workspace must leave it empty (no auto-reload of the example mid-session) — pinned in Task 1 (`loadExampleIfEmpty` is a one-shot call at boot; test that calling it on a workspace after `clear()` is NOT done by main.js is a structural check: the function is called once in `main.js`).
5. The README must describe the behaviour truthfully — Task 2.

---

### Task 1: Example state module + boot loading + tests

**Files:**
- Create: `src/blocks/example.js`
- Modify: `src/main.js` (right after `Blockly.inject(...)`)
- Test: `tests/example.test.js`

**Interfaces:**
- `export const exampleState` — the JSON object below.
- `export function loadExampleIfEmpty(workspace)` → returns `true` when it loaded the example, `false` when the workspace already had blocks.

Example state (exact):

```js
export const exampleState = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: "color",
        x: 20,
        y: 20,
        inputs: { NAME: { block: { type: "colour_picker", fields: { COLOUR: "#00ccff" } } } },
        next: {
          block: {
            type: "controls_repeat_ext",
            inputs: {
              TIMES: { shadow: { type: "math_number", fields: { NUM: 36 } } },
              DO: { block: { type: "pf", next: { block: { type: "pd", fields: { angulo: 15 } } } } },
            },
          },
        },
      },
    ],
  },
};
```

- [ ] **Step 1: Write the failing test**

```js
// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { setupBlockly } from "../src/blocks/setup.js";
import { exampleState, loadExampleIfEmpty } from "../src/blocks/example.js";

beforeAll(() => setupBlockly());

const EXPECTED =
  "setColor('#00ccff');\nfor (var count = 0; count < 36; count++) {\n  jabutiPF(1);\n  jabutiPD(15);\n}\n";

const types = (node, acc = new Set()) => {
  if (!node || typeof node !== "object") return acc;
  if (node.type) acc.add(node.type);
  for (const v of Object.values(node)) types(v, acc);
  return acc;
};

describe("example program", () => {
  it("loads into an empty workspace and generates the circle program", () => {
    const ws = new Blockly.Workspace();
    expect(loadExampleIfEmpty(ws)).toBe(true);
    expect(ws.getTopBlocks(false)).toHaveLength(1);
    expect(javascriptGenerator.workspaceToCode(ws)).toBe(EXPECTED);
  });
  it("does nothing when the workspace already has blocks (Review Focus 1)", () => {
    const ws = new Blockly.Workspace();
    ws.newBlock("pf");
    expect(loadExampleIfEmpty(ws)).toBe(false);
    expect(ws.getAllBlocks(false)).toHaveLength(1);
  });
  it("only uses defined block types (Review Focus 2)", () => {
    for (const t of types(exampleState)) expect(Blockly.Blocks[t], t).toBeDefined();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/example.test.js`
Expected: FAIL, cannot resolve `../src/blocks/example.js`.

- [ ] **Step 3: Implement `src/blocks/example.js`**

`loadExampleIfEmpty(workspace)`: `if (workspace.getAllBlocks(false).length > 0) return false; Blockly.serialization.workspaces.load(exampleState, workspace); return true;` (import `* as Blockly from "blockly"`).

- [ ] **Step 4: Wire it in `src/main.js`**

Immediately after `const workspace = Blockly.inject(...)`: `loadExampleIfEmpty(workspace);` (one call, at boot only). Import from `./blocks/example.js`.

- [ ] **Step 5: Run tests, lint, format, build**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green; test count rises by 3.

- [ ] **Step 6: Commit**

```bash
git checkout -b feat/example-program
git add src/blocks/example.js src/main.js tests/example.test.js
git commit -m "feat: open with an example program (cyan circle) when the workspace is empty"
```

---

### Task 2: README line, screenshot, PR, merge, live check

**Files:**
- Modify: `README.md` (one sentence in the "What it is" or "Run locally" area: the app opens with a ready-made example, a cyan circle, that you can run, edit or clear)
- Replace: `docs/screenshot.png` (same framing, now showing the pre-loaded example and its cyan circle after one run)

- [ ] **Step 1: README sentence**, then `npm run format && npm run format:check`.

- [ ] **Step 2: Screenshot**: `npm run dev`, open `http://localhost:5173/jabuti/` in a fresh tab with the Chrome tools, dismiss the tutorial, press "Executar", wait for the circle, capture the page and save it to `docs/screenshot.png`; close the tab, stop the server. If the Chrome tools cannot save to disk, report and the controller captures it.

- [ ] **Step 3: Commit, push, PR, merge**

```bash
git add README.md docs/screenshot.png
git commit -m "docs: mention the pre-loaded example and refresh the screenshot"
git push -u origin feat/example-program
GH_TOKEN=$(gh auth token -u whaletalent) gh pr create -R whaletalent/jabuti --base main --title "Open with an example program" --body "Loads a small example (cyan circle: colour + repeat 36 { pf; pd 15° }) whenever the workspace is empty at open, so first-time players can press Executar right away. No persistence."
GH_TOKEN=$(gh auth token -u whaletalent) gh pr checks --watch
GH_TOKEN=$(gh auth token -u whaletalent) gh pr merge --merge --delete-branch
git checkout main && git pull
```

- [ ] **Step 4: Live check** after the deploy run succeeds: open `https://whaletalent.github.io/jabuti/`, confirm the example is on screen at load, "Executar" draws a cyan circle, "Limpar Tela" (not clicked in automation; confirm dialog) is unchanged, no console errors.
