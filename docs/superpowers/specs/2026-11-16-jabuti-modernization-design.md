# Jabuti modernization — design

Date: 2026-11-16 · Repo: `whaletalent/jabuti` · Status: builder-checked, awaiting owner approval

## Intent and why

Jabuti is a 2019 learning game: kids snap Blockly blocks together and a
turtle (the *jabuti*) walks across a Phaser canvas leaving a coloured trail,
Logo-style. The owner wants it as a **living portfolio piece**: someone
opening the repo in 2026 should see a current, idiomatic plain-JavaScript
project they can run in one command, and someone opening the live URL should
be able to play it. Today the repo is an Express server that serves a folder
of hand-copied libraries (Phaser 2.9.4, a 2017 Blockly, Acorn interpreter),
the Heroku demo is dead, and there is no lint, test or CI.

This is the first of four repos (`parrot-client`, `shiba-delivery`,
`shiba-delivery-api` follow later, each its own design).

## Goals

1. Same game, same blocks, same feel — a player from 2019 would not notice
   the rewrite except for it being faster to load.
2. Modern plain-JavaScript project: ES modules, Vite, dependencies from npm,
   no framework, no TypeScript.
3. Basic current repo standard: lint, format, unit tests, CI on every push
   and PR, dependency updates, editorconfig, Node version pin, license.
4. Automatic deploy to GitHub Pages at `https://whaletalent.github.io/jabuti/`.
5. README rewritten for a portfolio reader (what it is, play it, run it,
   how it is built).

## Non-goals

- New gameplay, new blocks, levels, saving programs, sharing links.
- Mobile / narrow-screen support (the current `< 600px` warning stays).
- Internationalising the UI (it stays pt-BR; the audience is Brazilian kids).
- TypeScript, any UI framework, any backend.
- Touching the other three repos.

## Anti-goals (would make this a failure even if it "works")

- Shipping a repo that still carries megabytes of vendored library code.
- A build that only works on the author's machine (undeclared Node version,
  missing lockfile, hard-coded absolute paths like `/public/...`).
- A README that is a Vite template dump instead of describing *this* game.
- Changing block semantics (e.g. angle direction, trail colour format) so
  that the tutorial image no longer matches what happens.

## Constraints

