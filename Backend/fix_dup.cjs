const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');
const dupStart = lines.findIndex((l, i) => i > 12000 && l.startsWith('const express = require'));
if (dupStart > -1) {
  lines = lines.slice(0, dupStart);
  let c = lines.join('\n');
  c += `\n
app.use('/api', (req, res) => {
  res.status(404).json({ message: \`API route not found: \${req.method} \${req.originalUrl}\` });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Frontend', 'index.html'));
});

app.listen(PORT, () => console.log(\`Server on port \${PORT}\`));
`;
  fs.writeFileSync('app.js', c);
  console.log('Fixed app.js');
} else {
  console.log('No duplication found');
}

