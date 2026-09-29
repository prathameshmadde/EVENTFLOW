
    document.addEventListener('DOMContentLoaded', function () {
      var container = document.getElementById('req-list');

      function loadRequirements() {
        EventFlow.apiGet('/requirements').then(function (res) {
          // The API returns a bare array; older builds returned { requirements: [...] }.
          var list = Array.isArray(res) ? res : (res.requirements || []);
          if (!list.length) {
            container.innerHTML =
              '<div class="ef-empty-state">' +
                '<h3>No Requirements Posted Yet</h3>' +
                '<p style="margin:10px auto 20px;">Post your first event brief to start receiving competitive proposals.</p>' +
                '<a href="create-requirement.html" class="btn btn-primary">Post Requirement Now →</a>' +
              '</div>';
            return;
          }

          container.innerHTML = list.map(function (req) {
            // The API uses snake_case column names; keep the camelCase reads as
            // fallbacks so either response shape renders.
            var reqId = req.id || req.requirement_id;
            var reqTitle = req.title || req.requirement_title || 'Event Requirement';
            var reqCategory = req.category || req.event_name || 'Event';
            var reqCity = req.city || req.location || 'India';
            var reqDate = req.date || req.event_date;
            var reqGuests = req.guestCount || req.guest_count || 0;
            var reqDescription = req.description || 'Bespoke event production requirement.';
            var propCount = req.proposalCount || req.proposal_count ||
              (req.proposals ? req.proposals.length : 0);
            return '<div class="panel" style="margin-bottom:14px;padding:24px;border:1px solid var(--line);">' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">' +
                '<div>' +
                  '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
                    EventFlow.statusBadge(req.status || 'OPEN') +
                    '<span style="font-size:12px;font-weight:700;color:var(--magenta);">' + reqCategory + '</span>' +
                    '<span style="font-size:12px;color:var(--faint);">• ' + reqCity + '</span>' +
                  '</div>' +
                  '<h3 style="font-size:20px;">' + reqTitle + '</h3>' +
                  '<p style="font-size:13.5px;color:var(--muted);margin:6px 0 12px;max-width:700px;">' + reqDescription + '</p>' +
                  '<div style="display:flex;gap:20px;font-size:12.5px;color:var(--ink-soft);">' +
                    '<span>📅 <strong>' + EventFlow.formatDate(reqDate) + '</strong></span>' +
                    '<span>👥 <strong>' + reqGuests + ' Guests</strong></span>' +
                    '<span>💰 Target: <strong>' + EventFlow.formatCurrency(req.budget) + '</strong></span>' +
                  '</div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">' +
                  '<span style="padding:6px 14px;border-radius:99px;background:var(--magenta-bg);color:var(--magenta);font-size:12px;font-weight:800;">' + propCount + ' Proposals Received</span>' +
                  '<div style="display:flex;gap:8px;">' +
                    '<a href="requirement-details.html?id=' + reqId + '" class="btn btn-outline btn-sm">Brief Details</a>' +
                    '<a href="proposals.html?reqId=' + reqId + '" class="btn btn-primary btn-sm">Compare Bids →</a>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('');
        }).catch(function (err) {
          container.innerHTML = '<div class="ef-empty-state"><h3>Unable to load requirements</h3><p>' + err.message + '</p></div>';
        });
      }

      loadRequirements();

      var logoutBtn = document.getElementById('side-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          EventFlow.clearUser();
          window.location.href = 'login.html';
        });
      }
    });
  