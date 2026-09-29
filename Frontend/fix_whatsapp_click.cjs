const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

// 1. Remove the old event listener
const oldListenerRegex = /var btnFlagshipContact[\s\S]*?\}\);[\s\S]*?\}/;
html = html.replace(oldListenerRegex, '');

// 2. Fix the WhatsApp wa.me URL to include the country code
const oldOnclickRegex = /window\.open\('https:\/\/wa\.me\/' \+ upcoming\.manager_phone\.replace\(\/\\D\/g, ''\), '_blank'\);/;
const newOnclick = `let ph = upcoming.manager_phone.replace(/\\D/g, ''); if(ph.length === 10) ph = '91' + ph; window.open('https://wa.me/' + ph, '_blank');`;
html = html.replace(oldOnclickRegex, newOnclick);

fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed Whatsapp click handler and removed old listener');

