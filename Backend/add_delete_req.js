const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const idx = code.indexOf('/api/requirements/:id/status');
if (idx === -1) {
  console.log('Not found');
  process.exit(1);
}

let insertIdx = code.indexOf('  }\n);', idx);
if (insertIdx === -1) {
    insertIdx = code.indexOf(');', idx);
}
insertIdx += 5; // skip `  }\n);\n`

const newCode = code.slice(0, insertIdx) + `

app.delete(
  '/api/requirements/:id',
  requireAuth,
  requireRole('CUSTOMER'),
  async (req, res) => {
    try {
      const reqId = int(req.params.id);
      if (!reqId) return res.status(400).json({message: 'Invalid id'});
      
      const r = await one('SELECT * FROM event_requirements WHERE requirement_id = ?', [reqId]);
      if (!r) return res.status(404).json({message: 'Requirement not found'});
      
      if (Number(r.customer_id) !== Number(req.auth.user_id)) {
        return res.status(403).json({message: 'Access denied'});
      }
      
      await query('DELETE FROM proposals WHERE requirement_id = ?', [reqId]);
      await query('DELETE FROM event_requirements WHERE requirement_id = ?', [reqId]);
      
      res.json({message: 'Deleted successfully'});
    } catch (e) {
      sendError(res, 'Failed to delete requirement', e);
    }
  }
);
` + code.slice(insertIdx);

fs.writeFileSync('app.js', newCode);
console.log('Added delete requirements endpoint');

