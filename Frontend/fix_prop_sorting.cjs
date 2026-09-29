const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(
  "propListEl.innerHTML = state.proposals.slice(0, 3).map(function (p) {",
  "var sortedProps = state.proposals.slice().sort(function(a,b) { return new Date(b.created_at) - new Date(a.created_at); });\n              propListEl.innerHTML = sortedProps.slice(0, 3).map(function (p) {"
);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed proposal sorting too!');

