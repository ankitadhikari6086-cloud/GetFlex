/* =========================================================
   GetFlex — vanilla JS single-page app
   ========================================================= */

// 1) CONFIG ------------------------------------------------
const TMDB_API_KEY = "YOUR_TMDB_API_KEY";   // get a free key at https://www.themoviedb.org/settings/api
const TMDB_BASE    = "https://api.themoviedb.org/3";
const IMG_POSTER   = "https://image.tmdb.org/t/p/w342";
const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280";

/* Extra player sources (optional).
   The built-in "Trailer" source uses the official YouTube trailer listed on TMDB.
   Add your own licensed / self-hosted embed URLs here. Use {id} for the TMDB movie id.
   Example:
     { name: "My Player", url: "https://player.example.com/embed/movie/{id}" }               */
const PLAYER_SOURCES = [
  // { name: "My Player", url: "https://player.example.com/embed/movie/{id}" },
];

const HERO_INTERVAL = 9000;
const HAS_KEY = TMDB_API_KEY && TMDB_API_KEY !== "YOUR_TMDB_API_KEY";

// 2) MOCK DATA (used when no API key is supplied) -----------
const MOCK_MOVIES = [
  { id: 603,    title: "The Matrix", year: 1999, rating: 8.2, genres: ["action","scifi"], overview: "A hacker discovers the world he lives in is a simulation and joins a rebellion against the machines that built it." },
  { id: 27205,  title: "Inception", year: 2010, rating: 8.4, genres: ["action","scifi"], overview: "A thief who steals secrets through dreams is offered a final job: plant an idea inside a target's mind." },
  { id: 157336, title: "Interstellar", year: 2014, rating: 8.4, genres: ["scifi","drama"], overview: "With Earth dying, a team of explorers travels through a wormhole in search of a new home for humanity." },
  { id: 155,    title: "The Dark Knight", year: 2008, rating: 8.5, genres: ["action","crime"], overview: "Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos." },
  { id: 238,    title: "The Godfather", year: 1972, rating: 8.7, genres: ["crime","drama"], overview: "The aging patriarch of a crime dynasty hands control of his empire to his reluctant son." },
  { id: 680,    title: "Pulp Fiction", year: 1994, rating: 8.5, genres: ["crime"], overview: "Intertwined stories of hitmen, a boxer and a gangster's wife unfold across Los Angeles." },
  { id: 550,    title: "Fight Club", year: 1999, rating: 8.4, genres: ["drama"], overview: "An insomniac office worker and a soap salesman start an underground fight club that spirals out of control." },
  { id: 76341,  title: "Mad Max: Fury Road", year: 2015, rating: 7.6, genres: ["action","adventure"], overview: "In a desert wasteland, Max joins Furiosa in a high-speed escape from a tyrant warlord." },
  { id: 245891, title: "John Wick", year: 2014, rating: 7.4, genres: ["action","crime"], overview: "A retired hitman is pulled back into the underworld after a senseless act of violence." },
  { id: 98,     title: "Gladiator", year: 2000, rating: 8.2, genres: ["action","adventure","drama"], overview: "A betrayed Roman general rises as a gladiator to avenge his family and challenge the emperor." },
  { id: 120,    title: "The Fellowship of the Ring", year: 2001, rating: 8.4, genres: ["adventure","fantasy"], overview: "A hobbit inherits a powerful ring and sets out with eight companions to destroy it." },
  { id: 299536, title: "Avengers: Infinity War", year: 2018, rating: 8.2, genres: ["action","adventure","scifi"], overview: "The Avengers and their allies must stop Thanos from collecting all six Infinity Stones." },
  { id: 85,     title: "Raiders of the Lost Ark", year: 1981, rating: 7.9, genres: ["action","adventure"], overview: "Archaeologist Indiana Jones races the Nazis to find the legendary Ark of the Covenant." },
  { id: 1891,   title: "The Empire Strikes Back", year: 1980, rating: 8.4, genres: ["adventure","scifi"], overview: "The Rebels scatter after a devastating attack while Luke seeks training from Master Yoda." },
  { id: 329,    title: "Jurassic Park", year: 1993, rating: 8.0, genres: ["adventure","scifi"], overview: "A theme park of cloned dinosaurs turns deadly when the security systems fail." },
  { id: 105,    title: "Back to the Future", year: 1985, rating: 8.3, genres: ["adventure","scifi"], overview: "A teenager is accidentally sent thirty years into the past in a time-traveling DeLorean." },
];

