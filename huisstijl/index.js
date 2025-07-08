let colornames = [
    "aquamarijn", "dolomiet", "gember", "hemel", "india",
    "magnolia", "marine", "middernacht", "mosterd", "noordzee",
    "olijf", "switch", "taling", "zalm"
];

function useStyle(e) {
    e.preventDefault();
    let cell = e.target;
    if (e.altKey) {
        uniformPalette(cell.style["background-color"]);
    } else {
        document.body.style["background-color"] = cell.style["background-color"];
        document.body.style["color"] = cell.style["color"];
    }
}
document.querySelectorAll("td").forEach((cell) => {
    cell.addEventListener("click", useStyle);
});


function uniformPalette(fillColor) {
    document.querySelectorAll(".palette").forEach((el) => {
        el.setAttribute("fill", fillColor);
    });
}
function randomizePalette() {
    let lastcolor = colornames[Math.floor(Math.random() * colornames.length)];
    let shuffled = colornames.sort(() => (Math.random() - .5));
    shuffled.push(lastcolor);

    let idx = 0;
    document.querySelectorAll(".palette").forEach((el) => {
        el.setAttribute("fill", `var(--${shuffled[idx]})`);
        idx++;
    });
}
document.querySelector("#btn_randomize_palette")
    .addEventListener("click", randomizePalette);

randomizePalette();
