const fs = require('fs');
let html = fs.readFileSync('booking.html', 'utf8');

html = html.replace(
  "var title = b.requirement_title || b.event_type || b.eventName || b.event_name || 'Event Booking';",
  "var title = b.event_name || b.requirement_title || b.eventName || b.event_type || 'Event Booking';"
);

fs.writeFileSync('booking.html', html);
console.log('Fixed title priority in booking.html');

