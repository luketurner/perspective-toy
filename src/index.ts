
/**
 * Function to initialize a perspective-toy instance. Accepts options:
 * 
 * - elCanvas -- canvas element to draw on
 * - elInputPerspectiveType -- input for perspective type
 * - elInputHorizon -- input for horizon line height
 * - elInputVanishingPointOne -- input for first vanishing point X-coordinate
 * - elInputVanishingPointTwo -- input for second vanishing point X-coordinate
 * 
 */
function initPerspectiveToy(opts) {

  // define shared state

  const state = {
    horizonY: 400,
    vp1X: 400,
    vp2X: 200,
    type: '1p',
    cubeDepth: 0.25
  };

  const ctx = opts.elCanvas.getContext('2d');

  // bind inputs to state

  bindInput(opts.elInputPerspectiveType,   'change', 'type');
  bindInput(opts.elInputHorizon,           'input',  'horizonY');
  bindInput(opts.elInputVanishingPointOne, 'input',  'vp1X');
  bindInput(opts.elInputVanishingPointTwo, 'input',  'vp2X');

  // "entry point" function

  function redraw() {
    clear();
    drawHorizon();
    if (state.type === '1p') {
      drawRect1P(350, 600, 100);
    } else {
      drawRect2P(400, 600, 100);
    }
  }

  // helper functions

  function drawRect1P(x, y, width) {
    drawVanishingPoint(1);
    
    drawVanishingLine(x,         y,         1);
    drawVanishingLine(x,         y + width, 1);
    drawVanishingLine(x + width, y,         1);
    drawVanishingLine(x + width, y + width, 1);

    const depth = state.cubeDepth;
    
    const [bx1, by1] = moveToVanishingPoint(x, y, depth, 1);
    const [bx2, by2] = moveToVanishingPoint(x + width, y, depth, 1);
    const [bx3, by3] = moveToVanishingPoint(x, y + width, depth, 1);
    const [bx4, by4] = moveToVanishingPoint(x + width, y + width, depth, 1);
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

  function drawRect2P(x, y, h) {
    drawVanishingPoint(1);
    drawVanishingPoint(2);

    line(x, y, x, y + h);
    drawVanishingLine(x, y,     1);
    drawVanishingLine(x, y + h, 1);
    drawVanishingLine(x, y,     2);
    drawVanishingLine(x, y + h, 2);

    const depth = state.cubeDepth;

    const [v1x, v1y] = vpCoords(1);
    const [v2x, v2y] = vpCoords(2);

    const [bx1, by1] = moveToVanishingPoint(x, y, depth, 1);
    const [bx2, by2] = moveToVanishingPoint(x, y, depth, 2);
    const [bx3, by3] = moveToVanishingPoint(x, y + h, depth, 1);
    const [bx4, by4] = moveToVanishingPoint(x, y + h, depth, 2);

    const [ix1, iy1] = findLineIntersection(bx1, by1, v2x, v2y, bx2, by2, v1x, v1y);
    const [ix2, iy2] = findLineIntersection(bx3, by3, v2x, v2y, bx4, by4, v1x, v1y);

    drawVanishingLine(ix1, iy1, 1);
    drawVanishingLine(ix1, iy1, 2);
    drawVanishingLine(ix2, iy2, 1);
    drawVanishingLine(ix2, iy2, 2);

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
    return [state[`vp${ix}X`], state.horizonY];
  }

  function drawVanishingLine(x, y, vpIx) {
    line(x, y, state[`vp${vpIx}X`], state.horizonY, "grey");
  }

  function drawHorizon() {
    line(0, state.horizonY, ctx.canvas.width, state.horizonY, "grey");
  }

  function drawVanishingPoint(ix) {
    dot(state[`vp${ix}X`], state.horizonY);
  }

  function rect(x, y, width, height, color = "black") {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function line(x1, y1, x2, y2, color = "black") {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function dot(x, y, color = "black") {
    ctx.beginPath();
    ctx.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function clear() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function bindInput(input, eventType, stateKey) {
    input.addEventListener(eventType, (ev) => updateState({ [stateKey]: ev.target.value }));
    updateState({ [stateKey]: input.value });
  }

  function updateState(newState = {}) {
    Object.assign(state, newState);
    redraw();
  }

}

initPerspectiveToy({
  elCanvas: document.getElementById("main-canvas"),
  elInputPerspectiveType: document.getElementById("perspective-type"),
  elInputHorizon: document.getElementById("horizon-input"),
  elInputVanishingPointOne: document.getElementById("vp1-input"),
  elInputVanishingPointTwo: document.getElementById("vp2-input"),
})

