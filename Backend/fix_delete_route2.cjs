const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /app\.delete\([\s\S]*?'\/api\/requirements\/:id',[\s\S]*?requireAuth,[\s\S]*?async \([\s\S]*?req,[\s\S]*?res[\s\S]*?\) => \{[\s\S]*?try \{[\s\S]*?const requirementId =[\s\S]*?int\([\s\S]*?req\.params\.id[\s\S]*?\);[\s\S]*?const requirement =[\s\S]*?await one\([\s\S]*?`[\s\S]*?SELECT \*[\s\S]*?FROM event_requirements[\s\S]*?WHERE requirement_id = \?[\s\S]*?`,[\s\S]*?\[requirementId\][\s\S]*?\);[\s\S]*?if \(!requirement\) \{[\s\S]*?return res[\s\S]*?\.status\(404\)[\s\S]*?\.json\(\{[\s\S]*?message:[\s\S]*?'Requirement not found'[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?if \([\s\S]*?req\.auth\.role !==[\s\S]*?'ADMIN' &&[\s\S]*?Number\([\s\S]*?requirement\.customer_id[\s\S]*?\) !== Number\([\s\S]*?req\.auth\.user_id[\s\S]*?\)[\s\S]*?\) \{[\s\S]*?return res[\s\S]*?\.status\(403\)[\s\S]*?\.json\(\{[\s\S]*?message:[\s\S]*?'You do not have access to this requirement'[\s\S]*?\}\);[\s\S]*?\}[\s\S]*?\/\/ Delete associated proposals first[\s\S]*?await query\('DELETE FROM proposals WHERE requirement_id = \?', \[requirementId\]\);[\s\S]*?\);/g;

const properRoute = `app.delete(
  '/api/requirements/:id',
  requireAuth,
  async (req, res) => {
    try {
      const requirementId = parseInt(req.params.id);
      
      const requirement = await one('SELECT * FROM event_requirements WHERE requirement_id = ?', [requirementId]);
      if (!requirement) {
        return res.status(404).json({ message: 'Requirement not found' });
      }

      if (req.auth.role !== 'ADMIN' && Number(requirement.customer_id) !== Number(req.auth.user_id)) {
        return res.status(403).json({ message: 'You do not have access to this requirement' });
      }

      // Delete associated proposals first to avoid foreign key constraints
      await query('DELETE FROM proposals WHERE requirement_id = ?', [requirementId]);
      
      // Delete the requirement itself
      await query('DELETE FROM event_requirements WHERE requirement_id = ?', [requirementId]);

      return res.json({ message: 'Requirement deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to delete requirement' });
    }
  }
);`;

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, properRoute);
    fs.writeFileSync('app.js', appjs);
    console.log('Fixed the DELETE /api/requirements/:id route successfully!');
} else {
    console.log('Could not match the broken DELETE route.');
}

