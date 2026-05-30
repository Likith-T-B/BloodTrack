const mysql = require('mysql2/promise');
const mockDb = require('./mockDb');
require('dotenv').config();

let pool = null;
let useMock = true;

const parseUrl = (urlString) => {
  const parsed = new URL(urlString);
  return {
    host: parsed.hostname,
    port: parsed.port || 3306,
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.substring(1)
  };
};

const checkAndInitTables = async (dbName) => {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('🌱 MySQL Database is empty! Automatically initializing tables, triggers, views, and procedures...');
      
      const fs = require('fs');
      const path = require('path');
      const sqlDir = path.join(__dirname, 'sql');
      
      // 1. Run Schema
      const schemaSql = fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8');
      await pool.query(schemaSql);
      console.log('✅ MySQL tables schema and seeds loaded successfully!');

      // 2. Run Triggers
      const triggersSql = fs.readFileSync(path.join(sqlDir, 'triggers.sql'), 'utf8')
        .replace(/DELIMITER\s+\/\/|DELIMITER\s+;/gi, '')
        .replace(/\/\/(\s*)/g, ';$1');
      await pool.query(triggersSql);
      console.log('✅ MySQL Triggers loaded successfully!');

      // 3. Run Procedures
      const proceduresSql = fs.readFileSync(path.join(sqlDir, 'procedures.sql'), 'utf8')
        .replace(/DELIMITER\s+\/\/|DELIMITER\s+;/gi, '')
        .replace(/\/\/(\s*)/g, ';$1');
      await pool.query(proceduresSql);
      console.log('✅ MySQL Stored Procedures loaded successfully!');

      // 4. Run Views
      const viewsSql = fs.readFileSync(path.join(sqlDir, 'views.sql'), 'utf8');
      await pool.query(viewsSql);
      console.log('✅ MySQL Database Views loaded successfully!');
    }
  } catch (err) {
    console.error('❌ Error during automatic MySQL database seeding:', err.message);
  }
};

const initDb = async () => {
  if (process.env.MYSQL_URL) {
    try {
      const parsed = parseUrl(process.env.MYSQL_URL);
      
      // Connect without database to guarantee database exists
      const tempConn = await mysql.createConnection({
        host: parsed.host,
        port: parsed.port,
        user: parsed.user,
        password: parsed.password
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${parsed.database}\``);
      await tempConn.end();

      // Connect standard pool
      pool = mysql.createPool({
        host: parsed.host,
        port: parsed.port,
        user: parsed.user,
        password: parsed.password,
        database: parsed.database,
        multipleStatements: true
      });
      
      // Test query
      const [rows] = await pool.query('SELECT 1 + 1 AS solution');
      console.log('✅ Connected to MySQL database via MYSQL_URL successfully!');
      useMock = false;

      // Seed tables if empty
      await checkAndInitTables(parsed.database);
    } catch (err) {
      console.warn('⚠️ Failed to connect to MySQL database:', err.message);
      console.warn('👉 Falling back to self-contained JSON DBMS Mock Engine...');
      useMock = true;
    }
  } else {
    console.log('ℹ️ No MYSQL_URL provided. Operating in JSON DBMS Mock Engine mode.');
    useMock = true;
  }
};

// Helper query function that routes either to MySQL pool or mocks
const query = async (sql, params = []) => {
  if (!useMock && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (err) {
      console.error('MySQL Query Error:', err.message);
      throw err;
    }
  } else {
    throw new Error('Database operating in MOCK MODE. Direct raw queries not supported.');
  }
};

module.exports = {
  initDb,
  query,
  isMock: () => useMock,
  mockDb
};
