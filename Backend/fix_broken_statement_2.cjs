const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /const b = await one\('SELECT b\.\*, u\.name as customer_name, m\.business_name, er\.requirement_title FROM bookings b JOIN users u ON b\.customer_id = u\.user_id JOIN event_manager_profiles m ON b\.manager_id = m\.manager_id LEFT JOIN proposals p[\s\S]*?WHERE b\.booking_id = \?', \[bookingId\]\);/g;

const replacement = "const b = await one(`SELECT b.*, u.name as customer_name, m.business_name, er.requirement_title FROM bookings b JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id WHERE b.booking_id = ?`, [bookingId]);";

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, replacement);
    console.log('Fixed broken query block');
} else {
    console.log('Could not find regex match');
}

fs.writeFileSync('app.js', appjs);

