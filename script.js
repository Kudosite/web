/* ====== EDIT YOUR LINKS HERE ====== */
const CONFIG = {
  youtube: "https://www.youtube.com/@JKudoofficial",             // your channel URL, e.g. https://youtube.com/@yourchannel
  tutorial: ".",           // a YouTube video URL, e.g. https://youtu.be/VIDEO_ID
  scriptDownload: "https://lootdest.org/s?h2VZTUDm", // file URL, e.g. scripts/my-script.js or a full https link
  telegram: "https://t.me/JKudostores",     // your Telegram channel, e.g. https://t.me/yourchannel
  getKey: "https://lootdest.org/s?cijuR4nI",            // where people get the key, e.g. https://your-key-link.com
  keyExpiry: "2026-11-08T00:00:00",   // key expiry date/time: YYYY-MM-DDTHH:MM:SS (your local time). Change it anytime. Leave "" to show a dash.
  keyNotes: [                         // the notes shown on the Get Key page. Add, remove or edit lines freely.
    "Tap GET KEY and finish the steps on the key page.",
    "Copy the key you receive and paste it into the script.",
    "Keys expire when the timer reaches zero. Come back here to get a new one.",
    "Need help? Join our Telegram channel."
  ],
  statsNamespace: "james-kudo-site-official"  // any unique name; keeps your counters separate from other sites
};

/* ====== SCRIPT INFO (shown in the download card) ====== */
const SCRIPT = {
  name: "James Kudo Script",
  description: "Latest script in mobile legends.",
  version: "FREE",
  type: "lua",
  filename: "james-kudo-script.lua",
  code: `JKudo Script FREE
`
};
/* ================================== */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const isSet = (v) => typeof v === "string" && v.trim().length > 1 && !/^YOUR_/i.test(v);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- toast ---- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---- loading screen ---- */
(function () {
  const screen = $("#loadingScreen"), fill = $("#loadingFill"),
        pct = $("#loadingPercent"), status = $("#loadingStatus");
  const duration = reduceMotion ? 300 : 2400;
  const steps = [
    [20, "INITIALIZING..."], [40, "LOADING COMPONENTS..."], [60, "CONNECTING SYSTEM..."],
    [80, "PREPARING PAGE..."], [100, "ALMOST READY..."]
  ];
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min(100, Math.max(1, Math.floor(1 + ((now - t0) / duration) * 99)));
    fill.style.width = p + "%";
    pct.textContent = p + "%";
    status.textContent = p >= 100 ? "COMPLETE" : steps.find((s) => p < s[0])[1];
    if (p < 100) return requestAnimationFrame(tick);
    setTimeout(() => {
      document.body.classList.add("ready");
      screen.classList.add("hide");
      setTimeout(() => screen.remove(), 800);
    }, 250);
  }
  requestAnimationFrame(tick);
})();

/* ---- side menu + theme menu ---- */
const menu = { el: $("#topMenu"), overlay: $("#topMenuOverlay"), btn: $("#menuBtn") };
const themeMenu = { el: $("#themeMenu"), overlay: $("#themeOverlay"), btn: $("#themeBtn") };

function setOpen(m, open) {
  m.el.classList.toggle("show", open);
  m.overlay.classList.toggle("show", open);
  m.btn.setAttribute("aria-expanded", String(open));
}
const closeMenus = () => { setOpen(menu, false); setOpen(themeMenu, false); };

menu.btn.addEventListener("click", () => { setOpen(themeMenu, false); setOpen(menu, !menu.el.classList.contains("show")); });
themeMenu.btn.addEventListener("click", () => { setOpen(menu, false); setOpen(themeMenu, !themeMenu.el.classList.contains("show")); });
menu.overlay.addEventListener("click", closeMenus);
themeMenu.overlay.addEventListener("click", closeMenus);
$("#menuClose").addEventListener("click", closeMenus);
$("#themeClose").addEventListener("click", closeMenus);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

/* color wave that expands from the gear button when the theme changes */
function themeWipe() {
  if (reduceMotion) return;
  const r = themeMenu.btn.getBoundingClientRect();
  const w = document.createElement("div");
  w.className = "theme-wipe";
  w.style.left = r.left + r.width / 2 + "px";
  w.style.top = r.top + r.height / 2 + "px";
  document.body.appendChild(w);
  setTimeout(() => w.remove(), 1000);
}

