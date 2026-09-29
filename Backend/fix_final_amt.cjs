const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(
  /const finalAmt = Number\(p\.proposal_price \|\| p\.final_amount \|\| b\.proposal_price \|\| b\.final_amount\) \|\| 0;/g, 
  "const finalAmt = Number((typeof p !== 'undefined' ? p.proposal_price || p.final_amount : 0) || (typeof b !== 'undefined' ? b.proposal_price || b.final_amount : 0)) || 0;"
);

appjs = appjs.replace(
  /const finalAmt = Number\(p\.proposal_price \|\| p\.final_amount \|\| b\.proposal_price \|\| b\.final_amount\);/g, 
  "const finalAmt = Number((typeof p !== 'undefined' ? p.proposal_price || p.final_amount : 0) || (typeof b !== 'undefined' ? b.proposal_price || b.final_amount : 0)) || 0;"
);

fs.writeFileSync('app.js', appjs);
console.log('Fixed finalAmt reference error');

