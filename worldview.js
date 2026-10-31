/* Independent, keyboard-accessible readers for homepage comparison columns. */
(() => {
 document.querySelectorAll('.worldview-mobile, [data-plane-reader]').forEach(view => {
 const tabs = [...view.querySelectorAll('[role="tab"]')];
 const panels = [...view.querySelectorAll('[role="tabpanel"]')];
 function select(index, focus = false) {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
  if (focus) tabs[index].focus();
 }
 tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(index));
  tab.addEventListener('keydown', event => {
   if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
   event.preventDefault();
   const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
   select(next, true);
  });
 });
 select(0);
 view.classList.add('planes-ready');
 });
})();
