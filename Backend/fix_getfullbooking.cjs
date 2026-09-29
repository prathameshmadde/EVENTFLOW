const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /b\.\*,\s*e\.event_name AS event_type,\s*emp\.business_name,\s*emp\.location AS manager_location,\s*emp\.rating AS manager_rating,\s*u\.name AS manager_name,\s*u\.email AS manager_email,\s*c\.name AS customer_name,\s*c\.email AS customer_email,\s*p\.package_name,\s*p\.description AS proposal_description,/m;

const replacement = `
          b.*,
          COALESCE(p.price, b.final_amount) AS final_amount,
          COALESCE(er.requirement_title, b.event_name) AS event_name,

          e.event_name AS event_type,

          emp.business_name,

          emp.location AS manager_location,

          emp.rating AS manager_rating,

          u.name AS manager_name,

          u.email AS manager_email,

          c.name AS customer_name,

          c.email AS customer_email,

          p.package_name,

          p.description AS proposal_description,
`;

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, replacement);
    console.log('Patched getFullBooking query');
} else {
    console.log('Query not found in getFullBooking');
}

const joinRegex = /LEFT JOIN proposals p\s*ON b\.proposal_id = p\.proposal_id/m;
const joinReplacement = `LEFT JOIN proposals p
          ON b.proposal_id = p.proposal_id
          
        LEFT JOIN event_requirements er
          ON p.requirement_id = er.requirement_id`;

if (appjs.match(joinRegex)) {
    appjs = appjs.replace(joinRegex, joinReplacement);
    console.log('Patched getFullBooking join');
} else {
    console.log('Join not found');
}

fs.writeFileSync('app.js', appjs);

