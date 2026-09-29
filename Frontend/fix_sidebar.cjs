const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

// Replace Switch to Manager and Admin Console with Feedback
const portalRegex = /<span class="side-section" style="margin-top:20px;">Portals<\/span>\s*<a href="manager-dashboard\.html" class="side-link">\s*<span class="side-icon-box" data-ef-icon="arrowLeftRight"><\/span>\s*<span class="side-label">Switch to Manager<\/span>\s*<\/a>\s*<a href="admin\.html" class="side-link">\s*<span class="side-icon-box" data-ef-icon="settings"><\/span>\s*<span class="side-label">Admin Console<\/span>\s*<\/a>/;

const replacement = `<span class="side-section" style="margin-top:20px;">Feedback & Support</span>
        <a href="feedback.html" class="side-link">
          <span class="side-icon-box" data-ef-icon="star"></span>
          <span class="side-label">Give Feedback</span>
        </a>`;

if (html.match(portalRegex)) {
    html = html.replace(portalRegex, replacement);
    fs.writeFileSync('customer-dashboard.html', html);
    console.log('Successfully updated customer dashboard sidebar!');
} else {
    console.log('Regex did not match in customer-dashboard.html!');
}

