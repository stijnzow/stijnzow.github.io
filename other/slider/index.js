let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

let dim = 3;
let off_x = 0;
let off_y = 0;
let tile_size = 0;
let tiles = [];
let is_solved = false;

function changeView() {
  let wih = window.innerHeight, wiw = window.innerWidth;
  canvas.width = wiw;
  canvas.height = wih;

  let tile_height = Math.round(wih / dim);
  let tile_width = Math.round(wiw / dim);
  tile_size = Math.min(tile_height, tile_width);

  off_x = Math.abs(Math.round((wiw - (dim * tile_size)) / 2));
  off_y = Math.abs(Math.round((wih - (dim * tile_size)) / 2));

  drawGame();
}

function changeGameSize(newDim) {
  dim = Math.max(newDim, 3);
  newGame();
  changeView();
}

function shuffleTiles() {
  for (let i = tiles.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
}

function countInversions() {
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] == tiles.length || tiles[j] == tiles.length) {
        continue;
      }
      if (tiles[i] > tiles[j]) {
        inversions += 1
      }
    }
  }
  return inversions;
}

function hasSolution() {
  let inversions = countInversions();

  if (dim % 2 == 1) {
    return inversions % 2 == 0;
  } else {
    let rx = Math.floor(tiles.indexOf(tiles.length) / dim);
    rx = (dim + 1 - rx);
    if (rx % 2 == 1) {
      return inversions % 2 == 1;
    } else {
      return inversions % 2 == 0;
    }
  }
  return false;
}

function newGame() {
  tiles = [];
  for (let i = 0; i < dim * dim; i++) {
    tiles.push(tiles.length + 1);
  }

  do {
    shuffleTiles();
  } while (!hasSolution());
  is_solved = false;
}

function drawTile(r, c) {
  let i = (r * dim) + c;
  if (tiles[i] == tiles.length) {
    return;
  }

  let top = off_y + r * tile_size, left = off_x + c * tile_size;
  let is_in_place = tiles[i] - 1 == tiles.indexOf(tiles[i]);
  ctx.fillStyle = (is_in_place ? "#afa" : "#ddd");
  ctx.fillRect(left, top, tile_size - 1, tile_size - 1);

  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center"
  ctx.font = "" + Math.round(tile_size / 3) + "px Arial";
  ctx.fillText(tiles[i], left + tile_size / 2, top + tile_size / 2);
}

function drawGame() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      drawTile(r, c);
    }
  }

}

function trySlide(dx, dy) {
  if (is_solved) {
    return;
  }

  let i0 = tiles.indexOf(tiles.length);
  let r0 = Math.floor(i0 / dim), c0 = i0 % dim;

  let rt = r0 - dy, ct = c0 - dx;
  if (rt < 0 || rt == dim || ct < 0 || ct == dim) {
    return;
  }

  let it = rt * dim + ct;
  [tiles[it], tiles[i0]] = [tiles[i0], tiles[it]];

  is_solved = true;
  for (let i = 0; i < tiles.length; i++) {
    is_solved = is_solved & (tiles[i] - 1 == i);
  }

  drawGame();
  if (is_solved) {
    // alert seems to come before drawing of tiles is finished
    setTimeout(() => {alert("solved!");}, 500);
  }
}

function handleKeyPress(evt) {
  if (evt.key == "+") {
    changeGameSize(dim + 1);
  } else if (evt.key == "-") {
    changeGameSize(dim - 1);
  } else if (evt.key == "n") {
    newGame();
    drawGame();
  }
}

function handleKeyUp(evt) {
  if (evt.key == "ArrowLeft") {
    trySlide(-1, 0);
  } else if (evt.key == "ArrowRight") {
    trySlide(1, 0);
  } else if (evt.key == "ArrowUp") {
    trySlide(0, -1);
  } else if (evt.key == "ArrowDown") {
    trySlide(0, 1);
  }
}

window.onload = function() {
  window.addEventListener("keypress", handleKeyPress);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", function (e) { changeView(); });

  changeGameSize(3);
}