/* ---- themes (red / green / white), remembered on this device ---- */
const THEMES = { red: "#0c0408", green: "#020804", white: "#070707" };
function applyTheme(name) {
  if (!THEMES[name]) name = "red";
  document.body.classList.remove("theme-red", "theme-green", "theme-white");
  document.body.classList.add("theme-" + name);
  $$(".theme-option").forEach((b) => {
    const on = b.dataset.theme === name;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  $("#themeColor").setAttribute("content", THEMES[name]);
  try { localStorage.setItem("jk_theme", name); } catch {}
  return name;
}
let savedTheme = "red";
try { savedTheme = localStorage.getItem("jk_theme") || "red"; } catch {}
applyTheme(savedTheme);
$$(".theme-option").forEach((b) =>
  b.addEventListener("click", () => {
    const name = applyTheme(b.dataset.theme);
    themeWipe();
    toast("THEME " + name.toUpperCase());
    setTimeout(closeMenus, 250);
  })
);

/* ---- navigation (hash based, back button works) ---- */
/* sliding highlight behind the active bottom-nav item */
function movePill() {
  const pill = $(".nav-pill"), a = $(".nav-item.active");
  if (!pill) return;
  pill.style.opacity = a ? "1" : "0"; // the key page has no bottom-nav tab
  if (!a) return;
  pill.style.width = a.offsetWidth + "px";
  pill.style.transform = `translateX(${a.offsetLeft}px)`;
}
const views = ["home", "tutorial", "download", "key"];
function show(id) {
  if (!views.includes(id)) id = "home";
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === id));
  $$(".nav-item[data-go]").forEach((n) => n.classList.toggle("active", n.dataset.go === id));
  movePill();
  window.scrollTo(0, 0);
}
$$("[data-go]").forEach((el) =>
  el.addEventListener("click", () => {
    const id = el.dataset.go;
    closeMenus();
    if (id === "home") { if (location.hash) history.pushState(null, "", location.pathname); }
    else location.hash = id;
    show(id);
  })
);
window.addEventListener("popstate", () => show(location.hash.slice(1)));
window.addEventListener("hashchange", () => show(location.hash.slice(1)));
show(location.hash.slice(1));

/* ---- external links (YouTube, Telegram, Get Key) ---- */
function wireLink(selector, url, missingMsg, onHit) {
  $$(selector).forEach((a) => {
    if (isSet(url)) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.addEventListener("click", () => { closeMenus(); if (onHit) onHit(); });
    } else {
      a.addEventListener("click", (e) => { e.preventDefault(); toast(missingMsg); });
    }
  });
}
wireLink("[data-yt]", CONFIG.youtube, "Set your YouTube link in script.js", () => Stats.hit("subscribe"));
wireLink("[data-tg]", CONFIG.telegram, "Set your Telegram link in script.js");
wireLink("[data-key]", CONFIG.getKey, "Set your key link in script.js");

/* ---- Tutorial ---- */
function videoId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}
const vid = isSet(CONFIG.tutorial) ? videoId(CONFIG.tutorial) : null;
if (vid) {
  const th = $("#thumb");
  th.src = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
  th.hidden = false;
}
if (isSet(CONFIG.tutorial)) {
  const l = $("#tutLink");
  l.href = CONFIG.tutorial;
  l.hidden = false;
}
$("#watchBtn").addEventListener("click", () => {
  if (!isSet(CONFIG.tutorial)) return toast("Tutorial video coming soon");
  Stats.hit("tutorial");
  if (!vid) return window.open(CONFIG.tutorial, "_blank", "noopener");
  const box = $("#player");
  box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&playsinline=1"
    title="Tutorial video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
});

/* ---- Script download ---- */
$("#sName").textContent = SCRIPT.name;
$("#sDesc").textContent = SCRIPT.description;
$("#sVer").textContent = SCRIPT.version;
const ext = String(SCRIPT.type).replace(/^\./, "");
$("#sType").textContent = "." + ext;
$("#sFile").textContent = ext.toUpperCase().slice(0, 4);
$("#sSize").textContent = (new Blob([SCRIPT.code]).size / 1024).toFixed(1) + " KB";
$("#code").textContent = SCRIPT.code;

$("#copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(SCRIPT.code);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = SCRIPT.code;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) return toast("Copy failed. Select the code and copy manually.");
  }
  toast("Copied!");
});

