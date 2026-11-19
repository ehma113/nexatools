(() => {
 const grid=document.getElementById('allToolsGrid');
 const search=document.getElementById('directorySearch');
 const count=document.getElementById('toolCount');
 const summary=document.getElementById('resultSummary');
 const empty=document.getElementById('directoryEmpty');
 const sort=document.getElementById('sortTools');
 const categories=[...document.querySelectorAll('[data-category]')];
 const icons={
  'Writing & Text Tools':'fa-pen-to-square','Everyday Tools':'fa-calculator','Student Utility Hub':'fa-graduation-cap',
  'Image Utility Hub':'fa-image','File Utility Hub':'fa-file-pdf','Weather Information':'fa-cloud-sun','Finance Tools':'fa-wallet'
 };
 let tools=[],category='All';
 search.value=new URLSearchParams(location.search).get('q')||'';
 const render=()=>{
  const term=(search.value||'').trim().toLowerCase();
  let found=tools.filter(t=>(category==='All'||t.category===category)&&
   `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(term));
  if(sort.value==='az')found.sort((a,b)=>a.name.localeCompare(b.name));
  grid.innerHTML=found.map(t=>`<a class="directory-card" href="${t.url}">
   <span class="directory-icon" aria-hidden="true"><i class="fa-solid ${icons[t.category]||'fa-wand-magic-sparkles'}"></i></span>
   <span><h3>${t.name}</h3><p>${t.description}</p><small>${t.category}</small></span>
  </a>`).join('');
  count.textContent=found.length;
  summary.textContent=found.length===tools.length?`Showing all ${tools.length} tools`:`Showing ${found.length} of ${tools.length} tools`;
  empty.hidden=found.length!==0;
  grid.hidden=found.length===0;
 };
 fetch('tools.json').then(r=>{if(!r.ok)throw Error('Could not load tools');return r.json()}).then(data=>{tools=data;render()}).catch(()=>{grid.innerHTML='<p class="directory-loading">The tool library could not load. Refresh the page and try again.</p>'});
 search.addEventListener('input',render);sort.addEventListener('change',render);
 categories.forEach(btn=>btn.addEventListener('click',()=>{categories.forEach(b=>b.classList.remove('active'));btn.classList.add('active');category=btn.dataset.category;render()}));
 document.getElementById('clearFilters').addEventListener('click',()=>{search.value='';sort.value='popular';category='All';categories.forEach(b=>b.classList.toggle('active',b.dataset.category==='All'));render()});
 document.getElementById('resetEmpty').addEventListener('click',()=>document.getElementById('clearFilters').click());
 document.querySelectorAll('[data-quick]').forEach(btn=>btn.addEventListener('click',()=>{search.value=btn.dataset.quick;render();search.focus()}));
 const menu=document.getElementById('mobileMenu');
 menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');menu.innerHTML=open?'<i class="fa-solid fa-xmark" aria-hidden="true"></i>':'<i class="fa-solid fa-bars" aria-hidden="true"></i>';});
 document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}));
})();
