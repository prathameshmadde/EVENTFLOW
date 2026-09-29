const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /SELECT \*\s+FROM bookings\s+WHERE\s+customer_id = \?\s+ORDER BY\s+created_at DESC/g;

code = code.replace(regex, "SELECT b.*, m.business_name, m.business_name as manager_name, u.phone as manager_phone FROM bookings b LEFT JOIN event_manager_profiles m ON b.manager_id = m.manager_id LEFT JOIN users u ON m.user_id = u.user_id WHERE b.customer_id = ? ORDER BY b.created_at DESC");

fs.writeFileSync('app.js', code);
console.log('Regex update applied');

