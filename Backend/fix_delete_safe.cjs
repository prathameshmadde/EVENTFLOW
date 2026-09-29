const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// 1. Remove the bad injection inside app.put
const injectionStart = appjs.indexOf("app.delete(\n  '/api/requirements/:id',\n  requireAuth,\n  requireRole('CUSTOMER')");
if (injectionStart !== -1) {
    const injectionEnd = appjs.indexOf(");\n\n\n      const current =", injectionStart);
    if (injectionEnd !== -1) {
        // Cut out the bad block
        appjs = appjs.substring(0, injectionStart) + appjs.substring(injectionEnd + 5);
        console.log('Removed broken injected app.delete!');
    }
}

// 2. Fix the REAL app.delete block (around line 3900)
const realDeleteStart = appjs.indexOf("app.delete(\n  '/api/requirements/:id',\n  requireAuth,\n  async (");
if (realDeleteStart !== -1) {
    // Find where the proposal count check starts
    const propCountStart = appjs.indexOf("const proposalCount =", realDeleteStart);
    if (propCountStart !== -1) {
        // Find the end of the if-block rejecting the delete
        const rejectEnd = appjs.indexOf("}\n\n\n      await query(\n        `\n          DELETE FROM event_requirements", propCountStart);
        if (rejectEnd !== -1) {
            const newLogic = `// Delete associated proposals first
      await query('DELETE FROM proposals WHERE requirement_id = ?', [requirementId]);
`;
            appjs = appjs.substring(0, propCountStart) + newLogic + appjs.substring(rejectEnd + 2);
            console.log('Fixed real app.delete route to cascade proposals!');
        }
    }
}

fs.writeFileSync('app.js', appjs);
console.log('Saved app.js');