const posterSvg = (m) => {
  const h = (m.id * 47) % 360, t = encodeURIComponent(m.title);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='342' height='513' viewBox='0 0 342 513'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h},55%,16%)'/><stop offset='1' stop-color='#0d0d0d'/></linearGradient></defs>
    <rect width='342' height='513' fill='url(#g)'/>
    <circle cx='270' cy='90' r='120' fill='hsl(${(h+140)%360},80%,45%)' opacity='.18'/>
    <path d='M0 400 L342 300 L342 513 L0 513Z' fill='#00FF66' opacity='.08'/>
    <text x='24' y='300' fill='#fff' font-family='Arial Black,Arial' font-weight='900' font-size='30'>${wrapSvg(m.title)}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};
function wrapSvg(title){
  const words = title.replace(/&/g,"and").replace(/[<>']/g,"").split(" "), lines = [""];
  words.forEach(w => { const l = lines[lines.length-1]; (l + " " + w).trim().length > 14 ? lines.push(w) : lines[lines.length-1] = (l + " " + w).trim(); });
  return lines.slice(0,4).map((l,i)=>`<tspan x='24' dy='${i?36:0}'>${l}</tspan>`).join("");
}
const backdropGrad = (m) => { const h = (m.id * 47) % 360;
  return `radial-gradient(circle at 75% 25%,hsl(${(h+140)%360},70%,28%),transparent 55%),linear-gradient(135deg,hsl(${h},50%,14%),#0d0d0d)`; };

// 3) HELPERS -----------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

async function tmdb(path, params = {}) {
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDB " + res.status);
  return res.json();
}
const normalize = (m) => ({
  id: m.id,
  title: m.title || m.name || "Untitled",
  overview: m.overview || "No overview available.",
  rating: Number(m.vote_average || m.rating || 0),
  year: m.year || (m.release_date || "").slice(0, 4),
  poster: m.poster_path ? IMG_POSTER + m.poster_path : (m.poster || null),
  backdrop: m.backdrop_path ? IMG_BACKDROP + m.backdrop_path : null,
  mock: !!m.mock,
});
const mockify = (m) => { const n = normalize({ ...m, mock: true }); n.poster = posterSvg(n); return n; };
const MOCKS = MOCK_MOVIES.map(mockify);
const genreOf = (id) => MOCK_MOVIES.find(m => m.id === id)?.genres || [];

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// 4) MY LIST (localStorage, safely wrapped) ----------------
const LIST_KEY = "getflex:mylist";
let myList = [];
try { myList = JSON.parse(localStorage.getItem(LIST_KEY)) || []; } catch { myList = []; }
const inList = (id) => myList.some(m => m.id === id);
function saveList() { try { localStorage.setItem(LIST_KEY, JSON.stringify(myList)); } catch {} updateCount(); }
function updateCount() { const c = $("#listCount"); c.textContent = myList.length; c.hidden = !myList.length; }
function toggleList(movie) {
  if (inList(movie.id)) { myList = myList.filter(m => m.id !== movie.id); toast(`Removed “${movie.title}” from My List`); }
  else { myList.push(movie); toast(`Added “${movie.title}” to My List`); }
  saveList();
  $$(`.fav[data-id="${movie.id}"]`).forEach(syncFav);
  if (state.view === "mylist") renderList();
  if (!$("#modal").hidden && current?.id === movie.id) syncModalList();
}
function syncFav(btn) { const on = inList(+btn.dataset.id); btn.classList.toggle("on", on); btn.textContent = on ? "✓" : "+"; btn.setAttribute("aria-label", on ? "Remove from My List" : "Add to My List"); }

// 5) DATA LOADERS -----------------------------------------
const ROWS = [
  { key: "trending", title: "Trending Now",
    load: async () => HAS_KEY ? (await tmdb("/trending/movie/week")).results : MOCKS.slice(0, 12) },
  { key: "top", title: "Top Rated Movies",
    load: async () => HAS_KEY ? (await tmdb("/movie/top_rated")).results : [...MOCKS].sort((a, b) => b.rating - a.rating).slice(0, 12) },
  { key: "action", title: "Action & Adventure",
    load: async () => HAS_KEY ? (await tmdb("/discover/movie", { with_genres: "28|12", sort_by: "popularity.desc" })).results
                              : MOCKS.filter(m => genreOf(m.id).some(g => g === "action" || g === "adventure")) },
];
const rowData = {};

async function search(q) {
  if (HAS_KEY) return (await tmdb("/search/movie", { query: q, include_adult: "false" })).results;
  const needle = q.toLowerCase();
  return MOCKS.filter(m => m.title.toLowerCase().includes(needle) || m.overview.toLowerCase().includes(needle));
}

// 6) RENDERING ---------------------------------------------
function cardHTML(m) {
  const poster = m.poster
    ? `<img src="${esc(m.poster)}" alt="${esc(m.title)} poster" loading="lazy">`
    : `<img src="${posterSvg(m)}" alt="${esc(m.title)}" loading="lazy">`;
  return `<article class="card" tabindex="0" role="button" data-id="${m.id}" aria-label="${esc(m.title)}, rated ${m.rating.toFixed(1)}">
    ${poster}
    <span class="rating">★ ${m.rating ? m.rating.toFixed(1) : "NR"}</span>
    <button class="fav" data-id="${m.id}" tabindex="0"></button>
    <div class="title">${esc(m.title)}${m.year ? `<span class="year">${esc(m.year)}</span>` : ""}</div>
  </article>`;
}
const registry = new Map();   // id -> movie, so cards can look up their data
function register(list) { list.forEach(m => registry.set(m.id, m)); }

function skeletonRow(key, title) {
  return `<section class="row" id="row-${key}" data-row="${key}">
    <div class="row-head"><h2>${esc(title)}</h2></div>
    <div class="row-wrap"><div class="track">${'<div class="card skeleton"></div>'.repeat(8)}</div></div></section>`;
}
function fillRow(key, title, movies) {
  const sec = $(`#row-${key}`); if (!sec) return;
  sec.innerHTML = `<div class="row-head"><h2>${esc(title)}</h2></div>
    <div class="row-wrap">
      <button class="arrow prev" aria-label="Scroll left">‹</button>
      <div class="track">${movies.map(cardHTML).join("")}</div>
      <button class="arrow next" aria-label="Scroll right">›</button>
    </div>`;
  $$(".fav", sec).forEach(syncFav);
}

async function buildHome() {
  $("#rows").innerHTML = ROWS.map(r => skeletonRow(r.key, r.title)).join("");
  await Promise.all(ROWS.map(async r => {
    try {
      rowData[r.key] = (await r.load()).map(normalize).filter(m => m.poster);
      register(rowData[r.key]);
      fillRow(r.key, r.title, rowData[r.key]);
    } catch (e) {
      $(`#row-${r.key}`).innerHTML = `<div class="row-head"><h2>${esc(r.title)}</h2></div><p class="empty" style="padding:0 var(--pad)"><strong>Couldn't load this row.</strong>Check your API key and connection, then refresh.</p>`;
    }
  }));
  startHero();
}

function renderGrid(title, movies, emptyMsg) {
  const box = $("#searchResults");
  register(movies);
  box.innerHTML = `<h2>${title}</h2>` + (movies.length
    ? `<div class="grid">${movies.map(cardHTML).join("")}</div>`
    : `<div class="empty">${emptyMsg}</div>`);
  $$(".fav", box).forEach(syncFav);
}
function renderList() {
  renderGrid("My List", myList, `<strong>Your list is empty.</strong>Tap the + on any movie to save it here.`);
}

// 7) VIEWS / NAVIGATION ------------------------------------
const state = { view: "home" };
function setView(view) {
  state.view = view;
  $$(".nav-links a").forEach(a => a.classList.toggle("active", a.dataset.nav === view));
  const showResults = view === "mylist" || view === "search";
  const isHome = view === "home";
  $("#hero").hidden = !isHome;
  $("#rows").hidden = showResults;
  $("#searchResults").hidden = !showResults;
  $("#rows").style.marginTop = isHome ? "" : "0";
  $("#rows").style.paddingTop = isHome ? "" : "calc(var(--nav-h) + 24px)";
  $$("#rows .row").forEach(r => {
    const k = r.dataset.row;
    r.hidden = view === "trending" ? k !== "trending" : view === "movies" ? k === "trending" : false;
  });
  if (view === "mylist") renderList();
  if (isHome) startHero(); else stopHero();
  window.scrollTo({ top: 0, behavior: "smooth" });
  $("#navLinks").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false");
}
$$("[data-nav]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  $("#searchInput").value = "";
  setView(a.dataset.nav);
}));

