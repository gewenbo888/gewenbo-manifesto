/* Lightweight reading navigation: one passive scroll handler, no canvas loops. */
(() => {
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  const tools = document.createElement('nav');
  tools.className = 'reading-tools edition';
  tools.setAttribute('aria-label', '阅读导航 / Reading navigation');
  tools.innerHTML = '<a href="#one"><span class="cn">返回顶部</span><span class="en">Top</span> ↑</a><span class="reading-current"></span><a href="#one"><span class="cn">返回封面</span><span class="en">Cover</span> ↑</a>';
  document.body.append(tools);
  const current = tools.querySelector('.reading-current');
  const hero = document.querySelector('.hero');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const setVisible = visible => {
    tools.classList.toggle('visible', visible);
    tools.inert = !visible;
    tools.setAttribute('aria-hidden', String(!visible));
  };
  setVisible(false);
  let pending = false;
  function update() {
    const height = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${height > 0 ? Math.min(100, scrollY / height * 100) : 0}%`;
    setVisible(hero.getBoundingClientRect().bottom < 0);
    pending = false;
  }
  addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const index = sections.indexOf(entry.target);
        current.textContent = `${String(index + 1).padStart(2, '0')} / 16`;
        document.querySelectorAll('.top-nav a').forEach(link => {
          if (link.hash === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'location');
            const nav = link.parentElement;
            nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
          }
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-10% 0px -75% 0px' });
    sections.forEach(section => observer.observe(section));
  }
  update();
})();
