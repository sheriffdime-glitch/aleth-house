/* ALETH — notify list foundation.
   One switch: set ALETH_NOTIFY_ENDPOINT to the chosen service's form endpoint
   (Brevo / Buttondown / Mailchimp / own backend) and every capture form on
   the site goes live. Until then, forms fall back to a prefilled mailto so
   no signup is ever silently lost or falsely confirmed. */
(function () {
  var ALETH_NOTIFY_ENDPOINT = null; // e.g. 'https://app.brevo.com/...' — set when the service is chosen
  var LIST_ADDRESS = 'house@alethchemical.com';

  function validEmail(em) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);
  }

  function wire(form) {
    if (!form || form.__alethWired) return;
    form.__alethWired = true;
    var productId = form.getAttribute('data-product') || '';
    var productName = form.getAttribute('data-product-name') || '';
    var done = form.parentElement.querySelector('.notify-done');
    var input = form.querySelector('input[type="email"]');
    var trap = form.querySelector('.notify-hp');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (trap && trap.value) return; // bot
      var em = (input.value || '').trim();
      if (!validEmail(em)) {
        input.focus();
        input.setAttribute('aria-invalid', 'true');
        return;
      }

      if (ALETH_NOTIFY_ENDPOINT) {
        fetch(ALETH_NOTIFY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em, product: productId, at: new Date().toISOString() })
        }).then(function (r) {
          if (!r.ok) throw new Error('bad status');
          form.hidden = true;
          done.hidden = false;
          done.textContent = 'Noted. You are on the list for ' + productName + '.';
        }).catch(function () {
          done.hidden = false;
          done.innerHTML = 'The line stuttered. One more try — or write to <a href="mailto:' + LIST_ADDRESS + '">' + LIST_ADDRESS + '</a>.';
        });
      } else {
        /* Fallback: hand the signup to the founder's inbox, honestly. */
        var subject = encodeURIComponent('The list: ' + productName);
        var body = encodeURIComponent(em + '\n\nWaiting on: ' + productName + ' (' + productId + ')');
        form.hidden = true;
        done.hidden = false;
        done.innerHTML = 'The list is being connected. Until then, <a href="mailto:' + LIST_ADDRESS + '?subject=' + subject + '&body=' + body + '">one line to ' + LIST_ADDRESS + '</a> holds your place for ' + productName + ' — the message is already written for you.';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form.notify').forEach(wire);
  });
  window.alethNotifyWire = wire; // for forms rendered after DOMContentLoaded
})();
