let btnPrev = document.querySelector("#prev");
let btnNext = document.querySelector("#next");
let cartoons = document.querySelector("#cartoons");
let title = document.querySelector("title");
let dateSig = document.querySelector("#date_sig");

// region Prototyping

Date.prototype.isSunday = function () {
  return this.getDay() == 0;
};

Date.prototype.yesterday = function () {
  let dt = new Date(this.getTime());
  dt.setDate(this.getDate() - 1);
  return dt;
};

Date.prototype.tomorrow = function () {
  let dt = new Date(this.getTime());
  dt.setDate(this.getDate() + 1);
  return dt;
};

Date.prototype.asUrlPath = function () {
  let y = this.getFullYear();
  let m = String(this.getMonth() + 1).padStart(2, "0");
  let d = String(this.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
};

Date.prototype.asUrlHash = function () {
  let y = this.getFullYear();
  let m = this.getMonth() + 1;
  let d = this.getDate();
  return `#${y}-${m}-${d}`;
};

Date.prototype.asSignature = function () {
  return this.toLocaleDateString("nl-BE", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

Date.prototype.asPublished = function () {
  return this.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
};

// endregion Prototyping

function randBetween(lo, hi) {
  let [randomInt] = crypto.getRandomValues(new Uint32Array(1));
  let UINT32_MAX = 4294967295;
  let factor = randomInt / (UINT32_MAX + 1);
  return lo + Math.round(factor * (hi - lo));
}

async function parseGoComics(name, dt) {
  let url = "https://www.gocomics.com/" + name + "/" + dt.asUrlPath();
  let r = await fetch(url, { signal: AbortSignal.timeout(5000) }).catch(() => {
    return "";
  });
  if (!r.ok) {
    return "";
  }
  let parser = new DOMParser();
  let doc = parser.parseFromString(await r.text(), "text/html");
  let comic_url = "";
  doc.querySelectorAll("script[type='application/ld+json']").forEach((el) => {
    let meta = JSON.parse(el.text);
    if (meta.datePublished === dt.asPublished()) {
      comic_url = meta.url;
    }
  });
  return comic_url;
}

async function updateCard(name, dt) {
  let card = document.querySelector(`#${name}`);
  card.dataset.state = "loading";
  let img = card.querySelector(`.image`);
  img.src = "";
  let url = await parseGoComics(name, dt).catch((error) => {
    console.error(error);
    card.dataset.state = "not-found";
    return;
  });
  if (!!url) {
    img.onload = () => {
      card.dataset.state = "found";
    };
    img.src = url;
  } else {
    card.dataset.state = "not-found";
  }
}

async function updatePage(dt) {
  title.innerText = `Cartoons on ${dt.asSignature()}`;
  dateSig.innerText = dt.asSignature();
  cartoons.classList.toggle("sunday", dt.isSunday());
  btnPrev.setAttribute("href", dt.yesterday().asUrlHash());
  btnNext.setAttribute("href", dt.tomorrow().asUrlHash());

  let names = ["offthemark", "garfield", "wizardofid", "andycapp", "glasbergen-cartoons"];
  names.forEach((name) => updateCard(name, dt));
}

async function onHashChange() {
  let hash = window.location.hash.substring(1);
  let dt = new Date(Date.now());

  if (hash === "random") {
    let start_time = new Date(2002, 0, 1).getTime();
    let today_time = new Date().getTime();
    let rand_time = randBetween(start_time, today_time);
    dt = new Date(rand_time);
  } else {
    let parseable = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
    if (parseable.test(hash)) {
      dt = new Date(Date.parse(hash));
    }
  }

  updatePage(dt);
}

async function onKeyUp(evt) {
  if (evt.key == "t") {
    window.location.hash = "";
    onHashChange();
  } else if (evt.key == "p") {
    window.location.hash = btnPrev.getAttribute("href");
    onHashChange();
  } else if (evt.key == "n") {
    window.location.hash = btnNext.getAttribute("href");
    onHashChange();
  } else if (evt.key == "r") {
    window.location.hash = "#random";
    onHashChange();
  }
}

window.onload = async function () {
  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("keyup", (evt) => onKeyUp(evt));

  onHashChange();
};
