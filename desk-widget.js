/* ALETH Desk widget — the diamond launcher.
   Life cycle:  "◆ Ask the desk" pill shows for ~6 seconds → it collapses to a slowly rocking
                diamond → a quiet reminder appears at most twice per visit → tap the diamond
                to reveal the label → tap again to open the desk.
   It never opens itself. It never pings. It never moves the page.
   The model key is never here; this only talks to the desk endpoint. */
(function () {
  if (window.__alethDeskLoaded) return;
  window.__alethDeskLoaded = true;

  var API = "https://proposed-coal-showed-arrested.trycloudflare.com";
  var CODE = "U26XxxAub-kA";

  var css = ''
    /* ---------- launcher ---------- */
    + '.adk-launch{position:fixed;right:20px;bottom:20px;z-index:2147482000;display:flex;align-items:center;'
    + 'border:1px solid #101010;background:#101010;color:#FBFAF7;border-radius:999px;cursor:pointer;padding:0;'
    + 'overflow:hidden;box-shadow:0 14px 36px rgba(16,16,16,.26),0 1px 3px rgba(16,16,16,.18);'
    + 'transition:transform .45s cubic-bezier(.22,1,.36,1),background .3s ease}'
    + '.adk-launch:hover{transform:translateY(-2px)}'
    + '.adk-launch:focus-visible{outline:2px solid #A81E1E;outline-offset:4px}'
    + '.adk-orb{width:48px;height:48px;display:grid;place-items:center;flex:0 0 48px;font-size:15px;'
    + 'line-height:1;color:#FBFAF7;transform-origin:50% 50%}'
    + '.adk-launch[data-state="orb"] .adk-orb{animation:adk-rock 7s cubic-bezier(.45,0,.55,1) infinite}'
    + '@keyframes adk-rock{0%,62%,100%{transform:rotate(0)}'
    + '70%{transform:rotate(-24deg)}76%{transform:rotate(21deg)}82%{transform:rotate(-9deg)}88%{transform:rotate(4deg)}}'
    + '.adk-label{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11.5px;letter-spacing:.16em;'
    + 'text-transform:uppercase;white-space:nowrap;opacity:0;max-width:0;margin-right:0;'
    + 'transition:opacity .35s ease .08s,max-width .55s cubic-bezier(.22,1,.36,1),margin-right .55s cubic-bezier(.22,1,.36,1)}'
    + '.adk-launch[data-state="pill"] .adk-label,.adk-launch[data-state="label"] .adk-label{'
    + 'opacity:1;max-width:200px;margin-right:18px}'
    + '.adk-launch[data-state="pill"]{animation:adk-in .8s cubic-bezier(.22,1,.36,1) both}'
    + '@keyframes adk-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}'
    /* ---------- reminder ---------- */
    + '.adk-hint{position:fixed;right:78px;bottom:34px;z-index:2147481999;max-width:228px;'
    + 'background:#FBFAF7;border:1px solid rgba(16,16,16,.12);color:#242424;padding:.7rem .9rem;'
    + 'font-family:Inter,-apple-system,sans-serif;font-size:13px;line-height:1.45;'
    + 'box-shadow:0 12px 30px rgba(16,16,16,.14);opacity:0;transform:translateX(8px);pointer-events:none;'
    + 'transition:opacity .55s ease,transform .55s cubic-bezier(.22,1,.36,1)}'
    + '.adk-hint.show{opacity:1;transform:translateX(0)}'
    + '.adk-hint:after{content:"";position:absolute;right:-5px;bottom:17px;width:8px;height:8px;background:#FBFAF7;'
    + 'border-right:1px solid rgba(16,16,16,.12);border-bottom:1px solid rgba(16,16,16,.12);transform:rotate(-45deg)}'
    + '@media(max-width:520px){.adk-hint{right:74px;bottom:28px;max-width:186px;font-size:12.5px}}'
    /* ---------- panel ---------- */
    + '.adk-panel{position:fixed;right:18px;bottom:18px;z-index:2147482001;width:min(410px,calc(100vw - 24px));'
    + 'height:min(580px,calc(100vh - 36px));background:#FBFAF7;border:1px solid rgba(16,16,16,.12);'
    + 'border-radius:12px;overflow:hidden;box-shadow:0 28px 70px rgba(16,16,16,.34),0 2px 8px rgba(16,16,16,.12);'
    + 'display:none;flex-direction:column;font-family:Inter,-apple-system,sans-serif}'
    + '.adk-panel.open{display:flex;animation:adk-panel-in .45s cubic-bezier(.22,1,.36,1) both}'
    + '@keyframes adk-panel-in{from{opacity:0;transform:translateY(18px) scale(.997)}to{opacity:1;transform:none}}'
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
    + '@media(max-width:520px){.adk-panel{right:0;bottom:0;width:100vw;height:88vh;border-radius:0}}'
    + '@media(prefers-reduced-motion:reduce){.adk-orb,.adk-launch,.adk-panel,.adk-hint{'
    + 'animation:none!important;transition:none!important}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- launcher: diamond + label ---- */
  var launch = document.createElement('button');
  launch.className = 'adk-launch';
  launch.type = 'button';
  launch.dataset.state = 'pill';
  launch.setAttribute('aria-label', 'Ask the ALETH desk');
  launch.innerHTML = '<span class="adk-orb" aria-hidden="true">◆</span>'
    + '<span class="adk-label">Ask the desk</span>';

  var hint = document.createElement('div');
  hint.className = 'adk-hint';
  hint.setAttribute('role', 'status');
  hint.textContent = 'Questions about which bottle? Ask the desk.';

  /* ---- panel ---- */
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

  document.body.appendChild(launch);
  document.body.appendChild(hint);
  document.body.appendChild(panel);

  var log = panel.querySelector('.adk-log');
  var input = panel.querySelector('input');
  var form = panel.querySelector('form');
  var send = form.querySelector('button');
  var hist = [];
  var started = false;
  var hintsShown = 0;

  function turn(text, cls) {
    var d = document.createElement('div');
    d.className = 'adk-t' + (cls === 'me' ? ' me' : '');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function openPanel() {
    panel.classList.add('open');
    launch.style.display = 'none';
    hint.classList.remove('show');
    if (!started) {
      started = true;
      turn('What are you working on — paint, glass, wheels, or interior?');
    }
    setTimeout(function () { input.focus(); }, 90);
  }

  function closePanel() {
    panel.classList.remove('open');
    launch.style.display = 'flex';
    launch.dataset.state = 'orb';
  }

  function showHint() {
    if (hintsShown >= 2) return;
    if (panel.classList.contains('open')) return;
    if (launch.style.display === 'none') return;
    hintsShown++;
    hint.classList.add('show');
    setTimeout(function () { hint.classList.remove('show'); }, 7000);
  }

  /* 1 — the pill is visible on arrival, then it folds down to the diamond */
  setTimeout(function () {
    if (panel.classList.contains('open')) return;
    launch.dataset.state = 'orb';
    /* 2 — a quiet reminder, at most twice per visit */
    setTimeout(showHint, 14000);
    setTimeout(showHint, 80000);
  }, 6000);

  /* 3 — tap once to reveal the label, tap again to open the desk */
  launch.addEventListener('click', function () {
    var s = launch.dataset.state;
    hint.classList.remove('show');
    if (s === 'orb') { launch.dataset.state = 'label'; return; }
    openPanel();
  });

  document.addEventListener('click', function (e) {
    if (!launch.contains(e.target) && launch.dataset.state === 'label') {
      launch.dataset.state = 'orb';
    }
  });

  panel.querySelector('.adk-x').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
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
