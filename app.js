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
  if (c.spots[key]) return { ...c.spots[key], kind: "spot", id: `spot:${city}:${key}` };
  return places(city).find(p => p.name === key);
}

// ===== 사진 =====
// 사진은 GitHub Actions(scripts/fetch_photos.py)가 위키백과에서 미리 받아 images/ 에 넣어 둔다.
// PHOTOS[id] = { src, page } (photos.js). 사진이 없으면 한자 글자로 표시.
const photo = (id, fallback, cls = "", inLink = false) => {
  const p = typeof PHOTOS !== "undefined" && PHOTOS[id];
  if (!p) return `<div class="ph ${cls}"><span class="ph-kanji">${esc(fallback)}</span></div>`;
  const credit = inLink ? `<span class="credit">사진 · 위키백과</span>`
    : `<a class="credit" href="${esc(p.page)}" target="_blank" rel="noopener">사진 · 위키백과</a>`;
  return `<div class="ph loaded ${cls}" style="background-image:url('${esc(p.src)}')">${credit}</div>`;
};
function loadPhotos() {} // 사진이 미리 들어 있어 따로 불러올 필요 없음

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
    `<a class="city-card" href="#/${key}">${photo(`cover:${key}`, c.kanji, "cover", true)}<span class="theme">${esc(c.name)} · ${esc(c.theme)}</span><b>${esc(c.catch)}</b><small>${esc(c.pickLine)}</small></a>`).join("");
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
  if (!valid) { renderCompare(); document.title = "설레는 일본여행"; return scrollTo(0, 0); }
  state.city = city;
  if (!view) { renderCity(); return scrollTo(0, 0); }
  showView(view);
}
addEventListener("hashchange", route);

// 지도 · 예산 · 준비물 카드 일러스트
const TOOL_ART = {
  map: `<svg viewBox="0 0 80 64" aria-hidden="true"><path d="M6 14l22-8 24 8 22-8v44l-22 8-24-8-22 8z" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M28 6v44M52 14v44" stroke="rgba(255,255,255,.55)" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M14 44c10-18 18 4 28-10s10-6 20-18" fill="none" stroke="#ffd9e3" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round"/><path d="M60 26c-5-8-12-4-12 3 0 5 6 9 12 15 6-6 12-10 12-15 0-7-7-11-12-3z" transform="translate(-8 -10) scale(.8)" fill="#fff"/><circle cx="52" cy="19" r="3" fill="#e0356b"/></svg>`,
  money: `<svg viewBox="0 0 80 64" aria-hidden="true"><ellipse cx="30" cy="52" rx="22" ry="7" fill="rgba(0,0,0,.18)"/><g stroke="#fff" stroke-width="2"><ellipse cx="30" cy="46" rx="20" ry="6.5" fill="#f1d27a"/><ellipse cx="30" cy="40" rx="20" ry="6.5" fill="#f6dc92"/><ellipse cx="30" cy="34" rx="20" ry="6.5" fill="#fbe7ad"/></g><circle cx="54" cy="26" r="15" fill="#fff4d6" stroke="#fff" stroke-width="2"/><text x="54" y="33" text-anchor="middle" font-size="21" font-weight="700" fill="#b07a12" font-family="sans-serif">¥</text><circle cx="22" cy="14" r="2.5" fill="#fff"/><circle cx="14" cy="22" r="1.6" fill="#fff"/></svg>`,
  pack: `<svg viewBox="0 0 80 64" aria-hidden="true"><path d="M30 18v-5a4 4 0 014-4h12a4 4 0 014 4v5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="12" y="18" width="56" height="38" rx="8" fill="#fff4f6" stroke="#fff" stroke-width="2"/><rect x="12" y="30" width="56" height="4" fill="#f3c3d1"/><rect x="34" y="28" width="12" height="8" rx="2" fill="#e0356b"/><path d="M26 44l5 5 10-10" fill="none" stroke="#e0356b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 42h10M52 48h7" stroke="#f3c3d1" stroke-width="3" stroke-linecap="round"/></svg>`
};

