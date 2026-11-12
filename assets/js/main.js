/**
 * Sri Vijaya Clinical Laboratories - Core Interactive Engine
 * Handles Cart, WhatsApp Booking Integrations, Prescription Upload Flow,
 * Smooth Animated Counters, Modern Reviews Slider, Live Search Autocomplete & Responsive UI.
 */

// Global Cart & Booking State
const VijayaCart = {
  items: [],

  init() {
    try {
      const saved = localStorage.getItem('svl_cart');
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch (e) {
      this.items = [];
    }
    this.updateUI();
  },

  save() {
    try {
      localStorage.setItem('svl_cart', JSON.stringify(this.items));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    this.updateUI();
  },

  addItem(item, type = 'test') {
    if (!item) return;
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      showToast(`"${item.name}" is already in your booking list!`, 'info');
      this.openDrawer();
      return;
    }

    this.items.push({
      id: item.id,
      name: item.name,
      type: type,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      code: item.code || (type === 'package' ? 'PKG' : 'TEST'),
      sampleType: item.sampleType || 'Blood & Urine',
      fasting: item.fasting || 'As specified',
      turnaround: item.turnaround || 'Same Day'
    });

    this.save();
    showToast(`Added "${item.name}" to your booking.`, 'success');
    this.openDrawer();
  },

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    showToast('Item removed from booking.', 'info');
  },

  clear() {
    this.items = [];
    this.save();
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },

  getOriginalTotal() {
    return this.items.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  },

  getSavings() {
    return Math.max(0, this.getOriginalTotal() - this.getTotal());
  },

  updateUI() {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.textContent = this.items.length;
      b.style.display = this.items.length > 0 ? 'flex' : 'none';
    });

    const body = document.getElementById('cartDrawerBody');
    const footer = document.getElementById('cartDrawerFooter');

    if (!body || !footer) return;

    if (this.items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon"><i class="fa-solid fa-vial-circle-check"></i></div>
          <h4 style="color: var(--primary-900); margin-bottom: 0.5rem; font-size: 1.2rem;">Your Booking List is Empty</h4>
          <p style="color: var(--neutral-500); font-size: 0.9rem; margin-bottom: 1.5rem;">Explore our routine tests or preventive health packages to book with doorstep sample collection.</p>
          <a href="tests.html" class="btn btn-outline-primary btn-sm" onclick="VijayaCart.closeDrawer()">Browse Tests Catalogue</a>
        </div>
      `;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    let html = '';
    this.items.forEach(item => {
      html += `
        <div class="cart-item-row">
          <div style="flex: 1; padding-right: 0.75rem;">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">
              <span class="badge ${item.type === 'package' ? 'badge-teal' : 'badge-primary'}">${item.type === 'package' ? 'Health Package' : item.code}</span>
              <span style="margin-left: 0.4rem;"><i class="fa-solid fa-droplet" style="font-size: 0.75rem;"></i> ${item.sampleType}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
            <span class="cart-item-remove-btn" onclick="VijayaCart.removeItem('${item.id}')" title="Remove test">
              <i class="fa-solid fa-trash-can"></i>
            </span>
          </div>
        </div>
      `;
    });

    body.innerHTML = html;

    const totalEl = document.getElementById('cartTotalDisplay');
    const subtotalEl = document.getElementById('cartSubtotalDisplay');
    const savingsEl = document.getElementById('cartSavingsDisplay');

    if (totalEl) totalEl.textContent = `₹${this.getTotal().toLocaleString('en-IN')}`;
    if (subtotalEl) subtotalEl.textContent = `₹${this.getOriginalTotal().toLocaleString('en-IN')}`;
    if (savingsEl) savingsEl.textContent = `₹${this.getSavings().toLocaleString('en-IN')}`;
  },

  openDrawer() {
    const backdrop = document.getElementById('cartBackdrop');
    if (backdrop) backdrop.classList.add('open');
  },

  closeDrawer() {
    const backdrop = document.getElementById('cartBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }
};

// Toast Notifications System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}" style="color: ${type === 'success' ? 'var(--emerald-500)' : 'var(--accent-teal)'};"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Smooth Number Counter Animation from 0 to Target Value
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.stat-number[data-target], .hero-counter-number[data-target], [data-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseFloat(counter.getAttribute('data-target')) || 0;
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const startTime = performance.now();

        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutCubic curve
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeProgress * target);

          counter.textContent = prefix + currentVal.toLocaleString('en-IN') + suffix;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            counter.textContent = prefix + target.toLocaleString('en-IN') + suffix;
          }
        }

        requestAnimationFrame(animate);
        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.25 });

  counterElements.forEach(el => observer.observe(el));
}

// PIN Code Verification Engine
function checkServicePincode(pincodeInputId, resultContainerId) {
  const input = document.getElementById(pincodeInputId);
  const container = document.getElementById(resultContainerId);
  if (!input || !container) return;

  const pin = input.value.trim();
  if (pin.length !== 6 || isNaN(pin)) {
    container.className = 'pincode-result-box warning';
    container.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Please enter a valid 6-digit postal PIN code.</span>';
    container.style.display = 'flex';
    return;
  }

  const lookup = VIJAYA_DATA.serviceablePincodes[pin];
  if (lookup && lookup.available) {
    container.className = 'pincode-result-box success';
    container.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      <div>
        <strong>Home Collection Available in ${lookup.city}!</strong>
        <div style="font-size: 0.82rem; margin-top: 3px;">Phlebotomist arrival: ${lookup.standardTime}. <strong>FREE</strong> on orders above ₹500.</div>
      </div>
    `;
    container.style.display = 'flex';
  } else {
    container.className = 'pincode-result-box warning';
    container.innerHTML = `
      <i class="fa-solid fa-location-dot"></i>
      <div>
        <strong>PIN code ${pin} is outside standard route.</strong>
        <div style="font-size: 0.82rem; margin-top: 3px;">Custom doorstep phlebotomy can be scheduled via phone. Call <a href="tel:+919577334499" style="text-decoration: underline; font-weight: 700;">+91 95773 34499</a> or WhatsApp us.</div>
      </div>
    `;
    container.style.display = 'flex';
  }
}

