import { createTriangleField } from './triangle-field.js';

// Reuse the original simulation without bringing the reference site's React shell.
function mount() {
  const hero = document.querySelector('.hero.edition, .w-hero');
  if (!hero) return;
  const host = document.createElement('div');
  host.className = 'hero-motion';
  host.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  host.append(canvas);
  hero.prepend(host);
  const artwork = createTriangleField(canvas, host, hero);
  if (!artwork) { host.remove(); return; }
  hero.classList.add('has-motion');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'hero-motion-toggle';
  hero.append(toggle);
  let paused = false;
  let visible = false, frame = 0, lastTime = 0, disposed = false;
  const animate = time => {
    const dt = lastTime ? Math.min((time-lastTime)/(1000/60), 2) : 1;
    lastTime = time;
    artwork.draw(dt, true);
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    if (disposed) return;
    cancelAnimationFrame(frame);
    lastTime = 0;
    const running = visible && !document.hidden && !media.matches && !paused;
    toggle.hidden = media.matches;
    const zh = paused ? '播放动效' : '暂停动效';
    const en = paused ? 'Play animation' : 'Pause animation';
    toggle.innerHTML = '<span class="cn">'+zh+'</span><span class="en">'+en+'</span>';
    host.dataset.running = String(running);
    if (running) frame = requestAnimationFrame(animate);
    else {
      artwork.clearPointer();
      if (visible && !document.hidden) artwork.draw(0, false);
    }
  };
  const resize = () => { artwork.resize(); sync(); };
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > .1;
    sync();
  }, {threshold:[0,.1], rootMargin:`-${document.querySelector('header').offsetHeight}px 0px 0px`});
  const size = new ResizeObserver(resize);
  intersection.observe(host);
  size.observe(host);
  size.observe(hero.querySelector('.hero-copy, h1'));
  const move = event => {
    if (media.matches || !visible) return;
    const bounds = host.getBoundingClientRect();
    artwork.movePointer(event.clientX-bounds.left, event.clientY-bounds.top);
  };
  const leave = () => artwork.clearPointer();
  const release = event => { if (event.pointerType !== 'mouse') leave(); };
  hero.addEventListener('pointermove', move, {passive:true});
  hero.addEventListener('pointerdown', move, {passive:true});
  hero.addEventListener('pointerleave', leave);
  hero.addEventListener('pointerup', release);
  hero.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);
  document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', sync);
  document.fonts.ready.then(resize);
  document.documentElement.addEventListener('langchange', resize);
  const language = new MutationObserver(resize);
  language.observe(document.documentElement, {attributes:true, attributeFilter:['data-lang']});
  window.addEventListener('pagehide', event => {
    cancelAnimationFrame(frame);
    if (!event.persisted) {
      disposed = true;
      intersection.disconnect(); size.disconnect(); language.disconnect();
    }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) resize();
  });
  resize();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
else mount();
