import { addBox } from "./box";
import { addCube, AppDB, clearCubes, Cube, db, Handler, rmCube, VanishingPoint } from "./db";

let ctx: CanvasRenderingContext2D;

export const redraw = (el: HTMLCanvasElement, db: AppDB) => {
  const newCtx = el.getContext('2d');
  if (!newCtx) throw new Error(`Cannot find 2D Context for element: ${el}`);
  ctx = newCtx;
  clear();
  drawHorizon(db.horizonY);
  drawUi();
  for (const vp of Object.values(db.vps)) {
    drawVanishingPoint(vp);
  }
  for (const cube of Object.values(db.shapes)) {
    if (cube.persp === '1p') {
      drawRect1P(cube);
    } else {
      drawRect2P(cube);
    }
  }
}

function drawUi() {
  drawButton(16, 16, '+1P', 'add1p', () => addCube({
    persp: '1p',
    position: [350, 600],
    size: [100, 100],
    vps: [db.vps[2].id]
  }));
  drawButton(64, 16, '+2P', 'add2p', () => addCube({
    persp: '2p',
    position: [400, 200],
    size: [100, 100],
    vps: [db.vps[1].id, db.vps[3].id]
  }));
  drawButton(128, 16, 'CLEAR', 'rm', () => clearCubes());
}

function drawButton(x: number, y: number, text: string, id: string, onClick: () => void) {
  ctx.save();
  ctx.strokeStyle = 'black';
  ctx.font = '18px monospace';
  const padding = 2;
  const m = ctx.measureText(text);
  const w = m.width + padding * 2;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding * 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillText(text, x + padding, y + m.actualBoundingBoxAscent + padding);
  addBox({ x, y, w, h, id, onClick });
  ctx.restore();
}

function drawRect1P(cube: Cube) {
  const depth = 0.25; // TODO
  const [x, y] = cube.position;
  const [width] = cube.size;
  const vp = db.vps[cube.vps[0]];
  
  drawVanishingLine(x,         y,         vp);
  drawVanishingLine(x,         y + width, vp);
  drawVanishingLine(x + width, y,         vp);
  drawVanishingLine(x + width, y + width, vp);
  
  const [bx1, by1] = moveToVanishingPoint(x, y, depth, vp);
  const [bx2, by2] = moveToVanishingPoint(x + width, y, depth, vp);
  const [bx3, by3] = moveToVanishingPoint(x, y + width, depth, vp);
  const [bx4, by4] = moveToVanishingPoint(x + width, y + width, depth, vp);
  rect(x, y, width, width);
  line(x, y, bx1, by1);
  line(x + width, y, bx2, by2);
  line(x, y + width, bx3, by3);
  line(x + width, y + width, bx4, by4);
  line(bx1, by1, bx2, by2);
  line(bx1, by1, bx3, by3);
  line(bx2, by2, bx4, by4);
  line(bx3, by3, bx4, by4);
}

function drawRect2P(cube: Cube) {
  const depth = 0.25; // TODO
  const [x, y] = cube.position;
  const [h] = cube.size;
  const vp1 = db.vps[cube.vps[0]];
  const vp2 = db.vps[cube.vps[1]];

  line(x, y, x, y + h);
  drawVanishingLine(x, y,     vp1);
  drawVanishingLine(x, y + h, vp1);
  drawVanishingLine(x, y,     vp2);
  drawVanishingLine(x, y + h, vp2);

  const [v1x, v1y] = vpCoords(vp1);
  const [v2x, v2y] = vpCoords(vp2);

  const [bx1, by1] = moveToVanishingPoint(x, y, depth, vp1);
  const [bx2, by2] = moveToVanishingPoint(x, y, depth, vp2);
  const [bx3, by3] = moveToVanishingPoint(x, y + h, depth, vp1);
  const [bx4, by4] = moveToVanishingPoint(x, y + h, depth, vp2);

  const [ix1, iy1] = findLineIntersection(bx1, by1, v2x, v2y, bx2, by2, v1x, v1y);
  const [ix2, iy2] = findLineIntersection(bx3, by3, v2x, v2y, bx4, by4, v1x, v1y);

  drawVanishingLine(ix1, iy1, vp1);
  drawVanishingLine(ix1, iy1, vp2);
  drawVanishingLine(ix2, iy2, vp1);
  drawVanishingLine(ix2, iy2, vp2);

  // perspective lines
  line(x, y, bx1, by1);
  line(x, y, bx2, by2);
  line(bx1, by1, ix1, iy1);
  line(bx2, by2, ix1, iy1);
  line(x, y + h, bx3, by3);
  line(x, y + h, bx4, by4);
  line(bx3, by3, ix2, iy2);
  line(bx4, by4, ix2, iy2);

  // vertical lines
  line(bx1, by1, bx3, by3);
  line(bx2, by2, bx4, by4);
  line(ix1, iy1, ix2, iy2);
}

function moveToVanishingPoint(x: number, y: number, plen: number, vp: VanishingPoint) {
  const [vx, vy] = vpCoords(vp);
  const rx = (vx - x) * plen;
  const ry = (vy - y) * plen;
  return [x + rx, y + ry];
}

// Calculate intersecting point between line from x1,y1 -> x2,y2 and line from x3,y3 -> x4,y4
function findLineIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const [m1, b1] = findSlopeAndIntercept(x1, y1, x2, y2);
  const [m2, b2] = findSlopeAndIntercept(x3, y3, x4, y4);

  // find x, y where lines intersect
  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;

  return [x, y];
}

/**
 * Given two points, calculate the slope and Y-intercept of the line that passes through them.
 */
function findSlopeAndIntercept(x1: number, y1: number, x2: number, y2: number) {
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - (m * x1);
  return [m, b];
}

function vpCoords(vp: VanishingPoint) {
  return [vp.posX, db.horizonY];
}

function drawVanishingLine(x: number, y: number, vp: VanishingPoint) {
  line(x, y, vp.posX, db.horizonY, "grey");
}

function drawHorizon(y: number) {
  line(0, y, ctx.canvas.width, y, "grey");
}

function drawVanishingPoint(vp: VanishingPoint) {
  dot(vp.posX, db.horizonY);
}

function rect(x: number, y: number, width: number, height: number, color = "black") {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function line(x1: number, y1: number, x2: number, y2: number, color = "black") {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function dot(x: number, y: number, color = "black") {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function clear() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export const drawHandler = (el: HTMLCanvasElement): Handler => ({
  after: (db) => redraw(el, db),
  id: "draw"
});