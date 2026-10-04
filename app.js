// ===== 공통 =====
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const won = n => Math.round(n).toLocaleString("ko-KR") + "원";
const yen = n => n.toLocaleString("ko-KR") + "엔";
const gmapsSearch = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function toast(msg) {
  const t = $("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 2200);
}

const state = {
  city: null, view: null, day: 0, listFilter: "all", mapFilter: "all", focus: null,
  picks: new Set(store.get("picks", [])),
  checked: new Set(store.get("checked", []))
};
const savePicks = () => store.set("picks", [...state.picks]);
const saveChecked = () => store.set("checked", [...state.checked]);

function places(city) {
  const c = CITIES[city];
  return [...c.sights.map(p => ({ ...p, kind: "sights" })), ...c.foods.map(p => ({ ...p, kind: "foods" }))]
    .map(p => ({ ...p, id: `${city}:${p.name}` }));
}
function resolveStop(city, key) {
  const c = CITIES[city];
  if (c.spots[key]) return { ...c.spots[key], kind: "spot" };
  return places(city).find(p => p.name === key);
}

// ===== 사진 (위키백과 대표 사진) =====
// 위키백과 요약 API에서 대표 사진을 받아와 data-wiki 요소의 배경으로 넣는다. 결과는 브라우저에 저장해 재사용.
const imgCache = store.get("img:v2", {});
async function wikiImage(title) {
  if (title in imgCache) return imgCache[title];
  try {
    const r = await fetch(`https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!r.ok) { if (r.status === 404) { imgCache[title] = null; store.set("img:v2", imgCache); } return null; }
    const j = await r.json();
    // 위키미디어는 정해진 크기(250·330·500·960px 등)의 썸네일만 안정적으로 준다.
    // 500px → API가 준 기본 썸네일 → (작은 경우) 원본 순서로 시도한다.
    const t = j.thumbnail && j.thumbnail.source, o = j.originalimage, srcs = [];
    if (t && o && o.width > 500 && /\/\d+px-/.test(t)) srcs.push(t.replace(/\/\d+px-/, "/500px-"));
    if (t) srcs.push(t);
    if (o && o.width <= 1000) srcs.push(o.source);
    const v = srcs.length ? { srcs, page: (j.content_urls && j.content_urls.mobile && j.content_urls.mobile.page) || `https://ja.wikipedia.org/wiki/${encodeURIComponent(title)}` } : null;
    imgCache[title] = v; store.set("img:v2", imgCache);
    return v;
  } catch { return null; }
}
// 링크 안에 들어가는 사진(첫 화면 도시 카드)은 출처를 링크 대신 글자로 표시 (a 안에 a 금지)
const photo = (title, fallback, cls = "", inLink = false) => title
  ? `<div class="ph ${cls}" data-wiki="${esc(title)}"><span class="ph-kanji">${esc(fallback)}</span>${inLink
      ? `<span class="credit">사진 · 위키백과</span>` : `<a class="credit" target="_blank" rel="noopener">사진 · 위키백과</a>`}</div>`
  : `<div class="ph ${cls}"><span class="ph-kanji">${esc(fallback)}</span></div>`;
function loadPhotos(root = document) {
  root.querySelectorAll(".ph[data-wiki]:not(.tried)").forEach(async el => {
    el.classList.add("tried");
    const v = await wikiImage(el.dataset.wiki);
    if (!v) return;
    const tryLoad = i => {
      if (i >= v.srcs.length) return;
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = `url("${v.srcs[i]}")`; el.classList.add("loaded");
        const a = el.querySelector("a.credit"); if (a) a.href = v.page;
      };
      img.onerror = () => tryLoad(i + 1);
      img.src = v.srcs[i];
    };
    tryLoad(0);
  });
}

// ===== D-day 도장 =====
const days = Math.ceil((new Date("2027-02-01T00:00:00") - new Date()) / 86400000);
$("dday").innerHTML = days > 0 ? `<small>出発まで</small><b>D-${days}</b><small>2027 · 02</small>` : `<b>旅行中</b>`;

// ===== 매화 가지 장식 =====
(function drawBranch() {
  const flower = (x, y, r, color) => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      s += `<circle cx="${(x + Math.cos(a) * r * .6).toFixed(1)}" cy="${(y + Math.sin(a) * r * .6).toFixed(1)}" r="${(r * .52).toFixed(1)}" fill="${color}"/>`;
    }
    return s + `<circle cx="${x}" cy="${y}" r="${(r * .28).toFixed(1)}" fill="var(--gold)"/>`;
  };
  $("branch").innerHTML =
    `<path d="M0 30 C60 40 90 20 140 38 S220 70 300 60" stroke="var(--branch)" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M140 38 C150 18 165 10 180 6" stroke="var(--branch)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
     <path d="M220 62 C230 80 240 92 250 100" stroke="var(--branch)" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
    flower(60, 34, 13, "var(--ume)") + flower(120, 30, 10, "var(--petal)") + flower(178, 8, 9, "var(--ume)") +
    flower(250, 100, 11, "var(--petal)") + flower(292, 58, 12, "var(--ume)") +
    `<circle cx="96" cy="40" r="4" fill="var(--ume)"/><circle cx="205" cy="55" r="4" fill="var(--ume)"/>`;
})();

// ===== 매화 꽃잎 흩날리기 =====
const petals = (() => {
  const cv = $("petals"), ctx = cv.getContext("2d");
  let on = store.get("petals", !reduceMotion), list = [], raf = null;
  const color = () => getComputedStyle(document.documentElement).getPropertyValue("--petal").trim() || "pink";
  function resize() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  function spawn(y) {
    return { x: Math.random() * innerWidth, y: y ?? -20, s: 6 + Math.random() * 6, vy: .4 + Math.random() * .7,
             vx: -.3 + Math.random() * .6, r: Math.random() * 6.28, vr: -.02 + Math.random() * .04, sw: Math.random() * 6.28 };
  }
  function petal(p, c) { // 끝이 살짝 패인 매화 꽃잎
    ctx.save(); ctx.translate(p.x * devicePixelRatio, p.y * devicePixelRatio); ctx.rotate(p.r);
    const s = p.s * devicePixelRatio;
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(0, s * .6);
    ctx.bezierCurveTo(-s, 0, -s * .6, -s, -s * .12, -s * .8);
    ctx.lineTo(0, -s * .55); ctx.lineTo(s * .12, -s * .8);
    ctx.bezierCurveTo(s * .6, -s, s, 0, 0, s * .6);
    ctx.fill(); ctx.restore();
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const c = color();
    list.forEach(p => {
      p.sw += .02; p.x += p.vx + Math.sin(p.sw) * .4; p.y += p.vy; p.r += p.vr;
      if (p.y > innerHeight + 20) Object.assign(p, spawn());
      petal(p, c);
    });
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (raf) return;
    resize(); list = Array.from({ length: 18 }, () => spawn(Math.random() * innerHeight)); cv.hidden = false; tick();
  }
  function stop() { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, cv.width, cv.height); cv.hidden = true; }
  addEventListener("resize", () => raf && resize());
  return {
    get on() { return on; },
    toggle() { on = !on; store.set("petals", on); this.sync(true); },
    sync(onHome) { (on && onHome) ? start() : stop(); $("petal-toggle").textContent = on ? "꽃잎 효과 끄기" : "꽃잎 효과 켜기"; }
  };
})();
$("petal-toggle").addEventListener("click", () => petals.toggle());

// ===== 첫 화면 비교표 =====
function budgetTotal(b) {
  return b.flight * 2 + b.hotel * 3 + b.food * 4 * 2 + (b.transport + b.act) * b.rate / 100 * 2 + b.shop;
}
function renderCityCovers() {
  $("city-pick").innerHTML = Object.entries(CITIES).map(([key, c]) =>
    `<a class="city-card" href="#/${key}">${photo(c.cover, c.kanji, "cover", true)}<span class="kanji">${c.kanji}</span><b>${c.name}</b><small>${esc(c.pickLine)}</small></a>`).join("");
  loadPhotos($("city-pick"));
}
renderCityCovers();

function renderCompare() {
  const keys = Object.keys(CITIES);
  const rows = [
    ["예상 예산 (둘이)", k => won(budgetTotal(getBudget(k)))],
    ["비행시간", k => CITIES[k].compare.flightTime],
    ["공항 → 시내", k => CITIES[k].compare.airport],
    ["분위기", k => CITIES[k].compare.mood],
    ["하이라이트", k => CITIES[k].compare.highlight],
    ["2월 날씨", k => CITIES[k].weather.split(".")[0].replace("2월 평균 ", "")]
  ];
  $("compare").innerHTML =
    `<thead><tr><th></th>${keys.map(k => `<th>${CITIES[k].name}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(([label, f]) => `<tr><th scope="row">${label}</th>${keys.map(k => `<td>${esc(f(k))}</td>`).join("")}</tr>`).join("") +
    `</tbody>`;
}

// ===== 지도 (Leaflet + OpenStreetMap) =====
function makeMap(el) {
  if (!window.L) { // 지도 라이브러리를 못 불러온 경우 (오프라인 등)
    el.innerHTML = `<p class="note" style="padding:16px">지도를 불러오지 못했어요. 인터넷 연결을 확인해 주세요. 구글 지도 링크는 그대로 쓸 수 있어요.</p>`;
    const noop = { clearLayers() {}, addLayer() {} };
    return { _layer: noop, invalidateSize() {}, fitBounds() {}, setView() {}, _dead: true };
  }
  const m = L.map(el, { zoomControl: true, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(m);
  m._layer = L.layerGroup().addTo(m);
  return m;
}
const pinIcon = (label, cls) => L.divIcon({
  className: "", html: `<div class="pin ${cls}"><span>${esc(label)}</span></div>`,
  iconSize: [28, 28], iconAnchor: [14, 34], popupAnchor: [0, -30]
});
const popupHtml = p => `<b>${esc(p.name)}</b>${p.desc ? `<br>${esc(p.desc)}` : ""}<br><a href="${gmapsSearch(p.q)}" target="_blank" rel="noopener">구글 지도에서 보기 ↗</a>`;
let planMap, allMap;

// ===== 메뉴 =====
const MENU = [
  { id: "plan", ico: "旅", name: "여행코스", desc: "Day 1~4 동선을 지도와 선으로" },
  { id: "foods", ico: "食", name: "먹거리", desc: "꼭 먹어야 할 맛집" },
  { id: "sights", ico: "景", name: "관광지", desc: "가볼 만한 명소" },
  { id: "map", ico: "図", name: "지도", desc: "모든 장소를 한 지도에" },
  { id: "budget", ico: "銭", name: "예산", desc: "항공 · 숙소 · 교통 시세와 계산기" },
  { id: "pack", ico: "荷", name: "준비물", desc: "출발 전 체크리스트" }
];

// ===== 라우팅: #/ , #/osaka , #/osaka/plan =====
function route() {
  const h = location.hash;
  if (h.startsWith("#share=")) { handleShare(h.slice(7)); history.replaceState(null, "", "#/"); }
  const [city, view] = location.hash.replace(/^#\/?/, "").split("/");
  const valid = CITIES[city];
  $("screen-home").hidden = !!valid;
  $("screen-city").hidden = !valid || !!view;
  $("screen-detail").hidden = !valid || !view;
  petals.sync(!valid);
  if (!valid) { renderCompare(); document.title = "매화 여행 플래너"; return scrollTo(0, 0); }
  state.city = city;
  if (!view) { renderCity(); return scrollTo(0, 0); }
  showView(view);
}
addEventListener("hashchange", route);

function renderCity() {
  const c = CITIES[state.city];
  document.title = `${c.name} · 매화 여행 플래너`;
  $("city-name").textContent = c.name;
  $("city-kanji").textContent = c.kanji;
  $("city-tagline").textContent = c.tagline;
  $("weather").textContent = c.weather;
  $("transport").textContent = c.transport;
  $("events").textContent = c.events.join(" / ");
  $("menu").innerHTML = MENU.map(m =>
    `<a href="#/${state.city}/${m.id}"><span class="ico">${m.ico}</span><b>${m.name}</b><small>${m.desc}</small></a>`).join("");
}

function showView(view) {
  const c = CITIES[state.city], m = MENU.find(x => x.id === view) || MENU[0];
  $("detail-title").textContent = `${c.name} ${m.name}`;
  $("detail-kanji").textContent = m.ico;
  $("detail-back").href = `#/${state.city}`;
  document.title = `${c.name} ${m.name} · 매화 여행 플래너`;
  const viewEl = { plan: "view-plan", foods: "view-list", sights: "view-list", map: "view-map", budget: "view-budget", pack: "view-pack" }[m.id];
  document.querySelectorAll(".view").forEach(v => { v.hidden = v.id !== viewEl; });
  scrollTo(0, 0);
  if (m.id === "plan") renderPlan();
  if (m.id === "foods" || m.id === "sights") { state.listKind = m.id; renderList(); }
  if (m.id === "map") renderAllMap();
  if (m.id === "budget") { renderCosts(); loadBudget(); }
  if (m.id === "pack") renderPack();
}

// ===== 여행코스 =====
function renderPlan() {
  const c = CITIES[state.city];
  if (state.day >= c.plan.length) state.day = 0;
  $("day-chips").innerHTML = c.plan.map((d, i) =>
    `<button type="button" role="tab" aria-selected="${i === state.day}" data-day="${i}">Day ${i + 1}</button>`).join("");
  $("day-chips").querySelectorAll("button").forEach(b => b.onclick = () => { state.day = +b.dataset.day; renderPlan(); });

  const d = c.plan[state.day];
  const stops = d.stops.map(k => resolveStop(state.city, k)).filter(Boolean);
  if (!planMap) planMap = makeMap($("plan-map"));
  planMap._layer.clearLayers();
  const latlngs = stops.map(s => s.pos);
  if (!planMap._dead) {
  L.polyline(latlngs, { color: getComputedStyle(document.documentElement).getPropertyValue("--ume").trim(), weight: 4, dashArray: "8 8", opacity: .9 }).addTo(planMap._layer);
  stops.forEach((s, i) => L.marker(s.pos, { icon: pinIcon(i + 1, s.kind === "spot" ? "spot" : s.kind) }).bindPopup(popupHtml(s)).addTo(planMap._layer));
  setTimeout(() => { planMap.invalidateSize(); planMap.fitBounds(latlngs, { padding: [36, 36], maxZoom: 15 }); }, 0);
  }

  $("plan-gmaps").href = "https://www.google.com/maps/dir/" + stops.map(s => encodeURIComponent(s.q)).join("/");
  $("plan-stops").innerHTML = stops.map((s, i) => `<li>
      <span class="num ${s.kind === "spot" ? "spot" : ""}">${i + 1}</span>
      <div><b>${esc(s.name)}</b>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}<a href="${gmapsSearch(s.q)}" target="_blank" rel="noopener">구글 지도 ↗</a></div>
      ${photo(s.wiki, s.kind === "spot" ? "駅" : s.kind === "foods" ? "食" : "景", "thumb")}
    </li>`).join("");
  loadPhotos($("plan-stops"));
  $("plan-tips").innerHTML = `<li><b>Day ${state.day + 1} · ${esc(d.title)}</b></li>` + d.tips.map(t => `<li>${esc(t)}</li>`).join("");
}

// ===== 먹거리 / 관광지 =====
function renderList() {
  const kind = state.listKind;
  $("list-chips").innerHTML = [["all", "전체"], ["picks", "★ 찜한 곳"]].map(([k, l]) =>
    `<button type="button" aria-pressed="${state.listFilter === k}" data-f="${k}">${l}</button>`).join("");
  $("list-chips").querySelectorAll("button").forEach(b => b.onclick = () => { state.listFilter = b.dataset.f; renderList(); });

  let list = places(state.city).filter(p => p.kind === kind);
  if (state.listFilter === "picks") list = list.filter(p => state.picks.has(p.id));
  const ul = $("places");
  if (!list.length) { ul.innerHTML = `<li class="empty">아직 찜한 곳이 없어요.<br>☆를 눌러 가고 싶은 곳을 담아보세요.</li>`; return; }
  ul.innerHTML = list.map(p => {
    const on = state.picks.has(p.id);
    return `<li>
      ${photo(p.wiki, p.kind === "foods" ? "食" : "景")}
      <div class="row">
        <div class="body"><b>${esc(p.name)}</b><p>${esc(p.desc)}</p>
          <div class="links"><a href="${gmapsSearch(p.q)}" target="_blank" rel="noopener">구글 지도 ↗</a>
            <button type="button" data-focus="${esc(p.id)}">지도에서 보기</button></div></div>
        <button class="star ${on ? "on" : ""}" type="button" data-id="${esc(p.id)}" aria-label="${esc(p.name)} 찜하기" aria-pressed="${on}">${on ? "★" : "☆"}</button>
      </div>
    </li>`;
  }).join("");
  loadPhotos(ul);
  ul.querySelectorAll(".star").forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    state.picks.has(id) ? state.picks.delete(id) : state.picks.add(id);
    savePicks(); renderList();
    toast(state.picks.has(id) ? "찜했어요" : "찜을 뺐어요");
  });
  ul.querySelectorAll("[data-focus]").forEach(b => b.onclick = () => {
    state.focus = b.dataset.focus; state.mapFilter = "all"; location.hash = `#/${state.city}/map`;
  });
}

