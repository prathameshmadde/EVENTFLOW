const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

const regex = /var payBtn = document\.getElementById\('btn-flagship-pay'\);[\s\S]*?if\s*\(payBtn\)\s*\{[\s\S]*?payBtn\.onclick\s*=\s*function\(\)\s*\{[\s\S]*?\};\s*\}/;

const replacement = `var payBtn = document.getElementById('btn-flagship-pay');
              if (payBtn) {
                  payBtn.onclick = function() {
                      window.location.href = 'booking.html?id=' + upcoming.booking_id;
                  };
              }`;

html = html.replace(regex, replacement);
fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed btn-flagship-pay');

