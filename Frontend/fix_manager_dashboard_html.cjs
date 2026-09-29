const fs = require('fs');
let html = fs.readFileSync('manager-dashboard.html', 'utf8');

// Fix reqList
html = html.replace(
  "req.title || req.event_name || req.category",
  "req.requirement_title || req.title || req.event_name"
);

// Fix bookList
// We want to use bk.event_name (which now has requirement_title) instead of bk.event_type (which is undefined)
html = html.replace(
  "(bk.event_type || bk.event_name || bk.eventName || 'Event')",
  "(bk.event_name || bk.requirement_title || bk.eventName || 'Event')"
);

// Fix venue -> location
html = html.replace(
  "(bk.venue || 'Venue TBD')",
  "(bk.location || bk.venue || 'Venue TBD')"
);

fs.writeFileSync('manager-dashboard.html', html);
console.log('Fixed manager-dashboard.html fields');

