const fs = require('fs');
let html = fs.readFileSync('my-bookings.html', 'utf8');

const regex = /'<div class="booking-cover"><\/div>' \+/;
const replace = `
            '<div class="booking-cover" style="background-image: url(\\'' + getEventImage(b.event_type) + '\\')"></div>' +
`;

const jsFunction = `
      function getEventImage(type) {
          if (!type) return 'assets/ganpati-4k-web.jpg';
          type = type.toLowerCase();
          if (type.includes('wedding')) return 'assets/category-wedding.jpg';
          if (type.includes('birthday')) return 'assets/category-birthday.jpg';
          if (type.includes('engagement')) return 'assets/category-engagement.jpg';
          if (type.includes('corporate')) return 'assets/category-corporate.jpg';
          if (type.includes('anniversary')) return 'assets/category-anniversary.jpg';
          if (type.includes('baby')) return 'assets/category-babyshower.jpg';
          if (type.includes('reception')) return 'assets/category-reception.jpg';
          if (type.includes('college') || type.includes('fest')) return 'assets/category-concert.jpg';
          return 'assets/ganpati-4k-web.jpg';
      }
      function loadBookings() {
`;

html = html.replace(regex, replace);
html = html.replace("function loadBookings() {", jsFunction);

fs.writeFileSync('my-bookings.html', html);
console.log('Fixed my-bookings cover images');

