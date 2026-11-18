'use strict';

// One small async database API with two backends:
// - Postgres (e.g. Supabase) when DATABASE_URL is set. Data survives server restarts.
// - A local SQLite file otherwise (handy for running on your own computer).
// SQL is written with `?` placeholders; the Postgres backend turns them into $1, $2, ...

const fs = require('node:fs');
const path = require('node:path');

const PG_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  opening_balance BIGINT NOT NULL DEFAULT 0,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date);
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  category TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  UNIQUE (user_id, period, category)
);
-- Block Supabase's public Data API from these tables; the server connects as the owner and is not affected.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
`;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  opening_balance INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date);
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  UNIQUE (user_id, period, category)
);
`;

function toPgParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function openPostgres(url) {
  const pg = require('pg');
  // BIGINT columns (money in centavos, expiry timestamps) come back as strings by default.
  // All our values are far below 2^53, so plain numbers are safe.
  pg.types.setTypeParser(20, (v) => Number(v));
  const pool = new pg.Pool({
    connectionString: url,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
    max: 5,
  });
  pool.on('error', (err) => console.error('Database connection error:', err.message));

  const wrap = (q) => ({
    async get(sql, ...params) {
      return (await q.query(toPgParams(sql), params)).rows[0];
    },
    async all(sql, ...params) {
      return (await q.query(toPgParams(sql), params)).rows;
    },
    async run(sql, ...params) {
      return { changes: (await q.query(toPgParams(sql), params)).rowCount };
    },
  });

  await pool.query(PG_SCHEMA);
  return {
    kind: 'postgres',
    ...wrap(pool),
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(wrap(client));
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
  };
}

function openSqlite(dataDir) {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'budget.db'));
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SQLITE_SCHEMA);
  const api = {
    async get(sql, ...params) {
      return db.prepare(sql).get(...params);
    },
    async all(sql, ...params) {
      return db.prepare(sql).all(...params);
    },
    async run(sql, ...params) {
      return { changes: Number(db.prepare(sql).run(...params).changes) };
    },
  };
  // SQLite runs one statement at a time, so a simple queue keeps transactions from overlapping.
  let queue = Promise.resolve();
  return {
    kind: 'sqlite',
    ...api,
    transaction(fn) {
      const next = queue.then(async () => {
        db.exec('BEGIN');
        try {
          const result = await fn(api);
          db.exec('COMMIT');
          return result;
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }
      });
      queue = next.catch(() => {});
      return next;
    },
  };
}

async function openDatabase({ databaseUrl, dataDir }) {
  return databaseUrl ? openPostgres(databaseUrl) : openSqlite(dataDir);
}

module.exports = { openDatabase };
