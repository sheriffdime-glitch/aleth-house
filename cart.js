/* ALETH — cart. localStorage, drawer UI. */
(function () {
  var KEY = 'aleth-cart-v1';

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    renderBadge(); renderDrawer();
    window.dispatchEvent(new Event('aleth-cart-change'));
  }
  function priceFor(id, size) {
    var p = window.productById(id); if (!p) return 0;
    var s = p.sizes.find(function (x) { return x.label === size; }) || p.sizes[0];
    return s.price;
  }
  window.cartAdd = function (id, size, qty) {
    qty = qty || 1;
    var items = read();
    var f = items.find(function (i) { return i.id === id && i.size === size; });
    if (f) f.qty += qty; else items.push({ id: id, size: size, qty: qty });
    write(items); openDrawer();
  };
  window.cartRemove = function (id, size) { write(read().filter(function (i) { return !(i.id === id && i.size === size); })); };
  window.cartSetQty = function (id, size, qty) {
    var items = read();
    var it = items.find(function (i) { return i.id === id && i.size === size; });
    if (!it) return;
    it.qty = Math.max(1, qty); write(items);
  };
  window.cartItems = read;
  window.cartCount = function () { return read().reduce(function (n, i) { return n + i.qty; }, 0); };
  window.cartSubtotal = function () { return read().reduce(function (s, i) { return s + priceFor(i.id, i.size) * i.qty; }, 0); };
  window.cartPriceFor = priceFor;

  function renderBadge() { var b = document.getElementById('cartBadge'); if (b) b.textContent = window.cartCount(); }

  var overlay, drawer;
  function build() {
    if (overlay) return;
    overlay = document.createElement('div'); overlay.className = 'cart-overlay';
    drawer = document.createElement('aside'); drawer.className = 'cart-drawer'; drawer.setAttribute('aria-label', 'Cart');
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    overlay.addEventListener('click', close);
  }
  function open() { build(); renderDrawer(); requestAnimationFrame(function () { overlay.classList.add('is-open'); drawer.classList.add('is-open'); }); }
  function close() { if (!overlay) return; overlay.classList.remove('is-open'); drawer.classList.remove('is-open'); }
  window.cartOpen = open;

  function renderDrawer() {
    if (!drawer) return;
    var items = read();
    var html = '<div class="cart-drawer-head"><span class="mono-ink">Your order</span>' +
      '<button class="cart-close" aria-label="Close">&times;</button></div>';
    if (!items.length) {
      html += '<div class="cart-empty"><p>Nothing selected yet.</p><a class="btn btn-ghost" href="products.html">View the thirteen</a></div>';
    } else {
      html += '<div class="cart-items">';
      items.forEach(function (i) {
        var p = window.productById(i.id); if (!p) return;
        html += '<div class="cart-item">' +
          '<div><span class="cart-item-name">' + p.name + '</span>' +
          '<span class="cart-item-meta mono">' + i.size + ' · ' + window.fmt(priceFor(i.id, i.size)) + '</span></div>' +
          '<div class="cart-item-controls">' +
          '<button data-act="dec" aria-label="Decrease">&minus;</button>' +
          '<span class="mono-ink">' + i.qty + '</span>' +
          '<button data-act="inc" aria-label="Increase">+</button>' +
          '<button class="cart-remove" data-act="rm" aria-label="Remove">&times;</button>' +
          '</div></div>';
      });
      html += '</div>';
      html += '<div class="cart-foot">' +
        '<div class="cart-subtotal"><span>Subtotal</span><strong>' + window.fmt(window.cartSubtotal()) + '</strong></div>' +
        '<span class="cart-shipping mono">Shipping calculated at checkout</span>' +
        '<a class="btn cart-checkout" href="checkout.html">Checkout</a></div>';
    }
    drawer.innerHTML = html;
    drawer.querySelector('.cart-close').addEventListener('click', close);
    drawer.querySelectorAll('.cart-item-controls button').forEach(function (btn, idx) {
      var item = items[Math.floor(idx / 3)];
      btn.addEventListener('click', function () {
        var a = btn.getAttribute('data-act');
        if (a === 'inc') window.cartSetQty(item.id, item.size, item.qty + 1);
        else if (a === 'dec') window.cartSetQty(item.id, item.size, item.qty - 1);
        else window.cartRemove(item.id, item.size);
      });
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    renderBadge();
    document.querySelectorAll('.cart-link').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  });
})();

/* Shared interactions: cursor, reveal, magnetic buttons */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    /* cursor */
    var dot = document.createElement('div'); dot.className = 'cursor';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    var x = -100, y = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; });
    (function loop() {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      dot.style.left = x + 'px'; dot.style.top = y + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      ring.classList.toggle('is-hot', !!e.target.closest('a, button, summary, .ph-dot'));
    });

    /* reveal */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .stagger').forEach(function (el) { io.observe(el); });

    /* magnetic buttons */
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.12 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.2 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  });
})();
