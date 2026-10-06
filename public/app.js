// Worth a Look: swipe real skin-spot photos. Left = looks fine, right = get it checked.
const ROUND = 20;            // cards per round
const CANCERS_PER_ROUND = 6; // 30%: plenty of cancer practice without making every spot look like one
const RETRY_AFTER_ROUNDS = 1; // a missed card comes back once, in the round after next
const HISTORY = 20;          // rounds kept per mode
const STORE_KEY = "skinder.v1"; // original name kept so saved scores survive the rename
const CHECKS_KEY = "skinder.checks";

const $ = (id) => document.getElementById(id);
const stage = $("stage");

let all = [];
// Which photos each mode deals from.
const MODES = {
  clinical: (c) => c.view === "clinical",
  dermoscopic: (c) => c.view === "dermoscopic",
  headneck: (c) => c.view === "clinical" && c.site === "Head and neck",
};
let mode = "clinical";
let pools = {};            // per mode: shuffled cancers and harmless ones still to deal
let queue = [];            // cards left in this round
let round = null;          // this round's tally and results
let roundNo = 0;
let retries = [];          // missed cards waiting for their one second look
let retried = new Set();   // ids already given that second look
let current = null;
let answered = false;
let flyTimer = null;       // pending switch to the answer card
let score = load();
let checkSets = [];        // the two fixed skill checks, as lists of cards
let checkIds = new Set();  // their photos never appear in normal rounds
let check = null;          // the skill check in progress: { set, cards, said: [] }
let checks = loadChecks(); // finished skill checks

function load() {
  const s = blankScore();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    for (const m in s) if (saved[m]) s[m] = { ...blank(), ...saved[m] };
  } catch {}
  return s;
}
function blank() { return { malignant: 0, caught: 0, benign: 0, cleared: 0, rounds: [] }; }
function blankScore() { return Object.fromEntries(Object.keys(MODES).map((m) => [m, blank()])); }
function loadChecks() {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY)) || []; } catch { return []; }
}
function saveChecks() { try { localStorage.setItem(CHECKS_KEY, JSON.stringify(checks)); } catch {} }
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(score)); } catch {} }

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Darker skin (Fitzpatrick IV-VI) is under 1% of the archive's photos. Dealing it at this share
// instead means players actually see it; those photos repeat sooner as a result.
const DARK_SHARE = 0.2;
const isDark = (c) => ["IV", "V", "VI"].includes(c.skin);

// Next unseen card of one kind. Darker-skin and other photos are dealt from separate shuffled piles,
// each reshuffled once every card in it has been dealt.
function draw(malignant, taken = new Set()) {
  const p = (pools[mode] ||= {});
  const pile = (dark) => {
    const key = (malignant ? "mal" : "ben") + (dark ? "-dark" : "");
    if (!p[key] || !p[key].length) {
      p[key] = shuffle(all.filter((c) => MODES[mode](c) && c.malignant === malignant && !checkIds.has(c.id) && isDark(c) === dark));
    }
    return p[key];
  };
  // A small pile can reshuffle mid-round; skip anything already in this round.
  for (let tries = 0; tries < 20; tries++) {
    const from = Math.random() < DARK_SHARE && pile(true).length ? pile(true) : pile(false);
    const c = from.pop();
    if (c && !taken.has(c.id)) return c;
  }
  return pile(false).pop();
}

// A round is 6 cancers and 14 harmless spots. Missed cards that are due take a slot of their own kind.
function buildRound() {
  roundNo++;
  const due = retries.filter((r) => r.mode === mode && r.round <= roundNo);
  retries = retries.filter((r) => !due.includes(r));
  const dueMal = due.filter((r) => r.card.malignant).map((r) => r.card).slice(0, CANCERS_PER_ROUND);
  const dueBen = due.filter((r) => !r.card.malignant).map((r) => r.card).slice(0, ROUND - CANCERS_PER_ROUND);
  const cards = [...dueMal, ...dueBen];
  const taken = new Set(cards.map((c) => c.id));
  const add = (c) => { cards.push(c); taken.add(c.id); };
  for (let i = dueMal.length; i < CANCERS_PER_ROUND; i++) add(draw(true, taken));
  for (let i = dueBen.length; i < ROUND - CANCERS_PER_ROUND; i++) add(draw(false, taken));
  queue = shuffle(cards);
  round = { malignant: 0, caught: 0, benign: 0, cleared: 0, results: [] };
  renderProgress();
}

