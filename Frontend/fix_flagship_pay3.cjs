const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(/window\.location\.href\s*=\s*'booking\.html\?id='\s*\+\s*upcoming\.booking_id;/g, "window.location.href = 'my-bookings.html';");

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed btn-flagship-pay upcoming.booking_id redirect');

