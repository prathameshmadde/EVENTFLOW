const fs = require('fs');
let html = fs.readFileSync('feedback.html', 'utf8');

// Replace the bad EventFlow.getGlobalState() call with a proper DOMContentLoaded block
html = html.replace(`        var state = EventFlow.getGlobalState();
        if (state.user) {
          var nameEl = document.getElementById('side-user-name');
          if (nameEl) nameEl.textContent = state.user.name;
          var avatarEl = document.getElementById('side-user-avatar');
          if (avatarEl) {
             var initials = state.user.name.split(' ').map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
             avatarEl.textContent = initials;
          }
        }`, ``);

const correctScript = `    document.addEventListener('DOMContentLoaded', function () {
      var userStr = localStorage.getItem('ef_user');
      if (userStr) {
        try {
          var user = JSON.parse(userStr);
          var nameEl = document.getElementById('side-user-name');
          if (nameEl) nameEl.textContent = user.name;
          var avatarEl = document.getElementById('side-user-avatar');
          if (avatarEl) {
             var initials = user.name.split(' ').map(function(n){ return n[0]; }).join('').substring(0,2).toUpperCase();
             avatarEl.textContent = initials;
          }
        } catch (e) {}
      }`;

html = html.replace("    document.addEventListener('DOMContentLoaded', function () {", correctScript);

fs.writeFileSync('feedback.html', html);
console.log('Fixed getGlobalState issue in feedback.html');

