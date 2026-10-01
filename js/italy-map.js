/* OneClickItaly — interactive region map
   Loads assets/italy-map.svg into any element with id="italy-map-mount",
   wires up hover tooltips and click-through to /regions/<slug>.html
   Map data: 20 regions, CC-BY-4.0 © MapSVG / @svg-maps/italy (Victor Cazanave)
*/
const ITALY_REGIONS = [
  { slug: "abruzzo", name: "Abruzzo" },
  { slug: "aosta-valley", name: "Aosta Valley" },
  { slug: "apulia", name: "Apulia" },
  { slug: "basilicata", name: "Basilicata" },
  { slug: "calabria", name: "Calabria" },
  { slug: "campania", name: "Campania" },
  { slug: "emilia-romagna", name: "Emilia-Romagna" },
  { slug: "friuli-venezia-giulia", name: "Friuli-Venezia Giulia" },
  { slug: "lazio", name: "Lazio" },
  { slug: "liguria", name: "Liguria" },
  { slug: "lombardy", name: "Lombardy" },
  { slug: "marche", name: "Marche" },
  { slug: "molise", name: "Molise" },
  { slug: "piedmont", name: "Piedmont" },
  { slug: "sardinia", name: "Sardinia" },
  { slug: "sicily", name: "Sicily" },
  { slug: "trentino-south-tyrol", name: "Trentino-South Tyrol" },
  { slug: "tuscany", name: "Tuscany" },
  { slug: "umbria", name: "Umbria" },
  { slug: "veneto", name: "Veneto" }
];

function regionHref(slug) {
  // From the homepage (root) the link is regions/<slug>.html
  // From inside /regions/ it should just be <slug>.html — handled via data-map-base on the mount element.
  // Note: an empty string is a valid, meaningful base (means "same folder"), so we
  // check whether the attribute was set at all rather than using `||`, which would
  // treat "" as missing and wrongly fall back to 'regions/'.
  const mount = document.getElementById('italy-map-mount');
  const base = (mount && mount.dataset.mapBase !== undefined) ? mount.dataset.mapBase : 'regions/';
  return base + slug + '.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('italy-map-mount');
  if (!mount) return;

  fetch(mount.dataset.mapSrc || 'assets/italy-map.svg')
    .then(res => res.text())
    .then(svgText => {
      mount.innerHTML =
        '<div class="region-map-holder">' +
          '<div class="region-map-wrap">' + svgText + '</div>' +
          '<div class="region-tooltip" id="region-tooltip"></div>' +
        '</div>';

      const svg = mount.querySelector('svg');
      const tooltip = mount.querySelector('#region-tooltip');
      const holder = mount.querySelector('.region-map-holder');
      if (!svg) return;

      svg.querySelectorAll('path[id]').forEach(path => {
        const slug = path.getAttribute('id');
        const region = ITALY_REGIONS.find(r => r.slug === slug);
        const label = region ? region.name : path.getAttribute('aria-label') || slug;

        path.setAttribute('tabindex', '0');
        path.setAttribute('role', 'link');
        path.setAttribute('aria-label', 'View ' + label);

        path.addEventListener('mouseenter', (e) => {
          tooltip.textContent = label;
          tooltip.classList.add('is-visible');
        });
        path.addEventListener('mousemove', (e) => {
          const rect = holder.getBoundingClientRect();
          tooltip.style.left = (e.clientX - rect.left) + 'px';
          tooltip.style.top = (e.clientY - rect.top) + 'px';
        });
        path.addEventListener('mouseleave', () => {
          tooltip.classList.remove('is-visible');
        });
        path.addEventListener('click', () => {
          window.location.href = regionHref(slug);
        });
        path.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = regionHref(slug);
          }
        });
      });
    })
    .catch(() => {
      const base = (mount.dataset.mapBase !== undefined) ? mount.dataset.mapBase : 'regions/';
      const listHref = base === '' ? 'index.html' : base + 'index.html';
      mount.innerHTML = '<p style="color:var(--ink-soft);">Map unavailable right now — browse the <a href="' + listHref + '" style="color:var(--terracotta);font-weight:600;">full regions list</a> instead.</p>';
    });
});
