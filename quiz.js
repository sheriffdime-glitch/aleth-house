/* ALETH — Find your formula. Shared quiz module: opens in place on any page. */
(function () {
  if (document.getElementById('fyfModal')) return;

  /* modal shell, injected */
  var modal = document.createElement('div');
  modal.className = 'fyf-modal';
  modal.id = 'fyfModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Find your formula');
  modal.hidden = true;
  modal.innerHTML =
    '<div class="fyf-veil" id="fyfVeil"></div>' +
    '<div class="fyf-card" id="fyfCard" tabindex="-1">' +
      '<div class="fyf-prog" id="fyfProg"><span></span></div>' +
      '<button class="fyf-x" id="fyfClose" aria-label="Close">&times;</button>' +
      '<div class="fyf-box" id="fyfBox"></div>' +
    '</div>';
  document.body.appendChild(modal);

  /* vial fallback (defined inline on some pages) */
  if (typeof window.vial !== 'function') {
    window.vial = function (p, lg) {
      return '<span class="vial' + (lg ? ' vial-lg' : '') + '" style="--liquid:' + p.liquid + ';--acc:' + p.accent + '">' +
        '<span class="vial-shadow"></span>' +
        '<span class="vial-spray"></span><span class="vial-cap"></span>' +
        '<span class="vial-body"><span class="vial-liquid"></span></span>' +
        '<span class="vial-label"><b>ALETH</b><span>' + p.name + '</span></span>' +
      '</span>';
    };
  }

  var box = modal.querySelector('#fyfBox');
  var card = modal.querySelector('#fyfCard');
  var prog = modal.querySelector('#fyfProg span');
  var ROM = ['I', 'II', 'III'];
  var QS = [
    { q: 'Where does the work begin?', opts: ['Wheels and tires', 'Paint and body', 'Glass', 'The cabin', 'The whole machine'] },
    { q: 'How do you run a wash?', opts: ['Foam cannon', 'Bucket and mitt', 'Spray and wipe', 'Whatever the job asks'] },
    { q: 'What should the result be?', opts: ['A deep reset', 'Protection that lasts', 'Speed', 'The gentlest touch'] }
  ];

  function resultFor(a) {
    var zone = a[0], style = a[1], want = a[2];
    if (zone === 0) return 'wheel';
    if (zone === 2) return want === 1 ? 'glass-ceramic' : 'glass';
    if (zone === 3) return (want === 1 || want === 3) ? 'leather' : 'interior';
    if (zone === 4) {
      if (want === 0) return 'multi-purpose';
      if (want === 1) return 'bead';
      if (style === 0) return 'touchless';
      return 'everything';
    }
    if (want === 1) return 'bead';
    if (want === 0) return style === 0 ? 'polarity' : 'strip';
    if (want === 3) return 'wash';
    if (style === 0) return 'touchless';
    if (style === 2) return 'bead';
    return 'wash';
  }

  var ans = [];
  var returnFocus = null;
  function setProg(f) { prog.style.transform = 'scaleX(' + f + ')'; }

  function swap(html, bind) {
    box.classList.add('is-out');
    setTimeout(function () {
      box.innerHTML = html;
      box.classList.remove('is-out');
      box.classList.add('is-in');
      setTimeout(function () { box.classList.remove('is-in'); }, 420);
      if (bind) bind();
    }, 180);
  }

  function renderStep() {
    var i = ans.length;
    setProg((i + 0.35) / 3);
    card.classList.remove('is-result');
    var opts = QS[i].opts.map(function (o, j) {
      return '<button class="fyf-opt" data-j="' + j + '"><span class="fyf-opt-n mono">' + String.fromCharCode(65 + j) + '</span><span>' + o + '</span><span class="fyf-opt-arr">&rarr;</span></button>';
    }).join('');
    swap('<div class="fyf-step">' +
      (i === 0 ? '<p class="fyf-intro mono">Three questions. One formula.</p>' : '') +
      '<p class="fyf-count mono">Question ' + ROM[i] + ' of III</p>' +
      '<p class="fyf-q">' + QS[i].q + '</p>' +
      '<div class="fyf-opts">' + opts + '</div>' +
      (i > 0 ? '<button class="fyf-back mono" id="fyfBack">&larr; Back one</button>' : '') +
    '</div>', function () {
      box.querySelectorAll('.fyf-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          ans.push(+b.dataset.j);
          if (ans.length < 3) renderStep(); else renderResult();
        });
      });
      var back = document.getElementById('fyfBack');
      if (back) back.addEventListener('click', function () { ans.pop(); renderStep(); });
    });
  }

  function renderResult() {
    var p = window.PRODUCTS.find(function (x) { return x.id === resultFor(ans); });
    setProg(1);
    card.classList.add('is-result');
    card.style.setProperty('--acc', p.accent);
    swap('<div class="fyf-result">' +
      '<div class="fyf-result-stage">' + window.vial(p, true) + '</div>' +
      '<div class="fyf-result-copy">' +
        '<p class="fyf-count mono">Your formula</p>' +
        '<p class="fyf-r-name">' + p.name + '</p>' +
        '<p class="fyf-r-kind"><em>' + p.kind + '</em></p>' +
        '<p class="fyf-r-line">' + p.line + '</p>' +
        (window.isLive(p) ? '' : '<p class="fyf-r-lab mono">In the lab. Leave your email on its page</p>') +
        '<div class="fyf-r-cta"><a class="btn btn-acc" href="product.html?id=' + p.id + '">Open ' + p.name + '</a>' +
        '<button class="fyf-back mono" id="fyfAgain">Run it again</button></div>' +
      '</div>' +
    '</div>', function () {
      document.getElementById('fyfAgain').addEventListener('click', function () { ans = []; renderStep(); });
    });
  }

  function openModal() {
    ans = [];
    returnFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('fyf-lock');
    renderStep();
    requestAnimationFrame(function () { requestAnimationFrame(function () { modal.classList.add('is-open'); }); });
    card.focus({ preventScroll: true });
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('fyf-lock');
    setTimeout(function () {
      modal.hidden = true;
      if (returnFocus && returnFocus.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    }, 380);
  }
  modal.querySelector('#fyfClose').addEventListener('click', closeModal);
  modal.querySelector('#fyfVeil').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(card.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function(el){
      return !el.hidden && el.getClientRects().length;
    });
    if (!focusable.length) { e.preventDefault(); card.focus(); return; }
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    } else if (!card.contains(document.activeElement)) {
      e.preventDefault(); first.focus();
    }
  });

  /* any element can open it */
  document.querySelectorAll('[data-open-quiz], #fyfOpen').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  window.openQuiz = openModal;

  /* deep link: index.html#find-your-formula still works */
  if (location.hash === '#find-your-formula') {
    setTimeout(openModal, 350);
  }
})();
