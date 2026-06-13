#!/usr/bin/env node
/**
 * Migration runner — applies pending SQL files from database/migrations/ in order.
 *
 * Usage:
 *   node database/migrate.js
 *
 * Env vars read from backend/.env:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/** Split a SQL file into individual statements, ignoring comments and blank lines */
function splitStatements(sql) {
  return sql
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 0 && !/^USE\s+/i.test(s)); // skip USE <db> — runner owns the connection
}

async function run() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'doctor_saas',
  });

  console.log('Connected to database.');

  // Ensure tracking table exists (idempotent)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          INT           NOT NULL AUTO_INCREMENT,
      filename    VARCHAR(255)  NOT NULL UNIQUE,
      applied_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB
  `);

  // Fetch already-applied migrations
  const [rows] = await connection.execute('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map(r => r.filename));

  // Collect and sort migration files
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const pending = files.filter(f => !applied.has(f));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    await connection.end();
    return;
  }

  console.log(`Applying ${pending.length} migration(s)...`);

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = splitStatements(sql);

    console.log(`  → ${file}`);
    try {
      for (const stmt of statements) {
        await connection.query(stmt); // query() uses text protocol; execute() breaks SET @var / PREPARE
      }
      // Safety net: mark applied even if the migration's own INSERT was skipped
      await connection.query(
        'INSERT IGNORE INTO schema_migrations (filename) VALUES (?)',
        [file]
      );
      console.log(`    ✓ done`);
    } catch (err) {
      console.error(`    ✗ FAILED: ${err.message}`);
      console.error('Migration run aborted. Fix the error and re-run.');
      await connection.end();
      process.exit(1);
    }
  }

  console.log('All migrations applied successfully.');
  await connection.end();
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
