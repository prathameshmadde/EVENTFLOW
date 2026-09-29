const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const target = `const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

 })
);`;

const replacement = `const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_DIR = path.join(
  __dirname,
  '..',
  'Frontend'
);

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'eventflow-local-secret-change-this';

app.use(
  cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5000'],
    credentials: true
  })
);`;

c = c.replace(target, replacement);
fs.writeFileSync('app.js', c);
console.log('Fixed top of app.js 3');

