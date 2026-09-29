const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

// Replace in apiPost success block
html = html.replace(
  "switchTab('payments');",
  "window.location.href = 'my-bookings.html';"
);
html = html.replace(
  "switchTab('payments');",
  "window.location.href = 'my-bookings.html';"
);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed setupPaymentForm redirects in customer-dashboard.html');

