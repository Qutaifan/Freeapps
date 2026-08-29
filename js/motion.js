/* ==========================================================================
   THEHUB — motion.js
   Drives the immersive layer defined in /css/motion.css.

   Dependency-free, deferred, and entirely progressive enhancement: the site is
   complete without it. It injects its own ambient markup rather than requiring
   changes to 180 hand-maintained HTML pages, and enhances existing components
   by selector.

   Performance notes, because this site is monetised and tracks Core Web Vitals:
     - all pointer work runs in one rAF loop, never in the event handler
     - listeners are passive; nothing here blocks scrolling
     - only transform / opacity / custom properties are written, so no effect
       in this file can cost CLS
     - tilt and magnetism are skipped on coarse pointers
     - the canvas stops when off-screen or the tab is hidden
     - the whole layer stands down under prefers-reduced-motion
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var supportsIO = 'IntersectionObserver' in window;

  /* Pointer state, read once per frame. */
  var px = 0.5, py = 0.4;      /* viewport-normalised pointer */
  var pxTarget = 0.5, pyTarget = 0.4;
  var field = null;
  var progress = null;
  var frameQueued = false;
  var lastClientWidth = -1;

  /* ----------------------------------------------------------------------
     Ambient field
     -------------------------------------------------------------------- */

  function buildField() {
    if (document.querySelector('.fx-field')) return;

    field = document.createElement('div');
    field.className = 'fx-field';
    field.setAttribute('aria-hidden', 'true');

    var parts = ['fx-grid', 'fx-grid fx-grid-fine',
                 'fx-aurora fx-aurora-1', 'fx-aurora fx-aurora-2', 'fx-aurora fx-aurora-3'];
    if (!reduced) parts.push('fx-scan');
    if (fine && !reduced) parts.push('fx-halo');
    parts.push('fx-vignette');

    parts.forEach(function (cls) {
      var el = document.createElement('div');
      el.className = cls;
      field.appendChild(el);
    });

    document.body.appendChild(field);

    /* Relocate the page's canvas into the field so it spans the viewport
       rather than the hero's column. Inserted before the vignette so the
       vignette still sits on top of it. */
    var canvas = document.getElementById('fx-canvas');
    if (canvas) {
      var vignette = field.querySelector('.fx-vignette');
      if (vignette) field.insertBefore(canvas, vignette);
      else field.appendChild(canvas);
    }

    progress = document.createElement('div');
    progress.className = 'fx-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
  }

  /* ----------------------------------------------------------------------
     Single render loop — every pointer/scroll driven property is written here
     -------------------------------------------------------------------- */

  function requestFrame() {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(render);
  }

  function render() {
    frameQueued = false;

    /* Ease the pointer so the halo trails rather than snapping. */
    px += (pxTarget - px) * 0.12;
    py += (pyTarget - py) * 0.12;

    if (field) {
      field.style.setProperty('--px', (px * 100).toFixed(2) + '%');
      field.style.setProperty('--py', (py * 100).toFixed(2) + '%');
    }

    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var s = scrollable > 0 ? Math.min(1, Math.max(0, doc.scrollTop / scrollable)) : 0;
    root.style.setProperty('--scroll', s.toFixed(4));

    /* Scrollbar-free viewport width for .fx-bleed — see the note in
       motion.css. clientWidth excludes the scrollbar; 100vw does not. */
    if (doc.clientWidth !== lastClientWidth) {
      lastClientWidth = doc.clientWidth;
      root.style.setProperty('--vw', lastClientWidth + 'px');
    }

    updateHeroProgress();

    /* Keep easing while the pointer is still catching up. */
    if (Math.abs(pxTarget - px) > 0.001 || Math.abs(pyTarget - py) > 0.001) requestFrame();
  }

  function onPointerMove(e) {
    pxTarget = e.clientX / window.innerWidth;
    pyTarget = e.clientY / window.innerHeight;
    requestFrame();
  }

  /* ----------------------------------------------------------------------
     Landing sequence

     The CSS beats (logo, headline, page) run on their own via animations
     scoped to html.is-intro — see motion.css. This function owns only the
     lifecycle: disarm it for readers who do not want motion, end it on the
     first sign of intent, and guarantee it ends at all.

     introT (0..1) is read by the canvas for the field burst, which is the one
     beat CSS cannot express.
     -------------------------------------------------------------------- */

  var INTRO_TOTAL = 2450;   /* ms until the class comes off on its own */
  var introActive = false;
  var introT = 0;
  var introClock = 0;

  /* Deliberate input only. A bare `scroll` listener is NOT safe here: browsers
     fire scroll on load when restoring a previous position, which would kill
     the sequence before it started. Scroll is handled separately below and
     only counts once the page has actually moved. */
  var INTRO_SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

  function onIntroScroll() {
    if (window.scrollY > 4) endIntro();
  }

  function endIntro() {
    if (!introActive) return;
    introActive = false;
    introT = 1;
    root.classList.remove('is-intro');
    root.classList.add('intro-done');
    INTRO_SKIP_EVENTS.forEach(function (ev) {
      window.removeEventListener(ev, endIntro);
    });
    window.removeEventListener('scroll', onIntroScroll);
  }

  function armIntro() {
    if (!root.classList.contains('is-intro')) return;

    /* Set BEFORE any early return: endIntro() guards on this flag, so calling
       it while the flag is still false makes it a no-op and leaves .is-intro
       stuck on the element. */
    introActive = true;
    introClock = now();

    /* Never hold a reader who has asked for less motion. */
    if (reduced) { endIntro(); return; }

    /* Any sign of intent ends it immediately. The CSS animations are
       fill-mode:both onto the natural state, so dropping the class mid-flight
       simply snaps everything to its normal appearance. */
    INTRO_SKIP_EVENTS.forEach(function (ev) {
      window.addEventListener(ev, endIntro, { passive: true, once: true });
    });
    window.addEventListener('scroll', onIntroScroll, { passive: true });

    /* A reader who lands already scrolled (a reload part-way down, a restored
       position) has no business being shown an opening sequence. */
    if (window.scrollY > 4) { endIntro(); return; }

    /* Hard stop. Even if every frame is dropped, the class comes off. */
    setTimeout(endIntro, INTRO_TOTAL);
  }

  function now() {
    return (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
  }

  /* ----------------------------------------------------------------------
     Brand mark

     THEHUB drawn as what it says it is: a core with satellites on spokes,
     inside two counter-rotating scan rings. It deliberately rhymes with the
     constellation field in the hero — same node-and-link vocabulary, same
     palette — so the logo reads as a small instance of the thing the site is.

     Authored here rather than in markup because the lockup appears on all 179
     pages. The original <img> stays in the DOM as the no-JS fallback and is
     only hidden once the SVG is in place, at identical dimensions, so the swap
     cannot shift layout.
     -------------------------------------------------------------------- */

  var HUB_MARK =
    '<svg class="brand-mark-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"' +
    ' aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#22D3EE" stop-opacity="0.55"/>' +
          '<stop offset="60%" stop-color="#22D3EE" stop-opacity="0.10"/>' +
          '<stop offset="100%" stop-color="#22D3EE" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<radialGradient id="hubCore" cx="38%" cy="34%" r="70%">' +
          '<stop offset="0%" stop-color="#E0F7FF"/>' +
          '<stop offset="45%" stop-color="#67E8F9"/>' +
          '<stop offset="100%" stop-color="#0EA5E9"/>' +
        '</radialGradient>' +
      '</defs>' +

      '<circle class="hub-glow" cx="24" cy="24" r="23" fill="url(#hubGlow)"/>' +

      /* Geometry is deliberately chunky. The lockup renders this at 34px, so
         one viewBox unit is ~0.7 CSS px: hairline strokes and fine dash
         patterns land on sub-pixels and turn to mush. Everything here is sized
         to survive that — thick strokes, few long dashes, no second ring
         outline, and satellites large enough to read as objects. */

      /* Outer scan ring — segmented, turns slowly clockwise. */
      '<g class="hub-ring hub-ring-outer">' +
        '<circle cx="24" cy="24" r="20.4" fill="none" stroke="#22D3EE" stroke-opacity="0.6"' +
        ' stroke-width="1.9" stroke-linecap="round" stroke-dasharray="30 11 6 11"/>' +
      '</g>' +

      /* The satellites, on their own counter-rotating orbit. No ring outline
         behind them — at this size it read as noise rather than an orbit. */
      '<g class="hub-ring hub-ring-mid">' +
        '<circle class="hub-node" cx="39.5"  cy="24"    r="2.5" fill="#67E8F9"/>' +
        '<circle class="hub-node" cx="31.75" cy="37.42" r="2"   fill="#38BDF8"/>' +
        '<circle class="hub-node" cx="16.25" cy="37.42" r="2.5" fill="#67E8F9"/>' +
        '<circle class="hub-node" cx="8.5"   cy="24"    r="2"   fill="#38BDF8"/>' +
        '<circle class="hub-node" cx="16.25" cy="10.58" r="2.5" fill="#67E8F9"/>' +
        '<circle class="hub-node" cx="31.75" cy="10.58" r="2"   fill="#38BDF8"/>' +
      '</g>' +

      /* Spokes — the links out of the core, lit in sequence on hover. */
      '<g class="hub-spokes" stroke="#22D3EE" stroke-width="1.8" stroke-linecap="round">' +
        '<line class="hub-spoke" x1="31.5"  y1="24"    x2="36.4"  y2="24"/>' +
        '<line class="hub-spoke" x1="27.75" y1="30.5"  x2="30.2"  y2="34.74"/>' +
        '<line class="hub-spoke" x1="20.25" y1="30.5"  x2="17.8"  y2="34.74"/>' +
        '<line class="hub-spoke" x1="16.5"  y1="24"    x2="11.6"  y2="24"/>' +
        '<line class="hub-spoke" x1="20.25" y1="17.5"  x2="17.8"  y2="13.26"/>' +
        '<line class="hub-spoke" x1="27.75" y1="17.5"  x2="30.2"  y2="13.26"/>' +
      '</g>' +

      /* Core. */
      '<circle class="hub-core-halo" cx="24" cy="24" r="8.8" fill="none"' +
      ' stroke="#22D3EE" stroke-opacity="0.45" stroke-width="1.4"/>' +
      '<circle class="hub-core" cx="24" cy="24" r="5.6" fill="url(#hubCore)"/>' +
    '</svg>';

  function enhanceBrand() {
    var lockups = document.querySelectorAll('.brand-lockup');
    for (var i = 0; i < lockups.length; i++) {
      var lockup = lockups[i];
      if (lockup.querySelector('.brand-mark-svg')) continue;

      var img = lockup.querySelector('.brand-mark');
      if (!img) continue;

      var slot = document.createElement('span');
      slot.className = 'brand-mark-slot';
      slot.innerHTML = HUB_MARK;

      img.parentNode.insertBefore(slot, img);
      /* Kept in the DOM, not removed: with scripting off the original mark is
         what renders. Hidden only now that its replacement is in place. */
      img.hidden = true;

      lockup.classList.add('has-svg-mark');
    }
  }

  /* ----------------------------------------------------------------------
     Hero scroll descent

     Pins the hero for a short travel and reports 0..1 progress as --hero.
     Pinning is opt-in per viewport: the stage is only made sticky when the
     composition measurably fits, because a sticky stage taller than the
     viewport clips whatever overflows with no way to scroll to it. Short
     desktop windows and in-app phone browsers are exactly that case, so they
     keep the hero in normal flow and lose nothing but the parallax.
     -------------------------------------------------------------------- */

  var heroTrack = null;
  var heroStage = null;
  var heroP = 0;   /* 0..1 descent progress, also drives the canvas camera */

  /* Height the composition needs, measured from layout rather than from
     getBoundingClientRect: rects include transforms, and these children are
     transformed every frame, so a rect would feed the parallax back into its
     own fit test. offsetTop/offsetHeight are layout and cannot be poisoned. */
  function heroContentHeight() {
    if (!heroStage) return 0;
    var top = null, bottom = null;
    var kids = heroStage.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el.tagName === 'CANVAS' || el.classList.contains('hero-hud')) continue;
      if (!el.offsetHeight) continue;
      var t = el.offsetTop, b = t + el.offsetHeight;
      if (top === null || t < top) top = t;
      if (bottom === null || b > bottom) bottom = b;
    }
    return top === null ? 0 : bottom - top;
  }

  function evaluateHeroPin() {
    if (!heroTrack || !heroStage) return;

    if (reduced) { heroTrack.classList.remove('is-pinned'); return; }

    /* Measure unpinned, so the sticky stage's own min-height can't inflate
       the reading and make the fit test self-fulfilling. */
    var wasPinned = heroTrack.classList.contains('is-pinned');
    if (wasPinned) heroTrack.classList.remove('is-pinned');
    var need = heroContentHeight();
    var have = window.innerHeight;

    /* Headroom for the floating navbar plus the scroll cue. If it does not
       clear that, the hero stays in flow. */
    var fits = need > 0 && (need + 150) <= have;
    if (fits) heroTrack.classList.add('is-pinned');
    else heroTrack.classList.remove('is-pinned');
  }

  function updateHeroProgress() {
    if (!heroTrack) return;
    if (!heroTrack.classList.contains('is-pinned')) {
      /* Unpinned: the camera still advances, just driven by how far the hero
         has scrolled out of view rather than by a dedicated track. */
      var h = window.innerHeight || 1;
      heroP = Math.min(1, Math.max(0, window.scrollY / h));
      root.style.setProperty('--hero', '0');
      root.style.setProperty('--hero-exit', '0');
      root.style.setProperty('--hud', '0');
      root.style.setProperty('--field', heroP.toFixed(4));
      return;
    }
    /* offsetTop/offsetHeight again — the track itself is untransformed, but
       staying on layout metrics keeps this immune to any future transform. */
    var start = heroTrack.offsetTop;
    var travel = heroTrack.offsetHeight - window.innerHeight;
    if (travel <= 0) { root.style.setProperty('--hero', '0'); return; }

    var p = (window.scrollY - start) / travel;
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    heroP = p;

    root.style.setProperty('--hero', p.toFixed(4));
    root.style.setProperty('--field', p.toFixed(4));
    root.style.setProperty('--hud', Math.min(1, p * 1.6).toFixed(4));

    /* Only the last 22% dims the stage, and only as the reader leaves it. */
    var exit = p < 0.78 ? 0 : (p - 0.78) / 0.22;
    root.style.setProperty('--hero-exit', exit.toFixed(4));
  }

  function armHeroScroll() {
    heroTrack = document.querySelector('.hero-scroll-track');
    if (!heroTrack) return;
    heroStage = heroTrack.querySelector('.hero-immersive');
    if (!heroStage) { heroTrack = null; return; }

    evaluateHeroPin();
    updateHeroProgress();
    window.addEventListener('resize', debounce(function () {
      evaluateHeroPin();
      updateHeroProgress();
    }, 180), { passive: true });
  }

  /* ----------------------------------------------------------------------
     Floating cards
     -------------------------------------------------------------------- */

  var CARD_SELECTOR = [
    '.bento-card', '.card', '.pair-card', '.related-card',
    '.category-chip-card', '.hero-stats-strip', '.code-install-block',
    '.tool-card', '.pick-card', '.game-card', '.distro-card',
    '[data-fx-card]'
  ].join(',');

  var MAX_CARDS = 400;   /* the largest pillar page carries a lot of them */
  var TILT = 5.5;        /* degrees at the card's edge */

  function enhanceCards() {
    var cards = document.querySelectorAll(CARD_SELECTOR);
    var n = Math.min(cards.length, MAX_CARDS);

    for (var i = 0; i < n; i++) {
      var card = cards[i];
      if (card.classList.contains('fx-card')) continue;
      card.classList.add('fx-card');

      /* Real elements rather than pseudo-elements: several page-specific
         stylesheets already use ::before / ::after on these classes. */
      if (fine && !reduced) {
        var sheen = document.createElement('span');
        sheen.className = 'fx-sheen';
        sheen.setAttribute('aria-hidden', 'true');
        card.appendChild(sheen);

        var edge = document.createElement('span');
        edge.className = 'fx-edge';
        edge.setAttribute('aria-hidden', 'true');
        card.appendChild(edge);

        card.addEventListener('pointermove', onCardMove, { passive: true });
        card.addEventListener('pointerleave', onCardLeave, { passive: true });
      }
    }
  }

  var pendingCard = null;
  var cardEvent = null;

  function onCardMove(e) {
    pendingCard = e.currentTarget;
    cardEvent = e;
    if (!cardFrameQueued) {
      cardFrameQueued = true;
      requestAnimationFrame(applyCard);
    }
  }

  var cardFrameQueued = false;

  function applyCard() {
    cardFrameQueued = false;
    if (!pendingCard || !cardEvent) return;

    var card = pendingCard;
    var rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var x = (cardEvent.clientX - rect.left) / rect.width;
    var y = (cardEvent.clientY - rect.top) / rect.height;

    card.style.setProperty('--mx', (x * 100).toFixed(2) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(2) + '%');
    card.style.setProperty('--ry', ((x - 0.5) * 2 * TILT).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((0.5 - y) * 2 * TILT).toFixed(2) + 'deg');
    card.classList.add('is-tilting');
  }

  function onCardLeave(e) {
    var card = e.currentTarget;
    card.classList.remove('is-tilting');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    if (pendingCard === card) pendingCard = null;
  }

  /* ----------------------------------------------------------------------
     Magnetic controls
     -------------------------------------------------------------------- */

  var MAGNET_SELECTOR = '.btn-accent, .btn-secondary-hero, .btn-link, [data-fx-magnetic]';
  var MAGNET_PULL = 0.32;
  var MAGNET_MAX = 9;

  function enhanceMagnets() {
    if (!fine || reduced) return;
    var els = document.querySelectorAll(MAGNET_SELECTOR);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.classList.contains('fx-magnetic')) continue;
      el.classList.add('fx-magnetic');
      el.addEventListener('pointermove', onMagnetMove, { passive: true });
      el.addEventListener('pointerleave', onMagnetLeave, { passive: true });
    }
  }

  function onMagnetMove(e) {
    var el = e.currentTarget;
    var rect = el.getBoundingClientRect();
    var dx = (e.clientX - (rect.left + rect.width / 2)) * MAGNET_PULL;
    var dy = (e.clientY - (rect.top + rect.height / 2)) * MAGNET_PULL;
    dx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx));
    dy = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy));
    el.style.setProperty('--dx', dx.toFixed(1) + 'px');
    el.style.setProperty('--dy', dy.toFixed(1) + 'px');
    el.classList.add('is-pulled');
  }

  function onMagnetLeave(e) {
    var el = e.currentTarget;
    el.classList.remove('is-pulled');
    el.style.setProperty('--dx', '0px');
    el.style.setProperty('--dy', '0px');
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     -------------------------------------------------------------------- */

  var REVEAL_SELECTOR = [
    '[data-reveal]',
    '.bento-card', '.card', '.pair-card', '.related-card',
    '.faq-item', '.table-wrap', '.section-header-quiet',
    '.hero-stats-strip', '.category-chip-card'
  ].join(',');

  function armReveals() {
    var els = document.querySelectorAll(REVEAL_SELECTOR);
    if (!els.length) return;

    /* Ad units are never animated: they must occupy their reserved height
       from first paint (AGENTS.md §5). */
    var list = [];
    for (var i = 0; i < els.length; i++) {
      if (els[i].closest('.ad-slot-container, .adsbygoogle')) continue;
      list.push(els[i]);
    }

    if (!supportsIO || reduced) {
      list.forEach(function (el) { el.classList.add('fx-reveal', 'is-in'); });
      return;
    }

    /* Stagger index resets per parent so each group cascades on its own. */
    var lastParent = null, idx = 0;
    list.forEach(function (el) {
      if (el.parentElement !== lastParent) { lastParent = el.parentElement; idx = 0; }
      el.style.setProperty('--i', Math.min(idx++, 8));
      el.classList.add('fx-reveal');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    list.forEach(function (el) { io.observe(el); });

    /* Failsafe: nothing stays hidden if the observer never fires. */
    setTimeout(function () {
      list.forEach(function (el) { el.classList.add('is-in'); });
    }, 3000);
  }

  /* ----------------------------------------------------------------------
     Kinetic headline
     -------------------------------------------------------------------- */

  function splitKinetic() {
    var targets = document.querySelectorAll('[data-kinetic]');
    for (var t = 0; t < targets.length; t++) {
      var el = targets[t];
      if (el.classList.contains('fx-kinetic')) continue;
      el.classList.add('fx-kinetic');
      wrapWords(el);

      /* Start immediately — the headline is above the fold and usually the
         LCP element; waiting for an observer would delay it for no benefit.
         The class is added synchronously after a forced reflow rather than in
         a rAF callback: the words sit at translateY(105%) until `is-in` lands,
         so anything that can starve rAF would leave the headline clipped out
         of view. Reading offsetWidth flushes the initial state so the
         transition still plays. */
      void el.offsetWidth;
      el.classList.add('is-in');
    }
  }

  function wrapWords(el) {
    var index = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var texts = [];
    var node;
    while ((node = walker.nextNode())) texts.push(node);

    texts.forEach(function (textNode) {
      if (!textNode.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      var words = textNode.nodeValue.split(/(\s+)/);

      words.forEach(function (word) {
        if (!word) return;
        if (!word.trim()) { frag.appendChild(document.createTextNode(word)); return; }
        var mask = document.createElement('span');
        mask.className = 'fx-word-mask';
        var inner = document.createElement('span');
        inner.className = 'fx-word';
        inner.style.setProperty('--i', index++);
        inner.textContent = word;
        mask.appendChild(inner);
        frag.appendChild(mask);
      });

      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  /* ----------------------------------------------------------------------
     Counters
     -------------------------------------------------------------------- */

  function armCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    if (!supportsIO || reduced) {
      for (var i = 0; i < els.length; i++) els[i].textContent = format(els[i]);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    for (var j = 0; j < els.length; j++) { els[j].classList.add('fx-count'); io.observe(els[j]); }
  }

  function format(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    return (el.getAttribute('data-prefix') || '') + target + (el.getAttribute('data-suffix') || '');
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1100;
    var start = null;
    var done = false;

    function settle() {
      if (done) return;
      done = true;
      el.textContent = prefix + target + suffix;
    }

    function step(ts) {
      if (done) return;
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step); else settle();
    }
    requestAnimationFrame(step);

    /* A throttled tab runs rAF at roughly 1fps, which would leave a counter
       parked on a wrong-looking number. Snap to the real value regardless. */
    setTimeout(settle, dur + 600);
  }

  /* ----------------------------------------------------------------------
     Ticker — duplicates its own children so the marquee loops seamlessly
     -------------------------------------------------------------------- */

  function armTickers() {
    var tracks = document.querySelectorAll('.fx-ticker-track');
    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      if (track.dataset.fxCloned) continue;
      track.dataset.fxCloned = '1';
      var html = track.innerHTML;
      track.innerHTML = html + html;
    }
  }

  /* ----------------------------------------------------------------------
     Table overflow guard

     Several pages put a wide comparison table straight into a plain container.
     At 390px that pushes the whole document sideways — measured at 209px on
     the AI pillar page, and 24px there even before this redesign. Rather than
     hunt them page by page, any table without a scrollable ancestor gets one.
     -------------------------------------------------------------------- */

  function wrapTables() {
    var tables = document.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (table.closest('.table-wrap, .table-scroll, .content-table-wrap')) continue;

      /* Respect any existing scroll container the page already provides. */
      var scrollable = false;
      var p = table.parentElement;
      while (p && p !== document.body) {
        var ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll') { scrollable = true; break; }
        p = p.parentElement;
      }
      if (scrollable) continue;

      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    }
  }

  /* ----------------------------------------------------------------------
     Constellation canvas — homepage hero
     -------------------------------------------------------------------- */

  function armCanvas() {
    var canvas = document.getElementById('fx-canvas');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var nodes = [];
    var running = false;
    var rafId = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    /* The field has depth: nodes carry a z, and scrolling advances a camera
       through them. Travelling into the field rather than watching it drift
       past is what makes the opening read as a descent rather than a
       screensaver. */
    var NEAR = 0.22;        /* nearest z the camera renders */
    var SPAN = 2.30;        /* depth of the slab; nodes wrap within it */
    var TRAVEL = 1.55;      /* how far a full scroll of the track moves us */
    var LINK_DIST = 128;    /* link threshold, in projected screen px */

    function seed() {
      /* Density by area, hard-capped so a wide monitor does not pay for it. */
      var count = Math.min(150, Math.round((w * h) / 9000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        /* Sampled as an annulus around the view axis, never a filled disc.
           A node near the plane's origin projects to the vanishing point at
           every depth, so uniform x/y sampling parks a permanent bright knot
           dead centre — directly on top of the headline. Holding every node
           off the axis keeps the centre of the composition clear. */
        var ang = Math.random() * Math.PI * 2;
        var rad = 0.42 + Math.random() * 1.05;
        nodes.push({
          x: Math.cos(ang) * rad,
          y: Math.sin(ang) * rad * 0.72,   /* flattened: screens are landscape */
          z: NEAR + Math.random() * SPAN,
          d: Math.random() * 0.5 + 0.75    /* per-node size variation */
        });
      }
    }

    var proj = [];
    var t0 = now();

    /* --- the field burst (beat 3) -------------------------------------
       Held back until the logo and headline have landed, then: the nodes are
       flung from a tight knot out past the edges, and as that peaks the camera
       rushes forward so the field streams in toward the reader and fills the
       screen. It arrives at exactly the resting state the rest of the page
       uses, so there is no seam between the intro and normal behaviour.       */
    var BURST_DELAY = 1000;   /* ms after boot before the field moves */
    var BURST_DUR   = 1050;   /* ms for the whole burst-and-arrive     */

    function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function frame(ts) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      var tNow = ts || now();
      var secs = (tNow - t0) / 1000;

      /* Burst progress. Once the intro is over this pins at 1 and every term
         below collapses to its resting value. */
      var radial = 1, camBurst = 0, burstAlpha = 1;
      if (introActive) {
        var bt = (tNow - introClock - BURST_DELAY) / BURST_DUR;
        bt = bt < 0 ? 0 : (bt > 1 ? 1 : bt);
        introT = bt;

        if (bt <= 0) {
          /* Still on the logo and headline: field held collapsed and dark. */
          radial = 0.06; burstAlpha = 0;
        } else if (bt < 0.42) {
          /* Scatter: a hard shove outward, past where it will settle. */
          var e = easeOutExpo(bt / 0.42);
          radial = 0.06 + (1.72 - 0.06) * e;
          burstAlpha = Math.min(1, bt / 0.10);
        } else {
          /* Arrive: eases back from the overshoot while the camera runs
             forward, so the field reads as coming toward the reader. */
          var k = (bt - 0.42) / 0.58;
          radial = 1.72 + (1 - 1.72) * easeInOutCubic(k);
          camBurst = easeOutCubic(k) * 1.15;
          burstAlpha = 1;
        }
      }

      /* Camera: scroll is the driver, plus a slow autopilot so the field is
         alive even when the reader is not moving, plus the intro's rush. */
      var cam = heroP * TRAVEL + secs * 0.045 + camBurst;

      /* Pointer parallax — shifts the vanishing point, not the nodes, so the
         whole field reacts as one body. */
      var focal = Math.min(w, h) * 0.62;
      var cx = w / 2 + (px - 0.5) * w * 0.07;
      var cy = h / 2 + (py - 0.5) * h * 0.07;

      proj.length = 0;

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var z = n.z - cam;
        /* Wrap within the slab so the field never runs out. */
        z = ((z - NEAR) % SPAN + SPAN) % SPAN + NEAR;

        var s = focal / z;
        var sx = cx + n.x * radial * s;
        var sy = cy + n.y * radial * s;

        /* Fade in from the back, fade out as it sweeps past the camera, so
           nodes never pop into or out of existence. */
        var aIn  = Math.min(1, (NEAR + SPAN - z) / 0.75);
        var aOut = Math.min(1, (z - NEAR) / 0.30);
        var alpha = Math.max(0, Math.min(1, Math.min(aIn, aOut))) * burstAlpha;
        if (alpha <= 0.01) continue;
        if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) continue;

        var r = Math.max(0.5, Math.min(2.8, s * 0.0042 * n.d));
        proj.push({ x: sx, y: sy, a: alpha, r: r });

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(103, 232, 249, ' + (0.62 * alpha).toFixed(3) + ')';
        ctx.fill();
      }

      /* The linking pass is O(n^2). Now that the field runs behind the whole
         page rather than just the hero, skip it once CSS has dimmed the
         canvas far enough that the links are no longer legible — the drifting
         points still read, at a fraction of the cost. */
      if (heroP > 0.72) { rafId = requestAnimationFrame(frame); return; }

      for (var a = 0; a < proj.length; a++) {
        for (var b = a + 1; b < proj.length; b++) {
          var dx = proj[a].x - proj[b].x;
          var dy = proj[a].y - proj[b].y;
          var d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          var d = Math.sqrt(d2);
          var la = 0.22 * (1 - d / LINK_DIST) * Math.min(proj[a].a, proj[b].a);
          ctx.beginPath();
          ctx.moveTo(proj[a].x, proj[a].y);
          ctx.lineTo(proj[b].x, proj[b].y);
          ctx.strokeStyle = 'rgba(34, 211, 238, ' + la.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(frame);
    }

    function start() { if (running) return; running = true; rafId = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    resize();
    window.addEventListener('resize', debounce(resize, 200), { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    /* The canvas is fixed and full-viewport now, so it is always on screen
       and an IntersectionObserver would only ever report "visible". A hidden
       tab is the only case worth stopping for, and visibilitychange covers
       it. Below the hero the field is dimmed by CSS rather than halted, so it
       keeps drifting behind the page. */
    start();
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  /* ----------------------------------------------------------------------
     Boot
     -------------------------------------------------------------------- */

  function init() {
    /* Set synchronously, not from the rAF loop: .fx-bleed reads --vw, and a
       throttled or starved rAF would leave it on the 100vw fallback that
       includes the scrollbar. */
    root.style.setProperty('--vw', document.documentElement.clientWidth + 'px');
    lastClientWidth = document.documentElement.clientWidth;

    armIntro();
    buildField();
    enhanceBrand();
    wrapTables();
    armHeroScroll();
    splitKinetic();
    enhanceCards();
    enhanceMagnets();
    armReveals();
    armCounters();
    armTickers();
    armCanvas();

    if (fine && !reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame, { passive: true });
    requestFrame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
