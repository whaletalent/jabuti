# Jabuti Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Jabuti block-programming turtle game as a plain-JavaScript Vite project with Blockly 13, Phaser 4 and JS-Interpreter from npm, with lint/tests/CI and automatic deploy to GitHub Pages at `https://whaletalent.github.io/jabuti/`.

**Architecture:** `index.html` + `src/main.js` wire four independent modules: pure turtle state (`src/game/turtle.js`), Blockly block definitions/generators/toolbox (`src/blocks/*`), a JS-Interpreter runner that steps generated code on a timer (`src/runner.js`), and a Phaser 4 scene that draws the turtle and stamps the trail (`src/game/scene.js`). The runner calls an `api` object; `main.js` binds that API to the scene. Everything except the Phaser scene is testable headless in Node with Vitest.

**Tech Stack:** Node 24 (nvm), npm, Vite 8, Blockly 13 (+ `@blockly/field-angle`, `@blockly/field-colour`), Phaser 4.2, js-interpreter 6, Vitest 5, ESLint 10 (flat config), Prettier 3, GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-11-16-jabuti-modernization-design.md`

## Global Constraints

- Plain JavaScript, ES modules. No TypeScript, no UI framework.
- Vite `base` is `/jabuti/`. Every runtime asset URL is built from `import.meta.env.BASE_URL`.
- Generated API names are fixed: `jabutiPF`, `jabutiPT`, `jabutiPD(deg)`, `jabutiPE(deg)`, `setColor('#rrggbb')`, `highlightBlock(id)`. Right turn adds degrees, left subtracts.
- Step length default **8 px**, configurable 1..32 via a slider `#passo`. Speed: `speedMs = 55 − slider`, slider `#velocidade` 5..50 step 5 default 25.
- Toolbox: seven categories in this order and these exact block lists (ported from the legacy `public/turtle.html` XML, lines 24–205 of the pre-rewrite tree, tag `v1-legacy`): Movimento, Lógica, Repetição, Matemática, Cores, Variáveis (custom `VARIABLE`), Funções (custom `PROCEDURE`).
- Blockly UI locale pt-BR; horizontal toolbox, trashcan, scrollbars.
- Program end re-enables "Executar"; "Parar Execução" clears the trail, resets heading to 0, re-centres, colour white, re-enables "Executar".
- Trail: one 16×16 stamp per move, tinted with the current colour.
- Commits: author `whaletalent <40327368+whaletalent@users.noreply.github.com>`, SSH-signed, English, conventional-commit style. Work on branch `modernize/vite-phaser4-blockly13`; default branch becomes `main`.
- Node version pinned by `.nvmrc` = `24`. Run every `npm` command after `source ~/.nvm/nvm.sh && nvm use`.
- Legacy code stays browsable at tag `v1-legacy`; the rewrite deletes it from the working tree.

## Review Focus

1. A colour value that is not `#rrggbb` (the Cores `text` block accepts anything) → trail colour falls back to white, program keeps running. Test in Task 2.
2. A turn amount that is not a number (a variable holding text passed to `pdv`) → treated as 0, heading never becomes `NaN`. Test in Task 2.
3. A program that throws at runtime (e.g. calling an undefined function in a Funções block) → "Executar" is re-enabled, stop button disabled, no stuck state. Test in Task 5.
4. "Executar" with an empty workspace → finishes immediately, "Executar" re-enabled. Test in Task 5.
5. Under the `/jabuti/` base path, block icons and sprites must still load → block image `src` values start with `/jabuti/assets/`. Test in Task 3.

---

### Task 1: Account, legacy tag, branch rename, project scaffold and tooling

