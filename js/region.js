/* OneClick Italy – region template.
   A region page is a thin shell:
     <body data-region="sicily" data-page="region">   (regions/sicily.html)
     <body data-region="sicily" data-page="guide">    (regions/sicily-guide.html)
     <main id="region-root"></main>
   Content comes from data/regions/<slug>.json and news from data/news/<slug>.json.
   To add a region: write its JSON, copy the two shell files, change data-region. */
(function () {
  var ROOT = window.OCI_ROOT || '../';
  var N = window.OCINews;
  var esc = N.esc;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var body = document.body;
  var slug = body.getAttribute('data-region');
  var page = body.getAttribute('data-page') || 'region';
  var root = document.getElementById('region-root');
  if (!slug || !root) return;

  fetch(ROOT + 'data/regions/' + slug + '.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (R) {
      document.title = (page === 'guide' ? R.name + ' guide' : R.name) + ' | OneClick Italy';
      if (page === 'guide') renderGuide(R); else renderRegion(R);
    })
    .catch(function () {
      root.innerHTML = '<section class="section"><div class="wrap"><p>Sorry, this region could not be loaded. Please try again shortly.</p></div></section>';
    });

  /* ---------- shared bits ---------- */
  function crumb(R, extra) {
    return '<div class="crumb wrap"><a href="' + ROOT + 'index.html">Home</a> / <a href="index.html">Regions</a> / ' +
      (extra ? '<a href="' + slug + '.html">' + esc(R.name) + '</a> / ' + extra : esc(R.name)) + '</div>';
  }
  function hero(R, small) {
    var stats = (R.stats || []).map(function (s) { return '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>'; }).join('');
    return '<section class="hero' + (small ? ' hero--compact' : '') + '"><div class="wrap">' +
      '<div class="hero__eyebrow-flag">' + esc(R.eyebrow).toUpperCase() + '</div>' +
      '<h1 class="region-title">' + esc(small ? 'Your guide to ' + R.name : R.title) +
      (small ? '' : ' <em>' + esc(R.title_em) + '</em>') + '</h1>' +
      '<p class="hero__tagline">' + esc(R.tagline) + '</p>' +
      (small ? '' : '<div class="stat-row">' + stats + '</div>') +
      '</div></section>';
  }
  function photoURL(file, w) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=' + (w || 800);
  }
  function festivalsFrom(R, startMonth) {
    var list = (R.festivals || []).slice();
    var m0 = startMonth || 1;
    list.sort(function (a, b) { return ((a.month - m0 + 12) % 12) - ((b.month - m0 + 12) % 12); });
    return list;
  }
  function festivalHTML(f, soon) {
    return '<li class="fest' + (soon ? ' fest--soon' : '') + '">' +
      '<div class="fest__month"><span>' + MONTHS[f.month - 1].slice(0, 3) + '</span></div>' +
      '<div><h3>' + esc(f.name) + (soon ? ' <span class="badge">Coming up</span>' : '') +
      (f.diaspora ? ' <span class="badge badge--abroad">Celebrated abroad</span>' : '') + '</h3>' +
      '<div class="fest__where">' + esc(f.where) + ' · ' + esc(f.when) + '</div>' +
      '<p>' + esc(f.text) + '</p></div></li>';
  }

  /* ---------- region page ---------- */
  function renderRegion(R) {
    var summary = (R.summary || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var tabs = [['news', 'News'], ['whats-on', "What's On"], ['sport', 'Sport'], ['discover', 'Discover'], ['community', 'Community']];

    root.innerHTML = crumb(R) + hero(R) +
      '<section class="section region-intro"><div class="wrap region-intro__grid">' +
        '<div class="region-intro__text"><div class="eyebrow">About ' + esc(R.name) + '</div>' + summary +
          '<div class="btn-row"><a class="btn btn--primary" href="' + slug + '-guide.html">Open the ' + esc(R.name) + ' guide →</a>' +
          '<a class="btn btn--outline" href="#news">Latest news</a></div></div>' +
        '<a class="region-intro__map" href="' + slug + '-guide.html#map" aria-label="Map of ' + esc(R.name) + ' in the guide"><div class="mini-map" data-mini-map></div><span>Main towns map →</span></a>' +
      '</div></section>' +
      '<section class="section section--tint region-tabs-section"><div class="wrap">' +
        '<div class="tabs" role="tablist" aria-label="' + esc(R.name) + ' sections">' +
          tabs.map(function (t, i) {
            return '<button class="tab" role="tab" id="tab-' + t[0] + '" aria-controls="panel-' + t[0] + '" aria-selected="' + (i === 0) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
          }).join('') +
        '</div>' +
        tabs.map(function (t, i) {
          return '<div class="tab-panel" role="tabpanel" id="panel-' + t[0] + '" aria-labelledby="tab-' + t[0] + '"' + (i ? ' hidden' : '') + '></div>';
        }).join('') +
      '</div></section>';

    drawMap(R, root.querySelector('[data-mini-map]'), true);
    fillWhatsOn(R); fillDiscover(R); fillCommunity(R);
    N.load(slug).then(function (stories) { fillNews(R, stories); fillSport(R, stories); });
    wireTabs();
  }

  function wireTabs() {
    var btns = [].slice.call(root.querySelectorAll('.tab'));
    function show(id, focus) {
      var found = btns.some(function (b) { return b.getAttribute('data-tab') === id; });
      if (!found) id = 'news';
      btns.forEach(function (b) {
        var on = b.getAttribute('data-tab') === id;
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
        document.getElementById('panel-' + b.getAttribute('data-tab')).hidden = !on;
        if (on && focus) b.focus();
      });
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-tab');
        history.replaceState(null, '', '#' + id);
        show(id);
      });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = i;
        if (k === 'ArrowRight') j = (i + 1) % btns.length;
        else if (k === 'ArrowLeft') j = (i - 1 + btns.length) % btns.length;
        else return;
        e.preventDefault();
        var id = btns[j].getAttribute('data-tab');
        history.replaceState(null, '', '#' + id);
        show(id, true);
      });
    });
    function fromHash() {
      var h = location.hash.replace('#', '');
      if (h) {
        show(h);
        var sec = root.querySelector('.region-tabs-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  function fillNews(R, stories) {
    var el = document.getElementById('panel-news');
    var top = stories.slice(0, 12);
    el.innerHTML = '<div class="panel-head"><h2>Latest from ' + esc(R.name) + '</h2>' +
      '<p class="panel-note">Gathered from Italian news sources and summarised in English. Tap a headline to read the full story.</p></div>' +
      (top.length
        ? '<div class="story-list">' + top.map(function (s) { return N.storyHTML(s); }).join('') + '</div>'
        : '<div class="empty-note">The first ' + esc(R.name) + ' stories are on their way. The news feed updates twice a day.</div>') +
      '<p class="panel-foot"><a href="' + ROOT + 'news.html">All Italy news →</a></p>';
  }

  function fillSport(R, stories) {
    var el = document.getElementById('panel-sport');
    var S = R.sport || {};
    var sportNews = stories.filter(function (s) { return /sport/i.test(s.category || ''); }).slice(0, 6);
    el.innerHTML = '<div class="panel-head"><h2>' + esc(R.name) + ' sport</h2><p class="panel-note">' + esc(S.intro || '') + '</p></div>' +
      '<div class="card-grid card-grid--4">' + (S.clubs || []).map(function (c) {
        return '<div class="card"><div class="eyebrow">' + esc(c.sport) + '</div><h3>' + esc(c.name) + '</h3><p>' + esc(c.ground) + '</p></div>';
      }).join('') + '</div>' +
      '<h3 class="sub-head">Latest sport headlines</h3>' +
      (sportNews.length ? '<div class="story-list">' + sportNews.map(function (s) { return N.storyHTML(s); }).join('') + '</div>'
        : '<div class="empty-note">No ' + esc(R.name) + ' sport stories in the feed yet.</div>') +
      '<p class="panel-foot"><a href="' + ROOT + 'sport.html">National and international sport →</a></p>';
  }

  function fillWhatsOn(R) {
    var el = document.getElementById('panel-whats-on');
    var m = new Date().getMonth() + 1;
    var list = festivalsFrom(R, m);
    el.innerHTML = '<div class="panel-head"><h2>What\'s on in ' + esc(R.name) + '</h2>' +
      '<p class="panel-note">The year\'s big festivals, starting with the next ones. Dates shift from year to year, so check locally before you travel.</p></div>' +
      '<ul class="fest-list">' + list.map(function (f) {
        var ahead = (f.month - m + 12) % 12;
        return festivalHTML(f, ahead <= 2);
      }).join('') + '</ul>' +
      '<p class="panel-foot"><a href="' + ROOT + 'events.html">Italian events near you, worldwide →</a></p>';
  }

  function fillDiscover(R) {
    var el = document.getElementById('panel-discover');
    el.innerHTML = '<div class="panel-head"><h2>Discover ' + esc(R.name) + '</h2>' +
      '<p class="panel-note">The places worth the journey. The full guide has the map, photos and more.</p></div>' +
      '<div class="card-grid">' + (R.places || []).slice(0, 6).map(function (p) {
        return '<div class="card"><div class="eyebrow">' + esc(p.where) + '</div><h3>' + esc(p.name) + '</h3><p>' + esc(p.text) + '</p></div>';
      }).join('') + '</div>' +
      '<h3 class="sub-head">On the ' + esc(R.adjective || R.name) + ' table</h3>' +
      '<div class="chip-list">' + (R.food || []).map(function (f) { return '<span class="chip">' + esc(f) + '</span>'; }).join('') + '</div>' +
      '<p class="panel-foot"><a class="btn btn--primary" href="' + slug + '-guide.html">Open the full ' + esc(R.name) + ' guide →</a></p>';
  }

  function fillCommunity(R) {
    var el = document.getElementById('panel-community');
    var C = R.community || {};
    var mail = 'mailto:info@oneclickitaly.com?subject=' + encodeURIComponent(R.name + ' community listing');
    el.innerHTML = '<div class="panel-head"><h2>' + esc(R.name) + ' around the world</h2><p class="panel-note">' + esc(C.intro || '') + '</p></div>' +
      '<div class="card-grid">' + (C.places || []).map(function (p) {
        return '<div class="card"><h3>' + esc(p.where) + '</h3><p>' + esc(p.text) + '</p></div>';
      }).join('') + '</div>' +
      '<div class="cta-box"><p>' + esc(C.cta || '') + '</p><a class="btn btn--primary" href="' + mail + '">List your group</a></div>' +
      (R.ancestry ? '<div class="ancestry-note"><strong>Family history:</strong> ' + esc(R.ancestry) +
        ' <a href="https://antenati.cultura.gov.it/" target="_blank" rel="noopener">Open Portale Antenati →</a></div>' : '') +
      '<p class="panel-foot"><a href="' + ROOT + 'communities.html">All Italian communities →</a></p>';
  }

  /* ---------- map ---------- */
  function drawMap(R, holder, mini) {
    if (!holder || !R.map) return;
    var M = R.map;
    fetch(ROOT + 'assets/italy-map.svg').then(function (r) { return r.text(); }).then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      var p = doc.getElementById(slug);
      if (!p) return;
      function X(lon) { return M.x0 + (lon - M.lon0) * M.pxPerLon; }
      function Y(lat) { return M.y0 + (M.lat0 - lat) * M.pxPerLat; }
      var vb = M.viewBox.split(' ').map(Number);
      var k = vb[2] / 200; // scale markers to the viewBox
      var towns = (M.towns || []).map(function (t, i) {
        var x = X(t.lon), y = Y(t.lat);
        return '<g class="town' + (t.capital ? ' town--capital' : '') + '" data-i="' + i + '" tabindex="' + (mini ? -1 : 0) + '" role="' + (mini ? 'presentation' : 'button') + '" aria-label="' + esc(t.name) + '">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + ((t.capital ? 2.6 : 1.9) * k).toFixed(2) + '"/>' +
          (mini ? '' : '<text x="' + (t.label === 'left' ? x - 3 * k : x + 3 * k).toFixed(1) + '" y="' + (y - 2.2 * k).toFixed(1) + '" font-size="' + (5.2 * k).toFixed(2) + '"' + (t.label === 'left' ? ' text-anchor="end"' : '') + '>' + esc(t.name) + '</text>') +
          '</g>';
      }).join('');
      var labels = mini ? '' : (M.labels || []).map(function (l) {
        return '<text class="map-label map-label--' + l.kind + '" x="' + X(l.lon).toFixed(1) + '" y="' + Y(l.lat).toFixed(1) + '" font-size="' + ((l.kind === 'sea' ? 4.6 : 4.4) * k).toFixed(2) + '">' + (l.kind === 'peak' ? '▲ ' : '') + esc(l.text) + '</text>';
      }).join('');
      holder.innerHTML = '<svg viewBox="' + M.viewBox + '" role="img" aria-label="Map of ' + esc(R.name) + ' showing its main towns">' +
        '<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" class="map-sea"/>' +
        '<path class="map-land" d="' + p.getAttribute('d') + '"/>' + labels + towns + '</svg>';
      if (mini) return;
      var info = document.getElementById('town-info');
      [].forEach.call(holder.querySelectorAll('.town'), function (g) {
        function pick() {
          var t = M.towns[+g.getAttribute('data-i')];
          [].forEach.call(holder.querySelectorAll('.town'), function (o) { o.classList.toggle('is-active', o === g); });
          var li = document.querySelector('.town-list [data-i="' + g.getAttribute('data-i') + '"]');
          [].forEach.call(document.querySelectorAll('.town-list li'), function (o) { o.classList.toggle('is-active', o === li); });
          if (info) info.innerHTML = '<strong>' + esc(t.name) + '</strong> ' + esc(t.note);
        }
        g.addEventListener('click', pick);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    });
  }

  /* ---------- guide page ---------- */
  function renderGuide(R) {
    var M = R.map || { towns: [] };
    var photos = (R.photos || []).map(function (ph) {
      var page = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(ph.file);
      return '<figure class="photo"><div class="photo__img"><img loading="lazy" src="' + photoURL(ph.file, 900) + '" alt="' + esc(ph.caption) + '" onerror="this.parentNode.classList.add(\'is-missing\');this.remove()"></div>' +
        '<figcaption>' + esc(ph.caption) + ' <a href="' + page + '" target="_blank" rel="noopener">Photo: Wikimedia Commons</a></figcaption></figure>';
    }).join('');

    root.innerHTML = crumb(R, 'Guide') + hero(R, true) +
      '<section class="section"><div class="wrap">' +
        '<div class="section-head"><div><div class="eyebrow">At a glance</div><h2>What ' + esc(R.name) + ' is famous for</h2></div></div>' +
        '<div class="card-grid">' + (R.famous_for || []).map(function (f) { return '<div class="card"><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></div>'; }).join('') + '</div>' +
      '</div></section>' +

      '<section class="section section--tint" id="map"><div class="wrap">' +
        '<div class="section-head"><div><div class="eyebrow">Map</div><h2>The main towns</h2></div></div>' +
        '<div class="guide-map">' +
          '<div class="guide-map__svg" data-map></div>' +
          '<div><ul class="town-list">' + (M.towns || []).map(function (t, i) {
            return '<li data-i="' + i + '"><strong>' + esc(t.name) + '</strong>' + (t.capital ? ' <span class="badge">Capital</span>' : '') + '<br><span>' + esc(t.note) + '</span></li>';
          }).join('') + '</ul>' +
          '<p class="town-info" id="town-info" aria-live="polite">Tap a town on the map to learn more.</p></div>' +
        '</div>' +
      '</div></section>' +

      (photos ? '<section class="section"><div class="wrap">' +
        '<div class="section-head"><div><div class="eyebrow">Photos</div><h2>' + esc(R.name) + ' in pictures</h2></div></div>' +
        '<div class="photo-grid">' + photos + '</div></div></section>' : '') +

      '<section class="section section--tint"><div class="wrap">' +
        '<div class="section-head"><div><div class="eyebrow">Festivals</div><h2>The ' + esc(R.adjective || R.name) + ' year</h2></div></div>' +
        '<ul class="fest-list">' + festivalsFrom(R, 1).map(function (f) { return festivalHTML(f, false); }).join('') + '</ul>' +
      '</div></section>' +

      '<section class="section"><div class="wrap">' +
        '<div class="section-head"><div><div class="eyebrow">Places of interest</div><h2>Worth the journey</h2></div></div>' +
        '<div class="card-grid">' + (R.places || []).map(function (p) {
          return '<div class="card"><div class="eyebrow">' + esc(p.where) + '</div><h3>' + esc(p.name) + '</h3><p>' + esc(p.text) + '</p></div>';
        }).join('') + '</div>' +
        '<h3 class="sub-head">Food and drink to try</h3>' +
        '<div class="chip-list">' + (R.food || []).map(function (f) { return '<span class="chip">' + esc(f) + '</span>'; }).join('') + '</div>' +
      '</div></section>' +

      '<section class="section section--dark"><div class="wrap guide-end">' +
        (R.ancestry ? '<p>' + esc(R.ancestry) + ' <a href="https://antenati.cultura.gov.it/" target="_blank" rel="noopener">Portale Antenati →</a></p>' : '') +
        '<div class="btn-row"><a class="btn btn--primary" href="' + slug + '.html#news">' + esc(R.name) + ' news</a>' +
        '<a class="btn btn--outline btn--light" href="' + slug + '.html#whats-on">What\'s on</a>' +
        '<a class="btn btn--outline btn--light" href="' + ROOT + 'visit-italy.html">Plan your trip</a></div>' +
      '</div></section>';

    drawMap(R, root.querySelector('[data-map]'), false);
    [].forEach.call(root.querySelectorAll('.town-list li'), function (li) {
      li.addEventListener('click', function () {
        var g = root.querySelector('.town[data-i="' + li.getAttribute('data-i') + '"]');
        if (g) g.dispatchEvent(new Event('click'));
      });
    });
    if (location.hash === '#map') setTimeout(function () { document.getElementById('map').scrollIntoView(); }, 50);
  }
})();
