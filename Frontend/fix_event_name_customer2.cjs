const fs = require('fs');

let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(/\(upcoming\.event_name \|\| 'Event'\)/g, "(upcoming.requirement_title || upcoming.event_name || 'Event')");

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed upcoming event names');

