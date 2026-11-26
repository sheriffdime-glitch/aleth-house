/* ALETH Desk widget — the diamond launcher.
   King's spec (11/26):
     · label on arrival for 5s  ->  folds down to the diamond
     · the diamond rocks quickly, left then right
     · scrolling past the guide wakes the label once, then it folds again
     · tap the diamond once -> label opens; untouched for 3.5s -> folds back
     · tap again -> the desk opens
   It never opens itself, never pings, never moves the page.
   The model key is never here; this only talks to the desk endpoint. */
(function () {
  if (window.__alethDeskLoaded) return;
  window.__alethDeskLoaded = true;

  var API = "https://proposed-coal-showed-arrested.trycloudflare.com";
  var CODE = "U26XxxAub-kA";

  /* a cut diamond, drawn rather than typed */
  var GEM = '<svg class="adk-gem" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
    + '<path d="M12 2.4 20.6 8.9 12 21.6 3.4 8.9Z" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/>'
    + '<path d="M3.4 8.9h17.2" fill="none" stroke="currentColor" stroke-width=".7" opacity=".85"/>'
    + '<path d="M12 2.4 7.6 8.9M12 2.4l4.4 6.5" fill="none" stroke="currentColor" stroke-width=".7" opacity=".85"/>'
    + '<path d="M7.6 8.9 12 21.6M16.4 8.9 12 21.6" fill="none" stroke="currentColor" stroke-width=".7" opacity=".55"/>'
    + '</svg>';

  var css = ''
    /* ---------- launcher ---------- */
    + '.adk-launch{position:fixed;right:20px;bottom:20px;z-index:2147482000;display:flex;align-items:center;'
    + 'border:1px solid #101010;background:#101010;color:#FBFAF7;border-radius:999px;cursor:pointer;padding:0;'
    + 'overflow:hidden;'
    + 'transition:transform .4s cubic-bezier(.22,1,.36,1),background .3s ease}'
    + '.adk-launch:hover{transform:translateY(-2px)}'
    + '.adk-launch:focus-visible{outline:2px solid #A81E1E;outline-offset:4px}'
    + '.adk-orb{width:48px;height:48px;display:grid;place-items:center;flex:0 0 48px;color:#FBFAF7;'
    + 'transform-origin:50% 50%}'
    + '.adk-gem{width:25px;height:25px;display:block}'
    + '.adk-launch[data-state="orb"] .adk-orb{animation:adk-rock 3.2s cubic-bezier(.45,0,.55,1) infinite}'
    + '@keyframes adk-rock{0%,54%,100%{transform:rotate(0)}'
    + '59%{transform:rotate(-28deg)}64%{transform:rotate(24deg)}69%{transform:rotate(-12deg)}75%{transform:rotate(6deg)}}'
    + '.adk-label{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.13em;'
    + 'text-transform:uppercase;white-space:nowrap;opacity:0;max-width:0;margin-right:0;'
    + 'transition:opacity .28s ease .04s,max-width .46s cubic-bezier(.22,1,.36,1),margin-right .46s cubic-bezier(.22,1,.36,1)}'
    + '.adk-launch[data-state="pill"] .adk-label,.adk-launch[data-state="label"] .adk-label{'
    + 'opacity:1;max-width:160px;margin-right:14px}'
    + '.adk-launch[data-state="pill"]{animation:adk-in .7s cubic-bezier(.22,1,.36,1) both}'
    + '@keyframes adk-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}'
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
    + '@media(prefers-reduced-motion:reduce){.adk-orb,.adk-launch,.adk-panel{animation:none!important;'
    + 'transition:none!important}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- launcher ---- */
  var launch = document.createElement('button');
  launch.className = 'adk-launch';
  launch.type = 'button';
  launch.dataset.state = 'pill';
  launch.setAttribute('aria-label', 'Ask the ALETH desk');
  launch.innerHTML = '<span class="adk-orb">' + GEM + '</span>'
    + '<span class="adk-label">Ask the desk</span>';

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
  document.body.appendChild(panel);

  var log = panel.querySelector('.adk-log');
  var input = panel.querySelector('input');
  var form = panel.querySelector('form');
  var send = form.querySelector('button');
  var hist = [];
  var started = false;
  var autoFold = null;
  var guideShown = false;

  function setState(s) { launch.dataset.state = s; }

  function foldAfter(ms) {
    clearTimeout(autoFold);
    autoFold = setTimeout(function () {
      if (panel.classList.contains('open')) return;
      if (launch.dataset.state === 'label') setState('orb');
    }, ms);
  }

  function turn(text, cls) {
    var d = document.createElement('div');
    d.className = 'adk-t' + (cls === 'me' ? ' me' : '');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function openPanel() {
    clearTimeout(autoFold);
    panel.classList.add('open');
    launch.style.display = 'none';
    if (!started) {
      started = true;
      turn('What are you working on — paint, glass, wheels, or interior?');
    }
    setTimeout(function () { input.focus(); }, 90);
  }

  function closePanel() {
    panel.classList.remove('open');
    launch.style.display = 'flex';
    setState('orb');
  }

  /* 1 — label on arrival; folds to the diamond after five seconds */
  setTimeout(function () {
    if (panel.classList.contains('open')) return;
    if (launch.dataset.state === 'pill') setState('orb');
  }, 5000);

  /* 2 — scrolling past the guide wakes the label once, then it folds again */
  window.addEventListener('scroll', function () {
    if (guideShown || panel.classList.contains('open')) return;
    var seen = window.scrollY + window.innerHeight * 0.55;
    if (seen > document.body.scrollHeight * 0.42) {
      guideShown = true;
      if (launch.dataset.state !== 'label') {
        setState('label');
        foldAfter(5000);
      }
    }
  }, { passive: true });

  /* 3 — tap once for the label; tap again to open. Idle label folds in 3.5s */
  launch.addEventListener('click', function () {
    if (launch.dataset.state === 'label') { openPanel(); return; }
    setState('label');
    foldAfter(3500);
  });

  document.addEventListener('click', function (e) {
    if (!launch.contains(e.target) && launch.dataset.state === 'label') {
      clearTimeout(autoFold);
      setState('orb');
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
