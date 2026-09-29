const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /b\.\*,\s*e\.event_name AS event_type,\s*emp\.business_name,\s*u\.name AS manager_name,\s*p\.package_name,\s*p\.price AS proposal_price,/m;

const replacement = `
          b.*,
          COALESCE(p.price, b.final_amount) AS final_amount,
          COALESCE(er.requirement_title, b.event_name) AS event_name,

          e.event_name AS event_type,

          emp.business_name,

          u.name AS manager_name,

          p.package_name,

          p.price AS proposal_price,
`;

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, replacement);
    console.log('Patched bookings query');
} else {
    console.log('Query not found in app.js');
}

const joinRegex = /LEFT JOIN proposals p\s*ON b\.proposal_id = p\.proposal_id/m;
const joinReplacement = `LEFT JOIN proposals p
          ON b.proposal_id = p.proposal_id
          
        LEFT JOIN event_requirements er
          ON p.requirement_id = er.requirement_id`;

if (appjs.match(joinRegex)) {
    appjs = appjs.replace(joinRegex, joinReplacement);
    console.log('Patched bookings join');
} else {
    console.log('Join not found');
}

fs.writeFileSync('app.js', appjs);

