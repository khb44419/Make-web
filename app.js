const TRIP_DATE = new Date("2027-02-01T00:00:00");
const days = Math.ceil((TRIP_DATE - new Date()) / 86400000);
document.getElementById("dday").textContent =
  days > 0 ? `출발까지 D-${days} (2027년 2월 중)` : "여행 중이거나 다녀왔어요!";

const state = { city: null, tab: "all", picks: load() };
let map, layer;

function load() {
  try { return new Set(JSON.parse(localStorage.getItem("picks") || "[]")); }
  catch { return new Set(); }
}
function save() {
  try { localStorage.setItem("picks", JSON.stringify([...state.picks])); } catch {}
}

function placesOf(city) {
  const c = CITIES[city];
  return [
    ...c.sights.map(p => ({ ...p, kind: "sights", icon: "🏛️" })),
    ...c.foods.map(p => ({ ...p, kind: "foods", icon: "🍜" }))
  ].map(p => ({ ...p, id: `${city}:${p.name}` }));
}

function selectCity(city) {
  state.city = city; state.tab = "all";
  const c = CITIES[city];
  document.getElementById("empty").hidden = true;
  document.getElementById("dashboard").hidden = false;
  document.getElementById("city-title").textContent = `${c.emoji} ${c.name}`;
  document.getElementById("city-tagline").textContent = c.tagline;
  document.getElementById("weather").textContent = c.weather;
  document.getElementById("transport").textContent = c.transport;
  document.getElementById("plan").innerHTML = c.plan.map(d =>
    `<div><h4>${d.title}</h4><ul>${d.items.map(i => `<li>${i}</li>`).join("")}</ul></div>`).join("");
  document.getElementById("events").innerHTML = c.events.map(e => `<li>${e}</li>`).join("");
  document.querySelectorAll(".city-buttons button").forEach(b => b.classList.toggle("active", b.dataset.city === city));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === "all"));

  if (!map) {
    map = L.map("map");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "© OpenStreetMap"
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
  }
  map.setView(c.center, c.zoom);
  setTimeout(() => map.invalidateSize(), 0);
  render();
}

function visible() {
  const all = placesOf(state.city);
  if (state.tab === "picks") return all.filter(p => state.picks.has(p.id));
  if (state.tab === "all") return all;
  return all.filter(p => p.kind === state.tab);
}

function render() {
  const list = visible();
  layer.clearLayers();
  const markers = {};
  list.forEach(p => {
    markers[p.id] = L.marker(p.pos).addTo(layer)
      .bindPopup(`<b>${p.icon} ${p.name}</b><br>${p.desc}`);
  });

  const ul = document.getElementById("places");
  ul.innerHTML = "";
  if (!list.length) ul.innerHTML = `<li>아직 찜한 곳이 없어요. ⭐을 눌러보세요!</li>`;
  list.forEach(p => {
    const li = document.createElement("li");
    const on = state.picks.has(p.id);
    li.innerHTML = `<div><b>${p.icon} ${p.name}</b><p class="desc">${p.desc}</p></div>
      <button class="star ${on ? "on" : ""}" aria-label="찜하기">⭐</button>`;
    li.addEventListener("click", () => {
      map.setView(p.pos, 15);
      markers[p.id].openPopup();
      document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    li.querySelector(".star").addEventListener("click", e => {
      e.stopPropagation();
      state.picks.has(p.id) ? state.picks.delete(p.id) : state.picks.add(p.id);
      save(); render();
    });
    ul.appendChild(li);
  });
}

document.querySelectorAll(".city-buttons button").forEach(b =>
  b.addEventListener("click", () => selectCity(b.dataset.city)));
document.querySelectorAll(".tabs button").forEach(b =>
  b.addEventListener("click", () => {
    state.tab = b.dataset.tab;
    document.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("active", x === b));
    render();
  }));

// ---- 예산 계산기 ----
const BUDGET_DEFAULTS = { flight: 300000, hotel: 100000, food: 60000, transport: 15000, act: 100000, shop: 300000 };
const budget = (() => {
  try { return { ...BUDGET_DEFAULTS, ...JSON.parse(localStorage.getItem("budget") || "{}") }; }
  catch { return { ...BUDGET_DEFAULTS }; }
})();
function renderBudget() {
  const b = budget;
  const total = b.flight * 2 + b.hotel * 3 + (b.food + b.transport) * 4 * 2 + b.act * 2 + b.shop;
  document.getElementById("b-total").textContent = total.toLocaleString();
  document.getElementById("b-each").textContent = Math.round(total / 2).toLocaleString();
}
Object.keys(BUDGET_DEFAULTS).forEach(k => {
  const el = document.getElementById("b-" + k);
  el.value = budget[k];
  el.addEventListener("input", () => {
    budget[k] = Number(el.value) || 0;
    try { localStorage.setItem("budget", JSON.stringify(budget)); } catch {}
    renderBudget();
  });
});
renderBudget();

// ---- 준비물 체크리스트 ----
const CHECK_ITEMS = ["여권 (유효기간 6개월 이상)", "Visit Japan Web 등록", "환전 / 트래블카드", "eSIM 또는 로밍", "항공권 · 숙소 예약 확인",
  "여행자 보험", "두꺼운 코트 · 목도리 · 장갑", "핫팩", "립밤 · 보습제 (건조해요)", "접이식 우산", "충전기 · 보조배터리",
  "전압 확인 (일본 100V)", "이코카(ICOCA) 카드", "테마파크·지브리 파크 티켓 예약"];
let checked;
try { checked = new Set(JSON.parse(localStorage.getItem("checked") || "[]")); } catch { checked = new Set(); }
const ul = document.getElementById("checklist");
CHECK_ITEMS.forEach(t => {
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="checkbox"> <span></span></label>`;
  li.querySelector("span").textContent = t;
  const cb = li.querySelector("input");
  cb.checked = checked.has(t);
  cb.addEventListener("change", () => {
    cb.checked ? checked.add(t) : checked.delete(t);
    try { localStorage.setItem("checked", JSON.stringify([...checked])); } catch {}
  });
  ul.appendChild(li);
});
