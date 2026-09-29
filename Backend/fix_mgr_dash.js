const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const target = `      return res.json(
        aliases(
          dashboard || {}
        )
      );`;

const replacement = `      // Inject arrays for frontend task 21
      const openReqs = await query("SELECT * FROM event_requirements WHERE status IN ('OPEN', 'PROPOSALS_RECEIVED') ORDER BY created_at DESC LIMIT 5");
      const activeBookings = await query("SELECT * FROM bookings WHERE manager_id = ? ORDER BY created_at DESC LIMIT 5", [manager.manager_id]);
      const pendingProps = await query("SELECT * FROM proposals WHERE manager_id = ? AND status = 'SUBMITTED'", [manager.manager_id]);
      
      let dashData = aliases(dashboard || {});
      dashData.openRequirements = openReqs.map(r => aliases(r));
      dashData.activeBookingsList = activeBookings.map(b => aliases(b));
      dashData.pendingProposals = pendingProps.length;

      // also calculate pipeline revenue
      let pipeline = 0;
      activeBookings.forEach(b => { pipeline += Number(b.final_amount) });
      dashData.pipeline_revenue = pipeline;

      return res.json(dashData);`;

c = c.replace(target, replacement);
fs.writeFileSync('app.js', c);
console.log('Injected arrays into manager dashboard');