$("#menuBtn").addEventListener("click", () => {
  const open = $("#navLinks").classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", String(open));
});
window.addEventListener("scroll", () => $("#navbar").classList.toggle("scrolled", scrollY > 30), { passive: true });

// Search (debounced live query)
let searchTimer, searchSeq = 0;
$("#searchInput").addEventListener("input", e => {
  const q = e.target.value.trim();
  clearTimeout(searchTimer);
  if (q.length < 2) { if (state.view === "search") setView("home"); return; }
  searchTimer = setTimeout(async () => {
    const seq = ++searchSeq;
    setView("search");
    $("#searchResults").innerHTML = `<h2>Searching…</h2><div class="grid">${'<div class="card skeleton"></div>'.repeat(10)}</div>`;
    try {
      const res = (await search(q)).map(m => m.mock ? m : normalize(m));
      if (seq !== searchSeq) return;
      renderGrid(`Results for <em>${esc(q)}</em>`, res, `<strong>No movies match “${esc(q)}”.</strong>Try a different title or check the spelling.`);
    } catch {
      if (seq === searchSeq) $("#searchResults").innerHTML = `<h2>Search failed</h2><div class="empty"><strong>We couldn't reach TMDB.</strong>Check your API key and connection, then try again.</div>`;
    }
  }, 350);
});

