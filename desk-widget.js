/* ALETH Desk widget — a floating "Ask the desk" bubble on every page.
   Self-contained: injects its own styles, never touches the page layout.
   The model key is never here; this only talks to the desk endpoint. */
(function () {
  if (window.__alethDeskLoaded) return;
  window.__alethDeskLoaded = true;

  var API = "https://proposed-coal-showed-arrested.trycloudflare.com";
  var CODE = "U26XxxAub-kA";

  var css = ''
    + '.adk-bubble{position:fixed;right:18px;bottom:18px;z-index:2147482000;'
    + 'display:flex;align-items:center;gap:.55rem;padding:.85rem 1.1rem;border:1px solid #101010;'
    + 'background:#101010;color:#FBFAF7;font-family:"IBM Plex Mono",ui-monospace,monospace;'
    + 'font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;'
    + 'box-shadow:0 10px 30px rgba(16,16,16,.22)}'
    + '.adk-bubble:hover{background:#000}'
    + '.adk-panel{position:fixed;right:18px;bottom:18px;z-index:2147482001;width:min(410px,calc(100vw - 24px));'
    + 'height:min(580px,calc(100vh - 36px));background:#FBFAF7;border:1px solid rgba(16,16,16,.12);'
    + 'border-radius:12px;overflow:hidden;box-shadow:0 28px 70px rgba(16,16,16,.34),0 2px 8px rgba(16,16,16,.12);'
    + 'display:none;flex-direction:column;font-family:Inter,-apple-system,sans-serif}'
    + '.adk-panel.open{display:flex}'
    + '.adk-head{display:flex;align-items:center;justify-content:space-between;gap:.75rem;'
    + 'padding:.9rem 1rem;border-bottom:1px solid rgba(16,16,16,.1)}'
    + '.adk-head b{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:1.15rem;color:#101010}'
    + '.adk-head span{font-family:"IBM Plex Mono",monospace;font-size:.62rem;letter-spacing:.18em;'
    + 'text-transform:uppercase;color:#A81E1E;display:block;margin-bottom:.15rem}'
    + '.adk-x{background:none;border:0;font-size:1.25rem;line-height:1;color:#242424;cursor:pointer;padding:.35rem .4rem}'
    + '.adk-log{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.7rem}'
    + '.adk-t{max-width:90%;font-size:15px;line-height:1.58;padding:.85rem 1rem;white-space:pre-wrap;border-radius:10px;'
    + 'background:#F1EEE6;border:1px solid rgba(16,16,16,.06);color:#101010}'
    + '.adk-t.me{margin-left:auto;background:#101010;color:#FBFAF7;border-color:#101010;border-bottom-right-radius:3px}'
    + '.adk-chips{display:flex;flex-wrap:wrap;gap:.4rem;padding:0 1rem .6rem}'
    + '.adk-chips button{font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.06em;'
    + 'text-transform:uppercase;padding:.55rem .8rem;border:1px solid rgba(16,16,16,.16);border-radius:999px;'
    + 'background:#fff;color:#242424;cursor:pointer}'
    + '.adk-form{display:flex;gap:.45rem;padding:.75rem 1rem;border-top:1px solid rgba(16,16,16,.12)}'
    + '.adk-form input{flex:1;height:46px;padding:0 .85rem;border:1px solid rgba(16,16,16,.16);border-radius:8px;'
    + 'background:#fff;color:#101010;font-size:15px;outline:none;font-family:inherit}'
    + '.adk-form input::placeholder{color:#6E6E66}'
    + '.adk-form input:focus{border-color:#101010}'
    + '.adk-form button{height:46px;padding:0 1.1rem;border:1px solid #101010;border-radius:8px;background:#101010;'
    + 'color:#FBFAF7;font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.12em;'
    + 'text-transform:uppercase;cursor:pointer}'
    + '.adk-form button:disabled{opacity:.4}'
    + '.adk-foot{font-size:12px;color:#57574F;padding:.15rem 1rem .9rem;line-height:1.5}'
    + '@media(max-width:520px){.adk-panel{right:0;bottom:0;width:100vw;height:88vh;border-left:0;border-right:0}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bubble = document.createElement('button');
  bubble.className = 'adk-bubble';
  bubble.type = 'button';
  bubble.setAttribute('aria-label', 'Open the ALETH desk');
  bubble.innerHTML = '<span aria-hidden="true">◆</span> Ask the desk';

  var panel = document.createElement('div');
  panel.className = 'adk-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'ALETH desk');
  panel.innerHTML =
    '<div class="adk-head"><div><span>ALETH</span><b>The Desk</b></div>' +
    '<button class="adk-x" type="button" aria-label="Close">✕</button></div>' +
    '<div class="adk-log"></div>' +
    '<div class="adk-chips">' +
      '<button type="button" data-t="paint has hard water spots after rain">paint</button>' +
      '<button type="button" data-t="water spots on the glass and windshield">glass</button>' +
      '<button type="button" data-t="brake dust baked on my wheels">wheels</button>' +
      '<button type="button" data-t="interior plastics and cloth seats need cleaning">interior</button>' +
    '</div>' +
    '<form class="adk-form"><input placeholder="Your answer…" aria-label="Your message" required>' +
    '<button type="submit">Send</button></form>' +
    '<p class="adk-foot">Product questions only. Orders, shipping or returns: house@alethchemical.com</p>';

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  var log = panel.querySelector('.adk-log');
  var input = panel.querySelector('input');
  var form = panel.querySelector('form');
  var send = form.querySelector('button');
  var hist = [];
  var started = false;

  function turn(text, cls) {
    var d = document.createElement('div');
    d.className = 'adk-t' + (cls === 'me' ? ' me' : '');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function open() {
    panel.classList.add('open');
    bubble.style.display = 'none';
    if (!started) {
      started = true;
      turn('What are you working on — paint, glass, wheels, or interior?');
    }
    setTimeout(function () { input.focus(); }, 60);
  }

  function close() {
    panel.classList.remove('open');
    bubble.style.display = 'flex';
  }

  bubble.addEventListener('click', open);
  panel.querySelector('.adk-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });

  panel.querySelector('.adk-chips').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    input.value = b.getAttribute('data-t');
    form.requestSubmit();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    send.disabled = true;
    turn(text, 'me');
    var slot = turn('…');
    fetch(API + '/api/chat?k=' + encodeURIComponent(CODE), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: text, history: hist })
    }).then(function (r) { return r.json(); }).then(function (d) {
      slot.textContent = d.reply || 'The desk did not answer. Email house@alethchemical.com and we will pick it up.';
      hist.push({ role: 'user', content: text }, { role: 'assistant', content: d.reply || '' });
    }).catch(function () {
      slot.textContent = 'The desk is offline right now. Email house@alethchemical.com and we will answer you directly.';
    }).then(function () {
      send.disabled = false;
      log.scrollTop = log.scrollHeight;
      input.focus();
    });
  });
})();
