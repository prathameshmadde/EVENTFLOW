const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(/return new Date\(a\.event_date\) - new Date\(b\.event_date\);/g, "return new Date(b.created_at || b.event_date) - new Date(a.created_at || a.event_date);");

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed flagship sorting to latest created_at again');

