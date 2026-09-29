const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// I will append the additional classes to the cardGlow section
css += `
/* Manager Dashboard Additional Glows */
.stat:hover {
  animation: goldCardGlow 2.5s infinite ease-in-out !important;
  transform: translateY(-3px) !important;
  transition: all 0.3s ease !important;
}

.panel:hover {
  animation: cardGlow 2.5s infinite ease-in-out !important;
  transform: translateY(-2px) !important;
  transition: all 0.3s ease !important;
}

.list-row:hover {
  animation: cardGlow 2.5s infinite ease-in-out !important;
  transform: translateY(-1px) !important;
  transition: all 0.2s ease !important;
}
`;

fs.writeFileSync('styles.css', css);
console.log('Appended manager dashboard glows');