function renderCity() {
  const c = CITIES[state.city], k = state.city;
  document.title = `${c.name} · 설레는 일본여행`;
  $("city-name").textContent = c.name;
  $("city-kanji").textContent = c.kanji;
  $("city-hero").innerHTML = `<div class="hero-img"${bg(`cover:${k}`)}></div>
    <div class="hero-text"><span class="chip">${esc(c.theme)}</span><h2>${esc(c.catch)}</h2><p>${esc(c.tagline)}</p></div>`;
  const facts = [["❄", "2월 날씨", c.weather], ["✈", "공항 → 시내", c.transport], ["✿", "2월 이벤트", c.events.join(" / ")]];
  $("facts").innerHTML = facts.map(([i, t, v]) => `<div class="fact"><span class="fi">${i}</span><small>${t}</small><p>${esc(v)}</p></div>`).join("");
  // 메뉴: 여행코스는 크게, 먹거리 · 관광지는 사진 카드, 나머지는 작은 아이콘
  const firstSight = { id: `${k}:${c.menuPhotos.sights}` }, firstFood = { id: `${k}:${c.menuPhotos.foods}` };
  const headlines = c.plan.map((d, i) => `<li><span>DAY ${i + 1}</span>${esc(d.headline || d.title)}</li>`).join("");
  $("menu").innerHTML = `
    <a class="m-feature" href="#/${k}/plan"><span class="m-img"${bg(`hero:${k}:1`)}></span>
      <span class="m-text"><small>旅 · 여행코스</small><b>3박 4일 코스 보기 ›</b><ul>${headlines}</ul></span></a>
    <div class="m-two">
      <a class="m-photo" href="#/${k}/foods"><span class="m-img"${bg(firstFood && firstFood.id)}></span><span class="m-text"><small>食</small><b>먹거리</b></span></a>
      <a class="m-photo" href="#/${k}/sights"><span class="m-img"${bg(firstSight && firstSight.id)}></span><span class="m-text"><small>景</small><b>관광지</b></span></a>
    </div>
    <div class="m-three">
      <a class="m-tool t-map" href="#/${k}/map">${TOOL_ART.map}<b>지도</b><small>모든 장소 한눈에</small></a>
      <a class="m-tool t-money" href="#/${k}/budget">${TOOL_ART.money}<b>예산</b><small>${won(budgetTotal(getBudget(k)) / 10000).replace("원", "")}만원 예상</small></a>
      <a class="m-tool t-pack" href="#/${k}/pack">${TOOL_ART.pack}<b>준비물</b><small>${CHECK_ITEMS.filter(t => state.checked.has(t)).length}/${CHECK_ITEMS.length} 챙겼어요</small></a>
        </div>`;
}

let prevView = null;
function showView(view) {
  const c = CITIES[state.city], m = MENU.find(x => x.id === view) || MENU[0];
  $("detail-title").textContent = `${c.name} ${m.name}`;
  $("detail-kanji").textContent = m.ico;
  $("detail-back").href = `#/${state.city}`;
  document.title = `${c.name} ${m.name} · 설레는 일본여행`;
  const viewEl = { plan: "view-plan", foods: "view-list", sights: "view-list", map: "view-map", budget: "view-budget", pack: "view-pack" }[m.id];
  document.querySelectorAll(".view").forEach(v => { v.hidden = v.id !== viewEl; });
  scrollTo(0, 0);
  if (m.id === "plan") renderPlan();
  if (m.id === "foods" || m.id === "sights") {
    if (state.listKind !== m.id) state.listFilter = m.id === "foods" && prevView === "plan" ? `d${state.day + 1}` : "all";
    else if (m.id === "foods" && prevView === "plan") state.listFilter = `d${state.day + 1}`;
    state.listKind = m.id; renderList();
  }
  if (m.id === "map") renderAllMap();
  if (m.id === "budget") { renderCosts(); loadBudget(); }
  if (m.id === "pack") renderPack();
  prevView = m.id;
}

// ===== 여행코스 =====
const WEEKDAY = { 월: "월요일", 화: "화요일", 수: "수요일", 목: "목요일", 금: "금요일", 토: "토요일", 일: "일요일" };
let planStops = [];

const WEEKDAY_EN = { 월: "MONDAY", 화: "TUESDAY", 수: "WEDNESDAY", 목: "THURSDAY", 금: "FRIDAY", 토: "SATURDAY", 일: "SUNDAY" };
const bg = id => { const p = typeof PHOTOS !== "undefined" && PHOTOS[id]; return p ? ` style="background-image:url('${esc(p.src)}')"` : ""; };

