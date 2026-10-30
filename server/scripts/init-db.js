const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  const sqlPath = path.join(__dirname, '../init-db.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Executing SQL migration script...');
  await connection.query(sql);

  console.log('Database `tutut` successfully initialized with 7 tables and initial seed data!');
  await connection.end();
}

init().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