// Delegated clicks: arrows, favorites, cards
document.addEventListener("click", e => {
  const arrow = e.target.closest(".arrow");
  if (arrow) { const t = $(".track", arrow.parentElement); t.scrollBy({ left: (arrow.classList.contains("next") ? 1 : -1) * t.clientWidth * .8, behavior: "smooth" }); return; }
  const fav = e.target.closest(".fav");
  if (fav) { e.stopPropagation(); const m = registry.get(+fav.dataset.id); m && toggleList(m); return; }
  const card = e.target.closest(".card[data-id]");
  if (card) { const m = registry.get(+card.dataset.id); m && openModal(m, { autoplay: true }); }
});
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches(".card[data-id]")) { e.preventDefault(); e.target.click(); }
  if (e.key === "Escape" && !$("#modal").hidden) closeModal();
});

// 8) HERO --------------------------------------------------
let heroList = [], heroIdx = 0, heroTimer, heroItem = null;
function startHero() {
  if (state.view !== "home") return;
  if (!heroList.length) {
    const src = (rowData.trending || []).filter(m => HAS_KEY ? m.backdrop : true).slice(0, 5);
    if (!src.length) return;
    heroList = src; heroIdx = 0;
  }
  showHero(heroIdx);
}
function stopHero() { clearTimeout(heroTimer); const p = $("#heroProgress"); p.classList.remove("run"); }
function showHero(i) {
  clearTimeout(heroTimer);
  const m = heroItem = heroList[i];
  const bg = $("#heroBg");
  bg.classList.add("swap");
  setTimeout(() => {
    bg.style.backgroundImage = m.backdrop ? `url(${m.backdrop})` : backdropGrad(m);
    bg.classList.remove("swap");
  }, 250);
  $("#heroTitle").textContent = m.title;
  $("#heroOverview").textContent = m.overview;
  $("#heroMeta").innerHTML = `<span class="badge">★ ${m.rating.toFixed(1)}</span>${m.year ? `<span>${esc(m.year)}</span>` : ""}<span class="pill">HD</span>`;
  const p = $("#heroProgress"); p.classList.remove("run"); void p.offsetWidth;
  p.style.setProperty("--hero-ms", HERO_INTERVAL + "ms"); p.parentElement.style.setProperty("--hero-ms", HERO_INTERVAL + "ms"); p.classList.add("run");
  heroTimer = setTimeout(() => { heroIdx = (heroIdx + 1) % heroList.length; showHero(heroIdx); }, HERO_INTERVAL);
}
$("#heroPlay").addEventListener("click", () => heroItem && openModal(heroItem, { autoplay: true }));
$("#heroInfo").addEventListener("click", () => heroItem && openModal(heroItem, { autoplay: false }));
document.addEventListener("visibilitychange", () => { if (document.hidden) stopHero(); else if (state.view === "home" && $("#modal").hidden) showHero(heroIdx); });

// 9) PLAYER MODAL ------------------------------------------
let current = null, sources = [], srcIdx = 0, lastFocus = null;

