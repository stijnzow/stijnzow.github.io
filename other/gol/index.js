let canvas = document.getElementById("board");
canvas.width = WIDTH = window.innerWidth;
canvas.height = HEIGHT = window.innerHeight;
let ctx = canvas.getContext("2d");

const STATE_DEAD = 0;
const STATE_NEW = 1;
const STATE_ALIVE = 2;
const STATE_DYING = 3;

const COLOR_TABLE = [
  { light: "#00D", dark: "#006" },
  { light: "#0D0", dark: "#060" },
  { light: "#0DD", dark: "#066" },
  { light: "#D00", dark: "#600" },
  { light: "#D0D", dark: "#606" },
  { light: "#DD0", dark: "#660" },
  { light: "#DDD", dark: "#666" },
];
const CELL_SHAPES = ["square", "circle"];

let CELL_SIZE = 15;
let COLUMNS = Math.ceil(WIDTH / CELL_SIZE);
let ROWS = Math.ceil(HEIGHT / CELL_SIZE);

let colorId = Math.floor(Math.random() * COLOR_TABLE.length);
let shapeId = Math.floor(Math.random() * CELL_SHAPES.length);
let showGrid = false;
let isRunning = false;
let takeStep = false;
let cells = [];

function initCells() {
  cells = [];
  for (let r = 0; r < ROWS; r++) {
    cells[r] = [];
    for (let c = 0; c < COLUMNS; c++) {
      alive = Math.random() > 0.6;
      cells[r].push({
        neighbors: 0,
        isAlive: alive,
        color: "",
        state: alive ? STATE_ALIVE : STATE_DEAD,
      });
    }
  }
}

function* iterNeighbors(r, c) {
  yield { r: (r - 1 + ROWS) % ROWS, c: (c - 1 + COLUMNS) % COLUMNS };
  yield { r: (r - 1 + ROWS) % ROWS, c: (c + 0 + COLUMNS) % COLUMNS };
  yield { r: (r - 1 + ROWS) % ROWS, c: (c + 1 + COLUMNS) % COLUMNS };
  yield { r: (r + 0 + ROWS) % ROWS, c: (c - 1 + COLUMNS) % COLUMNS };
  yield { r: (r + 0 + ROWS) % ROWS, c: (c + 1 + COLUMNS) % COLUMNS };
  yield { r: (r + 1 + ROWS) % ROWS, c: (c - 1 + COLUMNS) % COLUMNS };
  yield { r: (r + 1 + ROWS) % ROWS, c: (c + 0 + COLUMNS) % COLUMNS };
  yield { r: (r + 1 + ROWS) % ROWS, c: (c + 1 + COLUMNS) % COLUMNS };
}

function draw() {
  drawBackground();
  drawGrid();
  drawCells();
}

function drawBackground() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
  if (!showGrid) {
    return;
  }
  for (let x = CELL_SIZE; x < WIDTH; x += CELL_SIZE) {
    drawLine(x, 0, x, HEIGHT);
  }
  for (let y = CELL_SIZE; y < HEIGHT; y += CELL_SIZE) {
    drawLine(0, y, WIDTH, y);
  }
}

function drawLine(x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.strokeStyle = "#DDD";
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function drawCells() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLUMNS; c++) {
      drawCell(r, c);
    }
  }
}

function buildColor(state) {
  let shade = COLOR_TABLE[colorId];
  if (state == STATE_NEW) {
    return shade.dark;
  }
  if (state == STATE_ALIVE) {
    return shade.light;
  }
  return "";
}

function drawCell(r, c) {
  let cell = cells[r][c];
  if (cell.state === STATE_DEAD) {
    return;
  }
  let color = buildColor(cell.state);
  let shapeName = CELL_SHAPES[shapeId];
  if (shapeName === "square") {
    ctx.fillStyle = color;
    ctx.fillRect(
      c * CELL_SIZE + 1,
      r * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }
  if (shapeName === "circle") {
    let rad = CELL_SIZE / 2;
    let cx = c * CELL_SIZE + rad;
    let cy = r * CELL_SIZE + rad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad, rad, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function update() {
  updateNeighbors();
  updateCellState();
}

function updateNeighbors() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLUMNS; c++) {
      let t = 0;
      for (const n of iterNeighbors(r, c)) {
        t += cells[n.r][n.c].isAlive ? 1 : 0;
      }
      cells[r][c].neighbors = t;
    }
  }
}

function updateCellState() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLUMNS; c++) {
      let n = cells[r][c].neighbors;
      let wasAlive = cells[r][c].isAlive;
      isAlive = wasAlive ? n === 2 || n === 3 : n === 3;
      cells[r][c].isAlive = isAlive;

      let state = STATE_DEAD;
      if (!wasAlive && isAlive) {
        state = STATE_NEW;
      } else if (wasAlive && !isAlive) {
        state = STATE_DYING;
      } else if (wasAlive && isAlive) {
        state = STATE_ALIVE;
      }
      cells[r][c].state = state;
    }
  }
}

function changeCellSize(delta) {
  isRunning = false;
  CELL_SIZE = Math.max(CELL_SIZE + delta, 5);
  COLUMNS = Math.ceil(WIDTH / CELL_SIZE);
  ROWS = Math.ceil(HEIGHT / CELL_SIZE);
  initCells();
  isRunning = true;
}

function tick() {
  draw();

  if (isRunning || takeStep) {
    update();
    takeStep = false;
  }
}

initCells();
isRunning = true;
setInterval(tick, 60);

document.addEventListener("keyup", (evt) => {
  if (evt.key === "g") {
    showGrid = !showGrid;
  } else if (evt.key === "p" || evt.key === " ") {
    isRunning = !isRunning;
  } else if (evt.key === "r") {
    isRunning = false;
    initCells();
    isRunning = true;
  } else if (evt.key === "n") {
    takeStep = true;
  } else if (evt.key === "c") {
    colorId = (colorId + 1) % COLOR_TABLE.length;
  } else if (evt.key === "d") {
    shapeId = (shapeId + 1) % CELL_SHAPES.length;
  } else if (evt.key === "+") {
    changeCellSize(5);
  } else if (evt.key === "-") {
    changeCellSize(-5);
  }
});
