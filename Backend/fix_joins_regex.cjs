const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// Match:
// LEFT JOIN proposals p
//   [any whitespace]
// ON
//   [any whitespace]
// b.proposal_id =
//   [any whitespace]
// p.proposal_id

const regex = /LEFT JOIN proposals p\s+ON\s+b\.proposal_id =\s+p\.proposal_id/g;

// We need to make sure we don't duplicate it.
// Replace it with itself PLUS the new join.
const replacement = `LEFT JOIN proposals p
        ON
          b.proposal_id =
          p.proposal_id

      LEFT JOIN event_requirements er
        ON p.requirement_id = er.requirement_id`;

let replacedCount = 0;
appjs = appjs.replace(regex, (match) => {
    // Check if it already has the event_requirements join right after
    // Actually, it doesn't matter, it's safer to just replace.
    replacedCount++;
    return replacement;
});

// Wait, the single-line ones at the bottom of the file (for receipt/statement) also match this!
// But they already have `LEFT JOIN event_requirements er` next to them!
// So replacing them might duplicate it!
// Let's only do it if the match doesn't have `LEFT JOIN event_requirements` within the next 100 characters.

// Let's do it manually with a while loop
let newAppJs = '';
let lastIndex = 0;
let match;
const regex2 = /LEFT JOIN proposals p\s+ON\s+b\.proposal_id =\s+p\.proposal_id/g;

while ((match = regex2.exec(appjs)) !== null) {
    const start = match.index;
    const end = regex2.lastIndex;
    newAppJs += appjs.substring(lastIndex, start);
    
    // Look ahead 100 chars
    const ahead = appjs.substring(end, end + 100);
    if (!ahead.includes('event_requirements')) {
        newAppJs += replacement;
        console.log('Patched a join');
    } else {
        newAppJs += match[0]; // leave it alone
    }
    lastIndex = end;
}
newAppJs += appjs.substring(lastIndex);

fs.writeFileSync('app.js', newAppJs);
console.log('Done');

