// 093_DoublePendulum/Processing/CC_093_DoublePendulum/CC_093_DoublePendulum.pde
// https://github.com/AmaanC/codepens/blob/gh-pages/double-pendulum/pendulum.js

let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

function randnum(a, b) {
  let lo = Math.min(a, b);
  let hi = Math.max(a, b);
  return lo + Math.floor(Math.random() * (hi - lo));
}

let vars = {
  r1: 0,
  m1: 0,
  r2: 0,
  m2: 0,
};
let cx = window.innerWidth / 2; //centre of x for background
let cy = window.innerHeight / 3; //centre y for background

let a1 = randnum(-Math.PI, Math.PI); // angle formed by first pendulum and normal - angle1
let a2 = randnum(-Math.PI, Math.PI); //angle formed by second pendulum and normal - angle2
let a1_v = 0; //angular velocity of pendulum1
let a2_v = 0; //angular velocity of pendulum2
let g = 1; //gravitational constant (realistic value not considered for simplicity )
let path = null;

function initValue(name, lo, hi) {
  vars[name] = randnum(lo, hi);
  let el = document.querySelector(`#${name}`);
  let elVal = document.querySelector(`#${name}val`);
  el.addEventListener("input", (evt) => {
    vars[name] = evt.srcElement.valueAsNumber;
    elVal.innerHTML = evt.srcElement.value;
  });
  el.value = vars[name];
  elVal.innerHTML = vars[name];
}

async function initValues() {
  initValue("r1", 100, 300);
  initValue("m1", 20, 150);
  initValue("r2", 100, 300);
  initValue("m2", 20, 150);
}

function drawLine(x0, y0, x1, y1, color) {
  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.lineWidth = 10;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + x0, cy + y0);
  ctx.lineTo(cx + x1, cy + y1);
  ctx.stroke();
}

function drawDot(x, y, radius, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.ellipse(cx + x, cy + y, radius, radius, 0, 0, 2 * Math.PI);
  ctx.fill();
}

let start = null;
function animateStart(ts) {
  start = ts;
  animateTick(ts);
}

function animateTick(ts) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let num1 = -g * (2 * vars["m1"] + vars["m2"]) * Math.sin(a1);
  let num2 = -vars["m2"] * g * Math.sin(a1 - 2 * a2);
  let num3 = -2 * Math.sin(a1 - a2) * vars["m2"];
  let num4 =
    a2_v * a2_v * vars["r2"] + a1_v * a1_v * vars["r1"] * Math.cos(a1 - a2);
  let den =
    vars["r1"] *
    (2 * vars["m1"] + vars["m2"] - vars["m2"] * Math.cos(2 * a1 - 2 * a2));
  let a1_a = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * Math.sin(a1 - a2);
  num2 = a1_v * a1_v * vars["r1"] * (vars["m1"] + vars["m2"]);
  num3 = g * (vars["m1"] + vars["m2"]) * Math.cos(a1);
  num4 = a2_v * a2_v * vars["r2"] * vars["m2"] * Math.cos(a1 - a2);
  den =
    vars["r2"] *
    (2 * vars["m1"] + vars["m2"] - vars["m2"] * Math.cos(2 * a1 - 2 * a2));
  let a2_a = (num1 * (num2 + num3 + num4)) / den;

  let x1 = vars["r1"] * Math.sin(a1);
  let y1 = vars["r1"] * Math.cos(a1);
  let x2 = x1 + vars["r2"] * Math.sin(a2);
  let y2 = y1 + vars["r2"] * Math.cos(a2);

  if (path === null) {
    path = new Path2D();
    path.moveTo(cx + x2, cy + y2);
  } else {
    path.lineTo(cx + x2, cy + y2);
  }

  if (path) {
    ctx.beginPath();
    ctx.strokeStyle = "lightblue";
    ctx.lineWidth = 1;
    ctx.stroke(path);
  }

  drawLine(0, 0, x1, y1, "yellow");
  drawLine(x1, y1, x2, y2, "yellow");
  drawDot(x1, y1, vars["m1"], "green");
  drawDot(x2, y2, vars["m2"], "green");

  a1_v += a1_a;
  a2_v += a2_a;
  a1 += a1_v;
  a2 += a2_v;

  requestAnimationFrame(animateTick);
}

function windowResized() {
  canvas.width = window.innerWidth;
  canvas.height = 0.95 * window.innerHeight;
  cx = window.innerWidth / 2; //centre of x for background
  cy = canvas.height / 3; //centre y for background
}

window.onresize = windowResized;

window.onload = function () {
  windowResized();

  initValues();

  requestAnimationFrame(animateStart);
};
