const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
const pdfStart = code.indexOf("app.get('/api/payments/:id/receipt'");
const pdfEnd = code.lastIndexOf('});', code.indexOf('const PORT')) + 3;
const pdfCode = code.substring(pdfStart, pdfEnd);
code = code.substring(0, pdfStart) + code.substring(pdfEnd);
const api404 = code.indexOf('/* =========================================================\r\n   API 404');
let api404idx = api404 !== -1 ? api404 : code.indexOf('/* =========================================================\n   API 404');
code = code.substring(0, api404idx) + pdfCode + '\n\n' + code.substring(api404idx);
fs.writeFileSync('app.js', code);
console.log('Moved PDF routes!');

