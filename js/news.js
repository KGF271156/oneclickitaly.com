/* OneClick Italy – news loader.
   Reads data/news/<slug>.json, which Make.com appends to:
   { "region": "Sicily", "region_slug": "sicily",
     "stories": [ { "title_en", "summary_en", "title_it", "category",
                    "link", "source", "date" }, ... ] } */
(function () {
  var ROOT = window.OCI_ROOT || '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(u || '') ? u : '';
  }
  function when(d) {
    var t = Date.parse(d);
    if (isNaN(t)) return '';
    var mins = Math.round((Date.now() - t) / 60000);
    if (mins < 60) return mins <= 1 ? 'just now' : mins + ' min ago';
    if (mins < 1440) return Math.round(mins / 60) + ' h ago';
    if (mins < 2880) return 'yesterday';
    return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  // Fetches one region's stories, newest first. Never throws: resolves [] if missing.
  function load(slug) {
    var bust = Math.floor(Date.now() / 300000); // refresh every 5 minutes
    return fetch(ROOT + 'data/news/' + slug + '.json?v=' + bust)
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (txt) {
        if (!txt) return [];
        // Make appends ",{story}]}" - tidy a leading comma when the list started empty.
        txt = txt.replace(/\[\s*,/, '[');
        var data = JSON.parse(txt);
        var list = (data.stories || []).filter(function (s) { return s && (s.title_en || s.title); });
        list.sort(function (a, b) { return (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0); });
        // drop duplicates (same link or same headline)
        var seen = {};
        return list.filter(function (s) {
          var k = (s.link || '') + '|' + (s.title_en || s.title);
          if (seen[k]) return false; seen[k] = 1; return true;
        });
      })
      .catch(function () { return []; });
  }

  function storyHTML(s, opts) {
    opts = opts || {};
    var title = esc(s.title_en || s.title);
    var url = safeUrl(s.link);
    var meta = [s.category, s.source, when(s.date)].filter(Boolean).map(esc).join(' · ');
    var head = url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + title + '</a>' : title;
    return '<article class="story' + (opts.compact ? ' story--compact' : '') + '">' +
      '<h3 class="story__title">' + head + '</h3>' +
      (opts.compact ? '' : (s.summary_en ? '<p class="story__summary">' + esc(s.summary_en) + '</p>' : '')) +
      '<div class="story__meta">' + meta + '</div>' +
      '</article>';
  }

  window.OCINews = { load: load, storyHTML: storyHTML, esc: esc, when: when, safeUrl: safeUrl };
})();
