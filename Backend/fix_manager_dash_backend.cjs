const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

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

if (appjs.match(oldRouteRegex)) {
    appjs = appjs.replace(oldRouteRegex, newRoute);
    fs.writeFileSync('app.js', appjs);
    console.log('Fixed /api/manager/dashboard route in app.js');
} else {
    console.log('Could not match old route in app.js');
}

