/* OneClick Italy – shared header and footer.
   Every page includes this script where the header should appear:
     <script src="js/layout.js"></script>        (pages in the main folder)
     <script src="../js/layout.js"></script>     (pages in /regions)
   and an empty <div id="site-footer"></div> where the footer goes.
   Change the menu or footer here once and every page updates. */
(function () {
  var me = document.currentScript;
  var src = (me && me.getAttribute('src')) || 'js/layout.js';
  var ROOT = src.replace(/js\/layout\.js.*$/, '');   // "" or "../"
  window.OCI_ROOT = ROOT;

  var NAV = [
    ['regions/index.html', 'Regions'],
    ['culture.html', 'Culture'],
    ['live-italy.html', 'Live'],
    ['news.html', 'News'],
    ['food-drink.html', 'Food &amp; Drink'],
    ['retail.html', 'Retail'],
    ['visit-italy.html', 'Visit Italy'],
    ['events.html', 'Events'],
    ['sport.html', 'Sport'],
    ['communities.html', 'Communities']
  ];

  var here = location.pathname.replace(/\/$/, '/index.html');
  function isActive(href) {
    if (href === 'regions/index.html') return /\/regions\//.test(here);
    return here.slice(-href.length - 1) === '/' + href;
  }
  function links() {
    return NAV.map(function (n) {
      return '<a href="' + ROOT + n[0] + '"' + (isActive(n[0]) ? ' class="is-active" aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('\n      ');
  }

  var header =
    '<header class="site-header">' +
    '<div class="header-row wrap">' +
    '<a href="' + ROOT + 'index.html" class="logo"><span class="mark"></span> OneClick Italy</a>' +
    '<nav class="main-nav" aria-label="Main">' + links() + '</nav>' +
    '<div class="header-actions">' +
    '<a href="' + ROOT + 'index.html#join" class="btn btn-outline">Sign in</a>' +
    '<a href="' + ROOT + 'index.html#join" class="btn btn-primary">Create my Italy</a>' +
    '</div>' +
    '<button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav">&#9776;</button>' +
    '</div>' +
    '<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">' + links() + '</nav>' +
    '</header>';

  var footer =
    '<footer class="site-footer"><div class="wrap">' +
    '<div class="footer-grid">' +
    '<div class="footer-brand"><a href="' + ROOT + 'index.html" class="logo"><span class="mark"></span> OneClick Italy</a>' +
    '<p>A live digital window into every region, city and community of Italy.</p></div>' +
    '<div><h5>Explore</h5><ul><li><a href="' + ROOT + 'regions/index.html">Regions</a></li><li><a href="' + ROOT + 'news.html">News</a></li><li><a href="' + ROOT + 'live-italy.html">Live Italy</a></li></ul></div>' +
    '<div><h5>Italy Abroad</h5><ul><li><a href="' + ROOT + 'culture.html">Culture</a></li><li><a href="' + ROOT + 'communities.html">Communities</a></li><li><a href="' + ROOT + 'events.html">Events</a></li></ul></div>' +
    '<div><h5>Plan a Visit</h5><ul><li><a href="' + ROOT + 'visit-italy.html">Visit Italy</a></li><li><a href="' + ROOT + 'food-drink.html">Food &amp; Drink</a></li><li><a href="' + ROOT + 'retail.html">Retail</a></li></ul></div>' +
    '</div>' +
    '<div class="footer-bottom"><span>&copy; ' + new Date().getFullYear() + ' OneClick Italy · <a href="mailto:info@oneclickitaly.com">info@oneclickitaly.com</a></span>' +
    '<span><a href="#">Privacy</a> · <a href="#">Terms</a></span></div>' +
    '</div></footer>';

  // Header goes exactly where this script tag sits, so there is no flash.
  if (me) me.insertAdjacentHTML('beforebegin', header);

  function mountFooter() {
    var slot = document.getElementById('site-footer');
    if (slot && !slot.firstChild) slot.outerHTML = footer;
  }
  function wireMenu() {
    var btn = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-nav');
    if (!btn || !menu || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  wireMenu();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountFooter);
  } else {
    mountFooter();
  }
})();
