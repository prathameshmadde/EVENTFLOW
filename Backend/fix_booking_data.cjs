const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// Patch GET /api/bookings
// It currently has `b.*, e.event_name AS event_type, emp.business_name, u.name AS manager_name, p.package_name, p.price AS proposal_price,`
const bookingsQueryOld = `
        SELECT

          b.*,

          e.event_name AS event_type,

          emp.business_name,

          u.name AS manager_name,

          p.package_name,

          p.price AS proposal_price,`;

const bookingsQueryNew = `
        SELECT

          b.*,
          COALESCE(p.price, b.final_amount) AS final_amount,
          COALESCE(er.requirement_title, b.event_name) AS event_name,

          e.event_name AS event_type,

          emp.business_name,

          u.name AS manager_name,

          p.package_name,

          p.price AS proposal_price,`;

// We also need to LEFT JOIN event_requirements in GET /api/bookings
const bookingsJoinOld = `
        FROM bookings b

        LEFT JOIN events e
          ON b.event_id = e.event_id

        LEFT JOIN event_manager_profiles emp
          ON b.manager_id = emp.manager_id

        LEFT JOIN users u
          ON emp.user_id = u.user_id

        LEFT JOIN proposals p
          ON b.proposal_id = p.proposal_id`;

const bookingsJoinNew = `
        FROM bookings b

        LEFT JOIN events e
          ON b.event_id = e.event_id

        LEFT JOIN event_manager_profiles emp
          ON b.manager_id = emp.manager_id

        LEFT JOIN users u
          ON emp.user_id = u.user_id

        LEFT JOIN proposals p
          ON b.proposal_id = p.proposal_id
          
        LEFT JOIN event_requirements er
          ON p.requirement_id = er.requirement_id`;

if (appjs.includes(bookingsQueryOld)) {
    appjs = appjs.replace(bookingsQueryOld, bookingsQueryNew);
}
if (appjs.includes(bookingsJoinOld)) {
    appjs = appjs.replace(bookingsJoinOld, bookingsJoinNew);
}

// Patch PDF generation code to use p.price and er.requirement_title
// In RECEIPT:
appjs = appjs.replace(/const finalAmt = Number\(b\.final_amount\) \|\| 0;/g, "const finalAmt = Number(p.price || b.final_amount) || 0;");
appjs = appjs.replace(/const finalAmt = Number\(b\.final_amount\);/g, "const finalAmt = Number(p.price || b.final_amount);");

fs.writeFileSync('app.js', appjs);
console.log('Patched bookings and PDFs to use latest proposal data');

