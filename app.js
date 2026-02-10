// ============================================================
// APP.JS - Gin Distiller Pro
// Navigation, calculs, suivi, theme, swipe, PWA
// ============================================================

(function() {
  'use strict';

  // ========== THEME ==========
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  function initTheme() {
    const saved = localStorage.getItem('gin-theme') || 'light';
    html.setAttribute('data-theme', saved);
    updateThemeColor(saved);
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('gin-theme', next);
    updateThemeColor(next);
    vibrate(10);
  }

  function updateThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0f3460' : '#2c5f8a';
  }

  themeToggle.addEventListener('click', toggleTheme);
  initTheme();

  // ========== LEGAL MODAL ==========
  const legalModal = document.getElementById('legalModal');
  const legalAccept = document.getElementById('legalAccept');

  function initLegal() {
    if (!localStorage.getItem('gin-legal-accepted')) {
      legalModal.classList.add('active');
    }
  }

  legalAccept.addEventListener('click', function() {
    localStorage.setItem('gin-legal-accepted', '1');
    legalModal.classList.remove('active');
    vibrate(15);
  });

  initLegal();

  // ========== NAVIGATION ==========
  const pages = document.querySelectorAll('.page');
  const navBtns = document.querySelectorAll('.nav-btn');
  let currentPage = 'accueil';

  function navigateTo(pageName, pushState) {
    if (pushState === undefined) pushState = true;
    pages.forEach(function(p) { p.classList.remove('active'); });
    navBtns.forEach(function(b) { b.classList.remove('active'); });

    var page = document.getElementById('page-' + pageName);
    if (page) {
      page.classList.add('active');
      window.scrollTo(0, 0);
    }

    var navBtn = document.querySelector('.nav-btn[data-page="' + pageName + '"]');
    if (navBtn) navBtn.classList.add('active');

    currentPage = pageName;

    if (pushState) {
      var url = new URL(window.location);
      url.searchParams.set('page', pageName);
      history.pushState({ page: pageName }, '', url);
    }

    vibrate(5);
  }

  navBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      navigateTo(btn.dataset.page);
    });
  });

  // Quick links
  document.querySelectorAll('.quick-link').forEach(function(link) {
    link.addEventListener('click', function() {
      var nav = link.dataset.nav;
      var tab = link.dataset.tab;
      navigateTo(nav);
      if (tab !== undefined) {
        var tabGroup = nav === 'guide' ? 'guideTabs' : 'calculsTabs';
        switchTab(tabGroup, parseInt(tab));
      }
    });
  });

  // History API
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.page) {
      navigateTo(e.state.page, false);
    } else {
      var params = new URLSearchParams(window.location.search);
      navigateTo(params.get('page') || 'accueil', false);
    }
  });

  // Init from URL
  (function() {
    var params = new URLSearchParams(window.location.search);
    var p = params.get('page');
    if (p && document.getElementById('page-' + p)) {
      navigateTo(p, false);
    }
  })();

  // ========== TABS ==========
  function switchTab(tabGroupId, index) {
    var tabGroup = document.getElementById(tabGroupId);
    if (!tabGroup) return;

    var tabs = tabGroup.querySelectorAll('.tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    if (tabs[index]) tabs[index].classList.add('active');

    // Find corresponding container
    var containerId;
    if (tabGroupId === 'guideTabs') containerId = 'guideSwipe';
    else if (tabGroupId === 'calculsTabs') containerId = 'calculsContainer';
    if (containerId) {
      var container = document.getElementById(containerId);
      var panels = container.querySelectorAll('.swipe-panel, .subtab-panel');
      panels.forEach(function(p) { p.classList.remove('active'); });
      var target = container.querySelector('[data-panel="' + index + '"]');
      if (target) target.classList.add('active');
    }
  }

  // Tab click handlers
  ['guideTabs', 'calculsTabs'].forEach(function(groupId) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        switchTab(groupId, parseInt(tab.dataset.tab));
        vibrate(5);
      });
    });
  });

  // ========== SWIPE (Guide) ==========
  (function() {
    var container = document.getElementById('guideSwipe');
    if (!container) return;

    var startX = 0, startY = 0, distX = 0, distY = 0;
    var totalPanels = container.querySelectorAll('.swipe-panel').length;

    function getCurrentIndex() {
      var active = container.querySelector('.swipe-panel.active');
      return active ? parseInt(active.dataset.panel) : 0;
    }

    container.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
      distX = e.changedTouches[0].clientX - startX;
      distY = e.changedTouches[0].clientY - startY;

      // Only swipe if horizontal movement > vertical and > 50px threshold
      if (Math.abs(distX) > 50 && Math.abs(distX) > Math.abs(distY) * 1.5) {
        var idx = getCurrentIndex();
        if (distX < 0 && idx < totalPanels - 1) {
          switchTab('guideTabs', idx + 1);
        } else if (distX > 0 && idx > 0) {
          switchTab('guideTabs', idx - 1);
        }
      }
    }, { passive: true });
  })();

  // ========== CALCULATEUR MATIERE PREMIERE ==========
  var calcWineVol = document.getElementById('calcWineVol');
  var calcWineABV = document.getElementById('calcWineABV');
  var calcMatiereResults = document.getElementById('calcMatiereResults');

  function updateCalcMatiere() {
    var vol = parseFloat(calcWineVol.value) || 0;
    var abv = parseFloat(calcWineABV.value) || 0;

    if (vol <= 0 || abv <= 0 || abv > 100) {
      calcMatiereResults.innerHTML = '<div class="box box-warning">Entrez des valeurs valides.</div>';
      return;
    }

    var ethanol0 = vol * abv / 100;

    // D1: 88% recovery
    var ethD1 = ethanol0 * DATA.calcCoefficients.d1Recovery;
    var abvD1 = 35;
    var volD1 = ethD1 / (abvD1 / 100);

    // D2: 60% of D1 ethanol -> coeur
    var ethD2 = ethD1 * DATA.calcCoefficients.d2Recovery;
    var abvD2 = 73;
    var volD2 = ethD2 / (abvD2 / 100);

    // D3: 84% of D2 ethanol -> coeur
    var ethD3 = ethD2 * DATA.calcCoefficients.d3Recovery;
    var abvD3 = 80;
    var volD3 = ethD3 / (abvD3 / 100);

    // Dilution to 40%
    var ethFinal = ethD3;
    var abvFinal = 40;
    var volFinal = ethFinal / (abvFinal / 100);

    var warn = '';
    if (ethFinal > ethanol0) {
      warn = '<div class="box box-danger">Erreur : ethanol de sortie > ethanol d\'entree. Impossible.</div>';
    }

    calcMatiereResults.innerHTML = warn +
      buildCascadeStep('Vin', r(vol) + ' mL @ ' + r(abv) + '%', r(ethanol0) + ' mL ethanol', false) +
      '<div class="cascade-arrow">&darr; D1 (recup. 88%)</div>' +
      buildCascadeStep('Bas-vin D1', '~' + r(volD1) + ' mL @ ~' + abvD1 + '%', '~' + r(ethD1) + ' mL ethanol', false) +
      '<div class="cascade-arrow">&darr; D2 coeur (recup. 60%)</div>' +
      buildCascadeStep('Coeur D2', '~' + r(volD2) + ' mL @ ~' + abvD2 + '%', '~' + r(ethD2) + ' mL ethanol', false) +
      '<div class="cascade-arrow">&darr; D3 coeur (recup. 84%)</div>' +
      buildCascadeStep('Coeur D3', '~' + r(volD3) + ' mL @ ~' + abvD3 + '%', '~' + r(ethD3) + ' mL ethanol', false) +
      '<div class="cascade-arrow">&darr; Dilution a 40%</div>' +
      buildCascadeStep('Gin Final', '~' + r(volFinal) + ' mL @ ' + abvFinal + '%', '~' + r(ethFinal) + ' mL ethanol (' + r(ethFinal / ethanol0 * 100) + '%)', true);
  }

  function buildCascadeStep(label, detail, ethanol, isFinal) {
    return '<div class="cascade-step' + (isFinal ? ' final' : '') + '">' +
      '<div><div class="cascade-label">' + label + '</div><div class="cascade-detail">' + detail + '</div></div>' +
      '<div class="cascade-values"><div class="cascade-ethanol">' + ethanol + '</div></div>' +
      '</div>';
  }

  function r(n) { return Math.round(n); }

  if (calcWineVol) {
    calcWineVol.addEventListener('input', updateCalcMatiere);
    calcWineABV.addEventListener('input', updateCalcMatiere);
    updateCalcMatiere();
  }

  // ========== CALCULATEUR BOTANIQUES ==========
  var calcBotVol = document.getElementById('calcBotVol');
  var calcBotResults = document.getElementById('calcBotResults');
  var calcBotRecipe = document.getElementById('calcBotRecipe');

  function updateCalcBot() {
    var vol = parseFloat(calcBotVol.value) || 0;
    if (vol <= 0) return;

    var recipeId = calcBotRecipe ? calcBotRecipe.value : 'london-dry';
    var recipe = getRecipe(recipeId);
    if (!recipe) return;

    var tbody = calcBotResults.querySelector('tbody');
    var html = '';
    var totalG = 0;
    var totalGPerL = 0;

    recipe.botanicals.forEach(function(b) {
      var lib = getLibraryBotanical(b.id);
      var nom = lib ? lib.nom : b.id;
      var detail = lib ? lib.detail : '';
      var role = lib ? lib.role : '';
      var qty = b.gPerL * (vol / 1000);
      totalG += qty;
      totalGPerL += b.gPerL;
      html += '<tr><td>' + nom + ' (' + detail + ')</td><td>' + b.gPerL + '</td><td><strong>' + qty.toFixed(1) + ' g</strong></td><td>' + role + '</td></tr>';
    });

    html += '<tr class="row-total"><td><strong>TOTAL</strong></td><td><strong>~' + totalGPerL.toFixed(0) + '</strong></td><td><strong>' + totalG.toFixed(1) + ' g</strong></td><td>' + recipe.nom + '</td></tr>';

    tbody.innerHTML = html;
  }

  if (calcBotVol) {
    calcBotVol.addEventListener('input', updateCalcBot);
    if (calcBotRecipe) calcBotRecipe.addEventListener('change', updateCalcBot);
  }

  // ========== CALCULATEUR DILUTION ==========
  var calcDilVol = document.getElementById('calcDilVol');
  var calcDilABV = document.getElementById('calcDilABV');
  var calcDilTarget = document.getElementById('calcDilTarget');
  var calcDilResults = document.getElementById('calcDilResults');

  function updateCalcDil() {
    var vol = parseFloat(calcDilVol.value) || 0;
    var abv = parseFloat(calcDilABV.value) || 0;
    var target = parseFloat(calcDilTarget.value) || 0;

    if (vol <= 0 || abv <= 0 || target <= 0 || abv > 100 || target > 100) {
      calcDilResults.innerHTML = '<div class="box box-warning">Entrez des valeurs valides.</div>';
      return;
    }

    if (target >= abv) {
      calcDilResults.innerHTML = '<div class="box box-danger">L\'ABV cible doit etre inferieur a l\'ABV actuel.</div>';
      return;
    }

    var eau = vol * (abv / target - 1);
    var volFinalTheorique = vol + eau;
    var contraction = DATA.dilution.contraction / 100;
    var volFinalReel = volFinalTheorique * (1 - contraction);
    var ethanolPur = vol * abv / 100;

    calcDilResults.innerHTML = '<div class="result-card">' +
      '<div class="result-row"><span class="result-label">Eau a ajouter</span><span class="result-value highlight">' + r(eau) + ' mL</span></div>' +
      '<div class="result-row"><span class="result-label">Volume final theorique</span><span class="result-value">~' + r(volFinalTheorique) + ' mL</span></div>' +
      '<div class="result-row"><span class="result-label">Volume reel (~' + DATA.dilution.contraction + '% contraction)</span><span class="result-value">~' + r(volFinalReel) + ' mL</span></div>' +
      '<div class="result-row"><span class="result-label">Ethanol pur conserve</span><span class="result-value">' + r(ethanolPur) + ' mL</span></div>' +
      '</div>';
  }

  if (calcDilVol) {
    calcDilVol.addEventListener('input', updateCalcDil);
    calcDilABV.addEventListener('input', updateCalcDil);
    calcDilTarget.addEventListener('input', updateCalcDil);
    updateCalcDil();
  }

  // Dilution presets
  document.querySelectorAll('[data-preset]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var preset = btn.dataset.preset;
      if (preset === 'd3') {
        calcDilVol.value = 135;
        calcDilABV.value = 80;
        calcDilTarget.value = 40;
      } else if (preset === 'preD3') {
        calcDilVol.value = 175;
        calcDilABV.value = 73;
        calcDilTarget.value = 43;
      }
      updateCalcDil();
      vibrate(10);
    });
  });

  // ========== ACCORDION (generic) ==========
  document.querySelectorAll('.accordion-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var acc = header.closest('.accordion');
      acc.classList.toggle('open');
      var icon = header.querySelector('.accordion-icon');
      icon.textContent = acc.classList.contains('open') ? '-' : '+';
      vibrate(5);
    });
  });

  // ========== SUIVI DE PRODUCTION ==========
  var STORAGE_KEY = 'gin-sessions';

  function getSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  function getSession(id) {
    return getSessions().find(function(s) { return s.id === id; });
  }

  function updateSession(id, updates) {
    var sessions = getSessions();
    var idx = sessions.findIndex(function(s) { return s.id === id; });
    if (idx !== -1) {
      Object.assign(sessions[idx], updates);
      saveSessions(sessions);
    }
  }

  function deleteSession(id) {
    var sessions = getSessions().filter(function(s) { return s.id !== id; });
    saveSessions(sessions);
  }

  // --- Views ---
  var suiviList = document.getElementById('suiviList');
  var suiviNew = document.getElementById('suiviNew');
  var suiviDetail = document.getElementById('suiviDetail');
  var currentSessionId = null;

  function showView(view) {
    suiviList.style.display = view === 'list' ? '' : 'none';
    suiviNew.style.display = view === 'new' ? '' : 'none';
    suiviDetail.style.display = view === 'detail' ? '' : 'none';
  }

  // --- Session List ---
  function renderSessionList() {
    var sessions = getSessions();
    var listEl = document.getElementById('sessionList');
    var statsEl = document.getElementById('sessionStats');
    var statsContent = document.getElementById('statsContent');

    if (sessions.length === 0) {
      listEl.innerHTML = '<p class="empty-state">Aucune session. Creez votre premiere session de production.</p>';
      statsEl.style.display = 'none';
      return;
    }

    // Stats
    var completed = sessions.filter(function(s) { return s.ficheRendement; });
    if (completed.length > 0) {
      var rendements = completed.map(function(s) { return parseFloat(s.ficheRendement) || 0; });
      var avg = rendements.reduce(function(a, b) { return a + b; }, 0) / rendements.length;
      var best = Math.max.apply(null, rendements);
      statsEl.style.display = '';
      statsContent.innerHTML =
        '<div class="stat-card"><div class="stat-value">' + sessions.length + '</div><div class="stat-label">Sessions</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + avg.toFixed(0) + '%</div><div class="stat-label">Rendement moy.</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + best.toFixed(0) + '%</div><div class="stat-label">Meilleur</div></div>';
    } else {
      statsEl.style.display = 'none';
    }

    // Cards
    var html = '';
    sessions.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    sessions.forEach(function(s) {
      var totalChecked = countChecked(s);
      var pct = Math.round(totalChecked / 39 * 100);
      var badge = pct >= 100 ? '<span class="badge badge-done">Termine</span>' : '<span class="badge badge-progress">' + pct + '%</span>';
      var rendement = s.ficheRendement ? s.ficheRendement + '%' : '--';
      html += '<div class="session-card" data-session="' + s.id + '">' +
        '<div class="session-card-header"><span class="session-card-name">' + escapeHtml(s.name) + '</span>' + badge + '</div>' +
        '<div class="session-card-info"><span>' + formatDate(s.date) + '</span><span>Rendement: ' + rendement + '</span></div>' +
        '</div>';
    });
    listEl.innerHTML = html;

    // Click to detail
    listEl.querySelectorAll('.session-card').forEach(function(card) {
      card.addEventListener('click', function() {
        loadSession(card.dataset.session);
        vibrate(10);
      });
    });
  }

  function countChecked(session) {
    var total = 0;
    if (session.checks) {
      Object.keys(session.checks).forEach(function(k) {
        Object.keys(session.checks[k]).forEach(function(i) {
          if (session.checks[k][i]) total++;
        });
      });
    }
    return total;
  }

  // --- Create session ---
  document.getElementById('newSessionBtn').addEventListener('click', function() {
    document.getElementById('sessionDate').value = new Date().toISOString().split('T')[0];
    showView('new');
    vibrate(10);
  });

  document.getElementById('cancelSessionBtn').addEventListener('click', function() {
    showView('list');
  });

  document.getElementById('createSessionBtn').addEventListener('click', function() {
    var name = document.getElementById('sessionName').value.trim();
    if (!name) { alert('Entrez un nom pour le lot.'); return; }

    var recipeSelect = document.getElementById('sessionRecipe');
    var recipeId = recipeSelect ? recipeSelect.value : 'london-dry';
    var recipe = getRecipe(recipeId);

    var session = {
      id: Date.now().toString(),
      name: name,
      date: document.getElementById('sessionDate').value || new Date().toISOString().split('T')[0],
      wineVol: parseFloat(document.getElementById('sessionWineVol').value) || 2000,
      wineABV: parseFloat(document.getElementById('sessionWineABV').value) || 12,
      wineType: document.getElementById('sessionWineType').value || 'Blanc sec',
      recipeId: recipeId,
      recipeName: recipe ? recipe.nom : 'London Dry Classique',
      checks: {},
      fiche: {}
    };

    var sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);

    loadSession(session.id);
    vibrate(15);
  });

  // --- Load session detail ---
  function loadSession(id) {
    currentSessionId = id;
    var session = getSession(id);
    if (!session) return;

    // Migration silencieuse pour sessions sans recipeId
    if (!session.recipeId) {
      session.recipeId = 'london-dry';
      session.recipeName = 'London Dry Classique';
      updateSession(id, { recipeId: 'london-dry', recipeName: 'London Dry Classique' });
    }

    document.getElementById('sessionDetailTitle').textContent = session.name;
    showView('detail');

    renderChecklists(session);
    renderFiche(session);
    updateProgress(session);
  }

  document.getElementById('backToListBtn').addEventListener('click', function() {
    currentSessionId = null;
    showView('list');
    renderSessionList();
    vibrate(5);
  });

  // --- Delete session ---
  document.getElementById('deleteSessionBtn').addEventListener('click', function() {
    if (confirm('Supprimer cette session ? Cette action est irreversible.')) {
      deleteSession(currentSessionId);
      currentSessionId = null;
      showView('list');
      renderSessionList();
      vibrate(15);
    }
  });

  // --- Checklists ---
  var checklistsContainer = document.getElementById('checklistsContainer');

  function renderChecklists(session) {
    var html = '';
    var sections = ['avant', 'd1', 'd2', 'd3', 'dilution'];

    sections.forEach(function(key) {
      var cl = DATA.checklists[key];
      // Build items array, possibly overriding d2 item 0
      var items = cl.items.slice();
      if (key === 'd2') {
        var recipe = getRecipe(session.recipeId || 'london-dry');
        if (recipe) {
          var chargeVolume = session.wineVol ? Math.round(session.wineVol * DATA.calcCoefficients.d1Recovery / (35 / 100)) : 600;
          var totalGPerL = 0;
          var botText = recipe.botanicals.map(function(b) {
            var lib = getLibraryBotanical(b.id);
            totalGPerL += b.gPerL;
            var qty = (b.gPerL * chargeVolume / 1000).toFixed(1);
            return (lib ? lib.nom : b.id) + ' ' + qty + 'g';
          }).join(', ');
          var totalQty = totalGPerL * chargeVolume / 1000;
          items[0] = 'Botaniques peses (' + recipe.nom + ') : ' + botText + ', total ~' + totalQty.toFixed(0) + 'g';
        }
      }
      var checked = (session.checks && session.checks[key]) || {};
      var checkedCount = 0;
      items.forEach(function(_, i) { if (checked[i]) checkedCount++; });

      html += '<section class="section"><div class="accordion' + (checkedCount > 0 && checkedCount < items.length ? ' open' : '') + '" data-accordion="cl-' + key + '">' +
        '<button class="accordion-header"><span>' + cl.titre + ' (' + checkedCount + '/' + items.length + ')</span><span class="accordion-icon">' + (checkedCount > 0 && checkedCount < items.length ? '-' : '+') + '</span></button>' +
        '<div class="accordion-body">';

      items.forEach(function(item, i) {
        var isChecked = checked[i] ? true : false;
        html += '<div class="checklist-item' + (isChecked ? ' checked' : '') + '">' +
          '<input type="checkbox" id="cl-' + key + '-' + i + '" data-cl="' + key + '" data-idx="' + i + '"' + (isChecked ? ' checked' : '') + '>' +
          '<label for="cl-' + key + '-' + i + '">' + item + '</label></div>';
      });

      html += '</div></div></section>';
    });

    checklistsContainer.innerHTML = html;

    // Bind accordion
    checklistsContainer.querySelectorAll('.accordion-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var acc = header.closest('.accordion');
        acc.classList.toggle('open');
        var icon = header.querySelector('.accordion-icon');
        icon.textContent = acc.classList.contains('open') ? '-' : '+';
        vibrate(5);
      });
    });

    // Bind checkboxes
    checklistsContainer.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var session = getSession(currentSessionId);
        if (!session) return;
        if (!session.checks) session.checks = {};
        if (!session.checks[cb.dataset.cl]) session.checks[cb.dataset.cl] = {};
        session.checks[cb.dataset.cl][cb.dataset.idx] = cb.checked;
        updateSession(currentSessionId, { checks: session.checks });

        var item = cb.closest('.checklist-item');
        if (cb.checked) item.classList.add('checked');
        else item.classList.remove('checked');

        updateProgress(session);
        updateChecklistCount(cb.dataset.cl);
        vibrate(cb.checked ? 10 : 5);
      });
    });
  }

  function updateChecklistCount(key) {
    var session = getSession(currentSessionId);
    if (!session) return;
    var cl = DATA.checklists[key];
    var checked = (session.checks && session.checks[key]) || {};
    var count = 0;
    cl.items.forEach(function(_, i) { if (checked[i]) count++; });

    var acc = checklistsContainer.querySelector('[data-accordion="cl-' + key + '"]');
    if (acc) {
      var header = acc.querySelector('.accordion-header span:first-child');
      header.textContent = cl.titre + ' (' + count + '/' + cl.items.length + ')';
    }
  }

  function updateProgress(session) {
    var total = countChecked(session);
    var pct = Math.round(total / 39 * 100);
    var bar = document.querySelector('#sessionProgress .progress-fill');
    var text = document.getElementById('sessionProgressText');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = total + ' / 39';
  }

  // --- Fiche de suivi ---
  function renderFiche(session) {
    var fiche = session.fiche || {};

    // Populate fields
    document.querySelectorAll('[data-field]').forEach(function(el) {
      var key = el.dataset.field;
      if (fiche[key] !== undefined) {
        el.value = fiche[key];
      } else {
        // Pre-populate from session info
        if (key === 'ficheDate') el.value = session.date || '';
        else if (key === 'ficheWineVol') el.value = session.wineVol || '';
        else if (key === 'ficheWineABV') el.value = session.wineABV || '';
        else if (key === 'ficheWineType') el.value = session.wineType || '';
        else if (key === 'ficheD2Recipe') el.value = session.recipeName || 'London Dry Classique';
        else if (key === 'ficheD2BotTotal') {
          // Pre-fill with expected total from recipe
          var recipe = getRecipe(session.recipeId || 'london-dry');
          if (recipe) {
            var chargeVol = session.wineVol ? Math.round(session.wineVol * DATA.calcCoefficients.d1Recovery / (35 / 100)) : 600;
            var totalGPerL = 0;
            recipe.botanicals.forEach(function(b) { totalGPerL += b.gPerL; });
            el.value = (totalGPerL * chargeVol / 1000).toFixed(1);
            el.placeholder = '~' + (totalGPerL * chargeVol / 1000).toFixed(0);
          }
        }
        else el.value = '';
      }
    });

    // Render botanical detail under recipe name
    var botDetailEl = document.getElementById('ficheD2BotDetail');
    if (botDetailEl) {
      var recipe = getRecipe(session.recipeId || 'london-dry');
      if (recipe) {
        var chargeVol = session.wineVol ? Math.round(session.wineVol * DATA.calcCoefficients.d1Recovery / (35 / 100)) : 600;
        var html = recipe.botanicals.map(function(b) {
          var lib = getLibraryBotanical(b.id);
          var nom = lib ? lib.nom : b.id;
          var qty = (b.gPerL * chargeVol / 1000).toFixed(1);
          return '<span class="bot-detail-item">' + nom + ' <strong>' + qty + 'g</strong></span>';
        }).join('');
        botDetailEl.innerHTML = html;
      } else {
        botDetailEl.innerHTML = '';
      }
    }

    computeFicheAutos();

    // Bind auto-save
    document.querySelectorAll('[data-field]').forEach(function(el) {
      var events = el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time' ? ['change'] : ['input'];
      events.forEach(function(evt) {
        el.addEventListener(evt, function() {
          saveFicheField(el.dataset.field, el.value);
          computeFicheAutos();
        });
      });
    });
  }

  function saveFicheField(key, value) {
    var session = getSession(currentSessionId);
    if (!session) return;
    if (!session.fiche) session.fiche = {};
    session.fiche[key] = value;
    updateSession(currentSessionId, { fiche: session.fiche });
  }

  function computeFicheAutos() {
    // D1 ethanol
    var d1Vol = getFieldNum('ficheD1Vol');
    var d1ABV = getFieldNum('ficheD1ABV');
    if (d1Vol && d1ABV) {
      var eth1 = Math.round(d1Vol * d1ABV / 100);
      setField('ficheD1Ethanol', eth1);
      saveFicheField('ficheD1Ethanol', eth1);
      showCompare('ficheD1Compare', eth1, 210, 'mL ethanol');
    }

    // D2 ethanol
    var d2Vol = getFieldNum('ficheD2CoeurVol');
    var d2ABV = getFieldNum('ficheD2CoeurABV');
    if (d2Vol && d2ABV) {
      var eth2 = Math.round(d2Vol * d2ABV / 100);
      setField('ficheD2Ethanol', eth2);
      saveFicheField('ficheD2Ethanol', eth2);
      showCompare('ficheD2Compare', eth2, 128, 'mL ethanol');
    }

    // D3 ethanol
    var d3Vol = getFieldNum('ficheD3CoeurVol');
    var d3ABV = getFieldNum('ficheD3CoeurABV');
    if (d3Vol && d3ABV) {
      var eth3 = Math.round(d3Vol * d3ABV / 100);
      setField('ficheD3Ethanol', eth3);
      saveFicheField('ficheD3Ethanol', eth3);
      showCompare('ficheD3Compare', eth3, 108, 'mL ethanol');
    }

    // Rendement
    var session = getSession(currentSessionId);
    if (!session) return;
    var ethInit = (session.wineVol || 2000) * (session.wineABV || 12) / 100;
    var finalABV = getFieldNum('ficheDilFinalABVAfter') || getFieldNum('ficheDilFinalABV');
    var finalVol = getFieldNum('ficheDilGinVol') || getFieldNum('ficheDilFinalVol');
    if (finalVol && finalABV && ethInit > 0) {
      var ethFinal = finalVol * finalABV / 100;
      var rendement = Math.round(ethFinal / ethInit * 100);
      setField('ficheRendement', rendement);
      saveFicheField('ficheRendement', rendement);
      updateSession(currentSessionId, { ficheRendement: rendement });
    }
  }

  function getFieldNum(key) {
    var el = document.querySelector('[data-field="' + key + '"]');
    return el ? parseFloat(el.value) || 0 : 0;
  }

  function setField(key, value) {
    var el = document.querySelector('[data-field="' + key + '"]');
    if (el) el.value = value;
  }

  function showCompare(id, actual, expected, unit) {
    var el = document.getElementById(id);
    if (!el || !actual) { if (el) el.innerHTML = ''; return; }
    var diff = ((actual - expected) / expected * 100).toFixed(0);
    var cls = Math.abs(diff) <= 15 ? 'compare-ok' : Math.abs(diff) <= 30 ? 'compare-warn' : 'compare-bad';
    var sign = diff > 0 ? '+' : '';
    el.innerHTML = '<span class="compare-tag ' + cls + '">Attendu: ~' + expected + ' ' + unit + ' (' + sign + diff + '%)</span>';
  }

  // Initialize suivi view
  showView('list');
  renderSessionList();

  // ========== RECETTES ==========
  var RECIPES_KEY = 'gin-recipes';
  var FAVS_KEY = 'gin-recipe-favs';

  function getLibraryBotanical(id) {
    for (var i = 0; i < DATA.botanicalsLibrary.length; i++) {
      if (DATA.botanicalsLibrary[i].id === id) return DATA.botanicalsLibrary[i];
    }
    return null;
  }

  function getCustomRecipes() {
    try {
      return JSON.parse(localStorage.getItem(RECIPES_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomRecipes(arr) {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(arr));
  }

  function getRecipes() {
    return DATA.presetRecipes.concat(getCustomRecipes());
  }

  function getRecipe(id) {
    var all = getRecipes();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function saveRecipe(recipe) {
    var customs = getCustomRecipes();
    var idx = -1;
    for (var i = 0; i < customs.length; i++) {
      if (customs[i].id === recipe.id) { idx = i; break; }
    }
    if (idx !== -1) customs[idx] = recipe;
    else customs.push(recipe);
    saveCustomRecipes(customs);
  }

  function deleteRecipeById(id) {
    var customs = getCustomRecipes().filter(function(r) { return r.id !== id; });
    saveCustomRecipes(customs);
  }

  function duplicateRecipe(id) {
    var src = getRecipe(id);
    if (!src) return null;
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = 'custom-' + Date.now();
    copy.nom = src.nom + ' (copie)';
    copy.isPreset = false;
    saveRecipe(copy);
    return copy;
  }

  function exportRecipe(id) {
    var recipe = getRecipe(id);
    if (!recipe) return;
    var data = JSON.parse(JSON.stringify(recipe));
    delete data.isPreset;
    var json = JSON.stringify(data, null, 2);

    // Try Web Share API first (mobile)
    if (navigator.share && navigator.canShare) {
      var file = new File([json], recipe.nom.replace(/[^a-zA-Z0-9]/g, '_') + '.json', { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({
          title: recipe.nom,
          text: 'Recette Gin: ' + recipe.nom,
          files: [file]
        }).catch(function() {});
        return;
      }
    }

    // Fallback: download file
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = recipe.nom.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importRecipeFromFile(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.nom || !data.botanicals || !Array.isArray(data.botanicals)) {
          alert('Fichier invalide : recette non reconnue.');
          return;
        }
        data.id = 'custom-' + Date.now();
        data.isPreset = false;
        // Recalculate totalGPerL and profil
        var totalG = 0;
        data.botanicals.forEach(function(b) { totalG += b.gPerL; });
        data.totalGPerL = Math.round(totalG * 10) / 10;
        data.profil = computeFlavorProfile(data.botanicals);
        saveRecipe(data);
        renderRecipeDetail(data.id);
        vibrate(15);
      } catch (err) {
        alert('Erreur lors de l\'import : ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function toggleFavorite(id) {
    var favs = getFavorites();
    var idx = favs.indexOf(id);
    if (idx !== -1) favs.splice(idx, 1);
    else favs.push(id);
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
    return idx === -1;
  }

  function isFavorite(id) {
    return getFavorites().indexOf(id) !== -1;
  }

  function computeFlavorProfile(botanicals) {
    var profil = { conifere: 0, agrume: 0, floral: 0, epice: 0, herbe: 0, terreux: 0, fruit: 0 };
    // Impact factors: some categories are perceptually stronger per gram
    var impact = { conifere: 1, agrume: 3, floral: 4, epice: 1.5, herbe: 2.5, terreux: 2, fruit: 2 };
    var scores = {};
    Object.keys(profil).forEach(function(k) { scores[k] = 0; });
    botanicals.forEach(function(b) {
      var lib = getLibraryBotanical(b.id);
      if (lib && profil.hasOwnProperty(lib.categorie)) {
        var factor = impact[lib.categorie] || 1;
        scores[lib.categorie] += b.gPerL * factor;
      }
    });
    // Find max to normalize to 0-5 scale
    var maxScore = 0;
    Object.keys(scores).forEach(function(k) {
      if (scores[k] > maxScore) maxScore = scores[k];
    });
    if (maxScore === 0) return profil;
    Object.keys(profil).forEach(function(k) {
      profil[k] = Math.min(5, Math.round(scores[k] / maxScore * 5 * 10) / 10);
    });
    return profil;
  }

  function validateRecipe(recipe) {
    var warnings = [];
    var totalG = 0;
    var juniperG = 0;
    var presentCategories = {};
    recipe.botanicals.forEach(function(b) {
      totalG += b.gPerL;
      if (b.id === 'juniper' || b.id === 'juniper-fresh') juniperG += b.gPerL;
      var lib = getLibraryBotanical(b.id);
      if (lib) presentCategories[lib.categorie] = true;
    });
    if (!recipe.nom || !recipe.nom.trim()) warnings.push('Le nom est requis');
    if (recipe.botanicals.length === 0) warnings.push('Ajoutez au moins un botanique');
    if (totalG < 15) warnings.push('Total faible (' + totalG.toFixed(1) + ' g/L) - min recommande 15 g/L');
    if (totalG > 40) warnings.push('Total eleve (' + totalG.toFixed(1) + ' g/L) - max recommande 40 g/L');
    if (juniperG < totalG * 0.4 && totalG > 0) warnings.push('Le genievre devrait representer au moins 40% du total');

    // Check missing categories
    var missingCats = [];
    Object.keys(DATA.botanicalCategories).forEach(function(cat) {
      if (!presentCategories[cat]) missingCats.push(DATA.botanicalCategories[cat].nom);
    });

    return {
      valid: warnings.length === 0 && recipe.nom && recipe.nom.trim() && recipe.botanicals.length > 0,
      warnings: warnings,
      missingCategories: missingCats
    };
  }

  // --- Recipe Views ---
  var recettesList = document.getElementById('recettesList');
  var recettesDetail = document.getElementById('recettesDetail');
  var recettesEditor = document.getElementById('recettesEditor');
  var currentRecipeId = null;
  var editingRecipe = null;

  function showRecipeView(view) {
    if (recettesList) recettesList.style.display = view === 'list' ? '' : 'none';
    if (recettesDetail) recettesDetail.style.display = view === 'detail' ? '' : 'none';
    if (recettesEditor) recettesEditor.style.display = view === 'editor' ? '' : 'none';
  }

  function renderRecipeList(filter) {
    if (!document.getElementById('recipeGrid')) return;
    filter = filter || 'all';
    var recipes = getRecipes();
    var favs = getFavorites();

    if (filter === 'presets') recipes = recipes.filter(function(r) { return r.isPreset; });
    else if (filter === 'custom') recipes = recipes.filter(function(r) { return !r.isPreset; });
    else if (filter === 'favs') recipes = recipes.filter(function(r) { return favs.indexOf(r.id) !== -1; });

    var grid = document.getElementById('recipeGrid');
    if (recipes.length === 0) {
      grid.innerHTML = '<p class="empty-state">Aucune recette' + (filter === 'custom' ? ' personnalisee' : filter === 'favs' ? ' en favoris' : '') + '.</p>';
      return;
    }

    var html = '';
    recipes.forEach(function(r) {
      var fav = isFavorite(r.id);
      var totalBot = r.botanicals.length;
      html += '<div class="recipe-card ' + (r.isPreset ? 'preset' : 'custom') + '" data-recipe="' + r.id + '">' +
        '<div class="recipe-card-header">' +
        '<span class="recipe-card-name">' + escapeHtml(r.nom) + '</span>' +
        '<button class="recipe-card-fav' + (fav ? ' active' : '') + '" data-fav="' + r.id + '">' + (fav ? '&#9829;' : '&#9825;') + '</button>' +
        '</div>' +
        '<div class="recipe-style-badge">' + escapeHtml(r.style || '') + '</div>' +
        '<div class="recipe-card-desc">' + escapeHtml(r.description || '') + '</div>' +
        '<div class="recipe-card-meta"><span>' + totalBot + ' botaniques</span><span>' + (r.totalGPerL || 0).toFixed(1) + ' g/L</span></div>' +
        '</div>';
    });
    grid.innerHTML = html;

    // Click to detail
    grid.querySelectorAll('.recipe-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('.recipe-card-fav')) return;
        renderRecipeDetail(card.dataset.recipe);
        vibrate(10);
      });
    });

    // Fav toggle
    grid.querySelectorAll('.recipe-card-fav').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var nowFav = toggleFavorite(btn.dataset.fav);
        btn.innerHTML = nowFav ? '&#9829;' : '&#9825;';
        btn.classList.toggle('active', nowFav);
        vibrate(10);
        // Re-render if on favs filter
        var activePill = document.querySelector('.filter-pill.active');
        if (activePill && activePill.dataset.filter === 'favs') {
          renderRecipeList('favs');
        }
      });
    });
  }

  function renderFlavorBars(profil, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var cats = DATA.botanicalCategories;
    var html = '';
    Object.keys(cats).forEach(function(k) {
      var score = profil[k] || 0;
      var pct = (score / 5 * 100).toFixed(0);
      html += '<div class="flavor-bar">' +
        '<span class="flavor-bar-label">' + cats[k].nom + '</span>' +
        '<div class="flavor-bar-track"><div class="flavor-bar-fill bar-' + k + '" style="width:' + pct + '%"></div></div>' +
        '<span class="flavor-bar-score">' + Math.round(score) + '</span>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  function renderBotProportions(botanicals, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!botanicals || botanicals.length === 0) { el.innerHTML = ''; return; }
    var totalG = 0;
    botanicals.forEach(function(b) { totalG += b.gPerL; });
    if (totalG <= 0) { el.innerHTML = ''; return; }
    // Sort by gPerL descending
    var sorted = botanicals.slice().sort(function(a, b) { return b.gPerL - a.gPerL; });
    var html = '<div class="proportions-bars">';
    sorted.forEach(function(b) {
      var lib = getLibraryBotanical(b.id);
      var nom = lib ? lib.nom : b.id;
      var catColor = lib && DATA.botanicalCategories[lib.categorie] ? DATA.botanicalCategories[lib.categorie].color : '#888';
      var pct = (b.gPerL / totalG * 100);
      html += '<div class="proportion-row">' +
        '<span class="proportion-name" style="border-left:3px solid ' + catColor + '">' + nom + '</span>' +
        '<div class="proportion-track"><div class="proportion-fill" style="width:' + pct.toFixed(0) + '%;background:' + catColor + '"></div></div>' +
        '<span class="proportion-value">' + b.gPerL.toFixed(1) + ' <small>(' + pct.toFixed(0) + '%)</small></span>' +
        '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function renderWeightSummary(totalGPerL, nbBotanicals, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    // Zone optimale: 20-35 g/L
    var min = 15, low = 20, high = 35, max = 45;
    var pct = Math.min(100, Math.max(0, totalGPerL / max * 100));
    var status, statusClass;
    if (totalGPerL >= low && totalGPerL <= high) {
      status = 'Optimal';
      statusClass = 'weight-ok';
    } else if (totalGPerL >= min && totalGPerL < low) {
      status = 'Leger';
      statusClass = 'weight-warn';
    } else if (totalGPerL > high && totalGPerL <= max) {
      status = 'Charge';
      statusClass = 'weight-warn';
    } else if (totalGPerL < min) {
      status = 'Tres leger';
      statusClass = 'weight-bad';
    } else {
      status = 'Excessif';
      statusClass = 'weight-bad';
    }
    el.innerHTML = '<div class="weight-gauge">' +
      '<div class="weight-gauge-info">' +
        '<span class="weight-gauge-value">' + totalGPerL.toFixed(1) + ' g/L</span>' +
        '<span class="weight-gauge-meta">' + nbBotanicals + ' botaniques</span>' +
        '<span class="weight-gauge-status ' + statusClass + '">' + status + '</span>' +
      '</div>' +
      '<div class="weight-gauge-track">' +
        '<div class="weight-gauge-zone" style="left:' + (low/max*100).toFixed(0) + '%;width:' + ((high-low)/max*100).toFixed(0) + '%"></div>' +
        '<div class="weight-gauge-needle" style="left:' + pct.toFixed(0) + '%"></div>' +
      '</div>' +
      '<div class="weight-gauge-labels">' +
        '<span>' + min + '</span><span>' + low + '-' + high + ' g/L</span><span>' + max + '</span>' +
      '</div>' +
    '</div>';
  }

  function renderRecipeDetail(id) {
    currentRecipeId = id;
    var recipe = getRecipe(id);
    if (!recipe) return;

    showRecipeView('detail');
    document.getElementById('recipeDetailTitle').textContent = recipe.nom;
    document.getElementById('recipeDetailStyle').textContent = recipe.style || '';
    document.getElementById('recipeDetailDesc').textContent = recipe.description || '';
    document.getElementById('recipeDetailNotes').textContent = recipe.notes || '';

    var totalG = 0;
    recipe.botanicals.forEach(function(b) { totalG += b.gPerL; });
    renderWeightSummary(totalG, recipe.botanicals.length, 'recipeDetailSummary');
    renderFlavorBars(computeFlavorProfile(recipe.botanicals), 'recipeDetailFlavor');
    renderBotProportions(recipe.botanicals, 'recipeDetailProportions');
    renderRecipeTable(recipe, parseFloat(document.getElementById('recipeDetailVolume').value) || 600);

    // Actions
    var actionsHtml = '<button class="btn btn-outline btn-sm" id="exportRecipeBtn">Exporter</button>';
    actionsHtml += '<button class="btn btn-outline btn-sm" id="duplicateRecipeBtn">Dupliquer</button>';
    if (!recipe.isPreset) {
      actionsHtml += '<button class="btn btn-primary btn-sm" id="editRecipeBtn">Modifier</button>';
      actionsHtml += '<button class="btn btn-danger btn-sm" id="deleteRecipeBtn">Supprimer</button>';
    }
    document.getElementById('recipeDetailActions').innerHTML = actionsHtml;

    // Bind actions
    var expBtn = document.getElementById('exportRecipeBtn');
    if (expBtn) expBtn.addEventListener('click', function() {
      exportRecipe(id);
      vibrate(10);
    });
    var dupBtn = document.getElementById('duplicateRecipeBtn');
    if (dupBtn) dupBtn.addEventListener('click', function() {
      var copy = duplicateRecipe(id);
      if (copy) {
        renderRecipeDetail(copy.id);
        vibrate(15);
      }
    });
    var editBtn = document.getElementById('editRecipeBtn');
    if (editBtn) editBtn.addEventListener('click', function() {
      renderRecipeEditor(id);
      vibrate(10);
    });
    var delBtn = document.getElementById('deleteRecipeBtn');
    if (delBtn) delBtn.addEventListener('click', function() {
      if (confirm('Supprimer cette recette ?')) {
        deleteRecipeById(id);
        showRecipeView('list');
        renderRecipeList();
        vibrate(15);
      }
    });

    // Volume change
    document.getElementById('recipeDetailVolume').addEventListener('input', function() {
      renderRecipeTable(recipe, parseFloat(this.value) || 600);
    });
  }

  function renderRecipeTable(recipe, volume) {
    var tbody = document.getElementById('recipeDetailTable').querySelector('tbody');
    var html = '';
    var totalG = 0;
    var totalGPerL = 0;
    recipe.botanicals.forEach(function(b) {
      var lib = getLibraryBotanical(b.id);
      var nom = lib ? lib.nom : b.id;
      var prep = lib ? lib.preparation : '';
      var qty = b.gPerL * volume / 1000;
      totalG += qty;
      totalGPerL += b.gPerL;
      html += '<tr><td>' + nom + '</td><td>' + b.gPerL.toFixed(1) + '</td><td><strong>' + qty.toFixed(1) + ' g</strong></td><td>' + prep + '</td></tr>';
    });
    html += '<tr class="row-total"><td><strong>TOTAL</strong></td><td><strong>' + totalGPerL.toFixed(1) + '</strong></td><td><strong>' + totalG.toFixed(1) + ' g</strong></td><td></td></tr>';
    tbody.innerHTML = html;
  }

  // --- Recipe Editor ---
  function renderRecipeEditor(id) {
    showRecipeView('editor');
    document.getElementById('recipeEditorTitle').textContent = id ? 'Modifier la recette' : 'Nouvelle recette';

    if (id) {
      var src = getRecipe(id);
      editingRecipe = JSON.parse(JSON.stringify(src));
    } else {
      editingRecipe = {
        id: 'custom-' + Date.now(),
        nom: '',
        style: '',
        description: '',
        botanicals: [],
        totalGPerL: 0,
        profil: { conifere: 0, agrume: 0, floral: 0, epice: 0, herbe: 0, terreux: 0, fruit: 0 },
        notes: '',
        isPreset: false
      };
    }

    document.getElementById('recipeEditName').value = editingRecipe.nom || '';
    document.getElementById('recipeEditStyle').value = editingRecipe.style || '';
    document.getElementById('recipeEditDesc').value = editingRecipe.description || '';
    document.getElementById('recipeEditNotes').value = editingRecipe.notes || '';

    renderEditorPicker();
    updateEditorFlavor();
    updateEditorValidation();
  }

  function renderEditorProportions() {
    var container = document.getElementById('recipeEditProportions');
    if (!container) return;
    if (!editingRecipe || editingRecipe.botanicals.length === 0) {
      container.innerHTML = '<p class="empty-state">Selectionnez des botaniques ci-dessus.</p>';
      return;
    }
    var totalG = 0;
    editingRecipe.botanicals.forEach(function(b) { totalG += b.gPerL; });
    if (totalG <= 0) totalG = 1;
    var sorted = editingRecipe.botanicals.slice().sort(function(a, b) { return b.gPerL - a.gPerL; });
    var html = '<div class="proportions-bars">';
    sorted.forEach(function(b) {
      var lib = getLibraryBotanical(b.id);
      var nom = lib ? lib.nom : b.id;
      var catColor = lib && DATA.botanicalCategories[lib.categorie] ? DATA.botanicalCategories[lib.categorie].color : '#888';
      var pct = (b.gPerL / totalG * 100);
      var origIdx = editingRecipe.botanicals.indexOf(b);
      html += '<div class="proportion-row proportion-row-edit" style="border-left:3px solid ' + catColor + '">' +
        '<span class="proportion-name">' + nom + '</span>' +
        '<div class="proportion-track"><div class="proportion-fill" style="width:' + pct.toFixed(0) + '%;background:' + catColor + '"></div></div>' +
        '<div class="proportion-input"><input type="number" value="' + b.gPerL + '" min="0.05" max="30" step="0.1" data-bot-idx="' + origIdx + '"></div>' +
        '<span class="proportion-unit">g/L</span>' +
        '<button class="proportion-remove" data-remove-idx="' + origIdx + '">&times;</button>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;

    // Bind inputs
    container.querySelectorAll('input[data-bot-idx]').forEach(function(inp) {
      inp.addEventListener('input', function() {
        var idx = parseInt(inp.dataset.botIdx);
        editingRecipe.botanicals[idx].gPerL = parseFloat(inp.value) || 0;
        updateEditorFlavor();
        updateEditorValidation();
      });
    });

    // Bind remove
    container.querySelectorAll('[data-remove-idx]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.dataset.removeIdx);
        editingRecipe.botanicals.splice(idx, 1);
        renderEditorPicker();
        updateEditorFlavor();
        updateEditorValidation();
        vibrate(10);
      });
    });
  }

  function renderEditorPicker() {
    var container = document.getElementById('recipeEditPicker');
    var selectedIds = editingRecipe.botanicals.map(function(b) { return b.id; });
    var html = '';
    var currentCat = '';
    DATA.botanicalsLibrary.forEach(function(lib) {
      if (lib.categorie !== currentCat) {
        currentCat = lib.categorie;
        var catInfo = DATA.botanicalCategories[lib.categorie];
        var catColor = catInfo ? catInfo.color : '#888';
        var catName = catInfo ? catInfo.nom : currentCat;
        if (html) html += '</div>';
        html += '<div class="picker-group">' +
          '<div class="picker-group-header"><span class="picker-group-dot" style="background:' + catColor + '"></span>' + catName + '</div>' +
          '<div class="picker-group-chips">';
      }
      var isSelected = selectedIds.indexOf(lib.id) !== -1;
      var catColor = DATA.botanicalCategories[lib.categorie] ? DATA.botanicalCategories[lib.categorie].color : '#888';
      html += '<button class="botanical-chip' + (isSelected ? ' selected' : '') + '" data-bot-id="' + lib.id + '" style="border-left:3px solid ' + catColor + '">' +
        lib.nom + '</button>';
    });
    if (html) html += '</div></div>';
    container.innerHTML = html;

    container.querySelectorAll('.botanical-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var botId = chip.dataset.botId;
        var alreadySelected = editingRecipe.botanicals.some(function(b) { return b.id === botId; });
        if (alreadySelected) {
          // Remove
          editingRecipe.botanicals = editingRecipe.botanicals.filter(function(b) { return b.id !== botId; });
        } else {
          // Add with default
          var lib = getLibraryBotanical(botId);
          editingRecipe.botanicals.push({ id: botId, gPerL: lib ? lib.gPerLDefault : 1.0 });
        }
        renderEditorProportions();
        renderEditorPicker();
        updateEditorFlavor();
        updateEditorValidation();
        vibrate(5);
      });
    });
  }

  function updateEditorFlavor() {
    var profil = computeFlavorProfile(editingRecipe.botanicals);
    editingRecipe.profil = profil;
    var totalG = 0;
    editingRecipe.botanicals.forEach(function(b) { totalG += b.gPerL; });
    renderWeightSummary(totalG, editingRecipe.botanicals.length, 'recipeEditSummary');
    renderFlavorBars(profil, 'recipeEditFlavor');
    renderEditorProportions();
  }

  function updateEditorValidation() {
    editingRecipe.nom = document.getElementById('recipeEditName').value.trim();
    var totalG = 0;
    editingRecipe.botanicals.forEach(function(b) { totalG += b.gPerL; });
    editingRecipe.totalGPerL = Math.round(totalG * 10) / 10;

    var result = validateRecipe(editingRecipe);
    var el = document.getElementById('recipeValidation');
    var html = '';

    if (result.warnings.length === 0) {
      el.style.display = 'block';
      el.className = 'recipe-validation valid';
      html = 'Total : ' + editingRecipe.totalGPerL.toFixed(1) + ' g/L - ' + editingRecipe.botanicals.length + ' botaniques';
    } else {
      el.style.display = 'block';
      el.className = 'recipe-validation ' + (result.valid ? 'warning' : 'error');
      html = result.warnings.join(' | ');
    }

    // Show missing categories hint
    if (result.missingCategories.length > 0 && editingRecipe.botanicals.length > 0) {
      html += '<div class="validation-missing">Equilibre : ajoutez un ' +
        result.missingCategories.map(function(c) {
          return '<span class="missing-cat">' + c + '</span>';
        }).join(', ') + '</div>';
    }

    el.innerHTML = html;
  }

  // Editor bindings
  if (document.getElementById('recipeEditName')) {
    document.getElementById('recipeEditName').addEventListener('input', updateEditorValidation);
  }

  // Weight adjust
  var weightAdjustBtn = document.getElementById('weightAdjustBtn');
  if (weightAdjustBtn) {
    weightAdjustBtn.addEventListener('click', function() {
      if (!editingRecipe || editingRecipe.botanicals.length === 0) return;
      var target = parseFloat(document.getElementById('weightTargetInput').value) || 25;
      var currentTotal = 0;
      editingRecipe.botanicals.forEach(function(b) { currentTotal += b.gPerL; });
      if (currentTotal <= 0) return;
      var ratio = target / currentTotal;
      editingRecipe.botanicals.forEach(function(b) {
        var lib = getLibraryBotanical(b.id);
        var newVal = Math.round(b.gPerL * ratio * 10) / 10;
        // Clamp to library min/max if available
        if (lib) {
          newVal = Math.max(lib.gPerLMin, Math.min(lib.gPerLMax, newVal));
        }
        b.gPerL = Math.max(0.1, newVal);
      });
      updateEditorFlavor();
      updateEditorValidation();
      vibrate(10);
    });
  }

  // Save recipe
  var saveRecipeBtn = document.getElementById('saveRecipeBtn');
  if (saveRecipeBtn) {
    saveRecipeBtn.addEventListener('click', function() {
      editingRecipe.nom = document.getElementById('recipeEditName').value.trim();
      editingRecipe.style = document.getElementById('recipeEditStyle').value.trim();
      editingRecipe.description = document.getElementById('recipeEditDesc').value.trim();
      editingRecipe.notes = document.getElementById('recipeEditNotes').value.trim();

      var totalG = 0;
      editingRecipe.botanicals.forEach(function(b) { totalG += b.gPerL; });
      editingRecipe.totalGPerL = Math.round(totalG * 10) / 10;
      editingRecipe.profil = computeFlavorProfile(editingRecipe.botanicals);
      editingRecipe.isPreset = false;

      if (!editingRecipe.nom) { alert('Entrez un nom pour la recette.'); return; }
      if (editingRecipe.botanicals.length === 0) { alert('Ajoutez au moins un botanique.'); return; }

      saveRecipe(editingRecipe);
      renderRecipeDetail(editingRecipe.id);
      vibrate(15);
    });
  }

  // Cancel editor
  var cancelRecipeBtn = document.getElementById('cancelRecipeBtn');
  if (cancelRecipeBtn) {
    cancelRecipeBtn.addEventListener('click', function() {
      if (currentRecipeId) renderRecipeDetail(currentRecipeId);
      else { showRecipeView('list'); renderRecipeList(); }
    });
  }

  // Back from editor
  var backFromEditorBtn = document.getElementById('backFromEditorBtn');
  if (backFromEditorBtn) {
    backFromEditorBtn.addEventListener('click', function() {
      if (currentRecipeId) renderRecipeDetail(currentRecipeId);
      else { showRecipeView('list'); renderRecipeList(); }
    });
  }

  // New recipe button
  var newRecipeBtn = document.getElementById('newRecipeBtn');
  if (newRecipeBtn) {
    newRecipeBtn.addEventListener('click', function() {
      currentRecipeId = null;
      renderRecipeEditor(null);
      vibrate(10);
    });
  }

  // Import recipe
  var importRecipeBtn = document.getElementById('importRecipeBtn');
  var importRecipeFile = document.getElementById('importRecipeFile');
  if (importRecipeBtn && importRecipeFile) {
    importRecipeBtn.addEventListener('click', function() {
      importRecipeFile.click();
    });
    importRecipeFile.addEventListener('change', function() {
      if (importRecipeFile.files.length > 0) {
        importRecipeFromFile(importRecipeFile.files[0]);
        importRecipeFile.value = '';
      }
    });
  }

  // Back to list from detail
  var backToRecipeListBtn = document.getElementById('backToRecipeListBtn');
  if (backToRecipeListBtn) {
    backToRecipeListBtn.addEventListener('click', function() {
      currentRecipeId = null;
      showRecipeView('list');
      renderRecipeList();
      vibrate(5);
    });
  }

  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      pill.classList.add('active');
      renderRecipeList(pill.dataset.filter);
      vibrate(5);
    });
  });

  // Populate recipe selects
  function populateRecipeSelects() {
    var recipes = getRecipes();
    var selects = [
      document.getElementById('sessionRecipe'),
      document.getElementById('calcBotRecipe')
    ];
    selects.forEach(function(sel) {
      if (!sel) return;
      sel.innerHTML = '';
      recipes.forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.nom + ' (' + (r.totalGPerL || 0).toFixed(1) + ' g/L)';
        sel.appendChild(opt);
      });
    });
  }

  // Session recipe preview
  var sessionRecipe = document.getElementById('sessionRecipe');
  if (sessionRecipe) {
    sessionRecipe.addEventListener('change', function() {
      var recipe = getRecipe(sessionRecipe.value);
      var preview = document.getElementById('sessionRecipePreview');
      if (recipe && preview) {
        preview.textContent = recipe.botanicals.length + ' botaniques, ' + (recipe.totalGPerL || 0).toFixed(1) + ' g/L';
      }
    });
  }

  // Override new session button to populate selects
  var origNewSessionBtn = document.getElementById('newSessionBtn');
  if (origNewSessionBtn) {
    origNewSessionBtn.addEventListener('click', function() {
      populateRecipeSelects();
    });
  }

  // Init recipe page
  showRecipeView('list');
  renderRecipeList();
  populateRecipeSelects();
  // Trigger initial calc if present
  if (calcBotVol && calcBotRecipe) updateCalcBot();

  // ========== PWA ==========
  // Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').catch(function() {});
    });
  }

  // Install prompt
  var deferredPrompt = null;
  var installBanner = document.getElementById('installBanner');
  var installBtn = document.getElementById('installBtn');
  var installDismiss = document.getElementById('installDismiss');

  var installDismissedThisSession = false;
  // Clean up old permanent dismiss flag
  localStorage.removeItem('gin-install-dismissed');

  // Show manual install guide if not in standalone mode
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  var installGuide = document.getElementById('installGuide');
  if (installGuide && !isStandalone) {
    installGuide.style.display = '';
  }

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!installDismissedThisSession) {
      installBanner.classList.remove('hidden');
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function() {
          deferredPrompt = null;
          installBanner.classList.add('hidden');
        });
      }
    });
  }

  if (installDismiss) {
    installDismiss.addEventListener('click', function() {
      installBanner.classList.add('hidden');
      installDismissedThisSession = true;
    });
  }

  // ========== UTILITIES ==========
  function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '--';
    var parts = dateStr.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
    return dateStr;
  }

})();
