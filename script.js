/**
 * RANA TRAVELS BAIJNATH - APPLICATION LOGIC
 * Owner-Driven Route Management, Staff Details, Bus Number, Timings & Frequency
 */

// Storage Key for owner-added routes
const STORAGE_KEY = 'rana_travels_baijnath_routes_v3';

// App State (Starts completely empty - NO hardcoded bus or staff details)
let routesData = [];
let activeCategoryFilter = 'all';
let currentSearchQuery = '';

// DOM Elements
let routesGridContainer;
let routeModal;
let routeForm;
let toastContainer;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Bind key containers
  routesGridContainer = document.getElementById('routesGridContainer');
  routeModal = document.getElementById('routeModal');
  routeForm = document.getElementById('routeForm');
  toastContainer = document.getElementById('toastContainer');

  // Load saved routes from localStorage
  loadRoutesData();

  // Setup Event Listeners
  setupEventListeners();

  // Initial Render
  renderRoutes();
});

/**
 * Load routes from localStorage
 */
function loadRoutesData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      routesData = JSON.parse(saved);
    } else {
      // Empty state as strictly instructed
      routesData = [];
    }
  } catch (err) {
    console.error('Error reading localStorage:', err);
    routesData = [];
  }
}

/**
 * Save routes to localStorage
 */
function saveRoutesData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routesData));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Mobile Nav Toggle
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  // Open Modal Buttons
  const navbarAddRouteBtn = document.getElementById('navbarAddRouteBtn');
  const heroAddRouteBtn = document.getElementById('heroAddRouteBtn');
  const openAddRouteModalBtn = document.getElementById('openAddRouteModalBtn');

  [navbarAddRouteBtn, heroAddRouteBtn, openAddRouteModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => openRouteModal());
    }
  });

  // Close Modal Button & Cancel Button
  const closeRouteModalBtn = document.getElementById('closeRouteModalBtn');
  const cancelRouteBtn = document.getElementById('cancelRouteBtn');

  if (closeRouteModalBtn) closeRouteModalBtn.addEventListener('click', closeRouteModal);
  if (cancelRouteBtn) cancelRouteBtn.addEventListener('click', closeRouteModal);

  // Close modal when clicking outside modal box
  if (routeModal) {
    routeModal.addEventListener('click', (e) => {
      if (e.target === routeModal) {
        closeRouteModal();
      }
    });
  }

  // Route Form Submission (Add / Edit)
  if (routeForm) {
    routeForm.addEventListener('submit', handleRouteFormSubmit);
  }

  // Quick Sample Route Button (Allows owner to preview in 1 click)
  const quickSampleRouteBtn = document.getElementById('quickSampleRouteBtn');
  if (quickSampleRouteBtn) {
    quickSampleRouteBtn.addEventListener('click', addSampleRoute);
  }

  // Search Input
  const routeSearchInput = document.getElementById('routeSearchInput');
  if (routeSearchInput) {
    routeSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderRoutes();
    });
  }

  // Category Filter Pills
  const categoryFilterGroup = document.getElementById('categoryFilterGroup');
  if (categoryFilterGroup) {
    const pills = categoryFilterGroup.querySelectorAll('.filter-pill-btn');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategoryFilter = pill.dataset.category || 'all';
        renderRoutes();
      });
    });
  }
}

/**
 * Open Modal in Add or Edit Mode
 */
