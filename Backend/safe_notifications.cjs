const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const notifEndpoints = `
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
    appjs = appjs.replace("app.listen(", notifEndpoints + "\napp.listen(");
}

// Target 1: Requirement POST
const reqTarget = `
      return res
        .status(201)
        .json({

          message:
            'Requirement created successfully',`;

const reqReplace = `
      try {
        const managers = await all("SELECT user_id FROM users WHERE role = 'EVENT_MANAGER'");
        for (const m of managers) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [m.user_id, 'New Event Requirement', 'A new client requirement "' + requirementTitle + '" has been posted. Click to review and submit a proposal.', 'manager-requirements.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
` + reqTarget;

if (appjs.includes(reqTarget)) {
    appjs = appjs.replace(reqTarget, reqReplace);
    console.log("Injected req notification");
} else {
    console.log("Req target not found");
}

// Target 2: Proposal POST
const propTarget = `
      return res
        .status(201)
        .json({

          message:
            'Proposal submitted successfully',`;

const propReplace = `
      try {
        const reqRow = await one("SELECT customer_id, requirement_title FROM event_requirements WHERE requirement_id = ?", [requirementId]);
        if (reqRow && reqRow.customer_id) {
            await query("INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)", [reqRow.customer_id, 'New Proposal Received', 'A manager has submitted a new proposal for your requirement "' + (reqRow.requirement_title || 'Event') + '".', 'proposals.html?highlight=' + result.insertId]);
        }
      } catch(ne) { console.error('Notification error:', ne); }
` + propTarget;

if (appjs.includes(propTarget)) {
    appjs = appjs.replace(propTarget, propReplace);
    console.log("Injected prop notification");
} else {
    console.log("Prop target not found");
}

fs.writeFileSync('app.js', appjs);

