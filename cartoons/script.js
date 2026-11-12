let allComics = [
    { id: "garfield", feed: "garfield", wxh: "900x250" },
    { id: "wizardofid", feed: "wizardofid", wxh: "900x250" },
    { id: "andycapp", feed: "andycapp", wxh: "900x250" },
    { id: "glasbergen", feed: "glasbergen-cartoons", wxh: "400x400" },
    { id: "offthemark", feed: "offthemark", wxh: "450x540" },
];

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

function addToLibrary(img_date, comic, img_hash) {
    if (!library.has(img_date)) {
        library.set(img_date, new Map());
    }
    let pubdate = new Date(img_date);
    firstPubdate = (firstPubdate == null ? pubdate : (pubdate < firstPubdate) ? pubdate : firstPubdate);
    lastPubdate = (lastPubdate == null ? pubdate : (lastPubdate < pubdate) ? pubdate : lastPubdate);
    library.get(img_date).set(comic.id, img_hash);
}

function parseItem(comic, item) {
    let title = String(item.querySelector("title").textContent);
    let img_date = title.substring(title.length - 10, title.length);
    let description = String(item.querySelector("description").textContent);
    let re_groups = /assets\/([0-9a-f]+)/.exec(description);
    let img_hash = re_groups[1];
    addToLibrary(img_date, comic, img_hash);
}

async function loadComic(comic) {
    let feed_url = `https://comiccaster.xyz/rss/${comic.feed}`;
    let xml = await (await fetch(feed_url)).text();
    let doc = parser.parseFromString(xml, "text/xml");
    let rss = doc.querySelector("rss");
    let channel = rss.querySelector("channel");

    channel.querySelectorAll("item")
        .forEach((item) => parseItem(comic, item));
}

async function updateComicImage(comic, pubdate) {
    let key = pubdate.key()
    let img_hash = library.get(key).get(comic.id)
    let img_url = `https://placehold.co/${comic.wxh}/444/ddd?text=:-(+Not+found`;
    if (img_hash !== undefined) {
        img_url = `https://featureassets.gocomics.com/assets/${img_hash}`;
    }
    let img = document.querySelector(`#${comic.id} img`);
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

    allComics.map((comic) => updateComicImage(comic, pubdate));

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
    await Promise.all(allComics.map(loadComic));

    changePubdateTo("last");
    window.addEventListener("keyup", (evt) => onKeyUp(evt));
};