function renderStats() {
  const s = score[mode];
  $("caught").textContent = s.malignant ? `${s.caught} of ${s.malignant}` : "–";
  $("cleared").textContent = s.benign ? `${s.cleared} of ${s.benign}` : "–";
}

// One cell per card in the round: green right, red wrong, empty still to come.
function renderProgress() {
  if (check) {  // no right or wrong colors during a check: answers come at the end
    $("progress").innerHTML = check.cards.map((_, i) =>
      `<i class="${i < check.said.length ? "done" : ""}${i === check.said.length ? " now" : ""}"></i>`).join("");
    return;
  }
  const r = round ? round.results : [];
  $("progress").innerHTML = Array.from({ length: ROUND }, (_, i) =>
    `<i class="${r[i] === undefined ? "" : r[i] ? "ok" : "bad"}${i === r.length ? " now" : ""}"></i>`).join("");
}

function preload(c) { if (c) new Image().src = c.img; }

function show() {
  clearTimeout(flyTimer);
  if (check) current = check.cards[check.said.length];
  else {
    if (!round || !queue.length) buildRound();
    current = queue.shift();
  }
  answered = false;
  (check ? check.cards.slice(check.said.length + 1, check.said.length + 4) : queue.slice(0, 3)).forEach(preload);
  const where = current.site_detail || current.site;
  const site = where ? where.toLowerCase() : "site unknown";
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
  if (check) return answerCheck(saidCheck);
  const s = score[mode];
  const right = saidCheck === current.malignant;
  for (const t of [s, round]) {
    if (current.malignant) { t.malignant++; if (right) t.caught++; }
    else { t.benign++; if (right) t.cleared++; }
  }
  round.results.push(right);
  const retry = !right && !retried.has(current.id);
  if (retry) {
    retried.add(current.id);
    retries.push({ card: current, mode, round: roundNo + 1 + RETRY_AFTER_ROUNDS });
  }
  if (round.results.length >= ROUND) {
    const { malignant, caught, benign, cleared } = round;
    s.rounds = [...s.rounds, { malignant, caught, benign, cleared }].slice(-HISTORY);
  }
  save();
  renderStats();
  renderProgress();

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
  const note = noteFor(current.dx);
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
        <div class="dx">${current.dx} · ${current.confirm === "experts" ? "judged harmless by dermatologists" : "confirmed by biopsy"}</div>
        ${retry ? `<div class="again">You'll see this one again in a later round.</div>` : ""}
        ${note ? `<button class="why" id="why">${note.title} ▾</button>` : ""}
      </div>
      <img src="${current.img}" alt="Skin lesion photo ${current.id}">
      ${mode === "headneck" && current.malignant ? `<div class="say"><b>You could say:</b> “I noticed a spot on your
        ${spot(current)}. Might be worth having a doctor look at it.”</div>` : ""}
      <div class="meta credit"><span>${current.id} · ${current.attribution || "ISIC Archive"} · ${current.license}</span>
        <a href="https://api.isic-archive.com/images/${current.id}/" target="_blank" rel="noopener">view on ISIC</a></div>
      <div class="hint">↑ swipe up for next</div>
      ${note ? `<div class="notes" id="notes" hidden>
        <button class="close" id="closeNotes" aria-label="Close">✕</button>
        <h3>${note.title}</h3>
        <ul>${note.points.map((x) => `<li>${x}</li>`).join("")}</ul>
        <p>These describe ${/^what a/i.test(note.title) ? "this kind of spot" : "this cancer"} in general, not this photo.
          Source: <a href="${note.source[1]}" target="_blank" rel="noopener">${note.source[0]}</a></p>
      </div>` : ""}
    </div>`;
  if (note) {
    $("why").onclick = () => { $("notes").hidden = false; };
    $("closeNotes").onclick = () => { $("notes").hidden = true; };
  }
  attachSwipeUp($("card"));
}

// On the answer card, swipe up (or tap) to fly it off the top and bring in the next photo.
// Plain word for where the spot is, for the client script.
function spot(c) {
  const d = (c.site_detail || "").toLowerCase();
  return ["face", "ear", "scalp", "neck", "lip", "nose"].find((w) => d.includes(w)) || "skin";
}

function attachSwipeUp(card) {
  let y0 = null, dy = 0;
  card.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, .notes")) return;
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
  if (check) return;  // a check moves on by itself after each swipe
  clearTimeout(flyTimer);
  const card = $("card");
  if (!card || !answered) return show();
  card.classList.remove("anim", "pop");
  card.classList.add("fly");
  card.style.transform = "translateY(-120vh)";
  flyTimer = setTimeout(round.results.length >= ROUND ? showSummary : show, 250);
}

// Skill check: 20 fixed photos, no answers until the end, so scores from different days compare fairly.
function startCheck() {
  clearTimeout(flyTimer);
  const set = checks.length % checkSets.length;
  check = { set, cards: shuffle([...checkSets[set]]), said: [] };
  answered = false;
  current = null;
  renderProgress();
  stage.innerHTML = `
    <div class="card pop summary" id="card">
      <div class="verdict ok"><div class="big">Skill check</div><div class="truth">20 photos · no answers until the end</div></div>
      <div class="sum-body">
        <p>Half of these photos are cancer and half are harmless. Swipe each one as usual.</p>
        <p>Take a check now, then again after about 10 rounds, to see how much you've learned. There are two sets of
          photos that take turns, and neither appears in normal rounds.</p>
        ${checks.length ? `<p class="small">Checks so far: ${checks.length}</p>` : ""}
      </div>
    </div>`;
  $("actions").innerHTML = `<button id="cancelCheck">Cancel</button><button id="next">Start →</button>`;
  $("cancelCheck").onclick = endCheck;
  $("next").onclick = show;
}

function answerCheck(saidCheck) {
  check.said.push(saidCheck);
  renderProgress();
  const card = $("card");
  const dir = saidCheck ? 1 : -1;
  card.classList.remove("anim");
  card.classList.add("fly");
  card.style.transform = `translateX(${dir * 150}vw) rotate(${dir * 30}deg)`;
  flyTimer = setTimeout(check.said.length >= check.cards.length ? showCheckResult : show, 300);
}

function showCheckResult() {
  answered = false;
  current = null;
  const res = check.cards.map((c, i) => ({ c, right: check.said[i] === c.malignant }));
  const caught = res.filter((r) => r.c.malignant && r.right).length;
  const cleared = res.filter((r) => !r.c.malignant && r.right).length;
  const nMal = res.filter((r) => r.c.malignant).length;
  checks.push({ date: new Date().toISOString().slice(0, 10), set: check.set, caught, cleared, total: res.length });
  saveChecks();
  const history = checks.slice(-6).map((x, i, a) =>
    `<li${i === a.length - 1 ? ' class="last"' : ""}>${x.date}: <b>${x.caught + x.cleared} of ${x.total}</b></li>`).join("");
  const missed = res.filter((r) => !r.right);
  stage.innerHTML = `
    <div class="card pop summary" id="card">
      <div class="verdict ok"><div class="big">${caught + cleared} of ${res.length}</div><div class="truth">Skill check done</div></div>
      <div class="sum-body">
        <p><b>Cancers flagged:</b> ${caught} of ${nMal}<br><b>Harmless spots cleared:</b> ${cleared} of ${res.length - nMal}</p>
        ${checks.length > 1 ? `<p class="small">Your checks:</p><ul class="history">${history}</ul>` : ""}
        ${missed.length ? `<p class="small">The ones you got wrong:</p><div class="missed">${missed.map((r) => `
          <figure><img src="${r.c.thumb}" alt="${r.c.dx}"><figcaption class="${r.c.malignant ? "bad" : ""}">${r.c.malignant ? "Cancer" : "Harmless"}: ${r.c.dx}</figcaption></figure>`).join("")}</div>` : ""}
      </div>
    </div>`;
  $("actions").innerHTML = `<button id="next">Back to practice →</button>`;
  $("next").onclick = endCheck;
}

function endCheck() {
  check = null;
  round = null;
  show();
}

// End of round: how it went, how it compares with recent rounds, and a reminder about real-life odds.
function showSummary() {
  answered = false;
  current = null;
  const r = round;
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const recent = score[mode].rounds.slice(-8);
  const bars = recent.map((x, i) => {
    const p = pct(x.caught + x.cleared, x.malignant + x.benign);
    return `<div class="bar${i === recent.length - 1 ? " last" : ""}"><span style="height:${p}%"></span><em>${p}%</em></div>`;
  }).join("");
  stage.innerHTML = `
    <div class="card pop summary" id="card">
      <div class="verdict ok"><div class="big">Round done</div>
        <div class="truth">${r.caught + r.cleared} of ${ROUND} right</div></div>
      <div class="sum-body">
        <p><b>Cancers flagged:</b> ${r.caught} of ${r.malignant}<br><b>Harmless spots cleared:</b> ${r.cleared} of ${r.benign}</p>
        ${recent.length > 1 ? `<div class="bars">${bars}</div><p class="small">Your last ${recent.length} rounds</p>` : ""}
        <p class="small">${CANCERS_PER_ROUND} of these ${ROUND} were cancer, so you get enough practice on them. In real
          life almost every spot you see is harmless. The skill is noticing the rare one that isn't.</p>
      </div>
    </div>`;
  $("actions").innerHTML = `<button id="next">Next round →</button>`;
  $("next").onclick = () => { round = null; show(); };
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
  else if ((e.key === " " || e.key === "Enter") && $("card")?.classList.contains("summary")) { e.preventDefault(); $("next").click(); }
});

document.querySelectorAll(".modes button").forEach((b) => {
  b.onclick = () => {
    mode = b.dataset.mode;
    check = null;
    document.querySelectorAll(".modes button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    round = null;
    renderStats();
    show();
  };
});

$("reset").onclick = () => {
  score = blankScore();
  checks = [];
  saveChecks();
  save();
  renderStats();
};

$("checkBtn").onclick = startCheck;

// Two looks for the same game: Bold (the default) and Soft. The choice is remembered on this device.
const SKINS = { bold: { label: "Bold", color: "#ffd23f" }, soft: { label: "Soft", color: "#f3eee6" } };
function applySkin(name) {
  if (!SKINS[name]) name = "bold";
  if (name === "bold") delete document.documentElement.dataset.skin;
  else document.documentElement.dataset.skin = name;
  document.querySelector('meta[name="theme-color"]').content = SKINS[name].color;
  $("skin").textContent = `Style: ${SKINS[name].label}`;
  try { localStorage.setItem("skinder.skin", name); } catch {}
}
applySkin(document.documentElement.dataset.skin || "bold");
$("skin").onclick = () => applySkin(document.documentElement.dataset.skin === "soft" ? "bold" : "soft");

Promise.all([
  fetch("data/deck.json").then((r) => { if (!r.ok) throw new Error(`deck.json: HTTP ${r.status}`); return r.json(); }),
  fetch("data/checks.json").then((r) => (r.ok ? r.json() : { sets: [] })).catch(() => ({ sets: [] })),
])
  .then(([d, c]) => {
    all = d.cards;
    const byId = new Map(all.map((x) => [x.id, x]));
    checkSets = c.sets.map((ids) => ids.map((id) => byId.get(id)).filter(Boolean)).filter((set) => set.length);
    checkSets.flat().forEach((x) => checkIds.add(x.id));
    if (!checkSets.length) $("checkBtn").hidden = true;
    renderStats();
    show();
  })
  .catch((e) => {
    stage.innerHTML = `<div class="msg">Could not load the image deck (${e.message}).<br>
      Run <code>python3 scripts/build_deck.py</code>, then start the server with
      <code>npm start</code>.</div>`;
  });
