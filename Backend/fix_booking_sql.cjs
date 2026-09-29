const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

c = c.replace(/LEFT JOIN proposals p\s*ON\s*b\.proposal_id =\s*p\.proposal_id/, 
  "LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id");

fs.writeFileSync('app.js', c);
console.log('Fixed getFullBooking joins');

