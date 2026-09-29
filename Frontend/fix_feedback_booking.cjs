const fs = require('fs');
let html = fs.readFileSync('feedback.html', 'utf8');

// Add booking dropdown to the form
const formHtml = `          <form id="feedback-form" class="form-stack">
            <label id="booking-select-wrapper" style="display:none;">
              Select Event Booking
              <select id="fb-booking-id" required>
                <option value="">Loading your bookings...</option>
              </select>
            </label>
            <div>`;

html = html.replace('<form id="feedback-form" class="form-stack">\n            <div>', formHtml);

// Add JS to fetch bookings and handle the dropdown
const scriptRegex = /var txt = document.getElementById\('fb-text'\)\.value;/;
const scriptReplacement = `var txt = document.getElementById('fb-text').value;
        var selectedBookingId = document.getElementById('fb-booking-id') ? document.getElementById('fb-booking-id').value : null;`;

html = html.replace(scriptRegex, scriptReplacement);

// Fix the payload assignment
const payloadRegex = /if \(bookingId\) payload\.booking_id = parseInt\(bookingId\);/;
const payloadReplacement = `if (bookingId) payload.booking_id = parseInt(bookingId);
        else if (selectedBookingId) payload.booking_id = parseInt(selectedBookingId);`;

html = html.replace(payloadRegex, payloadReplacement);

// Add booking fetch logic in DOMContentLoaded
const fetchLogic = `    document.addEventListener('DOMContentLoaded', function () {
      var urlParams = new URLSearchParams(window.location.search);
      var bookingId = urlParams.get('booking_id') || urlParams.get('id');
      
      if (!bookingId) {
          document.getElementById('booking-select-wrapper').style.display = 'flex';
          EventFlow.apiGet('/bookings').then(function(res) {
              var bookings = Array.isArray(res) ? res : (res.bookings || []);
              var select = document.getElementById('fb-booking-id');
              select.innerHTML = '<option value="">-- Select an Event --</option>';
              bookings.forEach(function(b) {
                  var opt = document.createElement('option');
                  opt.value = b.booking_id || b.id;
                  opt.textContent = (b.requirement_title || b.event_name || 'Event') + ' (' + new Date(b.event_date).toLocaleDateString() + ')';
                  select.appendChild(opt);
              });
          }).catch(function(err) {
              document.getElementById('fb-booking-id').innerHTML = '<option value="">No bookings found</option>';
          });
      }
`;
html = html.replace("    document.addEventListener('DOMContentLoaded', function () {", fetchLogic);

fs.writeFileSync('feedback.html', html);
console.log('Fixed feedback form to support missing bookingId');

