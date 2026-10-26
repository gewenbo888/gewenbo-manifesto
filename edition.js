/* Source Code reading chrome: native links, local table scrolling, one scroll frame. */
(() => {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main > section[id]')];
  const nav = document.querySelector('.top-nav');
  const rail = document.querySelector('.chapter-rail');
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reduce.matches ? 'instant' : 'smooth';
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  const tools = document.createElement('nav');
  tools.className = 'reading-tools edition';
  tools.setAttribute('aria-label', '章节阅读导航 / Chapter navigation');
  tools.innerHTML = '<a class="reading-prev"><span aria-hidden="true">←</span><span class="cn">上一章</span><span class="en">Previous</span></a><span class="reading-current"></span><a class="reading-next"><span class="cn">下一章</span><span class="en">Next</span><span aria-hidden="true">→</span></a>';
  document.body.append(tools);
  const prev = tools.querySelector('.reading-prev');
  const next = tools.querySelector('.reading-next');
  const current = tools.querySelector('.reading-current');
  let active = -1, offsets = [], pending = false;
  const scrollers = [...document.querySelectorAll('.reading-scroll')].map(region => {
    const hint = document.createElement('div');
    hint.className = 'overflow-hint edition';
    hint.innerHTML = '<button type="button" aria-label="向左查看表格 / Scroll table left">←</button><span class="cn">横向滑动查看完整内容</span><span class="en">Scroll to explore the full table</span><button type="button" aria-label="向右查看表格 / Scroll table right">→</button>';
    region.before(hint);
    const buttons = hint.querySelectorAll('button');
    buttons.forEach((button, index) => button.addEventListener('click', () => {
      const cell = region.querySelector('td, .matrix9-cell, .m12-cell');
      const step = cell ? cell.getBoundingClientRect().width : region.clientWidth * .75;
      region.scrollBy({ left: step * (index ? 1 : -1), behavior: behavior() });
    }));
    return { region, hint };
  });
  function navBounds() {
    const overflow = nav.scrollWidth > nav.clientWidth + 4;
    rail.classList.toggle('has-overflow', overflow);
    const buttons = rail.querySelectorAll('.nav-shift');
    buttons[0].disabled = nav.scrollLeft < 3;
    buttons[1].disabled = nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 3;
  }
  rail.querySelectorAll('.nav-shift').forEach(button => {
    button.addEventListener('click', () => nav.scrollBy({ left: nav.clientWidth * .7 * Number(button.dataset.shift), behavior: behavior() }));
  });
  nav.addEventListener('scroll', navBounds, { passive: true });
  function selectChapter(index) {
    if (index === active) return;
    active = index;
    navLinks.forEach(link => {
      const selected = link.hash === `#${sections[index].id}`;
      if (selected) {
        link.setAttribute('aria-current', 'location');
        if (!nav.contains(document.activeElement)) {
          nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2, behavior: behavior() });
        }
      } else link.removeAttribute('aria-current');
    });
    current.textContent = `${String(index + 1).padStart(2, '0')} / 16`;
    prev.href = `#${sections[Math.max(0, index - 1)].id}`;
    next.href = index === sections.length - 1 ? '/visions' : `#${sections[index + 1].id}`;
    next.querySelector('.cn').textContent = index === sections.length - 1 ? '阅读全文' : '下一章';
    next.querySelector('.en').textContent = index === sections.length - 1 ? 'Read more' : 'Next';
    tools.classList.toggle('visible', index > 0);
    tools.inert = index === 0;
    tools.setAttribute('aria-hidden', String(index === 0));
  }
  function update() {
    const height = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${height > 0 ? Math.max(0, Math.min(1, scrollY / height)) : 0})`;
    const readingLine = scrollY + document.querySelector('.topbar').offsetHeight + 130;
    let index = 0;
    for (let i = 1; i < offsets.length; i++) {
      if (offsets[i] <= readingLine) index = i;
      else break;
    }
    selectChapter(index);
    pending = false;
  }
  function measure() {
    offsets = sections.map(section => section.getBoundingClientRect().top + scrollY);
    scrollers.forEach(({region,hint}) => { hint.hidden = region.scrollWidth <= region.clientWidth + 4; });
    navBounds();
    update();
  }
  addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive:true });
  addEventListener('resize', measure, { passive:true });
  new MutationObserver(measure).observe(root, { attributes:true, attributeFilter:['data-lang'] });
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
})();
