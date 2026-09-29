const http = require('http');

const data = JSON.stringify({ email: 'customer@eventflow.com', password: 'customer123' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).session_token;
    
    // Attempt statement PDF
    http.get('http://localhost:5000/api/bookings/23/statement', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res2) => {
      console.log('Statement PDF STATUS:', res2.statusCode);
      if (res2.statusCode !== 200) {
        let b2 = '';
        res2.on('data', d => b2 += d);
        res2.on('end', () => console.log('ERROR:', b2));
      }
    });

  });
});

req.write(data);
req.end();

