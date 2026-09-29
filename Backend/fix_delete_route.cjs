const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// 1. Remove the broken injected app.delete block inside PUT route
const brokenDeleteBlock = /app\.delete\(\s*'\/api\/requirements\/:id',\s*requireAuth,\s*requireRole\('CUSTOMER'\),\s*async \(req, res\) => \{\s*try \{\s*const reqId = int\(req\.params\.id\);\s*if \(!reqId\) return res\.status\(400\)\.json\(\{message: 'Invalid id'\}\);\s*const r = await one\('SELECT \* FROM event_requirements WHERE requirement_id = \?', \[reqId\]\);\s*if \(!r\) return res\.status\(404\)\.json\(\{message: 'Requirement not found'\}\);\s*if \(Number\(r\.customer_id\) !== Number\(req\.auth\.user_id\)\) \{\s*return res\.status\(403\)\.json\(\{message: 'Access denied'\}\);\s*\}\s*await query\('DELETE FROM proposals WHERE requirement_id = \?', \[reqId\]\);\s*await query\('DELETE FROM event_requirements WHERE requirement_id = \?', \[reqId\]\);\s*res\.json\(\{message: 'Deleted successfully'\}\);\s*\} catch \(e\) \{\s*sendError\(res, 'Failed to delete requirement', e\);\s*\}\s*\}\s*\);\n\n\n/g;

if (appjs.match(brokenDeleteBlock)) {
    appjs = appjs.replace(brokenDeleteBlock, '');
    console.log('Removed broken app.delete from inside PUT.');
} else {
    console.log('Broken app.delete block not found (regex issue?).');
}

// 2. Fix the REAL app.delete block (around line 3960+)
// Replace the proposalCount check and rejection with a query to delete proposals
const proposalCheckBlock = /const proposalCount =[\s\S]*?'Requirement has proposals\. Cancel it instead of deleting it\.'[\s\S]*?\}\s*}/g;
const newProposalLogic = `// Delete associated proposals first
      await query('DELETE FROM proposals WHERE requirement_id = ?', [requirementId]);`;

if (appjs.match(proposalCheckBlock)) {
    appjs = appjs.replace(proposalCheckBlock, newProposalLogic);
    console.log('Updated the real app.delete route to cascade delete proposals!');
} else {
    console.log('Proposal check block not found (regex issue?).');
}

fs.writeFileSync('app.js', appjs);

