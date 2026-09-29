const fs = require('fs');
const html = fs.readFileSync('booking.html', 'utf8');
const matches = html.match(/<script>([\s\S]*?)<\/script>/g);
if (matches) {
  const js = matches[0].replace(/<\/?script>/g, '');
  try {
    const vm = require('vm');
    new vm.Script(js);
    console.log('Syntax OK');
  } catch (e) {
    console.log('Syntax Error:', e);
  }
}