function renderPlan() {
  const c = CITIES[state.city];
  if (state.day >= c.plan.length) state.day = 0;
  $("day-chips").innerHTML = c.plan.map((d, i) =>
    `<button type="button" role="tab" aria-selected="${i === state.day}" data-day="${i}">Day ${i + 1}</button>`).join("");
  $("day-chips").querySelectorAll("button").forEach(b => b.onclick = () => { state.day = +b.dataset.day; renderPlan(); scrollTo(0, 0); });

  const d = c.plan[state.day];
  const stops = planStops = d.stops.map(k => resolveStop(state.city, k)).filter(Boolean);
  const sights = stops.filter(s => s.kind !== "spot");
  const foods = places(state.city).filter(p => p.kind === "foods" && p.day === state.day + 1);
  const m = d.title.match(/\((.)\)$/);
  const wd = m ? WEEKDAY_EN[m[1]] || "" : "";
  const dd = String(state.day + 1).padStart(2, "0");

  // 1) 그날의 대표 사진 + 감성 제목
  const heroId = PHOTOS[`hero:${state.city}:${state.day + 1}`] ? `hero:${state.city}:${state.day + 1}` : sights[0] && sights[0].id;
  $("plan-hero").innerHTML = `<div class="hero-img"${bg(heroId)}></div>
    <div class="hero-text"><small>DAY ${dd}${wd ? ` · ${wd}` : ""}</small>
      <h2>${esc(d.headline || d.title)}</h2>
      <p>${sights.map(s => esc(s.name)).join(" → ")}</p></div>`;

  // 2) 코스: 관광지는 사진 위에 글씨를 얹은 큰 카드, 공항·숙소는 얇은 줄, 사이에 이동 수단
  let n = 0;
  $("plan-stops").innerHTML = stops.map((s, i) => {
    const leg = i < stops.length - 1 ? `<li class="leg"><span>${esc((d.legs && d.legs[i]) || "이동")}</span></li>` : "";
    if (s.kind === "spot") {
      const icon = /공항/.test(s.name) ? "✈" : "⌂";
      return `<li class="stop-line"><span class="ico">${icon}</span><b>${esc(s.name)}</b><a href="${gmapsSearch(s.q)}" target="_blank" rel="noopener">지도 ↗</a></li>${leg}`;
    }
    n++;
    return `<li class="stop-card"${bg(s.id)}>
        <a class="pill" href="${gmapsSearch(s.q)}" target="_blank" rel="noopener">지도 ↗</a>
        <div class="stop-text"><span class="n">${String(n).padStart(2, "0")}</span><h3>${esc(s.name)}</h3>${s.desc ? `<p>${esc(s.desc)}</p>` : ""}</div>
      </li>${leg}`;
  }).join("");

  $("plan-tips").innerHTML = d.tips.map(t => `<li>${esc(t)}</li>`).join("");
  $("plan-gmaps").href = "https://www.google.com/maps/dir/" + stops.map(s => encodeURIComponent(s.q)).join("/");

  // 4) 오늘의 맛: 옆으로 넘겨 보는 사진 줄
  $("plan-foods").innerHTML = foods.length ? `<div class="sec-head"><h2>오늘의 맛</h2><a href="#/${state.city}/foods">전체 보기 ›</a></div>
    <div class="food-scroll">${foods.map(p => `<a class="food-tile" href="${gmapsSearch(p.q)}" target="_blank" rel="noopener">
      <span class="img"${bg(p.id)}></span><small>${esc(p.type)}</small><b>${esc(p.name)}</b></a>`).join("")}</div>` : "";
  if ($("plan-map-box").open) drawPlanMap();
}

