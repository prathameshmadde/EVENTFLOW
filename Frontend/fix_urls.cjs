const fs = require('fs');

let html = fs.readFileSync('booking.html', 'utf8');

html = html.replace(/window\.open\(\\'\/api\/bookings\//g, "window.open(\\'http://localhost:5000/api/bookings/");
html = html.replace(/window\.open\(\\'\/api\/payments\//g, "window.open(\\'http://localhost:5000/api/payments/");

fs.writeFileSync('booking.html', html);
console.log('Fixed PDF URLs in booking.html to point to http://localhost:5000');

