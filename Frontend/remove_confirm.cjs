const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

const regex = /if \(!confirm\('Are you sure you want to delete this event requirement\? This cannot be undone\.'\)\) return;/g;
html = html.replace(regex, '');

fs.writeFileSync('customer-dashboard.html', html);
console.log('Removed confirm dialog');

