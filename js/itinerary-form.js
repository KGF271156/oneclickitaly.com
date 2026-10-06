// OneClick Italy – itinerary form.
// Set WEBHOOK_URL to the Make.com custom webhook of the ITALY scenario.
// While it is empty the form tells the visitor the service is coming soon.
(function () {
  var WEBHOOK_URL = 'https://hook.eu1.make.com/2frlt75ja6o56ctsjjkfylxq58b6qor6';
  var form = document.getElementById('itinerary-form');
  if (!form) return;
  var btn = document.getElementById('itinerary-submit-btn');
  var status = document.getElementById('itinerary-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!WEBHOOK_URL) {
      status.textContent = 'Our itinerary service is launching soon — please check back shortly.';
      return;
    }
    var data = { site: 'OneClick Italy', submittedAt: new Date().toISOString() };
    new FormData(form).forEach(function (v, k) {
      if (data[k] === undefined) data[k] = v;
      else data[k] = [].concat(data[k], v);
    });
    ['interests', 'accommodation', 'internalTravel'].forEach(function (k) {
      data[k] = [].concat(data[k] || []).join(', ');
    });
    btn.disabled = true;
    status.textContent = 'Sending…';
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      status.textContent = 'Thank you! Your draft itinerary is on its way to your inbox.';
      form.reset();
    }).catch(function () {
      status.textContent = 'Sorry, something went wrong. Please try again in a moment.';
    }).then(function () { btn.disabled = false; });
  });
})();
