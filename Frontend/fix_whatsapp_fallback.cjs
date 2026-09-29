const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

const regex = /if\s*\(msgBtn\s*&&\s*upcoming\.manager_phone\)\s*\{\s*msgBtn\.onclick\s*=\s*function\(\)\s*\{[\s\S]*?\};\s*\}/;

const newBlock = `if (msgBtn) {
                  msgBtn.onclick = function() {
                      let phoneString = upcoming.manager_phone || '9876543210';
                      let ph = phoneString.replace(/\\D/g, ''); 
                      if (ph.length === 10) ph = '91' + ph; 
                      window.open('https://wa.me/' + ph, '_blank');
                  };
              }`;

html = html.replace(regex, newBlock);
fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed WhatsApp click handler to have a fallback phone number');

