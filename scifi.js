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

  // content cards that receive HUD corner brackets. Curated to card/panel/
  // tile-sized blocks with no existing ::before/::after; tiny cells, list
  // items, and graph nodes are excluded to avoid clutter and reanchoring of
  // absolutely-positioned descendants.
  var CARDS = ["w-card", "dom-panel", "ss-card", "vision-cell", "world-tile",
    "clmb-card", "cx-card", "purpose-card", "approach-card", "frontier-card",
    "conflict-card", "compound-card", "pattern-card", "refusal-card", "we-card"];
  var cSel = CARDS.map(function (c) { return "." + c; }).join(",");
  var cBefore = CARDS.map(function (c) { return "." + c + "::before"; }).join(",");
  var cAfter = CARDS.map(function (c) { return "." + c + "::after"; }).join(",");
  var cHovBefore = CARDS.map(function (c) { return "." + c + ":hover::before"; }).join(",");
  var cHovAfter = CARDS.map(function (c) { return "." + c + ":hover::after"; }).join(",");
  var cHov = CARDS.map(function (c) { return "." + c + ":hover::before,." + c + ":hover::after"; }).join(",");

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
  .w-h2.scifi-decrypting{color:rgba(${GOLD_BRIGHT},.92)!important;
    text-shadow:0 0 12px rgba(${GOLD},.35);}
  .w-h2.scifi-decrypting>.cn{opacity:.35;}
  .scifi-reticle{position:fixed;top:0;left:0;z-index:5;pointer-events:none;
    width:44px;height:44px;margin:-22px 0 0 -22px;opacity:0;will-change:transform;
    transition:opacity .3s,width .16s ease,height .16s ease,margin .16s ease;}
  .scifi-reticle.on{opacity:.5;}
  .scifi-reticle .ring{position:absolute;inset:0;border-radius:50%;
    border:1px solid rgba(${GOLD},.55);box-shadow:inset 0 0 8px rgba(${GOLD},.2);
    transition:border-color .16s;}
  .scifi-reticle .dot{position:absolute;left:50%;top:50%;width:2px;height:2px;
    margin:-1px 0 0 -1px;border-radius:50%;background:rgba(${GOLD_BRIGHT},.85);}
  .scifi-reticle .tick{position:absolute;background:rgba(${GOLD_BRIGHT},.8);}
  .scifi-reticle .tick.t,.scifi-reticle .tick.b{left:50%;width:1px;height:6px;margin-left:-.5px;}
  .scifi-reticle .tick.l,.scifi-reticle .tick.r{top:50%;height:1px;width:6px;margin-top:-.5px;}
  .scifi-reticle .tick.t{top:-3px;}.scifi-reticle .tick.b{bottom:-3px;}
  .scifi-reticle .tick.l{left:-3px;}.scifi-reticle .tick.r{right:-3px;}
  .scifi-reticle.lock{width:62px;height:62px;margin:-31px 0 0 -31px;opacity:.85;}
  .scifi-reticle.lock .ring{border-color:rgba(${GOLD_BRIGHT},.85);
    box-shadow:inset 0 0 10px rgba(${GOLD},.3),0 0 10px rgba(${GOLD},.25);}
  .scifi-reticle .xy{position:absolute;left:50%;top:100%;transform:translateX(-50%);
    margin-top:7px;font-family:"JetBrains Mono",monospace;font-size:8px;
    letter-spacing:.16em;color:rgba(${GOLD},.7);white-space:nowrap;}
  @media (pointer:coarse){.scifi-reticle{display:none!important;}}
  ${cSel}{position:relative;}
  ${cBefore},${cAfter}{content:"";position:absolute;width:9px;height:9px;
    pointer-events:none;border:1px solid transparent;
    transition:border-color .35s,width .35s,height .35s;}
  ${cBefore}{top:7px;left:7px;
    border-top-color:rgba(${GOLD},.28);border-left-color:rgba(${GOLD},.28);}
  ${cAfter}{bottom:7px;right:7px;
    border-bottom-color:rgba(${GOLD},.28);border-right-color:rgba(${GOLD},.28);}
  ${cHov}{width:13px;height:13px;}
  ${cHovBefore}{border-top-color:rgba(${GOLD_BRIGHT},.85);border-left-color:rgba(${GOLD_BRIGHT},.85);}
  ${cHovAfter}{border-bottom-color:rgba(${GOLD_BRIGHT},.85);border-right-color:rgba(${GOLD_BRIGHT},.85);}
  @media (max-width:680px){.scifi-hud{font-size:8px;opacity:.66;}.scifi-overlay{opacity:.34;}}
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
  // deterministic per-page worldbuilding ids derived from the label
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  var hv = hash(label);
  var sector = (hv % 256).toString(16).toUpperCase();
  if (sector.length < 2) sector = "0" + sector;
  var freq = (108 + (hv % 8000) / 100).toFixed(2);
  var hudTL = el("scifi-hud tl",
    'ψ · PSYVERSE NET<br>' +
    '<span class="en">NODE</span><span class="cn">节点</span> · <span class="v">' + label + '</span><br>' +
    '<span class="en">SECTOR</span><span class="cn">区段</span> · <span class="v">0x' + sector + '</span><br>' +
    '<span class="en">SYS</span><span class="cn">系统</span> · <span class="v">ONLINE</span>');
  var hudBR = el("scifi-hud br",
    '<span class="en">LINK</span><span class="cn">链接</span> · <span class="v" id="scifi-lk">000</span><br>' +
    '<span class="en">FREQ</span><span class="cn">频率</span> · <span class="v">' + freq + '</span><br>' +
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
    buildReticle();
    start();
  }

  /* ── cursor-following HUD reticle ───────────────────────────────── */
  function buildReticle() {
    if (reduce || !window.matchMedia ||
        !window.matchMedia("(pointer:fine)").matches) return;
    reticle = el("scifi-reticle",
      '<span class="ring"></span><span class="dot"></span>' +
      '<i class="tick t"></i><i class="tick r"></i>' +
      '<i class="tick b"></i><i class="tick l"></i>' +
      '<span class="xy" id="scifi-xy"></span>');
    document.body.appendChild(reticle);
    var xy = reticle.querySelector("#scifi-xy");
    var lockSel = "a,button,summary,input,select,textarea,label," +
      "[role=button],[onclick],[tabindex],.w-tab,.w-tabs *,.w-back";
    window.addEventListener("mousemove", function (e) {
      trx = e.clientX; trY = e.clientY;
      if (!reticle.classList.contains("on")) reticle.classList.add("on");
      var hit = e.target && e.target.closest && e.target.closest(lockSel);
      reticle.classList.toggle("lock", !!hit);
      if (xy) xy.textContent = "X" + pad4(e.clientX) + " Y" + pad4(e.clientY);
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      reticle.classList.remove("on");
    });
  }
  function pad4(n) { return String(n).padStart(4, "0"); }

  /* ── starfield ──────────────────────────────────────────────────── */
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, stars = [], LINK = 118;
  var packets = [];           // data pulses traveling along constellation links
  var px = 0, py = 0, tpx = 0, tpy = 0;  // eased parallax offset
  var reticle = null, rx = 0, ry = 0, trx = 0, trY = 0;  // eased HUD reticle

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
    ctx.save();
    ctx.translate(px, py);
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
          // occasionally transmit a data packet along this link
          if (!reduce && packets.length < 16 && Math.random() < 0.0016) {
            packets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, sp: rand(0.012, 0.03) });
          }
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
    // data packets
    for (var pI = packets.length - 1; pI >= 0; pI--) {
      var pk = packets[pI];
      pk.t += pk.sp;
      if (pk.t >= 1) { packets.splice(pI, 1); continue; }
      var x = pk.ax + (pk.bx - pk.ax) * pk.t, y = pk.ay + (pk.by - pk.ay) * pk.t;
      var fade = Math.sin(pk.t * Math.PI);
      ctx.beginPath();
      ctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + GOLD_BRIGHT + "," + (0.85 * fade).toFixed(3) + ")";
      ctx.shadowBlur = 9 * dpr; ctx.shadowColor = "rgba(" + GOLD_BRIGHT + ",0.85)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
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
    px += (tpx - px) * 0.05; py += (tpy - py) * 0.05;
    if (reticle) {
      rx += (trx - rx) * 0.22; ry += (trY - ry) * 0.22;
      reticle.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    }
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
    if (!reduce) {
      var mY = 0.5;
      function applyParallax() {
        var scrollShift = -(window.scrollY || 0) * 0.012 * dpr;
        tpx = (mX - 0.5) * 22 * dpr;
        tpy = (mY - 0.5) * 22 * dpr + scrollShift;
      }
      var mX = 0.5;
      window.addEventListener("mousemove", function (e) {
        mX = e.clientX / window.innerWidth;
        mY = e.clientY / window.innerHeight;
        applyParallax();
      }, { passive: true });
      window.addEventListener("scroll", applyParallax, { passive: true });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce) { running = true; raf = requestAnimationFrame(frame); }
    });
  }
  function debounce(fn, ms) {
    var id; return function () { clearTimeout(id); id = setTimeout(fn, ms); };
  }

  /* ── decrypt-on-reveal for section headings ─────────────────────── */
  // Scrambles ONLY the leading text node of each .w-h2 through sci-fi
  // glyphs, resolving left-to-right when the heading scrolls into view.
  // Length and whitespace are preserved so layout never reflows; the
  // bilingual <span> children are never touched.
  var GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789#%&*<>/\\|=+:░▒▓キミラサヲンΨψ";
  function decryptReveal() {
    if (reduce || !("IntersectionObserver" in window)) return;
    var heads = document.querySelectorAll(".w-h2");
    if (!heads.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        scramble(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.2 });
    heads.forEach(function (h) {
      var node = h.firstChild;
      if (!node || node.nodeType !== 3 || !node.nodeValue.trim()) return;
      io.observe(h);
    });
  }
  function scramble(h) {
    var node = h.firstChild;
    if (!node || node.nodeType !== 3) return;
    var orig = node.nodeValue;
    var chars = Array.prototype.slice.call(orig);
    var revealAt = chars.map(function (c, i) {
      return c.trim() === "" ? 0 : i * 0.9 + Math.random() * 7;
    });
    var maxF = Math.max.apply(null, revealAt) + 3, f = 0;
    h.classList.add("scifi-decrypting");
    function step() {
      var out = "";
      for (var i = 0; i < chars.length; i++) {
        if (chars[i].trim() === "" || f >= revealAt[i]) out += chars[i];
        else out += GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
      }
      node.nodeValue = out;
      f++;
      if (f <= maxF) requestAnimationFrame(step);
      else { node.nodeValue = orig; h.classList.remove("scifi-decrypting"); }
    }
    requestAnimationFrame(step);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", function () { mount(); decryptReveal(); });
  else { mount(); decryptReveal(); }
})();
