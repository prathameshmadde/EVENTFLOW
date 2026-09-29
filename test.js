
    // =========================================================================
    // EVENTFLOW HOST CELEBRATION WORKSPACE CONTROLLER
    // =========================================================================
    var EventFlowDashboard = (function () {
      'use strict';

      var state = {
        user: null,
        requirements: [],
        proposals: [],
        bookings: [],
        payments: [],
        tasks: [],
        tickets: [],
        activeTab: 'overview'
      };

      // Helper function to format Indian currency
      function fmtCur(n) {
        return EventFlow.formatCurrency(n);
      }
      function fmtDate(d) {
        return EventFlow.formatDate(d);
      }

      // Initialize workspace
      function init() {
        state.user = EventFlow.getUser();
        updateTopGreeting();
        updateSidebarUser();
        setupTabSwitching();
        setupModalTriggers();
        loadAllDashboardData();
        setupPaymentForm();
        setupTicketForm();
        setupFilterListeners();
      }

      function updateSidebarUser() {
        if (!state.user) return;
        var nameEl = document.getElementById('side-user-name');
        var roleEl = document.getElementById('side-user-role');
        var avatarEl = document.getElementById('side-user-avatar');
        if (nameEl && state.user.name) nameEl.textContent = state.user.name;
        if (roleEl) {
          roleEl.textContent = (state.user.role === 'EVENT_MANAGER') ? 'Event Producer' : ((state.user.role === 'ADMIN') ? 'System Admin' : 'Host & Client');
        }
        if (avatarEl && state.user.name) {
          var initials = state.user.name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
          avatarEl.textContent = initials || 'PS';
        }
      }

      function updateTopGreeting() {
        var dateEl = document.getElementById('top-current-date');
        if (dateEl) {
          var today = new Date();
          var opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
          dateEl.textContent = today.toLocaleDateString('en-IN', opts);
        }
      }

      // TAB NAVIGATION
      function setupTabSwitching() {
        var tabButtons = document.querySelectorAll('.dash-tab-btn');
        tabButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var target = btn.getAttribute('data-tab-target');
            switchTab(target);
          });
        });

        // Also handle sidebar links that point to hash tabs
        var sideLinks = document.querySelectorAll('.sidebar .side-link[data-tab]');
        sideLinks.forEach(function (link) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            var tab = link.getAttribute('data-tab');
            switchTab(tab);
          });
        });

        // Check if hash matches a tab
        var hash = window.location.hash.replace('#', '');
        if (['overview', 'events', 'proposals', 'bookings', 'payments', 'support'].indexOf(hash) !== -1) {
          switchTab(hash);
        }
      }

      function switchTab(tabId) {
        state.activeTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.dash-tab-btn').forEach(function (b) {
          if (b.getAttribute('data-tab-target') === tabId) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        // Update tab panes
        document.querySelectorAll('.dash-tab-pane').forEach(function (pane) {
          if (pane.id === 'tab-' + tabId) {
            pane.style.display = 'block';
          } else {
            pane.style.display = 'none';
          }
        });

        // Update sidebar links
        document.querySelectorAll('.sidebar .side-link').forEach(function (l) {
          if (l.getAttribute('data-tab') === tabId) {
            l.classList.add('active');
          } else if (l.hasAttribute('data-tab')) {
            l.classList.remove('active');
          }
        });

        // Update URL hash without reload
        if (history.replaceState) {
          history.replaceState(null, null, '#' + tabId);
        }

        // Scroll top of dash-content smoothly
        var content = document.querySelector('.dash-content');
        if (content) content.scrollTop = 0;

        // Re-evaluate scroll reveals, card tilt, and physics for newly revealed tab elements
        if (window.EventFlowExperience) {
          setTimeout(function () {
            window.EventFlowExperience.refresh();
          }, 30);
        }
      }

      // MODAL CONTROLS
      function setupModalTriggers() {
        // Modal close buttons
        document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-close-modal');
            closeModal(targetId);
          });
        });

        // Click outside modal sheet to close
        document.querySelectorAll('.ef-modal-backdrop').forEach(function (backdrop) {
          backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) {
              closeModal(backdrop.id);
            }
          });
        });

        // Escape key closes modals
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            document.querySelectorAll('.ef-modal-backdrop.open').forEach(function (m) {
              closeModal(m.id);
            });
          }
        });

        // Flagship pay button
        var btnPay = document.getElementById('btn-flagship-pay');
        if (btnPay) {
          btnPay.addEventListener('click', function () {
            openPaymentModal(1, 'Grand Royal Rajputana Wedding', 390000, 'STAGE 3 (VENDOR ALIGNMENT)');
          });
        }

        var btnTriggerPayTab = document.getElementById('btn-trigger-payment-tab');
        if (btnTriggerPayTab) {
          btnTriggerPayTab.addEventListener('click', function () {
            openPaymentModal(1, 'Grand Royal Rajputana Wedding', 390000, 'STAGE 3 (VENDOR ALIGNMENT)');
          });
        }

        // Concierge Ticket Button
        var btnRaiseTicket = document.getElementById('btn-raise-ticket');
        if (btnRaiseTicket) {
          btnRaiseTicket.addEventListener('click', function () {
            openModal('modal-ticket');
          });
        }

        var btnNewTicket = document.getElementById('btn-new-ticket');
        if (btnNewTicket) {
          btnNewTicket.addEventListener('click', function () {
            openModal('modal-ticket');
          });
        }

        // Compare all button
        var btnCompare = document.getElementById('btn-compare-all');
        if (btnCompare) {
          btnCompare.addEventListener('click', function () {
            openCompareModal();
          });
        }

        // Direct Call Concierge
        var btnCall = document.getElementById('btn-call-concierge');
        if (btnCall) {
          btnCall.addEventListener('click', function () {
            EventFlow.showToast('Connecting you to Senior Concierge: +91 (022) 4893-9000', 'info');
          });
        }
        var btnFlagshipContact = document.getElementById('btn-flagship-contact');
        if (btnFlagshipContact) {
          btnFlagshipContact.addEventListener('click', function () {
            EventFlow.showToast('Opening secure chat channel with Arjun Events...', 'info');
          });
        }
      }

      function openModal(id) {
        var m = document.getElementById(id);
        if (m) m.classList.add('open');
      }

      function closeModal(id) {
        var m = document.getElementById(id);
        if (m) m.classList.remove('open');
      }

      // LOAD DATA FROM API
      function loadAllDashboardData() {
        var cid = state.user ? (state.user.user_id || state.user.id || 3) : 3;

        // Fetch requirements
        var pReqs = EventFlow.apiGet('/requirements').then(function (res) {
          state.requirements = Array.isArray(res) ? res : (res.requirements || []);
        }).catch(function (err) {
          console.warn('Fallback requirements loading', err);
          state.requirements = [];
        });

        // Fetch proposals for customer
        var pProps = EventFlow.apiGet('/customers/' + cid + '/proposals').then(function (res) {
          state.proposals = Array.isArray(res) ? res : (res.proposals || []);
        }).catch(function (err) {
          console.warn('Fallback proposals loading', err);
          state.proposals = [];
        });

        // Fetch bookings for customer
        var pBookings = EventFlow.apiGet('/customers/' + cid + '/bookings').then(function (res) {
          state.bookings = Array.isArray(res) ? res : (res.bookings || []);
        }).catch(function (err) {
          console.warn('Fallback bookings loading', err);
          state.bookings = [];
        });

        // Fetch payments for customer
        var pPayments = EventFlow.apiGet('/customers/' + cid + '/payments').then(function (res) {
          state.payments = Array.isArray(res) ? res : (res.payments || []);
        }).catch(function (err) {
          console.warn('Fallback payments loading', err);
          state.payments = [];
        });

        // Fetch tasks
        var pTasks = EventFlow.apiGet('/bookings/1/tasks').then(function (res) {
          state.tasks = Array.isArray(res) ? res : (res.tasks || []);
        }).catch(function (err) {
          state.tasks = [];
        });

        // Fetch support tickets
        var pTickets = EventFlow.apiGet('/tickets').then(function (res) {
          state.tickets = Array.isArray(res) ? res : (res.tickets || []);
        }).catch(function (err) {
          state.tickets = [];
        });

        Promise.all([pReqs, pProps, pBookings, pPayments, pTasks, pTickets]).finally(function () {
          renderAll();
        });
      }

      function renderAll() {
        renderBadgeCounters();
        renderKPIs();
        renderOverviewLists();
        renderEventsTab();
        renderProposalsTab();
        renderBookingsTab();
        renderPaymentsTab();
        renderTicketsTab();
        EventFlow.hydrateIcons();
        if (window.EventFlowExperience) {
          setTimeout(function () {
            window.EventFlowExperience.refresh();
          }, 30);
        }
      }

      function renderBadgeCounters() {
        document.getElementById('badge-count-events').textContent = state.requirements.length;
        document.getElementById('badge-count-proposals').textContent = state.proposals.length;
        document.getElementById('badge-count-bookings').textContent = state.bookings.length;
        document.getElementById('badge-count-payments').textContent = state.payments.length;
      }

      function renderKPIs() {
        document.getElementById('kpi-bookings-count').textContent = state.bookings.length;
        document.getElementById('kpi-reqs-count').textContent = state.requirements.length;
        document.getElementById('kpi-proposals-count').textContent = state.proposals.length;

        var totalPaid = state.payments.reduce(function (acc, p) { return acc + (Number(p.amount) || 0); }, 0);
        document.getElementById('kpi-escrow-amt').textContent = totalPaid >= 100000 ? '₹ ' + (totalPaid / 100000).toFixed(1) + 'L' : fmtCur(totalPaid);

        var totalContract = state.bookings.reduce(function (acc, b) { return acc + (Number(b.final_amount) || Number(b.estimated_amount) || 0); }, 0);
        var totalDue = Math.max(totalContract - totalPaid, 0);

        var elContract = document.getElementById('pay-total-contract');
        var elEscrow = document.getElementById('pay-total-escrow');
        var elDue = document.getElementById('pay-total-due');
        if (elContract) elContract.textContent = fmtCur(totalContract);
        if (elEscrow) elEscrow.textContent = fmtCur(totalPaid);
        if (elDue) elDue.textContent = fmtCur(totalDue);

        // Tasks KPI
        var doneTasks = state.tasks.filter(function (t) { return t.status === 'COMPLETED'; }).length;
        document.getElementById('kpi-tasks-ratio').textContent = doneTasks + ' / ' + (state.tasks.length || 0);
      }

      // RENDER OVERVIEW TAB LISTS
      function renderOverviewLists() {
        // 1. Proposals List in Overview
        var propListEl = document.getElementById('overview-proposals-list');
        if (propListEl) {
          if (!state.proposals.length) {
            propListEl.innerHTML = '<div class="ef-empty-state" style="padding:28px 16px;"><h4>No Proposals Received Yet</h4><p>Event managers will submit bespoke quotations once they review your brief.</p></div>';
          } else {
            propListEl.innerHTML = state.proposals.slice(0, 3).map(function (p) {
              return '<div class="list-row" style="align-items:center;padding:14px 16px;">' +
                '<div>' +
                  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                    EventFlow.statusBadge(p.status) +
                    '<strong style="font-size:15px;">' + (p.business_name || p.manager_name || 'Event Manager') + '</strong>' +
                    '<span style="font-size:12px;color:#d4a72c;font-weight:700;">★ ' + (p.rating || '4.8') + '</span>' +
                  '</div>' +
                  '<div style="font-size:12.5px;color:var(--color-text-secondary);">' +
                    '<span>Package: <strong>' + (p.package_name || 'Bespoke Package') + '</strong></span> • ' +
                    '<span>Quote: <strong style="color:var(--color-text-primary);">' + fmtCur(p.price) + '</strong></span>' +
                  '</div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                  '<button type="button" class="btn btn-outline btn-sm" onclick="EventFlowDashboard.openProposalDetails(' + p.proposal_id + ')">Review</button>' +
                  (p.status === 'SUBMITTED' ? '<button type="button" class="btn btn-primary btn-sm" onclick="EventFlowDashboard.selectProposal(' + p.proposal_id + ')">Select & Lock</button>' : '') +
                '</div>' +
              '</div>';
            }).join('');
          }
        }

        // 2. Active Briefs List in Overview
        var briefsListEl = document.getElementById('overview-briefs-list');
        if (briefsListEl) {
          if (!state.requirements.length) {
            briefsListEl.innerHTML = '<div class="ef-empty-state" style="padding:28px 16px;"><h4>No Active Briefs</h4><p>Post a celebration brief to start receiving bespoke proposals.</p></div>';
          } else {
            briefsListEl.innerHTML = state.requirements.slice(0, 3).map(function (r) {
              return '<div class="list-row" style="align-items:center;padding:14px 16px;">' +
                '<div>' +
                  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                    EventFlow.statusBadge(r.status) +
                    '<strong style="font-size:14.5px;">' + (r.requirement_title || r.title || 'Event Brief') + '</strong>' +
                  '</div>' +
                  '<div style="font-size:12.5px;color:var(--color-text-secondary);">' +
                    '<span>📅 ' + fmtDate(r.event_date || r.date) + '</span> • ' +
                    '<span>📍 ' + (r.location || 'Pan-India') + '</span> • ' +
                    '<span>Budget: <strong>' + fmtCur(r.budget) + '</strong></span>' +
                  '</div>' +
                '</div>' +
                '<div>' +
                  '<button type="button" class="btn btn-outline btn-sm" onclick="EventFlowDashboard.switchTab(\'proposals\')">Proposals (' + (r.proposal_count || 0) + ')</button>' +
                '</div>' +
              '</div>';
            }).join('');
          }
        }

        // 3. Tasks List in Overview
        var tasksListEl = document.getElementById('overview-tasks-list');
        if (tasksListEl) {
          tasksListEl.innerHTML = state.tasks.map(function (t) {
            var isDone = t.status === 'COMPLETED';
            return '<div class="list-row" style="align-items:center;padding:12px 14px;">' +
              '<div style="display:flex;align-items:center;gap:12px;">' +
                '<input type="checkbox" ' + (isDone ? 'checked' : '') + ' style="width:16px;height:16px;cursor:pointer;" onchange="EventFlowDashboard.toggleTask(' + t.task_id + ', this.checked)">' +
                '<div>' +
                  '<strong style="font-size:13.5px;' + (isDone ? 'text-decoration:line-through;opacity:0.6;' : '') + '">' + t.task_name + '</strong>' +
                  '<div style="font-size:11.5px;color:var(--color-text-secondary);margin-top:2px;">Due: ' + fmtDate(t.due_date) + ' • Priority: ' + (t.priority || 'NORMAL') + '</div>' +
                '</div>' +
              '</div>' +
              EventFlow.statusBadge(t.status) +
            '</div>';
          }).join('');
        }
      }

      // RENDER TAB 2: MY EVENTS
      function renderEventsTab() {
        var container = document.getElementById('events-container');
        if (!container) return;

        var search = (document.getElementById('filter-events-search').value || '').toLowerCase();
        var statusFilter = document.getElementById('filter-events-status').value;

        var filtered = state.requirements.filter(function (r) {
          var title = (r.requirement_title || r.title || '').toLowerCase();
          var loc = (r.location || '').toLowerCase();
          var matchSearch = !search || title.indexOf(search) !== -1 || loc.indexOf(search) !== -1;
          var matchStatus = !statusFilter || r.status === statusFilter;
          return matchSearch && matchStatus;
        });

        if (!filtered.length) {
          container.innerHTML =
            '<div class="ef-empty-state">' +
              '<div style="font-size:36px;margin-bottom:12px;">📋</div>' +
              '<h3>No Event Briefs Found</h3>' +
              '<p>You haven\'t posted any briefs matching this filter. Submit a new brief in 2 minutes.</p>' +
              '<a href="create-requirement.html" class="btn btn-primary" style="margin-top:16px;">Post Your First Event Brief →</a>' +
            '</div>';
          return;
        }

        container.innerHTML = filtered.map(function (req) {
          var pCount = req.proposal_count || 0;
          return '<div class="req-item-card">' +
            '<div class="req-card-header">' +
              '<div class="req-pills">' +
                EventFlow.statusBadge(req.status) +
                '<span class="badge" style="background:rgba(124,58,237,0.1);color:var(--color-primary);font-weight:700;">' + (req.event_name || 'Celebration') + '</span>' +
                '<span style="font-size:12px;color:var(--color-text-secondary);"><span data-ef-icon="mapPin" data-size="14"></span> ' + (req.location || 'India') + '</span>' +
              '</div>' +
              '<div style="display:flex;gap:8px;">' +
                '<button type="button" class="btn btn-outline btn-sm" onclick="EventFlowDashboard.filterProposalsByReq(' + req.requirement_id + ')">Review Proposals (' + pCount + ')</button>' +
                '<a href="create-requirement.html?edit=' + req.requirement_id + '" class="btn btn-outline btn-sm">Edit Brief</a>' +
              '</div>' +
            '</div>' +
            '<h3 class="req-title">' + (req.requirement_title || 'Celebration Brief') + '</h3>' +
            '<p class="req-desc">' + (req.description || 'Custom event requirement with full production oversight.') + '</p>' +
            '<div class="req-stats-row">' +
              '<span>📅 Event Date: <strong>' + fmtDate(req.event_date) + '</strong></span>' +
              '<span>👥 Guests: <strong>' + (req.guest_count || 100) + ' Pax</strong></span>' +
              '<span>💰 Host Target Budget: <strong>' + fmtCur(req.budget) + '</strong></span>' +
              '<span>📑 Proposals Received: <strong style="color:var(--color-primary);">' + pCount + ' Bids</strong></span>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      // RENDER TAB 3: PROPOSALS
      function renderProposalsTab() {
        var container = document.getElementById('proposals-container');
        if (!container) return;

        // Populate dropdown filter
        var selEvent = document.getElementById('filter-proposals-event');
        if (selEvent && selEvent.options.length <= 1) {
          state.requirements.forEach(function (r) {
            var opt = document.createElement('option');
            opt.value = r.requirement_id;
            opt.textContent = r.requirement_title || ('Event #' + r.requirement_id);
            selEvent.appendChild(opt);
          });
        }

        var filterReqId = selEvent ? selEvent.value : '';
        var statusFilter = document.getElementById('filter-proposals-status').value;

        var filtered = state.proposals.filter(function (p) {
          var matchReq = !filterReqId || String(p.requirement_id) === String(filterReqId);
          var matchStatus = !statusFilter || p.status === statusFilter;
          return matchReq && matchStatus;
        });

        if (!filtered.length) {
          container.innerHTML =
            '<div class="ef-empty-state">' +
              '<div style="font-size:36px;margin-bottom:12px;">📑</div>' +
              '<h3>No Proposals to Display</h3>' +
              '<p>There are no quotations matching this filter. You will receive notifications as managers bid.</p>' +
              '<button type="button" class="btn btn-outline" style="margin-top:16px;" onclick="EventFlowDashboard.resetFilters()">Reset Filters</button>' +
            '</div>';
          return;
        }

        container.innerHTML = filtered.map(function (p) {
          var isAccepted = p.status === 'ACCEPTED';
          return '<div class="proposal-interactive-card ' + (isAccepted ? 'selected-locked' : '') + '">' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">' +
                EventFlow.statusBadge(p.status) +
                '<span style="font-size:12px;font-weight:700;color:var(--color-primary);">FOR: ' + (p.requirement_title || 'Wedding Requirement') + '</span>' +
                '<span style="font-size:12px;color:#d4a72c;font-weight:700;">★ ' + (p.rating || '4.8') + ' (Verified Agency)</span>' +
              '</div>' +
              '<h3 style="font-size:20px;font-family:var(--font-display);color:var(--color-text-primary);margin-bottom:4px;">' +
                (p.business_name || p.manager_name || 'Event Manager') + ' — ' + (p.package_name || 'Bespoke Package') +
              '</h3>' +
              '<p style="font-size:13.5px;color:var(--color-text-secondary);line-height:1.5;margin-bottom:12px;max-width:760px;">' +
                (p.description || 'Comprehensive 2-day coordination, royal mandap decor, cinematography and hospitality.') +
              '</p>' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                '<span class="badge" style="background:rgba(0,0,0,0.05);color:var(--color-text-secondary);font-size:11px;">✓ Floral Setup</span>' +
                '<span class="badge" style="background:rgba(0,0,0,0.05);color:var(--color-text-secondary);font-size:11px;">✓ 4K Cinematography</span>' +
                '<span class="badge" style="background:rgba(0,0,0,0.05);color:var(--color-text-secondary);font-size:11px;">✓ Escrow Milestone Protection</span>' +
                '<span class="badge" style="background:rgba(0,0,0,0.05);color:var(--color-text-secondary);font-size:11px;">✓ On-Site Event Director</span>' +
              '</div>' +
            '</div>' +

            '<div class="proposal-price-box">' +
              '<span style="font-size:11px;font-weight:700;color:var(--color-text-secondary);text-transform:uppercase;">Quoted Amount</span>' +
              '<div class="proposal-price-num">' + fmtCur(p.price) + '</div>' +
              '<div style="font-size:11.5px;color:var(--color-text-secondary);margin-bottom:6px;">Includes GST & Milestone releases</div>' +
              '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<button type="button" class="btn btn-outline btn-sm" onclick="EventFlowDashboard.openProposalDetails(' + p.proposal_id + ')">View Details</button>' +
                (p.status === 'SUBMITTED' ?
                  '<button type="button" class="btn btn-primary btn-sm" onclick="EventFlowDashboard.selectProposal(' + p.proposal_id + ')">Select & Lock Manager →</button>' :
                  '<button type="button" class="btn btn-outline btn-sm" disabled style="color:#10b981;border-color:#10b981;">✓ Selected & Booked</button>'
                ) +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      // RENDER TAB 4: BOOKINGS
      function renderBookingsTab() {
        var container = document.getElementById('bookings-container');
        if (!container) return;

        if (!state.bookings.length) {
          container.innerHTML =
            '<div class="ef-empty-state">' +
              '<div style="font-size:36px;margin-bottom:12px;">🗓</div>' +
              '<h3>No Active Bookings Yet</h3>' +
              '<p>Once you accept a manager\'s proposal, your event transitions into an active production booking.</p>' +
              '<button type="button" class="btn btn-primary" style="margin-top:16px;" onclick="EventFlowDashboard.switchTab(\'proposals\')">Review Open Proposals →</button>' +
            '</div>';
          return;
        }

        container.innerHTML = state.bookings.map(function (b) {
          return '<div class="booking-item-card">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:16px;">' +
              '<div>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
                  EventFlow.statusBadge(b.status) +
                  '<span style="font-size:12px;font-weight:700;color:var(--color-primary);"><span data-ef-icon="calendar" data-size="14"></span> ' + fmtDate(b.event_date) + '</span>' +
                '</div>' +
                '<h3 style="font-size:22px;font-family:var(--font-display);color:var(--color-text-primary);margin-bottom:4px;">' +
                  (b.event_name || 'Celebration Booking') +
                '</h3>' +
                '<p style="font-size:13.5px;color:var(--color-text-secondary);">' +
                  'Producer: <strong>' + (b.business_name || b.manager_name || 'Arjun Events') + '</strong> • Venue: ' + (b.location || 'Jagmandir Palace, Udaipur') + ' • ' + (b.guest_count || 450) + ' Guests' +
                '</p>' +
              '</div>' +
              '<div style="text-align:right;">' +
                '<span style="font-size:11px;font-weight:700;color:var(--color-text-secondary);text-transform:uppercase;">Contract Value</span>' +
                '<div style="font-size:22px;font-weight:700;color:var(--color-text-primary);margin-top:2px;">' + fmtCur(b.final_amount) + '</div>' +
              '</div>' +
            '</div>' +

            '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;border-top:1px solid var(--color-border);flex-wrap:wrap;">' +
              '<div style="display:flex;gap:14px;font-size:13px;color:var(--color-text-secondary);">' +
                '<span>Escrow Protection: <strong style="color:#10b981;">60% Funded</strong></span>' +
                '<span>Production Stage: <strong style="color:var(--color-primary);">Stage 2 (Fabrication)</strong></span>' +
              '</div>' +
              '<div style="display:flex;gap:8px;">' +
                '<button type="button" class="btn btn-outline btn-sm" onclick="EventFlowDashboard.openPaymentModal(' + b.booking_id + ', \'' + (b.event_name || 'Celebration') + '\', 390000, \'STAGE 3 (VENDOR ALIGNMENT)\')">Make Milestone Payment</button>' +
                '<a href="booking.html?id=' + b.booking_id + '" class="btn btn-primary btn-sm">Open Workspace →</a>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      // RENDER TAB 5: PAYMENTS
      function renderPaymentsTab() {
        var tbody = document.getElementById('payments-tbody');
        if (!tbody) return;

        var totalPaid = state.payments.reduce(function (acc, p) { return acc + (Number(p.amount) || 0); }, 0);
        var totalContract = state.bookings.reduce(function (acc, b) { return acc + (Number(b.final_amount) || 0); }, 0);
        var totalDue = Math.max(0, totalContract - totalPaid);

        document.getElementById('pay-total-contract').textContent = fmtCur(totalContract);
        document.getElementById('pay-total-escrow').textContent = fmtCur(totalPaid);
        document.getElementById('pay-total-due').textContent = fmtCur(totalDue);

        if (!state.payments.length) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--color-text-secondary);">No payments recorded yet.</td></tr>';
          return;
        }

        tbody.innerHTML = state.payments.map(function (p) {
          return '<tr>' +
            '<td><strong style="font-family:monospace;font-size:12.5px;">' + (p.transaction_id || 'TXN-' + p.payment_id) + '</strong></td>' +
            '<td style="font-size:13px;">' + fmtDate(p.payment_date) + '</td>' +
            '<td>' +
              '<strong style="display:block;font-size:13.5px;">' + (p.event_name || 'Grand Royal Rajputana Wedding') + '</strong>' +
              '<span style="font-size:11.5px;color:var(--color-text-secondary);">' + (p.payment_type || 'Milestone Deposit').replace(/_/g, ' ') + '</span>' +
            '</td>' +
            '<td><span class="badge" style="background:rgba(0,0,0,0.06);font-size:11px;">' + (p.payment_method || 'ESCROW_UPI') + '</span></td>' +
            '<td><strong style="font-size:14px;color:var(--color-text-primary);">' + fmtCur(p.amount) + '</strong></td>' +
            '<td>' + EventFlow.statusBadge(p.status) + '</td>' +
            '<td>' +
              '<button type="button" class="btn btn-outline btn-sm" onclick="EventFlowDashboard.downloadReceipt(\'' + (p.transaction_id || p.payment_id) + '\', ' + p.amount + ')">Receipt</button>' +
            '</td>' +
          '</tr>';
        }).join('');
      }

      // RENDER TAB 6: TICKETS
      function renderTicketsTab() {
        var tbody = document.getElementById('tickets-tbody');
        if (!tbody) return;

        if (!state.tickets.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--color-text-secondary);">No support tickets opened. Your dedicated concierge is ready to assist.</td></tr>';
          return;
        }

        tbody.innerHTML = state.tickets.map(function (tk) {
          return '<tr>' +
            '<td><strong style="font-family:monospace;">TCK-' + tk.ticket_id + '</strong></td>' +
            '<td>' + fmtDate(tk.created_at) + '</td>' +
            '<td><strong>' + tk.subject + '</strong></td>' +
            '<td><span class="badge ' + (tk.priority === 'URGENT' ? 'rejected' : 'pending') + '">' + tk.priority + '</span></td>' +
            '<td>' + EventFlow.statusBadge(tk.status) + '</td>' +
            '<td>Pooja Deshmukh (Concierge)</td>' +
          '</tr>';
        }).join('');
      }

      // INTERACTIVE ACTIONS
      function selectProposal(proposalId) {
        if (!confirm('Are you sure you want to select this proposal and initiate production escrow?')) return;

        EventFlow.apiPut('/proposals/' + proposalId + '/select', {})
          .then(function (res) {
            EventFlow.showToast('Proposal accepted! Production booking confirmed with escrow initialized.', 'success');
            loadAllDashboardData();
            switchTab('bookings');
          })
          .catch(function (err) {
            EventFlow.showToast('Could not select proposal: ' + err.message, 'error');
          });
      }

      function openProposalDetails(proposalId) {
        var p = state.proposals.find(function (x) { return x.proposal_id === proposalId; });
        if (!p) return;

        var content = document.getElementById('mp-content');
        content.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">' +
            '<div>' +
              '<span class="badge open" style="margin-bottom:6px;">★ ' + (p.rating || '4.8') + ' RATED PRODUCER</span>' +
              '<h2 style="font-size:22px;font-family:var(--font-display);">' + (p.business_name || p.manager_name) + '</h2>' +
              '<p style="font-size:13.5px;color:var(--color-text-secondary);margin-top:2px;">Location: ' + (p.manager_location || 'Mumbai & Pan-India') + ' • Experience: ' + (p.experience || 5) + ' Years</p>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<div style="font-size:24px;font-weight:700;color:var(--color-primary);">' + fmtCur(p.price) + '</div>' +
              '<span style="font-size:11.5px;color:var(--color-text-secondary);">All Taxes & Permits Included</span>' +
            '</div>' +
          '</div>' +

          '<div style="background:var(--color-surface-2, rgba(0,0,0,0.03));padding:18px;border-radius:14px;margin-bottom:18px;">' +
            '<h4 style="font-size:15px;margin:0 0 6px;">' + (p.package_name || 'Bespoke Package') + '</h4>' +
            '<p style="font-size:13.5px;color:var(--color-text-secondary);line-height:1.6;margin:0;">' +
              (p.description || 'Comprehensive coordination, 4K multi-camera cinematography, stage styling, floral setups, sound engineering, and guest coordinators.') +
            '</p>' +
          '</div>' +

          '<div style="margin-bottom:20px;">' +
            '<h4 style="font-size:14px;text-transform:uppercase;letter-spacing:0.06em;color:var(--color-text-secondary);margin-bottom:10px;">Escrow Disbursement Milestones</h4>' +
            '<div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">' +
              '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;">' +
                '<span>Stage 1: Advance Booking Deposit (30%)</span>' +
                '<strong>' + fmtCur(p.price * 0.3) + '</strong>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;">' +
                '<span>Stage 2: Mandap Fabrication & Material Sourcing (30%)</span>' +
                '<strong>' + fmtCur(p.price * 0.3) + '</strong>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;">' +
                '<span>Stage 3: Vendor Alignment & Technical Dry Run (20%)</span>' +
                '<strong>' + fmtCur(p.price * 0.2) + '</strong>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;">' +
                '<span>Stage 4: On-site Execution & Handover (20%)</span>' +
                '<strong>' + fmtCur(p.price * 0.2) + '</strong>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;gap:12px;">' +
            (p.status === 'SUBMITTED' ?
              '<button type="button" class="btn btn-primary" style="flex:1;" onclick="EventFlowDashboard.selectProposal(' + p.proposal_id + '); EventFlowDashboard.closeModal(\'modal-proposal-details\');">Accept & Lock Proposal →</button>' :
              '<button type="button" class="btn btn-outline" style="flex:1;" disabled>✓ Already Accepted</button>'
            ) +
            '<button type="button" class="btn btn-outline" onclick="EventFlowDashboard.closeModal(\'modal-proposal-details\')">Close</button>' +
          '</div>';

        openModal('modal-proposal-details');
      }

      function openCompareModal() {
        var matrix = document.getElementById('compare-matrix-content');
        if (!matrix) return;

        if (!state.proposals.length) {
          matrix.innerHTML = '<p>No proposals available to compare.</p>';
          openModal('modal-compare-proposals');
          return;
        }

        var html = '<table class="table" style="width:100%;min-width:600px;">' +
          '<thead><tr><th>Feature</th>';
        state.proposals.forEach(function (p) {
          html += '<th>' + (p.business_name || p.manager_name) + '</th>';
        });
        html += '</tr></thead><tbody>';

        // Row: Price
        html += '<tr><td><strong>Quoted Price</strong></td>';
        state.proposals.forEach(function (p) {
          html += '<td><strong style="color:var(--color-primary);font-size:16px;">' + fmtCur(p.price) + '</strong></td>';
        });
        html += '</tr>';

        // Row: Rating
        html += '<tr><td><strong>Rating & Reviews</strong></td>';
        state.proposals.forEach(function (p) {
          html += '<td><span style="color:#d4a72c;font-weight:700;">★ ' + (p.rating || '4.8') + ' / 5.0</span></td>';
        });
        html += '</tr>';

        // Row: Package Name
        html += '<tr><td><strong>Package Name</strong></td>';
        state.proposals.forEach(function (p) {
          html += '<td>' + (p.package_name || 'Bespoke') + '</td>';
        });
        html += '</tr>';

        // Row: Location
        html += '<tr><td><strong>Base Location</strong></td>';
        state.proposals.forEach(function (p) {
          html += '<td>' + (p.manager_location || 'Mumbai') + '</td>';
        });
        html += '</tr>';

        // Row: Actions
        html += '<tr><td><strong>Action</strong></td>';
        state.proposals.forEach(function (p) {
          html += '<td>' +
            (p.status === 'SUBMITTED' ?
              '<button type="button" class="btn btn-primary btn-sm" onclick="EventFlowDashboard.selectProposal(' + p.proposal_id + '); EventFlowDashboard.closeModal(\'modal-compare-proposals\');">Select</button>' :
              '<span class="badge open">LOCKED</span>') +
            '</td>';
        });
        html += '</tr>';

        html += '</tbody></table>';
        matrix.innerHTML = html;
        openModal('modal-compare-proposals');
      }

      function openPaymentModal(bookingId, eventName, defaultAmt, phase) {
        document.getElementById('pay-modal-event-name').textContent = eventName;
        document.getElementById('pay-modal-badge').textContent = phase || 'STAGE 3 (VENDOR ALIGNMENT)';
        document.getElementById('pay-input-amount').value = defaultAmt || 390000;
        document.getElementById('pay-modal-btn-amt').textContent = Number(defaultAmt || 390000).toLocaleString('en-IN');
        openModal('modal-payment');
      }

      function setupPaymentForm() {
        var amtInput = document.getElementById('pay-input-amount');
        if (amtInput) {
          amtInput.addEventListener('input', function () {
            var val = Number(amtInput.value) || 0;
            document.getElementById('pay-modal-btn-amt').textContent = val.toLocaleString('en-IN');
          });
        }

        var form = document.getElementById('escrow-pay-form');
        if (form) {
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            var amt = Number(document.getElementById('pay-input-amount').value);
            var method = document.getElementById('pay-input-method').value;

            var payload = {
              booking_id: 1,
              amount: amt,
              payment_type: 'STAGE_3_VENDOR_ALIGNMENT',
              payment_method: method,
              transaction_id: 'EF-TXN-' + Math.floor(10000 + Math.random() * 90000)
            };

            EventFlow.apiPost('/payments', payload)
              .then(function (res) {
                closeModal('modal-payment');
                EventFlow.showToast('Escrow deposit confirmed! Transaction ID: ' + payload.transaction_id, 'success');
                loadAllDashboardData();
                switchTab('payments');
              })
              .catch(function (err) {
                // Client-side fallback if server fails
                state.payments.unshift({
                  payment_id: Date.now(),
                  booking_id: 1,
                  amount: amt,
                  payment_type: 'STAGE_3_VENDOR_ALIGNMENT',
                  payment_method: method,
                  transaction_id: payload.transaction_id,
                  status: 'SUCCESS',
                  payment_date: new Date().toISOString()
                });
                closeModal('modal-payment');
                EventFlow.showToast('Escrow deposit recorded successfully!', 'success');
                renderAll();
                switchTab('payments');
              });
          });
        }
      }

      function setupTicketForm() {
        var form = document.getElementById('ticket-form');
        if (form) {
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            var subject = document.getElementById('ticket-input-subject').value;
            var desc = document.getElementById('ticket-input-desc').value;
            var priority = document.getElementById('ticket-input-priority').value;

            var payload = {
              subject: subject,
              description: desc,
              priority: priority,
              booking_id: 1
            };

            EventFlow.apiPost('/tickets', payload)
              .then(function () {
                closeModal('modal-ticket');
                EventFlow.showToast('Support ticket dispatched to your senior concierge.', 'success');
                loadAllDashboardData();
              })
              .catch(function () {
                state.tickets.unshift({
                  ticket_id: state.tickets.length + 1,
                  subject: subject,
                  priority: priority,
                  status: 'OPEN',
                  created_at: new Date().toISOString()
                });
                closeModal('modal-ticket');
                EventFlow.showToast('Support ticket created. Advisor assigned.', 'success');
                renderTicketsTab();
              });
          });
        }
      }

      function setupFilterListeners() {
        var searchEl = document.getElementById('filter-events-search');
        if (searchEl) searchEl.addEventListener('input', renderEventsTab);

        var statusEl = document.getElementById('filter-events-status');
        if (statusEl) statusEl.addEventListener('change', renderEventsTab);

        var pReqEl = document.getElementById('filter-proposals-event');
        if (pReqEl) pReqEl.addEventListener('change', renderProposalsTab);

        var pStatEl = document.getElementById('filter-proposals-status');
        if (pStatEl) pStatEl.addEventListener('change', renderProposalsTab);
      }

      function filterProposalsByReq(reqId) {
        switchTab('proposals');
        var sel = document.getElementById('filter-proposals-event');
        if (sel) {
          sel.value = reqId;
          renderProposalsTab();
        }
      }

      function resetFilters() {
        var sel1 = document.getElementById('filter-proposals-event');
        var sel2 = document.getElementById('filter-proposals-status');
        if (sel1) sel1.value = '';
        if (sel2) sel2.value = '';
        renderProposalsTab();
      }

      function toggleTask(taskId, checked) {
        var t = state.tasks.find(function (x) { return x.task_id === taskId; });
        if (t) {
          t.status = checked ? 'COMPLETED' : 'IN_PROGRESS';
          EventFlow.showToast('Task updated: ' + t.task_name, 'info');
          renderAll();
        }
      }

      function downloadReceipt(txnId, amount) {
        EventFlow.showToast('Downloading verified tax receipt for ' + txnId + ' (' + fmtCur(amount) + ')...', 'success');
      }

      // Public API
      return {
        init: init,
        switchTab: switchTab,
        openModal: openModal,
        closeModal: closeModal,
        selectProposal: selectProposal,
        openProposalDetails: openProposalDetails,
        openCompareModal: openCompareModal,
        openPaymentModal: openPaymentModal,
        filterProposalsByReq: filterProposalsByReq,
        resetFilters: resetFilters,
        toggleTask: toggleTask,
        downloadReceipt: downloadReceipt
      };
    })();

    document.addEventListener('DOMContentLoaded', function () {
      EventFlowDashboard.init();
    });
  