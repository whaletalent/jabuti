import Phaser from "phaser";
import {
  forward,
  back,
  turnRight,
  turnLeft,
  setColour,
  reset,
} from "./turtle.js";

export class TurtleScene extends Phaser.Scene {
  constructor() {
    super("turtle");
  }

  init({ turtle }) {
    this.turtle = turtle;
  }

  preload() {
    const base = `${import.meta.env.BASE_URL}assets/`;
    this.load.image("fundo", `${base}fundo.png`);
    this.load.image("trail", `${base}trail.png`);
    this.load.image("jabuti", `${base}jabuti.png`);
  }

  create() {
    const { width, height } = this.turtle;
    this.add.tileSprite(0, 0, width, height, "fundo").setOrigin(0);
    this.trail = this.add.renderTexture(0, 0, width, height).setOrigin(0);
    this.player = this.add.image(this.turtle.x, this.turtle.y, "jabuti");
  }

  update() {
    this.player.x = this.turtle.x;
    this.player.y = this.turtle.y;
    this.player.angle = this.turtle.heading;
  }

  stampTrail() {
    this.trail.stamp("trail", 0, this.turtle.x, this.turtle.y, {
      tint: this.turtle.colour,
      originX: 0.5,
      originY: 0.5,
    });
  }

  moveForward() {
    forward(this.turtle);
    this.stampTrail();
  }

  moveBack() {
    back(this.turtle);
    this.stampTrail();
  }

  turnRight(deg) {
    turnRight(this.turtle, deg);
  }

  turnLeft(deg) {
    turnLeft(this.turtle, deg);
  }

  setColour(hex) {
    return setColour(this.turtle, hex);
  }

  resetScene() {
    reset(this.turtle);
    this.trail.clear();
  }
}
