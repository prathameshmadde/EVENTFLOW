const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /SELECT \*\s+FROM bookings\s+WHERE\s+customer_id = \?\s+ORDER BY\s+created_at DESC/g;
const replacement = `SELECT b.*, m.business_name as manager_name, COALESCE(p.price, b.final_amount) AS final_amount, COALESCE(er.requirement_title, b.event_name) AS event_name FROM bookings b LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id LEFT JOIN event_manager_profiles m ON b.manager_id = m.manager_id WHERE b.customer_id = ? ORDER BY b.created_at DESC`;

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, replacement);
    console.log('Replaced query in app.js!');
} else {
    console.log('Query not found!');
}

fs.writeFileSync('app.js', appjs);

