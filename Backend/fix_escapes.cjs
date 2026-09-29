const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(/\\\`/g, '`');
appjs = appjs.replace(/\\\$/g, '$');

fs.writeFileSync('app.js', appjs);
console.log('Fixed escaped chars in app.js');

