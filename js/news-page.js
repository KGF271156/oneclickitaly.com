/* OneClick Italy – News page: national tile + one tile per region. */
(function () {
  var N = window.OCINews, esc = N.esc;
  var REGIONS = [
    ['abruzzo','Abruzzo'],['aosta-valley','Aosta Valley'],['apulia','Apulia'],['basilicata','Basilicata'],
    ['calabria','Calabria'],['campania','Campania'],['emilia-romagna','Emilia-Romagna'],
    ['friuli-venezia-giulia','Friuli Venezia Giulia'],['lazio','Lazio'],['liguria','Liguria'],
    ['lombardy','Lombardy'],['marche','Marche'],['molise','Molise'],['piedmont','Piedmont'],
    ['sardinia','Sardinia'],['sicily','Sicily'],['trentino-south-tyrol','Trentino-South Tyrol'],
    ['tuscany','Tuscany'],['umbria','Umbria'],['veneto','Veneto']
  ];

  // National tile
  var nat = document.getElementById('national-news');
  if (nat) N.load('italy').then(function (list) {
    var top = list.slice(0, 6);
    nat.innerHTML = top.length
      ? '<div class="national-tile__list">' + top.map(function (s) { return N.storyHTML(s); }).join('') + '</div>'
      : '<div class="empty-note">National headlines are being switched on. In the meantime, the regional tiles below have the latest local stories.</div>';
  });

  // Region tiles
  var grid = document.getElementById('region-tiles');
  if (!grid) return;
  Promise.all(REGIONS.map(function (r) {
    return N.load(r[0]).then(function (list) { return { slug: r[0], name: r[1], top: list[0] }; });
  })).then(function (rows) {
    rows.sort(function (a, b) {
      if (!!a.top !== !!b.top) return a.top ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    grid.innerHTML = rows.map(function (r) {
      if (!r.top) {
        return '<a class="rtile rtile--soon" href="regions/' + r.slug + '.html">' +
          '<div class="rtile__name">' + esc(r.name) + '</div>' +
          '<div class="rtile__head">Local news coming soon</div>' +
          '<div class="rtile__meta">Visit the region page →</div></a>';
      }
      var s = r.top;
      return '<a class="rtile" href="regions/' + r.slug + '.html#news">' +
        '<div class="rtile__name">' + esc(r.name) + '<span class="rtile__live">● Live</span></div>' +
        '<div class="rtile__head">' + esc(s.title_en || s.title) + '</div>' +
        '<div class="rtile__meta">' + [s.source, N.when(s.date)].filter(Boolean).map(esc).join(' · ') + '</div></a>';
    }).join('');
  });
})();
