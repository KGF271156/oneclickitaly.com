/* OneClick Italy – region page (Regions header).
   Everything about a region in one place: summary, what it's famous for,
   map of the main towns, photos, festivals, places of interest, food, sport,
   and its people abroad. Local NEWS lives on news-region.html?r=<slug>.

   A region page is a thin shell:
     <body data-region="sicily" data-page="region">   (regions/sicily.html)
     <main id="region-root"></main>
   Content comes from data/regions/<slug>.json.
   To add a region: write its JSON and copy sicily.html, changing data-region. */
(function () {
  var ROOT = window.OCI_ROOT || '../';
  var N = window.OCINews;
  var esc = N.esc;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var body = document.body;
  var slug = body.getAttribute('data-region');
  var root = document.getElementById('region-root');
  if (!slug || !root) return;

  // Old guide address (sicily-guide.html) now lives on the region page itself.
  if (body.getAttribute('data-page') === 'guide') {
    location.replace(slug + '.html' + location.hash);
    return;
  }

  fetch(ROOT + 'data/regions/' + slug + '.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (R) { document.title = R.name + ' | OneClick Italy'; render(R); })
    .catch(function () {
      root.innerHTML = '<section class="section"><div class="wrap"><p>Sorry, this region could not be loaded. Please try again shortly.</p></div></section>';
    });

  function adj(R) { return R.adjective || R.name; }
  function newsURL() { return ROOT + 'news-region.html?r=' + slug; }
  function photoURL(file, w) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=' + (w || 800);
  }
  function head(eyebrow, title, id) {
    return '<div class="section-head"' + (id ? ' id="' + id + '"' : '') + '><div><div class="eyebrow">' + eyebrow + '</div><h2>' + title + '</h2></div></div>';
  }
  function cards(list, withWhere) {
    return '<div class="card-grid">' + list.map(function (p) {
      return '<div class="card">' + (withWhere && p.where ? '<div class="eyebrow">' + esc(p.where) + '</div>' : '') +
        '<h3>' + esc(p.name || p.title) + '</h3><p>' + esc(p.text) + '</p></div>';
    }).join('') + '</div>';
  }

  function render(R) {
    var M = R.map || { towns: [] };
    var stats = (R.stats || []).map(function (s) { return '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>'; }).join('');
    var summary = (R.summary || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var festivals = (R.festivals || []).slice().sort(function (a, b) { return a.month - b.month; });
    var thisMonth = new Date().getMonth() + 1;
    var photos = (R.photos || []).map(function (ph) {
      var page = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(ph.file);
      return '<figure class="photo"><div class="photo__img"><img loading="lazy" src="' + photoURL(ph.file, 900) + '" alt="' + esc(ph.caption) + '" onerror="this.parentNode.classList.add(\'is-missing\');this.remove()"></div>' +
        '<figcaption>' + esc(ph.caption) + ' <a href="' + page + '" target="_blank" rel="noopener">Photo: Wikimedia Commons</a></figcaption></figure>';
    }).join('');
    var S = R.sport || {}, C = R.community || {};

    root.innerHTML =
      '<div class="crumb wrap"><a href="' + ROOT + 'index.html">Home</a> / <a href="index.html">Regions</a> / ' + esc(R.name) + '</div>' +

      '<section class="hero"><div class="wrap">' +
        '<div class="hero__eyebrow-flag">' + esc(R.eyebrow).toUpperCase() + '</div>' +
        '<h1 class="region-title">' + esc(R.title) + ' <em>' + esc(R.title_em) + '</em></h1>' +
        '<p class="hero__tagline">' + esc(R.tagline) + '</p>' +
        '<div class="stat-row">' + stats + '</div>' +
      '</div></section>' +

      '<nav class="region-jump wrap" aria-label="On this page">' +
        '<a href="#about">About</a><a href="#map">Map</a><a href="#photos">Photos</a><a href="#festivals">Festivals</a><a href="#places">Places</a><a href="#abroad">' + esc(adj(R)) + 's abroad</a>' +
        '<a class="region-jump__news" href="' + newsURL() + '">' + esc(R.name) + ' news →</a>' +
      '</nav>' +

      '<section class="section" id="about"><div class="wrap">' +
        '<div class="region-about">' +
          '<div><div class="eyebrow">About ' + esc(R.name) + '</div>' + summary +
            '<div class="btn-row"><a class="btn btn--primary" href="' + newsURL() + '">Latest ' + esc(R.name) + ' news →</a>' +
            '<a class="btn btn--outline" href="' + ROOT + 'visit-italy.html">Plan a trip</a></div></div>' +
          '<div><h3 class="sub-head" style="margin-top:0;">What ' + esc(R.name) + ' is famous for</h3>' +
            '<ul class="famous-list">' + (R.famous_for || []).map(function (f) {
              return '<li><strong>' + esc(f.title) + '</strong> ' + esc(f.text) + '</li>';
            }).join('') + '</ul></div>' +
        '</div>' +
      '</div></section>' +

      '<section class="section section--tint" id="map"><div class="wrap">' + head('Map', 'The main towns') +
        '<div class="guide-map">' +
          '<div class="guide-map__svg" data-map></div>' +
          '<div><ul class="town-list">' + (M.towns || []).map(function (t, i) {
            return '<li data-i="' + i + '"><strong>' + esc(t.name) + '</strong>' + (t.capital ? ' <span class="badge">Capital</span>' : '') + '<br><span>' + esc(t.note) + '</span></li>';
          }).join('') + '</ul>' +
          '<p class="town-info" id="town-info" aria-live="polite">Tap a town on the map to learn more.</p></div>' +
        '</div>' +
      '</div></section>' +

      (photos ? '<section class="section" id="photos"><div class="wrap">' + head('Photos', esc(R.name) + ' in pictures') +
        '<div class="photo-grid">' + photos + '</div></div></section>' : '') +

      '<section class="section section--tint" id="festivals"><div class="wrap">' + head('Festivals', 'The ' + esc(adj(R)) + ' year') +
        '<p class="panel-note" style="margin:-12px 0 20px;">Dates shift from year to year, so check locally before you travel. Local event news is on the <a href="' + newsURL() + '#whats-on">' + esc(R.name) + ' What\'s On</a> page.</p>' +
        '<ul class="fest-list">' + festivals.map(function (f) {
          var soon = ((f.month - thisMonth + 12) % 12) <= 2;
          return '<li class="fest' + (soon ? ' fest--soon' : '') + '">' +
            '<div class="fest__month"><span>' + MONTHS[f.month - 1].slice(0, 3) + '</span></div>' +
            '<div><h3>' + esc(f.name) + (soon ? ' <span class="badge">Coming up</span>' : '') +
            (f.diaspora ? ' <span class="badge badge--abroad">Celebrated abroad</span>' : '') + '</h3>' +
            '<div class="fest__where">' + esc(f.where) + ' · ' + esc(f.when) + '</div>' +
            '<p>' + esc(f.text) + '</p></div></li>';
        }).join('') + '</ul>' +
      '</div></section>' +

      '<section class="section" id="places"><div class="wrap">' + head('Places of interest', 'Worth the journey') +
        cards(R.places || [], true) +
        '<h3 class="sub-head">Food and drink to try</h3>' +
        '<div class="chip-list">' + (R.food || []).map(function (f) { return '<span class="chip">' + esc(f) + '</span>'; }).join('') + '</div>' +
        (S.clubs && S.clubs.length ? '<h3 class="sub-head">Local sport</h3><p class="panel-note" style="margin-bottom:16px;">' + esc(S.intro || '') + '</p>' +
          '<div class="card-grid card-grid--4">' + S.clubs.map(function (c) {
            return '<div class="card"><div class="eyebrow">' + esc(c.sport) + '</div><h3>' + esc(c.name) + '</h3><p>' + esc(c.ground) + '</p></div>';
          }).join('') + '</div>' : '') +
      '</div></section>' +

      '<section class="section section--dark" id="abroad"><div class="wrap">' + head(esc(adj(R)) + 's abroad', 'Roots and branches') +
        '<p style="max-width:70ch;color:rgba(251,243,231,0.85);">' + esc(C.intro || '') + ' ' + esc(R.ancestry || '') + '</p>' +
        '<div class="btn-row"><a class="btn btn--primary btn--paper" href="' + ROOT + 'communities.html">Find ' + esc(adj(R)) + ' communities abroad →</a>' +
        '<a class="btn btn--outline btn--light" href="https://antenati.cultura.gov.it/" target="_blank" rel="noopener">Search records on Portale Antenati</a></div>' +
      '</div></section>';

    drawMap(R, root.querySelector('[data-map]'));
    [].forEach.call(root.querySelectorAll('.town-list li'), function (li) {
      li.addEventListener('click', function () {
        var g = root.querySelector('.town[data-i="' + li.getAttribute('data-i') + '"]');
        if (g) g.dispatchEvent(new Event('click'));
      });
    });
    if (location.hash) setTimeout(function () {
      var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView();
    }, 60);
  }

  /* ---------- map of main towns ---------- */
  function drawMap(R, holder) {
    if (!holder || !R.map) return;
    var M = R.map;
    fetch(ROOT + 'assets/italy-map.svg').then(function (r) { return r.text(); }).then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      var p = doc.getElementById(slug);
      if (!p) return;
      function X(lon) { return M.x0 + (lon - M.lon0) * M.pxPerLon; }
      function Y(lat) { return M.y0 + (M.lat0 - lat) * M.pxPerLat; }
      var vb = M.viewBox.split(' ').map(Number);
      var k = vb[2] / 200;
      var towns = (M.towns || []).map(function (t, i) {
        var x = X(t.lon), y = Y(t.lat), left = t.label === 'left';
        return '<g class="town' + (t.capital ? ' town--capital' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(t.name) + '">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + ((t.capital ? 2.6 : 1.9) * k).toFixed(2) + '"/>' +
          '<text x="' + (left ? x - 3 * k : x + 3 * k).toFixed(1) + '" y="' + (y - 2.2 * k).toFixed(1) + '" font-size="' + (5.2 * k).toFixed(2) + '"' + (left ? ' text-anchor="end"' : '') + '>' + esc(t.name) + '</text></g>';
      }).join('');
      var labels = (M.labels || []).map(function (l) {
        return '<text class="map-label map-label--' + l.kind + '" x="' + X(l.lon).toFixed(1) + '" y="' + Y(l.lat).toFixed(1) + '" font-size="' + (4.5 * k).toFixed(2) + '">' + (l.kind === 'peak' ? '▲ ' : '') + esc(l.text) + '</text>';
      }).join('');
      holder.innerHTML = '<svg viewBox="' + M.viewBox + '" role="img" aria-label="Map of ' + esc(R.name) + ' showing its main towns">' +
        '<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" class="map-sea"/>' +
        '<path class="map-land" d="' + p.getAttribute('d') + '"/>' + labels + towns + '</svg>';
      var info = document.getElementById('town-info');
      [].forEach.call(holder.querySelectorAll('.town'), function (g) {
        function pick() {
          var i = g.getAttribute('data-i'), t = M.towns[+i];
          [].forEach.call(holder.querySelectorAll('.town'), function (o) { o.classList.toggle('is-active', o === g); });
          [].forEach.call(document.querySelectorAll('.town-list li'), function (o) { o.classList.toggle('is-active', o.getAttribute('data-i') === i); });
          if (info) info.innerHTML = '<strong>' + esc(t.name) + '</strong> ' + esc(t.note);
        }
        g.addEventListener('click', pick);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    });
  }
})();
