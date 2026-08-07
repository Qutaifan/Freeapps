/* QUTAIFAN site search — client-side only, no backend.
   Injects a search box into <nav>, fetches /search-index.json once,
   and filters by title/keywords/description as the user types. */
(function () {
  var STYLE =
    '.qf-search{position:relative;display:flex;align-items:center;margin-left:auto;margin-right:14px}' +
    '.qf-search input{width:150px;max-width:36vw;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);' +
    'border-radius:999px;color:#f4f4f5;font-size:.8rem;padding:7px 14px;font-family:inherit;transition:width .15s,border-color .15s}' +
    '.qf-search input:focus{outline:none;border-color:#06b6d4;width:220px}' +
    '.qf-search input::placeholder{color:#71717a}' +
    '.qf-results{position:absolute;top:calc(100% + 8px);right:0;width:300px;max-width:85vw;background:#111114;' +
    'border:1px solid rgba(255,255,255,.14);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.5);overflow:hidden;display:none;z-index:50}' +
    '.qf-results.qf-open{display:block}' +
    'a.qf-result{display:block;padding:12px 14px;color:#f4f4f5;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.08);font-size:.85rem}' +
    '.qf-result:last-child{border-bottom:none}' +
    '.qf-result:hover,.qf-result.qf-active{background:rgba(6,182,212,.14)}' +
    '.qf-result .qf-desc{display:block;color:#a1a1aa;font-size:.76rem;margin-top:2px;font-weight:400}' +
    '.qf-empty{padding:14px;color:#71717a;font-size:.82rem}' +
    '.qf-visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '@media(max-width:720px){.qf-search{margin-right:8px}.qf-search input{width:100px}.qf-search input:focus{width:160px}}';

  var INDEX_URL = '/search-index.json';
  var indexPromise = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL).then(function (r) { return r.json(); }).catch(function () { return []; });
    }
    return indexPromise;
  }

  function score(entry, q) {
    var s = 0;
    var title = entry.title.toLowerCase();
    var desc = (entry.description || '').toLowerCase();
    if (title.indexOf(q) !== -1) s += title.indexOf(q) === 0 ? 6 : 3;
    (entry.keywords || []).forEach(function (k) {
      if (k.toLowerCase().indexOf(q) !== -1) s += 2;
    });
    if (desc.indexOf(q) !== -1) s += 1;
    return s;
  }

  function render(results, root, q) {
    if (!q) { root.classList.remove('qf-open'); root.innerHTML = ''; return; }
    if (!results.length) {
      root.innerHTML = '<div class="qf-empty">No guides match "' + escapeHtml(q) + '"</div>';
      root.classList.add('qf-open');
      return;
    }
    root.innerHTML = results.slice(0, 6).map(function (r, i) {
      return '<a class="qf-result" role="option" data-idx="' + i + '" href="' + r.url + '">' +
        escapeHtml(r.title) +
        '<span class="qf-desc">' + escapeHtml(r.description || '') + '</span></a>';
    }).join('');
    root.classList.add('qf-open');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init() {
    var nav = document.querySelector('nav .wrap') || document.querySelector('nav');
    if (!nav || document.getElementById('qf-input')) return;

    var styleTag = document.createElement('style');
    styleTag.textContent = STYLE;
    document.head.appendChild(styleTag);

    var wrap = document.createElement('div');
    wrap.className = 'qf-search';
    wrap.innerHTML =
      '<label for="qf-input" class="qf-visually-hidden">Search guides</label>' +
      '<input type="search" id="qf-input" placeholder="Search guides…" autocomplete="off" ' +
      'aria-expanded="false" role="combobox" aria-controls="qf-results" aria-autocomplete="list">' +
      '<div class="qf-results" id="qf-results" role="listbox"></div>';
    nav.appendChild(wrap);

    var input = wrap.querySelector('#qf-input');
    var results = wrap.querySelector('#qf-results');
    var current = [];
    var activeIdx = -1;

    function setActive(idx) {
      var links = results.querySelectorAll('.qf-result');
      links.forEach(function (l) { l.classList.remove('qf-active'); });
      if (idx >= 0 && links[idx]) {
        links[idx].classList.add('qf-active');
        links[idx].scrollIntoView({ block: 'nearest' });
      }
      activeIdx = idx;
    }

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      activeIdx = -1;
      if (!q) { render([], results, ''); input.setAttribute('aria-expanded', 'false'); return; }
      loadIndex().then(function (all) {
        current = all
          .map(function (e) { return { entry: e, s: score(e, q) }; })
          .filter(function (x) { return x.s > 0; })
          .sort(function (a, b) { return b.s - a.s; })
          .map(function (x) { return x.entry; });
        render(current, results, q);
        input.setAttribute('aria-expanded', current.length ? 'true' : 'false');
      });
    });

    input.addEventListener('keydown', function (e) {
      var links = results.querySelectorAll('.qf-result');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (links.length) setActive((activeIdx + 1) % links.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (links.length) setActive((activeIdx - 1 + links.length) % links.length);
      } else if (e.key === 'Enter') {
        if (activeIdx >= 0 && links[activeIdx]) {
          window.location.href = links[activeIdx].getAttribute('href');
        } else if (links.length) {
          window.location.href = links[0].getAttribute('href');
        }
      } else if (e.key === 'Escape') {
        render([], results, '');
        input.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) render([], results, '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
