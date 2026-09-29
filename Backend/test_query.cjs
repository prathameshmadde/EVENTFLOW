const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await c.query("SELECT b.*, COALESCE(p.price, b.final_amount) AS final_amount, COALESCE(er.requirement_title, b.event_name) AS event_name, e.event_name AS event_type, p.price AS proposal_price FROM bookings b JOIN events e ON b.event_id = e.event_id LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id LIMIT 1");
    
    console.log('Result:', rows[0]);
    process.exit();
}
run();