async function buildSources(movie) {
  const list = [{ name: "Trailer", kind: "trailer" }];
  PLAYER_SOURCES.forEach(s => list.push({ name: s.name, kind: "custom", url: s.url }));
  return list;
}
async function trailerUrl(movie) {
  if (!HAS_KEY) return null;
  try {
    const { results } = await tmdb(`/movie/${movie.id}/videos`);
    const yt = results.filter(v => v.site === "YouTube");
    const pick = yt.find(v => v.type === "Trailer" && v.official) || yt.find(v => v.type === "Trailer") || yt.find(v => v.type === "Teaser") || yt[0];
    return pick ? { embed: `https://www.youtube-nocookie.com/embed/${pick.key}?autoplay=1&rel=0`, watch: `https://www.youtube.com/watch?v=${pick.key}` } : null;
  } catch { return null; }
}
function syncModalList() { $("#addListBtn").textContent = inList(current.id) ? "✓ In My List" : "+ My List"; }

async function openModal(movie, { autoplay = true } = {}) {
  current = movie; lastFocus = document.activeElement;
  stopHero();
  $("#modalTitle").textContent = movie.title;
  $("#modalOverview").textContent = movie.overview;
  $("#modalMeta").innerHTML = `<span class="badge">★ ${movie.rating.toFixed(1)}</span>${movie.year ? `<span>${esc(movie.year)}</span>` : ""}`;
  syncModalList();
  sources = await buildSources(movie); srcIdx = 0;
  $("#modal").hidden = false; document.body.style.overflow = "hidden";
  $("#modal .modal-close").focus();
  if (autoplay) loadSource(); else showEmpty({ info: true });
}
function closeModal() {
  $("#modal").hidden = true; document.body.style.overflow = "";
  $("#playerFrame").src = "about:blank";
  $("#modalBar").classList.remove("loading");
  lastFocus && lastFocus.focus && lastFocus.focus();
  if (state.view === "home") showHero(heroIdx);
}
$$("[data-close]").forEach(el => el.addEventListener("click", closeModal));

function showEmpty({ info = false, msg = "" } = {}) {
  const box = $("#playerEmpty"), frame = $("#playerFrame");
  frame.src = "about:blank"; frame.hidden = true; box.hidden = false;
  $("#sourceName").textContent = sources[srcIdx]?.name || "Source";
  box.style.background = current.backdrop ? `linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.85)),url(${current.backdrop}) center/cover` : "";
  box.innerHTML = info
    ? `<strong>${esc(current.title)}</strong><span>Ready when you are.</span><div><button class="btn btn-primary" id="emptyPlay">▶ Play</button></div>`
    : `<strong>${esc(msg.title || "Nothing to play here")}</strong><span>${esc(msg.body || "")}</span>`;
  const b = $("#emptyPlay"); if (b) b.onclick = loadSource;
}
async function loadSource() {
  const s = sources[srcIdx], frame = $("#playerFrame"), bar = $("#modalBar");
  $("#sourceName").textContent = s.name;
  bar.classList.remove("loading"); void bar.offsetWidth; bar.classList.add("loading");
  let url = s.url ? s.url.replace("{id}", encodeURIComponent(current.id)) : null;
  s.external = url;
  if (s.kind === "trailer") {
    const t = await trailerUrl(current);
    url = t && t.embed; s.external = t && t.watch;
    if (!url) return showEmpty({ msg: HAS_KEY
      ? { title: "No trailer on TMDB for this title", body: "Use “Switch source” to try another source, if you've added one." }
      : { title: "Trailers need a TMDB API key", body: "Add your key to TMDB_API_KEY in js/app.js to stream trailers for real movies." } });
  }
  $("#playerEmpty").hidden = true; frame.hidden = false; frame.src = url;
}
$("#switchBtn").addEventListener("click", () => {
  if (sources.length < 2) { toast("Only one source is set up. Add more to PLAYER_SOURCES in js/app.js."); return; }
  srcIdx = (srcIdx + 1) % sources.length; loadSource();
  toast(`Source: ${sources[srcIdx].name}`);
});
$("#externalBtn").addEventListener("click", async () => {
  const s = sources[srcIdx];
  if (s.external === undefined) {
    if (s.kind === "trailer") { const t = await trailerUrl(current); s.external = t && t.watch; }
    else s.external = s.url.replace("{id}", encodeURIComponent(current.id));
  }
  if (!s.external) { toast("No link available for this source."); return; }
  window.open(s.external, "_blank", "noopener");
});
$("#addListBtn").addEventListener("click", () => current && toggleList(current));

// 10) INIT --------------------------------------------------
updateCount();
buildHome();
if (!HAS_KEY) console.info("GetFlex: no TMDB API key set — showing mock data. Set TMDB_API_KEY at the top of js/app.js.");
