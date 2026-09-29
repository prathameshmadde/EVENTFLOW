const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(
    /const b = await one\('SELECT(.*?)LEFT JOIN proposals p\n          ON b.proposal_id = p.proposal_id\n          \n        LEFT JOIN event_requirements er\n          ON p.requirement_id = er.requirement_id(.*?)', \[bookingId\]\);/g,
    "const b = await one(`SELECT$1LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id$2`, [bookingId]);"
);

appjs = appjs.replace(
    /const p = await one\('SELECT(.*?)LEFT JOIN proposals pr\n          ON b.proposal_id = p.proposal_id\n          \n        LEFT JOIN event_requirements er\n          ON p.requirement_id = er.requirement_id(.*?)', \[paymentId, paymentId\]\);/g,
    "const p = await one(`SELECT$1LEFT JOIN proposals pr ON b.proposal_id = pr.proposal_id LEFT JOIN event_requirements er ON pr.requirement_id = er.requirement_id$2`, [paymentId, paymentId]);"
);

// Specifically fix the ones broken by regex:
// The regex replaced `LEFT JOIN proposals p ON b.proposal_id = p.proposal_id`
// so we can just look for `LEFT JOIN proposals p\n          ON b.proposal_id = p.proposal_id\n          \n        LEFT JOIN event_requirements er\n          ON p.requirement_id = er.requirement_id`
// if it's inside a single quoted string, change the single quotes to backticks!

const fixBlock = function(match, p1) {
    // If it's a broken single quote, let's just rewrite the whole line
    return match;
}

// Actually, let's just do a manual string replace of the exact broken lines!
const brokenStatement = `const b = await one('SELECT b.*, u.name as customer_name, m.business_name, er.requirement_title FROM bookings b JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id LEFT JOIN proposals p
          ON b.proposal_id = p.proposal_id
          
        LEFT JOIN event_requirements er
          ON p.requirement_id = er.requirement_id WHERE b.booking_id = ?', [bookingId]);`;

const fixedStatement = "const b = await one(`SELECT b.*, u.name as customer_name, m.business_name, er.requirement_title FROM bookings b JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id WHERE b.booking_id = ?`, [bookingId]);";

const brokenReceipt = `const p = await one('SELECT p.*, b.event_name, b.event_date, b.location, er.requirement_title, u.name as customer_name, m.business_name FROM payments p JOIN bookings b ON p.booking_id = b.booking_id LEFT JOIN proposals pr ON b.proposal_id = pr.proposal_id LEFT JOIN event_requirements er ON pr.requirement_id = er.requirement_id JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id WHERE p.payment_id = ? OR p.transaction_id = ?', [paymentId, paymentId]);`;
// Wait, brokenReceipt wasn't broken by `LEFT JOIN proposals p` because it had `LEFT JOIN proposals pr`!
// Let's verify brokenStatement.
if (appjs.includes(brokenStatement)) {
    appjs = appjs.replace(brokenStatement, fixedStatement);
    console.log('Fixed brokenStatement');
}

fs.writeFileSync('app.js', appjs);

