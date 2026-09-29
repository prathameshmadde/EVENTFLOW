const http = require('http');
const fs = require('fs');
const path = require('path');

function request(method, urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, res => {
      let body = '';
      if (res.headers['content-type'] === 'application/pdf') {
          // write to file
          const filename = path.basename(urlPath.replace('/', '_')) + '.pdf';
          const file = fs.createWriteStream(filename);
          res.pipe(file);
          file.on('finish', () => {
              file.close();
              resolve({ status: res.statusCode, filename });
          });
      } else {
          res.on('data', d => body += d);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch(e) {
              resolve({ status: res.statusCode, data: body });
            }
          });
      }
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING PDF TESTS ---');
  
  // 1. Login
  const loginRes = await request('POST', '/api/auth/login', { email: 'customer@eventflow.com', password: 'customer123' });
  const token = loginRes.data.session_token;
  const customerId = loginRes.data.user.id || loginRes.data.user.user_id;

  // 2. Fetch payments
  const paymentsRes = await request('GET', '/api/customers/' + customerId + '/payments', null, token);
  const myPayments = paymentsRes.data;
  
  if (myPayments.length === 0) {
      console.log('No payments found.');
      return;
  }
  
  const payment = myPayments[0];
  console.log('Testing Receipt for Payment ID:', payment.payment_id);
  
  // 3. Download Receipt
  const receiptRes = await request('GET', '/api/payments/' + payment.payment_id + '/receipt', null, token);
  console.log('Receipt Response Status:', receiptRes.status);
  
  if (receiptRes.filename) {
      const stats = fs.statSync(receiptRes.filename);
      console.log('Receipt File Size:', stats.size, 'bytes');
      if (stats.size > 0) console.log('Receipt PDF is NOT empty. Test Passed!');
      else console.log('Receipt PDF IS EMPTY. Test Failed!');
  }

  // 4. Download Statement
  console.log('Testing Statement for Booking ID:', payment.booking_id);
  const statementRes = await request('GET', '/api/bookings/' + payment.booking_id + '/statement', null, token);
  console.log('Statement Response Status:', statementRes.status);
  
  if (statementRes.filename) {
      const stats = fs.statSync(statementRes.filename);
      console.log('Statement File Size:', stats.size, 'bytes');
      if (stats.size > 0) console.log('Statement PDF is NOT empty. Test Passed!');
      else console.log('Statement PDF IS EMPTY. Test Failed!');
  }
}

runTest().catch(console.error);