// 3) 지도는 접어 두고, 펼쳤을 때만 그린다
function drawPlanMap() {
  const stops = planStops;
  if (!planMap) planMap = makeMap($("plan-map"));
  if (planMap._dead) return;
  planMap._layer.clearLayers();
  const latlngs = stops.map(s => s.pos);
  L.polyline(latlngs, { color: getComputedStyle(document.documentElement).getPropertyValue("--ume").trim(), weight: 4, dashArray: "8 8", opacity: .9 }).addTo(planMap._layer);
  const seen = new Set(); // 숙소로 돌아오는 경우 핀이 겹치지 않게 처음 것만 표시
  let n = 0;
  stops.forEach(s => {
    if (seen.has(s.name)) return;
    seen.add(s.name);
    const label = s.kind === "spot" ? (/공항/.test(s.name) ? "空" : "宿") : ++n;
    L.marker(s.pos, { icon: pinIcon(label, s.kind === "spot" ? "spot" : s.kind) }).bindPopup(popupHtml(s)).addTo(planMap._layer);
  });
  setTimeout(() => { planMap.invalidateSize(); planMap.fitBounds(latlngs, { padding: [36, 36], maxZoom: 15 }); }, 0);
}
$("plan-map-box").addEventListener("toggle", () => { if ($("plan-map-box").open) drawPlanMap(); });

// ===== 먹거리 / 관광지 =====
function placeCard(p) {
  const on = state.picks.has(p.id);
  const star = `<button class="star ${on ? "on" : ""}" type="button" data-id="${esc(p.id)}" aria-label="${esc(p.name)} 찜하기" aria-pressed="${on}">${on ? "★" : "☆"}</button>`;
  const links = `<div class="links"><a href="${gmapsSearch(p.q)}" target="_blank" rel="noopener">구글 지도 ↗</a>
      <button type="button" data-focus="${esc(p.id)}">지도에서 보기</button></div>`;
  if (p.kind === "sights") { // 관광지: 사진 위에 이름을 얹은 큰 카드
    return `<li class="sight-card">
      <div class="sight-img"${bg(p.id)}>${star}<div class="stop-text"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div></div>
      ${links}</li>`;
  }
  return `<li class="food-card"> 
      <div class="food-img"${bg(p.id)}>${star}</div>
      <div class="food-body"><small>${esc(p.type || "")}</small><b>${esc(p.name)}</b><p>${esc(p.desc)}</p>${links}</div>
    </li>`;
}
function bindCards(root, rerender) {
  loadPhotos(root);
  root.querySelectorAll(".star").forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    state.picks.has(id) ? state.picks.delete(id) : state.picks.add(id);
    savePicks(); rerender();
    toast(state.picks.has(id) ? "찜했어요" : "찜을 뺐어요");
  });
  root.querySelectorAll("[data-focus]").forEach(b => b.onclick = () => {
    state.focus = b.dataset.focus; state.mapFilter = "all"; location.hash = `#/${state.city}/map`;
  });
}

function renderList() {
  const kind = state.listKind, c = CITIES[state.city];
  // 먹거리는 여행 날짜(그날 가는 동네)별로 나눠 보여준다
  const dayChips = kind === "foods" ? c.plan.map((d, i) => [`d${i + 1}`, `Day ${i + 1}`]) : [];
  const chips = [["all", "전체"], ...dayChips, ["picks", "★ 찜"]];
  if (!chips.some(([k]) => k === state.listFilter)) state.listFilter = "all";
  $("list-chips").innerHTML = chips.map(([k, l]) =>
    `<button type="button" aria-pressed="${state.listFilter === k}" data-f="${k}">${l}</button>`).join("");
  $("list-chips").querySelectorAll("button").forEach(b => b.onclick = () => { state.listFilter = b.dataset.f; renderList(); });

  let list = places(state.city).filter(p => p.kind === kind);
  if (state.listFilter === "picks") list = list.filter(p => state.picks.has(p.id));
  if (state.listFilter.startsWith("d")) list = list.filter(p => p.day === +state.listFilter.slice(1));
  const ul = $("places");
  ul.className = "places" + (kind === "foods" ? " grid2" : "");
  if (!list.length) { ul.innerHTML = `<li class="empty">아직 찜한 곳이 없어요.<br>☆를 눌러 가고 싶은 곳을 담아보세요.</li>`; return; }
  if (kind === "foods") {
    const days = [...new Set(list.map(p => p.day))].sort();
    ul.innerHTML = days.map(day => {
      const plan = c.plan[day - 1];
      return `<li class="group-head"><small>DAY ${String(day).padStart(2, "0")}</small><b>${esc(plan ? (plan.headline || plan.title) : "")}</b></li>` +
        list.filter(p => p.day === day).map(placeCard).join("");
    }).join("");
  } else {
    ul.innerHTML = list.map(placeCard).join("");
  }
  bindCards(ul, renderList);
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
