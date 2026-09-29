const fs = require('fs');
let html = fs.readFileSync('feedback.html', 'utf8');

// Replace manager sidebar with customer sidebar
const managerSidebar = /<aside class="sidebar ef-manager-sidebar" id="manager-sidebar">([\s\S]*?)<\/aside>/;
const customerSidebar = `<aside class="sidebar ef-customer-sidebar" id="customer-sidebar">
      <a href="index.html" class="side-brand" id="brand-link">
        <div class="brand-mark">o</div>
        <div>
          <strong>Event<span>Flow</span></strong>
          <span class="side-brand-tag">Client Portal</span>
        </div>
      </a>

      <div class="sidebar-nav-group">
        <a href="customer-dashboard.html" class="side-link" id="side-nav-dashboard">
          <span class="side-icon-box" data-ef-icon="layoutDashboard" data-size="18"></span>
          <span class="side-label">Overview</span>
        </a>
        <a href="requirements.html" class="side-link" id="side-nav-requirements">
          <span class="side-icon-box" data-ef-icon="clipboardList" data-size="18"></span>
          <span class="side-label">My Requirements</span>
        </a>
        <a href="proposals.html" class="side-link" id="side-nav-proposals">
          <span class="side-icon-box" data-ef-icon="arrowLeftRight" data-size="18"></span>
          <span class="side-label">Compare Proposals</span>
        </a>
        <a href="my-bookings.html" class="side-link" id="side-nav-bookings">
          <span class="side-icon-box" data-ef-icon="calendarCheck" data-size="18"></span>
          <span class="side-label">My Bookings</span>
        </a>
        
        <span class="side-section" style="margin-top:20px;">Feedback & Support</span>
        <a href="feedback.html" class="side-link active" id="side-nav-feedback">
          <span class="side-icon-box" data-ef-icon="star" data-size="18"></span>
          <span class="side-label">Give Feedback</span>
        </a>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-divider"></div>
        <div class="sidebar-user-card" id="side-user-card">
          <div class="sidebar-user-avatar" id="side-user-avatar">PS</div>
          <div class="sidebar-user-info">
            <strong class="sidebar-user-name" id="side-user-name">Prathamesh</strong>
            <span class="sidebar-user-role" id="side-user-role">Host & Client</span>
          </div>
        </div>
        <a href="login.html" class="side-link side-link-logout" id="side-nav-logout" onclick="EventFlow.handleLogout(event)">
          <span class="side-icon-box" data-ef-icon="logout" data-size="18"></span>
          <span class="side-label">Logout</span>
        </a>
      </div>
    </aside>`;

html = html.replace(managerSidebar, customerSidebar);

// Make text generic/dynamic
html = html.replace('Rate Your Experience with Arjun Mehta & Co.', 'Rate Your Event Experience');
html = html.replace('I recommend Arjun Mehta & Co. to future hosts on EventFlow', 'I recommend this Event Producer to future hosts on EventFlow');

// Add some script to update sidebar user info
const updateScript = `
        var state = EventFlow.getGlobalState();
        if (state.user) {
          var nameEl = document.getElementById('side-user-name');
          if (nameEl) nameEl.textContent = state.user.name;
          var avatarEl = document.getElementById('side-user-avatar');
          if (avatarEl) {
             var initials = state.user.name.split(' ').map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
             avatarEl.textContent = initials;
          }
        }`;

html = html.replace("var txt = document.getElementById('fb-text').value;", updateScript + "\n        var txt = document.getElementById('fb-text').value;");

fs.writeFileSync('feedback.html', html);
console.log('Fixed feedback.html');

