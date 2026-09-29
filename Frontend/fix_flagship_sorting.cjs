const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(
  "return new Date(a.event_date) - new Date(b.event_date);",
  "return new Date(b.created_at || b.event_date) - new Date(a.created_at || a.event_date);"
);

// Also fix the comment
html = html.replace(
  "// Sort by event date closest",
  "// Sort by latest created booking"
);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed flagship sorting to latest created_at');

