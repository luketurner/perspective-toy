const globalState = {
  horizonY: 400,
  canvas: document.getElementById('main-canvas'),
  vp1X: 400,
  vp2X: 200,
  type: '1p',
  cubeDepth: 0.25
};

bindInput('perspective-type', 'change', 'type');
bindInput('horizon-input', 'input', 'horizonY');
bindInput('vp1-input', 'input', 'vp1X');
bindInput('vp2-input', 'input', 'vp2X');

function drawInPerspective() {
  const ctx = globalState.canvas.getContext('2d');
  clear(ctx);
  drawHorizon(ctx);
  if (globalState.type === '1p') {
    drawRect1P(ctx, 350, 600, 100);
  } else {
    drawRect2P(ctx, 400, 600, 100);
  }
}

// Drawing functions (using global state)

function drawRect1P(ctx, x, y, width) {
  drawVanishingPoint(ctx, 1);
  
  drawVanishingLine(ctx, x,         y,         1);
  drawVanishingLine(ctx, x,         y + width, 1);
  drawVanishingLine(ctx, x + width, y,         1);
  drawVanishingLine(ctx, x + width, y + width, 1);

  const depth = globalState.cubeDepth;
  
  const [bx1, by1] = moveToVanishingPoint(x, y, depth, 1);
  const [bx2, by2] = moveToVanishingPoint(x + width, y, depth, 1);
  const [bx3, by3] = moveToVanishingPoint(x, y + width, depth, 1);
  const [bx4, by4] = moveToVanishingPoint(x + width, y + width, depth, 1);
  rect(ctx, x, y, width, width);
  line(ctx, x, y, bx1, by1);
  line(ctx, x + width, y, bx2, by2);
  line(ctx, x, y + width, bx3, by3);
  line(ctx, x + width, y + width, bx4, by4);
  line(ctx, bx1, by1, bx2, by2);
  line(ctx, bx1, by1, bx3, by3);
  line(ctx, bx2, by2, bx4, by4);
  line(ctx, bx3, by3, bx4, by4);
}

function drawRect2P(ctx, x, y, h) {
  drawVanishingPoint(ctx, 1);
  drawVanishingPoint(ctx, 2);

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
  line(ctx, x, y, bx1, by1);
  line(ctx, x, y, bx2, by2);
  line(ctx, bx1, by1, ix1, iy1);
  line(ctx, bx2, by2, ix1, iy1);
  line(ctx, x, y + h, bx3, by3);
  line(ctx, x, y + h, bx4, by4);
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
  line(ctx, x, y, globalState[`vp${vpIx}X`], globalState.horizonY, "grey");
}

function drawHorizon(ctx) {
  line(ctx, 0, globalState.horizonY, ctx.canvas.width, globalState.horizonY, "grey");
}

function drawVanishingPoint(ctx, ix) {
  dot(ctx, globalState[`vp${ix}X`], globalState.horizonY);
}

// lower-level drawing functions (not using global state)

function rect(ctx, x, y, width, height, color = "black") {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function line(ctx, x1, y1, x2, y2, color = "black") {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function dot(ctx, x, y, color = "black") {
  ctx.beginPath();
  ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function clear(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// State mgmt functions

function bindInput(inputId, eventType, stateKey) {
  const input = document.getElementById(inputId);
  input.addEventListener(eventType, (ev) => updateState({ [stateKey]: ev.target.value }));
  updateState({ [stateKey]: input.value });
}

function updateState(newState = {}) {
  Object.assign(globalState, newState);
  drawInPerspective();
}