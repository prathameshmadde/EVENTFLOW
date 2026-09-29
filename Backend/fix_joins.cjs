const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// There are multiple instances of this. We want to replace it EVERYWHERE it occurs in those multiline queries.
// Look for the exact block:
const block = `        ON
          b.proposal_id =
          p.proposal_id`;

const newBlock = `        ON
          b.proposal_id =
          p.proposal_id

      LEFT JOIN event_requirements er
        ON p.requirement_id = er.requirement_id`;

if (appjs.includes(block)) {
    // replace all occurrences
    appjs = appjs.split(block).join(newBlock);
    console.log('Fixed JOINs successfully');
} else {
    console.log('Could not find block');
}

fs.writeFileSync('app.js', appjs);

