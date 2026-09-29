const fs = require('fs');

let html = fs.readFileSync('my-requirements.html', 'utf8');

// 1. Insert Delete button
const linkSection = `'<a href="proposals.html?reqId=' + reqId + '" class="btn btn-primary btn-sm">Compare Bids +'</a>' +`;
const linkSectionReplacement = `'<a href="proposals.html?reqId=' + reqId + '" class="btn btn-primary btn-sm">Compare Bids &rarr;</a>' +
                      '<button type="button" class="btn btn-outline btn-sm" onclick="window.deleteReq(' + reqId + ')" style="color:#ef4444;border-color:#ef4444;background:transparent;">Delete</button>' +`;

if (html.includes(linkSection)) {
    html = html.replace(linkSection, linkSectionReplacement);
} else {
    // maybe encoded arrow?
    const linkSectionEncoded = `'<a href="proposals.html?reqId=' + reqId + '" class="btn btn-primary btn-sm">Compare Bids \\u2192</a>' +`;
    if (html.includes(linkSectionEncoded)) {
        html = html.replace(linkSectionEncoded, linkSectionReplacement.replace('&rarr;', '\\u2192'));
    } else {
        // Just inject after Brief Details
        const briefLink = `'<a href="requirement-details.html?id=' + reqId + '" class="btn btn-outline btn-sm">Brief Details</a>' +`;
        if (html.includes(briefLink)) {
            html = html.replace(briefLink, briefLink + "\n" + `'<button type="button" class="btn btn-outline btn-sm" onclick="window.deleteReq(' + reqId + ')" style="color:#ef4444;border-color:#ef4444;background:transparent;">Delete</button>' +`);
        }
    }
}

// 2. Define window.deleteReq
const loadReqCall = "loadRequirements();";
const deleteScript = `
      window.deleteReq = function(reqId) {
          if (!confirm('Are you sure you want to delete this event requirement? This cannot be undone.')) return;
          EventFlow.apiDelete('/requirements/' + reqId)
            .then(function() {
              EventFlow.showToast('Requirement deleted successfully.', 'success');
              loadRequirements();
            })
            .catch(function(err) {
              EventFlow.showToast(err.message || 'Failed to delete requirement.', 'error');
            });
      };
      
      loadRequirements();
`;

html = html.replace(loadReqCall, deleteScript);

fs.writeFileSync('my-requirements.html', html);
console.log('Fixed my-requirements.html delete functionality');

