/**
 * Code to draw the application. The only function exported here is `drawApp()` which should be called
 * when you want the app to draw. (Note drawApp doesn't do any "cleanup" like clearing the canvas, so do that first!)
 */
import { addBox, OnDragEvent } from "./box";
import { canvasWidth, fillDot, fillStyle, strokeLine, strokeRect, restore, save, strokeStyle, ctx } from "./canvas";
import { colorSubtle, colorDragging, colorHover, colorFore, colorHoverSubtle, colorRed } from "./colors";
import { Cube, db, isHovering, isDragging, setHorizon, updateVanishingPoint, VanishingPoint, translateCube } from "./db";
import { drawUi } from "./ui";

export const drawApp = () => {
  strokeStyle(colorFore);
  fillStyle(colorFore);
  drawUi();
  drawHorizon(db.horizonY);
  for (const cube of Object.values(db.shapes)) {
    if (cube.persp === '1p') {
      drawRect1P(cube);
    } else {
      drawRect2P(cube);
    }
  }
  for (const vp of Object.values(db.vps)) {
    drawVanishingPoint(vp);
  }
}

function drawRect1P(cube: Cube) {
  save();
  const inputBoxId = 'cube' + cube.id;
  const delHover = isHovering('clearCube');
  const hover = isHovering(inputBoxId) || isHovering('cubeBtn' + cube.id);
  const depth = 0.25; // TODO
  const [x, y] = cube.position;
  const [width, height] = cube.size;
  const vp = db.vps[cube.vps[0]];
  
  const [bx1, by1] = moveToVanishingPoint(x, y, depth, vp);
  const [bx2, by2] = moveToVanishingPoint(x + width, y, depth, vp);
  const [bx3, by3] = moveToVanishingPoint(x, y + width, depth, vp);
  const [bx4, by4] = moveToVanishingPoint(x + width, y + width, depth, vp);

  strokeStyle(hover ? colorHoverSubtle : colorSubtle);
  drawVanishingLine(x,         y,         vp);
  drawVanishingLine(x,         y + width, vp);
  drawVanishingLine(x + width, y,         vp);
  drawVanishingLine(x + width, y + width, vp);

  strokeStyle(delHover ? colorRed : hover ? colorHover : colorFore);

  const frontPath = new Path2D();
  frontPath.rect(x, y, width, height);

  const topPath = new Path2D();
  topPath.moveTo(x, y);
  topPath.lineTo(bx1, by1);
  topPath.lineTo(bx2, by2);
  topPath.lineTo(x + width, y);
  topPath.closePath();

  const botPath = new Path2D();
  botPath.moveTo(x, y + height);
  botPath.lineTo(bx3, by3);
  botPath.lineTo(bx4, by4);
  botPath.lineTo(x + width, y + height);
  botPath.closePath();

  const leftPath = new Path2D();
  leftPath.moveTo(x, y);
  leftPath.lineTo(bx1, by1);
  leftPath.lineTo(bx3, by3);
  leftPath.lineTo(x, y + height);
  leftPath.closePath();

  const rightPath = new Path2D();
  rightPath.moveTo(x + width, y);
  rightPath.lineTo(bx2, by2);
  rightPath.lineTo(bx4, by4);
  rightPath.lineTo(x + width, y + height);
  rightPath.closePath();

  const backPath = new Path2D();
  backPath.moveTo(bx1, by1);
  backPath.lineTo(bx2, by2);
  backPath.lineTo(bx4, by4);
  backPath.lineTo(bx3, by3);
  backPath.closePath();

  const shapePath = new Path2D();
  shapePath.addPath(topPath);
  shapePath.addPath(botPath);
  shapePath.addPath(leftPath);
  shapePath.addPath(backPath);
  shapePath.addPath(frontPath);
  shapePath.addPath(rightPath);

  ctx.stroke(shapePath);

  // TODO -- having a hard time getting all the paths into a single path
  // without having fill being "inverted" in some cases where the path overlaps.
  // Working around it by handling them separately, but it's hacky.
  addBox({
    id: inputBoxId,
    path: [topPath, botPath, leftPath, backPath, frontPath, rightPath],
    onDrag(e) {
      translateCube(cube.id, e.dx, e.dy);
    }
  });

  restore();
}