$("#dlBtn").addEventListener("click", () => {
  const btn = $("#dlBtn"), lbl = btn.querySelector(".lbl");
  if (btn.classList.contains("busy")) return;
  Stats.hit("downloads");
  btn.classList.remove("done");
  btn.classList.add("busy");
  lbl.textContent = "DOWNLOADING...";

  const a = document.createElement("a");
  if (isSet(CONFIG.scriptDownload)) {
    a.href = CONFIG.scriptDownload;
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    // No link configured yet: download the script shown above
    a.href = URL.createObjectURL(new Blob([SCRIPT.code], { type: "text/plain" }));
    a.download = SCRIPT.filename;
  }
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    btn.classList.remove("busy");
    btn.classList.add("done");
    lbl.textContent = "DOWNLOADED";
    toast("Download started");
    setTimeout(() => { btn.classList.remove("done"); lbl.textContent = "DOWNLOAD SCRIPT"; }, 2200);
  }, 1100);
});

/* ---- live stats (shared counters via free Abacus service) ---- */
const Stats = (() => {
  const base = "https://abacus.jasoncameron.dev";
  const ns = encodeURIComponent(CONFIG.statsNamespace);
  const keys = { visitors: "visitors", downloads: "downloads", tutorial: "tutorial-views", subscribe: "subscribe-clicks" };
  const shown = {};

  function render(k, n) {
    const el = document.querySelector(`[data-stat="${k}"]`);
    if (!el || n == null) return;
    const from = shown[k] || 0, t0 = performance.now();
    shown[k] = n;
    (function step(t) {
      const p = Math.min((t - t0) / 800, 1);
      el.textContent = Math.round(from + (n - from) * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  async function call(mode, k) {
    try {
      const r = await fetch(`${base}/${mode}/${ns}/${keys[k]}`);
      if (r.status === 404) return 0;
      if (!r.ok) return null;
      return (await r.json()).value;
    } catch { return null; }
  }
  const hit = (k) => call("hit", k).then((v) => render(k, v));

  function init() {
    let isNew = false;
    try {
      if (!localStorage.getItem("jk_visited")) { isNew = true; localStorage.setItem("jk_visited", "1"); }
    } catch {}
    // count each device once as a visitor
    if (isNew) hit("visitors"); else call("get", "visitors").then((v) => render("visitors", v));
    ["downloads", "tutorial", "subscribe"].forEach((k) => call("get", k).then((v) => render(k, v)));
  }
  return { hit, init };
})();
Stats.init();

/* ---- motion extras ---- */
// enable the nav pill's slide only after its first placement
requestAnimationFrame(() => requestAnimationFrame(() => $(".nav-pill").classList.add("animate")));
addEventListener("resize", movePill);
addEventListener("load", movePill);

// button ripple
document.addEventListener("pointerdown", (e) => {
  if (reduceMotion) return;
  const t = e.target.closest(".sc-download,.ghost-btn,.skip-card");
  if (!t) return;
  const r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
  const d = document.createElement("span");
  d.className = "ripple";
  d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  t.appendChild(d);
  setTimeout(() => d.remove(), 700);
});

// card spotlight follows the pointer
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest(".sc-card,.skip-card,.stat,.tutorial-card");
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px");
  c.style.setProperty("--my", e.clientY - r.top + "px");
});

/* ---- key expiry countdown (edit CONFIG.keyExpiry at the top) ---- */
(function () {
  const out = $("[data-key-expiry]"), card = $("#keyStat");
  const pad = (n) => String(n).padStart(2, "0");
  const end = CONFIG.keyExpiry ? Date.parse(CONFIG.keyExpiry) : NaN;
  if (isNaN(end)) { out.textContent = "–"; return; }
  const timer = setInterval(tick, 1000);
  function tick() {
    const s = Math.floor((end - Date.now()) / 1000);
    if (s <= 0) {
      out.textContent = "EXPIRED";
      card.classList.add("expired");
      clearInterval(timer);
      return;
    }
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    out.textContent = (d ? d + "d " : "") + pad(h) + ":" + pad(m) + ":" + pad(s % 60);
  }
  tick();
})();

/* ---- key page notes (edit CONFIG.keyNotes at the top) ---- */
(CONFIG.keyNotes || []).forEach((t) => {
  const li = document.createElement("li");
  li.textContent = t;
  $("#keyNotes").appendChild(li);
});