// ===== 전체 지도 =====
function renderAllMap() {
  $("map-chips").innerHTML = [["all", "전체"], ["sights", "관광지"], ["foods", "먹거리"], ["picks", "★ 찜"]].map(([k, l]) =>
    `<button type="button" aria-pressed="${state.mapFilter === k}" data-f="${k}">${l}</button>`).join("");
  $("map-chips").querySelectorAll("button").forEach(b => b.onclick = () => { state.mapFilter = b.dataset.f; state.focus = null; renderAllMap(); });

  let list = places(state.city);
  if (state.mapFilter === "picks") list = list.filter(p => state.picks.has(p.id));
  else if (state.mapFilter !== "all") list = list.filter(p => p.kind === state.mapFilter);
  if (!allMap) allMap = makeMap($("all-map"));
  if (allMap._dead) return;
  allMap._layer.clearLayers();
  const markers = {};
  list.forEach(p => {
    const label = p.kind === "foods" ? "食" : "景";
    markers[p.id] = L.marker(p.pos, { icon: pinIcon(label, p.kind + (state.picks.has(p.id) ? " picked" : "")) })
      .bindPopup(popupHtml(p)).addTo(allMap._layer);
  });
  setTimeout(() => {
    allMap.invalidateSize();
    const f = state.focus && list.find(p => p.id === state.focus);
    if (f) { allMap.setView(f.pos, 16); markers[f.id].openPopup(); }
    else if (list.length) allMap.fitBounds(list.map(p => p.pos), { padding: [30, 30], maxZoom: 15 });
    else allMap.setView(CITIES[state.city].center, 12);
  }, 0);
  if (!list.length) toast("찜한 곳이 없어요");
}