**Files:**
- Modify: `~/.gitconfig-pessoal` (user.email)
- Create: `package.json`, `vite.config.js`, `.nvmrc`, `.editorconfig`, `.gitignore`, `.prettierrc`, `.prettierignore`, `eslint.config.js`, `LICENSE`, `index.html`, `src/main.js`, `tests/smoke.test.js`
- Delete: `app.js`, `app/`, `Procfile`, `package-lock.json` (regenerated)

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`; Vitest config with `base: '/jabuti/'` so `import.meta.env.BASE_URL === '/jabuti/'` in tests.

- [ ] **Step 1: Point the personal git profile at the account's noreply address**

```bash
git config --file ~/.gitconfig-pessoal user.email 40327368+whaletalent@users.noreply.github.com
git config --file ~/.gitconfig-pessoal user.name whaletalent
cd ~/Work/Pessoal/jabuti && git config user.email   # expect the noreply address
```

- [ ] **Step 2: Tag the legacy tip and rename the default branch**

```bash
cd ~/Work/Pessoal/jabuti
git tag -a v1-legacy -m "Last commit of the 2019 Express + vendored Phaser 2/Blockly version" master
git push origin v1-legacy
GH_TOKEN=$(gh auth token -u whaletalent) gh api -X POST repos/whaletalent/jabuti/branches/master/rename -f new_name=main
git fetch origin && git branch -m master main && git branch -u origin/main main
git remote set-head origin -a
git checkout -b modernize/vite-phaser4-blockly13
```
Expected: `git branch -vv` shows `main` tracking `origin/main`; `gh repo view whaletalent/jabuti --json defaultBranchRef --jq .defaultBranchRef.name` prints `main`.

- [ ] **Step 3: Remove the Express server and write the scaffold**

Delete `app.js`, `app/`, `Procfile`, `package-lock.json`. Write:

- `package.json`: name `jabuti`, version `2.0.0`, `"type": "module"`, `"private": true`, author `whaletalent`, license `MIT`, `"engines": { "node": ">=24" }`, scripts as in Interfaces (`test` = `vitest run`, `test:watch` = `vitest`, `format:check` = `prettier --check .`, `lint` = `eslint .`).
- `vite.config.js`: `export default defineConfig({ base: '/jabuti/', test: { environment: 'node' } })` (Vitest reads the `test` key from the Vite config; use `import { defineConfig } from 'vitest/config'`).
- `.nvmrc` = `24`; `.editorconfig` (utf-8, lf, 2 spaces, final newline); `.gitignore` (`node_modules`, `dist`, `.DS_Store`, `*.log`, `.vite`); `.prettierrc` = `{}` (Prettier defaults); `.prettierignore` (`dist`, `package-lock.json`, `public/assets`); `eslint.config.js` with `@eslint/js` recommended, `globals.browser`, `eslint-config-prettier`, ignores `dist/`.
- `LICENSE`: MIT, `Copyright (c) 2019-2026 whaletalent`.
- `index.html`: minimal shell (`<div id="app"></div>`, `<script type="module" src="/src/main.js">`), title `Jabuti`, favicon `assets/jabuti.png` via `%BASE_URL%`-free relative href `./assets/jabuti.png` (Vite rewrites it under `base`).
- `src/main.js`: `console.log('jabuti')` placeholder.
- `tests/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest'
describe('build config', () => {
  it('serves under the /jabuti/ base path', () => {
    expect(import.meta.env.BASE_URL).toBe('/jabuti/')
  })
})
```

- [ ] **Step 4: Install dependencies**

```bash
source ~/.nvm/nvm.sh && nvm use
npm i blockly@^13 @blockly/field-angle@^13 @blockly/field-colour@^13 phaser@^4 js-interpreter@^6
npm i -D vite@^8 vitest@^5 eslint@^10 @eslint/js globals eslint-config-prettier prettier@^3
```

- [ ] **Step 5: Verify the toolchain**

Run: `npm run lint && npm run format:check && npm test && npm run build`
Expected: all exit 0; `dist/index.html` references `/jabuti/assets/...`.
If `format:check` fails on files you just wrote, run `npm run format` once and re-check.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: replace Express server with Vite scaffold, lint, format and test tooling"
```

---

### Task 2: Pure turtle state

**Files:**
- Create: `src/game/turtle.js`
- Test: `tests/turtle.test.js`

**Interfaces:**
- Produces:
  - `createTurtle({ width, height, step = 8 })` → `{ x, y, heading, colour, step, width, height }` with `x = width/2`, `y = height/2`, `heading = 0`, `colour = 0xffffff`.
  - `forward(t)`, `back(t)`: move `t.step` px along `heading` (degrees, 0 = +x, clockwise positive, y down), clamp `x` to `[8, width-8]` and `y` to `[8, height-8]`. Return `t` (mutated).
  - `turnRight(t, deg)`, `turnLeft(t, deg)`: add / subtract `Number(deg)`; non-finite → 0. No normalisation.
  - `setColour(t, value)`: accepts `'#rrggbb'` (case-insensitive) → `t.colour = 0xrrggbb`; anything else → `0xffffff`. Returns the number.
  - `setStep(t, n)`: integer clamp 1..32; non-finite → 8.
  - `reset(t)`: centre, heading 0, colour white, keep step.
  - `WHITE = 0xffffff`, `DEFAULT_STEP = 8`, `MIN_STEP = 1`, `MAX_STEP = 32`.

- [ ] **Step 1: Write the failing tests**

