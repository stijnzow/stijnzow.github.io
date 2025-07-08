let canvas = document.getElementById("board");
canvas.width = WIDTH = window.innerWidth;
canvas.height = HEIGHT = window.innerHeight;
let ctx = canvas.getContext("2d");

let CELL_SIZE = 20;
let COLUMNS = Math.ceil(WIDTH / CELL_SIZE);
let ROWS = Math.ceil(HEIGHT / CELL_SIZE);

class Ant {
  constructor() {
    this.dx = 1;
    this.dy = 0;
    this.x = Math.floor(COLUMNS / 2);
    this.y = Math.floor(ROWS / 2);
  }

  doTurn(isWhite) {
    if (isWhite) {
      // white = turn clockwise
      [this.dx, this.dy] = [-this.dy, this.dx];
    } else {
      // black = turn counter-clockwise
      [this.dx, this.dy] = [this.dy, -this.dx];
    }
  }

  moveForward() {
    this.x = (this.x + this.dx + COLUMNS) % COLUMNS;
    this.y = (this.y + this.dy + ROWS) % ROWS;
  }
}

let isRunning = false;
let tiles = [];
let ant = new Ant();

function initTiles() {
  tiles = [];
  for (let r = 0; r < ROWS; r++) {
    tiles[r] = [];
    for (let c = 0; c < COLUMNS; c++) {
        tiles[r].push(Math.random() > 0.7);
      // tiles[r].push(false);
    }
  }
}

function draw() {
  drawBackground();
  drawTiles();
  drawGrid();
  drawAnt();
}

function drawBackground() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawTiles() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLUMNS; c++) {
      if (tiles[r][c]) {
        ctx.fillStyle = "#FFF";
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function drawGrid() {
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

function drawAnt() {
  let p = [];
  let m = 2;
  let [L, R, T, B] = [m, CELL_SIZE - m, m, CELL_SIZE - m];
  if (ant.dx == 1) {
    // facing east
    p = [L, T, L, B, R, CELL_SIZE / 2];
  } else if (ant.dx == -1) {
    // facing west
    p = [L, CELL_SIZE / 2, R, T, R, B];
  } else if (ant.dy == -1) {
    // facing north
    p = [CELL_SIZE / 2, T, L, B, R, B];
  } else if (ant.dy == 1) {
    // facing south
    p = [L, T, R, T, CELL_SIZE / 2, B];
  } else {
    return;
  }
  let ulx = ant.x * CELL_SIZE;
  let uly = ant.y * CELL_SIZE;
  ctx.beginPath();
  ctx.moveTo(ulx + p[0], uly + p[1]);
  ctx.lineTo(ulx + p[2], uly + p[3]);
  ctx.lineTo(ulx + p[4], uly + p[5]);
  ctx.closePath();
  ctx.fillStyle = "#F00";
  ctx.fill();
}

function tick() {
  draw();

  let isWhite = tiles[ant.y][ant.x];
  ant.doTurn(isWhite);
  tiles[ant.y][ant.x] = !isWhite;
  ant.moveForward();
}

initTiles();
isRunning = true;
setInterval(tick, 60);
