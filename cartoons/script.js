const parser = new DOMParser();
let firstPubdate = null;
let lastPubdate = null;

let library = new Map();
let currentPubdate = new Date();

// #region Prototyping

Date.prototype.prev = function () {
    let dt = new Date(this.getTime());
    dt.setDate(this.getDate() - 1);
    return dt;
};

Date.prototype.next = function () {
    let dt = new Date(this.getTime());
    dt.setDate(this.getDate() + 1);
    return dt;
};

Date.prototype.key = function () {
    let y = this.getFullYear();
    let m = String(this.getMonth() + 1).padStart(2, "0");
    let d = String(this.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

Date.prototype.display = function () {
    return this.toLocaleDateString("nl-BE", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// #endregion Prototyping

function addToLibrary(img_date, comic_id, img_hash) {
    if (!library.has(img_date)) {
        library.set(img_date, new Map());
    }
    let pubdate = new Date(img_date);
    firstPubdate = (firstPubdate == null ? pubdate : (pubdate < firstPubdate) ? pubdate : firstPubdate);
    lastPubdate = (lastPubdate == null ? pubdate : (lastPubdate < pubdate) ? pubdate : lastPubdate);
    library.get(img_date).set(comic_id, img_hash);
}

function parseItem(comic_id, item) {
    let title = String(item.querySelector("title").textContent);
    let img_date = title.substring(title.length - 10, title.length);
    let description = String(item.querySelector("description").textContent);
    let re_groups = /assets\/([0-9a-f]+)/.exec(description);
    let img_hash = re_groups[1];
    addToLibrary(img_date, comic_id, img_hash);
}

async function parseComic(comic_id) {
    let feed_url = `https://comiccaster.xyz/rss/${comic_id}`;
    let xml = await (await fetch(feed_url)).text();
    let doc = parser.parseFromString(xml, "text/xml");
    let rss = doc.querySelector("rss");
    let channel = rss.querySelector("channel");

    channel.querySelectorAll("item")
        .forEach((item) => parseItem(comic_id, item));
}

async function loadFeeds() {
    let comicIds = [
        "garfield",
        "wizardofid",
        "andycapp",
        "glasbergen-cartoons",
        "offthemark",
    ];

    await Promise.all(comicIds.map(parseComic));
}


async function setComicImage(img_hash, comic_id) {
    let img = document.querySelector(`#${comic_id} img`);
    let img_url = `https://featureassets.gocomics.com/assets/${img_hash}`;
    img.src = img_url;
}

async function setCurrentPubdateTo(pubdate) {
    let key = pubdate.key()
    if (!library.has(key)) {
        return;
    }
    if (pubdate === currentPubdate) {
        return;
    }
    currentPubdate = pubdate;

    document.getElementById("btn-first").disabled = (pubdate <= firstPubdate);
    document.getElementById("btn-prev").disabled = (pubdate <= firstPubdate) || (lastPubdate < pubdate);
    document.getElementById("btn-next").disabled = (pubdate < firstPubdate) || (lastPubdate <= pubdate);
    document.getElementById("btn-last").disabled = (lastPubdate <= pubdate);

    library.get(key).forEach(setComicImage);

    let main = document.getElementsByTagName("main")[0];
    main.classList.toggle("sunday", pubdate.getDay() === 0);

    document.getElementById("datesig").textContent = pubdate.display();
    document.title = `Cartoons of ${pubdate.display()}`;
}

async function changePubdateTo(which) {
    let keys = Array.from(library.keys());
    if (which === "first") {
        let firstKey = keys.reduce((a, b) => { return (a < b) ? a : b; });
        setCurrentPubdateTo(new Date(firstKey));
    } else if (which === "prev") {
        setCurrentPubdateTo(currentPubdate.prev());
    } else if (which === "random") {
        // never pick the current pubdate
        keys = keys.filter(key => new Date(key) != currentPubdate);
        let idx = Math.floor(Math.random() * keys.length);
        let randomPubdate = new Date(keys[idx]);
        setCurrentPubdateTo(randomPubdate);
    } else if (which === "next") {
        setCurrentPubdateTo(currentPubdate.next());
    } else if (which === "last") {
        let lastKey = keys.reduce((a, b) => { return (a < b) ? b : a; });
        setCurrentPubdateTo(new Date(lastKey));
    }
}

async function onKeyUp(evt) {
    if (evt.key == "a") {
        changePubdateTo("first");
    } else if (evt.key == "p") {
        changePubdateTo("prev");
    } else if (evt.key == "n") {
        changePubdateTo("next");
    } else if (evt.key == "r") {
        changePubdateTo("random");
    } else if (evt.key == "z") {
        changePubdateTo("last");
    }
}

window.onload = async function () {
    await loadFeeds();
    changePubdateTo("last");
    window.addEventListener("keyup", (evt) => onKeyUp(evt));
};