// ===== 예산 =====
function renderCosts() {
  const c = CITIES[state.city].costs;
  $("c-flight").textContent = `${won(c.flight.min)} ~ 평균 ${won(c.flight.avg)}`;
  $("c-flight-note").textContent = c.flight.note;
  $("c-hotel").textContent = `${won(c.hotel.min)} ~ 평균 ${won(c.hotel.avg)}`;
  $("c-hotel-note").textContent = c.hotel.note;
  const row = (r, t) => `<tr><td>${esc(r.name)}<small>${esc(r.note)}</small></td><td class="num">${yen(r.yen)}</td><td class="num">${t}</td></tr>`;
  $("c-rows").innerHTML =
    `<tr class="group"><td colspan="3">교통</td></tr>` + c.transport.map(r => row(r, r.times + "회")).join("") +
    `<tr class="group"><td colspan="3">입장료</td></tr>` + c.tickets.map(r => row(r, "1회")).join("");
  $("sources").innerHTML = SOURCES.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join("");
}
const FIELDS = ["flight", "hotel", "food", "transport", "act", "shop", "rate"];
function budgetDefaults(city) {
  const c = CITIES[city].costs;
  return {
    flight: c.flight.avg, hotel: c.hotel.avg, food: 60000,
    transport: c.transport.reduce((s, r) => s + r.yen * r.times, 0),
    act: c.tickets.reduce((s, r) => s + r.yen, 0), shop: 300000, rate: 930
  };
}
const getBudget = city => ({ ...budgetDefaults(city), ...store.get("budget:" + city, {}) });
let budget = {};
function loadBudget() {
  budget = getBudget(state.city);
  FIELDS.forEach(k => { $("b-" + k).value = budget[k]; });
  renderBudget();
}
function renderBudget() {
  const t = budgetTotal(budget);
  $("b-total").textContent = won(t);
  $("b-each").textContent = won(t / 2);
}
FIELDS.forEach(k => $("b-" + k).addEventListener("input", e => {
  budget[k] = Number(e.target.value) || 0;
  store.set("budget:" + state.city, budget); renderBudget();
}));
$("b-reset").addEventListener("click", () => { store.set("budget:" + state.city, {}); loadBudget(); toast("시세 평균값으로 되돌렸어요"); });

