const globalState = {
  horizonY: 400,
  canvas: document.getElementById('main-canvas'),
  vp1X: 400,
  vp2X: 200,
  type: '1p',
  cubeDepth: 0.25
};

bindInput(document.getElementById('horizon-input'), 'horizonY');
bindInput(document.getElementById('vp1-input'), 'vp1X');
bindInput(document.getElementById('vp2-input'), 'vp2X');

document.getElementById('type-input').addEventListener('change', (ev) => updateState({ type: ev.target.value }));

function drawInPerspective() {
  const ctx = globalState.canvas.getContext('2d');
  clear(ctx);
  drawHorizon(ctx);
  if (globalState.type === '1p') {
    drawVanishingPoint(ctx, 1);
    drawRect1P(ctx, 350, 600, 100);
  } else {
    drawVanishingPoint(ctx, 1);
    drawVanishingPoint(ctx, 2);
    drawRect2P(ctx, 400, 600, 100);

  }
}

// Drawing functions (using global state)

function drawRect1P(ctx, x, y, width) {
  rect(ctx, x, y, width, width);
  drawVanishingLine(ctx, x,         y,         1);
  drawVanishingLine(ctx, x,         y + width, 1);
  drawVanishingLine(ctx, x + width, y,         1);
  drawVanishingLine(ctx, x + width, y + width, 1);

  const depth = globalState.cubeDepth;
  
  const [bx1, by1] = moveToVanishingPoint(x, y, depth, 1);
  const [bx2, by2] = moveToVanishingPoint(x + width, y, depth, 1);
  const [bx3, by3] = moveToVanishingPoint(x, y + width, depth, 1);
  const [bx4, by4] = moveToVanishingPoint(x + width, y + width, depth, 1);
  line(ctx, bx1, by1, bx2, by2);
  line(ctx, bx1, by1, bx3, by3);
  line(ctx, bx2, by2, bx4, by4);
  line(ctx, bx3, by3, bx4, by4);
}

function drawRect2P(ctx, x, y, h) {
  line(ctx, x, y, x, y + h);
  drawVanishingLine(ctx, x, y,     1);
  drawVanishingLine(ctx, x, y + h, 1);
  drawVanishingLine(ctx, x, y,     2);
  drawVanishingLine(ctx, x, y + h, 2);

  const depth = globalState.cubeDepth;

  const [v1x, v1y] = vpCoords(1);
  const [v2x, v2y] = vpCoords(2);

  const [bx1, by1] = moveToVanishingPoint(x, y, depth, 1);
  const [bx2, by2] = moveToVanishingPoint(x, y, depth, 2);
  const [bx3, by3] = moveToVanishingPoint(x, y + h, depth, 1);
  const [bx4, by4] = moveToVanishingPoint(x, y + h, depth, 2);

  const [ix1, iy1] = findLineIntersection(bx1, by1, v2x, v2y, bx2, by2, v1x, v1y);
  const [ix2, iy2] = findLineIntersection(bx3, by3, v2x, v2y, bx4, by4, v1x, v1y);

  // perspective lines
  line(ctx, bx1, by1, ix1, iy1);
  line(ctx, bx2, by2, ix1, iy1);
  line(ctx, bx3, by3, ix2, iy2);
  line(ctx, bx4, by4, ix2, iy2);

  // vertical lines
  line(ctx, bx1, by1, bx3, by3);
  line(ctx, bx2, by2, bx4, by4);
  line(ctx, ix1, iy1, ix2, iy2);
}

function moveToVanishingPoint(x, y, plen, vpIx) {
  const [vx, vy] = vpCoords(vpIx);
  const rx = (vx - x) * plen;
  const ry = (vy - y) * plen;
  return [x + rx, y + ry];
}

// Calculate intersecting point between line from x1,y1 -> x2,y2 and line from x3,y3 -> x4,y4
function findLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
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
function findSlopeAndIntercept(x1, y1, x2, y2) {
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - (m * x1);
  return [m, b];
}

function vpCoords(ix) {
  return [globalState[`vp${ix}X`], globalState.horizonY];
}

function drawVanishingLine(ctx, x, y, vpIx) {
  line(ctx, x, y, globalState[`vp${vpIx}X`], globalState.horizonY);
}

function angleToVanishingPoint(x, y, vpIx) {
  return pointsAngle(x, y, globalState[`vp${vpIx}X`], globalState.horizonY);
}

function drawHorizon(ctx) {
  line(ctx, 0, globalState.horizonY, ctx.canvas.width, globalState.horizonY);
}

function drawVanishingPoint(ctx, ix) {
  dot(ctx, globalState[`vp${ix}X`], globalState.horizonY);
}

// lower-level drawing functions (not using global state)

function pointsAngle(x1, y1, x2, y2) {
  return Math.tan(y2 - y1 / x2 - x1);
}

function lineAtAngle(ctx, x1, y1, angle, len) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + len, y1);
  ctx.rotate(angle);
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function rect(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function dot(ctx, x, y) {
  ctx.beginPath();
  ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function clear(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// State mgmt functions

function bindInput(input, stateKey) {
  input.addEventListener('input', (ev) => updateState({ [stateKey]: ev.target.value }));
  updateState({ [stateKey]: input.value });
}

function updateState(newState = {}) {
  Object.assign(globalState, newState);
  drawInPerspective();
}