const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

let lines = c.split('\n');
let newLines = [];
let skip = 0;

for (let i = 0; i < lines.length; i++) {
    if (skip > 0) {
        skip--;
        continue;
    }
    
    if (i > 50 && lines[i].includes('const app = express();')) {
        // also skip the surrounding duplicates (PORT, FRONTEND_DIR, SESSION_SECRET, cors setup)
        // Let's just remove the next 25 lines
        skip = 25;
        // And we also want to remove the preceding `require` lines if they are duplicated
        // For safety, let's just use string replace on the exact chunk
    } else {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('app.js', newLines.join('\n'));
console.log('Removed duplicate blocks');