function drawRect2P(cube: Cube) {
  save();
  const inputBoxId = 'cube' + cube.id;
  const delHover = isHovering('clearCube');
  const hover = isHovering(inputBoxId) || isHovering('cubeBtn' + cube.id);
  const depth = 0.25; // TODO
  const [x, y] = cube.position;
  const [h] = cube.size;
  const vp1 = db.vps[cube.vps[0]];
  const vp2 = db.vps[cube.vps[1]];

  const [v1x, v1y] = vpCoords(vp1);
  const [v2x, v2y] = vpCoords(vp2);

  const [bx1, by1] = moveToVanishingPoint(x, y, depth, vp1);
  const [bx2, by2] = moveToVanishingPoint(x, y, depth, vp2);
  const [bx3, by3] = moveToVanishingPoint(x, y + h, depth, vp1);
  const [bx4, by4] = moveToVanishingPoint(x, y + h, depth, vp2);

  const [ix1, iy1] = findLineIntersection(bx1, by1, v2x, v2y, bx2, by2, v1x, v1y);
  const [ix2, iy2] = findLineIntersection(bx3, by3, v2x, v2y, bx4, by4, v1x, v1y);


  strokeStyle(hover ? colorHoverSubtle : colorSubtle);
  drawVanishingLine(x, y,     vp1);
  drawVanishingLine(x, y + h, vp1);
  drawVanishingLine(x, y,     vp2);
  drawVanishingLine(x, y + h, vp2);

  drawVanishingLine(ix1, iy1, vp1);
  drawVanishingLine(ix1, iy1, vp2);
  drawVanishingLine(ix2, iy2, vp1);
  drawVanishingLine(ix2, iy2, vp2);

  strokeStyle(delHover ? colorRed : hover ? colorHover : colorFore);

  const topPath = new Path2D();
  topPath.moveTo(x, y);
  topPath.lineTo(bx1, by1);
  topPath.lineTo(ix1, iy1);
  topPath.lineTo(bx2, by2);
  topPath.closePath();

  const botPath = new Path2D();
  botPath.moveTo(x, y + h);
  botPath.lineTo(bx3, by3);
  botPath.lineTo(ix2, iy2);
  botPath.lineTo(bx4, by4);
  botPath.closePath();

  const leftFrontPath = new Path2D();
  leftFrontPath.moveTo(x, y);
  leftFrontPath.lineTo(bx1, by1);
  leftFrontPath.lineTo(bx3, by3);
  leftFrontPath.lineTo(x, y + h);
  leftFrontPath.closePath();

  const leftBackPath = new Path2D();
  leftBackPath.moveTo(bx1, by1);
  leftBackPath.lineTo(ix1, iy1);
  leftBackPath.lineTo(ix2, iy2);
  leftBackPath.lineTo(bx3, by3);
  leftBackPath.closePath();

  const rightFrontPath = new Path2D();
  rightFrontPath.moveTo(x, y);
  rightFrontPath.lineTo(bx2, by2);
  rightFrontPath.lineTo(bx4, by4);
  rightFrontPath.lineTo(x, y + h);
  rightFrontPath.closePath();

  const rightBackPath = new Path2D();
  rightBackPath.moveTo(bx2, by2);
  rightBackPath.lineTo(ix1, iy1);
  rightBackPath.lineTo(ix2, iy2);
  rightBackPath.lineTo(bx4, by4);
  rightBackPath.closePath();

  const shapePath = new Path2D();
  shapePath.addPath(topPath);
  shapePath.addPath(botPath);
  shapePath.addPath(leftFrontPath);
  shapePath.addPath(leftBackPath);
  shapePath.addPath(rightFrontPath);
  shapePath.addPath(rightBackPath);
  ctx.stroke(shapePath);

  // TODO -- having a hard time getting all the paths into a single path
  // without having fill being "inverted" in some cases where the path overlaps.
  // Working around it by handling them separately, but it's hacky.
  addBox({
    id: inputBoxId,
    path: [topPath, botPath, leftFrontPath, leftBackPath, rightFrontPath, rightBackPath],
    onDrag(e) {
      translateCube(cube.id, e.dx, e.dy);
    }
  });

  restore();
}

function moveToVanishingPoint(x: number, y: number, plen: number, vp: VanishingPoint) {
  const [vx, vy] = vpCoords(vp);
  const rx = (vx - x) * plen;
  const ry = (vy - y) * plen;
  return [x + rx, y + ry];
}

// Calculate intersecting point between strokeLine from x1,y1 -> x2,y2 and strokeLine from x3,y3 -> x4,y4
function findLineIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const [m1, b1] = findSlopeAndIntercept(x1, y1, x2, y2);
  const [m2, b2] = findSlopeAndIntercept(x3, y3, x4, y4);

  // find x, y where lines intersect
  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;

  return [x, y];
}

/**
 * Given two points, calculate the slope and Y-intercept of the strokeLine that passes through them.
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
  strokeLine(x, y, vp.posX, db.horizonY);
}

function drawHorizon(y: number) {
  save();
  const w = canvasWidth();
  const boxId = 'horizon';
  const hover = isHovering(boxId);
  const drag = isDragging(boxId);
  strokeStyle(drag ? colorDragging : hover ? colorHover : colorFore);
  strokeLine(0, y, w, y);
  const onDrag = (e: OnDragEvent) => {
    setHorizon(e.y);
  };
  addBox({id: boxId, x: 0, y: y - 5, h: 10, w, onDrag});
  restore();
}

function drawVanishingPoint(vp: VanishingPoint) {
  save();
  const x = vp.posX;
  const y = db.horizonY;
  const boxId = 'vp' + vp.id;
  const hover = isHovering(boxId);
  const drag = isDragging(boxId);
  fillStyle(drag ? colorDragging : hover ? colorHover : colorFore);
  fillDot(x, y);
  const onDrag = (e: OnDragEvent) => {
    updateVanishingPoint(vp.id, { posX: e.x });
  };
  addBox({id: boxId, x: x - 5, y: y - 5, h: 10, w: 10, onDrag});
  restore();
}