// =============================================================
// Portfolio multi-pages — interactions
// =============================================================
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Index global des chapitres (utilisé par la palette de commandes)
  const CHAPTERS = [
    { slug: 'index',       title: 'Accueil',                       icon: '◯' },
    { slug: 'parcours',    title: 'Parcours',                      icon: '01' },
    { slug: 'referentiel', title: 'Référentiel RNCP',              icon: '02' },
    { slug: 'matrice',     title: 'Matrice de correspondance',     icon: '03' },
    { slug: 'c1',          title: 'C1 — Administrer les réseaux',  icon: 'C1' },
    { slug: 'c2',          title: 'C2 — Connecter les usagers',    icon: 'C2' },
    { slug: 'c3',          title: 'C3 — Créer des outils',         icon: 'C3' },
    { slug: 'c4',          title: 'C4 — Administrer un SI sécurisé', icon: 'C4' },
    { slug: 'c5',          title: 'C5 — Surveiller un SI sécurisé', icon: 'C5' },
    { slug: 'transverses', title: 'Compétences transverses',       icon: '09' },
    { slug: 'avenir',      title: 'Projet professionnel',          icon: '10' },
    { slug: 'annexes',     title: 'Annexes',                       icon: '11' },
  ];

  // -------------------------------------------------------------
  // INJECTION : command palette + lightbox + hint clavier
  // -------------------------------------------------------------
  function injectShell() {
    if ($('.cmd-palette')) return;

    const palette = document.createElement('div');
    palette.className = 'cmd-palette';
    palette.innerHTML = `
      <div class="cmd-panel" role="dialog" aria-label="Aller à un chapitre">
        <div class="cmd-input-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Aller à un chapitre…" autocomplete="off" />
        </div>
        <div class="cmd-results"></div>
        <div class="cmd-hint">
          <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
          <span><kbd>↵</kbd> ouvrir</span>
          <span><kbd>Esc</kbd> fermer</span>
        </div>
      </div>
    `;
    document.body.appendChild(palette);

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Aperçu de la trace');
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <img alt="" />
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lb);

    const hint = document.createElement('div');
    hint.className = 'kbd-hints';
    hint.innerHTML = `<span><kbd>←</kbd><kbd>→</kbd> chapitres</span><span><kbd>/</kbd> chercher</span><span><kbd>⌘K</kbd> aller à</span>`;
    document.body.appendChild(hint);
  }

  // -------------------------------------------------------------
  // PROGRESS STRIP (mini-map des chapitres, en haut de page)
  // -------------------------------------------------------------
  function bindProgressStrip() {
    const strip = $('.progress-strip');
    if (!strip) return;
    const cur = parseInt(strip.dataset.current || '0', 10);
    const total = parseInt(strip.dataset.total || CHAPTERS.length, 10);

    // Marquer comme visités les chapitres déjà vus (localStorage)
    let visited = [];
    try {
      visited = JSON.parse(localStorage.getItem('portfolio-visited') || '[]');
    } catch (_) {}
    if (!visited.includes(cur)) visited.push(cur);
    try { localStorage.setItem('portfolio-visited', JSON.stringify(visited)); } catch (_) {}

    strip.innerHTML = CHAPTERS.slice(0, total).map((c, i) => {
      const cls = i === cur ? 'is-current' : (visited.includes(i) ? 'is-visited' : '');
      return `<a class="${cls}" href="${c.slug}.html" data-idx="${i}" aria-label="${c.title}" title="${c.title}"></a>`;
    }).join('');
  }

  // -------------------------------------------------------------
  // RECHERCHE LOCALE (dans la page courante)
  // -------------------------------------------------------------
  function bindSearch() {
    const input = $('.app-search input');
    if (!input) return;

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => doSearch(input.value.trim()), 120);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.value = ''; doSearch(''); input.blur(); }
    });

    document.addEventListener('keydown', e => {
      if (e.key === '/' && !isTyping(e.target)) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  function doSearch(q) {
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = norm(q);
    const targets = $$('tbody tr, .ac-card, .exp-card, .trace, .menu-card');

    targets.forEach(t => {
      t.querySelectorAll('mark').forEach(m => {
        const tx = document.createTextNode(m.textContent);
        m.replaceWith(tx);
      });
      if (!term) {
        t.classList.remove('search-hidden');
        return;
      }
      const text = norm(t.textContent || '');
      if (text.includes(term)) {
        t.classList.remove('search-hidden');
        highlightInElement(t, q);
      } else {
        t.classList.add('search-hidden');
      }
    });
  }

  function highlightInElement(el, term) {
    if (!term) return;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const lcTerm = norm(term);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => {
        if (n.parentElement.tagName === 'MARK') return NodeFilter.FILTER_REJECT;
        if (n.parentElement.closest('script, style')) return NodeFilter.FILTER_REJECT;
        return norm(n.nodeValue).includes(lcTerm) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      const text = node.nodeValue;
      const lc = norm(text);
      const idx = lc.indexOf(lcTerm);
      if (idx < 0) return;
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + term.length);
      const after = text.slice(idx + term.length);
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      const m = document.createElement('mark');
      m.textContent = match;
      frag.appendChild(m);
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function isTyping(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }

  // -------------------------------------------------------------
  // SIX QUESTIONS → ONGLETS
  // -------------------------------------------------------------
  function transformSixQ() {
    $$('dl.six-q').forEach(dl => {
      const items = $$(':scope > div', dl);
      if (items.length === 0) return;

      const wrap = document.createElement('div');
      wrap.className = 'six-q-tabs';
      const tablist = document.createElement('div');
      tablist.className = 'six-q-tablist';
      tablist.setAttribute('role', 'tablist');
      const panels = document.createElement('div');

      items.forEach((item, i) => {
        const dt = item.querySelector('dt');
        const dd = item.querySelector('dd');
        if (!dt || !dd) return;

        const tab = document.createElement('button');
        tab.className = 'six-q-tab' + (i === 0 ? ' is-active' : '');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        tab.textContent = dt.textContent;
        tab.dataset.idx = i;
        tablist.appendChild(tab);

        const panel = document.createElement('div');
        panel.className = 'six-q-panel' + (i === 0 ? ' is-active' : '');
        panel.setAttribute('role', 'tabpanel');
        panel.dataset.idx = i;
        while (dd.firstChild) panel.appendChild(dd.firstChild);
        panels.appendChild(panel);
      });

      tablist.addEventListener('click', e => {
        const tab = e.target.closest('.six-q-tab');
        if (!tab) return;
        const idx = +tab.dataset.idx;
        wrap.querySelectorAll('.six-q-tab').forEach(t => {
          const a = +t.dataset.idx === idx;
          t.classList.toggle('is-active', a);
          t.setAttribute('aria-selected', a ? 'true' : 'false');
        });
        wrap.querySelectorAll('.six-q-panel').forEach(p => {
          p.classList.toggle('is-active', +p.dataset.idx === idx);
        });
      });

      tablist.addEventListener('keydown', e => {
        const tabs = $$('.six-q-tab', tablist);
        const cur = tabs.findIndex(t => t.classList.contains('is-active'));
        let next = cur;
        if (e.key === 'ArrowRight') next = (cur + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (cur - 1 + tabs.length) % tabs.length;
        else return;
        e.preventDefault();
        tabs[next].click();
        tabs[next].focus();
      });

      wrap.appendChild(tablist);
      wrap.appendChild(panels);
      dl.replaceWith(wrap);
    });
  }

  // -------------------------------------------------------------
  // FILTRES MATIÈRES (uniquement sur la page parcours)
  // -------------------------------------------------------------
  function bindFilters() {
    const detailH2 = $$('h2').find(h => h.textContent.includes('Détail des matières étudiées'));
    if (!detailH2) return;

    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar';
    filterBar.innerHTML = `
      <span class="filter-label">Semestre</span>
      <button class="filter-chip is-active" data-sem="all">Tous</button>
      <button class="filter-chip" data-sem="s1">S1</button>
      <button class="filter-chip" data-sem="s2">S2</button>
      <button class="filter-chip" data-sem="s3">S3</button>
      <button class="filter-chip" data-sem="s4">S4</button>
      <button class="filter-chip" data-sem="s5">S5</button>
      <span style="width:1px;height:18px;background:var(--rule);margin:0 0.4rem"></span>
      <span class="filter-label">Note</span>
      <button class="filter-chip is-active" data-note="all">Toutes</button>
      <button class="filter-chip" data-note="strong">≥ 14</button>
      <button class="filter-chip" data-note="mid">10–14</button>
      <button class="filter-chip" data-note="weak">&lt; 10</button>
    `;

    let nextEl = detailH2.nextElementSibling;
    while (nextEl && nextEl.tagName !== 'H3') nextEl = nextEl.nextElementSibling;
    if (!nextEl) return;
    nextEl.parentNode.insertBefore(filterBar, nextEl);

    const semMap = [
      ['Semestre 1', 's1'],
      ['Semestre 2', 's2'],
      ['Semestre 3', 's3'],
      ['Semestre 4', 's4'],
      ['Semestre 5', 's5'],
    ];
    semMap.forEach(([label, key]) => {
      const h3 = $$('h3').find(h => h.textContent.includes(label));
      if (!h3) return;
      h3.dataset.sem = key;
      const wrap = h3.nextElementSibling;
      if (wrap && wrap.classList.contains('table-wrap')) wrap.dataset.sem = key;
    });

    let activeSem = 'all';
    let activeNote = 'all';

    filterBar.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      if (chip.dataset.sem) {
        activeSem = chip.dataset.sem;
        filterBar.querySelectorAll('[data-sem]').forEach(c => c.classList.toggle('is-active', c.dataset.sem === activeSem));
      } else if (chip.dataset.note) {
        activeNote = chip.dataset.note;
        filterBar.querySelectorAll('[data-note]').forEach(c => c.classList.toggle('is-active', c.dataset.note === activeNote));
      }
      applyFilter();
    });

    function applyFilter() {
      semMap.forEach(([_, key]) => {
        const h3 = $$('h3').find(h => h.dataset.sem === key);
        const wrap = $$('.table-wrap').find(w => w.dataset.sem === key);
        if (!h3 || !wrap) return;
        const visibleSem = activeSem === 'all' || activeSem === key;
        h3.style.display = visibleSem ? '' : 'none';
        wrap.style.display = visibleSem ? '' : 'none';
        if (visibleSem) {
          let any = false;
          $$('tbody tr', wrap).forEach(tr => {
            const noteCell = tr.querySelector('.note-cell');
            if (!noteCell) return;
            let cls;
            if (noteCell.classList.contains('note-strong')) cls = 'strong';
            else if (noteCell.classList.contains('note-weak')) cls = 'weak';
            else if (noteCell.classList.contains('note-pending')) cls = 'pending';
            else cls = 'mid';
            const show = activeNote === 'all' || cls === activeNote || (activeNote === 'mid' && cls === 'pending');
            tr.style.display = show ? '' : 'none';
            if (show) any = true;
          });
          if (!any) { h3.style.display = 'none'; wrap.style.display = 'none'; }
        }
      });
    }
  }

  // -------------------------------------------------------------
  // LIGHTBOX
  // -------------------------------------------------------------
  function bindLightbox() {
    const lb = $('.lightbox');
    const lbImg = lb?.querySelector('img');
    const lbCap = lb?.querySelector('.lightbox-caption');
    const lbClose = lb?.querySelector('.lightbox-close');
    if (!lb || !lbImg) return;

    $$('.trace img').forEach(img => {
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
        const cap = img.closest('.trace')?.querySelector('figcaption strong');
        lbCap.textContent = cap ? cap.textContent : (img.alt || '');
        lb.classList.add('is-open');
      });
    });

    function close() {
      lb.classList.remove('is-open');
      lbImg.src = '';
    }
    lbClose?.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb || e.target === lbImg) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
    });
  }

  // -------------------------------------------------------------
  // COMMAND PALETTE (cross-page)
  // -------------------------------------------------------------
  function bindCmdPalette() {
    const palette = $('.cmd-palette');
    const input = palette?.querySelector('input');
    const results = palette?.querySelector('.cmd-results');
    if (!palette || !input || !results) return;

    let focusIdx = 0;
    let filtered = [];

    function open() {
      palette.classList.add('is-open');
      input.value = '';
      render('');
      setTimeout(() => input.focus(), 50);
    }
    function close() { palette.classList.remove('is-open'); }
    function render(q) {
      const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const term = norm(q.trim());
      filtered = term
        ? CHAPTERS.filter(c => norm(c.title).includes(term) || norm(c.slug).includes(term))
        : CHAPTERS;
      focusIdx = 0;
      if (filtered.length === 0) {
        results.innerHTML = '<div class="cmd-results-empty">Aucun chapitre trouvé</div>';
        return;
      }
      results.innerHTML = filtered.map((c, i) => `
        <a class="cmd-result ${i === 0 ? 'is-focused' : ''}" data-i="${i}" href="${c.slug}.html">
          <span class="cmd-result-type">${escapeHtml(c.icon)}</span>
          <span class="cmd-result-text">${escapeHtml(c.title)}</span>
        </a>
      `).join('');
    }
    function activate(i) {
      const it = filtered[i];
      if (!it) return;
      window.location.href = `${it.slug}.html`;
    }
    function moveFocus(delta) {
      if (filtered.length === 0) return;
      focusIdx = (focusIdx + delta + filtered.length) % filtered.length;
      results.querySelectorAll('.cmd-result').forEach((r, i) => {
        r.classList.toggle('is-focused', i === focusIdx);
      });
      results.children[focusIdx]?.scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); activate(focusIdx); }
      else if (e.key === 'Escape') close();
    });
    palette.addEventListener('click', e => { if (e.target === palette) close(); });

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // -------------------------------------------------------------
  // RACCOURCIS GLOBAUX (← → entre chapitres)
  // -------------------------------------------------------------
  function bindShortcuts() {
    document.addEventListener('keydown', e => {
      if (isTyping(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'l') {
        const next = $('.cn-next, .pagenav-next');
        if (next && next.tagName === 'A') { e.preventDefault(); window.location.href = next.href; }
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        const prev = $('.cn-prev, .pagenav-prev');
        if (prev && prev.tagName === 'A') { e.preventDefault(); window.location.href = prev.href; }
      }
    });
  }



  // -------------------------------------------------------------
  // FILTRE MATRICE (par semestre)
  // -------------------------------------------------------------
  function bindMatrixFilter() {
    const controls = $('.matrix-controls');
    const table = $('table.matrix-full');
    if (!controls || !table) return;

    controls.addEventListener('click', e => {
      const chip = e.target.closest('[data-sem-matrix]');
      if (!chip) return;
      const sem = chip.dataset.semMatrix;
      controls.querySelectorAll('[data-sem-matrix]').forEach(c => {
        c.classList.toggle('is-active', c === chip);
      });
      $$('tr[data-sem]', table).forEach(tr => {
        const show = sem === 'all' || tr.dataset.sem === sem;
        tr.classList.toggle('matrix-row-hidden', !show);
      });
    });
  }

  // -------------------------------------------------------------
  // THÈME, IMPRESSION, SIDEBAR MOBILE
  // -------------------------------------------------------------
  function bindMisc() {
    const themeBtn = $('.theme-toggle');
    const stored = localStorage.getItem('portfolio-theme');
    if (stored === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      if (cur === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('portfolio-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('portfolio-theme', 'dark');
      }
    });

    $('.print-button')?.addEventListener('click', () => window.print());

    const sidebar = $('.sidebar');
    const menuToggle = $('.menu-toggle');
    menuToggle?.addEventListener('click', () => sidebar?.classList.toggle('is-open'));
    document.addEventListener('click', e => {
      if (sidebar?.classList.contains('is-open') && !sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
        sidebar.classList.remove('is-open');
      }
    });
  }

  // -------------------------------------------------------------
  // BARRE DE LECTURE (scroll natif)
  // -------------------------------------------------------------
  function bindReadProgress() {
    const bar = $('.read-progress');
    if (!bar) return;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.setProperty('--progress', `${pct}%`);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // -------------------------------------------------------------
  // INIT
  // -------------------------------------------------------------
  function init() {
    injectShell();
    bindProgressStrip();
    transformSixQ();
    bindSearch();
    bindFilters();
    bindLightbox();
    bindCmdPalette();
    bindShortcuts();
    bindMisc();
    bindReadProgress();
    bindMatrixFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
