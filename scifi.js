/* ════════════════════════════════════════════════════════════════════
   scifi.js — shared sci-fi atmosphere layer for Psyverse destination pages
   Drifting constellation starfield · corner HUD telemetry · scanline grid
   · one-time boot-scan sweep. Palette-matched to worlds.css (ink + gold +
   jade). All motion is gated behind prefers-reduced-motion and pauses when
   the tab is hidden. Pointer-events: none everywhere — purely atmospheric.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__psyverseScifi) return;
  window.__psyverseScifi = true;

  var GOLD = "201,162,75";
  var GOLD_BRIGHT = "230,192,113";
  var JADE = "90,143,115";
  var IVORY = "236,228,211";

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── styles ─────────────────────────────────────────────────────── */
  var css = `
  #scifi-stars{position:fixed;inset:0;z-index:-1;pointer-events:none;}
  .scifi-overlay{position:fixed;inset:0;z-index:1;pointer-events:none;
    mix-blend-mode:screen;opacity:.55;}
  .scifi-overlay::before{content:"";position:absolute;inset:0;
    background:repeating-linear-gradient(0deg,
      rgba(${IVORY},.025) 0,rgba(${IVORY},.025) 1px,
      transparent 1px,transparent 3px);}
  .scifi-overlay::after{content:"";position:absolute;inset:0;
    background:
      linear-gradient(rgba(${GOLD},.05) 1px,transparent 1px) 0 0/100% 92px,
      linear-gradient(90deg,rgba(${GOLD},.05) 1px,transparent 1px) 0 0/92px 100%;
    -webkit-mask-image:radial-gradient(ellipse at 50% 45%,transparent 55%,#000 100%);
    mask-image:radial-gradient(ellipse at 50% 45%,transparent 55%,#000 100%);}
  .scifi-hud{position:fixed;z-index:3;pointer-events:none;
    font-family:"JetBrains Mono",monospace;font-size:9px;line-height:1.7;
    letter-spacing:.22em;text-transform:uppercase;
    color:rgba(${GOLD},.5);text-shadow:0 0 8px rgba(${GOLD},.25);}
  .scifi-hud .v{color:rgba(${GOLD_BRIGHT},.7);}
  .scifi-hud.tl{top:58px;left:18px;}
  .scifi-hud.br{right:18px;bottom:54px;text-align:right;}
  .scifi-corner{position:fixed;z-index:3;pointer-events:none;
    width:22px;height:22px;opacity:.45;}
  .scifi-corner i{position:absolute;background:rgba(${GOLD},.6);
    box-shadow:0 0 6px rgba(${GOLD},.4);}
  .scifi-corner i.h{height:1px;width:22px;}
  .scifi-corner i.v{width:1px;height:22px;}
  .scifi-corner.tl{top:46px;left:8px;}.scifi-corner.tl i.v{top:0;left:0;}.scifi-corner.tl i.h{top:0;left:0;}
  .scifi-corner.tr{top:46px;right:8px;}.scifi-corner.tr i.v{top:0;right:0;}.scifi-corner.tr i.h{top:0;right:0;}
  .scifi-corner.bl{bottom:8px;left:8px;}.scifi-corner.bl i.v{bottom:0;left:0;}.scifi-corner.bl i.h{bottom:0;left:0;}
  .scifi-corner.br{bottom:8px;right:8px;}.scifi-corner.br i.v{bottom:0;right:0;}.scifi-corner.br i.h{bottom:0;right:0;}
  .scifi-scan{position:fixed;left:0;right:0;top:0;height:2px;z-index:4;
    pointer-events:none;
    background:linear-gradient(90deg,transparent,rgba(${GOLD_BRIGHT},.8),transparent);
    box-shadow:0 0 18px 4px rgba(${GOLD},.35);
    animation:scifiBoot 1.7s cubic-bezier(.4,0,.2,1) forwards;}
  @keyframes scifiBoot{0%{transform:translateY(0);opacity:0;}
    8%{opacity:1;}92%{opacity:1;}100%{transform:translateY(100vh);opacity:0;}}
  @media (max-width:680px){.scifi-hud{font-size:8px;}.scifi-overlay{opacity:.4;}}
  @media (prefers-reduced-motion: reduce){
    .scifi-overlay{opacity:.32;}.scifi-scan{display:none;}}
  `;
  var st = document.createElement("style");
  st.id = "scifi-style";
  st.textContent = css;
  document.head.appendChild(st);

  /* ── DOM scaffold ───────────────────────────────────────────────── */
  function el(cls, html) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    if (html) d.innerHTML = html;
    return d;
  }
  var canvas = document.createElement("canvas");
  canvas.id = "scifi-stars";

  var overlay = el("scifi-overlay");
  var corners = ["tl", "tr", "bl", "br"].map(function (p) {
    return el("scifi-corner " + p, '<i class="h"></i><i class="v"></i>');
  });

  // page label from <title> — first token before a separator
  var label = (document.title || "PSYVERSE").split(/[—·|]/)[0].trim().toUpperCase().slice(0, 22);
  var hudTL = el("scifi-hud tl",
    'ψ · PSYVERSE NET<br>' +
    '<span class="en">NODE</span><span class="cn">节点</span> · <span class="v">' + label + '</span><br>' +
    '<span class="en">SYS</span><span class="cn">系统</span> · <span class="v">ONLINE</span>');
  var hudBR = el("scifi-hud br",
    '<span class="en">LINK</span><span class="cn">链接</span> · <span class="v" id="scifi-lk">000</span><br>' +
    'LAT <span class="v" id="scifi-lat">00.000</span><br>' +
    'LON <span class="v" id="scifi-lon">000.000</span><br>' +
    'T+<span class="v" id="scifi-up">0000</span>');

  function mount() {
    var b = document.body;
    b.appendChild(canvas);
    b.appendChild(overlay);
    corners.forEach(function (c) { b.appendChild(c); });
    b.appendChild(hudTL);
    b.appendChild(hudBR);
    if (!reduce) {
      var scan = el("scifi-scan");
      b.appendChild(scan);
      scan.addEventListener("animationend", function () { scan.remove(); });
    }
    start();
  }

  /* ── starfield ──────────────────────────────────────────────────── */
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, stars = [], LINK = 118;

  function seedStars() {
    var area = (W * H) / (dpr * dpr);
    var n = Math.max(34, Math.min(96, Math.round(area / 17000)));
    stars = [];
    for (var i = 0; i < n; i++) {
      var hue = i % 7 === 0 ? JADE : (i % 3 === 0 ? GOLD_BRIGHT : GOLD);
      stars.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.12, 0.12) * dpr, vy: rand(-0.12, 0.12) * dpr,
        r: rand(0.4, 1.5) * dpr, hue: hue,
        tw: rand(0, Math.PI * 2), ts: rand(0.6, 1.8)
      });
    }
  }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    seedStars();
  }

  var t0 = Date.now(), linkCount = 0;
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var maxD = LINK * dpr, links = 0;
    // constellation links
    for (var i = 0; i < stars.length; i++) {
      var a = stars[i];
      for (var j = i + 1; j < stars.length; j++) {
        var b = stars[j];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < maxD) {
          var o = (1 - d / maxD) * 0.16;
          ctx.strokeStyle = "rgba(" + GOLD + "," + o.toFixed(3) + ")";
          ctx.lineWidth = 0.6 * dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          links++;
        }
      }
    }
    linkCount = links;
    // stars
    for (var k = 0; k < stars.length; k++) {
      var s = stars[k];
      if (!reduce) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x += W; else if (s.x > W) s.x -= W;
        if (s.y < 0) s.y += H; else if (s.y > H) s.y -= H;
      }
      var tw = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(now / 1000 * s.ts + s.tw);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + s.hue + "," + (0.5 * tw).toFixed(3) + ")";
      ctx.shadowBlur = 6 * dpr; ctx.shadowColor = "rgba(" + s.hue + ",0.5)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  /* ── telemetry readout ──────────────────────────────────────────── */
  var lk = null, lat = null, lon = null, up = null;
  var phase = Math.random() * Math.PI * 2;
  function telemetry() {
    if (!lk) { lk = byId("scifi-lk"); lat = byId("scifi-lat"); lon = byId("scifi-lon"); up = byId("scifi-up"); }
    if (lk) lk.textContent = String(linkCount).padStart(3, "0");
    var t = (Date.now() - t0) / 1000;
    if (lat) lat.textContent = (37 + 8 * Math.sin(t * 0.07 + phase)).toFixed(3);
    if (lon) lon.textContent = (122 + 14 * Math.cos(t * 0.05 + phase)).toFixed(3);
    if (up) up.textContent = String(Math.floor(t)).padStart(4, "0");
  }
  function byId(id) { return document.getElementById(id); }

  /* ── loop ───────────────────────────────────────────────────────── */
  var raf = 0, running = false, lastTel = 0;
  function frame(now) {
    if (!running) return;
    draw(now);
    if (now - lastTel > 500) { telemetry(); lastTel = now; }
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  function start() {
    resize();
    running = true;
    if (reduce) { draw(performance.now()); telemetry(); }
    else raf = requestAnimationFrame(frame);
    window.addEventListener("resize", debounce(resize, 200));
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce) { running = true; raf = requestAnimationFrame(frame); }
    });
  }
  function debounce(fn, ms) {
    var id; return function () { clearTimeout(id); id = setTimeout(fn, ms); };
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
