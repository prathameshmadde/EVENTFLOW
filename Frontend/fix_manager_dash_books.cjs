const fs = require('fs');

let html = fs.readFileSync('manager-dashboard.html', 'utf8');

const regexBooks = /var books = d\.recentBookings \|\| d\.bookings \|\| d\.activeBookingsList \|\| \[\];/;
html = html.replace(regexBooks, 'var books = d.bookingsList || d.recentBookings || d.bookings || d.activeBookingsList || [];');

fs.writeFileSync('manager-dashboard.html', html);
console.log('Fixed manager-dashboard.html books list check');

