const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

// 1. Add Notifications endpoints
const notificationsEndpoints = `
// ==========================================
// NOTIFICATIONS API
// ==========================================

app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
        const notifs = await all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.auth.user_id]);
        return res.json(notifs || []);
    } catch (e) {
        return sendError(res, 'Failed to fetch notifications', e);
    }
});

app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
        await query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.auth.user_id]);
        return res.json({ success: true });
    } catch (e) {
        return sendError(res, 'Failed to mark read', e);
    }
});
`;

if (!appjs.includes('/api/notifications')) {
    appjs = appjs.replace("app.listen(", notificationsEndpoints + "\napp.listen(");
}

// 2. Insert notification in POST /api/requirements
const reqRegex = /message:\s*'Requirement created successfully',[\s\S]*?requirement_id:\s*result\.insertId,/;
const newReqResponse = `message: 'Requirement created successfully',
          requirement_id: result.insertId,`;

// We inject the query before the return res.status(201)
const reqReturnRegex = /return res\s*\.status\(201\)\s*\.json\(\{[\s\S]*?message:\s*'Requirement created successfully'/;

if (appjs.match(reqReturnRegex)) {
    const injectReqNotification = `
      try {
        const managers = await all("SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'");
        for (const m of managers) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [m.user_id, 'New Event Requirement', 'A new client requirement "' + requirementTitle + '" has been posted. Click to review and submit a proposal.', 'manager-requirements.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res
        .status(201)
        .json({
          message: 'Requirement created successfully'`;
    
    appjs = appjs.replace(reqReturnRegex, injectReqNotification);
}

// 3. Insert notification in POST /api/requirements/:id/proposals
const propReturnRegex = /return res\s*\.status\(201\)\s*\.json\(\{[\s\S]*?message:\s*'Proposal submitted successfully'/;

if (appjs.match(propReturnRegex)) {
    const injectPropNotification = `
      try {
        const reqRow = await one("SELECT customer_id, requirement_title FROM event_requirements WHERE requirement_id = ?", [requirementId]);
        if (reqRow && reqRow.customer_id) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [reqRow.customer_id, 'New Proposal Received', 'A manager has submitted a new proposal for your requirement "' + (reqRow.requirement_title || 'Event') + '".', 'proposals.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
      
      return res
        .status(201)
        .json({
          message: 'Proposal submitted successfully'`;
          
    appjs = appjs.replace(propReturnRegex, injectPropNotification);
}

fs.writeFileSync('app.js', appjs);
console.log('Successfully injected Notifications into app.js');