```js
import { describe, it, expect } from 'vitest'
import { createTurtle, forward, back, turnRight, turnLeft, setColour, setStep, reset, WHITE } from '../src/game/turtle.js'

const make = () => createTurtle({ width: 400, height: 300 })

describe('turtle', () => {
  it('starts centred, facing right, white, step 8', () => {
    expect(make()).toMatchObject({ x: 200, y: 150, heading: 0, colour: WHITE, step: 8 })
  })
  it('moves 8px along heading 0 and 90', () => {
    const t = make(); forward(t); expect([t.x, t.y]).toEqual([208, 150])
    turnRight(t, 90); forward(t); expect([Math.round(t.x), Math.round(t.y)]).toEqual([208, 158])
    back(t); expect([Math.round(t.x), Math.round(t.y)]).toEqual([208, 150])
  })
  it('right adds, left subtracts, no normalisation', () => {
    const t = make(); turnRight(t, 90); turnLeft(t, 180); expect(t.heading).toBe(-90)
  })
  it('treats a non-numeric turn as 0 (Review Focus 2)', () => {
    const t = make(); turnRight(t, 'abc'); turnLeft(t, undefined); expect(t.heading).toBe(0)
  })
  it('clamps to the canvas', () => {
    const t = make(); t.x = 395; forward(t); expect(t.x).toBe(392)
    t.heading = 180; t.x = 3; forward(t); expect(t.x).toBe(8)
  })
  it('parses #rrggbb and falls back to white (Review Focus 1)', () => {
    const t = make()
    expect(setColour(t, '#FF0000')).toBe(0xff0000)
    expect(setColour(t, 'vermelho')).toBe(WHITE)
    expect(setColour(t, '#abc')).toBe(WHITE)
  })
  it('clamps step to 1..32 and defaults to 8', () => {
    const t = make(); setStep(t, 100); expect(t.step).toBe(32); setStep(t, 0); expect(t.step).toBe(1); setStep(t, NaN); expect(t.step).toBe(8)
  })
  it('reset keeps step', () => {
    const t = make(); setStep(t, 4); forward(t); turnRight(t, 45); setColour(t, '#00ff00'); reset(t)
    expect(t).toMatchObject({ x: 200, y: 150, heading: 0, colour: WHITE, step: 4 })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/turtle.test.js`
Expected: FAIL, cannot resolve `../src/game/turtle.js`.

- [ ] **Step 3: Implement `src/game/turtle.js` with the signatures above**

Movement: `const rad = (t.heading * Math.PI) / 180; t.x = clamp(t.x + dir * t.step * Math.cos(rad), 8, t.width - 8)` and likewise for `y` with `sin`. Round to 3 decimals is not needed; tests round.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/turtle.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/game/turtle.js tests/turtle.test.js
git commit -m "feat(game): pure turtle state with configurable step and colour parsing"
```

---

### Task 3: Custom blocks and JavaScript generators

**Files:**
- Create: `src/blocks/definitions.js`, `src/blocks/generators.js`, `src/blocks/setup.js`
- Move: `public/assets/pf.png`, `pt.png`, `pd.png`, `pe.png`, `tint.png` stay in `public/assets/` (served under base)
- Test: `tests/generators.test.js`

**Interfaces:**
- Consumes: Blockly from `'blockly'` (the full entry: core + blocks + `setLocale`), `javascriptGenerator` and `Order` from `'blockly/javascript'`, `registerFieldAngle` from `'@blockly/field-angle'`, `registerFieldColour` and `installAllBlocks` from `'@blockly/field-colour'`.
- Produces:
  - `TURTLE_BLOCK_TYPES = ['pf', 'pt', 'pd', 'pe', 'pdv', 'pev', 'color']`.
  - `assetUrl(name)` in `src/blocks/definitions.js`: returns `` `${import.meta.env.BASE_URL}assets/${name}` ``.
  - `defineTurtleBlocks()`: `Blockly.defineBlocksWithJsonArray([...])` — `pf`/`pt`: `field_image` 26×26 + previous/next statement, colour 185, tooltips "Move-o para frente" / "Move-o para trás". `pd`/`pe`: image + `field_angle` named `angulo` default 90, colour 290, tooltips "Gira-o para a direita" / "Gira-o para a esquerda". `pdv`/`pev`: image + `input_value` named `grau` check `Number`, inline, colour 290, tooltips "...(Aceita blocos e variáveis)". `color`: image `tint.png` + `input_value` named `NAME`, colour 20, tooltip "Modifica a cor do Rastro".
  - `installTurtleGenerators(generator = javascriptGenerator)`: sets `generator.forBlock[type]` for the seven types producing exactly: `'jabutiPF(1);\n'`, `'jabutiPT(1);\n'`, `` `jabutiPD(${angulo});\n` ``, `` `jabutiPE(${angulo});\n` ``, `` `jabutiPD(${valueToCode(block,'grau',Order.ATOMIC) || 0});\n` ``, same for `pev`→`jabutiPE`, `` `setColor(${valueToCode(block,'NAME',Order.ATOMIC) || "'#FFFFFF'"});\n` ``.
  - `setupBlockly()` in `src/blocks/setup.js`: idempotent; `Blockly.setLocale(ptBr)` (from `'blockly/msg/pt-br'`), `registerFieldAngle()`, `registerFieldColour()`, `installAllBlocks({ javascript: javascriptGenerator })`, `defineTurtleBlocks()`, `installTurtleGenerators()`. Guard with a module-level `done` flag because the field registrations throw on double registration.

- [ ] **Step 1: Write the failing tests**

```js
import { describe, it, expect, beforeAll } from 'vitest'
import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { setupBlockly } from '../src/blocks/setup.js'
import { TURTLE_BLOCK_TYPES, assetUrl } from '../src/blocks/definitions.js'

let ws
beforeAll(() => { setupBlockly(); ws = new Blockly.Workspace() })
const code = (b) => javascriptGenerator.blockToCode(b)

