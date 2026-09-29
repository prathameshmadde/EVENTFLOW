const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(
  "window.location.href = 'booking.html?id=' + upcoming.booking_id;",
  "window.location.href = 'my-bookings.html';"
);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed btn-flagship-pay redirection in dynamic block');

