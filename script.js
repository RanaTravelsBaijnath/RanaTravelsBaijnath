/**
 * RANA TRAVELS BAIJNATH - APPLICATION LOGIC
 * Theme: Pink, Black & Electric Yellow
 * Admin Authentication & Secure Route Management
 * - Admin Email: ranatravels3100@gmail.com
 * - Admin Pass:  rohitrana@3100
 * - STRICT RULE: ONLY the site admin can add/edit/delete route details.
 * - Viewers CANNOT add or edit route details.
 * - Starts with ZERO pre-populated routes (no dummy routes).
 */

// Storage Keys
const ROUTES_STORAGE_KEY = 'rana_travels_baijnath_routes_v4';
const ADMIN_SESSION_KEY = 'rana_travels_admin_authenticated';

// Official Admin Credentials
const ADMIN_CREDENTIALS = {
  email: 'ranatravels3100@gmail.com',
  pass: 'rohitrana@3100'
};

// Application State
let routesData = [];
let activeCategoryFilter = 'all';
let currentSearchQuery = '';

// DOM Elements
let routesGridContainer;
let routeModal;
let routeForm;
let adminLoginModal;
let adminLoginForm;
let toastContainer;
let adminTopBar;
let routesAdminControls;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Bind core containers
  routesGridContainer = document.getElementById('routesGridContainer');
  routeModal = document.getElementById('routeModal');
  routeForm = document.getElementById('routeForm');
  adminLoginModal = document.getElementById('adminLoginModal');
  adminLoginForm = document.getElementById('adminLoginForm');
  toastContainer = document.getElementById('toastContainer');
  adminTopBar = document.getElementById('adminTopBar');
  routesAdminControls = document.getElementById('routesAdminControls');

  // Load routes data (Strictly empty if none added by admin)
  loadRoutesData();

  // Setup Event Handlers
  setupEventListeners();

  // Update UI according to admin authentication state
  updateAdminUIState();

  // Initial Render of Routes
  renderRoutes();
});

/**
 * Check if the Admin is currently logged in
 */
function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

/**
 * Load routes strictly from localStorage (starts empty)
 */
function loadRoutesData() {
  try {
    const saved = localStorage.getItem(ROUTES_STORAGE_KEY);
    if (saved) {
      routesData = JSON.parse(saved);
      // Clean up any stale mock data that might have existed in older keys
      if (!Array.isArray(routesData)) {
        routesData = [];
      }
    } else {
      // Strictly 0 routes as instructed ("do not add routes by your self")
      routesData = [];
    }
  } catch (err) {
    console.error('Error reading route storage:', err);
    routesData = [];
  }
}

/**
 * Save routes to localStorage
 */
function saveRoutesData() {
  try {
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routesData));
  } catch (err) {
    console.error('Error saving routes:', err);
  }
}

/**
 * Setup All Event Listeners
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

  // Admin Portal Trigger in Nav & Footer
  const navAdminLoginBtn = document.getElementById('navAdminLoginBtn');
  const footerAdminLoginBtn = document.getElementById('footerAdminLoginBtn');

  [navAdminLoginBtn, footerAdminLoginBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAdminLoggedIn()) {
          // If already logged in, prompt logout or open admin actions
          handleAdminLogoutPrompt();
        } else {
          openAdminLoginModal();
        }
      });
    }
  });

  // Admin Login Modal Close & Cancel
  const closeAdminLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
  const cancelAdminLoginBtn = document.getElementById('cancelAdminLoginBtn');
  if (closeAdminLoginModalBtn) closeAdminLoginModalBtn.addEventListener('click', closeAdminLoginModal);
  if (cancelAdminLoginBtn) cancelAdminLoginBtn.addEventListener('click', closeAdminLoginModal);

  // Admin Login Form Submit
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLoginSubmit);
  }

  // Password Visibility Toggle
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  }

  // Admin Logout Button in Top Bar
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      logoutAdmin();
    });
  }

  // Add Route Buttons (Protected for Admin)
  const adminBarAddRouteBtn = document.getElementById('adminBarAddRouteBtn');
  const openAddRouteModalBtn = document.getElementById('openAddRouteModalBtn');

  [adminBarAddRouteBtn, openAddRouteModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (!isAdminLoggedIn()) {
          showToast('Admin login required to add bus routes.', 'error');
          openAdminLoginModal();
          return;
        }
        openRouteModal();
      });
    }
  });

  // Route Modal Close & Cancel
  const closeRouteModalBtn = document.getElementById('closeRouteModalBtn');
  const cancelRouteBtn = document.getElementById('cancelRouteBtn');
  if (closeRouteModalBtn) closeRouteModalBtn.addEventListener('click', closeRouteModal);
  if (cancelRouteBtn) cancelRouteBtn.addEventListener('click', closeRouteModal);

  // Close modals on overlay backdrop click
  [adminLoginModal, routeModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === adminLoginModal) closeAdminLoginModal();
          if (modal === routeModal) closeRouteModal();
        }
      });
    }
  });

  // Route Form Submission (Add / Edit Route)
  if (routeForm) {
    routeForm.addEventListener('submit', handleRouteFormSubmit);
  }

  // Search Input for Routes
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
 * Open Admin Login Dialog
 */