function openRouteModal(routeToEdit = null) {
  if (!routeModal || !routeForm) return;

  const modalHeading = document.getElementById('modalHeading');
  const editRouteIdInput = document.getElementById('editRouteId');

  if (routeToEdit) {
    // Edit Mode
    modalHeading.textContent = 'Edit Bus Route';
    editRouteIdInput.value = routeToEdit.id;

    document.getElementById('routeOrigin').value = routeToEdit.origin || 'Baijnath';
    document.getElementById('routeDestination').value = routeToEdit.destination || '';
    document.getElementById('routeVia').value = routeToEdit.via || '';
    document.getElementById('busNumber').value = routeToEdit.busNumber || '';
    document.getElementById('busFrequency').value = routeToEdit.busFrequency || 'Daily 1 Time';
    document.getElementById('busCategory').value = routeToEdit.busCategory || 'AC Sleeper';
    document.getElementById('departureTime').value = routeToEdit.departureTime || '';
    document.getElementById('arrivalTime').value = routeToEdit.arrivalTime || '';
    document.getElementById('ticketFare').value = routeToEdit.ticketFare || '';
    document.getElementById('driverName').value = routeToEdit.driverName || '';
    document.getElementById('driverPhone').value = routeToEdit.driverPhone || '';
    document.getElementById('conductorName').value = routeToEdit.conductorName || '';
    document.getElementById('conductorPhone').value = routeToEdit.conductorPhone || '';
    document.getElementById('bookingHelpline').value = routeToEdit.bookingHelpline || '+91 9129300044';
  } else {
    // Add New Mode
    modalHeading.textContent = 'Add New Bus Route';
    editRouteIdInput.value = '';
    routeForm.reset();
    document.getElementById('routeOrigin').value = 'Baijnath';
    document.getElementById('busFrequency').value = 'Daily 1 Time';
    document.getElementById('bookingHelpline').value = '+91 9129300044';
  }

  routeModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close Modal
 */
function closeRouteModal() {
  if (!routeModal) return;
  routeModal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Handle Add/Edit Route Form Submission
 */
function handleRouteFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editRouteId').value;

  const routeOrigin = document.getElementById('routeOrigin').value.trim();
  const routeDestination = document.getElementById('routeDestination').value.trim();
  const routeVia = document.getElementById('routeVia').value.trim();
  const busNumber = document.getElementById('busNumber').value.trim().toUpperCase();
  const busFrequency = document.getElementById('busFrequency').value.trim();
  const busCategory = document.getElementById('busCategory').value;
  const departureTime = document.getElementById('departureTime').value.trim();
  const arrivalTime = document.getElementById('arrivalTime').value.trim();
  const ticketFare = document.getElementById('ticketFare').value.trim();
  const driverName = document.getElementById('driverName').value.trim();
  const driverPhone = document.getElementById('driverPhone').value.trim();
  const conductorName = document.getElementById('conductorName').value.trim();
  const conductorPhone = document.getElementById('conductorPhone').value.trim();
  const bookingHelpline = document.getElementById('bookingHelpline').value.trim() || '+91 9129300044';

  if (!routeOrigin || !routeDestination || !busNumber || !departureTime || !arrivalTime) {
    showToast('Please fill in all mandatory fieldsmarked with *', 'error');
    return;
  }

  if (editId) {
    // Update existing route
    const index = routesData.findIndex(r => r.id === editId);
    if (index !== -1) {
      routesData[index] = {
        ...routesData[index],
        origin: routeOrigin,
        destination: routeDestination,
        via: routeVia,
        busNumber: busNumber,
        busFrequency: busFrequency,
        busCategory: busCategory,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        ticketFare: ticketFare,
        driverName: driverName,
        driverPhone: driverPhone,
        conductorName: conductorName,
        conductorPhone: conductorPhone,
        bookingHelpline: bookingHelpline,
        updatedAt: new Date().toISOString()
      };
      showToast(`Route ${routeOrigin} to ${routeDestination} updated successfully!`);
    }
  } else {
    // Add new route
    const newRoute = {
      id: 'route_' + Date.now(),
      origin: routeOrigin,
      destination: routeDestination,
      via: routeVia,
      busNumber: busNumber,
      busFrequency: busFrequency,
      busCategory: busCategory,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      ticketFare: ticketFare,
      driverName: driverName,
      driverPhone: driverPhone,
      conductorName: conductorName,
      conductorPhone: conductorPhone,
      bookingHelpline: bookingHelpline,
      createdAt: new Date().toISOString()
    };
    routesData.unshift(newRoute);
    showToast(`New route ${routeOrigin} to ${routeDestination} published!`);
  }

  saveRoutesData();
  closeRouteModal();
  renderRoutes();
}

/**
 * Delete a Route
 */
function deleteRoute(routeId) {
  const route = routesData.find(r => r.id === routeId);
  if (!route) return;

  if (confirm(`Are you sure you want to remove the route "${route.origin} to ${route.destination}" (Bus: ${route.busNumber})?`)) {
    routesData = routesData.filter(r => r.id !== routeId);
    saveRoutesData();
    renderRoutes();
    showToast('Route removed successfully.');
  }
}

/**
 * Add a realistic sample route for owner testing/preview
 */
function addSampleRoute() {
  const sample = {
    id: 'sample_' + Date.now(),
    origin: 'Baijnath',
    destination: 'Delhi Kashmiri Gate ISBT',
    via: 'Paprola, Palampur, Kangra, Chandigarh 43, Ambala',
    busNumber: 'HP 68 A 1999',
    busFrequency: 'Daily 2 Times (Morning & Evening)',
    busCategory: 'AC Sleeper',
    departureTime: '06:30 PM',
    arrivalTime: '06:00 AM',
    ticketFare: '1350',
    driverName: 'Senior Route Captain',
    driverPhone: '+91 9129300044',
    conductorName: 'Station Attendant',
    conductorPhone: '+91 9129300022',
    bookingHelpline: '+91 9129300044',
    createdAt: new Date().toISOString()
  };

  routesData.unshift(sample);
  saveRoutesData();
  renderRoutes();
  showToast('Sample preview route added! You can edit or delete it anytime.');
}

/**
 * Render Routes Grid
 */
function renderRoutes() {
  if (!routesGridContainer) return;

  // Filter routes by search query and category
  const filtered = routesData.filter(route => {
    // Category match
    const matchesCategory = (activeCategoryFilter === 'all') || (route.busCategory === activeCategoryFilter);

    // Search query match
    let matchesSearch = true;
    if (currentSearchQuery) {
      const q = currentSearchQuery;
      matchesSearch = (
        (route.origin && route.origin.toLowerCase().includes(q)) ||
        (route.destination && route.destination.toLowerCase().includes(q)) ||
        (route.busNumber && route.busNumber.toLowerCase().includes(q)) ||
        (route.via && route.via.toLowerCase().includes(q)) ||
        (route.driverName && route.driverName.toLowerCase().includes(q)) ||
        (route.conductorName && route.conductorName.toLowerCase().includes(q))
      );
    }

    return matchesCategory && matchesSearch;
  });

  // Check if no routes exist at all or no matches for search
  if (routesData.length === 0) {
    routesGridContainer.innerHTML = `
      <div class="routes-empty-state">
        <div class="empty-state-icon">
          <i class="fa-solid fa-route"></i>
        </div>
        <h3 class="empty-state-title">No Bus Routes Published Yet</h3>
        <p class="empty-state-desc">
          Welcome to Rana Travels Baijnath. The site starts clean without hardcoded buses or staff details. As the owner of Rana Travels Baijnath, you can publish your bus routes, registered vehicle numbers, departure/arrival timings, daily frequency, and on-board staff details below.
        </p>
        <div class="empty-state-actions">
          <button class="btn-pink-primary" onclick="openRouteModal()">
            <i class="fa-solid fa-plus-circle"></i> Add Your First Bus Route
          </button>
          <button class="btn-pink-outline" onclick="addSampleRoute()">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Add Sample Route for Preview
          </button>
          <a href="tel:+919129300044" class="btn-dark-glass">
            <i class="fa-solid fa-phone"></i> Call 24/7 Office: +91 9129300044
          </a>
        </div>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    routesGridContainer.innerHTML = `
      <div class="routes-empty-state" style="padding: 2.5rem 1.5rem;">
        <div class="empty-state-icon" style="width: 50px; height: 50px; font-size: 1.5rem;">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3 class="empty-state-title" style="font-size: 1.25rem;">No matching routes found</h3>
        <p class="empty-state-desc" style="margin-bottom: 1.2rem;">
          No routes match your current search or category filter. Try clearing your search query.
        </p>
        <button class="btn-pink-outline" onclick="resetFilters()">
          <i class="fa-solid fa-rotate-left"></i> Reset Search & Filters
        </button>
      </div>
    `;
    return;
  }

  // Generate cards HTML
  let html = '';
  filtered.forEach(route => {
    const rawBookingPhone = (route.bookingHelpline || '+91 9129300044').replace(/[^0-9]/g, '');
    const cleanPhone = rawBookingPhone.startsWith('91') ? rawBookingPhone : ('91' + rawBookingPhone);
    const whatsappMessage = encodeURIComponent(
      `Hello Rana Travels Baijnath! I want to book a seat for the route: ${route.origin} to ${route.destination} (Bus: ${route.busNumber}, Time: ${route.departureTime}). Please provide seat availability.`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

    html += `
      <article class="route-card" data-id="${route.id}">
        <!-- Top Info: Category, Frequency & Bus Number -->
        <div class="route-card-top">
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
            <span class="route-badge-category">
              <i class="fa-solid fa-couch"></i> ${escapeHtml(route.busCategory || 'Luxury Bus')}
            </span>
            <span class="route-frequency-tag" title="Operating Frequency">
              <i class="fa-solid fa-repeat"></i> ${escapeHtml(route.busFrequency || 'Daily')}
            </span>
          </div>

          <span class="route-plate-badge" title="Registered Bus Number">
            <i class="fa-solid fa-bus" style="color: var(--pink-primary); margin-right: 3px;"></i> ${escapeHtml(route.busNumber)}
          </span>
        </div>

        <!-- Route Path Title -->
        <h3 class="route-path-heading">
          <span>${escapeHtml(route.origin)}</span>
          <i class="fa-solid fa-arrow-right-long route-path-arrow"></i>
          <span>${escapeHtml(route.destination)}</span>
        </h3>

        <!-- Intermediate Stops / Via -->
        ${route.via ? `
          <div class="route-via-stops">
            <i class="fa-solid fa-route" style="color: var(--pink-primary);"></i>
            <span>Via: ${escapeHtml(route.via)}</span>
          </div>
        ` : ''}

        <!-- Timings Matrix -->
        <div class="route-timings-matrix">
          <div class="timing-node">
            <span class="timing-label">Departure</span>
            <span class="timing-value">${escapeHtml(route.departureTime)}</span>
          </div>
          <div class="timing-divider">
            <i class="fa-solid fa-angles-right"></i>
          </div>
          <div class="timing-node" style="text-align: right;">
            <span class="timing-label">Arrival (Est.)</span>
            <span class="timing-value">${escapeHtml(route.arrivalTime)}</span>
          </div>
        </div>

        <!-- Staff On-Duty Details -->
        ${(route.driverName || route.conductorName) ? `
          <div class="route-staff-box">
            <div class="staff-box-title">
              <i class="fa-solid fa-id-card-clip"></i> On-Board Staff Details
            </div>
            ${route.driverName ? `
              <div class="staff-row">
                <span><i class="fa-solid fa-steering-wheel" style="color: var(--pink-primary); margin-right: 4px;"></i> <strong>Driver:</strong> ${escapeHtml(route.driverName)}</span>
                ${route.driverPhone ? `
                  <a href="tel:${escapeHtml(route.driverPhone)}" class="staff-contact-link" title="Call Driver">
                    <i class="fa-solid fa-phone"></i> ${escapeHtml(route.driverPhone)}
                  </a>
                ` : ''}
              </div>
            ` : ''}
            ${route.conductorName ? `
              <div class="staff-row">
                <span><i class="fa-solid fa-user-check" style="color: var(--pink-primary); margin-right: 4px;"></i> <strong>Conductor:</strong> ${escapeHtml(route.conductorName)}</span>
                ${route.conductorPhone ? `
                  <a href="tel:${escapeHtml(route.conductorPhone)}" class="staff-contact-link" title="Call Conductor">
                    <i class="fa-solid fa-phone"></i> ${escapeHtml(route.conductorPhone)}
                  </a>
                ` : ''}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Card Bottom: Fare, Booking WhatsApp & Owner Edit/Delete -->
        <div class="route-card-bottom">
          <div class="fare-display">
            <span class="fare-label">Ticket Fare</span>
            <span class="fare-amount">${route.ticketFare ? `₹${escapeHtml(route.ticketFare)}` : 'Contact Office'}</span>
          </div>

          <div class="route-actions-group">
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="font-size: 0.82rem; padding: 0.45rem 0.9rem;">
              <i class="fa-brands fa-whatsapp"></i> Book
            </a>
            <a href="tel:${escapeHtml(route.bookingHelpline || '+91 9129300044')}" class="btn-pink-outline" style="font-size: 0.82rem; padding: 0.45rem 0.8rem;" title="Call Helpline">
              <i class="fa-solid fa-phone"></i>
            </a>
            <!-- Owner Actions -->
            <button class="owner-btn-edit" onclick="handleEditRoute('${route.id}')" title="Edit Route (Owner)">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="owner-btn-delete" onclick="deleteRoute('${route.id}')" title="Delete Route (Owner)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  });

  routesGridContainer.innerHTML = html;
}

/**
 * Reset Search and Category Filters
 */
function resetFilters() {
  currentSearchQuery = '';
  activeCategoryFilter = 'all';

  const routeSearchInput = document.getElementById('routeSearchInput');
  if (routeSearchInput) routeSearchInput.value = '';

  const categoryFilterGroup = document.getElementById('categoryFilterGroup');
  if (categoryFilterGroup) {
    const pills = categoryFilterGroup.querySelectorAll('.filter-pill-btn');
    pills.forEach(p => p.classList.remove('active'));
    const allPill = categoryFilterGroup.querySelector('[data-category="all"]');
    if (allPill) allPill.classList.add('active');
  }

  renderRoutes();
}

/**
 * Handle Edit Click for a Route
 */
window.handleEditRoute = function(routeId) {
  const route = routesData.find(r => r.id === routeId);
  if (route) {
    openRouteModal(route);
  }
};

/**
 * Toast Notification System
 */
function showToast(message, type = 'success') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}" style="color: var(--pink-primary);"></i>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

/**
 * Utility: HTML Escape
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
