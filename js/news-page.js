/* OneClick Italy – News page: national tile + one tile per region. */
(function () {
  var N = window.OCINews, esc = N.esc, T = window.OCI_T || function (x) { return x; };
  var REGIONS = N.REGIONS;

  // National tile
  var nat = document.getElementById('national-news');
  if (nat) N.load('italy').then(function (list) {
    var top = list.slice(0, 6);
    nat.innerHTML = top.length
      ? '<div class="national-tile__list">' + top.map(function (s) { return N.storyHTML(s); }).join('') + '</div>'
      : '<div class="empty-note">' + esc(T('National headlines are being switched on. In the meantime, the regional tiles below have the latest local stories.')) + '</div>';
  });

  // Region tiles
  var grid = document.getElementById('region-tiles');
  if (!grid) return;
  Promise.all(REGIONS.map(function (r) {
    return N.load(r[0]).then(function (list) { return { slug: r[0], name: T(r[1]), top: list[0] }; });
  })).then(function (rows) {
    rows.sort(function (a, b) {
      if (!!a.top !== !!b.top) return a.top ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    grid.innerHTML = rows.map(function (r) {
      if (!r.top) {
        return '<a class="rtile rtile--soon" href="news-region.html?r=' + r.slug + '">' +
          '<div class="rtile__name">' + esc(r.name) + '</div>' +
          '<div class="rtile__head">' + esc(T('Local news coming soon')) + '</div>' +
          '<div class="rtile__meta">' + esc(T('Local news page →')) + '</div></a>';
      }
      var s = r.top;
      return '<a class="rtile" href="news-region.html?r=' + r.slug + '">' +
        '<div class="rtile__name">' + esc(r.name) + '<span class="rtile__live">' + esc(T('● Live')) + '</span></div>' +
        '<div class="rtile__head">' + esc(N.title(s)) + '</div>' +
        '<div class="rtile__meta">' + [s.source, N.when(s.date)].filter(Boolean).map(esc).join(' · ') + '</div></a>';
    }).join('');
  });
})();
