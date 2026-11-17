import Phaser from "phaser";
import { TurtleScene } from "./scene.js";

const FALLBACK_WIDTH = 800;
const FALLBACK_HEIGHT = 600;

/**
 * Creates the Phaser game. The scene is registered and started with
 * `{ turtle }` as init data once the game has booted (READY), so
 * `getScene()` returns null/undefined before READY and the scene instance
 * afterwards (its assets may still be loading; `create()` runs later).
 */
export function createGame({
  parent,
  turtle,
  width = parent.clientWidth || FALLBACK_WIDTH,
  height = parent.clientHeight || FALLBACK_HEIGHT,
}) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width,
    height,
    pixelArt: true,
    backgroundColor: "#212529",
    scene: [],
  });

  // Resolves with the scene once its create() has run (trail/player exist).
  const ready = new Promise((resolve) => {
    game.events.once(Phaser.Core.Events.READY, () => {
      game.scene.add("turtle", TurtleScene, true, { turtle });
      game.scene
        .getScene("turtle")
        .events.once(Phaser.Scenes.Events.CREATE, () => {
          resolve(game.scene.getScene("turtle"));
        });
    });
  });

  return { game, ready, getScene: () => game.scene.getScene("turtle") };
}
