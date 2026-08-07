/* QUTAIFAN guide TOC — builds from anchored headings (h2[id], h3[id]).
   "Jump to section" dropdown above the first section. Self-contained. */
(function () {
  var STYLE =
    '.qf-jump{display:block;margin:16px auto;max-width:680px;padding:0 24px}' +
    '.qf-jump select{width:100%;font-family:inherit;font-size:.85rem;color:#f4f4f5;background:#111114;' +
    'border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 12px}' +
    '.xlink-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin:18px 0}' +
    '.xlink-card{display:block;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:12px;' +
    'text-decoration:none;color:#f4f4f5}.xlink-card:hover{border-color:#06b6d4}' +
    '.xlink-card strong{display:block;margin-bottom:4px}.xlink-card span{color:#a1a1aa;font-size:.82rem}';
  var st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);

  var heads = Array.prototype.slice.call(document.querySelectorAll('h2[id], h3[id]'));
  if (heads.length < 3) return;

  var jump = document.createElement('div'); jump.className = 'qf-jump';
  var sel = document.createElement('select');
  sel.setAttribute('aria-label', 'Jump to section');
  sel.innerHTML = '<option value="">Jump to section…</option>';
  heads.forEach(function (h) {
    var t = h.textContent.replace(/\s+/g, ' ').trim();
    var o = document.createElement('option'); o.value = h.id; o.textContent = t;
    sel.appendChild(o);
  });
  sel.addEventListener('change', function () {
    if (this.value) document.getElementById(this.value).scrollIntoView({ behavior: 'smooth' });
  });
  jump.appendChild(sel);
  var firstH2 = document.querySelector('h2');
  if (firstH2) {
    var sec = firstH2.closest('section') || firstH2.closest('.section') || firstH2;
    sec.parentNode.insertBefore(jump, sec);
  }
})();