// ===== 준비물 =====
function renderPack() {
  $("checklist").innerHTML = CHECK_ITEMS.map((t, i) =>
    `<li><label><input type="checkbox" id="chk-${i}" ${state.checked.has(t) ? "checked" : ""}><span>${esc(t)}</span></label></li>`).join("");
  CHECK_ITEMS.forEach((t, i) => $("chk-" + i).addEventListener("change", e => {
    e.target.checked ? state.checked.add(t) : state.checked.delete(t); saveChecked(); packProgress();
  }));
  packProgress();
}
function packProgress() {
  const n = CHECK_ITEMS.filter(t => state.checked.has(t)).length;
  $("pack-count").textContent = `${CHECK_ITEMS.length}개 중 ${n}개 준비 완료`;
  $("pack-bar").style.width = (n / CHECK_ITEMS.length * 100) + "%";
}

// ===== 오미쿠지 =====
const pick = a => a[Math.floor(Math.random() * a.length)];
function drawKuji() {
  const c = CITIES[state.city], [k, ko, line] = pick(OMIKUJI.luck);
  $("kuji-luck").textContent = k;
  $("kuji-sub").textContent = `${ko} · ${line}`;
  $("kuji-food").textContent = pick(c.foods).name;
  $("kuji-sight").textContent = pick(c.sights).name;
  $("kuji-mission").textContent = pick(OMIKUJI.mission);
  const box = $("kuji");
  box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
}
$("omikuji-open").addEventListener("click", () => { drawKuji(); $("omikuji").showModal(); });
$("kuji-again").addEventListener("click", drawKuji);
$("kuji-close").addEventListener("click", () => $("omikuji").close());

