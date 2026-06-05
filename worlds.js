/* Psyverse · Worlds — shared behavior: registry, nav builder, language toggle, scroll-reveal.
   Source content is never modified; this only builds chrome, toggles visibility & animates. */
(function () {
  var root = document.documentElement;

  /* ── the 16 worlds (order = manifesto order) ── */
  var WORLDS = [
    { slug: 'mission',       n: '01', en: 'Mission',       cn: '使命',       soft: 'rgba(201,162,75,0.06)' },
    { slug: 'identity',      n: '02', en: 'Identity',      cn: '身份',       soft: 'rgba(198,150,78,0.06)' },
    { slug: 'principles',    n: '03', en: 'Principles',    cn: '原则',       soft: 'rgba(208,168,80,0.06)' },
    { slug: 'integrations',  n: '04', en: 'Integrations',  cn: '融合',       soft: 'rgba(182,128,112,0.06)' },
    { slug: 'archetypes',    n: '05', en: 'Archetypes',    cn: '五行',       soft: 'rgba(96,150,120,0.06)' },
    { slug: 'domains',       n: '06', en: 'Domains',       cn: '领域',       soft: 'rgba(82,146,146,0.06)' },
    { slug: 'deep-series',   n: '07', en: 'Deep Series',   cn: '深度系列',   soft: 'rgba(92,134,170,0.07)' },
    { slug: 'hubs',          n: '08', en: 'Hubs',          cn: '枢纽',       soft: 'rgba(90,124,184,0.07)' },
    { slug: 'matrix',        n: '09', en: 'Matrix',        cn: '矩阵',       soft: 'rgba(116,116,184,0.07)' },
    { slug: 'breakthroughs', n: '10', en: 'Breakthroughs', cn: '突破',       soft: 'rgba(142,112,182,0.07)' },
    { slug: 'agi',           n: '11', en: 'AGI',           cn: '通用智能',   soft: 'rgba(86,152,162,0.07)' },
    { slug: 'purposes',      n: '12', en: 'Purposes',      cn: '宗旨',       soft: 'rgba(201,162,75,0.06)' },
    { slug: 'navigation',    n: '13', en: 'Navigation',    cn: '导航',       soft: 'rgba(122,142,162,0.07)' },
    { slug: 'cultures',      n: '14', en: 'Cultures',      cn: '文化',       soft: 'rgba(184,134,92,0.06)' },
    { slug: 'beliefs',       n: '15', en: 'Beliefs',       cn: '信仰',       soft: 'rgba(152,112,172,0.07)' },
    { slug: 'visions',       n: '16', en: 'Visions',       cn: '愿景',       soft: 'rgba(212,172,92,0.07)' }
  ];
  window.PSY_WORLDS = WORLDS;

  var cur = document.body ? document.body.getAttribute('data-world') : null;

  /* per-world ambient tint */
  if (cur) {
    for (var i = 0; i < WORLDS.length; i++) {
      if (WORLDS[i].slug === cur) { document.body.style.setProperty('--accent-soft', WORLDS[i].soft); break; }
    }
  }

  /* ── build prev/next + full grid into an (empty) .w-nav ── */
  (function () {
    var nav = document.querySelector('.w-nav');
    if (!nav || nav.children.length) return;
    var idx = -1;
    for (var i = 0; i < WORLDS.length; i++) if (WORLDS[i].slug === cur) idx = i;
    var html = '';
    if (idx !== -1) {
      var prev = WORLDS[(idx - 1 + WORLDS.length) % WORLDS.length];
      var next = WORLDS[(idx + 1) % WORLDS.length];
      html += '<div class="w-nav-pn">';
      html += '<a class="prev" href="/' + prev.slug + '">← ' + prev.n + '<span class="big">' + prev.en + '</span></a>';
      html += '<a class="next" href="/' + next.slug + '">' + next.n + ' →<span class="big">' + next.en + '</span></a>';
      html += '</div>';
    }
    html += '<div class="w-allgrid">';
    WORLDS.forEach(function (w) {
      html += '<a class="' + (w.slug === cur ? 'cur' : '') + '" href="/' + w.slug + '">' +
        '<div class="gi-num">' + w.n + '</div>' +
        '<div class="gi-en">' + w.en + '</div>' +
        '<div class="gi-cn">' + w.cn + '</div></a>';
    });
    html += '</div>';
    nav.innerHTML = html;
  })();

  /* ── language toggle (双语 / 中 / EN), shared key with the manifesto ── */
  (function () {
    var KEY = 'mft-lang';
    var valid = { both: 1, zh: 1, en: 1 };
    var btns = document.querySelectorAll('.lang-switch button');
    function apply(lang) {
      if (!valid[lang]) lang = 'both';
      if (lang === 'both') root.removeAttribute('data-lang');
      else root.setAttribute('data-lang', lang);
      btns.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-setlang') === lang); });
      try { localStorage.setItem(KEY, lang); } catch (e) {}
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-setlang')); }); });
    var saved = 'both';
    try { saved = localStorage.getItem(KEY) || 'both'; } catch (e) {}
    apply(saved);
  })();

  /* ── scroll reveal (degrades gracefully; respects reduced-motion) ── */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.classList.add('js-anim');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    function rv(el, d) { el.setAttribute('data-rv', ''); if (d) el.style.setProperty('--rv', d + 'ms'); io.observe(el); }
    document.querySelectorAll('.w-section').forEach(function (sec) {
      [].slice.call(sec.children).forEach(function (k, i) { rv(k, Math.min(i, 8) * 70); });
    });
  })();

  /* ── reading-progress bar + back-to-top ── */
  (function () {
    var bar = document.createElement('div'); bar.className = 'w-progress'; document.body.appendChild(bar);
    var top = document.createElement('button'); top.className = 'w-top';
    top.setAttribute('aria-label', 'Back to top'); top.innerHTML = '↑';
    document.body.appendChild(top);
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    function on() {
      var h = document.documentElement.scrollHeight - window.innerHeight, y = window.pageYOffset;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      top.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on, { passive: true });
    on();
  })();

  /* ── in-page section rail (built from the page's own .w-section blocks) ── */
  (function () {
    var secs = [].slice.call(document.querySelectorAll('main.w-wrap .w-section'));
    if (secs.length < 2) return;
    var rail = document.createElement('nav'); rail.className = 'w-secrail';
    rail.setAttribute('aria-label', 'On this page');
    var map = [];
    secs.forEach(function (sec, i) {
      if (!sec.id) sec.id = 'wsec-' + (i + 1);
      var label = '';
      var eb = sec.querySelector('.w-eyebrow');
      if (eb) { var parts = eb.textContent.trim().split('·'); label = (parts[parts.length - 1] || '').trim(); }
      if (!label) { var h = sec.querySelector('.w-h2, .w-h3'); label = h ? h.textContent.trim().slice(0, 30) : ('Section ' + (i + 1)); }
      var a = document.createElement('a'); a.href = '#' + sec.id;
      a.setAttribute('aria-label', label);
      var sp = document.createElement('span'); sp.className = 'lbl'; sp.textContent = label;
      a.appendChild(sp); rail.appendChild(a); map.push({ sec: sec, a: a });
    });
    document.body.appendChild(rail);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var m = null; for (var i = 0; i < map.length; i++) if (map[i].sec === e.target) m = map[i];
          if (!m) return;
          map.forEach(function (x) { x.a.classList.remove('active'); });
          m.a.classList.add('active');
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      map.forEach(function (m) { io.observe(m.sec); });
    }
  })();
})();
