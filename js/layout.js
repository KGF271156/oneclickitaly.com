/* OneClick Italy – shared header, footer and English/Italian switch.
   Every page includes this script where the header should appear:
     <script src="js/layout.js"></script>        (pages in the main folder)
     <script src="../js/layout.js"></script>     (pages in /regions)
   and an empty <div id="site-footer"></div> where the footer goes.
   Change the menu or footer here once and every page updates.

   Language: the EN | IT switch in the header saves the visitor's choice.
   A link can force a language with ?lang=it or ?lang=en.
   Italian text lives in js/i18n-it.js (one dictionary for the whole site). */
(function () {
  var me = document.currentScript;
  var src = (me && me.getAttribute('src')) || 'js/layout.js';
  var ROOT = src.replace(/js\/layout\.js.*$/, '');   // "" or "../"
  window.OCI_ROOT = ROOT;

  /* ---------- language ---------- */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  var param = (location.search.match(/[?&]lang=(en|it)\b/) || [])[1];
  if (param) store('oci-lang', param);
  var LANG = param || store('oci-lang') || 'en';
  if (LANG !== 'it') LANG = 'en';
  window.OCI_LANG = LANG;
  document.documentElement.lang = LANG;

  // Translate a string (optionally a template with {0}, {1}...). English is the default.
  window.OCI_T = function (s) {
    var dict = window.OCI_DICT_IT;
    var out = (LANG === 'it' && dict && Object.prototype.hasOwnProperty.call(dict, s)) ? dict[s] : s;
    for (var i = 1; i < arguments.length; i++) out = out.split('{' + (i - 1) + '}').join(arguments[i]);
    return out;
  };
  var T = window.OCI_T;

  function setLang(l) {
    store('oci-lang', l);
    var url = location.href.replace(/([?&])lang=(en|it)&?/, '$1').replace(/[?&]$/, '');
    if (store('oci-lang') !== l) url += (url.indexOf('?') < 0 ? '?' : '&') + 'lang=' + l; // storage blocked: keep it in the URL
    location.href = url;
  }

  /* ---------- header & footer ---------- */
  var NAV = [
    ['regions/index.html', 'Regions'], ['culture.html', 'Culture'], ['live-italy.html', 'Live'],
    ['news.html', 'News'], ['food-drink.html', 'Food & Drink'], ['retail.html', 'Retail'],
    ['visit-italy.html', 'Visit Italy'], ['events.html', 'Events'], ['sport.html', 'Sport'],
    ['communities.html', 'Communities']
  ];
  var here = location.pathname.replace(/\/$/, '/index.html');
  function isActive(href) {
    if (href === 'regions/index.html') return /\/regions\//.test(here);
    if (href === 'news.html' && /news-region\.html$/.test(here)) return true;
    return here.slice(-href.length - 1) === '/' + href;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function links() {
    return NAV.map(function (n) {
      return '<a href="' + ROOT + n[0] + '"' + (isActive(n[0]) ? ' class="is-active" aria-current="page"' : '') + '>' + esc(T(n[1])) + '</a>';
    }).join('');
  }
  function langSwitch() {
    return '<div class="lang-switch" role="group" aria-label="' + esc(T('Language')) + '">' +
      '<button type="button" data-lang="en" aria-pressed="' + (LANG === 'en') + '" lang="en" title="English">EN</button>' +
      '<button type="button" data-lang="it" aria-pressed="' + (LANG === 'it') + '" lang="it" title="Italiano">IT</button>' +
      '</div>';
  }

  function headerHTML() {
    return '<header class="site-header">' +
      '<div class="header-row wrap">' +
      '<a href="' + ROOT + 'index.html" class="logo"><span class="mark"></span> OneClick Italy</a>' +
      '<nav class="main-nav" aria-label="Main">' + links() + '</nav>' +
      '<div class="header-actions">' +
      '<a href="' + ROOT + 'index.html#join" class="btn btn-outline">' + esc(T('Sign in')) + '</a>' +
      '<a href="' + ROOT + 'index.html#join" class="btn btn-primary">' + esc(T('Create my Italy')) + '</a>' +
      '</div>' + langSwitch() +
      '<button class="nav-toggle" aria-label="' + esc(T('Menu')) + '" aria-expanded="false" aria-controls="mobile-nav">&#9776;</button>' +
      '</div>' +
      '<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">' + links() + '</nav>' +
      '</header>';
  }
  function footerHTML() {
    return '<footer class="site-footer"><div class="wrap">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand"><a href="' + ROOT + 'index.html" class="logo"><span class="mark"></span> OneClick Italy</a>' +
      '<p>' + esc(T('A live digital window into every region, city and community of Italy.')) + '</p></div>' +
      '<div><h5>' + esc(T('Explore')) + '</h5><ul><li><a href="' + ROOT + 'regions/index.html">' + esc(T('Regions')) + '</a></li><li><a href="' + ROOT + 'news.html">' + esc(T('News')) + '</a></li><li><a href="' + ROOT + 'live-italy.html">' + esc(T('Live Italy')) + '</a></li></ul></div>' +
      '<div><h5>' + esc(T('Italy Abroad')) + '</h5><ul><li><a href="' + ROOT + 'culture.html">' + esc(T('Culture')) + '</a></li><li><a href="' + ROOT + 'communities.html">' + esc(T('Communities')) + '</a></li><li><a href="' + ROOT + 'events.html">' + esc(T('Events')) + '</a></li></ul></div>' +
      '<div><h5>' + esc(T('Plan a Visit')) + '</h5><ul><li><a href="' + ROOT + 'visit-italy.html">' + esc(T('Visit Italy')) + '</a></li><li><a href="' + ROOT + 'food-drink.html">' + esc(T('Food & Drink')) + '</a></li><li><a href="' + ROOT + 'retail.html">' + esc(T('Retail')) + '</a></li></ul></div>' +
      '</div>' +
      '<div class="footer-bottom"><span>&copy; ' + new Date().getFullYear() + ' OneClick Italy · <a href="mailto:info@oneclickitaly.com">info@oneclickitaly.com</a></span>' +
      '<span><a href="#">' + esc(T('Privacy')) + '</a> · <a href="#">' + esc(T('Terms')) + '</a></span></div>' +
      '</div></footer>';
  }

  /* ---------- translating the page's own text (Italian only) ---------- */
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1 };
  function trText(node) {
    var raw = node.nodeValue, key = raw.replace(/\s+/g, ' ').trim();
    if (!key) return;
    var t = T(key);
    if (t !== key) {
      var m = raw.match(/^(\s*)[\s\S]*?(\s*)$/);
      node.nodeValue = m[1] + t + m[2];
    }
  }
  function trAttrs(el) {
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (a) {
      var v = el.getAttribute && el.getAttribute(a);
      if (v) { var t = T(v.replace(/\s+/g, ' ').trim()); if (t !== v) el.setAttribute(a, t); }
    });
  }
  function translate(root) {
    if (!root) return;
    if (root.nodeType === 3) { trText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    trAttrs(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (n) { return n.nodeType === 1 && SKIP[n.nodeName] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var n, list = [];
    while ((n = walker.nextNode())) list.push(n);
    list.forEach(function (x) { if (x.nodeType === 3) trText(x); else trAttrs(x); });
  }
  function translatePage() {
    document.title = T(document.title.replace(/\s+/g, ' ').trim());
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', T(md.getAttribute('content')));
    translate(document.body);
    // Text added later by the page's scripts (news, regions) is translated as it appears.
    new MutationObserver(function (muts) {
      muts.forEach(function (m) { [].forEach.call(m.addedNodes, translate); });
    }).observe(document.body, { childList: true, subtree: true });
    document.documentElement.classList.remove('i18n-pending');
  }

  /* ---------- wiring ---------- */
  function mountFooter() {
    var slot = document.getElementById('site-footer');
    if (slot && !slot.firstChild) slot.outerHTML = footerHTML();
  }
  function wire() {
    var btn = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-nav');
    if (btn && menu && !btn.dataset.wired) {
      btn.dataset.wired = '1';
      btn.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    [].forEach.call(document.querySelectorAll('.lang-switch button'), function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('data-lang') !== LANG) setLang(b.getAttribute('data-lang')); });
    });
  }
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  window.OCI_LAYOUT = {
    header: function () {
      var s = document.currentScript;
      if (s) s.insertAdjacentHTML('beforebegin', headerHTML());
      wire();
      onReady(function () { mountFooter(); if (LANG === 'it') translatePage(); });
    }
  };

  if (LANG === 'it') {
    // Hide the page body (not the header) until it has been translated, to avoid a flash of English.
    document.documentElement.classList.add('i18n-pending');
    setTimeout(function () { document.documentElement.classList.remove('i18n-pending'); }, 2500);
    // Load the dictionary first, then draw the header in Italian at this exact spot.
    document.write('<script src="' + ROOT + 'js/i18n-it.js"><\/script><script>OCI_LAYOUT.header()<\/script>');
  } else {
    window.OCI_LAYOUT.header.call(null);
  }
})();
