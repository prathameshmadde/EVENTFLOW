const fs = require('fs');

let mainJs = fs.readFileSync('main.js', 'utf8');

const syncFunction = `
  function syncSidebarUserInfo() {
    var u = EventFlow.getUser();
    if (!u) return;
    
    var n = u.business_name || u.name || (u.role === 'EVENT_MANAGER' ? 'Event Producer' : 'EventFlow User');
    var init = n.charAt(0).toUpperCase();
    
    var nameEls = document.querySelectorAll('.sidebar-user-name, #side-user-name');
    nameEls.forEach(function(el) { el.textContent = n; });
    
    var avatarEls = document.querySelectorAll('.sidebar-user-avatar, #side-user-avatar');
    avatarEls.forEach(function(el) { el.textContent = init; });
    
    var roleEls = document.querySelectorAll('.sidebar-user-role, #side-user-role');
    var roleStr = (u.role === 'EVENT_MANAGER' ? 'Event Producer' : (u.role === 'ADMIN' ? 'Administrator' : 'Luxury Client'));
    roleEls.forEach(function(el) { el.textContent = roleStr; });
  }
`;

const insertPoint = `  document.addEventListener('DOMContentLoaded', function () {`;
const replacePoint = `  document.addEventListener('DOMContentLoaded', function () {\n    syncSidebarUserInfo();`;

if (mainJs.includes(insertPoint)) {
    mainJs = mainJs.replace(insertPoint, syncFunction + '\n' + replacePoint);
    fs.writeFileSync('main.js', mainJs);
    console.log('Appended syncSidebarUserInfo to main.js');
} else {
    console.log('Could not find DOMContentLoaded in main.js');
}

