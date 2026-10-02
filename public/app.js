// Skinder: swipe biopsy-confirmed skin lesion photos. Left = looks fine, right = get it checked.
const REQUEUE_AFTER = 8;   // a missed card comes back this many cards later
const STORE_KEY = "skinder.v1";

const $ = (id) => document.getElementById(id);
const stage = $("stage");

let all = [];
let view = "clinical";
let queue = [];            // upcoming cards for the current view
let current = null;
let answered = false;
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
  if (!queue.length) buildQueue();
  current = queue.shift();
  answered = false;
  preload(queue[0]);
  const site = current.site ? current.site.toLowerCase() : "site unknown";
  const age = current.age ? `age ${current.age}` : "age unknown";
  stage.innerHTML = `
    <div class="card" id="card">
      <img src="${current.img}" alt="Skin lesion photo ${current.id}">
      <div class="tag fine">Fine</div><div class="tag check">Check</div>
      <div class="meta"><span>${age} · ${current.sex || "sex unknown"}</span><span>${site}</span></div>
    </div>`;
  $("actions").innerHTML = `
    <button id="fine">← Looks fine</button>
    <button id="check">Get it checked →</button>`;
  $("fine").onclick = () => answer(false);
  $("check").onclick = () => answer(true);
  attachSwipe($("card"));
}

function answer(saidCheck) {
  if (answered || !current) return;
  answered = true;
  const s = score[view];
  const right = saidCheck === current.malignant;
  if (current.malignant) { s.malignant++; if (right) s.caught++; }
  else { s.benign++; if (right) s.cleared++; }
  if (!right) queue.splice(Math.min(REQUEUE_AFTER, queue.length), 0, current);
  save();
  renderStats();

  const card = $("card");
  card.classList.add("anim");
  card.style.transform = "none";
  card.querySelectorAll(".tag").forEach((t) => (t.style.opacity = 0));

  let headline;
  if (right && current.malignant) headline = `<h2 class="ok">Caught it. This was cancer.</h2>`;
  else if (right) headline = `<h2 class="ok">Right. This was harmless.</h2>`;
  else if (current.malignant) headline = `<h2 class="bad">Missed. This was cancer.</h2>`;
  else headline = `<h2 class="bad">False alarm. This was harmless.</h2>`;

  const r = document.createElement("div");
  r.className = "reveal";
  r.innerHTML = `${headline}
    <p><b>${current.dx}</b>${current.group && current.group !== current.dx ? ` — ${current.group}` : ""}</p>
    <p>Confirmed by biopsy.${right ? "" : " You'll see this one again shortly."}</p>
    <small>${current.id} · ${current.license}${current.attribution ? ` · ${current.attribution}` : ""} ·
      <a href="https://api.isic-archive.com/images/${current.id}/" target="_blank" rel="noopener">view on ISIC</a></small>`;
  card.appendChild(r);

  $("actions").innerHTML = `<button id="next">Next (space)</button>`;
  $("next").onclick = show;
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
  else if ((e.key === " " || e.key === "Enter") && answered) { e.preventDefault(); show(); }
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
