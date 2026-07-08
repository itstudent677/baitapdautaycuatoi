// ==================== SWITCH TAB LOGIN/SIGNUP ====================
function switchTab(tab, e) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(tab + '-form').classList.add('active');
  (e || event).currentTarget.classList.add('active');
}

// ==================== KHỞI ĐỘNG KHI DOM SẴN SÀNG ====================
document.addEventListener('DOMContentLoaded', function () {

  // ---- Toggle hiện/ẩn mật khẩu ----
  ['eye', 'eye2'].forEach(function (id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      const input = this.closest('.password-wrapper').querySelector('input');
      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye-low-vision', 'fa-eye');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye', 'fa-eye-low-vision');
      }
    });
  });

  // ---- FAQ toggle ----
  document.querySelectorAll('.faq-item h4').forEach(function (h4) {
    h4.addEventListener('click', function () {
      const p = this.nextElementSibling;
      if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
    });
  });

  // ---- Mobile menu ----
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  }

  // ==================== GIỎ HÀNG (badge chung cho mọi trang) ====================
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  function updateCartBadge() {
    document.querySelectorAll('.cart-badge, #nav-badge').forEach(function(badge) {
      badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
    });
  }

  // addToCart dùng trên index.html và shop.html
  window.addToCart = function (nameOrBtn, priceOrName, imgOrPrice, imgParam) {
    // Hỗ trợ 2 kiểu gọi:
    // addToCart(btn, name, price, img)  — từ shop.html
    // addToCart(name, price, img)       — từ index.html
    let name, price, img, btn = null;
    if (typeof nameOrBtn === 'string') {
      name = nameOrBtn; price = priceOrName; img = imgOrPrice;
    } else {
      btn = nameOrBtn; name = priceOrName; price = imgOrPrice; img = imgParam;
    }

    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, img, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();

    if (btn) {
      btn.textContent = '✅ Đã thêm!';
      btn.classList.add('added');
      setTimeout(function () {
        btn.textContent = '🛒 Thêm vào giỏ';
        btn.classList.remove('added');
      }, 1500);
    } else {
      alert('✅ Đã thêm "' + name + '" vào giỏ hàng!');
    }
  };

  updateCartBadge();

  // ==================== XỬ LÝ LOGIN / SIGNUP ====================
  const loginBtn = document.getElementById('btn-login');
  const signupBtn = document.getElementById('btn-signup');

  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      if (!email || !password) {
        showAuthMsg('login-msg', '⚠️ Vui lòng nhập đầy đủ email và mật khẩu!', 'error');
        return;
      }
      // Giả lập đăng nhập thành công (frontend demo)
      showAuthMsg('login-msg', '✅ Đăng nhập thành công! Chào mừng bạn trở lại 🎉', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', function () {
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value.trim();
      if (!name || !email || !password) {
        showAuthMsg('signup-msg', '⚠️ Vui lòng điền đầy đủ thông tin!', 'error');
        return;
      }
      if (password.length < 6) {
        showAuthMsg('signup-msg', '⚠️ Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
      }
      showAuthMsg('signup-msg', '✅ Tạo tài khoản thành công! Đang chuyển hướng...', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    });
  }

  function showAuthMsg(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'success' ? '#2e7d52' : '#e06b6b';
    el.style.display = 'block';
  }

  // ==================== TRANG GIỎ HÀNG (cart.html) ====================
  const cartContainer = document.getElementById('cart-items-container');
  if (cartContainer) {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    function renderCart() {
      if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart-message"><p style="font-size:3rem">🛒</p><h3>Giỏ hàng trống!</h3><a href="shop.html" class="btn btn-primary" style="margin-top:20px">Mua sắm ngay</a></div>';
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$3.00';
        return;
      }
      cartContainer.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
          <img src="${item.img}" class="cart-item-img" onerror="this.src=''" alt="${item.name}">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem(${i})">Xóa</button>
          </div>
        </div>
      `).join('');
      const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
      if (subtotalEl) subtotalEl.textContent = '$' + sub.toFixed(2);
      if (totalEl) totalEl.textContent = '$' + (sub + 3).toFixed(2);
      updateCartBadge();
    }

    window.changeQty = function (i, d) {
      cart[i].qty += d;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    };

    window.removeItem = function (i) {
      cart.splice(i, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    };

    renderCart();
  }

  // ==================== HIỆU ỨNG HOA ANH ĐÀO ====================
  const petalsContainer = document.getElementById('petals-container');
  if (petalsContainer) {
    function createPetal() {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const size = Math.random() * 6 + 6;
      const duration = Math.random() * 3 + 4;
      petal.style.left = Math.random() * 100 + '%';
      petal.style.width = petal.style.height = size + 'px';
      petal.style.animationDuration = duration + 's';
      petal.style.opacity = Math.random() * 0.4 + 0.4;
      petalsContainer.appendChild(petal);
      setTimeout(() => petal.remove(), (duration + 1) * 1000);
    }
    setInterval(createPetal, 220);
    for (let i = 0; i < 12; i++) setTimeout(createPetal, i * 120);
  }

  // ==================== TRANG CHECKOUT ====================
  const orderItemsEl = document.getElementById('order-items');
  if (orderItemsEl) {
    let discountPct = 0;
    const COUPONS = { 'YNSTORE10': 10, 'BEAR20': 20, 'SOFT5': 5 };
    const orderId = 'ORDER-' + Math.floor(Math.random() * 90000 + 10000);

    const momoId = document.getElementById('momo-order-id');
    const bankId = document.getElementById('bank-order-id');
    if (momoId) momoId.textContent = orderId;
    if (bankId) bankId.textContent = orderId;

    function renderOrder() {
      if (!cart.length) {
        orderItemsEl.innerHTML = '<div style="text-align:center;padding:20px;color:#bbb;font-size:0.9rem;">Giỏ hàng trống<br><a href="shop.html" style="color:var(--soft-pink)">← Mua sắm ngay</a></div>';
        updateTotals();
        return;
      }
      orderItemsEl.innerHTML = cart.map(item => `
        <div class="order-item">
          <div class="order-item-img-placeholder">🧸</div>
          <div style="flex:1;min-width:0;">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-qty">x${item.qty}</div>
          </div>
          <div class="order-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
      `).join('');
      updateTotals();
    }

    function updateTotals() {
      const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const disc = sub * discountPct / 100;
      const total = sub - disc + 3;
      const subEl = document.getElementById('order-subtotal');
      const totEl = document.getElementById('order-total');
      const discRow = document.getElementById('discount-row');
      const discAmt = document.getElementById('discount-amount');
      if (subEl) subEl.textContent = '$' + sub.toFixed(2);
      if (totEl) totEl.textContent = '$' + total.toFixed(2);
      if (discRow) discRow.style.display = disc > 0 ? 'flex' : 'none';
      if (discAmt) discAmt.textContent = '-$' + disc.toFixed(2);
      updateCartBadge();
    }

    window.selectPayment = function (el) {
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
      el.classList.add('selected');
      const method = el.dataset.method;
      const cardFields = document.getElementById('card-fields');
      const momoInfo = document.getElementById('momo-info');
      const bankInfo = document.getElementById('bank-info');
      if (cardFields) cardFields.classList.toggle('visible', method === 'card');
      if (momoInfo) momoInfo.style.display = method === 'momo' ? 'block' : 'none';
      if (bankInfo) bankInfo.style.display = method === 'bank' ? 'block' : 'none';
    };

    window.formatCard = function (input) {
      let v = input.value.replace(/\D/g, '').substring(0, 16);
      input.value = v.replace(/(.{4})/g, '$1 ').trim();
    };

    window.formatExpiry = function (input) {
      let v = input.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
      input.value = v;
    };

    window.applyCoupon = function () {
      const code = document.getElementById('coupon-input').value.trim().toUpperCase();
      const msg = document.getElementById('coupon-msg');
      if (COUPONS[code]) {
        discountPct = COUPONS[code];
        msg.style.color = '#2e7d52';
        msg.textContent = `✅ Áp dụng thành công! Giảm ${discountPct}%`;
        updateTotals();
      } else {
        msg.style.color = '#e06b6b';
        msg.textContent = 'Mã không hợp lệ. Thử: YNSTORE10, BEAR20, SOFT5';
      }
    };

    window.placeOrder = function () {
      const fields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city'];
      for (const f of fields) {
        const el = document.getElementById(f);
        if (!el || !el.value.trim()) {
          alert('⚠️ Vui lòng điền đầy đủ thông tin giao hàng!');
          return;
        }
      }
      if (!cart.length) { alert('⚠️ Giỏ hàng trống!'); return; }
      localStorage.removeItem('cart');
      const successId = document.getElementById('success-order-id');
      const overlay = document.getElementById('success-overlay');
      if (successId) successId.textContent = 'Mã đơn hàng: ' + orderId;
      if (overlay) overlay.classList.add('show');
    };

    renderOrder();
  }

}); // end DOMContentLoaded