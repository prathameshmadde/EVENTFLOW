const fs = require('fs');

let curJs = fs.readFileSync('app.js', 'utf8');
const copyJs = fs.readFileSync('../../1 - Copy/Backend/app.js', 'utf8');

const startCopy = copyJs.indexOf("message:\n            'Requirement created successfully'");
const endCopy = copyJs.indexOf("message:\n            'Proposal submitted successfully'");
const missingChunk = copyJs.substring(startCopy, endCopy);

const badStart = curJs.indexOf("      \n        try {\n          const managers =");
const badEnd = curJs.indexOf("message: 'Proposal submitted successfully'");

if (badStart !== -1 && badEnd !== -1) {
    const before = curJs.substring(0, badStart);
    const after = curJs.substring(badEnd);
    
    // missingTxt starts with "message:\n            'Requirement created successfully'"
    // We will inject our notification block RIGHT BEFORE "return res\n        .status(201)\n        .json({\n\n          message:\n            'Requirement created successfully',"
    
    // And RIGHT BEFORE "return res\n        .status(201)\n        .json({\n\n          message:\n            'Proposal submitted successfully',"
    
    let restoredJs = before + missingChunk + after;
    
    // Now safely inject requirement notification
    const reqInject = `
      try {
        const managers = await all("SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'");
        for (const m of managers) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [m.user_id, 'New Event Requirement', 'A new client requirement "' + requirementTitle + '" has been posted. Click to review and submit a proposal.', 'manager-requirements.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res`;
      
    restoredJs = restoredJs.replace(/return res[\s]*\.status\(201\)[\s]*\.json\(\{[\s]*message:[\s]*'Requirement created successfully',/, reqInject + "\n        .status(201)\n        .json({\n\n          message:\n            'Requirement created successfully',");
    
    // Now safely inject proposal notification
    const propInject = `
      try {
        const reqRow = await one("SELECT customer_id, requirement_title FROM event_requirements WHERE requirement_id = ?", [requirementId]);
        if (reqRow && reqRow.customer_id) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [reqRow.customer_id, 'New Proposal Received', 'A manager has submitted a new proposal for your requirement "' + (reqRow.requirement_title || 'Event') + '".', 'proposals.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res`;
      
    restoredJs = restoredJs.replace(/return res[\s]*\.status\(201\)[\s]*\.json\(\{[\s]*message:[\s]*'Proposal submitted successfully',/, propInject + "\n        .status(201)\n        .json({\n\n          message:\n            'Proposal submitted successfully',");

    fs.writeFileSync('app.js', restoredJs);
    console.log('Restored and injected successfully');
} else {
    console.log('Could not find bad block');
}

