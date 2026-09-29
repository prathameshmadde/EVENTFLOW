const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /LEFT JOIN event_requirements er\s+ON p.requirement_id = er.requirement_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id/g;
const replacement = "LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id";

if (appjs.match(regex)) {
    appjs = appjs.replace(regex, replacement);
    fs.writeFileSync('app.js', appjs);
    console.log('Fixed duplicate alias in statement route!');
} else {
    console.log('Could not find duplicate alias pattern.');
}

