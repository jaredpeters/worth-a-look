// Skinder: swipe biopsy-confirmed skin lesion photos. Left = looks fine, right = get it checked.
const REQUEUE_AFTER = 30;  // a missed card comes back once, this many cards later
const STORE_KEY = "skinder.v1";

const $ = (id) => document.getElementById(id);
const stage = $("stage");

let all = [];
let view = "clinical";
let queue = [];            // upcoming cards for the current view
let current = null;
let answered = false;
let retried = new Set();   // ids already given their one second look
let flyTimer = null;      // pending switch to the answer card
let score = load();

function load() {
  const empty = { clinical: blank(), dermoscopic: blank() };
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.clinical && s.dermoscopic) { return s; }
  } catch {}
  return empty;
}
function blank() { return { malignant: 0, caught: 0, benign: 0, cleared: 0 }; }
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(score)); } catch {} }

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Half cancers, half harmless, regardless of how lopsided the archive is.
function buildQueue() {
  const pool = all.filter((c) => c.view === view);
  const mal = shuffle(pool.filter((c) => c.malignant));
  const ben = shuffle(pool.filter((c) => !c.malignant));
  const n = Math.min(mal.length, ben.length);
  queue = shuffle(mal.slice(0, n).concat(ben.slice(0, n)));
}

function renderStats() {
  const s = score[view];
  $("caught").textContent = s.malignant ? `${s.caught} of ${s.malignant}` : "–";
  $("cleared").textContent = s.benign ? `${s.cleared} of ${s.benign}` : "–";
}

function preload(c) { if (c) new Image().src = c.img; }

function show() {
  clearTimeout(flyTimer);
  if (!queue.length) buildQueue();
  current = queue.shift();
  answered = false;
  queue.slice(0, 3).forEach(preload);
  const site = current.site ? current.site.toLowerCase() : "site unknown";
  const age = current.age ? `age ${current.age}` : "age unknown";
  stage.innerHTML = `
    <div class="card pop" id="card">
      <img src="${current.img}" alt="Skin lesion photo ${current.id}">
      <div class="tag fine">Fine</div><div class="tag check">Check</div>
      <div class="meta"><span>${age} · ${current.sex || "sex unknown"}</span><span>${site}</span></div>
    </div>`;
  $("actions").innerHTML = `
    <button id="fine">← Looks fine</button>
    <button id="check">Get it checked →</button>`;
  $("fine").onclick = () => answer(false);
  $("check").onclick = () => answer(true);
  $("card").addEventListener("animationend", (e) => e.target.classList.remove("pop"));
  attachSwipe($("card"));
}

function answer(saidCheck) {
  if (answered || !current) return;
  answered = true;
  const s = score[view];
  const right = saidCheck === current.malignant;
  if (current.malignant) { s.malignant++; if (right) s.caught++; }
  else { s.benign++; if (right) s.cleared++; }
  const retry = !right && !retried.has(current.id);
  if (retry) {
    retried.add(current.id);
    queue.splice(Math.min(REQUEUE_AFTER, queue.length), 0, current);
  }
  save();
  renderStats();

  $("actions").innerHTML = `<button id="next">Next ↑</button>`;
  $("next").onclick = next;

  // Fly the card fully off in the swipe direction, then bring it back from the center with the answer.
  const card = $("card");
  const dir = saidCheck ? 1 : -1;
  card.classList.remove("anim");
  card.classList.add("fly");
  card.style.transform = `translateX(${dir * 150}vw) rotate(${dir * 30}deg)`;
  flyTimer = setTimeout(() => showResult(right, retry), 300);
}

function showResult(right, retry) {
  let big, truth;
  if (right && current.malignant) [big, truth] = ["✓ Caught it", "This was cancer"];
  else if (right) [big, truth] = ["✓ Right", "This was harmless"];
  else if (current.malignant) [big, truth] = ["✗ Missed", "This was cancer"];
  else [big, truth] = ["✗ False alarm", "This was harmless"];

  stage.innerHTML = `
    <div class="card pop" id="card">
      <div class="verdict ${right ? "ok" : "bad"}">
        <div class="big">${big}</div>
        <div class="truth">${truth}</div>
        <div class="dx">${current.dx} · confirmed by biopsy</div>
        ${retry ? `<div class="again">You'll see this one again in a while.</div>` : ""}
      </div>
      <img src="${current.img}" alt="Skin lesion photo ${current.id}">
      <div class="meta credit"><span>${current.license}${current.attribution ? ` · ${current.attribution}` : ""}</span>
        <a href="https://api.isic-archive.com/images/${current.id}/" target="_blank" rel="noopener">view on ISIC</a></div>
      <div class="hint">↑ swipe up for next</div>
    </div>`;
  attachSwipeUp($("card"));
}

// On the answer card, swipe up (or tap) to fly it off the top and bring in the next photo.
function attachSwipeUp(card) {
  let y0 = null, dy = 0;
  card.addEventListener("pointerdown", (e) => {
    if (e.target.tagName === "A") return;
    y0 = e.clientY; dy = 0;
    card.setPointerCapture(e.pointerId);
    card.classList.remove("anim", "pop");
  });
  card.addEventListener("pointermove", (e) => {
    if (y0 === null) return;
    dy = Math.min(0, e.clientY - y0);
    card.style.transform = `translateY(${dy}px)`;
  });
  const end = () => {
    if (y0 === null) return;
    y0 = null;
    if (dy < -80 || Math.abs(dy) < 5) next();
    else { card.classList.add("anim"); card.style.transform = "none"; }
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
}

function next() {
  clearTimeout(flyTimer);
  const card = $("card");
  if (!card || !answered) return show();
  card.classList.remove("anim", "pop");
  card.classList.add("fly");
  card.style.transform = "translateY(-120vh)";
  flyTimer = setTimeout(show, 250);
}

function attachSwipe(card) {
  let x0 = null, dx = 0;
  card.addEventListener("pointerdown", (e) => {
    if (answered) return;
    x0 = e.clientX; dx = 0;
    card.setPointerCapture(e.pointerId);
    card.classList.remove("anim");
  });
  card.addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
    card.querySelector(".fine").style.opacity = Math.min(1, Math.max(0, -dx / 100));
    card.querySelector(".check").style.opacity = Math.min(1, Math.max(0, dx / 100));
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null;
    if (Math.abs(dx) > 90) answer(dx > 0);
    else {
      card.classList.add("anim");
      card.style.transform = "none";
      card.querySelectorAll(".tag").forEach((t) => (t.style.opacity = 0));
    }
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") answer(false);
  else if (e.key === "ArrowRight") answer(true);
  else if ((e.key === " " || e.key === "Enter" || e.key === "ArrowUp") && answered) { e.preventDefault(); next(); }
});

document.querySelectorAll(".modes button").forEach((b) => {
  b.onclick = () => {
    view = b.dataset.view;
    document.querySelectorAll(".modes button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    buildQueue();
    renderStats();
    show();
  };
});

$("reset").onclick = () => {
  score = { clinical: blank(), dermoscopic: blank() };
  save();
  renderStats();
};

fetch("data/deck.json")
  .then((r) => { if (!r.ok) throw new Error(`deck.json: HTTP ${r.status}`); return r.json(); })
  .then((d) => { all = d.cards; buildQueue(); renderStats(); show(); })
  .catch((e) => {
    stage.innerHTML = `<div class="msg">Could not load the image deck (${e.message}).<br>
      Run <code>python3 scripts/build_deck.py</code>, then start the server with
      <code>npm start</code>.</div>`;
  });