// Redesigned Homepage Live Search Bar with Instant Autocomplete
function initHomepageLiveSearch() {
  const searchInput = document.getElementById('homeLiveSearchInput');
  const dropdown = document.getElementById('homeSearchResultsDropdown');
  const clearBtn = document.getElementById('homeSearchClearBtn');

  if (!searchInput || !dropdown) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    if (!q || q.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const matchedTests = VIJAYA_DATA.tests.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      (t.includes && t.includes.some(inc => inc.toLowerCase().includes(q)))
    ).slice(0, 5);

    const matchedPackages = VIJAYA_DATA.packages.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q)
    ).slice(0, 2);

    if (matchedTests.length === 0 && matchedPackages.length === 0) {
      dropdown.innerHTML = `
        <div class="search-dropdown-empty">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; color: var(--neutral-400); margin-bottom: 0.5rem;"></i>
          <p style="font-weight: 600; color: var(--primary-900); margin-bottom: 0.25rem;">No exact match found for "${q}"</p>
          <p style="font-size: 0.82rem; color: var(--neutral-500); margin-bottom: 0.75rem;">Have a doctor's slip? Upload it and our lab team will configure your tests.</p>
          <button class="btn btn-primary btn-sm" onclick="openPrescriptionModal(); document.getElementById('homeSearchResultsDropdown').style.display = 'none';">
            <i class="fa-solid fa-file-prescription"></i> Upload Prescription
          </button>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    let html = '';
    matchedPackages.forEach(pkg => {
      html += `
        <div class="search-dropdown-item package-item">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="badge badge-teal" style="font-size: 0.7rem;">Package</span>
              <strong style="color: var(--primary-900); font-size: 0.95rem;">${pkg.name}</strong>
            </div>
            <div style="font-size: 0.8rem; color: var(--neutral-500); margin-top: 2px;">${pkg.parameters} Parameters · ${pkg.tagline}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; color: var(--primary-900); font-size: 1.05rem;">₹${pkg.price.toLocaleString('en-IN')}</span>
            <button class="btn btn-accent btn-sm" onclick="VijayaCart.addItem(VIJAYA_DATA.packages.find(p => p.id === '${pkg.id}'), 'package')">
              <i class="fa-solid fa-plus"></i> Book
            </button>
          </div>
        </div>
      `;
    });

    matchedTests.forEach(test => {
      html += `
        <div class="search-dropdown-item">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span class="badge badge-primary" style="font-size: 0.7rem;">${test.code}</span>
              <strong style="color: var(--primary-900); font-size: 0.92rem;">${test.name}</strong>
            </div>
            <div style="font-size: 0.78rem; color: var(--neutral-500); margin-top: 2px;">
              <i class="fa-solid fa-droplet" style="color: var(--accent-teal);"></i> ${test.sampleType} · <i class="fa-solid fa-clock"></i> ${test.turnaround}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; color: var(--primary-900);">₹${test.price}</span>
            <button class="btn btn-outline-primary btn-sm" onclick="VijayaCart.addItem(VIJAYA_DATA.tests.find(t => t.id === '${test.id}'), 'test')">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      `;
    });

    html += `
      <div style="padding: 0.6rem 1rem; background: var(--neutral-50); border-top: 1px solid var(--neutral-200); text-align: center;">
        <a href="tests.html?q=${encodeURIComponent(q)}" style="font-size: 0.85rem; font-weight: 700; color: var(--primary-600); display: inline-flex; align-items: center; gap: 0.35rem;">
          View all matching tests in directory <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      searchInput.focus();
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// Universal Header Search Modal
function setupUniversalSearch() {
  const triggers = document.querySelectorAll('.search-trigger-btn');
  const modal = document.getElementById('searchModal');
  const closeBtn = document.getElementById('searchModalClose');
  const input = document.getElementById('searchModalInput');
  const resultsContainer = document.getElementById('searchResultsList');

  if (!modal || !input || !resultsContainer) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      modal.classList.add('open');
      setTimeout(() => input.focus(), 100);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderDefaultSearchResults(resultsContainer);
      return;
    }

    const matchedTests = VIJAYA_DATA.tests.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q) ||
      (t.includes && t.includes.some(inc => inc.toLowerCase().includes(q))) ||
      t.code.toLowerCase().includes(q)
    );

    const matchedPackages = VIJAYA_DATA.packages.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q)
    );

    if (matchedTests.length === 0 && matchedPackages.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--neutral-500);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--neutral-300); margin-bottom: 0.75rem;"></i>
          <p>No exact match found for "<strong>${q}</strong>".</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">You can upload your doctor's prescription or chat directly on WhatsApp with our lab team.</p>
          <a href="https://wa.me/919577334499?text=Hello%20Vijaya%20Labs,%20I%20am%20looking%20for%20test:%20${encodeURIComponent(q)}" target="_blank" class="btn btn-whatsapp btn-sm" style="margin-top: 1rem;">
            <i class="fa-brands fa-whatsapp"></i> Enquire on WhatsApp
          </a>
        </div>
      `;
      return;
    }

    let html = '';
    matchedPackages.forEach(pkg => {
      html += `
        <div class="search-result-item" style="border-left: 4px solid var(--accent-teal);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span class="badge badge-teal">Health Package</span>
              <strong style="color: var(--primary-900); font-size: 0.95rem;">${pkg.name}</strong>
            </div>
            <div style="font-size: 0.8rem; color: var(--neutral-500);">${pkg.parameters} Parameters · ${pkg.tagline}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; color: var(--primary-900);">₹${pkg.price.toLocaleString('en-IN')}</span>
            <button class="btn btn-accent btn-sm" onclick="VijayaCart.addItem(VIJAYA_DATA.packages.find(p => p.id === '${pkg.id}'), 'package')">
              <i class="fa-solid fa-plus"></i> Book
            </button>
          </div>
        </div>
      `;
    });

    matchedTests.forEach(test => {
      html += `
        <div class="search-result-item">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span class="badge badge-primary">${test.code}</span>
              <strong style="color: var(--primary-900); font-size: 0.95rem;">${test.name}</strong>
            </div>
            <div style="font-size: 0.8rem; color: var(--neutral-500);"><i class="fa-solid fa-droplet"></i> ${test.sampleType} · <i class="fa-solid fa-clock"></i> ${test.turnaround}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; color: var(--primary-900);">₹${test.price.toLocaleString('en-IN')}</span>
            <button class="btn btn-outline-primary btn-sm" onclick="VijayaCart.addItem(VIJAYA_DATA.tests.find(t => t.id === '${test.id}'), 'test')">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
  });

  renderDefaultSearchResults(resultsContainer);
}

