const fs = require('fs');

let c = fs.readFileSync('app.js', 'utf8');

c = c.replace(
  "  const token =\r\n    header.startsWith('Bearer ')\r\n      ? header.slice(7)\r\n      : '';",
  "  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || '');"
);

// If it has \n instead of \r\n
c = c.replace(
  "  const token =\n    header.startsWith('Bearer ')\n      ? header.slice(7)\n      : '';",
  "  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || '');"
);

fs.writeFileSync('app.js', c);
console.log('Fixed requireAuth to accept query token');

