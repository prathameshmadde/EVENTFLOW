const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

html = html.replace(
  "window.location.href = 'booking.html?id=' + upcoming.booking_id;",
  "window.location.href = 'my-bookings.html';"
);

// There is also a hardcoded listener in customer-dashboard.html:
// var btnPay = document.getElementById('btn-flagship-pay');
// if (btnPay) {
//   btnPay.addEventListener('click', function () {
//     openPaymentModal(1, 'Grand Royal Rajputana Wedding', 390000, 'STAGE 3 (VENDOR ALIGNMENT)');
//   });
// }
// We need to replace that one too, because it might trigger multiple listeners!
html = html.replace(
  "openPaymentModal(1, 'Grand Royal Rajputana Wedding', 390000, 'STAGE 3 (VENDOR ALIGNMENT)');",
  "window.location.href = 'my-bookings.html';"
);


fs.writeFileSync('customer-dashboard.html', html);
console.log('Fixed btn-flagship-pay redirection');

