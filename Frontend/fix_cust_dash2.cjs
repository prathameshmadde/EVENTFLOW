const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

// 1. Fix requirement titles not showing in overview briefs list
html = html.replace(
  /'<strong style="font-size:15px;color:var\\(--color-text-primary\\);">'\ \+\ \\(r\.title\ \|\|\ r\.event_name\ \|\|\ 'Event'\\)\ \+\ '<\/strong>'\ \+/g,
  `'<strong style="font-size:15px;color:var(--color-text-primary);">' + (r.requirement_title || r.title || r.event_name || 'Event') + '</strong>' +`
);

// 2. Fix requirement titles not showing in events list
html = html.replace(
  /'<strong style="font-size:16px;color:var\\(--color-text-primary\\);">'\ \+\ \\(r\.title\ \|\|\ r\.event_name\ \|\|\ 'Event'\\)\ \+\ '<\/strong>'\ \+/g,
  `'<strong style="font-size:16px;color:var(--color-text-primary);">' + (r.requirement_title || r.title || r.event_name || 'Event') + '</strong>' +`
);

// 3. Fix stage 1 redirect
html = html.replace(
  /document\.getElementById\('flagship-stage-1'\)\.onclick\ =\ function\(\)\ \{\s*if\(!s1Paid\)\ EventFlowDashboard\.openPaymentModal\(upcoming\.booking_id,\ upcoming\.event_name,\ stage1Amt,\ 'STAGE 1 \(ADVANCE\)'\);\s*\};/g,
  `document.getElementById('flagship-stage-1').onclick = function() {
                  if(!s1Paid) EventFlowDashboard.openPaymentModal(upcoming.booking_id, upcoming.event_name || 'Event', stage1Amt, 'STAGE 1 (ADVANCE)');
                  else window.location.href = 'booking.html?id=' + upcoming.booking_id;
              };`
);

// 4. Fix stage 2 redirect
html = html.replace(
  /document\.getElementById\('flagship-stage-2'\)\.onclick\ =\ function\(\)\ \{\s*if\(s1Paid\ \&\&\ !s2Paid\)\ EventFlowDashboard\.openPaymentModal\(upcoming\.booking_id,\ upcoming\.event_name,\ stage2Amt,\ 'STAGE 2 \(FINAL\)'\);\s*\};/g,
  `document.getElementById('flagship-stage-2').onclick = function() {
                  if(s1Paid && !s2Paid) EventFlowDashboard.openPaymentModal(upcoming.booking_id, upcoming.event_name || 'Event', stage2Amt, 'STAGE 2 (FINAL)');
                  else if(s2Paid) window.location.href = 'booking.html?id=' + upcoming.booking_id;
              };`
);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Customer dashboard fixed');
