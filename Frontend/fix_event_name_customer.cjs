const fs = require('fs');

let html = fs.readFileSync('customer-dashboard.html', 'utf8');

// Fix event names in bookings tab
html = html.replace(/\(b\.event_name \|\| 'Celebration'\)/g, "(b.requirement_title || b.event_name || 'Celebration')");
html = html.replace(/\(b\.event_name \|\| 'Celebration Booking'\)/g, "(b.requirement_title || b.event_name || 'Celebration Booking')");

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed event_name fallback to include requirement_title in customer-dashboard.html');

