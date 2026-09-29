const http = require('http');
const mysql = require('mysql2/promise');

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING PAYMENT TESTS ---');
  
  // 1. DB connection to setup data
  const con = await mysql.createConnection({host:'localhost', user:'root', password:'Pr@012345678', database:'eventflow'});
  
  // 2. Login
  const loginRes = await request('POST', '/api/auth/login', { email: 'customer@eventflow.com', password: 'customer123' });
  const token = loginRes.data.session_token;
  const customerId = loginRes.data.user.id || loginRes.data.user.user_id;
  console.log('Login successful. Customer ID:', customerId);

  // 3. Ensure a booking exists
  const [b] = await con.execute('SELECT * FROM bookings WHERE customer_id = ?', [customerId]);
  if (b.length === 0) {
      console.log('No booking found for customer. Inserting a mock booking...');
      await con.execute('INSERT INTO bookings (customer_id, manager_id, event_id, event_name, event_date, guest_count, final_amount, status) VALUES (?, 21, 1, "Mock Wedding", "2026-11-20", 100, 1000000, "CONFIRMED")', [customerId]);
  }
  
  // 4. Fetch Bookings
  const bookingsRes = await request('GET', '/api/customers/' + customerId + '/bookings', null, token);
  if (!bookingsRes.data || bookingsRes.data.length === 0) {
      console.log('Still no bookings found from API.');
      return;
  }
  const booking = bookingsRes.data[0];
  console.log('Testing booking ID:', booking.booking_id, 'Amount:', booking.final_amount);
  
  // Clean up any existing payments for this booking so test is clean
  await con.execute('DELETE FROM payments WHERE booking_id = ?', [booking.booking_id]);
  
  const stage1Amt = booking.final_amount * 0.6;
  const stage2Amt = booking.final_amount * 0.4;
  
  // 5. Pay 60%
  console.log('Attempting to pay Stage 1:', stage1Amt);
  const pay1 = await request('POST', '/api/payments', { bookingId: booking.booking_id, amount: stage1Amt, paymentMethod: 'UPI' }, token);
  console.log('Pay 1 response:', pay1.status, pay1.data);
  
  // 6. Pay 40%
  console.log('Attempting to pay Stage 2:', stage2Amt);
  const pay2 = await request('POST', '/api/payments', { bookingId: booking.booking_id, amount: stage2Amt, paymentMethod: 'UPI' }, token);
  console.log('Pay 2 response:', pay2.status, pay2.data);
  
  // 7. Attempt Overpayment
  console.log('Attempting Overpayment (100 INR)');
  const pay3 = await request('POST', '/api/payments', { bookingId: booking.booking_id, amount: 100, paymentMethod: 'UPI' }, token);
  console.log('Overpayment response:', pay3.status, pay3.data);
  
  // 8. Verify Ledger
  const paymentsRes = await request('GET', '/api/customers/' + customerId + '/payments', null, token);
  const myPayments = paymentsRes.data.filter(p => p.booking_id === booking.booking_id);
  const totalPaid = myPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  console.log('Ledger verified. Total payments:', myPayments.length, 'Total Paid:', totalPaid);
  console.log('Expected Total:', booking.final_amount);
  
  process.exit(0);
}

runTest().catch(console.error);

