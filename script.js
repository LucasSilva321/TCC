// =================== script.js (corrigido e completo) ===================

// ===== Sidebar =====
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("closeSidebar");
const backdrop = document.getElementById("backdrop");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    backdrop.classList.add("show");
    sidebar.setAttribute("aria-hidden", "false");
    menuBtn.setAttribute("aria-expanded", "true");
  });
}
if (closeSidebar) {
  closeSidebar.addEventListener("click", closeMenu);
}
if (backdrop) {
  backdrop.addEventListener("click", closeMenu);
}

function closeMenu() {
  sidebar.classList.remove("open");
  backdrop.classList.remove("show");
  sidebar.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
}

// ===== Carrossel =====
const carousel = document.getElementById("carousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function carouselStep() {
  const el = carousel?.querySelector(".card-hero");
  return el ? el.getBoundingClientRect().width : 300;
}
if (prevBtn && carousel) {
  prevBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: -carouselStep() - 16, behavior: "smooth" });
  });
}
if (nextBtn && carousel) {
  nextBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: carouselStep() + 16, behavior: "smooth" });
  });
}

// ===== Modais (Config / Login) =====
function setupModal(openBtnId, modalId) {
  const openBtn = document.getElementById(openBtnId);
  const modal = document.getElementById(modalId);
  if (!openBtn || !modal) return;
  const overlay = modal.querySelector(".overlay");
  const closes = modal.querySelectorAll(".close");

  openBtn.addEventListener("click", () => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    backdrop.classList.add("show");
  });

  if (overlay) overlay.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
  });

  closes.forEach(btn => btn.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
  }));
}
setupModal("openConfig", "configModal");
setupModal("openLogin", "loginModal");

// ===== Tema escuro (Config) =====
const darkToggle = document.getElementById("darkMode");
if (darkToggle) {
  darkToggle.addEventListener("change", (e) => {
    document.documentElement.dataset.theme = e.target.checked ? "light" : "dark";
    // observe: original used light/dark mapping; adjust if needed
  });
}

// ===== Configurações adicionais (tamanho da fonte, layout) =====
const fontSizeSelect = document.getElementById("fontSize");
if (fontSizeSelect) {
  fontSizeSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    // valores esperados: "16","18","20" or "small"/"medium"/"large" depending on your HTML
    if (val === "16" || val === "small" || val === "Padrão") document.documentElement.style.setProperty("--font-size", "16px");
    else if (val === "18" || val === "medium" || val === "Grande") document.documentElement.style.setProperty("--font-size", "18px");
    else if (val === "20" || val === "large" || val === "Muito grande") document.documentElement.style.setProperty("--font-size", "20px");
    else document.documentElement.style.setProperty("--font-size", val + "px");
  });
}

const layoutSelect = document.getElementById("layout");
const newsGrid = document.getElementById("newsGrid");
if (layoutSelect && newsGrid) {
  layoutSelect.addEventListener("change", (e) => {
    const v = e.target.value;
    if (v === "compact") {
      newsGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px,1fr))";
    } else {
      newsGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(260px,1fr))";
    }
  });
}

// ===== Pesquisa (filtro por texto) =====
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  const normalize = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  searchInput.addEventListener("input", () => {
    const q = normalize(searchInput.value);
    const allCards = Array.from(document.querySelectorAll(".news-card, .card-hero"));
    allCards.forEach(card => {
      const hay = normalize(card.textContent + " " + (card.dataset.category || card.querySelector(".tag")?.textContent || ""));
      card.style.display = (q === "" || hay.includes(q)) ? "" : "none";
    });
  });
}

// ===== Filtro de Categorias (robusto e corrigido) =====
(function () {
  function initFilter() {
    const filterBar = document.getElementById("filterBar") ||
                      document.querySelector(".filter-bar") ||
                      document.querySelector(".category-filter") ||
                      document.querySelector(".filter-bar") ||
                      document.querySelector("nav.filter-bar");

    if (!filterBar) {
      console.warn("Filtro: não encontrou a barra de filtros.");
      return;
    }

    const buttons = Array.from(filterBar.querySelectorAll("button"));
    if (!buttons.length) {
      console.warn("Filtro: nenhum botão encontrado na barra de filtros.");
      return;
    }

    // seleciona cards que podem ser filtrados (grid + destaques)
    const newsGridCards = Array.from(document.querySelectorAll(".news-card"));
    const heroCards = Array.from(document.querySelectorAll(".card-hero"));
    const allCards = newsGridCards.concat(heroCards);

    const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    function applyFilter(category) {
      const catNorm = norm(category);
      allCards.forEach(card => {
        const dataCat = card.dataset.category || card.querySelector(".tag")?.textContent || "";
        const cardCatNorm = norm(dataCat);
        const show = catNorm === "todas" || cardCatNorm === catNorm || cardCatNorm.includes(catNorm) || catNorm === "" ;
        card.style.display = show ? "" : "none";
      });
    }

    // delegação
    filterBar.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button");
      if (!btn || !filterBar.contains(btn)) return;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.category || btn.getAttribute("data-category") || btn.textContent.trim();
      applyFilter(category);
    });

    // inicializa com "Todas" ativo
    const initialBtn = buttons.find(b => (b.dataset.category || b.getAttribute("data-category") || b.textContent).toLowerCase().includes("todas")) || buttons[0];
    if (initialBtn) {
      initialBtn.classList.add("active");
      const category = initialBtn.dataset.category || initialBtn.getAttribute("data-category") || initialBtn.textContent.trim();
      applyFilter(category);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFilter);
  } else {
    initFilter();
  }
})();

