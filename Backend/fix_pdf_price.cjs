const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// The original replacement was: "const finalAmt = Number(p.price || b.final_amount) || 0;"
// Let's replace it with the correct aliases based on the query.

// In receipt route, the proposal is aliased as `pr`. So `pr.price` is fetched?
// Wait, the query is `SELECT p.*, b.event_name, ...` it doesn't explicitly SELECT `pr.price`!
// We need to SELECT `pr.price` in receipt route!
const receiptRegex = /SELECT p\.\*, b\.event_name, b\.event_date, b\.location, er\.requirement_title, u\.name as customer_name, m\.business_name FROM payments p/;
const receiptReplacement = 'SELECT p.*, pr.price as proposal_price, b.final_amount, b.event_name, b.event_date, b.location, er.requirement_title, u.name as customer_name, m.business_name FROM payments p';

if (appjs.match(receiptRegex)) {
    appjs = appjs.replace(receiptRegex, receiptReplacement);
    console.log('Fixed receipt SELECT');
}

// And in statement route, the proposal is aliased as `p` (Wait! In statement route: `const b = await one('SELECT b.*, ... LEFT JOIN proposals p ON b.proposal_id = p.proposal_id ...`);
// Yes, in statement route, proposal is `p` but wait! `b.*` is selected, but `p.price` is not explicitly selected!
// We should select `p.price as proposal_price` in statement route too!
const statementRegex = /SELECT b\.\*, u\.name as customer_name, m\.business_name, er\.requirement_title FROM bookings b/;
const statementReplacement = 'SELECT b.*, p.price as proposal_price, u.name as customer_name, m.business_name, er.requirement_title FROM bookings b';

if (appjs.match(statementRegex)) {
    appjs = appjs.replace(statementRegex, statementReplacement);
    console.log('Fixed statement SELECT');
}

// Now update the `finalAmt` variable assignment in BOTH routes.
// Receipt: The record fetched is `p` (payment record joined with others). So `p.proposal_price`.
// Statement: The record fetched is `b` (booking record joined with others). So `b.proposal_price`.

appjs = appjs.replace(/const finalAmt = Number\(p\.price \|\| b\.final_amount\) \|\| 0;/g, "const finalAmt = Number(p.proposal_price || p.final_amount || b.proposal_price || b.final_amount) || 0;");
appjs = appjs.replace(/const finalAmt = Number\(p\.price \|\| b\.final_amount\);/g, "const finalAmt = Number(p.proposal_price || p.final_amount || b.proposal_price || b.final_amount);");

fs.writeFileSync('app.js', appjs);

