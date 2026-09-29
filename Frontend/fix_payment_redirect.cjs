const fs = require('fs');
let html = fs.readFileSync('booking.html', 'utf8');

html = html.replace(
  "setTimeout(() => window.location.reload(), 1500);",
  "setTimeout(() => window.location.href = 'my-bookings.html', 1500);"
);
// replace globally in case there are multiple
html = html.replace(
  /setTimeout\(\(\) => window\.location\.reload\(\), 1500\);/g,
  "setTimeout(() => window.location.href = 'my-bookings.html', 1500);"
);

fs.writeFileSync('booking.html', html);
console.log('Fixed booking.html payment redirect');

