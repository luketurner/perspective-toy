/**
 * Entry point for the application.
 */
import { createCanvasHandler } from "./canvas";
import { addHandler, setHorizon } from "./db";
import { drawApp } from "./draw";

const main = (el) => {
  addHandler(createCanvasHandler(el, drawApp));
  setHorizon(400);
}

main(document.getElementById('cubes'));