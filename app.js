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
