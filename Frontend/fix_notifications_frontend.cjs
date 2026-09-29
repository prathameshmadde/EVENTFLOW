const fs = require('fs');

let mainJs = fs.readFileSync('main.js', 'utf8');

// I will insert a new function `loadNotifications` in setupNavAndAccount
const loadNotificationsFunc = `
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
                        return '<div class="eventflow-note" style="' + style + ' cursor:pointer;" onclick="EventFlowDashboard.markNotifRead(' + n.id + ', \\'' + (n.link || '#') + '\\')">' +
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
`;

// First, clear the static dummy notifications in main.js
const staticMenuRegex = /'<div class="eventflow-alert-menu" id="ef-notif-menu">' \+[\s\S]*?'<\/div>' \+/;
const emptyMenu = `
          '<div class="eventflow-alert-menu" id="ef-notif-menu">' +
            '<div style="padding:15px;text-align:center;color:var(--muted);font-size:13px;">Loading notifications...</div>' +
          '</div>' +
`;
if (mainJs.match(staticMenuRegex)) {
    mainJs = mainJs.replace(staticMenuRegex, emptyMenu);
}

// Then insert loadNotificationsFunc just before the toggle dropdowns logic
const toggleLogic = "// Toggle dropdowns";
if (mainJs.includes(toggleLogic)) {
    mainJs = mainJs.replace(toggleLogic, loadNotificationsFunc + "\n\n      " + toggleLogic);
}

fs.writeFileSync('main.js', mainJs);
console.log('Fixed main.js notifications');

