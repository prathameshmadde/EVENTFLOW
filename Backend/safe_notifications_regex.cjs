const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const reqRegex = /return res\s*\.status\(201\)\s*\.json\(\{\s*message:\s*'Requirement created successfully',/;
const propRegex = /return res\s*\.status\(201\)\s*\.json\(\{\s*message:\s*'Proposal submitted successfully',/;

const reqInject = `
      try {
        const managers = await all("SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'");
        for (const m of managers) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [m.user_id, 'New Event Requirement', 'A new client requirement "' + requirementTitle + '" has been posted. Click to review and submit a proposal.', 'manager-requirements.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res
        .status(201)
        .json({

          message:
            'Requirement created successfully',`;

const propInject = `
      try {
        const reqRow = await one("SELECT customer_id, requirement_title FROM event_requirements WHERE requirement_id = ?", [requirementId]);
        if (reqRow && reqRow.customer_id) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [reqRow.customer_id, 'New Proposal Received', 'A manager has submitted a new proposal for your requirement "' + (reqRow.requirement_title || 'Event') + '".', 'proposals.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res
        .status(201)
        .json({

          message:
            'Proposal submitted successfully',`;

if (reqRegex.test(appjs)) {
    appjs = appjs.replace(reqRegex, reqInject);
    console.log("Injected req notification");
}
if (propRegex.test(appjs)) {
    appjs = appjs.replace(propRegex, propInject);
    console.log("Injected prop notification");
}

fs.writeFileSync('app.js', appjs);

