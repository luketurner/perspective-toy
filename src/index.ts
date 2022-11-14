/**
 * Entry point for the application.
 */
import { createCanvasHandler, isCanvas } from "./canvas";
import { addHandler, db, setCanvasSize, setHorizon } from "./db";
import { drawApp } from "./draw";

const main = (el: HTMLElement | null) => {
  if (!isCanvas(el)) throw new Error(`invalid element: ${el}`);

  setCanvasSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => {
    setCanvasSize(window.innerWidth, window.innerHeight);
    if (db.horizonY >= db.canvasHeight) {
      setHorizon(el.height * 0.9);
    }
  });

  addHandler(createCanvasHandler(el, drawApp));
  setHorizon(db.canvasHeight / 2);

}

main(document.getElementById('cubes'));