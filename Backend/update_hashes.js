const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', password:'Pr@012345678', database:'eventflow', port:3306});
  await conn.query("UPDATE users SET password_hash='$2b$10$13JasWa9ur9Ta.U0XW2FB.p0oWcNzFiChEpj2nNFO/MBTpUFCtcoy' WHERE email='admin@eventflow.com'");
  await conn.query("UPDATE users SET password_hash='$2b$10$Bks8XBmiX4lLTHGcJ6.9.uQRA./QSmFU59w5XDm5KdNEpGHE5YMD2' WHERE email='manager@eventflow.com'");
  await conn.query("UPDATE users SET password_hash='$2b$10$lmeHx.FeA9LzGnTuebI6uuqmaXMJMOKJcCpceWl7p4C3FMBwTW0IC' WHERE email='customer@eventflow.com'");
  console.log('Users updated.');
  process.exit(0);
}
run();