- **Plain JS** (the owner's explicit ask). ESM, modern syntax, no transpile
  targets beyond what Vite does by default.
- **GitHub Pages, project site**: the app is served under `/jabuti/`, so the
  Vite `base` must be `/jabuti/` and every asset path must be relative to it.
  Pages is not enabled yet on the repo; enabling it (build type "GitHub
  Actions") is part of the work and needs the `whaletalent` token.
- **Account**: commits must be linked to `whaletalent`. The only address
  known to be attached to that account is its GitHub noreply
  `40327368+whaletalent@users.noreply.github.com` (seen in the existing
  history). The `~/.gitconfig-pessoal` profile currently uses
  `luanfc@gmail.com`, which is **not** known to be on that account — switch
  the profile to the noreply address before the first commit.
- Node 24 LTS (available locally via nvm); npm as the package manager
  (lockfile committed).
- Current library versions at design time: Blockly 13.4, Phaser 4.2,
  JS-Interpreter 6.0, Vite 8.3, Vitest 5.1, ESLint 10, Prettier 3.10.

## Approaches considered

| # | Approach | Trade-off | Decision |
|---|----------|-----------|----------|
| 1 | **Vite + ESM, libraries from npm, Phaser 4 + Blockly 13** | Scene and toolbox must be rewritten for the new APIs (whole game is < 300 lines of own code, so bounded). Gains lint/test/CI/Pages and drops 3.8 MB of vendored code. | **Picked** by the owner |
| 2 | Vite + npm but stay on Phaser CE (2.x) | Avoids the scene rewrite; keeps a 2016-era API on display and a barely-maintained engine. | Rejected: not "current" |
| 3 | No build; HTML + ESM via CDN import maps | Zero toolchain, "purest" JS; but no lint/tests, runtime CDN dependency, looks unfinished for a portfolio. | Rejected |

## How it gets built (decided)

### Stack

- `vite` (build/dev server), `blockly` (core + `blockly/blocks`,
  `blockly/javascript`, `blockly/msg/pt-br`), `@blockly/field-angle` (the
  angle picker used by the `pd`/`pe` blocks moved out of core),
  `@blockly/field-colour` (the `colour_*` blocks of the Cores category),
  `phaser` 4, `js-interpreter` (the same NeilFraser interpreter, from npm).
- Dev: `vitest` + `jsdom` where needed, `eslint` (flat config,
  `@eslint/js` recommended, browser globals), `prettier`,
  `eslint-config-prettier`.

### Repository layout

```
jabuti/
├── index.html                 # app shell: toolbox mount, canvas mount, buttons, speed slider
├── vite.config.js             # base: '/jabuti/'
├── package.json / package-lock.json
├── .nvmrc (24) · .editorconfig · .gitignore · .prettierrc · eslint.config.js
├── LICENSE                    # MIT
├── README.md
├── public/
│   └── assets/                # png sprites, fonts, tutorial.png (renamed from "tutorial")
├── src/
│   ├── main.js                # boot: inject Blockly, start Phaser, wire UI → runner
│   ├── blocks/
│   │   ├── definitions.js     # pf, pt, pd, pe, pdv, pev, color — block shapes
│   │   ├── generators.js      # JavaScript generator for each custom block
│   │   └── toolbox.js         # toolbox as JSON (ported from the XML in turtle.html)
│   ├── game/
│   │   ├── turtle.js          # pure state: position, heading, trail colour; no Phaser import
│   │   └── scene.js           # Phaser 4 Scene: background tile, trail RenderTexture, sprite, step loop
│   ├── runner.js              # JS-Interpreter wrapper: build code, step at `speed`, highlight, stop/reset
│   ├── ui.js                  # buttons enable/disable, speed slider, preloader, tutorial overlay
│   └── styles/main.css        # ported from main.scss; CSS custom properties replace Sass vars
├── tests/
│   ├── turtle.test.js         # heading math, forward/back vectors, colour parsing
│   ├── generators.test.js     # each custom block emits the expected call
│   └── toolbox.test.js        # every block type referenced in the toolbox is defined
├── docs/superpowers/specs/    # this document (+ plan)
└── .github/
    ├── workflows/ci.yml       # push + PR: npm ci, lint, test, build
    ├── workflows/deploy.yml   # push to default branch: build → actions/upload-pages-artifact → deploy-pages
    └── dependabot.yml         # npm + github-actions, monthly, grouped
```

Removed: `app.js`, `app/`, `Procfile`, `public/blockly/`, `public/phaser/`,
`public/acorn/`, `public/styles/.sass-cache/`, `public/styles/main.css(.map)`
and `main.scss` (ported to plain CSS), `public/turtle.html`,
`nodemon`/`express` dependencies.

### Behaviour parity checklist (what "same game" means)

- Toolbox categories and blocks exactly as today, all **seven**: Movimento
  (pf, pt, pd, pe, pdv, pev), Lógica, Repetição, Matemática, **Cores**
  (`color`, `colour_picker`, `colour_random`, `text` preset `#00CCFF`,
  `colour_rgb`, `colour_blend`), Variáveis, Funções. In Blockly 13 the
  `colour_*` blocks and their generators live in `@blockly/field-colour`, so
  that plugin is part of the stack. Blockly UI messages in pt-BR. Horizontal
  toolbox layout, trashcan, scrollbars.
- Generated API names unchanged: `jabutiPF`, `jabutiPT`, `jabutiPD(deg)`,
  `jabutiPE(deg)`, `setColor('#rrggbb')`, `highlightBlock(id)`. Right turn
  increases the angle, left decreases, as today.
- **Step length (owner decision):** one `pf`/`pt` moves the turtle by a
  configurable step, **default 8 px**. The legacy code used Phaser 2 arcade
  `body.moveTo(2, 1, angle)`, which is frame-rate dependent and came out at
  ~8 px per block on a 60 Hz screen; 8 px is what players saw and what the
  tutorial image shows. The step is exposed as a second slider "Tamanho do
  passo" next to "Velocidade de Execução" (range 1..32, default 8); the
  blocks themselves are unchanged (builder's call on how to expose it).
- Execution: one interpreter step every `speed` ms, `speed = 55 − slider`
  (slider 5..50 step 5, default 25). Current block highlighted while it runs.
- **Run/stop loop (owner decision, fixes a 2019 bug):** when the program
  finishes, "Executar" is re-enabled and the drawing stays, so successive
  runs accumulate on the canvas. "Parar Execução" cancels the pending step,
  **clears the trail**, resets heading to 0, re-centres the turtle, resets
  trail colour to white and re-enables "Executar". (Legacy: "Executar"
  stayed disabled after a run and only "Parar" — which also wiped the canvas
  through an accidental `clear` argument — brought it back.)
- Trail: a render texture that stamps the 16×16 trail sprite, tinted with
  the current colour, at the turtle's position **once per move** (one dot
  per `pf`/`pt`), giving the dotted look of the original. The background
  tile stays.
- Preloader shown ~1 s then fades; tutorial image overlay dismissed on click;
  "Limpar Tela" asks for confirmation; Desfazer/Refazer map to
  `workspace.undo(false/true)`.
- `< 600px` shows the warning text and hides the app.

### Review findings fixed as part of the port (not separate work)

- `initApi` is defined twice in `interpreterAPI.js`; the second definition
  wins, so `alert`/`prompt` were never actually exposed. Keep the behaviour
  that shipped (no `alert`/`prompt`), drop the dead copy.
- Trail tint is set as the string `'0x' + hex`; convert to a number.
- Turtle movement relies on Phaser 2 arcade `body.moveTo(2, 1, angle)`,
  which is frame-rate dependent. Replace with explicit position math in
  `turtle.js` (`x += step·cos(heading)`, `y += step·sin(heading)`, clamped to
  the canvas), which is also what makes it unit-testable.
- Reset currently `kill()`s and recreates the sprite; just reposition it.
- The `jabuti.png` "spritesheet" is a single 16×16 frame, so the never-played
  `left`/`right` animations are dropped; sprite rotation follows heading as
  today.
- The canvas is sized once from `#simulacao` and never on resize; keep that
  (non-goal), but size it after layout so it is never 0×0.
- Mixed `public/assets/...` and `/public/assets/...` paths → Vite asset
  imports / `base`-relative URLs.
- Everything lives on `window`; move to modules, expose only what the
  interpreter needs through the runner's API object.
- `package.json` name is `turtle`, version 1.0.0, no author/license →
  `jabuti`, `0.0.0`-style semver reset is unnecessary: use `2.0.0` to mark
  the rewrite, author `whaletalent`, license MIT.

### Repo standard applied

- ESLint 10 flat config + Prettier (2-space, single quotes, no semicolons is
  **not** chosen: use Prettier defaults to avoid bikeshedding).
- Scripts: `dev`, `build`, `preview`, `lint`, `lint:fix`, `format`,
  `format:check`, `test`, `test:watch`.
- CI must be green before merge; the deploy workflow runs only on the default
  branch, with the standard `pages: write` + `id-token: write` permissions
  and a `github-pages` environment.
- Dependabot monthly, grouped minor/patch, for npm and GitHub Actions.
- Default branch renamed `master` → `main` (owner can veto; see calls below).
- Repo description and topics set via `gh repo edit` (`blockly`, `phaser`,
  `javascript`, `vite`, `educational-game`, `turtle-graphics`, `pt-br`), and
  the homepage set to the Pages URL.

### README outline

1. Title, one-line pitch, badges (CI, Pages), **Play it** link.
2. Screenshot or short GIF of a program running.
3. What it is / who it is for (pt-BR educational game, Logo-style turtle).
4. The blocks (table: block → what the turtle does).
5. Tech: Blockly, Phaser, JS-Interpreter, Vite — one line each on *why*.
6. Run locally (`nvm use`, `npm ci`, `npm run dev`), scripts table.
7. Project structure (short tree) and how a block flows to the canvas.
8. Deploy (push to `main` → Pages) and CI.
9. History note: built 2019, rewritten 2026; link to the last pre-rewrite
   commit/tag `v1-legacy` so the original is still browsable.
10. License.

README language: **English** (portfolio audience), with the game UI itself
staying pt-BR.

### Delivery

- Work on a branch `modernize/vite-phaser4-blockly13`, one PR with a few
  logical commits (tooling → blocks → game → runner/UI → CI/Pages → README).
- Tag the current `master` tip as `v1-legacy` before the rewrite lands.
- Enable Pages (build type workflow) on the repo **before** the first merge,
  so the first deploy run does not fail; the builder does this with the
  `whaletalent` `gh` login already present on this machine (this is a
  personal repo, so the "prod dispatches belong to the owner" rule from the
  GamerSafer repos does not apply). Merge when CI is green, verify the live
  URL renders and a sample program runs, then set the repo homepage.
- Commit author: `whaletalent <40327368+whaletalent@users.noreply.github.com>`,
  SSH-signed with `~/.ssh/id_ed25519_pessoal` (already registered as a
  signing key on the account).

## Left to the builder

- Exact Phaser 4 scene code (how the RenderTexture API stamps the sprite,
  how the Scene receives the turtle state).
- How `main.js` sizes the Phaser canvas to the `#simulacao` container and
  whether to use Phaser's Scale manager.
- Test list beyond the three files above; which parts need jsdom.
- Exact action versions / pinning style in the workflows.
- CSS details when porting from SCSS (keep the look; nesting can become
  plain selectors).
- Whether the preloader is still needed with Vite's small bundle (keep it if
  the fade is part of the "feel", shorten the 1 s delay if it is just a wait).

## Calls I made for the owner to check

1. README in English; game stays pt-BR.
2. License MIT (package.json said ISC, no LICENSE file existed).
3. Rename default branch `master` → `main`.
4. Commit email switched to the account's noreply address.
5. Version bumped to `2.0.0`; old tip tagged `v1-legacy`.
6. `alert`/`prompt` stay unavailable inside programs (they were dead code).
7. Phaser **4** rather than 3 (4.2 is the current stable line).
8. Step length exposed as a slider (1..32, default 8) rather than a new block,
   so the block set stays identical to 2019.
9. Trail stamps one dot per move (dotted look preserved).
10. Cores category kept via `@blockly/field-colour` (parity, not a drop).
11. Pages enablement and live check done by the builder with the
    `whaletalent` login on this machine.
