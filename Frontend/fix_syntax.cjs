const fs = require('fs');
let html = fs.readFileSync('booking.html', 'utf8');

html = html.replace(/      \}\);\r?\n\r?\n      \r?\n        \}\);\r?\n      \}/g, '      });\n');

fs.writeFileSync('booking.html', html);
console.log('Fixed syntax error');

