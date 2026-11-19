(() => {
  const body = document.body;
  const menu = document.getElementById('mobileMenu');
  menu?.addEventListener('click', () => { const open = body.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); menu.innerHTML = open ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' : '<i class="fa-solid fa-bars" aria-hidden="true"></i>'; });
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => { body.classList.remove('menu-open'); menu?.setAttribute('aria-expanded','false'); }));

  const input = document.getElementById('toolSearch');
  const results = document.getElementById('searchResults');
  let tools = [];
  fetch('tools.json').then(r => r.ok ? r.json() : []).then(data => {
    tools = data;
  }).catch(() => {
    const grid = document.getElementById('allToolsGrid');
    if (grid) grid.innerHTML = '<p class="directory-loading">Tools could not load. Refresh the page and try again.</p>';
  });
  const renderResults = q => {
    const term = q.trim().toLowerCase();
    if (!term) { results.hidden = true; results.innerHTML = ''; return; }
    const matches = tools.filter(t => `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(term)).slice(0,6);
    results.innerHTML = matches.length ? matches.map(t => `<a href="${t.url}"><span>${t.name}</span><small>${t.category} ↗</small></a>`).join('') : `<a href="tools.html?q=${encodeURIComponent(term)}"><span>See all tools matching your search</span><small>Open directory ↗</small></a>`;
    results.hidden = false;
  };
  input.addEventListener('input', () => renderResults(input.value));
  document.getElementById('toolSearchForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!tools.length) { location.href='tools.html'; return; }
    const q = input.value.trim().toLowerCase();
    const found = tools.find(t => t.name.toLowerCase().includes(q) || t.id.replaceAll('-', ' ').includes(q));
    if (found) location.href = found.url; else location.href = `tools.html?q=${encodeURIComponent(input.value.trim())}`;
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search-area')) results.hidden = true; });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); } if (e.key === 'Escape') { results.hidden = true; input.blur(); } });

})();
