const COLORNAMES = [
  "aquamarijn",
  "dolomiet",
  "gember",
  "hemel",
  "india",
  "magnolia",
  "marine",
  "middernacht",
  "mosterd",
  "noordzee",
  "olijf",
  "switch",
  "taling",
  "zalm",
];

let openCards = [];
let preventClick = false;
let statMatches = 0;
let statTries = 0;
let gameState = "idle";

async function handleMatch() {
  let colorA = openCards[0].dataset.color;
  let colorB = openCards[1].dataset.color;
  let newState = colorA === colorB ? "matched" : "closed";
  openCards[0].dataset.state = newState;
  openCards[1].dataset.state = newState;
  openCards = [];

  statTries++;
  if (newState === "matched") {
    statMatches++;
    if (statMatches == COLORNAMES.length) {
      gameState = "game_over";
    }
  }

  if (gameState === "game_over" && confirm("You won!\nPlay again?")) {
    initGame();
  }
  preventClick = false;
}

async function checkMatch() {
  if (openCards.length !== 2) {
    return;
  }
  preventClick = true;
  setTimeout(() => handleMatch(), 1000);
}

async function onCardClick(card) {
  if (
    preventClick ||
    card.dataset.state === "matched" ||
    gameState === "game_over"
  ) {
    return;
  }

  if (gameState === "idle") {
    gameState = "playing";
  }

  let state = card.dataset.state;
  if (state === "closed") {
    card.dataset.state = "open";
    openCards.push(card);
    checkMatch();
  } else if (state === "open") {
    card.dataset.state = "closed";
    openCards = openCards.filter((x) => x !== card);
  }
}

async function addCard(parent, colorname) {
  let card = document.createElement("div");
  card.classList.add("card");
  card.dataset.color = colorname;
  card.dataset.state = "closed";
  let p_name = document.createElement("p");
  p_name.classList.add("colorname");
  p_name.innerText = colorname;
  card.appendChild(p_name);
  let p_lock = document.createElement("p");
  p_lock.classList.add("icon");
  card.appendChild(p_lock);
  card.addEventListener("click", () => {
    onCardClick(card);
  });
  parent.appendChild(card);
}

async function initGame() {
  let colors = COLORNAMES.concat(COLORNAMES);
  for (let i = colors.length - 1; i >= 1; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  let game = document.querySelector("#game");
  game.innerHTML = "";
  colors.forEach((name) => {
    addCard(game, name);
  });

  statMatches = 0;
  statTries = 0;
  gameState = "idle";
}

window.onload = initGame;
