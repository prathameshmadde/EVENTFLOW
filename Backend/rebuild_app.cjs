const fs = require('fs');

let appjs = fs.readFileSync('../../1 - Copy/Backend/app.js', 'utf8');

// 1. Fix Auth
appjs = appjs.replace(
  "  const token =\r\n    header.startsWith('Bearer ')\r\n      ? header.slice(7)\r\n      : '';",
  "  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || '');"
);

// 2. Fix Manager Dash
const oldRouteRegex = /app\.get\(\s*'\/api\/manager\/dashboard'[\s\S]*?emp\.user_id = \?[\s\S]*?\]\s*\);\s*return res\.json\(\s*aliases\(\s*dashboard \|\| \{\}\s*\)\s*\);\s*\} catch \(error\) \{/m;
const newRoute = `app.get('/api/manager/dashboard', requireAuth, requireRole('EVENT_MANAGER'), async (req, res) => {
    try {
      const manager = await getManagerProfile(req.auth.user_id);
      if (!manager) return res.status(404).json({ message: 'Manager profile not found' });

      const dashboard = await one(\`
            SELECT emp.manager_id, emp.business_name, emp.rating,
              (SELECT COUNT(*) FROM proposals WHERE manager_id = emp.manager_id) AS my_proposals,
              (SELECT COUNT(*) FROM bookings WHERE manager_id = emp.manager_id) AS my_bookings
            FROM event_manager_profiles emp WHERE emp.user_id = ?\`, [req.auth.user_id]);

      const revenueRow = await one(\`SELECT SUM(COALESCE(final_amount, estimated_amount, 0)) as pipeline_revenue FROM bookings WHERE manager_id = ? AND status != 'CANCELLED'\`, [manager.manager_id]);
      const pendingRow = await one(\`SELECT COUNT(*) as pending_proposals FROM proposals WHERE manager_id = ? AND status = 'SUBMITTED'\`, [manager.manager_id]);
      
      const openReqs = await all(\`SELECT * FROM event_requirements WHERE status IN ('OPEN', 'PROPOSALS_RECEIVED') ORDER BY created_at DESC LIMIT 4\`);
      const bookingsList = await all(\`SELECT b.*, u.name as customer_name FROM bookings b LEFT JOIN users u ON b.customer_id = u.user_id WHERE b.manager_id = ? ORDER BY b.created_at DESC LIMIT 4\`, [manager.manager_id]);

      return res.json({
          manager_id: manager.manager_id,
          business_name: manager.business_name,
          rating: manager.rating || '4.95',
          totalRevenue: revenueRow.pipeline_revenue || 0,
          activeBookings: dashboard.my_bookings || 0,
          pendingProposals: pendingRow.pending_proposals || 0,
          openRequirements: openReqs || [],
          bookingsList: bookingsList || []
      });

    } catch (error) {`;
appjs = appjs.replace(oldRouteRegex, newRoute);

// 3. Inject PDFs (I'll extract routes from update_pdfs.cjs)
const pdfsCode = fs.readFileSync('update_pdfs.cjs', 'utf8');
const routesBlock = pdfsCode.substring(pdfsCode.indexOf('const routes = `') + 16, pdfsCode.lastIndexOf('`;'));
// Append before app.listen
appjs = appjs.replace("app.listen(", routesBlock + "\n\napp.listen(");

// 4. Inject Notifications
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
appjs = appjs.replace("app.listen(", notifEndpoints + "\napp.listen(");

// Inject hooks
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

appjs = appjs.replace(reqRegex, reqInject);
appjs = appjs.replace(propRegex, propInject);

fs.writeFileSync('app.js', appjs);
console.log('Final complete rebuilt app.js created safely!');

