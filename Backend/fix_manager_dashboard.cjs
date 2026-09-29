const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /const bookingsList = await query\(`SELECT b\.\*, u\.name as customer_name FROM bookings b LEFT JOIN users u ON b\.customer_id = u\.user_id WHERE b\.manager_id = \? ORDER BY b\.created_at DESC LIMIT 4`, \[manager\.manager_id\]\);/;

const replacement = "const bookingsList = await query(`SELECT b.*, u.name as customer_name, COALESCE(p.price, b.final_amount) AS final_amount, COALESCE(er.requirement_title, b.event_name) AS event_name FROM bookings b LEFT JOIN users u ON b.customer_id = u.user_id LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id WHERE b.manager_id = ? ORDER BY b.created_at DESC LIMIT 4`, [manager.manager_id]);";

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, replacement);
    console.log('Fixed manager dashboard query');
}

fs.writeFileSync('app.js', appjs);

