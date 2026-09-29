const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await c.query("SELECT * FROM bookings WHERE proposal_id IS NOT NULL");
    
    console.log('Result:', rows);
    process.exit();
}
run();

