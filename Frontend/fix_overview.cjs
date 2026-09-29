const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

// Update flagship event title
html = html.replace(
  `document.getElementById('flagship-event-title').textContent = upcoming.event_name || 'Grand Celebration';`,
  `document.getElementById('flagship-event-title').textContent = upcoming.requirement_title || upcoming.event_name || 'Grand Celebration';`
);

// Update flagship pay button logic
const targetPayBtnLogic = `            var payBtn = document.getElementById('btn-flagship-pay');
              if (payBtn) {
                  payBtn.onclick = function() {
                      if (!s1Paid) {
                           EventFlowDashboard.openPaymentModal(upcoming.booking_id, upcoming.event_name || 'Event', stage1Amt, 'STAGE 1 (ADVANCE)');
                      } else if (!s2Paid) {
                           EventFlowDashboard.openPaymentModal(upcoming.booking_id, upcoming.event_name || 'Event', stage2Amt, 'STAGE 2 (FINAL)');
                      } else {
                           EventFlow.showToast('All milestones paid.', 'info');
                      }
                  };
              }`;

const newPayBtnLogic = `            var payBtn = document.getElementById('btn-flagship-pay');
              if (payBtn) {
                  payBtn.onclick = function() {
                      window.location.href = 'booking.html?id=' + upcoming.booking_id;
                  };
              }`;

html = html.replace(targetPayBtnLogic, newPayBtnLogic);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed customer-dashboard overview');