function renderDefaultSearchResults(container) {
  if (!container) return;
  const popular = VIJAYA_DATA.tests.filter(t => t.popular).slice(0, 6);
  let html = '<div style="font-size: 0.8rem; font-weight: 700; color: var(--neutral-400); text-transform: uppercase; margin-bottom: 0.75rem;">Frequently Booked Investigations</div>';
  popular.forEach(t => {
    html += `
      <div class="search-result-item">
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--primary-900);">${t.name}</div>
          <div style="font-size: 0.8rem; color: var(--neutral-500);">${t.sampleType} · Reports in ${t.turnaround}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-weight: 800; color: var(--primary-900);">₹${t.price}</span>
          <button class="btn btn-outline-primary btn-sm" onclick="VijayaCart.addItem(VIJAYA_DATA.tests.find(item => item.id === '${t.id}'), 'test')">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Multi-step Checkout Modal Flow with WhatsApp Integration
function openBookingCheckoutWizard() {
  if (VijayaCart.items.length === 0) {
    showToast('Your booking list is empty. Please add a test or package first.', 'warning');
    return;
  }

  const modal = document.getElementById('checkoutModal');
  if (!modal) return;

  VijayaCart.closeDrawer();
  modal.classList.add('open');
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutItemsReview');
  if (!container) return;

  let html = '';
  VijayaCart.items.forEach(item => {
    html += `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid var(--neutral-100);">
        <span>${item.name} (${item.code})</span>
        <strong>₹${item.price.toLocaleString('en-IN')}</strong>
      </div>
    `;
  });
  container.innerHTML = html;

  const totalEl = document.getElementById('checkoutTotalAmount');
  if (totalEl) totalEl.textContent = `₹${VijayaCart.getTotal().toLocaleString('en-IN')}`;
}

function submitBookingForm(e) {
  e.preventDefault();
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const name = form.patientName.value.trim();
  const phone = form.patientPhone.value.trim();
  const age = form.patientAge ? form.patientAge.value.trim() : 'N/A';
  const collectionType = form.collectionType.value;
  const date = form.bookingDate.value;
  const slot = form.bookingSlot.value;
  const address = form.patientAddress ? form.patientAddress.value.trim() : '';

  const bookingRef = 'SVL-' + Math.floor(100000 + Math.random() * 900000);

  // Build formatted WhatsApp message
  let testLines = VijayaCart.items.map(i => `   • ${i.name} (₹${i.price})`).join('%0A');
  const collectionLabel = collectionType === 'home' ? 'Home Sample Collection' : 'Walk-in Diagnostic Centre';

  const waText = 
    `🏥 *Sri Vijaya Clinical Laboratories - Diagnostic Booking*%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
    `🔖 *Booking Ref ID:* ${bookingRef}%0A` +
    `👤 *Patient Name:* ${encodeURIComponent(name)}%0A` +
    `📞 *Phone:* ${phone}%0A` +
    `🎂 *Age / Gender:* ${encodeURIComponent(age)}%0A` +
    `📍 *Collection Mode:* ${collectionLabel}%0A` +
    `📅 *Preferred Date:* ${date}%0A` +
    `⏰ *Time Slot:* ${encodeURIComponent(slot)}%0A` +
    (address ? `🏠 *Address:* ${encodeURIComponent(address)}%0A` : '') +
    `🧪 *Selected Investigations:*%0A${testLines}%0A` +
    `💰 *Estimated Total:* ₹${VijayaCart.getTotal().toLocaleString('en-IN')}%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
    `Please confirm my appointment slot. Thank you!`;

  const waUrl = `https://wa.me/919577334499?text=${waText}`;

  // Render Confirmation State in Modal
  const wizardContainer = document.getElementById('checkoutWizardContent');
  if (wizardContainer) {
    wizardContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--emerald-100); color: var(--emerald-600); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.25rem auto;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-size: 1.6rem; color: var(--primary-900); margin-bottom: 0.5rem;">Booking Confirmed!</h3>
        <p style="color: var(--neutral-600); margin-bottom: 1.5rem;">Thank you, <strong>${name}</strong>. Your test request has been logged successfully.</p>
        
        <div style="background: var(--neutral-50); border: 1.5px dashed var(--primary-300); border-radius: var(--radius-md); padding: 1.25rem; max-width: 480px; margin: 0 auto 1.75rem auto; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: var(--neutral-500); font-size: 0.85rem;">Booking Reference ID:</span>
            <strong style="color: var(--primary-700); font-family: monospace; font-size: 1.1rem;">${bookingRef}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: var(--neutral-500); font-size: 0.85rem;">Collection Mode:</span>
            <strong>${collectionLabel}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: var(--neutral-500); font-size: 0.85rem;">Scheduled Date & Slot:</span>
            <strong>${date} (${slot})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: var(--neutral-500); font-size: 0.85rem;">Contact Mobile:</span>
            <strong>${phone}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--neutral-200);">
            <span style="font-weight: 700; color: var(--primary-900);">Total Payable:</span>
            <strong style="font-size: 1.15rem; color: var(--primary-900);">₹${VijayaCart.getTotal().toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div style="background: #E8FBF0; border: 1px solid #A7F3D0; border-radius: var(--radius-md); padding: 1rem; max-width: 480px; margin: 0 auto 1.5rem auto; font-size: 0.85rem; color: #065F46; text-align: left; display: flex; gap: 0.75rem; align-items: flex-start;">
          <i class="fa-brands fa-whatsapp" style="font-size: 1.35rem; color: #25D366; margin-top: 2px;"></i>
          <div>
            <strong>Instant WhatsApp Confirmation:</strong> Click the button below to share these booking details with our lab coordinator and receive fast scheduling assistance!
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-lg">
            <i class="fa-brands fa-whatsapp"></i> Send Booking on WhatsApp
          </a>
          <button class="btn btn-outline" onclick="closeAllModals(); VijayaCart.clear(); location.reload();">Done</button>
        </div>
      </div>
    `;
  }
}

// Prescription Upload Modal with WhatsApp Attachment Guidance
function openPrescriptionModal() {
  const modal = document.getElementById('prescriptionModal');
  if (modal) modal.classList.add('open');
}

function handlePrescriptionSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('prescriptionForm');
  if (!form) return;

  const name = form.rxName.value.trim();
  const phone = form.rxPhone.value.trim();
  const notes = form.rxNotes ? form.rxNotes.value.trim() : '';
  const fileInput = form.querySelector('input[type="file"]');
  const fileName = fileInput && fileInput.files[0] ? fileInput.files[0].name : 'Prescription Photo';

  const rxRef = 'SVL-RX-' + Math.floor(100000 + Math.random() * 900000);

  const waMsg = 
    `🏥 *Sri Vijaya Clinical Laboratories - Prescription Upload Request*%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
    `🔖 *Ref ID:* ${rxRef}%0A` +
    `👤 *Patient Name:* ${encodeURIComponent(name)}%0A` +
    `📞 *Contact Phone:* ${phone}%0A` +
    (notes ? `📝 *Patient Notes:* ${encodeURIComponent(notes)}%0A` : '') +
    `📎 *Attachment Note:* Attaching prescription photo in this chat%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
    `Please review my prescription and advise test booking / home collection slot.`;

  const waUrl = `https://wa.me/919577334499?text=${waMsg}`;

  const modalBody = document.getElementById('prescriptionModalBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="width: 68px; height: 68px; border-radius: 50%; background: var(--emerald-100); color: var(--emerald-600); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.25rem auto;">
          <i class="fa-solid fa-file-shield"></i>
        </div>
        <h3 style="font-size: 1.5rem; color: var(--primary-900); margin-bottom: 0.5rem;">Prescription Request Logged!</h3>
        <p style="color: var(--neutral-600); margin-bottom: 1.25rem;">
          Thank you, <strong>${name}</strong>. Reference: <strong style="font-family: monospace; color: var(--primary-700);">${rxRef}</strong>.
        </p>
        
        <div style="background: #E8FBF0; border: 1.5px solid #10B981; border-radius: var(--radius-md); padding: 1.25rem; max-width: 460px; margin: 0 auto 1.75rem auto; text-align: left;">
          <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.75rem;">
            <i class="fa-brands fa-whatsapp" style="font-size: 1.5rem; color: #25D366; margin-top: 2px;"></i>
            <div>
              <strong style="color: #065F46; font-size: 0.95rem;">Send Prescription on WhatsApp:</strong>
              <p style="color: #047857; font-size: 0.85rem; line-height: 1.5; margin-top: 0.35rem;">
                Browsers cannot automatically attach physical device files into WhatsApp. Please click below to open your chat with Vijaya Labs, then tap the <strong>📎 (Paperclip / Camera)</strong> icon to send your prescription photo.
              </p>
            </div>
          </div>
          <div style="font-size: 0.78rem; color: var(--neutral-600); padding-top: 0.5rem; border-top: 1px dashed rgba(0,0,0,0.1);">
            <i class="fa-solid fa-phone" style="color: var(--primary-600);"></i> Our medical team will review the slip and call you back in 15 minutes.
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-lg">
            <i class="fa-brands fa-whatsapp"></i> Open WhatsApp & Attach Photo
          </a>
          <button class="btn btn-outline" onclick="closeAllModals()">Close</button>
        </div>
      </div>
    `;
  }
}

// Redesigned Modern Multi-Card Reviews Slider with Auto-Scroll & Manual Navigation
function initTestimonialsSlider() {
  const track = document.getElementById('reviewsSliderTrack') || document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('reviewsPrevBtn') || document.getElementById('testimonialPrevBtn');
  const nextBtn = document.getElementById('reviewsNextBtn') || document.getElementById('testimonialNextBtn');
  const dotsContainer = document.getElementById('reviewsDotsContainer') || document.getElementById('testimonialDots');
  const counterPill = document.getElementById('reviewsCounterPill');

  if (!track) return;

  const cards = track.querySelectorAll('.review-card-modern, .testimonial-slide-card');
  if (!cards.length) return;

  let currentIndex = 0;
  const total = cards.length;
  let autoScrollTimer = null;
  let resumeTimer = null;
  let isHovered = false;

  function getCardsPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, total - getCardsPerView());
  }

  function buildDots() {
    const maxIdx = getMaxIndex();
    const dotCount = maxIdx + 1;
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.className = `review-dot ${i === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Navigate to review group ${i + 1}`);
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          handleUserInteraction(() => {
            currentIndex = i;
            updateSlider();
          });
        });
        dotsContainer.appendChild(dot);
      }
    }
    if (counterPill) {
      counterPill.textContent = `${currentIndex + 1} / ${maxIdx + 1}`;
    }
  }

  function updateSlider() {
    const cardsPerView = getCardsPerView();
    const maxIdx = Math.max(0, total - cardsPerView);
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    if (currentIndex < 0) currentIndex = 0;

    const firstCard = cards[0];
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 24;
      const step = cardRect.width + gap;
      track.style.transform = `translateX(-${currentIndex * step}px)`;
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.review-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    if (counterPill) {
      counterPill.textContent = `${currentIndex + 1} / ${maxIdx + 1}`;
    }
  }

  function startAutoScroll() {
    stopAutoScroll();
    if (isHovered) return;
    autoScrollTimer = setInterval(() => {
      const maxIdx = getMaxIndex();
      currentIndex = (currentIndex < maxIdx) ? currentIndex + 1 : 0;
      updateSlider();
    }, 4500);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  }

  function handleUserInteraction(callback) {
    stopAutoScroll();
    callback();
    // Resume auto-scroll after 5 seconds of inactivity if not hovered
    resumeTimer = setTimeout(() => {
      if (!isHovered) {
        startAutoScroll();
      }
    }, 5000);
  }

  function nextSlide() {
    handleUserInteraction(() => {
      const maxIdx = getMaxIndex();
      currentIndex = (currentIndex < maxIdx) ? currentIndex + 1 : 0;
      updateSlider();
    });
  }

  function prevSlide() {
    handleUserInteraction(() => {
      const maxIdx = getMaxIndex();
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : maxIdx;
      updateSlider();
    });
  }

  buildDots();
  updateSlider();
  startAutoScroll();

  window.addEventListener('resize', () => {
    buildDots();
    updateSlider();
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
    });
  }

  // Hover Pause & Resume
  const section = track.closest('.testimonials-section') || track.parentElement;
  if (section) {
    section.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoScroll();
    });
    section.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoScroll();
    });
  }

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchStartY = 0;

  track.addEventListener('touchstart', (e) => {
    stopAutoScroll();
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only swipe if horizontal movement is greater than vertical movement
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      handleUserInteraction(() => {});
    }
  }, { passive: true });
}

// Global Modal Utilities
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  VijayaCart.closeDrawer();
}

// FAQ Accordion
function setupFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

// Mobile Menu and Dropdown Navigation
function setupNavigation() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.className = menu.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });
  }

  // Handle dropdown toggle on mobile
  const dropdownTriggers = document.querySelectorAll('.nav-item.has-dropdown > .nav-link');
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const parent = trigger.closest('.has-dropdown');
        if (parent) parent.classList.toggle('active-mobile');
      }
    });
  });
}

// Scroll-Triggered Reveal Animations using IntersectionObserver
function setupScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll, .section-header, .service-action-card, .package-card, .category-card');
  if (!elements.length) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// Global Document Initialization
document.addEventListener('DOMContentLoaded', () => {
  VijayaCart.init();
  setupNavigation();
  initAnimatedCounters();
  initHomepageLiveSearch();
  setupUniversalSearch();
  initTestimonialsSlider();
  setupFaqAccordion();
  setupScrollAnimations();

  // Header scroll shadow
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header && header.classList.add('scrolled');
    } else {
      header && header.classList.remove('scrolled');
    }
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
});
