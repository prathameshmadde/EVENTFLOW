const fs = require('fs');

const copyJs = fs.readFileSync('../../1 - Copy/Backend/app.js', 'utf8');
let curJs = fs.readFileSync('app.js', 'utf8');

// Find the chunk in copyJs that was deleted.
// It starts right after "message: 'Requirement created successfully'"
// It ends right before "message: 'Proposal submitted successfully'"

const startStr = "message:\n            'Requirement created successfully'";
const endStr = "message:\n            'Proposal submitted successfully'";

const startIdx = copyJs.indexOf(startStr);
const endIdx = copyJs.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const missingChunk = copyJs.substring(startIdx + startStr.length, endIdx);
    
    // In curJs, the regex replaced everything between them with my new notification code.
    // Let's find where to put it back.
    // Current curJs has:
    // message: 'Requirement created successfully',
    //           requirement_id: result.insertId,
    // ...
    // try {
    //   const reqRow = await one("SELECT customer_id, requirement_title FROM event_requirements WHERE requirement_id = ?", [requirementId]);
    // ...
    // return res
    //   .status(201)
    //   .json({
    //     message: 'Proposal submitted successfully',
    
    // Actually, it's easier to find the exact injection points.
    // In curJs, we have:
    const curStartStr = "message: 'Requirement created successfully'";
    const curEndStr = "message: 'Proposal submitted successfully'";
    
    const curStartIdx = curJs.indexOf(curStartStr);
    const curEndIdx = curJs.indexOf(curEndStr);
    
    if (curStartIdx !== -1 && curEndIdx !== -1) {
        // Wait, the chunk to restore includes the end of the requirement endpoint, 
        // the other endpoints, and the start of the proposal endpoint.
        // What was exactly in the missing chunk?
        console.log('Restoring from index', startIdx + startStr.length, 'to', endIdx, 'length', missingChunk.length);
        
        // The problem is that my previous regex completely removed the missingChunk.
        // I will replace the space between curStartStr and curEndStr with the original missing chunk PLUS my injected notifications.
        
        const restored = missingChunk;
        
        // We will insert this restored chunk right after the requirement_id: result.insertId, ... }); ...
        // Wait, let's just do a manual substring replacement to be safe.
    } else {
        console.log('Could not find curStartStr or curEndStr in curJs');
    }
} else {
    console.log('Could not find startStr or endStr in copyJs');
}

