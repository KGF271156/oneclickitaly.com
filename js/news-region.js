/* OneClick Italy – regional news page: news-region.html?r=<slug>
   Lead headline, then local stories split into News, What's On, Sport,
   Discover and Community. One page serves all 20 regions. */
(function () {
  var N = window.OCINews, esc = N.esc;
  var root = document.getElementById('region-news-root');
  if (!root) return;

  var slug = (new URLSearchParams(location.search).get('r') || '').toLowerCase();
  var reg = N.REGIONS.filter(function (r) { return r[0] === slug; })[0];
  if (!reg) { location.replace('news.html'); return; }
  var name = reg[1];
  document.title = name + ' news | OneClick Italy';

  root.innerHTML =
    '<div class="crumb wrap"><a href="index.html">Home</a> / <a href="news.html">News</a> / ' + esc(name) + '</div>' +
    '<section class="hero hero--compact"><div class="wrap">' +
      '<div class="hero__eyebrow-flag">LOCAL NEWS</div>' +
      '<h1 class="region-title">' + esc(name) + ' <em>today.</em></h1>' +
      '<p class="hero__tagline">Local stories from ' + esc(name) + ', gathered from Italian sources and summarised in English.</p>' +
      '<div class="btn-row"><a class="btn btn--primary" href="regions/' + slug + '.html">Explore ' + esc(name) + ': map, places, festivals →</a></div>' +
    '</div></section>' +
    '<section class="section"><div class="wrap"><div id="lead-story"><div class="empty-note">Loading the latest headline…</div></div></div></section>' +
    '<section class="section section--tint region-tabs-section" id="sections"><div class="wrap">' +
      '<div class="tabs" role="tablist" aria-label="' + esc(name) + ' news sections">' +
        N.TABS.map(function (t, i) {
          return '<button class="tab" role="tab" id="tab-' + t[0] + '" aria-controls="panel-' + t[0] + '" aria-selected="' + (i === 0) + '" tabindex="' + (i ? -1 : 0) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
        }).join('') +
      '</div>' +
      N.TABS.map(function (t, i) {
        return '<div class="tab-panel" role="tabpanel" id="panel-' + t[0] + '" aria-labelledby="tab-' + t[0] + '"' + (i ? ' hidden' : '') + '></div>';
      }).join('') +
    '</div></section>';

  N.load(slug).then(function (stories) {
    var lead = document.getElementById('lead-story');
    if (!stories.length) {
      lead.innerHTML = '<div class="empty-note">Local news for ' + esc(name) + ' is coming soon. We\'re switching on regions one at a time. In the meantime, <a href="regions/' + slug + '.html">explore ' + esc(name) + '</a> or read the <a href="news.html">national headlines</a>.</div>';
    } else {
      var s = stories[0], url = N.safeUrl(s.link);
      lead.innerHTML = '<div class="eyebrow">Top story</div><article class="lead-story">' +
        '<h2>' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' : '') + esc(s.title_en || s.title) + (url ? '</a>' : '') + '</h2>' +
        (s.summary_en ? '<p>' + esc(s.summary_en) + '</p>' : '') +
        '<div class="story__meta">' + [s.category, s.source, N.when(s.date)].filter(Boolean).map(esc).join(' · ') + '</div></article>';
    }
    N.TABS.forEach(function (t) {
      var list = stories.filter(function (st) { return N.tabFor(st.category) === t[0]; }).slice(0, 12);
      document.getElementById('panel-' + t[0]).innerHTML = list.length
        ? '<div class="story-list">' + list.map(function (st) { return N.storyHTML(st); }).join('') + '</div>'
        : '<div class="empty-note">' + (stories.length ? 'No ' + esc(t[1]) + ' stories from ' + esc(name) + ' just now. The feed updates twice a day.' : 'Coming soon.') + '</div>';
    });
    wireTabs();
  });

  function wireTabs() {
    var btns = [].slice.call(root.querySelectorAll('.tab'));
    function show(id, focus) {
      if (!btns.some(function (b) { return b.getAttribute('data-tab') === id; })) id = 'news';
      btns.forEach(function (b) {
        var on = b.getAttribute('data-tab') === id;
        b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
        document.getElementById('panel-' + b.getAttribute('data-tab')).hidden = !on;
        if (on && focus) b.focus();
      });
    }
    function go(id, focus) { history.replaceState(null, '', location.pathname + location.search + '#' + id); show(id, focus); }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { go(b.getAttribute('data-tab')); });
      b.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? (i + 1) % btns.length : e.key === 'ArrowLeft' ? (i - 1 + btns.length) % btns.length : -1;
        if (j < 0) return; e.preventDefault(); go(btns[j].getAttribute('data-tab'), true);
      });
    });
    var h = location.hash.replace('#', '');
    if (h) { show(h); document.getElementById('sections').scrollIntoView(); }
  }
})();