function openAdminLoginModal() {
  if (!adminLoginModal) return;
  const errorAlert = document.getElementById('loginErrorAlert');
  if (errorAlert) errorAlert.style.display = 'none';

  const emailInput = document.getElementById('adminEmailInput');
  const passInput = document.getElementById('adminPasswordInput');
  if (emailInput) emailInput.value = 'ranatravels3100@gmail.com';
  if (passInput) passInput.value = '';

  adminLoginModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (passInput) passInput.focus();
}

/**
 * Close Admin Login Dialog
 */
function closeAdminLoginModal() {
  if (!adminLoginModal) return;
  adminLoginModal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Toggle Password Visibility in Admin Login Modal
 */
function togglePasswordVisibility() {
  const passInput = document.getElementById('adminPasswordInput');
  const icon = document.getElementById('togglePasswordIcon');
  if (!passInput || !icon) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

/**
 * Handle Admin Login Form Submission
 */
function handleAdminLoginSubmit(e) {
  e.preventDefault();

  const emailInput = document.getElementById('adminEmailInput');
  const passInput = document.getElementById('adminPasswordInput');
  const errorAlert = document.getElementById('loginErrorAlert');
  const errorText = document.getElementById('loginErrorText');

  const enteredEmail = emailInput ? emailInput.value.trim() : '';
  const enteredPass = passInput ? passInput.value.trim() : '';

  if (enteredEmail === ADMIN_CREDENTIALS.email && enteredPass === ADMIN_CREDENTIALS.pass) {
    // Authenticated successfully
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    if (errorAlert) errorAlert.style.display = 'none';
    closeAdminLoginModal();
    updateAdminUIState();
    renderRoutes();
    showToast('Welcome back, Admin! Route management unlocked.', 'success');
  } else {
    // Authentication failed
    if (errorAlert && errorText) {
      errorText.textContent = 'Invalid email or password. Please verify your credentials.';
      errorAlert.style.display = 'flex';
    }
    showToast('Invalid admin credentials. Access denied.', 'error');
  }
}

/**
 * Handle Logout
 */
function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  updateAdminUIState();
  renderRoutes();
  showToast('Logged out of Admin Portal. Viewer mode active.', 'success');
}

/**
 * Prompt logout when clicking admin button while logged in
 */
function handleAdminLogoutPrompt() {
  if (confirm('You are currently logged in as Admin (ranatravels3100@gmail.com).\nDo you want to log out?')) {
    logoutAdmin();
  }
}

/**
 * Update UI according to Admin Login status
 */
function updateAdminUIState() {
  const loggedIn = isAdminLoggedIn();

  // Admin Top Bar
  if (adminTopBar) {
    adminTopBar.style.display = loggedIn ? 'block' : 'none';
  }

  // Routes Section Admin Controls (+ Add Route button)
  if (routesAdminControls) {
    routesAdminControls.style.display = loggedIn ? 'block' : 'none';
  }

  // Nav Admin Button Text & Icon
  const navAdminBtnText = document.getElementById('navAdminBtnText');
  const navAdminLockIcon = document.getElementById('navAdminLockIcon');

  if (navAdminBtnText && navAdminLockIcon) {
    if (loggedIn) {
      navAdminBtnText.textContent = 'Admin (Active)';
      navAdminLockIcon.className = 'fa-solid fa-user-shield';
    } else {
      navAdminBtnText.textContent = 'Admin Login';
      navAdminLockIcon.className = 'fa-solid fa-lock';
    }
  }
}

/**
 * Open Modal to Add or Edit Route (Admin Only)
 */
function openRouteModal(routeToEdit = null) {
  if (!isAdminLoggedIn()) {
    showToast('Admin authentication required.', 'error');
    openAdminLoginModal();
    return;
  }

  if (!routeModal || !routeForm) return;

  const modalHeading = document.getElementById('modalHeading');
  const editRouteIdInput = document.getElementById('editRouteId');

  if (routeToEdit) {
    // Edit Existing Route
    modalHeading.textContent = 'Edit Bus Route';
    editRouteIdInput.value = routeToEdit.id;

    document.getElementById('routeOrigin').value = routeToEdit.origin || 'Baijnath';
    document.getElementById('routeDestination').value = routeToEdit.destination || '';
    document.getElementById('routeVia').value = routeToEdit.via || '';
    document.getElementById('busNumber').value = routeToEdit.busNumber || '';
    document.getElementById('busFrequency').value = routeToEdit.busFrequency || 'Daily';
    document.getElementById('busCategory').value = routeToEdit.busCategory || 'Local Mountain Route';
    document.getElementById('departureTime').value = routeToEdit.departureTime || '';
    document.getElementById('arrivalTime').value = routeToEdit.arrivalTime || '';
    document.getElementById('ticketFare').value = routeToEdit.ticketFare || '';
    document.getElementById('driverName').value = routeToEdit.driverName || '';
    document.getElementById('driverPhone').value = routeToEdit.driverPhone || '';
    document.getElementById('conductorName').value = routeToEdit.conductorName || '';
    document.getElementById('conductorPhone').value = routeToEdit.conductorPhone || '';
    document.getElementById('bookingHelpline').value = routeToEdit.bookingHelpline || '+91 9129300044';
  } else {
    // Add New Route
    modalHeading.textContent = 'Add New Bus Route';
    editRouteIdInput.value = '';
    routeForm.reset();
    document.getElementById('routeOrigin').value = 'Baijnath';
    document.getElementById('busFrequency').value = 'Daily';
    document.getElementById('busCategory').value = 'Local Mountain Route';
    document.getElementById('bookingHelpline').value = '+91 9129300044';
  }

  routeModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close Add/Edit Route Modal
 */
function closeRouteModal() {
  if (!routeModal) return;
  routeModal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Handle Add/Edit Route Form Submission (Admin Only)
 */
function handleRouteFormSubmit(e) {
  e.preventDefault();

  if (!isAdminLoggedIn()) {
    showToast('Permission denied. Admin login required.', 'error');
    closeRouteModal();
    openAdminLoginModal();
    return;
  }

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
    showToast('Please fill in all mandatory fields marked with *', 'error');
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
      showToast(`Route ${routeOrigin} to ${routeDestination} updated!`);
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
 * Delete a Route (Admin Only)
 */
function deleteRoute(routeId) {
  if (!isAdminLoggedIn()) {
    showToast('Permission denied. Admin login required.', 'error');
    openAdminLoginModal();
    return;
  }

  const route = routesData.find(r => r.id === routeId);
  if (!route) return;

  if (confirm(`Admin Action: Are you sure you want to delete the route "${route.origin} to ${route.destination}" (Bus: ${route.busNumber})?`)) {
    routesData = routesData.filter(r => r.id !== routeId);
    saveRoutesData();
    renderRoutes();
    showToast('Route removed from live schedules.');
  }
}

/**
 * Handle Edit Click for a Route (Admin Only)
 */
window.handleEditRoute = function(routeId) {
  if (!isAdminLoggedIn()) {
    showToast('Admin login required.', 'error');
    openAdminLoginModal();
    return;
  }
  const route = routesData.find(r => r.id === routeId);
  if (route) {
    openRouteModal(route);
  }
};

/**
 * Render Routes Grid (Dynamically with strict Viewer vs Admin separation)
 */
function renderRoutes() {
  if (!routesGridContainer) return;
  const loggedIn = isAdminLoggedIn();

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

  // Check if no routes exist at all
  if (routesData.length === 0) {
    if (loggedIn) {
      // Empty state for LOGGED-IN ADMIN
      routesGridContainer.innerHTML = `
        <div class="routes-empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-route"></i>
          </div>
          <h3 class="empty-state-title">No Bus Routes Published Yet</h3>
          <p class="empty-state-desc">
            Welcome, Admin (ranatravels3100@gmail.com)! The schedule starts completely clean. Click below to add your registered bus routes, departure timings, bus plate numbers, and crew contacts.
          </p>
          <div class="empty-state-actions">
            <button class="btn-yellow-primary" onclick="openRouteModal()">
              <i class="fa-solid fa-plus-circle"></i> Add Your First Bus Route
            </button>
          </div>
        </div>
      `;
    } else {
      // Empty state for REGULAR VIEWER / PASSENGER (Zero add options)
      routesGridContainer.innerHTML = `
        <div class="routes-empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-clock"></i>
          </div>
          <h3 class="empty-state-title">Bus Route Timetable Updating</h3>
          <p class="empty-state-desc">
            Rana Travels Baijnath routes and timetables are updated regularly by our booking counter. For immediate bus departures, seat reservations, and local route inquiries, contact our 24/7 Baijnath desk directly:
          </p>
          <div class="empty-state-actions">
            <a href="tel:+919129300044" class="btn-yellow-primary">
              <i class="fa-solid fa-phone"></i> Call Office: +91 9129300044
            </a>
            <a href="https://wa.me/919129300044?text=Hello%20Rana%20Travels%20Baijnath,%20I%20want%20to%20inquire%20about%20bus%20routes." target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp Booking
            </a>
          </div>
        </div>
      `;
    }
    return;
  }

  // If routes exist, but search filter produced zero matches
  if (filtered.length === 0) {
    routesGridContainer.innerHTML = `
      <div class="routes-empty-state" style="padding: 2.5rem 1.5rem;">
        <div class="empty-state-icon" style="width: 50px; height: 50px; font-size: 1.4rem;">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3 class="empty-state-title" style="font-size: 1.25rem;">No matching routes found</h3>
        <p class="empty-state-desc" style="margin-bottom: 1.2rem;">
          No bus routes match your current query. Try adjusting your search term or category filter.
        </p>
        <button class="btn-yellow-outline" onclick="resetFilters()">
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
        <!-- Top Info: Category, Frequency & Commercial Yellow Bus Plate -->
        <div class="route-card-top">
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
            <span class="route-badge-category">
              <i class="fa-solid fa-couch"></i> ${escapeHtml(route.busCategory || 'Local Mountain Route')}
            </span>
            <span class="route-frequency-tag" title="Operating Frequency">
              <i class="fa-solid fa-repeat"></i> ${escapeHtml(route.busFrequency || 'Daily')}
            </span>
          </div>

          <span class="route-plate-badge" title="Registered Vehicle Number">
            <i class="fa-solid fa-bus"></i> ${escapeHtml(route.busNumber)}
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
            <i class="fa-solid fa-route" style="color: var(--yellow-primary);"></i>
            <span>Via: ${escapeHtml(route.via)}</span>
          </div>
        ` : ''}

        <!-- Timings Matrix -->
        <div class="route-timings-matrix">
          <div class="timing-node dep">
            <span class="timing-label">Departure</span>
            <span class="timing-value">${escapeHtml(route.departureTime)}</span>
          </div>
          <div class="timing-divider">
            <i class="fa-solid fa-angles-right"></i>
          </div>
          <div class="timing-node arr" style="text-align: right;">
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
                <span><i class="fa-solid fa-steering-wheel" style="color: var(--yellow-primary); margin-right: 4px;"></i> <strong>Driver:</strong> ${escapeHtml(route.driverName)}</span>
                ${route.driverPhone ? `
                  <a href="tel:${escapeHtml(route.driverPhone)}" class="staff-contact-link" title="Call Driver">
                    <i class="fa-solid fa-phone"></i> ${escapeHtml(route.driverPhone)}
                  </a>
                ` : ''}
              </div>
            ` : ''}
            ${route.conductorName ? `
              <div class="staff-row">
                <span><i class="fa-solid fa-user-check" style="color: var(--yellow-primary); margin-right: 4px;"></i> <strong>Conductor:</strong> ${escapeHtml(route.conductorName)}</span>
                ${route.conductorPhone ? `
                  <a href="tel:${escapeHtml(route.conductorPhone)}" class="staff-contact-link" title="Call Conductor">
                    <i class="fa-solid fa-phone"></i> ${escapeHtml(route.conductorPhone)}
                  </a>
                ` : ''}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Card Bottom: Fare, Booking WhatsApp & (Admin Only) Edit/Delete -->
        <div class="route-card-bottom">
          <div class="fare-display">
            <span class="fare-label">Ticket Fare</span>
            <span class="fare-amount">${route.ticketFare ? `₹${escapeHtml(route.ticketFare)}` : 'Contact Desk'}</span>
          </div>

          <div class="route-actions-group">
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="font-size: 0.82rem; padding: 0.45rem 0.95rem;">
              <i class="fa-brands fa-whatsapp"></i> Book
            </a>
            <a href="tel:${escapeHtml(route.bookingHelpline || '+91 9129300044')}" class="btn-yellow-outline" style="font-size: 0.82rem; padding: 0.45rem 0.85rem;" title="Call Booking Helpline">
              <i class="fa-solid fa-phone"></i>
            </a>

            <!-- Admin Actions: Rendered EXCLUSIVELY if Admin is Authenticated -->
            ${loggedIn ? `
              <div class="admin-card-actions">
                <button class="owner-btn-edit" onclick="handleEditRoute('${route.id}')" title="Edit Route (Admin Only)">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="owner-btn-delete" onclick="deleteRoute('${route.id}')" title="Delete Route (Admin Only)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            ` : ''}
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
 * Toast Notification System
 */
function showToast(message, type = 'success') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconColor = type === 'error' ? 'var(--red-error)' : 'var(--yellow-primary)';
  const iconClass = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1.1rem;"></i>
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
