/* QUTAIFAN site search & Spotlight Modal — client-side only, no backend.
   Supports ⌘K / Ctrl+K shortcut overlay, keyboard navigation, and live search. */
(function () {
  var INDEX_URL = '/search-index.json';
  var indexPromise = null;
  var searchModalOverlay = null;
  var searchModalInput = null;
  var searchModalResults = null;
  var selectedIndex = -1;
  var currentResults = [];

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL)
        .then(function (r) { return r.json(); })
        .catch(function () { return []; });
    }
    return indexPromise;
  }

  function score(entry, q) {
    var s = 0;
    var title = (entry.title || '').toLowerCase();
    var desc = (entry.description || '').toLowerCase();
    if (title.indexOf(q) !== -1) s += title.indexOf(q) === 0 ? 6 : 3;
    (entry.keywords || []).forEach(function (k) {
      if (k.toLowerCase().indexOf(q) !== -1) s += 2;
    });
    if (desc.indexOf(q) !== -1) s += 1;
    return s;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function openSpotlightModal() {
    if (!searchModalOverlay) createSpotlightModal();
    searchModalOverlay.classList.add('open');
    searchModalOverlay.setAttribute('aria-hidden', 'false');
    searchModalInput.value = '';
    searchModalInput.focus();
    renderModalResults([], '');
  }

  function closeSpotlightModal() {
    if (!searchModalOverlay) return;
    searchModalOverlay.classList.remove('open');
    searchModalOverlay.setAttribute('aria-hidden', 'true');
  }

  function createSpotlightModal() {
    searchModalOverlay = document.createElement('div');
    searchModalOverlay.id = 'search-modal-overlay';
    searchModalOverlay.className = 'search-modal-overlay';
    searchModalOverlay.setAttribute('aria-hidden', 'true');

    searchModalOverlay.innerHTML =
      '<div class="search-modal-container" role="dialog" aria-modal="true" aria-label="Spotlight Search">' +
        '<div class="search-modal-header">' +
          '<span style="font-family:var(--font-mono);color:var(--accent-cyan);font-weight:700">🔍</span>' +
          '<input type="text" id="search-modal-input" placeholder="Search 142+ free tools, open-source apps & guides..." autocomplete="off">' +
          '<span class="search-modal-kbd">ESC</span>' +
        '</div>' +
        '<div class="search-modal-results" id="search-modal-results"></div>' +
        '<div class="search-modal-footer">' +
          '<span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>' +
          '<span><kbd>↵</kbd> Open Link</span>' +
          '<span><kbd>ESC</kbd> Close</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(searchModalOverlay);

    searchModalInput = searchModalOverlay.querySelector('#search-modal-input');
    searchModalResults = searchModalOverlay.querySelector('#search-modal-results');

    // Backdrop click to close
    searchModalOverlay.addEventListener('click', function (e) {
      if (e.target === searchModalOverlay) {
        closeSpotlightModal();
      }
    });

    // Input typing listener
    searchModalInput.addEventListener('input', function () {
      var q = searchModalInput.value.trim().toLowerCase();
      selectedIndex = -1;
      if (!q) {
        renderModalResults([], '');
        return;
      }
      loadIndex().then(function (all) {
        currentResults = all
          .map(function (e) { return { entry: e, s: score(e, q) }; })
          .filter(function (x) { return x.s > 0; })
          .sort(function (a, b) { return b.s - a.s; })
          .map(function (x) { return x.entry; });
        renderModalResults(currentResults, q);
      });
    });

    // Modal keyboard navigation
    searchModalInput.addEventListener('keydown', function (e) {
      var items = searchModalResults.querySelectorAll('.search-result-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length) {
          selectedIndex = (selectedIndex + 1) % items.length;
          updateActiveResult(items);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length) {
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          updateActiveResult(items);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          window.location.href = items[selectedIndex].getAttribute('href');
        } else if (items.length) {
          window.location.href = items[0].getAttribute('href');
        }
      } else if (e.key === 'Escape') {
        closeSpotlightModal();
      }
    });
  }

  function updateActiveResult(items) {
    items.forEach(function (el) { el.classList.remove('active'); });
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].classList.add('active');
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function renderModalResults(results, q) {
    if (!q) {
      searchModalResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem">Type to search tools, guides, and categories...</div>';
      return;
    }
    if (!results.length) {
      searchModalResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.88rem">No results match "' + escapeHtml(q) + '"</div>';
      return;
    }
    searchModalResults.innerHTML = results.slice(0, 8).map(function (r, idx) {
      var activeClass = idx === selectedIndex ? ' active' : '';
      return '<a class="search-result-item' + activeClass + '" href="' + r.url + '">' +
        '<div>' +
          '<strong class="search-result-title">' + escapeHtml(r.title) + '</strong>' +
          '<span class="search-result-desc">' + escapeHtml(r.description || '') + '</span>' +
        '</div>' +
        '<span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent-cyan);background:rgba(34,211,238,0.1);padding:2px 8px;border-radius:4px">View →</span>' +
      '</a>';
    }).join('');
  }

  function init() {
    // Global ⌘K / Ctrl+K keyboard shortcut
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (searchModalOverlay && searchModalOverlay.classList.contains('open')) {
          closeSpotlightModal();
        } else {
          openSpotlightModal();
        }
      } else if (e.key === 'Escape' && searchModalOverlay && searchModalOverlay.classList.contains('open')) {
        closeSpotlightModal();
      }
    });

    // Attach trigger button handler if present
    var searchTriggerBtn = document.getElementById('search-trigger');
    if (searchTriggerBtn) {
      searchTriggerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openSpotlightModal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global helper
  window.openTHEHUBSearch = openSpotlightModal;
})();
