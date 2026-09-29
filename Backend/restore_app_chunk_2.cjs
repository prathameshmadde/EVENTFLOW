const fs = require('fs');

let curJs = fs.readFileSync('app.js', 'utf8');
const missingTxt = fs.readFileSync('missing.txt', 'utf8');

// In curJs, the deleted part is between:
// message: 'Requirement created successfully'
// and
// message: 'Proposal submitted successfully'

const curStartIdx = curJs.indexOf("message: 'Requirement created successfully'");
const curEndIdx = curJs.indexOf("message: 'Proposal submitted successfully'");

if (curStartIdx !== -1 && curEndIdx !== -1) {
    const before = curJs.substring(0, curStartIdx);
    const after = curJs.substring(curEndIdx + "message: 'Proposal submitted successfully'".length);
    
    // missingTxt starts with "Requirement created successfully'"
    // and ends just before "Proposal submitted successfully'"
    
    // We want to insert our notification logic inside the missingTxt at the appropriate places.
    let newMissing = missingTxt;
    
    // Inject requirement notification at the top of missingTxt (which is right after the requirement insertion)
    // Wait, the original code had:
    /*
          message:
            'Requirement created successfully',

          requirement_id:
            result.insertId,
    */
    // Our injection needs to happen right BEFORE the `return res.status(201).json({` for the requirement.
    // So we can find that in `before` or `missingTxt`.
    
    // Let's just restore the file completely to the original state from `1 - Copy/Backend/app.js` first, 
    // EXCEPT keeping the receipts, statements, manager dashboard fixes, and notification endpoints we added!
    
    // Actually, `before` ends right before `message: 'Requirement created...`
    // And `after` starts right after `message: 'Proposal submitted...`
    
    // We can just construct it:
    const finalJs = before + "message:\n            '" + newMissing + "\n            'Proposal submitted successfully'" + after;
    
    fs.writeFileSync('app.js_restored', finalJs);
    console.log('Restored to app.js_restored');
} else {
    console.log('Could not find markers in curJs');
}

