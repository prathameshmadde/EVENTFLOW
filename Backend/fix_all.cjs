const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// Replace await all( with await query(
appjs = appjs.replace(/await all\(/g, "await query(");

fs.writeFileSync('app.js', appjs);
console.log('Replaced all() with query()');