// ===== Fechar modais / sidebar com ESC =====
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
    document.querySelectorAll(".modal.show").forEach(m => m.classList.remove("show"));
    backdrop.classList.remove("show");
  }
});
// ===== Preferências: salvar / aplicar / carregar =====
(function () {
  const PREF_KEY = 'gamenews:prefs';

  // elementos
  const configModal = document.getElementById('configModal');
  const openConfigBtn = document.getElementById('openConfig');
  const savePrefsBtn = document.getElementById('savePrefs');

  const darkModeSel = document.getElementById('darkMode');        // select: dark | light
  const fontSizeRange = document.getElementById('fontSize');      // range 14-20
  const languageSel = document.getElementById('language');        // select
  const layoutModeSel = document.getElementById('layoutMode');    // select: grid | list
  const notificationsChk = document.getElementById('notifications'); // checkbox
  const autoplayChk = document.getElementById('autoplayMedia');   // checkbox

  // apply: atualiza UI / DOM conforme prefs
  function applyPrefs(p = {}) {
    // tema
    const theme = p.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');

    // font-size (aplica na raíz para que o css que usa var(--font-size) funcione)
    const fs = p.fontSize || 16;
    document.documentElement.style.setProperty('--font-size', fs + 'px');

    // layout
    if (layoutModeSel) {
      layoutModeSel.value = p.layout || 'grid';
      applyLayout(p.layout || 'grid');
    }

    // language (simulação)
    if (languageSel) languageSel.value = p.language || 'pt';

    // notifications / autoplay (simulação)
    if (notificationsChk) notificationsChk.checked = !!p.notifications;
    if (autoplayChk) autoplayChk.checked = !!p.autoplay;

    // atualiza controles visuais (selects / ranges)
    if (darkModeSel) darkModeSel.value = theme;
    if (fontSizeRange) fontSizeRange.value = fs;
  }

  // aplica layout das notícias imediatamente
  function applyLayout(mode) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    if (mode === 'list') {
      grid.style.display = 'block';
      grid.querySelectorAll('.news-card').forEach(card => {
        card.style.display = 'flex';
        card.style.gap = '12px';
        card.style.alignItems = 'center';
        card.querySelector('img')?.style && (card.querySelector('img').style.width = '160px');
        card.querySelector('img')?.style && (card.querySelector('img').style.height = 'auto');
      });
    } else {
      grid.style.display = '';
      grid.querySelectorAll('.news-card').forEach(card => {
        card.style.display = '';
        card.style.marginBottom = '';
        card.style.gap = '';
        const img = card.querySelector('img');
        if (img) { img.style.width = ''; img.style.height = ''; }
      });
    }
  }

  // carregar prefs do localStorage
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao ler preferências:', e);
      return null;
    }
  }

  // salvar prefs no localStorage
  function savePrefs(p) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(p));
    } catch (e) {
      console.warn('Erro ao salvar preferências:', e);
    }
  }

  // preencher objeto de prefs a partir dos controles
  function readPrefsFromControls() {
    return {
      theme: darkModeSel ? darkModeSel.value : (document.documentElement.getAttribute('data-theme') || 'dark'),
      fontSize: fontSizeRange ? parseInt(fontSizeRange.value, 10) : 16,
      language: languageSel ? languageSel.value : 'pt',
      layout: layoutModeSel ? layoutModeSel.value : 'grid',
      notifications: notificationsChk ? !!notificationsChk.checked : false,
      autoplay: autoplayChk ? !!autoplayChk.checked : false,
    };
  }

  // handlers: abrir modal configurações
  if (openConfigBtn && configModal) {
    openConfigBtn.addEventListener('click', () => {
      configModal.classList.add('show');
      configModal.setAttribute('aria-hidden', 'false');
      // mostra backdrop (reaproveita backdrop existente)
      document.getElementById('backdrop')?.classList.add('show');
    });
  }

  // salvar
  if (savePrefsBtn) {
    savePrefsBtn.addEventListener('click', () => {
      const prefs = readPrefsFromControls();
      applyPrefs(prefs);
      savePrefs(prefs);
      // fecha modal
      configModal.classList.remove('show');
      configModal.setAttribute('aria-hidden', 'true');
      document.getElementById('backdrop')?.classList.remove('show');
    });
  }

  // fecha ao clicar em elementos com data-close="config" (ja presente no overlay e botões)
  document.querySelectorAll('[data-close="config"]').forEach(el => {
    el.addEventListener('click', () => {
      configModal.classList.remove('show');
      configModal.setAttribute('aria-hidden', 'true');
      document.getElementById('backdrop')?.classList.remove('show');
    });
  });

  // atualiza fontes e layout em tempo real quando o usuário mexe nos controles (melhora UX)
  if (fontSizeRange) {
    fontSizeRange.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10) || 16;
      document.documentElement.style.setProperty('--font-size', v + 'px');
    });
  }
  if (layoutModeSel) {
    layoutModeSel.addEventListener('change', (e) => applyLayout(e.target.value));
  }
  if (darkModeSel) {
    darkModeSel.addEventListener('change', (e) => {
      const t = e.target.value;
      document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
    });
  }

  // inicialização: carrega prefs salvos e aplica
  const saved = loadPrefs();
  if (saved) applyPrefs(saved);
})();
