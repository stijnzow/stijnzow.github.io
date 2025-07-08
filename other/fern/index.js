let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

let ifs = [];
let x = 0, y = 0;

function randnum(lo, hi) {
    return lo + (Math.random() * (hi - lo));
}

function remap(t, tmin, tmax, vmin, vmax) {
    let tr = (t - tmin) / (tmax - tmin);
    return vmin + tr * (vmax - vmin);
}

function initIFS() {
    let wih = window.innerHeight, wiw = window.innerWidth;
    canvas.width = wiw;
    canvas.height = wih;

    let p = 0;
    ifs = [];
    for (let i = 0; i < 4; i++) {
        let a = (i == 0 ? 0 : randnum(-1, 1));
        let b = (i == 0 ? 0 : randnum(-1, 1));
        let c = (i == 0 ? 0 : randnum(-1, 1));
        let d = randnum(-1, 1);
        let e = (i == 0 ? 0 : randnum(-1, 1));
        let f = (i == 0 ? 0 : randnum(-1, 1));
        p = randnum(p, 1);
        ifs.push({a:a, b:b, c:c, d:d, e:e, f:f, p:p});
    }

    ifs = [
        {a:0, b:0, c:0, d:0.2, e:0, f:-0.12, p:0.01},
        {a:0.845, b:0.035, c:-0.035, d:0.82, e:0, f:1.6, p:0.86},
        {a:0.2, b:-0.31, c:0.255, d:0.245, e:0, f:0.29, p:0.93},
        {a:-0.15, b:0.24, c:0.25, d:0.2, e:0, f:0.68, p:1.00}
    ];
    /*
    w   a   b   c   d   e   f   p
    f1  0   0   0   0.25    0   −0.4    0.02
    f2  0.95    0.005   −0.005  0.93    −0.002  0.5 0.84
    f3  0.035   −0.2    0.16    0.04    −0.09   0.02    0.07
    f4  −0.04   0.2 0.16    0.04    0.083   0.12    0.07
*/
}

function drawPixel() {
    let px = remap(x, -3, 3, 0, window.innerWidth);
    let py = remap(y, -0.5, 9, window.innerHeight, 0);
    // console.log("coord", {x, y}, {px, py});
    ctx.fillStyle = "#afa";
    ctx.beginPath();
    ctx.ellipse(px, py, 1, 1, 0, 0, 2 * Math.PI);
    ctx.fill();
}

function drawFern() {
    let x1 = 0, y1 = 0;
    let r = Math.random();
    let i = 3;

    if (r < ifs[0].p) {
        i = 0;
    } else if (r < ifs[1].p) {
        i = 1;
    } else if (r < ifs[2].p) {
        i = 2
    }
    x1 = ifs[i].a * x + ifs[i].b * y + ifs[i].e;
    y1 = ifs[i].c * x + ifs[i].d * y + ifs[i].f;
    [x, y] = [x1, y1];
    drawPixel();

    setTimeout(drawFern, 1);
}

window.onload = function() {
    initIFS();
    // console.log(ifs);
    drawFern()
    // for (let i = 0; i < 100000; i++) {
    //     drawFern();
    // }
};
