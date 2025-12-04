// script.js — final: filtro multi-select, results condicional, modals, prefs (reader+region), switches usáveis

const onReady = (fn) => {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
};

onReady(() => {
  // helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from((r || document).querySelectorAll(s));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // top elements
  const menuBtn = $('#menuBtn');
  const sidebar = $('#sidebar');
  const closeSidebar = $('#closeSidebar');
  const backdrop = $('#backdrop');

  function openMenu(){ sidebar?.classList.add('open'); backdrop?.classList.add('show'); sidebar?.setAttribute('aria-hidden','false'); menuBtn?.setAttribute('aria-expanded','true'); }
  function closeMenu(){ sidebar?.classList.remove('open'); backdrop?.classList.remove('show'); sidebar?.setAttribute('aria-hidden','true'); menuBtn?.setAttribute('aria-expanded','false'); }

  menuBtn?.addEventListener('click', openMenu);
  closeSidebar?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', ()=>{
    closeMenu();
    document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));
    backdrop.classList.remove('show');
  });

  // modal helpers
  function openModal(id){
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('show');
    m.setAttribute('aria-hidden','false');
    backdrop.classList.add('show');
  }
  function closeModal(m){
    if (!m) return;
    m.classList.remove('show');
    m.setAttribute('aria-hidden','true');
    backdrop.classList.remove('show');
  }

  // generic close buttons
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-close], .close');
    if (btn){
      const modal = btn.closest('.modal');
      if (modal) closeModal(modal);
    }
  });

  // sidebar buttons open modals
  sidebar?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-modal]');
    if (!btn) return;
    const id = btn.getAttribute('data-modal');
    if (!id) return;
    openModal(id);
    closeMenu();
  });

  // header open shortcuts
  $('#openConfig')?.addEventListener('click', ()=> openModal('configModal'));
  $('#openLogin')?.addEventListener('click', ()=> openModal('loginModal'));

  // search & filter
  const searchInput = $('#searchInput');
  const filterBar = $('#filterBar');
  const clearBtn = $('#clearFilter');
  const resultsCountEl = $('#resultsCount');

  const buttons = filterBar ? Array.from(filterBar.querySelectorAll('.filter-btn')) : [];
  const newsGridCards = Array.from($$('.news-card'));
  const heroCards = Array.from($$('.card-hero'));
  const allCards = newsGridCards.concat(heroCards);

  // hide count initially
  if (resultsCountEl) resultsCountEl.style.display = 'none';

  // badges
  (function setBadges(){
    const counts = {};
    allCards.forEach(card=>{
      const cat = (card.dataset.category || card.querySelector('.tag')?.textContent || '').trim();
      if (!cat) return;
      counts[cat] = (counts[cat]||0) + 1;
    });
    buttons.forEach(btn=>{
      const cat = btn.dataset.category || btn.textContent.trim();
      const badge = btn.querySelector('.badge');
      const c = counts[cat] || 0;
      if (badge){ badge.textContent = c; if (c===0) badge.classList.add('hidden'); else badge.classList.remove('hidden'); }
    });
    const todas = buttons.find(b => (b.dataset.category||b.textContent||'').toLowerCase().includes('todas'));
    if (todas){ const b = todas.querySelector('.badge'); if (b){ b.textContent = allCards.length; if (allCards.length===0) b.classList.add('hidden'); else b.classList.remove('hidden'); } }
  })();

  const selected = new Set();

  function hasActiveFilters(){
    if (selected.size > 0) return true;
    return buttons.some(b => { 
      const c = (b.dataset.category||b.textContent||'').toLowerCase(); 
      if (c.includes('todas')) return false; 
      return b.classList.contains('active'); 
    });
  }

  function updateResultsVisibility(){
    const hasQuery = !!(searchInput && searchInput.value && searchInput.value.trim() !== '');
    const hasFilter = hasActiveFilters();
    if (!resultsCountEl) return;
    if (hasQuery || hasFilter) resultsCountEl.style.display = 'inline-block';
    else resultsCountEl.style.display = 'none';
  }

  function applyFilters(){
    const q = norm(searchInput?.value || '');
    const hasSelected = selected.size > 0;
    let visibleCount = 0;
    allCards.forEach(card=>{
      const textOk = (q === '') || norm(card.textContent + ' ' + (card.dataset.category||'')).includes(q);
      const cardCat = (card.dataset.category || card.querySelector('.tag')?.textContent || '').trim();
      const catNorm = norm(cardCat);
      let catMatch = true;
      if (hasSelected){
        catMatch = Array.from(selected).some(s => {
          return norm(s) === 'todas' || catNorm === norm(s) || catNorm.includes(norm(s));
        });
      }
      const show = textOk && catMatch;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
    if (resultsCountEl) resultsCountEl.textContent = `${visibleCount} resultado(s)`;
    updateResultsVisibility();
  }

  // filter click
  filterBar?.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('.filter-btn');
    if (!btn) return;
    const cat = btn.dataset.category || btn.textContent.trim();
    if (cat && cat.toLowerCase().includes('todas')){
      selected.clear();
      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    } else {
      // remove todas active
      buttons.forEach(b => { 
        if ((b.dataset.category||b.textContent||'').toLowerCase().includes('todas')) 
          b.classList.remove('active'); 
      });

      if (selected.has(cat)){
        selected.delete(cat);
        btn.classList.remove('active');
      } else {
        selected.add(cat);
        btn.classList.add('active');
      }

      if (selected.size === 0){
        const todas = buttons.find(b => (b.dataset.category||b.textContent||'').toLowerCase().includes('todas'));
        if (todas) todas.classList.add('active');
      } else {
        const todas = buttons.find(b => (b.dataset.category||b.textContent||'').toLowerCase().includes('todas'));
        if (todas) todas.classList.remove('active');
      }
    }
    applyFilters();
  });

  // clear filter
  clearBtn?.addEventListener('click', ()=>{
    selected.clear();
    buttons.forEach(b=>b.classList.remove('active'));
    const todas = buttons.find(b => (b.dataset.category||b.textContent||'').toLowerCase().includes('todas'));
    if (todas) todas.classList.add('active');
    allCards.forEach(c=>c.style.display='');
    if (resultsCountEl) { resultsCountEl.textContent = `${allCards.length} resultado(s)`; resultsCountEl.style.display = 'none'; }
  });

  // search
  searchInput?.addEventListener('input', ()=> applyFilters());

  // initial
  applyFilters();

  // expose helper
  window.applyCategoryFilter = (name) => {
    const btn = buttons.find(b => ((b.dataset.category||b.textContent)||'').toLowerCase().replace(/\s+/g,'') === String(name).toLowerCase().replace(/\s+/g,''));
    if (btn) btn.click();
    else { selected.add(name); applyFilters(); }
  };

  // ESC closes
  window.addEventListener('keydown', (e)=> {
    if (e.key === 'Escape'){
      closeMenu();
      document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));
      backdrop.classList.remove('show');
    }
  });

  // prefs (save/load/apply)
  (function prefs(){
    const KEY = 'gamenews:prefs_v3';
    const themeSelect = $('#themeSelect');
    const fontSize = $('#fontSize');
    const fontSizeValue = $('#fontSizeValue');
    const layoutMode = $('#layoutMode');
    const notifications = $('#notifications');
    const autoplayMedia = $('#autoplayMedia');
    const readingMode = $('#readingMode');
    const regionSelect = $('#regionSelect');
    const saveBtn = $('#savePrefs');

    function load(){ try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch(e){ return null; } }
    function save(obj){ try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch(e){} }

    function apply(p = {}){
      const theme = p.theme || 'dark';
      document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
      const fs = p.fontSize || 16;
      document.documentElement.style.setProperty('--font-size', fs+'px');
      if (fontSize) { fontSize.value = fs; if (fontSizeValue) fontSizeValue.textContent = fs + 'px'; }
      if (themeSelect) themeSelect.value = p.theme || 'dark';
      if (layoutMode) layoutMode.value = p.layout || 'grid';
      if (notifications) notifications.checked = !!p.notifications;
      if (autoplayMedia) autoplayMedia.checked = !!p.autoplay;
      if (readingMode) readingMode.checked = (p.readingMode !== undefined) ? !!p.readingMode : true;
      if (regionSelect) regionSelect.value = p.region || 'global';
      applyLayout(p.layout || 'grid');
    }

    function applyLayout(mode){
      const grid = $('#newsGrid');
      if (!grid) return;
      if (mode === 'list'){
        grid.style.display = 'block';
        grid.querySelectorAll('.news-card').forEach(card=>{
          card.style.display = 'flex';
          card.style.gap = '12px';
          card.style.alignItems = 'center';
          const img = card.querySelector('img'); 
          if (img){ img.style.width='160px'; img.style.height='auto'; }
        });
      } else {
        grid.style.display = '';
        grid.querySelectorAll('.news-card').forEach(card=>{
          card.style.display = '';
          const img = card.querySelector('img'); 
          if (img){ img.style.width=''; img.style.height=''; }
        });
      }
    }

    // save action
    saveBtn?.addEventListener('click', ()=>{
      const prefs = {
        theme: themeSelect ? themeSelect.value : 'dark',
        fontSize: fontSize ? parseInt(fontSize.value,10) : 16,
        layout: layoutMode ? layoutMode.value : 'grid',
        notifications: notifications ? !!notifications.checked : false,
        autoplay: autoplayMedia ? !!autoplayMedia.checked : false,
        readingMode: readingMode ? !!readingMode.checked : true,
        region: regionSelect ? regionSelect.value : 'global'
      };
      apply(prefs);
      save(prefs);
      const modal = $('#configModal'); if (modal) closeModal(modal);
    });

    // live updates
    fontSize?.addEventListener('input', (e)=> {
      const v = parseInt(e.target.value,10) || 16;
      document.documentElement.style.setProperty('--font-size', v+'px');
      if (fontSizeValue) fontSizeValue.textContent = v+'px';
    });
    themeSelect?.addEventListener('change', (e)=> 
      document.documentElement.setAttribute('data-theme', e.target.value === 'light' ? 'light' : 'dark')
    );
    layoutMode?.addEventListener('change', (e)=> applyLayout(e.target.value));

    // init
    const saved = load();
    if (saved) apply(saved);
    else apply({theme:'dark', fontSize:16, layout:'grid', notifications:false, autoplay:false, readingMode:true, region:'global'});
  })();

  // make .row.switch-row clickable
  (function enhanceSwitchRows(){
    Array.from(document.querySelectorAll('.row.switch-row')).forEach(row => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      row.addEventListener('click', (e) => {
        const interactive = e.target.closest('input,button,a,select,textarea,label');
        if (interactive && interactive !== row && interactive !== checkbox) return;
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles:true }));
      });
    });
  })();

  // login demo
  const loginForm = $('#loginForm');
  if (loginForm){
    loginForm.addEventListener('submit', (e)=> {
      e.preventDefault();
      alert('Login de demonstração. Integração real pendente.');
      const mdl = $('#loginModal'); if (mdl) closeModal(mdl);
    });
  }

  // ===== Reader modal: open on click of any .news-card or .card-hero anchor =====
  (function readerModule(){
    const readerModal = $('#readerModal');
    const readerTitle = $('#readerTitle');
    const readerBody = $('#readerBody');
    const readingToggle = $('#readingMode');

    function openReaderFromElement(el){
      // extract title, image, content
      const titleEl = el.querySelector('h2, h3');
      const pEl = el.querySelector('p') || el.querySelector('.muted') || null;
      const imgEl = el.querySelector('img');

      const title = titleEl ? titleEl.textContent : 'Notícia';
      readerTitle.textContent = title;

      // body
      readerBody.innerHTML = '';
      if (imgEl && imgEl.src) {
        const im = document.createElement('img'); 
        im.src = imgEl.src; 
        im.alt = imgEl.alt || '';
        readerBody.appendChild(im);
      }
      if (pEl) {
        const p = document.createElement('p'); 
        p.textContent = pEl.textContent; 
        readerBody.appendChild(p);
      }

      const more = document.createElement('p'); 
      more.className = 'muted'; 
      more.textContent = 'Conteúdo demonstrativo — versão simplificada de leitura.';
      readerBody.appendChild(more);

      const readingEnabled = readingToggle ? !!readingToggle.checked : true;
      if (readingEnabled) openModal('readerModal');
      else openModal('readerModal'); 
    }

    document.body.addEventListener('click', (e)=>{
      const a = e.target.closest('a.news-card, a.card-hero');
      if (!a) return;
      e.preventDefault();
      openReaderFromElement(a);
    });

  })();

}); // END onReady



// ======================================================================
// === CARROSSEL DE DESTAQUES — versão correta para o seu HTML atual ===
// ======================================================================

let currentSlide = 0;
const track = document.getElementById("carouselTrack");
const slides = document.querySelectorAll(".carousel-item");

function updateCarousel() {
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

document.getElementById("carouselNext").addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarousel();
});

document.getElementById("carouselPrev").addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateCarousel();
});

// Auto-play (5s)
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarousel();
}, 5000);
