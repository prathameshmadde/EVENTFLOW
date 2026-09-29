// ==========================================================================
// EVENTFLOW MASTER FRONTEND CONTROLLER — main.js
// Seamless API integration, state management, UI controllers & components.
// ==========================================================================

(function (window, document) {
  'use strict';

  var API_BASE = (window.location.protocol === 'file:' || window.location.port === '5500') ? 'http://localhost:5000/api' : '/api';

  // ==========================================================================
  // SVG OUTLINE ICON SYSTEM (Consistent 2px stroke, 24x24 viewBox)
  // ==========================================================================
  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    rupee: '<path d="M6 3h12M6 8h12M6 13l8 8M6 13h4a4 4 0 0 0 0-8"/>',
    wallet: '<rect width="18" height="16" x="3" y="4" rx="2"/><path d="M17 12h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    utensils: '<path d="M18 2v20M21 15V2a3 3 0 0 0-3 3v6h3Z"/><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20"/>',
    truck: '<rect width="16" height="13" x="1" y="6" rx="2"/><polygon points="17 8 20 8 23 11 23 19 17 19 17 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    layoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    clipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
    creditCard: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    checkSquare: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    refreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v2M12 8v2M17 8v2M7 4h.01M12 4h.01M17 4h.01"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    calendarCheck: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    arrowLeftRight: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    helpCircle: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    play: '<polygon points="5 3 19 12 5 21 5 3"/>',
    volume2: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    volumeX: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
  };

  function icon(name, className, size) {
    size = size || 18;
    className = className || '';
    var body = ICONS[name] || ICONS.sparkles;
    return '<svg class="ef-icon ' + className + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  function hydrateIcons(root) {
    root = root || document;
    var elements = root.querySelectorAll('[data-ef-icon]');
    elements.forEach(function (el) {
      var name = el.getAttribute('data-ef-icon');
      var size = el.getAttribute('data-size') || 18;
      var cls = el.getAttribute('data-class') || '';
      el.innerHTML = icon(name, cls, size);
    });
  }

  // ==========================================================================
  // THEME MANAGEMENT (Light / White Mode & Dark Mode)
  // ==========================================================================
  function getTheme() {
    var stored = localStorage.getItem('ef_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function renderThemeToggleContent(theme) {
    var isDark = theme === 'dark';
    return '<span class="theme-icon-slot">' +
      '<span class="theme-icon moon-icon" aria-hidden="true">' + icon('moon', '', 17) + '</span>' +
      '<span class="theme-icon sun-icon" aria-hidden="true">' + icon('sun', '', 17) + '</span>' +
    '</span>' +
    '<span class="theme-mode-text">' + (isDark ? 'White Mode' : 'Dark Mode') + '</span>';
  }

  // Navigation Event Detection & Smooth Theme Transition Routine
  var themeTransTimer = null;
  function applyNavigationThemeTransition(duration) {
    var ms = typeof duration === 'number' ? duration : 400;
    if (document.body) {
      document.body.classList.add('theme-transitioning');
    }
    if (document.documentElement) {
      document.documentElement.classList.add('theme-transitioning');
    }
    if (themeTransTimer) {
      clearTimeout(themeTransTimer);
    }
    themeTransTimer = setTimeout(function () {
      if (document.body) {
        document.body.classList.remove('theme-transitioning');
      }
      if (document.documentElement) {
        document.documentElement.classList.remove('theme-transitioning');
      }
      themeTransTimer = null;
    }, ms);
  }

  function setupNavigationThemeTransition() {
    // 1. History navigation events (Back / Forward buttons)
    window.addEventListener('popstate', function () {
      applyNavigationThemeTransition(450);
    });

    // 2. Hash navigation (anchor / internal tab links)
    window.addEventListener('hashchange', function () {
      applyNavigationThemeTransition(400);
    });

    // 3. Page show / load (including bfcache back/forward restores)
    window.addEventListener('pageshow', function () {
      applyNavigationThemeTransition(400);
    });

    // 4. Intercept link click navigation (internal page transitions)
    document.addEventListener('click', function (e) {
      var targetLink = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!targetLink) return;

      var href = targetLink.getAttribute('href');
      if (!href) return;

      // Ignore anchor jumps on same page, javascript, mailto, tel
      if (href.charAt(0) === '#' || href.indexOf('javascript:') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) {
        return;
      }

      // Ignore external tabs, modifier clicks
      if (targetLink.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Apply theme-transitioning to body immediately on navigation initiation
      applyNavigationThemeTransition(500);
    }, true);

    // 5. Intercept HTML5 History pushState & replaceState for client-side routing
    if (window.history) {
      var origPushState = window.history.pushState;
      if (typeof origPushState === 'function') {
        window.history.pushState = function () {
          applyNavigationThemeTransition(400);
          return origPushState.apply(this, arguments);
        };
      }
      var origReplaceState = window.history.replaceState;
      if (typeof origReplaceState === 'function') {
        window.history.replaceState = function () {
          applyNavigationThemeTransition(400);
          return origReplaceState.apply(this, arguments);
        };
      }
    }

    // 6. Support Modern Navigation API if available
    if (typeof window.navigation !== 'undefined' && typeof window.navigation.addEventListener === 'function') {
      try {
        window.navigation.addEventListener('navigate', function () {
          applyNavigationThemeTransition(450);
        });
      } catch (navErr) {}
    }

    // 7. Dashboard in-page tab switching events
    document.addEventListener('click', function (e) {
      var tabBtn = e.target && e.target.closest ? e.target.closest('.dash-tab-btn, .tab-btn, [data-tab]') : null;
      if (tabBtn) {
        applyNavigationThemeTransition(350);
      }
    }, true);

    // Apply smooth transition on initial page setup
    applyNavigationThemeTransition(350);
  }

  function applyTheme(t, animate) {
    if (animate) {
      applyNavigationThemeTransition(400);
    }
    document.documentElement.setAttribute('data-theme', t);
    if (document.body) document.body.setAttribute('data-theme', t);
    localStorage.setItem('ef_theme', t);

    // Update active icon/state and text in all rendered theme toggles
    var isDark = t === 'dark';
    document.querySelectorAll('.theme-toggle-btn, #btn-theme-toggle, #ef-theme-toggle').forEach(function (btn) {
      btn.setAttribute('data-current-theme', t);
      btn.setAttribute('aria-label', isDark ? 'Switch to White Mode' : 'Switch to Dark Mode');
      btn.setAttribute('title', isDark ? 'Switch to White Mode' : 'Switch to Dark Mode');
      var label = btn.querySelector('.theme-mode-text');
      if (label) {
        label.textContent = isDark ? 'White Mode' : 'Dark Mode';
      }
    });

    try {
      window.dispatchEvent(new CustomEvent('ef_theme_changed', { detail: { theme: t } }));
    } catch (e) {}
  }

  function toggleTheme() {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    showToast('Switched to ' + (next === 'dark' ? 'Dark' : 'White') + ' mode', 'info');
  }

  // Immediate theme initialization to prevent flash of wrong theme
  applyTheme(getTheme(), false);

  // Current session retrieval
  function getUser() {
    try {
      var raw = localStorage.getItem('ef_user') || sessionStorage.getItem('ef_user');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed.user_id || parsed.email)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse user session', e);
    }

    // If no valid session and we are on a protected page, redirect to login
    var path = (window.location.pathname || '').toLowerCase();
    var isDashboardPage = path.indexOf('customer-dashboard') !== -1 ||
                          path.indexOf('manager-dashboard') !== -1 ||
                          path.indexOf('admin') !== -1 ||
                          path.indexOf('my-bookings') !== -1 ||
                          path.indexOf('my-requirements') !== -1 ||
                          path.indexOf('booking') !== -1;
    if (isDashboardPage) {
      window.location.href = 'login.html';
    }

    return null;
  }

  function setUser(u) {
    localStorage.setItem('ef_user', JSON.stringify(u));
  }

  function clearUser() {
    localStorage.removeItem('ef_user');
    sessionStorage.removeItem('ef_user');
    clearToken();
  }

  // Session token helpers. apiFetch below reads 'ef_token' to build the
  // Authorization header, so login/register must persist it here.
  function setToken(token) {
    if (!token) return;
    localStorage.setItem('ef_token', token);
  }

  function getToken() {
    return localStorage.getItem('ef_token') || sessionStorage.getItem('ef_token');
  }

  function clearToken() {
    localStorage.removeItem('ef_token');
    sessionStorage.removeItem('ef_token');
  }

  // Toast Notification Component
  function showToast(message, type) {
    type = type || 'info';
    var stack = document.getElementById('toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toast-stack';
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var iconName = type === 'success' ? 'check' : (type === 'error' ? 'x' : 'info');
    toast.innerHTML = '<span class="toast-icon">' + icon(iconName, '', 16) + '</span> <span>' + message + '</span>';
    stack.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3800);
  }

  // HTTP Helper Methods
  function apiFetch(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
    }
    var token = localStorage.getItem('ef_token') || sessionStorage.getItem('ef_token');
    if (token && !options.headers['Authorization']) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }
    return fetch(url, options).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(data.message || data.error || 'Server request failed');
        }
        return data;
      });
    });
  }

  function apiGet(endpoint) {
    return apiFetch(API_BASE + endpoint);
  }

  function apiPost(endpoint, body) {
    return apiFetch(API_BASE + endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  function apiPut(endpoint, body) {
    return apiFetch(API_BASE + endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  function apiDelete(endpoint) {
    return apiFetch(API_BASE + endpoint, {
      method: 'DELETE'
    });
  }

  // Currency & Date formatters
  function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '₹ 0';
    return '₹ ' + Number(num).toLocaleString('en-IN');
  }

  function formatDate(dStr) {
    if (!dStr) return 'TBD';
    var d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function statusBadge(status) {
    var s = (status || 'UNKNOWN').toUpperCase();
    var cls = 'info';
    if (['OPEN', 'ACTIVE', 'CONFIRMED', 'ACCEPTED', 'COMPLETED', 'AVAILABLE'].indexOf(s) !== -1) {
      cls = 'open';
    } else if (['PENDING', 'PROPOSALS_RECEIVED'].indexOf(s) !== -1) {
      cls = 'pending';
    } else if (['SUBMITTED', 'IN_PROGRESS'].indexOf(s) !== -1) {
      cls = 'submitted';
    } else if (['REJECTED', 'CANCELLED', 'WITHDRAWN', 'FAILED'].indexOf(s) !== -1) {
      cls = 'rejected';
    }
    var cleanLabel = s.replace(/_/g, ' ');
    return '<span class="badge ' + cls + '">' + cleanLabel + '</span>';
  }

  // Create or Inject Mobile Navigation Drawer
  function setupMobileDrawer() {
    if (document.getElementById('ef-mobile-drawer')) return;

    var drawer = document.createElement('div');
    drawer.id = 'ef-mobile-drawer';
    drawer.className = 'ef-mobile-drawer';

    var backdrop = document.createElement('div');
    backdrop.id = 'ef-drawer-backdrop';
    backdrop.className = 'ef-drawer-backdrop';

    var user = getUser();
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';

    drawer.innerHTML =
      '<div class="drawer-header">' +
        '<div class="brand">' +
          '<div class="brand-mark">✦</div>' +
          '<div><strong>Event<span>Flow</span></strong><small>Luxury Celebrations</small></div>' +
        '</div>' +
        '<button type="button" class="drawer-close" id="ef-drawer-close" aria-label="Close menu">' +
          icon('x', '', 20) +
        '</button>' +
      '</div>' +
      '<div class="drawer-body">' +
        '<nav class="drawer-nav">' +
          '<a href="index.html" class="' + (currentPath === 'index.html' ? 'active' : '') + '">' + icon('sparkles', '', 18) + '<span>Home</span></a>' +
          '<a href="customer-dashboard.html" class="' + (currentPath === 'customer-dashboard.html' ? 'active' : '') + '">' + icon('layoutDashboard', '', 18) + '<span>Dashboard</span></a>' +
          '<a href="events.html" class="' + (currentPath === 'events.html' || currentPath === 'event-details.html' ? 'active' : '') + '">' + icon('calendar', '', 18) + '<span>Events</span></a>' +
          '<a href="proposals.html" class="' + (currentPath === 'proposals.html' ? 'active' : '') + '">' + icon('fileText', '', 18) + '<span>Proposals</span></a>' +
          '<a href="my-bookings.html" class="' + (currentPath === 'my-bookings.html' || currentPath === 'booking.html' || currentPath === 'bookings.html' ? 'active' : '') + '">' + icon('checkSquare', '', 18) + '<span>Bookings</span></a>' +
          '<a href="services.html" class="' + (currentPath === 'services.html' ? 'active' : '') + '">' + icon('award', '', 18) + '<span>Services</span></a>' +
        '</nav>' +
        '<div class="drawer-theme-box">' +
          '<span>Interface Theme</span>' +
          '<button type="button" class="drawer-theme-toggle" id="ef-drawer-theme-btn">' +
            icon('sun', 'sun-icon', 16) + ' ' +
            icon('moon', 'moon-icon', 16) + ' ' +
            '<span class="theme-text">Switch Mode</span>' +
          '</button>' +
        '</div>' +
        '<div class="drawer-user-box">' +
          (user ? (
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
              '<div class="eventflow-avatar">' + (user && user.name ? user.name[0] : 'U') + '</div>' +
              '<div><strong>' + (user ? user.name : 'Guest') + '</strong><small style="display:block;color:var(--color-text-muted);">' + (user ? user.email : '') + '</small></div>' +
            '</div>'
          ) : (
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
              '<div class="eventflow-avatar">✦</div>' +
              '<div><strong>Welcome Guest</strong><small style="display:block;color:var(--color-text-muted);">Sign in to access your celebrations</small></div>' +
            '</div>' +
            '<a href="login.html" class="btn btn-primary" style="width:100%;">' + icon('logIn', '', 16) + ' Login / Sign In</a>'
          )) +
        '</div>' +
        (user ? (
          '<a href="' + (user && user.role && user.role.toUpperCase().indexOf('MANAGER') !== -1 ? 'manager-dashboard.html' : 'customer-dashboard.html') + '" class="btn btn-primary" style="width:100%;margin-top:16px;">' + icon('layoutDashboard', '', 16) + ' Open Dashboard</a>'
        ) : '') +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('drawer-locked');
    }

    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('drawer-locked');
    }

    backdrop.addEventListener('click', closeDrawer);
    var closeBtn = drawer.querySelector('#ef-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    var themeBtn = drawer.querySelector('#ef-drawer-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        toggleTheme();
      });
    }

    // Connect hamburger toggles
    document.querySelectorAll('.mobile-menu-toggle, #ef-mobile-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  // Setup Global Navigation & Account Topbar Dropdown
  function setupNavAndAccount() {
    var user = getUser();
    var currentTheme = getTheme();

    // 0. Update Login button or Post Requirement button based on authentication status
    var navLoginBtn = document.getElementById('nav-login-btn') || document.getElementById('nav-post-req');
    if (navLoginBtn) {
      if (user) {
        var isManager = user.role && String(user.role).toUpperCase().indexOf('MANAGER') !== -1;
        var isAdmin = user.role && String(user.role).toUpperCase() === 'ADMIN';
        var dashUrl = isManager ? 'manager-dashboard.html' : (isAdmin ? 'admin.html' : 'customer-dashboard.html');
        var dashLabel = isManager ? 'Manager Dashboard' : (isAdmin ? 'Admin Console' : 'My Dashboard');
        navLoginBtn.href = dashUrl;
        navLoginBtn.innerHTML = icon('layoutDashboard', '', 16) + ' <span>' + dashLabel + '</span>';
      } else {
        navLoginBtn.href = 'login.html';
        navLoginBtn.innerHTML = icon('logIn', '', 16) + ' <span>Login</span>';
      }
    }

    // 1. In header actions (.nav-actions): insert Theme Toggle & Mobile Menu Toggle
    var navActionContainers = document.querySelectorAll('.nav-actions');
    navActionContainers.forEach(function (navActions) {
      // Theme Toggle button
      var existingToggle = navActions.querySelector('.theme-toggle-btn, #ef-theme-toggle');
      if (!existingToggle) {
        var themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.className = 'theme-toggle-btn';
        themeToggle.id = 'ef-theme-toggle';
        themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        themeToggle.setAttribute('title', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        themeToggle.setAttribute('data-current-theme', currentTheme);
        themeToggle.innerHTML = renderThemeToggleContent(currentTheme);
        themeToggle.addEventListener('click', toggleTheme);

        // Place after accountBox, matching user requirement:
        // [ 🔔 Notification ] [ User Avatar & Name ] [ Theme Toggle ] [ CTA / Mobile Menu ]
        var accountBox = navActions.querySelector('.eventflow-account');
        if (accountBox && accountBox.nextSibling) {
          navActions.insertBefore(themeToggle, accountBox.nextSibling);
        } else {
          navActions.appendChild(themeToggle);
        }
      } else {
        existingToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        existingToggle.setAttribute('title', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        existingToggle.setAttribute('data-current-theme', currentTheme);
        existingToggle.innerHTML = renderThemeToggleContent(currentTheme);
        existingToggle.onclick = toggleTheme;
      }

      // Mobile Hamburger Toggle
      if (!navActions.querySelector('.mobile-menu-toggle')) {
        var mobileToggle = document.createElement('button');
        mobileToggle.type = 'button';
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.id = 'ef-mobile-toggle';
        mobileToggle.setAttribute('aria-label', 'Open Menu');
        mobileToggle.innerHTML = icon('menu', '', 20);
        navActions.appendChild(mobileToggle);
      }
    });

    // 2. In dashboard topbars (.app-top .top-tools): wire up or insert Theme Toggle
    var topToolsContainers = document.querySelectorAll('.app-top .top-tools');
    topToolsContainers.forEach(function (topTools) {
      var dashThemeBtn = topTools.querySelector('#btn-theme-toggle, .theme-toggle-btn');
      if (dashThemeBtn) {
        if (!dashThemeBtn.classList.contains('theme-toggle-btn')) dashThemeBtn.classList.add('theme-toggle-btn');
        dashThemeBtn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        dashThemeBtn.setAttribute('title', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        dashThemeBtn.setAttribute('data-current-theme', currentTheme);
        dashThemeBtn.innerHTML = renderThemeToggleContent(currentTheme);
        dashThemeBtn.onclick = toggleTheme;
      } else {
        var themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.className = 'theme-toggle-btn';
        themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        themeToggle.setAttribute('title', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        themeToggle.setAttribute('data-current-theme', currentTheme);
        themeToggle.innerHTML = renderThemeToggleContent(currentTheme);
        themeToggle.addEventListener('click', toggleTheme);
        var accountBox = topTools.querySelector('.eventflow-account');
        if (accountBox && accountBox.nextSibling) {
          topTools.insertBefore(themeToggle, accountBox.nextSibling);
        } else {
          topTools.appendChild(themeToggle);
        }
      }
    });

    // 3. Fallback for standalone pages without header navigation (e.g. login.html, register.html)
    if (!document.querySelector('.nav-actions') && !document.querySelector('.app-top .top-tools')) {
      if (!document.getElementById('ef-floating-theme-toggle')) {
        var floatingBtn = document.createElement('button');
        floatingBtn.type = 'button';
        floatingBtn.id = 'ef-floating-theme-toggle';
        floatingBtn.className = 'theme-toggle-btn floating-theme-toggle';
        floatingBtn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        floatingBtn.setAttribute('title', currentTheme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode');
        floatingBtn.setAttribute('data-current-theme', currentTheme);
        floatingBtn.innerHTML = renderThemeToggleContent(currentTheme);
        floatingBtn.addEventListener('click', toggleTheme);
        document.body.appendChild(floatingBtn);
      }
    }

    // 4. Any explicit theme toggles in drawer or panels
    document.querySelectorAll('#drawer-theme-toggle, #btn-theme-toggle, [data-action="toggle-theme"]').forEach(function (btn) {
      if (!btn.classList.contains('theme-toggle-btn')) btn.classList.add('theme-toggle-btn');
      btn.onclick = toggleTheme;
    });

    // 5. Setup Account Dropdown Pill
    var accountContainers = document.querySelectorAll('.eventflow-account');
    accountContainers.forEach(function (box) {
      if (!user) {
        // If not logged in and a dedicated login button is present, keep pill empty
        if (document.getElementById('nav-login-btn')) {
          box.innerHTML = '';
        } else {
          box.innerHTML = '<a href="login.html" class="btn btn-outline btn-sm">' + icon('logIn', '', 14) + ' <span>Login</span></a>';
        }
        return;
      }

      var initials = (user && user.name) ? user.name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase() : 'U';
      var roleTitle = (user && user.role === 'EVENT_MANAGER') ? 'Event Manager' : ((user && user.role === 'ADMIN') ? 'System Admin' : 'Client');
      var dashUrl = (user && user.role === 'EVENT_MANAGER') ? 'manager-dashboard.html' : ((user && user.role === 'ADMIN') ? 'admin.html' : 'customer-dashboard.html');

      box.innerHTML =
        '<div class="eventflow-alert-wrap">' +
          '<button class="eventflow-alert" id="ef-notif-btn" title="Notifications" aria-label="Notifications">' +
            icon('bell', '', 17) +
            '<span class="eventflow-alert-count">3</span>' +
          '</button>' +
          
          '<div class="eventflow-alert-menu" id="ef-notif-menu">' +
            '<div style="padding:15px;text-align:center;color:var(--muted);font-size:13px;">Loading notifications...</div>' +
          '</div>' +

        '</div>' +
        '<div class="eventflow-profile" id="ef-profile-toggle" tabindex="0" role="button" aria-expanded="false">' +
          '<div class="eventflow-avatar">' + initials + '</div>' +
          '<div class="eventflow-profile-copy">' +
            '<strong>' + (user ? user.name : 'Account') + '</strong>' +
            '<small>' + roleTitle + '</small>' +
          '</div>' +
          '<span class="eventflow-chevron">' + icon('chevronDown', '', 14) + '</span>' +
        '</div>' +
        '<div class="eventflow-menu" id="ef-user-menu">' +
          '<div class="eventflow-menu-head">' +
            '<strong>' + (user ? user.name : 'Guest') + '</strong>' +
            '<small>' + (user ? user.email : '') + '</small>' +
          '</div>' +
          '<a href="' + dashUrl + '">' + icon('layoutDashboard', '', 15) + ' Workspace Dashboard</a>' +
          '<a href="my-bookings.html">' + icon('calendar', '', 15) + ' My Bookings</a>' +
          '<a href="my-requirements.html">' + icon('clipboardList', '', 15) + ' Event Requirements</a>' +
          '<a href="payments.html">' + icon('creditCard', '', 15) + ' Billing & Escrow</a>' +
          '<div style="height:1px;background:var(--color-border);margin:6px 0;"></div>' +
          '<button id="ef-logout-btn" style="color:var(--color-error);">' + icon('logout', '', 14) + ' Sign Out</button>' +
        '</div>';

      
      // Load Dynamic Notifications
      function loadNotifications(box) {
        EventFlow.apiGet('/notifications').then(function(notifs) {
            notifs = notifs || [];
            var unreadCount = notifs.filter(function(n) { return !n.is_read; }).length;
            
            var countEl = box.querySelector('.eventflow-alert-count');
            if (countEl) {
                if (unreadCount > 0) {
                    countEl.textContent = unreadCount;
                    countEl.style.display = 'flex';
                } else {
                    countEl.style.display = 'none';
                }
            }
            
            var menuEl = box.querySelector('#ef-notif-menu');
            if (menuEl) {
                if (notifs.length === 0) {
                    menuEl.innerHTML = '<div style="padding:15px;text-align:center;color:var(--muted);font-size:13px;">No notifications.</div>';
                } else {
                    menuEl.innerHTML = notifs.map(function(n) {
                        var style = n.is_read ? 'opacity:0.7;' : 'font-weight:bold;';
                        var dot = n.is_read ? '' : '<span style="display:inline-block;width:8px;height:8px;background:var(--color-primary);border-radius:50%;margin-left:8px;"></span>';
                        return '<div class="eventflow-note" style="' + style + ' cursor:pointer;" onclick="EventFlowDashboard.markNotifRead(' + n.id + ', \'' + (n.link || '#') + '\')">' +
                               '<strong>' + n.title + dot + '</strong>' +
                               '<span>' + n.message + '</span>' +
                               '</div>';
                    }).join('');
                }
            }
        });
      }
      
      loadNotifications(box);
      
      window.EventFlowDashboard = window.EventFlowDashboard || {};
      window.EventFlowDashboard.markNotifRead = function(id, link) {
          EventFlow.apiPut('/notifications/' + id + '/read', {}).then(function() {
             if (link && link !== '#') window.location.href = link;
          });
      };


      // Toggle dropdowns
      var profBtn = box.querySelector('#ef-profile-toggle');
      var userMenu = box.querySelector('#ef-user-menu');
      if (profBtn && userMenu) {
        profBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          userMenu.classList.toggle('show');
          profBtn.setAttribute('aria-expanded', userMenu.classList.contains('show'));
          var notifMenu = box.querySelector('#ef-notif-menu');
          if (notifMenu) notifMenu.classList.remove('show');
        });
      }

      var notifBtn = box.querySelector('#ef-notif-btn');
      var notifMenu = box.querySelector('#ef-notif-menu');
      if (notifBtn && notifMenu) {
        notifBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          notifMenu.classList.toggle('show');
          if (userMenu) userMenu.classList.remove('show');
        });
      }

      var logoutBtn = box.querySelector('#ef-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          clearUser();
          showToast('Signed out successfully');
          setTimeout(function () { window.location.href = 'login.html'; }, 400);
        });
      }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function () {
      document.querySelectorAll('.eventflow-menu, .eventflow-alert-menu').forEach(function (m) {
        m.classList.remove('show');
      });
    });

    // Setup mobile drawer
    setupMobileDrawer();

    // Mobile sidebar toggle for dashboard pages
    var sidebarToggle = document.querySelector('.sidebar-toggle');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    if (!overlay && sidebar) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    if (sidebarToggle && sidebar) {
      if (!sidebarToggle.innerHTML.trim() || sidebarToggle.textContent.indexOf('☰') !== -1) {
        sidebarToggle.innerHTML = icon('menu', '', 18);
      }
      sidebarToggle.onclick = function (e) {
        e.preventDefault();
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
      };
    }
    if (overlay && sidebar) {
      overlay.onclick = function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      };
    }

    // Active link highlighting
    var currentPath = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
    var isLandingPage = currentPath === '' || currentPath === 'index.html';
    
    if (!isLandingPage) {
      document.querySelectorAll('.desktop-nav a').forEach(function (link) {
        link.classList.remove('active');
        var href = link.getAttribute('href');
        if (!href) return;
        var linkPath = href.split('/').pop().split('?')[0].split('#')[0];
        if (linkPath === currentPath) {
          link.classList.add('active');
        } else if (currentPath === 'event-details.html' && linkPath === 'events.html') {
          link.classList.add('active');
        } else if ((currentPath === 'booking.html' || currentPath === 'bookings.html') && linkPath === 'my-bookings.html') {
          link.classList.add('active');
        }
      });
    } else if (window.EventFlowExperience && typeof window.EventFlowExperience.setupScrollSpy === 'function') {
      window.EventFlowExperience.setupScrollSpy();
    }
    document.querySelectorAll('.side-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.split('/').pop().split('?')[0].split('#')[0] === currentPath) {
        link.classList.add('active');
      }
    });

    // Hydrate any data-ef-icon on page
    hydrateIcons();
  }

  // Payment Processing Modal with escrow security
  function triggerPaymentModal(amount, bookingId, milestoneTitle, onComplete) {
    var modal = document.createElement('div');
    modal.className = 'payment-processing-modal';
    modal.innerHTML =
      '<div class="payment-processing-card">' +
        '<div id="pm-step-1">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
            '<span class="badge open">' + icon('shieldCheck', '', 13) + ' 100% Escrow Protected</span>' +
            '<span style="font-size:12px;color:var(--color-text-muted);">Step 1 of 2</span>' +
          '</div>' +
          '<h3 style="font-size:22px;margin-bottom:6px;">Authorize Milestone Release</h3>' +
          '<p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:20px;">' + (milestoneTitle || 'Event Production Milestone') + '</p>' +
          '<div style="padding:18px;background:var(--color-surface-muted);border:1px solid var(--color-border);border-radius:14px;margin-bottom:20px;text-align:center;">' +
            '<small style="font-size:11px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;">Milestone Escrow Amount</small>' +
            '<strong style="display:block;font-size:30px;font-family:var(--font-display);color:var(--color-text-primary);margin-top:4px;margin-bottom:12px;">' + formatCurrency(amount) + '</strong>' +
            '<div style="width:120px;height:120px;margin:0 auto;background:#fff;padding:8px;border-radius:8px;border:1px solid #ddd;">' +
              '<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=payupi://pay?pa=eventflow@upi&am=' + amount + '&cu=INR" alt="QR Code" style="width:100%;height:100%;">' +
            '</div>' +
            '<div style="font-size:11px;color:#888;margin-top:6px;">Scan to pay via UPI (Demo)</div>' +
          '</div>' +
          '<div style="text-align:left;margin-bottom:20px;font-size:12.5px;color:var(--color-text-secondary);border:1px solid var(--color-border);border-radius:12px;padding:12px 14px;">' +
            '<div style="display:flex;justify-content:space-between;padding:5px 0;"><span>Payment Gateway</span><strong>UPI / NetBanking / Cards</strong></div>' +
            '<div style="display:flex;justify-content:space-between;padding:5px 0;"><span>Escrow Vault</span><strong style="color:var(--color-success);">' + icon('shieldCheck', '', 13) + ' Locked in Vault</strong></div>' +
            '<div style="display:flex;justify-content:space-between;padding:5px 0;"><span>Protection</span><span>Release only upon customer sign-off</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:10px;">' +
            '<button class="btn btn-outline" style="flex:1;" id="pm-cancel">Cancel</button>' +
            '<button class="btn btn-primary" style="flex:1.5;" id="pm-pay">' + icon('creditCard', '', 16) + ' Authorize &amp; Pay</button>' +
          '</div>' +
        '</div>' +
        '<div id="pm-step-2" style="display:none;text-align:center;padding:24px 0;">' +
          '<div class="payment-loader"></div>' +
          '<h4 style="font-size:18px;margin:16px 0 6px;">Connecting to Bank Gateway...</h4>' +
          '<p style="font-size:12.5px;color:var(--color-text-secondary);">Locking funds securely in milestone escrow vault.</p>' +
        '</div>' +
        '<div id="pm-step-3" style="display:none;text-align:center;padding:16px 0;">' +
          '<div class="payment-success-mark">' + icon('check', '', 32) + '</div>' +
          '<h4 style="font-size:20px;margin:12px 0 6px;color:var(--color-success);">Escrow Payment Confirmed!</h4>' +
          '<p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:20px;">Receipt has been recorded. Manager notified and milestone unlocked.</p>' +
          '<button class="btn btn-primary" style="width:100%;" id="pm-done">Continue to Workspace</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.querySelector('#pm-cancel').addEventListener('click', function () {
      modal.remove();
    });

    var isSubmitting = false;
    modal.querySelector('#pm-pay').addEventListener('click', function () {
      if (isSubmitting) return;
      isSubmitting = true;
      
      modal.querySelector('#pm-step-1').style.display = 'none';
      modal.querySelector('#pm-step-2').style.display = 'block';

      // Call API
      apiPost('/payments', {
        bookingId: bookingId,
        amount: amount,
        paymentMethod: 'UPI'
      }).then(function () {
        setTimeout(function () {
          modal.querySelector('#pm-step-2').style.display = 'none';
          modal.querySelector('#pm-step-3').style.display = 'block';
        }, 1100);
      }).catch(function (err) {
        showToast(err.message || 'Payment failed', 'error');
        modal.querySelector('#pm-step-2').style.display = 'none';
        modal.querySelector('#pm-step-1').style.display = 'block';
        isSubmitting = false;
      });
    });

    modal.querySelector('#pm-done').addEventListener('click', function () {
      modal.remove();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  // ==========================================================================
  // PRIORITY MANAGER SUPPORT & CONCIERGE MODAL
  // ==========================================================================
  function openSupportModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    var modal = document.getElementById('ef-support-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ef-support-modal';
      modal.className = 'ef-modal-backdrop';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(8,6,14,0.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;z-index:9999;padding:20px;';
      modal.innerHTML = [
        '<div class="ef-modal-dialog" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:16px;width:100%;max-width:540px;box-shadow:var(--shadow-lg);overflow:hidden;animation:modalIn 0.25s var(--ease);">',
        '  <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--color-border);background:var(--surface-2);">',
        '    <div style="display:flex;align-items:center;gap:12px;">',
        '      <div style="width:36px;height:36px;border-radius:10px;background:rgba(124,58,237,0.12);display:flex;align-items:center;justify-content:center;color:var(--violet);flex-shrink:0;">' + icon('helpCircle', '', 20) + '</div>',
        '      <div>',
        '        <h3 style="font-size:18px;margin:0;font-weight:700;color:var(--ink);">Priority Manager Support</h3>',
        '        <small style="color:var(--muted);font-size:12.5px;">Direct 24/7 Producer Concierge & Escalation</small>',
        '      </div>',
        '    </div>',
        '    <button type="button" id="ef-close-support" style="border:none;background:transparent;cursor:pointer;font-size:22px;color:var(--muted);padding:4px 8px;line-height:1;border-radius:6px;">✕</button>',
        '  </div>',
        '  <div style="padding:24px;">',
        '    <div style="background:var(--surface-2);border:1px solid var(--line-soft);border-radius:12px;padding:16px;margin-bottom:20px;">',
        '      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">',
        '        <strong style="font-size:13.5px;color:var(--ink);">Direct Concierge Hotline</strong>',
        '        <span class="badge active" style="font-size:11px;padding:3px 10px;">Available Now</span>',
        '      </div>',
        '      <p style="font-size:13px;color:var(--muted);margin:0 0 12px 0;line-height:1.5;">Immediate assistance with client requirements, proposal bids, escrow clearance, and dispute resolution.</p>',
        '      <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:13px;">',
        '        <a href="tel:+919820012345" style="color:var(--violet);font-weight:600;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">' + icon('phone', '', 14) + ' +91 (022) 6940-3000</a>',
        '        <a href="mailto:concierge@eventflow.luxury" style="color:var(--violet);font-weight:600;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">' + icon('messageCircle', '', 14) + ' concierge@eventflow.luxury</a>',
        '      </div>',
        '    </div>',
        '    <form id="ef-support-form">',
        '      <div style="margin-bottom:14px;">',
        '        <label style="font-size:12.5px;font-weight:600;display:block;margin-bottom:6px;color:var(--ink);">Inquiry Category</label>',
        '        <select class="form-control" id="ef-sup-cat" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:13.5px;">',
        '          <option>Milestone Payment & Escrow Clearance</option>',
        '          <option>Client Verification & Proposal Dispute</option>',
        '          <option>Vendor & Production Schedule Conflict</option>',
        '          <option>Profile & Portfolio Verification</option>',
        '          <option>Other Operational Inquiry</option>',
        '        </select>',
        '      </div>',
        '      <div style="margin-bottom:20px;">',
        '        <label style="font-size:12.5px;font-weight:600;display:block;margin-bottom:6px;color:var(--ink);">Brief Description</label>',
        '        <textarea class="form-control" id="ef-sup-desc" rows="3" required placeholder="Describe your operational requirement or request..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:13.5px;font-family:inherit;resize:vertical;"></textarea>',
        '      </div>',
        '      <div style="display:flex;justify-content:flex-end;gap:12px;">',
        '        <button type="button" class="btn btn-outline" id="ef-cancel-support">Cancel</button>',
        '        <button type="submit" class="btn btn-primary" id="ef-submit-support-btn">Submit Priority Ticket</button>',
        '      </div>',
        '    </form>',
        '  </div>',
        '</div>'
      ].join('\n');
      document.body.appendChild(modal);

      modal.addEventListener('click', function (ev) {
        if (ev.target === modal || ev.target.id === 'ef-close-support' || ev.target.id === 'ef-cancel-support') {
          modal.style.display = 'none';
        }
      });
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && modal.style.display === 'flex') {
          modal.style.display = 'none';
        }
      });

      var form = modal.querySelector('#ef-support-form');
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var cat = document.getElementById('ef-sup-cat').value;
        var desc = document.getElementById('ef-sup-desc').value;
        var btn = document.getElementById('ef-submit-support-btn');
        btn.disabled = true;
        btn.innerText = 'Transmitting...';

        apiPost('/tickets', {
          subject: cat,
          description: desc,
          priority: 'HIGH'
        }).then(function () {
          showToast('Priority Ticket #EF-' + Math.floor(1000 + Math.random() * 9000) + ' created. A concierge lead has been paged.', 'success');
          modal.style.display = 'none';
          btn.disabled = false;
          btn.innerText = 'Submit Priority Ticket';
          document.getElementById('ef-sup-desc').value = '';
        }).catch(function (err) {
          showToast(err.message || 'Support request failed.', 'error');
          btn.disabled = false;
          btn.innerText = 'Submit Priority Ticket';
        });
      });
    }
    modal.style.display = 'flex';
  }

  function handleLogout(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearUser();
    showToast('Logged out successfully', 'info');
    setTimeout(function () {
      window.location.href = 'login.html';
    }, 350);
  }

  // ==========================================================================
  // SIDEBAR ACTIVE STATE SYNC
  // ==========================================================================
  function syncSidebarActiveState() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.sidebar .side-link');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href) {
        var cleanHref = href.split('?')[0].split('#')[0];
        if (cleanHref === path) {
          link.classList.add('active');
        } else if (cleanHref && cleanHref !== '#support') {
          link.classList.remove('active');
        }
      }
    });
  }

  // Export public namespace
  // ==========================================================================
  // HOTSTAR FESTIVAL SHOWCASE & CINEMATIC TRAILER REEL CONTROLLER
  // ==========================================================================
  var HotstarShowcase = {
    currentIndex: 0,
    slideCount: 6,
    duration: 6000,
    timer: null,
    progressInterval: null,
    progressStart: null,
    elapsed: 0,
    isPaused: false,
    audioCtx: null,
    audioOscillators: [],
    isAudioPlaying: false,
    currentTrailerIndex: 0,

    festivals: [
      {
        name: "Shreemant Dagdusheth Ganpati Maha Utsav",
        badge: "SHREEMANT DAGDUSHETH UTSAV (4K)",
        dates: "August – September (Ganeshotsav)",
        location: "Pune, Mumbai & Pan-India Society Arenas",
        cost: "₹5,00,000 - ₹35,00,000",
        guests: "1,000 to 50,000+ Gatherings",
        img: "assets/ganpati-4k-web.jpg",
        desc: "End-to-end Shreemant Dagdusheth Halwai Ganpati darshan pavilions and Sarvajanik Ganeshotsav production. Opulent golden temple replica pandal fabrication, authentic gold adornment styling, 100-member live Puneri Dhol-Tasha pathaks, 4K multi-cam live darshan streaming, and VIP queue management."
      },
      {
        name: "Krishna Janmashtami & Dahi Handi",
        badge: "GOKULASHTAMI UTSAV",
        dates: "August – September",
        location: "Public Arenas & Community Grounds",
        cost: "₹4,00,000 - ₹25,00,000",
        guests: "5,000 to 25,000+ Gatherings",
        img: "assets/janmashtami-dahi-handi-4k-web.jpg",
        desc: "High-octane Dahi Handi arena setups with 9-tier Govinda safety harness rigging, certified impact cranes, concert-grade acoustic line arrays, floral jhula darshan pavilions, and certified emergency paramedic teams."
      },
      {
        name: "Navratri Dandiya & Garba Raas",
        badge: "9 NIGHTS OF DANCE",
        dates: "September – October (9 Nights)",
        location: "Stadiums, Club Turfs & Luxury Lawns",
        cost: "₹8,00,000 - ₹35,00,000",
        guests: "2,000 to 15,000+ Dancers Arena",
        img: "assets/navratri-garba-vadodara-4k-web.jpg",
        desc: "Full-scale Navratri Garba arena infrastructure: heavy-duty wooden dance flooring, weatherproof German hanger domes, concert audio line arrays, celebrity folk singers, synchronized LED wristbands, and VIP lounge hospitality."
      },
      {
        name: "Durga Puja & Sharad Utsav",
        badge: "UNESCO HERITAGE UTSAV",
        dates: "October (5 Sacred Days)",
        location: "Cultural Grounds & Association Complexes",
        cost: "₹6,00,000 - ₹40,00,000",
        guests: "5,000 to 30,000+ Daily Visitors",
        img: "assets/durga-puja-pandal-kolkata-4k-web.jpg",
        desc: "Architectural heritage replica pandals, artistic idol backdrop installations, authentic Dhaak drummer troupes, Dhunuchi dance lighting, royal bhog community banquet catering, and automated entry-exit crowd circulation."
      },
      {
        name: "Grand Diwali Gala & Deepotsav",
        badge: "FESTIVAL OF LIGHTS",
        dates: "October – November",
        location: "Corporate Campuses, Resorts & Lawns",
        cost: "₹5,00,000 - ₹45,00,000",
        guests: "Corporate & Community Grandeur",
        img: "assets/diwali-celebration-lights-4k-web.jpg",
        desc: "Magnificent Deepotsav festival setups: 10,000+ artisanal brass and earthen diya illuminations, architectural facade mapping, eco-friendly aerial cold fireworks, curated gift lounges, and live musical evening concerts."
      }
    ],

    init: function () {
      var showcase = document.getElementById('hotstar-showcase');
      if (!showcase) return;

      var self = this;
      var slides = showcase.querySelectorAll('.hotstar-slide');
      var thumbs = showcase.querySelectorAll('.hotstar-thumb-card');
      var nextBtn = document.getElementById('hotstar-next-btn');
      var prevBtn = document.getElementById('hotstar-prev-btn');

      this.slideCount = slides.length || 6;

      // Event Listeners for Nav Chevrons
      if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
          e.preventDefault();
          self.next();
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.preventDefault();
          self.prev();
        });
      }

      // Thumbnail clicks & accessibility
      thumbs.forEach(function (thumb, idx) {
        thumb.addEventListener('click', function () {
          self.goTo(idx);
        });
        thumb.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            self.goTo(idx);
          }
        });
      });

      // Pause on hover
      showcase.addEventListener('mouseenter', function () {
        self.isPaused = true;
      });
      showcase.addEventListener('mouseleave', function () {
        self.isPaused = false;
      });

      // Keyboard arrow navigation
      window.addEventListener('keydown', function (e) {
        var modal = document.getElementById('hotstar-trailer-modal');
        if (modal && modal.classList.contains('open')) {
          if (e.key === 'Escape') self.closeTrailer();
          return;
        }
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.key === 'ArrowRight') self.next();
        if (e.key === 'ArrowLeft') self.prev();
      });

      // Touch swipe support
      var touchStartX = 0;
      var touchEndX = 0;
      showcase.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      showcase.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
          if (diff > 0) self.next();
          else self.prev();
        }
      }, { passive: true });

      // Plan Festival Event Buttons (prefills brief and scrolls)
      document.querySelectorAll('.hotstar-plan-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var festName = btn.getAttribute('data-festival-name') || self.festivals[self.currentIndex].name;
          var city = btn.getAttribute('data-city') || 'Mumbai';
          var budget = btn.getAttribute('data-budget') || '₹ 15L - ₹ 35 Lakhs';
          self.planFestival(festName, city, budget);
        });
      });

      // Trailer Buttons
      document.querySelectorAll('.hotstar-trailer-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var idx = parseInt(btn.getAttribute('data-slide-index') || self.currentIndex, 10);
          self.openTrailer(idx);
        });
      });

      // Modal close button and backdrop click
      var closeBtn = document.getElementById('hotstar-modal-close-btn');
      var modalBackdrop = document.getElementById('hotstar-trailer-modal');
      var modalDialog = document.getElementById('hotstar-modal-dialog');
      var smartHeader = document.getElementById('hotstar-modal-smart-header');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          self.closeTrailer();
        });
      }
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', function (e) {
          if (e.target === modalBackdrop) {
            self.closeTrailer();
          }
        });
      }

      // Intelligent modal header scroll listener (shrinks / pins header dynamically)
      if (modalDialog && smartHeader) {
        modalDialog.addEventListener('scroll', function () {
          if (modalDialog.scrollTop > 24) {
            smartHeader.classList.add('scrolled');
          } else {
            smartHeader.classList.remove('scrolled');
          }
        }, { passive: true });
      }

      // Modal Plan buttons (both full body and pinned header actions)
      var modalPlanBtn = document.getElementById('hotstar-modal-plan-btn');
      var headerPlanBtn = document.getElementById('hotstar-header-plan-btn');
      function handlePlanFestivalClick() {
        var f = self.festivals[self.currentTrailerIndex || self.currentIndex];
        self.closeTrailer();
        self.planFestival(f.name, '', f.cost);
      }
      if (modalPlanBtn) {
        modalPlanBtn.addEventListener('click', handlePlanFestivalClick);
      }
      if (headerPlanBtn) {
        headerPlanBtn.addEventListener('click', handlePlanFestivalClick);
      }

      // Modal Audio and Play toggles
      var audioToggle = document.getElementById('hotstar-audio-toggle');
      if (audioToggle) {
        audioToggle.addEventListener('click', function () {
          self.toggleAudio();
        });
      }
      var playToggle = document.getElementById('hotstar-play-toggle');
      if (playToggle) {
        playToggle.addEventListener('click', function () {
          self.toggleReelPlay();
        });
      }

      // Initial Slide
      this.goTo(0);
      this.startTimer();
    },

    goTo: function (index) {
      var prevIndex = typeof this.currentIndex === 'number' ? this.currentIndex : -1;
      this.currentIndex = (index + this.slideCount) % this.slideCount;
      var showcase = document.getElementById('hotstar-showcase');
      if (!showcase) return;

      if (prevIndex !== this.currentIndex && prevIndex !== -1) {
        showcase.classList.remove('slide-pulse');
        void showcase.offsetWidth;
        showcase.classList.add('slide-pulse');
      }

      var slides = showcase.querySelectorAll('.hotstar-slide');
      var thumbs = showcase.querySelectorAll('.hotstar-thumb-card');

      slides.forEach(function (slide, idx) {
        if (idx === this.currentIndex) {
          slide.classList.remove('leaving');
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else if (idx === prevIndex && prevIndex !== -1 && prevIndex !== this.currentIndex) {
          slide.classList.remove('active');
          slide.classList.add('leaving');
          slide.setAttribute('aria-hidden', 'true');
        } else {
          slide.classList.remove('active', 'leaving');
          slide.setAttribute('aria-hidden', 'true');
        }
      }, this);

      thumbs.forEach(function (thumb, idx) {
        var bar = thumb.querySelector('.hotstar-thumb-progress');
        if (idx === this.currentIndex) {
          thumb.classList.add('active');
          thumb.setAttribute('aria-selected', 'true');
        } else {
          thumb.classList.remove('active');
          thumb.setAttribute('aria-selected', 'false');
          if (bar) bar.style.width = '0%';
        }
      }, this);

      this.resetProgress();
    },

    next: function () {
      this.goTo(this.currentIndex + 1);
    },

    prev: function () {
      this.goTo(this.currentIndex - 1);
    },

    startTimer: function () {
      var self = this;
      this.progressStart = Date.now();
      clearInterval(this.progressInterval);

      this.progressInterval = setInterval(function () {
        var modal = document.getElementById('hotstar-trailer-modal');
        if (self.isPaused || (modal && modal.classList.contains('open'))) {
          self.progressStart = Date.now() - self.elapsed;
          return;
        }

        self.elapsed = Date.now() - self.progressStart;
        var pct = Math.min(100, (self.elapsed / self.duration) * 100);

        var activeThumb = document.querySelector('.hotstar-thumb-card.active .hotstar-thumb-progress');
        if (activeThumb) {
          activeThumb.style.width = pct + '%';
        }

        if (self.elapsed >= self.duration) {
          self.next();
        }
      }, 50);
    },

    resetProgress: function () {
      this.progressStart = Date.now();
      this.elapsed = 0;
      var activeThumb = document.querySelector('.hotstar-thumb-card.active .hotstar-thumb-progress');
      if (activeThumb) activeThumb.style.width = '0%';
    },

    planFestival: function (name, city, budget) {
      showToast('Opening requirement brief for ' + name + '...', 'info');
      var cleanCity = (city || '').split(',')[0].trim();
      var cleanBudget = (budget || '1500000').replace(/[^0-9]/g, '') || '1500000';
      var url = 'create-requirement.html?category=Festivals&title=' + encodeURIComponent(name) + (cleanCity ? '&city=' + encodeURIComponent(cleanCity) : '') + '&budget=' + encodeURIComponent(cleanBudget);
      setTimeout(function () {
        window.location.href = url;
      }, 300);
    },

    openTrailer: function (index) {
      var f = this.festivals[index] || this.festivals[this.currentIndex];
      this.currentTrailerIndex = index;

      var modal = document.getElementById('hotstar-trailer-modal');
      var modalDialog = document.getElementById('hotstar-modal-dialog');
      var smartHeader = document.getElementById('hotstar-modal-smart-header');
      var titleEl = document.getElementById('hotstar-modal-title');
      var headerTitleEl = document.getElementById('hotstar-header-title');
      var descEl = document.getElementById('hotstar-modal-desc');
      var badgeEl = document.getElementById('hotstar-modal-badge');
      var headerBadgeEl = document.getElementById('hotstar-header-badge');
      var imgEl = document.getElementById('hotstar-modal-img');
      var datesEl = document.getElementById('hotstar-modal-dates');
      var locEl = document.getElementById('hotstar-modal-location');
      var costEl = document.getElementById('hotstar-modal-cost');

      if (titleEl) titleEl.textContent = f.name;
      if (headerTitleEl) headerTitleEl.textContent = f.name;
      if (descEl) descEl.textContent = f.desc;
      if (badgeEl) badgeEl.innerHTML = '<span class="live-dot"></span> ' + f.badge;
      if (headerBadgeEl) headerBadgeEl.innerHTML = '<span class="live-dot"></span> ' + (f.badge ? f.badge.split('•')[0].trim() : '4K PREVIEW');
      if (imgEl) imgEl.src = f.img;
      if (datesEl) datesEl.textContent = f.dates;
      if (locEl) locEl.textContent = f.location;
      if (costEl) costEl.textContent = f.cost;

      if (modalDialog) {
        modalDialog.scrollTop = 0;
      }
      if (smartHeader) {
        smartHeader.classList.remove('scrolled');
      }

      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      this.startCelebrationAudio();
    },

    closeTrailer: function () {
      var modal = document.getElementById('hotstar-trailer-modal');
      var smartHeader = document.getElementById('hotstar-modal-smart-header');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
      if (smartHeader) {
        smartHeader.classList.remove('scrolled');
      }
      this.stopCelebrationAudio();
    },

    startCelebrationAudio: function () {
      try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        this.stopCelebrationAudio();

        var notes = [146.83, 220.00, 293.66, 369.99, 440.00, 587.33];
        var masterGain = this.audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);
        masterGain.connect(this.audioCtx.destination);
        this.masterGain = masterGain;

        var self = this;
        notes.forEach(function (freq, i) {
          var osc = self.audioCtx.createOscillator();
          var gain = self.audioCtx.createGain();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, self.audioCtx.currentTime);
          gain.gain.setValueAtTime(0.035 / (i + 1), self.audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          self.audioOscillators.push(osc);
        });

        this.isAudioPlaying = true;
        var audioText = document.getElementById('hotstar-audio-text');
        var volumeIcon = document.getElementById('hotstar-volume-icon');
        if (audioText) audioText.textContent = 'Festive Sound: ON';
        if (volumeIcon) volumeIcon.innerHTML = ICONS.volume2;
      } catch (err) {
        // Audio policy
      }
    },

    stopCelebrationAudio: function () {
      if (this.audioOscillators && this.audioOscillators.length) {
        this.audioOscillators.forEach(function (osc) {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        this.audioOscillators = [];
      }
      this.isAudioPlaying = false;
      var audioText = document.getElementById('hotstar-audio-text');
      var volumeIcon = document.getElementById('hotstar-volume-icon');
      if (audioText) audioText.textContent = 'Festive Sound: MUTED';
      if (volumeIcon) volumeIcon.innerHTML = ICONS.volumeX;
    },

    toggleAudio: function () {
      if (this.isAudioPlaying) {
        this.stopCelebrationAudio();
      } else {
        this.startCelebrationAudio();
      }
    },

    toggleReelPlay: function () {
      var img = document.getElementById('hotstar-modal-img');
      var text = document.getElementById('hotstar-play-text');
      if (!img || !text) return;

      if (img.style.filter === 'grayscale(0.6)') {
        img.style.filter = 'none';
        text.textContent = 'Celebration Preview Active';
      } else {
        img.style.filter = 'grayscale(0.6)';
        text.textContent = 'Preview Paused';
      }
    }
  };

  // ================= EVENT CATEGORY SKELETON LOADING CONTROLLER =================
  var CategorySkeletonLoader = {
    init: function () {
      var grid = document.getElementById('home-category-grid');
      if (!grid) return;

      var cards = grid.querySelectorAll('.category-card-item');
      if (!cards.length) return;

      var simulateBtn = document.getElementById('btn-simulate-category-loading');
      if (simulateBtn) {
        simulateBtn.addEventListener('click', function () {
          CategorySkeletonLoader.simulateLoading();
        });
      }

      this.preloadCategoryImages(cards);
    },

    preloadCategoryImages: function (cards) {
      var self = this;

      cards.forEach(function (card, idx) {
        var assetUrl = card.getAttribute('data-asset');
        var cover = card.querySelector('.cover');

        // Ensure skeleton state is active while high-res Indian celebration photography fetches
        card.classList.add('is-skeleton');
        card.classList.remove('is-loaded');

        if (!assetUrl && cover) {
          var style = window.getComputedStyle(cover);
          var bg = style.backgroundImage;
          var match = bg && bg.match(/url\(['"]?(.*?)['"]?\)/);
          if (match && match[1]) {
            assetUrl = match[1];
          }
        }

        if (!assetUrl) {
          self.revealCard(card, idx * 60);
          return;
        }

        var img = new Image();
        img.src = assetUrl;

        var onDone = function () {
          // Subtle natural stagger so cards reveal gracefully
          self.revealCard(card, idx * 65);
        };

        if (img.complete) {
          // If cached in browser, deliver a brief 250ms shimmer to show the polished UI state
          setTimeout(onDone, 250 + (idx * 60));
        } else {
          img.onload = onDone;
          img.onerror = onDone;
        }
      });

      // Safety fallback: if network hangs, guarantee skeleton reveal within 2.8s
      setTimeout(function () {
        cards.forEach(function (c) {
          if (c.classList.contains('is-skeleton')) {
            c.classList.remove('is-skeleton');
            c.classList.add('is-loaded');
          }
        });
      }, 2800);
    },

    revealCard: function (card, delay) {
      setTimeout(function () {
        card.classList.remove('is-skeleton');
        card.classList.add('is-loaded');
      }, delay || 0);
    },

    simulateLoading: function () {
      var grid = document.getElementById('home-category-grid');
      if (!grid) return;
      var cards = grid.querySelectorAll('.category-card-item');
      if (!cards.length) return;

      var btn = document.getElementById('btn-simulate-category-loading');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('is-active');
      }

      cards.forEach(function (card) {
        card.classList.remove('is-loaded');
        card.classList.add('is-skeleton');
      });

      var self = this;
      var total = cards.length;
      cards.forEach(function (card, idx) {
        setTimeout(function () {
          self.revealCard(card, 0);
          if (idx === total - 1 && btn) {
            setTimeout(function () {
              btn.disabled = false;
              btn.classList.remove('is-active');
            }, 300);
          }
        }, 700 + (idx * 110));
      });
    }
  };

  window.EventFlow = {
    getUser: getUser,
    setUser: setUser,
    clearUser: clearUser,
    setToken: setToken,
    getToken: getToken,
    clearToken: clearToken,
    showToast: showToast,
    apiGet: apiGet,
    apiPost: apiPost,
    apiPut: apiPut,
    apiDelete: apiDelete,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    statusBadge: statusBadge,
    setupNavAndAccount: setupNavAndAccount,
    triggerPaymentModal: triggerPaymentModal,
    openSupportModal: openSupportModal,
    handleLogout: handleLogout,
    syncSidebarActiveState: syncSidebarActiveState,
    icon: icon,
    hydrateIcons: hydrateIcons,
    getTheme: getTheme,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    applyNavigationThemeTransition: applyNavigationThemeTransition,
    setupNavigationThemeTransition: setupNavigationThemeTransition,
    HotstarShowcase: HotstarShowcase,
    CategorySkeletonLoader: CategorySkeletonLoader
  };


  function syncSidebarUserInfo() {
    var u = EventFlow.getUser();
    if (!u) return;
    
    var n = u.business_name || u.name || (u.role === 'EVENT_MANAGER' ? 'Event Producer' : 'EventFlow User');
    var init = n.charAt(0).toUpperCase();
    
    var nameEls = document.querySelectorAll('.sidebar-user-name, #side-user-name');
    nameEls.forEach(function(el) { el.textContent = n; });
    
    var avatarEls = document.querySelectorAll('.sidebar-user-avatar, #side-user-avatar');
    avatarEls.forEach(function(el) { el.textContent = init; });
    
    var roleEls = document.querySelectorAll('.sidebar-user-role, #side-user-role');
    var roleStr = (u.role === 'EVENT_MANAGER' ? 'Event Producer' : (u.role === 'ADMIN' ? 'Administrator' : 'Luxury Client'));
    roleEls.forEach(function(el) { el.textContent = roleStr; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncSidebarUserInfo();
    setupNavigationThemeTransition();
    setupNavAndAccount();
    syncSidebarActiveState();
    HotstarShowcase.init();
    CategorySkeletonLoader.init();
  });

})(window, document);