describe('turtle blocks', () => {
  it('defines all seven block types', () => {
    for (const t of TURTLE_BLOCK_TYPES) expect(Blockly.Blocks[t], t).toBeDefined()
  })
  it('block icons resolve under the Pages base path (Review Focus 5)', () => {
    expect(assetUrl('pf.png')).toBe('/jabuti/assets/pf.png')
  })
  it('pf / pt emit fixed calls', () => {
    expect(code(ws.newBlock('pf'))).toBe('jabutiPF(1);\n')
    expect(code(ws.newBlock('pt'))).toBe('jabutiPT(1);\n')
  })
  it('pd / pe use the angle field', () => {
    const pd = ws.newBlock('pd'); pd.setFieldValue(45, 'angulo'); expect(code(pd)).toBe('jabutiPD(45);\n')
    const pe = ws.newBlock('pe'); pe.setFieldValue(30, 'angulo'); expect(code(pe)).toBe('jabutiPE(30);\n')
  })
  it('pdv / pev take a value input and default to 0', () => {
    const pdv = ws.newBlock('pdv'); const n = ws.newBlock('math_number'); n.setFieldValue(60, 'NUM')
    pdv.getInput('grau').connection.connect(n.outputConnection)
    expect(code(pdv)).toBe('jabutiPD(60);\n')
    expect(code(ws.newBlock('pev'))).toBe('jabutiPE(0);\n')
  })
  it('color passes the colour expression through', () => {
    const c = ws.newBlock('color'); const p = ws.newBlock('colour_picker'); p.setFieldValue('#ff0000', 'COLOUR')
    c.getInput('NAME').connection.connect(p.outputConnection)
    expect(code(c)).toBe("setColor('#ff0000');\n")
  })
  it('messages are pt-BR', () => {
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toBe('repita %1 vezes')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/generators.test.js`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `definitions.js`, `generators.js`, `setup.js` per Interfaces**

Note: `blockToCode` on a statement block returns the statement string (the `STATEMENT_PREFIX` is not set in tests, so no `highlightBlock` prefix appears).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/generators.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Lint, then commit**

```bash
npm run lint && npm run format:check
git add src/blocks tests/generators.test.js
git commit -m "feat(blocks): define turtle blocks and JavaScript generators on Blockly 13"
```

---

### Task 4: Toolbox as JSON

**Files:**
- Create: `src/blocks/toolbox.js`
- Test: `tests/toolbox.test.js`
- Reference: `git show v1-legacy:public/turtle.html` lines 24–205 (the `<xml id="toolbox">`)

**Interfaces:**
- Consumes: `setupBlockly()` from Task 3.
- Produces: `export const toolbox = { kind: 'categoryToolbox', contents: [...] }`, `export const CATEGORY_NAMES = ['Movimento','Lógica','Repetição','Matemática','Cores','Variáveis','Funções']`, and `export function toolboxBlockTypes(toolbox)` returning every `type` referenced by `kind: 'block'` entries and their `inputs.*.shadow`/`block` recursively.

- [ ] **Step 1: Write the failing tests**

```js
import { describe, it, expect, beforeAll } from 'vitest'
import * as Blockly from 'blockly'
import { setupBlockly } from '../src/blocks/setup.js'
import { toolbox, CATEGORY_NAMES, toolboxBlockTypes } from '../src/blocks/toolbox.js'

beforeAll(() => setupBlockly())

describe('toolbox', () => {
  it('has the seven categories in order', () => {
    expect(toolbox.contents.map((c) => c.name)).toEqual(CATEGORY_NAMES)
  })
  it('only references defined block types', () => {
    for (const t of toolboxBlockTypes(toolbox)) expect(Blockly.Blocks[t], t).toBeDefined()
  })
  it('keeps the legacy presets', () => {
    const [mov, , rep, , cores] = toolbox.contents
    expect(mov.contents.map((b) => b.type)).toEqual(['pf', 'pt', 'pd', 'pe', 'pdv', 'pev'])
    expect(mov.contents[2].fields.angulo).toBe(0)
    expect(rep.contents[0].inputs.TIMES.shadow.fields.NUM).toBe(10)
    expect(cores.contents.map((b) => b.type)).toEqual(['color', 'colour_picker', 'colour_random', 'text', 'colour_rgb', 'colour_blend'])
    expect(cores.contents[3].fields.TEXT).toBe('#00CCFF')
  })
  it('uses the dynamic variable and procedure categories', () => {
    expect(toolbox.contents[5].custom).toBe('VARIABLE')
    expect(toolbox.contents[6].custom).toBe('PROCEDURE')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/toolbox.test.js` → FAIL, module not found.

- [ ] **Step 3: Port the XML to JSON in `src/blocks/toolbox.js`**

Mapping rules: `<category name colour>` → `{ kind: 'category', name, colour: '185' }`; `<block type>` → `{ kind: 'block', type }`; `<field name="angulo">0</field>` → `fields: { angulo: 0 }`; `<value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>` → `inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 10 } } } }`. Numeric field text becomes a number; colour/text fields stay strings. Port every block of every category, including Lógica (7 blocks), Repetição (3), Matemática (all listed in the XML: `math_number`, `math_arithmetic`, `math_number_property`, `math_modulo`, `math_constrain`, `math_random_int`, plus any others present in the XML), Cores (6).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/toolbox.test.js` → PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
npm run lint && npm run format:check
git add src/blocks/toolbox.js tests/toolbox.test.js
git commit -m "feat(blocks): port the toolbox from XML to JSON"
```

---

### Task 5: Interpreter runner

**Files:**
- Create: `src/runner.js`
- Test: `tests/runner.test.js`

**Interfaces:**
- Consumes: `Interpreter` default export of `'js-interpreter'`; `javascriptGenerator` from `'blockly/javascript'`; a Blockly `Workspace`.
- Produces: `createRunner({ workspace, api, speedMs = 30, onStart = () => {}, onFinish = () => {}, timers = { setTimeout, clearTimeout } })` → `{ run(), stop(), setSpeed(ms), isRunning() }`.
  - `api` keys: `jabutiPF`, `jabutiPT`, `jabutiPD`, `jabutiPE`, `setColor`, `highlightBlock`. Each is exposed to the interpreter as a native function; arguments are passed through as JS primitives (`String(arg)` for `setColor`, `Number(arg)` for turns, the raw id string for `highlightBlock`).
  - `run()`: if running, no-op. Sets `javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n'`, `addReservedWords('highlightBlock,code')`, builds code with `workspaceToCode(workspace)`, creates the interpreter, calls `onStart()`, then schedules `step` every `speedMs` with `timers.setTimeout`. When `interpreter.step()` returns false, or throws, calls `api.highlightBlock(null)` then `onFinish({ error })` (`error` is the thrown value or `null`) and marks not running.
  - `stop()`: clears the pending timer, `api.highlightBlock(null)`, marks not running, calls `onFinish({ stopped: true })` only if it was running.
  - `setSpeed(ms)`: takes effect on the next scheduled step.

- [ ] **Step 1: Write the failing tests**

```js
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import * as Blockly from 'blockly'
import { setupBlockly } from '../src/blocks/setup.js'
import { createRunner } from '../src/runner.js'

const apiMock = () => ({ jabutiPF: vi.fn(), jabutiPT: vi.fn(), jabutiPD: vi.fn(), jabutiPE: vi.fn(), setColor: vi.fn(), highlightBlock: vi.fn() })
const program = (ws, ...types) => {
  let prev
  for (const t of types) { const b = ws.newBlock(t); if (prev) prev.nextConnection.connect(b.previousConnection); prev = b }
}

beforeAll(() => setupBlockly())
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('runner', () => {
  it('runs a program step by step and finishes', () => {
    const ws = new Blockly.Workspace(); program(ws, 'pf', 'pf', 'pt')
    const api = apiMock(); const onStart = vi.fn(); const onFinish = vi.fn()
    const r = createRunner({ workspace: ws, api, speedMs: 10, onStart, onFinish })
    r.run(); expect(onStart).toHaveBeenCalledOnce(); expect(r.isRunning()).toBe(true)
    vi.runAllTimers()
    expect(api.jabutiPF).toHaveBeenCalledTimes(2); expect(api.jabutiPT).toHaveBeenCalledOnce()
    expect(api.highlightBlock).toHaveBeenLastCalledWith(null)
    expect(onFinish).toHaveBeenCalledWith({ error: null }); expect(r.isRunning()).toBe(false)
  })
  it('passes numbers to turns and strings to setColor', () => {
    const ws = new Blockly.Workspace(); const pd = ws.newBlock('pd'); pd.setFieldValue(45, 'angulo')
    const api = apiMock(); createRunner({ workspace: ws, api, speedMs: 1 }).run(); vi.runAllTimers()
    expect(api.jabutiPD).toHaveBeenCalledWith(45)
  })
  it('stop cancels the pending step (Parar Execução)', () => {
    const ws = new Blockly.Workspace(); program(ws, 'pf', 'pf', 'pf', 'pf', 'pf')
    const api = apiMock(); const onFinish = vi.fn()
    const r = createRunner({ workspace: ws, api, speedMs: 100, onFinish }); r.run(); vi.advanceTimersByTime(150); r.stop()
    const calls = api.jabutiPF.mock.calls.length; vi.runAllTimers()
    expect(api.jabutiPF).toHaveBeenCalledTimes(calls); expect(onFinish).toHaveBeenCalledWith({ stopped: true }); expect(r.isRunning()).toBe(false)
  })
  it('finishes immediately on an empty workspace (Review Focus 4)', () => {
    const onFinish = vi.fn(); createRunner({ workspace: new Blockly.Workspace(), api: apiMock(), onFinish }).run(); vi.runAllTimers()
    expect(onFinish).toHaveBeenCalledWith({ error: null })
  })
  it('reports a runtime error and still finishes (Review Focus 3)', () => {
    const ws = new Blockly.Workspace(); program(ws, 'pf')
    const api = apiMock(); api.jabutiPF.mockImplementation(() => { throw new Error('boom') })
    const onFinish = vi.fn(); const r = createRunner({ workspace: ws, api, speedMs: 1, onFinish }); r.run(); vi.runAllTimers()
    expect(onFinish).toHaveBeenCalledOnce(); expect(onFinish.mock.calls[0][0].error).toBeInstanceOf(Error); expect(r.isRunning()).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail** → `npm test -- tests/runner.test.js` → FAIL, module not found.

- [ ] **Step 3: Implement `src/runner.js` per Interfaces**

Native-function wrapping: `interpreter.setProperty(scope, name, interpreter.createNativeFunction((...args) => api[name](...args.map(convert))))`. An exception thrown inside a native function propagates out of `interpreter.step()`; catch it in the step loop.

- [ ] **Step 4: Run tests to verify they pass** → PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
npm run lint && npm run format:check
git add src/runner.js tests/runner.test.js
git commit -m "feat(runner): step Blockly-generated code through JS-Interpreter with stop and error handling"
```

---

### Task 6: Phaser 4 scene and game factory

**Files:**
- Create: `src/game/scene.js`, `src/game/createGame.js`
- Assets: keep `public/assets/fundo.png`, `trail.png`, `jabuti.png`

**Interfaces:**
- Consumes: turtle functions from Task 2 (`forward`, `back`, `turnRight`, `turnLeft`, `setColour`, `reset`).
- Produces:
  - `class TurtleScene extends Phaser.Scene` (key `'turtle'`). `init({ turtle })` stores the turtle. `preload()` loads `fundo`, `trail`, `jabuti` from `` `${import.meta.env.BASE_URL}assets/…` ``. `create()`: `this.add.tileSprite(0,0,w,h,'fundo').setOrigin(0)`, `this.trail = this.add.renderTexture(0,0,w,h).setOrigin(0)`, `this.player = this.add.image(turtle.x, turtle.y, 'jabuti')`. Methods: `moveForward()`, `moveBack()` (call the turtle fn, then `stampTrail()`), `turnRight(deg)`, `turnLeft(deg)`, `setColour(hex)`, `resetScene()` (`reset(turtle)`, `this.trail.clear()`), `stampTrail()` = `this.trail.stamp('trail', 0, turtle.x, turtle.y, { tint: turtle.colour, originX: 0.5, originY: 0.5 })`. `update()` syncs `player.x/y` and `player.angle = turtle.heading`.
  - `createGame({ parent, turtle })` → `Phaser.Game` with `{ type: Phaser.AUTO, parent, width, height, pixelArt: true, backgroundColor: '#212529', scene: [TurtleScene] }` where `width/height` come from `parent.clientWidth/clientHeight` (fallback 800×600 if 0). Starts the scene with `{ turtle }` and returns `{ game, getScene: () => game.scene.getScene('turtle') }`.

- [ ] **Step 1: Implement the two files per Interfaces**

(No headless test: Phaser needs a browser. Verification is Task 7's browser check.)

- [ ] **Step 2: Build to prove it bundles**

Run: `npm run lint && npm run build`
Expected: exit 0, `dist/assets/*.js` present, no "Phaser is not defined" style errors.

- [ ] **Step 3: Commit**

```bash
git add src/game/scene.js src/game/createGame.js
git commit -m "feat(game): Phaser 4 scene drawing the turtle and stamping its trail"
```

---

### Task 7: UI, CSS port, `main.js`, and removal of the legacy tree

**Files:**
- Create: `src/ui.js`, `src/styles/main.css`
- Modify: `index.html`, `src/main.js`
- Rename: `public/assets/tutorial` → `public/assets/tutorial.png`
- Delete: `public/turtle.html`, `public/blockly/`, `public/phaser/`, `public/acorn/`, `public/js/`, `public/styles/` (after porting `main.scss`), `public/fonts/` only if unused by the CSS (the legacy SCSS references `arcade.ttf`/`retro.ttf`; keep and reference them if it does)
- Reference: `git show v1-legacy:public/styles/main.scss`, `git show v1-legacy:public/turtle.html`

**Interfaces:**
- Consumes: `setupBlockly`, `toolbox`, `createTurtle`/`setStep`, `createGame`, `createRunner`.
- Produces: `bindUi({ runner, workspace, scene, turtle, doc = document })` in `src/ui.js`, wiring these ids: `#play` → `runner.run()`, `#stop` → `runner.stop(); scene.resetScene()`, `#clear` → `if (confirm('Remover os blocos da tela?')) workspace.clear()`, `#undo` → `workspace.undo(false)`, `#redo` → `workspace.undo(true)`, `#velocidade` (`input`) → `runner.setSpeed(55 - Number(value))`, `#passo` (`input`) → `setStep(turtle, Number(value))` and updates `#passo-valor` text; `#preloader` fades after 1000 ms then `visibility: hidden` after 500 ms more; `#tutorial` hides on click. Exposes `setRunning(bool)` that disables `#play` and enables `#stop` while running, and the inverse when not.
- `index.html` structure (ids above plus): `.warning p` (text "Jabuti app não funciona em dispositivos com largura de tela inferior à 600px"), `#preloader > .img > img#loader`, `.app > img#tutorial.tutorial`, `.toolbox > #blocklyDiv`, `.botoes` with the five buttons (labels "Executar", "Parar Execução", "Limpar Tela", "Desfazer", "Refazer" with their png icons) and two `.velocidade` groups ("Velocidade de Execução" range 5..50 step 5 value 25; "Tamanho do passo" range 1..32 value 8 with `<output id="passo-valor">8</output>`), then `#simulacao`.
- `src/main.js`: `setupBlockly()`; `const workspace = Blockly.inject('blocklyDiv', { toolbox, trashcan: true, horizontalLayout: true, scrollbars: true })`; `const turtle = createTurtle({ width, height })` from `#simulacao` size; `const { getScene } = createGame({ parent, turtle })`; once the scene is ready (`game.events.once('ready')` or scene `create` callback), build `api` = `{ jabutiPF: () => scene.moveForward(), jabutiPT: () => scene.moveBack(), jabutiPD: (d) => scene.turnRight(d), jabutiPE: (d) => scene.turnLeft(d), setColor: (c) => scene.setColour(c), highlightBlock: (id) => workspace.highlightBlock(id) }`; `createRunner({ workspace, api, speedMs: 30, onStart: () => ui.setRunning(true), onFinish: () => ui.setRunning(false) })`; `bindUi(...)`.

- [ ] **Step 1: Write the UI test for the running state and the speed/step mapping**

```js
// tests/ui.test.js  — uses jsdom: add `// @vitest-environment jsdom` on line 1 and `npm i -D jsdom`
import { describe, it, expect, vi } from 'vitest'
import { bindUi } from '../src/ui.js'

const dom = () => {
  document.body.innerHTML = `
    <button id="play"></button><button id="stop" disabled></button><button id="clear"></button>
    <button id="undo"></button><button id="redo"></button>
    <input id="velocidade" type="range" value="25"><input id="passo" type="range" value="8"><output id="passo-valor">8</output>
    <div id="preloader"></div><img id="tutorial">`
}
const deps = () => ({ runner: { run: vi.fn(), stop: vi.fn(), setSpeed: vi.fn() }, workspace: { clear: vi.fn(), undo: vi.fn() }, scene: { resetScene: vi.fn() }, turtle: { step: 8 } })

describe('ui', () => {
  it('toggles buttons with setRunning', () => {
    dom(); const ui = bindUi(deps()); ui.setRunning(true)
    expect(document.getElementById('play').disabled).toBe(true); expect(document.getElementById('stop').disabled).toBe(false)
    ui.setRunning(false); expect(document.getElementById('play').disabled).toBe(false); expect(document.getElementById('stop').disabled).toBe(true)
  })
  it('maps the speed slider to 55 - value and the step slider to the turtle', () => {
    dom(); const d = deps(); bindUi(d)
    const v = document.getElementById('velocidade'); v.value = '50'; v.dispatchEvent(new Event('input'))
    expect(d.runner.setSpeed).toHaveBeenCalledWith(5)
    const p = document.getElementById('passo'); p.value = '12'; p.dispatchEvent(new Event('input'))
    expect(d.turtle.step).toBe(12); expect(document.getElementById('passo-valor').textContent).toBe('12')
  })
  it('stop resets the scene and undo/redo map to workspace.undo', () => {
    dom(); const d = deps(); bindUi(d)
    document.getElementById('stop').click(); expect(d.runner.stop).toHaveBeenCalledOnce(); expect(d.scene.resetScene).toHaveBeenCalledOnce()
    document.getElementById('redo').click(); expect(d.workspace.undo).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 2: Run to verify it fails** → `npm i -D jsdom && npm test -- tests/ui.test.js` → FAIL, module not found.

- [ ] **Step 3: Implement `src/ui.js`, port `main.scss` → `src/styles/main.css`, rewrite `index.html`, write `src/main.js`, rename `tutorial` → `tutorial.png`, delete the legacy tree**

CSS port: Sass variables become `:root` custom properties (`--dark-primary: #212529; --text-color: #ddd; --blockly-green…`), nesting flattened, vendor-prefixed transforms dropped, `@media (max-width: 600px)` block kept. Import the CSS from `main.js`.

- [ ] **Step 4: Run all tests and the build**

Run: `npm test && npm run lint && npm run format:check && npm run build`
Expected: all green; `git status` shows `public/blockly`, `public/phaser`, `public/acorn`, `public/js`, `public/styles`, `public/turtle.html` deleted.

- [ ] **Step 5: Browser check of the full game**

Run `npm run dev` in the background, open `http://localhost:5173/jabuti/` with the Chrome tools, and verify: (a) toolbox shows the seven categories in pt-BR, (b) dragging `repita 10 vezes` with `pf` + `pd 90` inside and pressing "Executar" draws a dotted square-ish path with highlighted blocks, (c) "Executar" is enabled again when it ends and a second run adds to the drawing, (d) "Parar Execução" clears the trail and re-centres, (e) the step slider changes how far one `pf` goes, (f) console has no errors. Save a screenshot of a finished drawing to `docs/screenshot.png` (used by the README).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(app): wire Blockly, runner and Phaser scene in a Vite app; remove vendored legacy tree"
```

---

### Task 8: CI, Dependabot, Pages workflow, PR

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/dependabot.yml`

**Interfaces:**
- `ci.yml`: `on: [push, pull_request]`, job `checks` on `ubuntu-latest`: `actions/checkout`, `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`, then `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`. Concurrency group per ref, cancel-in-progress.
- `deploy.yml`: `on: push: branches: [main]` + `workflow_dispatch`; `permissions: { contents: read, pages: write, id-token: write }`; job `build` (same setup + `npm ci` + `npm run build` + `actions/upload-pages-artifact` with `path: dist`), job `deploy` (`needs: build`, `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`, `actions/deploy-pages` id `deployment`). Concurrency group `pages`, no cancel.
- `dependabot.yml`: version 2; `npm` at `/` monthly, groups `minor-and-patch` (`update-types: [minor, patch]`); `github-actions` at `/` monthly.
- Use the current major tag of each action (`@v4`/`@v5`/`@v3` as published today; check with `gh api repos/actions/<name>/releases/latest --jq .tag_name`).

- [ ] **Step 1: Write the three files per Interfaces**

- [ ] **Step 2: Validate the YAML locally**

Run: `npx --yes action-validator .github/workflows/ci.yml .github/workflows/deploy.yml` (or `python3 -c "import yaml,sys;[yaml.safe_load(open(f)) for f in sys.argv[1:]]" .github/workflows/*.yml .github/dependabot.yml` if the validator is unavailable).
Expected: no errors.

- [ ] **Step 3: Enable Pages with the GitHub Actions build type**

```bash
GH_TOKEN=$(gh auth token -u whaletalent) gh api -X POST repos/whaletalent/jabuti/pages -f build_type=workflow
GH_TOKEN=$(gh auth token -u whaletalent) gh api repos/whaletalent/jabuti/pages --jq '.build_type + " " + .html_url'
```
Expected: `workflow https://whaletalent.github.io/jabuti/`.

- [ ] **Step 4: Commit, push, open the PR**

```bash
git add .github
git commit -m "ci: lint, test and build on every push; deploy to GitHub Pages from main; Dependabot"
git push -u origin modernize/vite-phaser4-blockly13
gh auth switch -u whaletalent
gh pr create -R whaletalent/jabuti --base main --title "Modernize: Vite + Blockly 13 + Phaser 4, CI and GitHub Pages" --body-file docs/superpowers/specs/2026-11-16-jabuti-modernization-design.md
```

- [ ] **Step 5: Wait for CI**

Run: `gh pr checks --watch` (as `whaletalent`).
Expected: `checks` ✓. If it fails, fix on the branch and push; do not merge red.

---

### Task 9: README, repo metadata, merge, live verification

**Files:**
- Rewrite: `README.md`
- Uses: `docs/screenshot.png` from Task 7

**Interfaces:** none (documentation).

- [ ] **Step 1: Write `README.md` following the spec's outline**

Sections, in order: title + one-line pitch + badges (`CI` workflow badge, `Deploy` workflow badge) + **▶ Play it: https://whaletalent.github.io/jabuti/**; screenshot; "What it is" (pt-BR educational Logo-style game; audience); "The blocks" table (pf, pt, pd/pe, pdv/pev, color → what the turtle does; plus the Blockly standard categories); "How it works" (Blockly → JavaScript → JS-Interpreter steps → turtle state → Phaser stamps; 5 lines); "Tech stack" with one *why* line per library; "Run locally" (`nvm use`, `npm ci`, `npm run dev`, open `http://localhost:5173/jabuti/`) and a scripts table; "Project structure" (short tree); "CI & deploy" (what runs where; Pages from `main`); "History" (2019 version at tag `v1-legacy`, rewritten 2026 — link to the tag); "License" (MIT). English throughout; UI strings quoted in pt-BR where they appear.

- [ ] **Step 2: Check formatting, commit, push**

```bash
npm run format:check
git add README.md docs/screenshot.png
git commit -m "docs: rewrite README for the Vite/Blockly 13/Phaser 4 version"
git push
```

- [ ] **Step 3: Merge when CI is green**

```bash
gh pr checks --watch && gh pr merge --merge --delete-branch
git checkout main && git pull
```

- [ ] **Step 4: Verify the Pages deploy and the live game**

```bash
gh run list -R whaletalent/jabuti --workflow deploy.yml --limit 1   # wait until completed/success
```
Open `https://whaletalent.github.io/jabuti/` with the Chrome tools; repeat checks (a)–(d) of Task 7 Step 5. Expected: game loads, assets resolve under `/jabuti/`, a program runs.

- [ ] **Step 5: Set repo metadata**

```bash
gh repo edit whaletalent/jabuti --description "Programming logic learning game: Blockly blocks drive a turtle on a Phaser canvas (pt-BR). Vite + Blockly 13 + Phaser 4." --homepage https://whaletalent.github.io/jabuti/ --add-topic blockly --add-topic phaser --add-topic javascript --add-topic vite --add-topic educational-game --add-topic turtle-graphics --add-topic pt-br
gh auth switch -u luan-ferreira-gs
```
Expected: `gh repo view whaletalent/jabuti --json homepageUrl,repositoryTopics` shows the URL and the seven topics; `gh auth status` shows `luan-ferreira-gs` active again.
