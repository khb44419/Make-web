const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const won = n => Math.round(n).toLocaleString("ko-KR") + "원";
const yen = n => n.toLocaleString("ko-KR") + "엔";

const days = Math.ceil((new Date("2027-02-01T00:00:00") - new Date()) / 86400000);
$("dday").innerHTML = days > 0 ? `<small>出発まで</small><b>D-${days}</b><small>2027.02</small>` : `<b>旅行中</b>`;

const state = { city: store.get("city", "osaka"), tab: "all", sel: null, picks: new Set(store.get("picks", [])) };

function places() {
  const c = CITIES[state.city];
  return [...c.sights.map(p => ({ ...p, kind: "sights" })), ...c.foods.map(p => ({ ...p, kind: "foods" }))]
    .map((p, i) => ({ ...p, n: i + 1, id: `${state.city}:${p.name}` }));
}
function visible() {
  const all = places();
  if (state.tab === "picks") return all.filter(p => state.picks.has(p.id));
  return state.tab === "all" ? all : all.filter(p => p.kind === state.tab);
}

function selectCity(city) {
  state.city = city; state.sel = null; store.set("city", city);
  const c = CITIES[city];
  document.querySelectorAll("#pick button").forEach(b => b.setAttribute("aria-pressed", b.dataset.city === city));
  $("city-title").textContent = c.name;
  $("city-tagline").textContent = c.tagline;
  $("weather").textContent = c.weather;
  $("transport").textContent = c.transport;
  $("events").textContent = c.events.join(" / ");
  $("plan").innerHTML = c.plan.map((d, i) => {
    const t = d.title.split(" · ")[1] || d.title;
    return `<div class="day"><h4><span class="n">${["一", "二", "三", "四"][i]}日目 · DAY ${i + 1}</span>${esc(t)}</h4><ul>${d.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
  }).join("");
  renderCosts(c.costs);
  loadBudget();
  render();
}

function drawMap(list) {
  const W = 600, H = 440, P = 40, all = places();
  const lats = all.map(p => p.pos[0]), lngs = all.map(p => p.pos[1]);
  const la0 = Math.min(...lats), la1 = Math.max(...lats), lo0 = Math.min(...lngs), lo1 = Math.max(...lngs);
  const kx = Math.cos(((la0 + la1) / 2) * Math.PI / 180);
  const s = Math.min((W - 2 * P) / ((lo1 - lo0) * kx || 1), (H - 2 * P) / ((la1 - la0) || 1));
  const ox = (W - (lo1 - lo0) * kx * s) / 2, oy = (H - (la1 - la0) * s) / 2;
  const xy = p => [ox + (p.pos[1] - lo0) * kx * s, H - oy - (p.pos[0] - la0) * s];
  const km = 5, px = km / 111 * s; // 위도 1도 ≈ 111km
  let html = `<line x1="20" y1="${H - 20}" x2="${(20 + px).toFixed(1)}" y2="${H - 20}" stroke="var(--muted)" stroke-width="2"/>
    <text x="20" y="${H - 26}">${km} km</text><text x="${W - 20}" y="24" text-anchor="end">北 ↑</text>`;
  list.forEach(p => {
    const [x, y] = xy(p);
    html += `<circle class="dot ${p.kind} ${state.sel === p.id ? "on" : ""}" data-id="${esc(p.id)}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9"><title>${esc(p.name)}</title></circle>
      <text class="num" x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="middle">${p.n}</text>`;
  });
  const svg = $("map");
  svg.innerHTML = html;
  svg.querySelectorAll(".dot").forEach(d => d.addEventListener("click", () => {
    state.sel = d.dataset.id; render();
    document.querySelector(`#places li[data-id="${CSS.escape(state.sel)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }));
}

function render() {
  const list = visible();
  drawMap(list);
  const ul = $("places");
  if (!list.length) { ul.innerHTML = `<li class="empty">아직 찜한 곳이 없어요. ☆를 눌러 담아보세요.</li>`; return; }
  ul.innerHTML = list.map(p => {
    const q = encodeURIComponent(`${p.pos[0]},${p.pos[1]}`);
    const on = state.picks.has(p.id);
    return `<li data-id="${esc(p.id)}" class="${state.sel === p.id ? "on" : ""}">
      <span class="tag ${p.kind}">${p.n} ${p.kind === "sights" ? "관광" : "먹거리"}</span>
      <div class="body"><b>${esc(p.name)}</b><p>${esc(p.desc)}</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">구글 지도에서 보기 ↗</a></div>
      <button class="star ${on ? "on" : ""}" aria-label="찜하기" aria-pressed="${on}">${on ? "★" : "☆"}</button></li>`;
  }).join("");
  ul.querySelectorAll("li[data-id]").forEach(li => {
    li.addEventListener("click", e => { if (e.target.closest("a")) return; state.sel = li.dataset.id; render(); });
    li.querySelector(".star").addEventListener("click", e => {
      e.stopPropagation();
      const id = li.dataset.id;
      state.picks.has(id) ? state.picks.delete(id) : state.picks.add(id);
      store.set("picks", [...state.picks]); render();
    });
  });
}

// ---- 비용 시세 ----
function renderCosts(c) {
  $("c-flight").textContent = `${won(c.flight.min)} ~ 평균 ${won(c.flight.avg)}`;
  $("c-flight-note").textContent = c.flight.note;
  $("c-hotel").textContent = `${won(c.hotel.min)} ~ 평균 ${won(c.hotel.avg)}`;
  $("c-hotel-note").textContent = c.hotel.note;
  const row = (r, times) => `<tr><td>${esc(r.name)}</td><td class="num">${yen(r.yen)}</td><td class="num">${times}</td><td class="memo">${esc(r.note)}</td></tr>`;
  $("c-rows").innerHTML =
    `<tr class="group"><td colspan="4">교통</td></tr>` + c.transport.map(r => row(r, r.times + "회")).join("") +
    `<tr class="group"><td colspan="4">입장료</td></tr>` + c.tickets.map(r => row(r, "1회")).join("");
}
$("sources").innerHTML = SOURCES.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join("");

// ---- 예산 계산기 (도시별 저장) ----
const FIELDS = ["flight", "hotel", "food", "transport", "act", "shop", "rate"];
let budget = {};
function defaults(city) {
  const c = CITIES[city].costs;
  return {
    flight: c.flight.avg, hotel: c.hotel.avg, food: 60000,
    transport: c.transport.reduce((s, r) => s + r.yen * r.times, 0),
    act: c.tickets.reduce((s, r) => s + r.yen, 0),
    shop: 300000, rate: 930
  };
}
function loadBudget() {
  budget = { ...defaults(state.city), ...store.get("budget:" + state.city, {}) };
  FIELDS.forEach(k => { $("b-" + k).value = budget[k]; });
  renderBudget();
}
function renderBudget() {
  const b = budget;
  const yenToWon = y => y * b.rate / 100;
  const total = b.flight * 2 + b.hotel * 3 + b.food * 4 * 2 + yenToWon(b.transport + b.act) * 2 + b.shop;
  $("b-total").textContent = won(total);
  $("b-each").textContent = won(total / 2);
}
FIELDS.forEach(k => $("b-" + k).addEventListener("input", e => {
  budget[k] = Number(e.target.value) || 0;
  store.set("budget:" + state.city, budget); renderBudget();
}));
$("b-reset").addEventListener("click", () => { store.set("budget:" + state.city, {}); loadBudget(); });

// ---- 준비물 체크리스트 ----
const CHECK_ITEMS = ["여권 (유효기간 6개월 이상)", "Visit Japan Web 등록", "환전 / 트래블카드", "eSIM 또는 로밍", "항공권 · 숙소 예약 확인",
  "여행자 보험", "두꺼운 코트 · 목도리 · 장갑", "핫팩", "립밤 · 보습제", "접이식 우산", "충전기 · 보조배터리",
  "전압 확인 (일본 100V)", "교통카드 (ICOCA 등)", "USJ · 지브리 파크 티켓 예약"];
const checked = new Set(store.get("checked", []));
$("checklist").innerHTML = CHECK_ITEMS.map((t, i) =>
  `<li><label><input type="checkbox" id="chk-${i}" ${checked.has(t) ? "checked" : ""}><span>${esc(t)}</span></label></li>`).join("");
CHECK_ITEMS.forEach((t, i) => $("chk-" + i).addEventListener("change", e => {
  e.target.checked ? checked.add(t) : checked.delete(t); store.set("checked", [...checked]);
}));

document.querySelectorAll("#pick button").forEach(b => b.addEventListener("click", () => selectCity(b.dataset.city)));
document.querySelectorAll("#tabs button").forEach(b => b.addEventListener("click", () => {
  state.tab = b.dataset.tab;
  document.querySelectorAll("#tabs button").forEach(x => x.setAttribute("aria-pressed", x === b));
  render();
}));
selectCity(CITIES[state.city] ? state.city : "osaka");
