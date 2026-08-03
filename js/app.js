/* ==========================================================================
   TEA & COFFEE CORNER - INTERACTIVE JAVASCRIPT ENGINE
   Features: Cart System, Customizations, WhatsApp Order, Store Hours, Poster Lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // WHATSAPP CONFIGURATION
  // ==========================================================================
  window.USER_WHATSAPP_LINK = "https://chat.whatsapp.com/EBlJ4EXPsZcHRFXS91LkXn";

  window.triggerWhatsAppOrder = function(messageText) {
    const customLink = window.USER_WHATSAPP_LINK.trim();
    
    // Copy order details to clipboard for convenient pasting in group/chat
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(messageText).catch(() => {});
    }

    if (customLink.includes('wa.me') || customLink.includes('whatsapp.com/send')) {
      const text = encodeURIComponent(messageText);
      const separator = customLink.includes('?') ? '&' : '?';
      window.open(`${customLink}${separator}text=${text}`, '_blank');
    } else {
      // Direct opening for WhatsApp group invite link
      window.open(customLink, '_blank');
    }
  };

  // --- MENU DATA ---
  const menuItems = [
    {
      id: 'tea-classic',
      name: 'Classic Tea',
      category: 'tea',
      price: 10,
      image: 'assets/tea.jpg',
      tag: 'Bestseller',
      desc: 'Freshly brewed rich milk tea with a touch of crushed cardamom.'
    },
    {
      id: 'tea-masala',
      name: 'Masala Tea',
      category: 'tea',
      price: 15,
      image: 'assets/masala_tea.jpg',
      tag: 'Chef Special',
      desc: 'Spiced aromatic tea brewed with ginger, cinnamon, clove & black pepper.'
    },
    {
      id: 'coffee-filter',
      name: 'Coffee',
      category: 'coffee',
      price: 20,
      image: 'assets/coffee.jpg',
      tag: 'Customer Favorite',
      desc: 'Rich, dark roasted aromatic filter coffee with creamy froth.'
    },
    {
      id: 'chai-kulhad',
      name: 'Kulhad Chai',
      category: 'special',
      price: 25,
      image: 'assets/kulhad_chai.jpg',
      tag: 'Traditional',
      desc: 'Authentic piping hot chai served in eco-friendly handcrafted clay kulhads.'
    }
  ];

  // --- CART STATE ---
  let cart = JSON.parse(localStorage.getItem('tcc_cart')) || [];
  let selectedCustomizingItem = null;

  // --- INITIALIZATIONS ---
  initHeader();
  initStoreStatus();
  renderMenu('all');
  initFilterAndSearch();
  updateCartUI();
  initScrollReveal();
  initReviews();

  // --- STORE HOURS CHECKER ---
  function initStoreStatus() {
    const statusEl = document.getElementById('storeStatusBadge');
    if (!statusEl) return;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Open 7:00 AM (7) to 10:00 PM (22)
    const isOpen = currentHour >= 7 && currentHour < 22;

    if (isOpen) {
      statusEl.className = 'status-badge';
      statusEl.innerHTML = '<span class="status-dot"></span> OPEN NOW • Closes 10:00 PM';
    } else {
      statusEl.className = 'status-badge closed';
      statusEl.innerHTML = '<span class="status-dot"></span> CLOSED NOW • Opens 7:00 AM';
    }
  }

  // --- HEADER & SCROLL EFFECTS ---
  function initHeader() {
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });

    const burger = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (burger && navLinks) {
      burger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
      });
    }
  }

  // --- RENDER MENU ITEMS ---
  function renderMenu(categoryFilter = 'all', searchQuery = '') {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    const filtered = menuItems.filter(item => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--muted);">
          <p>No delicious brews found matching your search.</p>
        </div>
      `;
      return;
    }

    menuGrid.innerHTML = filtered.map(item => `
      <div class="menu-card reveal in">
        <div class="menu-img-wrap">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="menu-tag">${item.tag}</span>
        </div>
        <div class="menu-body">
          <div class="menu-header-row">
            <h3>${item.name}</h3>
            <span class="menu-price">&#8377;${item.price}</span>
          </div>
          <p class="menu-desc">${item.desc}</p>
          <div class="menu-footer">
            <button class="btn btn-solid btn-sm" onclick="window.openCustomizeModal('${item.id}')">
              + Add
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- FILTER & SEARCH EVENT LISTENERS ---
  function initFilterAndSearch() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('menuSearchInput');

    let activeCategory = 'all';

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderMenu(activeCategory, searchInput ? searchInput.value : '');
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderMenu(activeCategory, e.target.value);
      });
    }
  }

  // --- CUSTOMIZATION MODAL ---
  window.openCustomizeModal = function(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    selectedCustomizingItem = item;
    const modal = document.getElementById('customizeModal');
    const content = document.getElementById('customizeModalContent');

    content.innerHTML = `
      <h3 style="margin-bottom: 6px;">${item.name}</h3>
      <p style="color: var(--gold-light); font-size: 18px; font-weight: 700; margin-bottom: 20px;">
        Base Price: &#8377;${item.price}
      </p>

      <div class="field" style="margin-bottom: 16px;">
        <label>Sugar Preference</label>
        <select id="custSugar">
          <option value="Regular Sugar">Regular Sugar</option>
          <option value="Less Sugar">Less Sugar</option>
          <option value="Sugar Free">Sugar Free</option>
          <option value="Extra Sweet">Extra Sweet</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 16px;">
        <label>Spice / Strength</label>
        <select id="custStrength">
          <option value="Standard Brew">Standard Brew</option>
          <option value="Strong (Kadak)">Strong (Kadak)</option>
          <option value="Extra Ginger Spice">Extra Ginger Spice</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 20px;">
        <label>Cup Upgrade</label>
        <select id="custCup">
          <option value="Standard Cup (+₹0)">Standard Paper Cup (+₹0)</option>
          <option value="Earthy Clay Kulhad (+₹5)">Earthy Clay Kulhad (+₹5)</option>
        </select>
      </div>

      <div class="field" style="margin-bottom: 24px;">
        <label>Quantity</label>
        <div class="qty-controls" style="margin-top: 4px;">
          <button class="qty-btn" onclick="changeCustQty(-1)">-</button>
          <span id="custQtyVal" style="font-weight: 700; font-size: 16px; padding: 0 12px;">1</span>
          <button class="qty-btn" onclick="changeCustQty(1)">+</button>
        </div>
      </div>

      <button class="btn btn-whatsapp" style="width: 100%; justify-content: center; gap: 8px;" onclick="confirmWhatsAppOrder()">
        <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        Order via WhatsApp
      </button>
    `;

    modal.classList.add('open');
  };

  window.closeCustomizeModal = function() {
    document.getElementById('customizeModal').classList.remove('open');
  };

  let currentCustQty = 1;
  window.changeCustQty = function(delta) {
    currentCustQty = Math.max(1, currentCustQty + delta);
    document.getElementById('custQtyVal').textContent = currentCustQty;
  };

  window.confirmWhatsAppOrder = function() {
    if (!selectedCustomizingItem) return;

    const sugar = document.getElementById('custSugar').value;
    const strength = document.getElementById('custStrength').value;
    const cup = document.getElementById('custCup').value;
    const isKulhadUpgrade = cup.includes('+₹5');
    const unitPrice = selectedCustomizingItem.price + (isKulhadUpgrade ? 5 : 0);
    const totalPrice = unitPrice * currentCustQty;

    const message = `☕ *Tea & Coffee Corner Order*\n` +
                    `----------------------------------\n` +
                    `*Item:* ${currentCustQty}x ${selectedCustomizingItem.name}\n` +
                    `*Customization:* ${sugar} • ${strength} • ${cup.split(' (')[0]}\n` +
                    `*Total Price:* ₹${totalPrice}\n` +
                    `----------------------------------\n` +
                    `*Address:* Vishweshraiya Bhawan (University Campus), NH-33, Sindoor, Hazaribagh, Jharkhand - 825301\n\n` +
                    `Please confirm order availability!`;

    closeCustomizeModal();
    currentCustQty = 1;
    showToast('Opening WhatsApp with your order details...');
    triggerWhatsAppOrder(message);
  };

  // --- CART MANAGEMENT ---
  function saveCart() {
    localStorage.setItem('tcc_cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const countEl = document.getElementById('cartBadgeCount');
    const cartBody = document.getElementById('cartBody');
    const subtotalEl = document.getElementById('cartSubtotal');
    const grandTotalEl = document.getElementById('cartGrandTotal');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    if (countEl) countEl.textContent = totalCount;

    if (cartBody) {
      if (cart.length === 0) {
        cartBody.innerHTML = `
          <div class="empty-cart-msg">
            <svg style="width:48px;height:48px;stroke:var(--gold-dim);margin:0 auto 12px;" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <p>Your order basket is empty.<br>Select items from our menu to begin!</p>
          </div>
        `;
      } else {
        cartBody.innerHTML = cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p class="options">${item.options}</p>
              <span class="cart-item-price">&#8377;${item.unitPrice * item.quantity} (&#8377;${item.unitPrice} each)</span>
              <div class="qty-controls">
                <button class="qty-btn" onclick="updateCartItemQty('${item.cartId}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartItemQty('${item.cartId}', 1)">+</button>
              </div>
            </div>
            <button class="remove-cart-item" onclick="removeCartItem('${item.cartId}')" title="Remove item">&times;</button>
          </div>
        `).join('');
      }
    }

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${subtotal}`;
  }

  window.updateCartItemQty = function(cartId, delta) {
    const item = cart.find(i => i.cartId === cartId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.cartId !== cartId);
      }
      saveCart();
      updateCartUI();
    }
  };

  window.removeCartItem = function(cartId) {
    cart = cart.filter(i => i.cartId !== cartId);
    saveCart();
    updateCartUI();
    showToast('Item removed from basket.');
  };

  // --- CART DRAWER TOGGLE ---
  const cartTrigger = document.getElementById('cartTriggerBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');

  if (cartTrigger && cartDrawer && cartOverlay) {
    cartTrigger.addEventListener('click', () => {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
    });

    const closeCart = () => {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('open');
    };

    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
  }

  // --- CHECKOUT & EMAIL INTEGRATION ---
  window.sendEmailOrder = function() {
    if (cart.length === 0) {
      showToast('Your order basket is empty!');
      return;
    }

    let subject = "Tea & Coffee Corner Order";
    let body = `Hello Tea & Coffee Corner,\n\nI would like to place the following order:\n----------------------------------\n`;
    let total = 0;

    cart.forEach((item, idx) => {
      const itemTotal = item.unitPrice * item.quantity;
      total += itemTotal;
      body += `${idx + 1}. ${item.name} x${item.quantity}\n   Customization: ${item.options}\n   Price: ₹${itemTotal}\n\n`;
    });

    body += `----------------------------------\nTotal Amount: ₹${total}\n\nDelivery/Pickup Address: Vishweshraiya Bhawan (University Campus), NH-33, Sindoor, Hazaribagh, Jharkhand - 825301\n\nPlease confirm availability and estimated prep time!`;

    const mailtoUrl = `mailto:enterentire5@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  window.checkoutModal = function() {
    if (cart.length === 0) {
      showToast('Your order basket is empty!');
      return;
    }

    const modal = document.getElementById('receiptModal');
    const content = document.getElementById('receiptModalContent');
    const orderId = 'TCC-' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="script-font" style="color: var(--gold-light); font-size: 26px;">Thank You!</span>
        <h3 style="font-size: 24px;">Order Confirmed</h3>
        <p style="color: var(--muted); font-size: 13px;">Order ID: <b>${orderId}</b></p>
      </div>

      <div style="background: var(--bg-alt); padding: 16px; border-radius: 6px; border: 1px solid var(--line); margin-bottom: 20px;">
        ${cart.map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span>${item.quantity}x ${item.name} <small style="display:block; color:var(--muted); font-size:11px;">${item.options}</small></span>
            <b>&#8377;${item.unitPrice * item.quantity}</b>
          </div>
        `).join('')}
        <hr style="border: 0; border-top: 1px solid var(--line); margin: 12px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; color: var(--gold-light);">
          <span>Total</span>
          <span>&#8377;${subtotal}</span>
        </div>
      </div>

      <p style="text-align: center; font-size: 13px; color: var(--muted); margin-bottom: 20px;">
        ⏱️ Estimated Prep Time: <b>5 - 8 mins</b><br>
        Your order is being fresh-brewed at the corner!
      </p>

      <button class="btn btn-solid" style="width: 100%;" onclick="clearCartAndCloseReceipt()">
        Done &amp; Clear Basket
      </button>
    `;

    modal.classList.add('open');
  };

  window.clearCartAndCloseReceipt = function() {
    cart = [];
    saveCart();
    updateCartUI();
    document.getElementById('receiptModal').classList.remove('open');
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
    showToast('Thank you! Your order has been registered.');
  };

  window.closeReceiptModal = function() {
    document.getElementById('receiptModal').classList.remove('open');
  };

  // --- POSTER LIGHTBOX ---
  window.openPosterLightbox = function() {
    const modal = document.getElementById('posterModal');
    modal.classList.add('open');
  };

  window.closePosterModal = function() {
    document.getElementById('posterModal').classList.remove('open');
  };

  // --- REVIEWS SYSTEM ---
  function initReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    const defaultReviews = [
      { name: 'Rahul Sharma', text: 'Best Kulhad Chai in town! The ginger spice ratio is absolute perfection.', rating: 5, date: '2 days ago' },
      { name: 'Priya Verma', text: 'Filter coffee for ₹20 is unbelievable value. Tastes so authentic and hot!', rating: 5, date: '1 week ago' },
      { name: 'Amit Patel', text: 'Clean, fast service, and honest pricing. My daily morning stop before work.', rating: 5, date: '3 days ago' }
    ];

    const savedReviews = JSON.parse(localStorage.getItem('tcc_reviews')) || defaultReviews;

    reviewsGrid.innerHTML = savedReviews.map(r => `
      <div class="review-card">
        <div class="stars">${'★'.repeat(r.rating)}</div>
        <p class="review-text">"${r.text}"</p>
        <div class="reviewer">
          <div class="avatar">${r.name.charAt(0)}</div>
          <div class="reviewer-info">
            <h5>${r.name}</h5>
            <span>${r.date}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.handleReviewSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('revName').value;
    const text = document.getElementById('revText').value;
    const rating = parseInt(document.getElementById('revRating').value);

    const savedReviews = JSON.parse(localStorage.getItem('tcc_reviews')) || [];
    savedReviews.unshift({ name, text, rating, date: 'Just now' });
    localStorage.setItem('tcc_reviews', JSON.stringify(savedReviews));

    initReviews();
    document.getElementById('reviewModal').classList.remove('open');
    e.target.reset();
    showToast('Thank you for sharing your review!');
    return false;
  };

  window.openReviewModal = function() {
    document.getElementById('reviewModal').classList.add('open');
  };
  window.closeReviewModal = function() {
    document.getElementById('reviewModal').classList.remove('open');
  };

  // --- WHATSAPP FORM HANDLER ---
  window.handleWhatsAppFormSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const orderNotes = document.getElementById('message').value;

    const message = `☕ *Tea & Coffee Corner Order*\n` +
                    `----------------------------------\n` +
                    `*Customer Name:* ${name}\n` +
                    `*Order Details:* ${orderNotes}\n` +
                    `----------------------------------\n` +
                    `*Location:* Vishweshraiya Bhawan (University Campus), NH-33, Sindoor, Hazaribagh, Jharkhand - 825301`;

    showToast('Launching WhatsApp with your order...');
    triggerWhatsAppOrder(message);
    return false;
  };

  // --- TOAST NOTIFIER ---
  function showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <svg style="width:20px;height:20px;stroke:var(--gold);" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${message}</span>
    `;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // --- SCROLL REVEAL OBSERVER ---
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => io.observe(el));
  }
});
