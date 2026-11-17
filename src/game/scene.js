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
    this.load.image("jabuti", `${base}jabuti.png`);
  }

  create() {
    const { width, height } = this.turtle;
    this.add.tileSprite(0, 0, width, height, "fundo").setOrigin(0);
    this.trail = this.add.renderTexture(0, 0, width, height).setOrigin(0);
    this.player = this.add.image(this.turtle.x, this.turtle.y, "jabuti");
    this.pen = this.make.graphics({ add: false });
  }

  update() {
    this.player.x = this.turtle.x;
    this.player.y = this.turtle.y;
    this.player.angle = this.turtle.heading;
  }

  drawSegment(x0, y0, x1, y1) {
    const { colour } = this.turtle;
    this.pen.clear();
    this.pen.lineStyle(3, colour, 1);
    this.pen.beginPath();
    this.pen.moveTo(x0, y0);
    this.pen.lineTo(x1, y1);
    this.pen.strokePath();
    this.pen.fillStyle(colour, 1);
    this.pen.fillCircle(x1, y1, 1.5);
    this.trail.draw(this.pen);
    this.trail.render();
  }

  moveForward() {
    const { x, y } = this.turtle;
    forward(this.turtle);
    this.drawSegment(x, y, this.turtle.x, this.turtle.y);
  }

  moveBack() {
    const { x, y } = this.turtle;
    back(this.turtle);
    this.drawSegment(x, y, this.turtle.x, this.turtle.y);
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
    this.trail.render();
  }
}
