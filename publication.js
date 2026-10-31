/* Shared publication shell for the existing chapter articles and project atlas. */
(() => {
  function boot() {
    const root = document.documentElement;
    const body = document.body;
    const registry = window.PSY_WORLDS || [
      ['mission','使命','Mission'],['identity','身份','Identity'],['principles','原则','Principles'],['integrations','融合','Merge'],
      ['archetypes','五行','Elements'],['domains','领域','Domains'],['deep-series','深度','Path'],['hubs','枢纽','Hubs'],
      ['matrix','矩阵','Matrix'],['breakthroughs','突破','Tech'],['agi','AGI','AGI'],['purposes','宗旨','Purpose'],
      ['navigation','导航','Nav'],['cultures','文化','Culture'],['beliefs','信仰','Beliefs'],['visions','愿景','Visions']
    ].map(([slug,cn,en], i) => ({slug,cn,en,n:String(i+1).padStart(2,'0')}));
    const current = body.dataset.world || 'atlas';
    const header = document.querySelector('header');
    const existingLanguage = header.querySelector('.lang-switch');
    header.className = 'publication-bar';
    header.innerHTML = '<a class="pub-brand" href="/" aria-label="繁星会首页 / Psyverse home"><svg class="psy-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 16v11c0 11.046 8.954 20 20 20s20-8.954 20-20V16M32 23v35" fill="none" stroke="currentColor" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="10" r="3.8" fill="currentColor" stroke="none"/></svg><span class="org-wordmark"><strong class="cn">繁星会</strong><span class="en">PSYVERSE</span></span></a><a class="pub-book" href="/"><span class="cn">源代码</span><em class="en">Source Code</em></a><div class="pub-language"></div><div class="pub-rail"><button type="button" class="pub-shift" data-direction="-1" aria-label="查看前面的章节 / Earlier chapters">‹</button><nav class="pub-chapters" aria-label="十六章目录 / Chapter index"></nav><button type="button" class="pub-shift" data-direction="1" aria-label="查看后面的章节 / Later chapters">›</button></div>';
    const language = existingLanguage || document.createElement('div');
    if (!existingLanguage) {
      language.className = 'lang-switch';
      language.setAttribute('role','group');
      language.setAttribute('aria-label','语言 / Language');
      language.innerHTML = '<button type="button" data-setlang="both">双语</button><button type="button" data-setlang="zh">中</button><button type="button" data-setlang="en">EN</button>';
      function apply(lang) {
        if (lang === 'both') root.removeAttribute('data-lang'); else root.dataset.lang = lang;
        root.lang = lang === 'en' ? 'en' : 'zh-CN';
        language.querySelectorAll('button').forEach(button => {
          const active = button.dataset.setlang === lang;
          button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
        });
        try { localStorage.setItem('mft-lang',lang); } catch {}
        root.dispatchEvent(new CustomEvent('langchange',{detail:{language:lang}}));
      }
      language.addEventListener('click', event => { const button=event.target.closest('[data-setlang]');if(button)apply(button.dataset.setlang); });
      let lang='both';try{lang=localStorage.getItem('mft-lang')||'both';}catch{}
      apply(['both','zh','en'].includes(lang)?lang:'both');
    }
    header.querySelector('.pub-language').append(language);
    const nav = header.querySelector('.pub-chapters');
    registry.forEach(world => {
      const a = document.createElement('a');a.href='/'+world.slug;
      a.innerHTML='<span class="pub-n">'+world.n+'</span><span class="cn">'+world.cn+'</span><span class="en">'+world.en+'</span>';
      if(world.slug===current)a.setAttribute('aria-current','page');
      nav.append(a);
    });
    const atlas = document.createElement('a');atlas.href='/atlas';atlas.innerHTML='<span class="cn">图谱</span><span class="en">Atlas</span>';
    if(current==='atlas')atlas.setAttribute('aria-current','page');nav.append(atlas);
    const rail=header.querySelector('.pub-rail');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const behavior=()=>reduced.matches?'instant':'smooth';
    function navBounds(){
      rail.classList.toggle('overflows',nav.scrollWidth>nav.clientWidth+4);
      const buttons=rail.querySelectorAll('button');buttons[0].disabled=nav.scrollLeft<3;buttons[1].disabled=nav.scrollLeft+nav.clientWidth>=nav.scrollWidth-3;
    }
    rail.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>nav.scrollBy({left:nav.clientWidth*.7*Number(button.dataset.direction),behavior:behavior()})));
    nav.addEventListener('scroll',navBounds,{passive:true});
    const main=document.querySelector('main');main.id=main.id||'pub-main';main.tabIndex=-1;
    const skip=document.createElement('a');skip.className='pub-skip';skip.href='#'+main.id;skip.innerHTML='<span class="cn">跳至正文</span><span class="en">Skip to content</span>';body.prepend(skip);
    const hero=document.querySelector('.w-hero');
    if(hero&&main.classList.contains('w-wrap')){
      main.prepend(hero);
      const layout=document.createElement('div');layout.className='pub-layout';main.before(layout);layout.append(main);
      const sections=[...main.querySelectorAll('.w-section')];
      if(sections.length>1&&current!=='worlds'){
        const outline=document.createElement('aside');outline.className='pub-outline';outline.setAttribute('aria-label','本章导航 / In this chapter');
        const details=document.createElement('details');const summary=document.createElement('summary');summary.innerHTML='<span class="cn">本章目录</span><span class="en">On this page</span><span class="pub-disclosure" aria-hidden="true">+</span>';details.append(summary);
        const list=document.createElement('nav');list.setAttribute('aria-label','本章目录 / On this page');details.append(list);outline.append(details);
        const items=sections.map((section,index)=>{
          if(!section.id)section.id='wsec-'+(index+1);
          const heading=section.querySelector('.w-h2,.w-h3')||section.querySelector('.w-eyebrow')||section.querySelector('.w-quote-attr');
          let zh=heading?.querySelector('.cn')?.textContent.trim();
          if(!zh&&heading?.classList.contains('w-quote-attr'))zh=heading.textContent.split('·').at(-1).trim();
          const clone=heading?.cloneNode(true);clone?.querySelectorAll('.cn').forEach(n=>n.remove());
          let en=(clone?.textContent||'Section '+(index+1)).replace(/^§\s*[\d.]+\s*·\s*/,'').trim();
          if(heading?.classList.contains('w-quote-attr'))en=en.split('·')[0].trim();
          if(!zh&&en==='From Mission to Worlds')zh='从使命到世界';
          const link=document.createElement('a');link.href='#'+section.id;
          const cn=document.createElement('span');cn.className='cn';cn.textContent=zh||en;
          const english=document.createElement('span');english.className='en';english.textContent=en;
          link.append(cn,english);list.append(link);return {section,link};
        });
        const index=registry.findIndex(w=>w.slug===current);
        if(index>=0){const pn=document.createElement('div');pn.className='pub-outline-pn';
          const prev=document.createElement('a');prev.href=index?'/'+registry[index-1].slug:'/';prev.innerHTML='<span aria-hidden="true">←</span><span class="cn">'+(index?'上一章':'返回封面')+'</span><span class="en">'+(index?'Previous':'Cover')+'</span>';
          const next=document.createElement('a');next.href=index<15?'/'+registry[index+1].slug:'/worlds';next.innerHTML='<span class="cn">'+(index<15?'下一章':'全部章节')+'</span><span class="en">'+(index<15?'Next':'All chapters')+'</span><span aria-hidden="true">→</span>';pn.append(prev,next);outline.append(pn);}
        layout.prepend(outline);
        const desktop=matchMedia('(min-width:1120px)');details.open=current!=='mission'&&desktop.matches;desktop.addEventListener('change',()=>{details.open=current!=='mission'&&desktop.matches;});
        let positions=[],queued=false;
        function updateOutline(){const line=scrollY+header.offsetHeight+100;let active=0;positions.forEach((top,i)=>{if(top<=line)active=i;});items.forEach(({link},i)=>{if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});queued=false;}
        function measureOutline(){positions=items.map(({section})=>section.getBoundingClientRect().top+scrollY);updateOutline();}
        addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateOutline);}},{passive:true});
        addEventListener('resize',measureOutline,{passive:true});
        root.addEventListener('langchange',()=>requestAnimationFrame(measureOutline));
        if('ResizeObserver'in window)new ResizeObserver(measureOutline).observe(main);
        document.fonts?.ready.then(measureOutline);measureOutline();
      }
    }
    if(current==='mission'&&hero){
      const layout=main.closest('.pub-layout');
      layout.before(hero);
      hero.classList.add('pub-cover');
      const read=document.createElement('a');read.className='pub-cover-read';read.href='#'+main.querySelector('.w-section').id;
      read.innerHTML='<span class="cn">开始阅读</span><span class="en">Start reading</span><span aria-hidden="true">↓</span>';
      hero.append(read);
      const outline=layout.querySelector('.pub-outline');
      if(outline)main.querySelector('.w-section').after(outline);
    }
    const tables=[...main.querySelectorAll('table')].map(table=>{
      const region=document.createElement('div');region.className='pub-data-region';region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label',table.getAttribute('aria-label')||'数据表格 / Data table');
      table.before(region);region.append(table);
      const controls=document.createElement('div');controls.className='pub-table-controls';controls.innerHTML='<button type="button" aria-label="向左浏览表格 / Scroll table left">←</button><span class="cn">横向浏览完整表格</span><span class="en">Explore the full table</span><button type="button" aria-label="向右浏览表格 / Scroll table right">→</button>';region.before(controls);
      controls.querySelectorAll('button').forEach((button,index)=>button.addEventListener('click',()=>region.scrollBy({left:region.clientWidth*.7*(index?1:-1),behavior:behavior()})));
      return {region,controls};
    });
    function measureTables(){tables.forEach(({region,controls})=>{controls.hidden=region.scrollWidth<=region.clientWidth+4;});}
    // Direct English text in paired, noninteractive titles gets an explicit language span.
    document.querySelectorAll('.w-card .ttl,.w-h3,.ix-title,.compound-steps .cs-head').forEach(title=>{
      [...title.childNodes].forEach(node=>{
        if(node.nodeType===Node.TEXT_NODE&&/[A-Za-z]/.test(node.textContent)&&!/[㐀-鿿]/.test(node.textContent)){
          const span=document.createElement('span');span.className='en';node.replaceWith(span);span.append(node);
        }
      });
    });
    // Existing local tab panels already switch on click. Add their complete keyboard path.
    function syncTabs(){document.querySelectorAll('[role="tablist"]').forEach(group=>{group.querySelectorAll('[role="tab"]').forEach(tab=>{tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1;});});}
    document.addEventListener('keydown',event=>{
      if(event.defaultPrevented){requestAnimationFrame(()=>{syncTabs();measureTables();});return;}
      const tab=event.target.closest('[role="tab"]');const group=tab?.closest('[role="tablist"]');if(!group)return;
      const vertical=group.getAttribute('aria-orientation')==='vertical';
      const keys=vertical?['ArrowUp','ArrowDown']:['ArrowLeft','ArrowRight'];
      if(![...keys,'Home','End'].includes(event.key))return;
      const tabs=[...group.querySelectorAll('[role="tab"]')].filter(t=>!t.disabled);const at=tabs.indexOf(tab);
      const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(at+(event.key===keys[1]?1:-1)+tabs.length)%tabs.length;
      event.preventDefault();tabs[index].click();syncTabs();tabs[index].focus();
    });
    document.addEventListener('click',event=>{if(event.target.closest('[role="tab"]'))requestAnimationFrame(()=>{syncTabs();measureTables();});});syncTabs();
    document.querySelectorAll('.sort button').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('active'))));
    function adaptLanguage(){
      const input=document.querySelector('#q');if(input)input.placeholder=root.dataset.lang==='en'?'Search by name or subdomain…':'搜索名称或子域名…';
      navBounds();measureTables();
    }
    root.addEventListener('langchange',adaptLanguage);
    addEventListener('resize',()=>{navBounds();measureTables();},{passive:true});
    document.fonts?.ready.then(()=>{navBounds();measureTables();const active=nav.querySelector('[aria-current="page"]');if(active&&nav.scrollWidth>nav.clientWidth)nav.scrollLeft=active.offsetLeft-nav.offsetLeft-nav.clientWidth/2;});
    adaptLanguage();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