// ===== 계획 보내기 / 불러오기 =====
const b64enc = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));

function shareUrl() {
  const data = { v: 1, picks: [...state.picks], checked: [...state.checked],
    budget: Object.fromEntries(Object.keys(CITIES).map(k => [k, store.get("budget:" + k, {})])) };
  return location.origin + location.pathname + "#share=" + b64enc(JSON.stringify(data));
}
$("share-open").addEventListener("click", () => {
  $("share-url").value = shareUrl(); $("share-msg").textContent = ""; $("share").showModal();
});
$("share-send").addEventListener("click", async () => {
  const url = $("share-url").value;
  if (navigator.share) {
    try { await navigator.share({ title: "우리 일본여행 계획", text: "내가 정리한 여행 계획이야! 링크 눌러서 불러와줘", url }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); $("share-msg").textContent = "링크를 복사했어요. 카카오톡에 붙여넣어 보내세요."; }
  catch { $("share-url").select(); $("share-msg").textContent = "위 링크를 길게 눌러 복사해 주세요."; }
});
$("share-close").addEventListener("click", () => $("share").close());

let pendingImport = null;
function handleShare(code) {
  try { pendingImport = JSON.parse(b64dec(code)); } catch { toast("링크가 잘못되어 불러오지 못했어요"); return; }
  const p = pendingImport;
  const budgets = Object.values(p.budget || {}).filter(b => Object.keys(b).length).length;
  $("import-summary").textContent = `찜한 곳 ${(p.picks || []).length}곳 · 준비물 체크 ${(p.checked || []).length}개` + (budgets ? ` · 예산 ${budgets}개 도시` : "") +
    ". 불러오면 내 찜과 체크에 합쳐지고, 예산은 받은 값으로 바뀌어요.";
  $("import-banner").hidden = false;
}
$("import-yes").addEventListener("click", () => {
  const p = pendingImport || {};
  (p.picks || []).forEach(x => state.picks.add(x));
  (p.checked || []).forEach(x => state.checked.add(x));
  Object.entries(p.budget || {}).forEach(([k, b]) => { if (CITIES[k] && Object.keys(b).length) store.set("budget:" + k, b); });
  savePicks(); saveChecked();
  $("import-banner").hidden = true; pendingImport = null;
  toast("계획을 불러왔어요"); route();
});
$("import-no").addEventListener("click", () => { $("import-banner").hidden = true; pendingImport = null; });

route();
