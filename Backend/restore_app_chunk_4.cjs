const fs = require('fs');

let curJs = fs.readFileSync('app.js', 'utf8');
const missingTxt = fs.readFileSync('missing.txt', 'utf8');

// I need to locate where the missing part was removed in curJs.
// Look for "SELECT customer_id, requirement_title FROM event_requirements"
const badStartStr = "try {\n        const managers = await all(\"SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'\");";

const badStart = curJs.indexOf("try {\n        const managers = await all(\"SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'\");");
const badEnd = curJs.indexOf("message: 'Proposal submitted successfully',");

if (badStart !== -1 && badEnd !== -1) {
    // wait, there is "return res\n        .status(201)\n        .json({\n          message: 'Proposal submitted successfully',"
    const fullBadEndStr = "return res\n        .status(201)\n        .json({\n          message: 'Proposal submitted successfully',";
    const actualBadEnd = curJs.indexOf(fullBadEndStr);
    
    // We want to replace from `badStart` to `actualBadEnd` with `missingTxt` but keeping our new injections!
    
    // Wait, since I'm just replacing `badStart` to `actualBadEnd` (but not including actualBadEnd), let's find the exact string.
    
    // I can just replace the entire block manually using a regex or substring!
    let before = curJs.substring(0, badStart);
    // Find the end of the bad block which is right before `return res.status(201)... proposal`
    let after = curJs.substring(actualBadEnd);
    
    // Now insert `missingTxt` properly.
    let restoredJs = before + missingTxt + after;
    
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
    console.log('Could not find bad string bounds. Checking exact file...');
}

