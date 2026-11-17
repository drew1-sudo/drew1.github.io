'use strict';

// Business Budget Tracker backend: plain Node (no npm install needed).
// Uses the built-in node:sqlite module, so Node 22.13+ / 24+ is required.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 5050;
const ROOT = __dirname;
// On a host like Render, point DATA_DIR at a persistent disk so data survives restarts.
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
// Behind a hosting proxy (Render sets RENDER=true) the real client IP and HTTPS status come from headers.
const BEHIND_PROXY = Boolean(process.env.RENDER || process.env.TRUST_PROXY);
const SESSION_DAYS = 7;

const INCOME_CATEGORIES = ['Sales', 'Services', 'Investments', 'Interest', 'Grants & Loans', 'Other Income'];
const EXPENSE_CATEGORIES = [
  'Salaries and wages',
  'Rent and utilities',
  'Marketing and advertising',
  'Supplies and inventory',
  'Transportation',
  'Equipment',
  'Miscellaneous',
];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'GCash', 'Maya', 'Credit Card', 'Debit Card', 'Check'];
const OVERALL = '__overall__';

// ---------- Database ----------

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'budget.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
db.exec(`
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
`);

function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ---------- Passwords and sessions ----------

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function cookieFlags(req) {
  const https = BEHIND_PROXY && String(req.headers['x-forwarded-proto']).startsWith('https');
  return `HttpOnly; SameSite=Strict; Path=/${https ? '; Secure' : ''}`;
}

function clientIp(req) {
  const forwarded = BEHIND_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress;
}

function createSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = Date.now() + SESSION_DAYS * 864e5;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha256(token), userId, expires);
  res.setHeader('Set-Cookie', `sid=${token}; ${cookieFlags(req)}; Max-Age=${SESSION_DAYS * 86400}`);
}

function readCookie(req, name) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function sessionUser(req) {
  const token = readCookie(req, 'sid');
  if (!token) return null;
  const row = db
    .prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?')
    .get(sha256(token), Date.now());
  return row || null;
}

function clearSession(req, res) {
  const token = readCookie(req, 'sid');
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  res.setHeader('Set-Cookie', `sid=; ${cookieFlags(req)}; Max-Age=0`);
}

// Slow down password guessing: max 10 failed logins per IP per 15 minutes.
const failedLogins = new Map();
function tooManyFailures(ip) {
  const entry = failedLogins.get(ip);
  if (!entry || entry.resetAt < Date.now()) return false;
  return entry.count >= 10;
}
function recordFailure(ip) {
  const entry = failedLogins.get(ip);
  if (!entry || entry.resetAt < Date.now()) failedLogins.set(ip, { count: 1, resetAt: Date.now() + 15 * 60e3 });
  else entry.count++;
}

// ---------- Validation ----------

// Money arrives as a string or number in pesos; it is stored as integer centavos.
function parseMoney(value, { allowZero = false, allowNegative = false } = {}) {
  const s = String(value ?? '').trim().replace(/,/g, '');
  const re = allowNegative ? /^-?\d{1,9}(\.\d{1,2})?$/ : /^\d{1,9}(\.\d{1,2})?$/;
  if (!re.test(s)) return null;
  const cents = Math.round(Number(s) * 100);
  if (cents === 0 && !allowZero) return null;
  return cents;
}

function validDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s && s >= '2000-01-01' && s <= '2099-12-31';
}

const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 120;

function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Use at least 8 characters.';
  if (pw.length > 128) return 'Use at most 128 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Use at least one letter and one number.';
  return null;
}

function cleanText(v, max) {
  return String(v ?? '').trim().slice(0, max + 1);
}

function validateTransaction(b) {
  const fields = {};
  const type = b.type;
  if (type !== 'income' && type !== 'expense') fields.type = 'Choose income or expense.';
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!categories.includes(b.category)) fields.category = 'Choose a category.';
  const amount = parseMoney(b.amount);
  if (amount === null) fields.amount = 'Enter an amount above ₱0 with up to 2 decimals (max ₱999,999,999.99).';
  if (!validDate(b.date)) fields.date = 'Enter a valid date.';
  const description = cleanText(b.description, 200);
  if (!description) fields.description = 'Add a short description.';
  else if (description.length > 200) fields.description = 'Keep the description under 200 characters.';
  if (!PAYMENT_METHODS.includes(b.payment_method)) fields.payment_method = 'Choose a payment method.';
  return { fields, value: { type, category: b.category, amount, date: b.date, description, payment_method: b.payment_method } };
}

function validateBudget(b) {
  const fields = {};
  if (b.period !== 'monthly' && b.period !== 'yearly') fields.period = 'Choose monthly or yearly.';
  if (b.category !== OVERALL && !EXPENSE_CATEGORIES.includes(b.category)) fields.category = 'Choose a category.';
  const amount = parseMoney(b.amount);
  if (amount === null) fields.amount = 'Enter a limit above ₱0 with up to 2 decimals.';
  return { fields, value: { period: b.period, category: b.category, amount } };
}

// ---------- Sample data ----------

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 12 months of transactions for a small café, ending today.
function loadSampleData(userId) {
  const rand = mulberry32(userId * 7919 + 17);
  const pesos = (lo, hi) => Math.round((lo + rand() * (hi - lo)) / 10) * 10 * 100;
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const now = new Date();
  const today = ymd(now);
  const rows = [];

  for (let back = 11; back >= 0; back--) {
    const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const add = (type, day, category, amount, description, method) => {
      const date = ymd(new Date(y, m, Math.min(day, lastDay)));
      if (date <= today) rows.push([type, category, amount, date, description, method]);
    };

    for (const day of [3, 10, 17, 24]) {
      add('income', day, 'Sales', pesos(55000, 95000),
        pick(['Walk-in café sales', 'Weekly counter sales', 'Online order sales', 'Weekend bazaar sales']),
        pick(['Cash', 'GCash', 'Bank Transfer', 'Maya']));
    }
    add('income', 15, 'Services', pesos(25000, 60000), 'Catering for corporate event', 'Bank Transfer');
    if (rand() < 0.6) add('income', 27, 'Services', pesos(12000, 30000), 'Barista workshop fees', 'GCash');
    if (m % 3 === 2) add('income', 20, 'Investments', pesos(5000, 15000), 'Quarterly dividend payout', 'Bank Transfer');
    add('income', 28, 'Interest', pesos(300, 900), 'Savings account interest', 'Bank Transfer');

    add('expense', 15, 'Salaries and wages', pesos(62000, 66000), 'Payroll – 1st half of month', 'Bank Transfer');
    add('expense', 30, 'Salaries and wages', pesos(62000, 66000), 'Payroll – 2nd half of month', 'Bank Transfer');
    add('expense', 5, 'Rent and utilities', 4500000, 'Store rent', 'Check');
    add('expense', 20, 'Rent and utilities', pesos(7000, 11000), 'Electricity and water bills', 'GCash');
    add('expense', 8, 'Marketing and advertising', pesos(8000, 18000), 'Facebook and Instagram ads', 'Credit Card');
    if (rand() < 0.4) add('expense', 22, 'Marketing and advertising', pesos(5000, 12000), 'Flyers and tarpaulin printing', 'Cash');
    add('expense', 2, 'Supplies and inventory', pesos(18000, 32000), 'Coffee beans restock', 'Bank Transfer');
    add('expense', 12, 'Supplies and inventory', pesos(18000, 32000), 'Milk, syrups and pastries', 'Cash');
    add('expense', 23, 'Supplies and inventory', pesos(18000, 32000), 'Cups, lids and packaging', 'Debit Card');
    for (const day of [6, 16, 26]) {
      add('expense', day, 'Transportation', pesos(1500, 4500),
        pick(['Delivery van fuel', 'Courier delivery fees', 'Supplier pickup trip']), pick(['Cash', 'GCash']));
    }
    if (rand() < 0.35) {
      add('expense', 18, 'Equipment', pesos(15000, 65000),
        pick(['Espresso machine servicing', 'New coffee grinder', 'POS tablet', 'Chiller repair']), 'Credit Card');
    }
    add('expense', 25, 'Miscellaneous', pesos(1500, 6000), pick(['Bank charges and permits', 'Cleaning supplies', 'Office snacks']), 'Cash');
  }

  const budgets = [
    ['monthly', OVERALL, 32000000],
    ['monthly', 'Salaries and wages', 13000000],
    ['monthly', 'Rent and utilities', 5500000],
    ['monthly', 'Marketing and advertising', 2500000],
    ['monthly', 'Supplies and inventory', 8500000],
    ['monthly', 'Transportation', 1200000],
    ['monthly', 'Equipment', 3000000],
    ['monthly', 'Miscellaneous', 600000],
    ['yearly', OVERALL, 380000000],
    ['yearly', 'Marketing and advertising', 25000000],
    ['yearly', 'Equipment', 20000000],
  ];

  transaction(() => {
    db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);
    const insTx = db.prepare(
      'INSERT INTO transactions (user_id, type, category, amount, date, description, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const r of rows) insTx.run(userId, ...r);
    const insBudget = db.prepare('INSERT INTO budgets (user_id, period, category, amount) VALUES (?, ?, ?, ?)');
    for (const b of budgets) insBudget.run(userId, ...b);
    db.prepare('UPDATE users SET opening_balance = ? WHERE id = ? AND opening_balance = 0').run(50000000, userId);
  });
}

function ymd(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Demo account so the app has data on first launch.
const DEMO = { email: 'demo@example.com', password: 'demo1234', name: 'Demo Owner', business: 'Bayanihan Coffee Co.' };
if (!db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO.email)) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (name, email, business_name, password_hash) VALUES (?, ?, ?, ?)')
    .run(DEMO.name, DEMO.email, DEMO.business, hashPassword(DEMO.password));
  loadSampleData(Number(lastInsertRowid));
  console.log(`Created demo account: ${DEMO.email} / ${DEMO.password}`);
}

// ---------- HTTP helpers ----------

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

const fail = (res, status, error, fields) => send(res, status, fields ? { error, fields } : { error });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 100_000) {
        reject(Object.assign(new Error('Request body too large.'), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      if (!size) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON body.'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  business_name: u.business_name,
  opening_balance: u.opening_balance,
  created_at: u.created_at,
});

function userData(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return {
    user: publicUser(user),
    transactions: db
      .prepare(
        'SELECT id, type, category, amount, date, description, payment_method, created_at, updated_at FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC'
      )
      .all(userId),
    budgets: db.prepare('SELECT id, period, category, amount FROM budgets WHERE user_id = ? ORDER BY period, category').all(userId),
  };
}

// ---------- API ----------

async function handleApi(req, res, url) {
  const method = req.method;
  const p = url.pathname;

  // Reject cross-site writes (the cookie is also SameSite=Strict).
  if (method !== 'GET' && req.headers.origin) {
    let host = null;
    try {
      host = new URL(req.headers.origin).host;
    } catch {}
    if (host !== req.headers.host) return fail(res, 403, 'Cross-site request blocked.');
  }

  const body = method === 'GET' ? {} : await readBody(req);

  if (method === 'GET' && p === '/api/meta') {
    return send(res, 200, {
      incomeCategories: INCOME_CATEGORIES,
      expenseCategories: EXPENSE_CATEGORIES,
      paymentMethods: PAYMENT_METHODS,
      overall: OVERALL,
      demo: { email: DEMO.email, password: DEMO.password },
    });
  }

  if (method === 'POST' && p === '/api/auth/register') {
    const fields = {};
    const name = cleanText(body.name, 80);
    const business = cleanText(body.business_name, 120);
    const email = cleanText(body.email, 120).toLowerCase();
    if (!name || name.length > 80) fields.name = 'Enter your name (max 80 characters).';
    if (!business || business.length > 120) fields.business_name = 'Enter your business name (max 120 characters).';
    if (!validEmail(email)) fields.email = 'Enter a valid email address.';
    else if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) fields.email = 'An account with this email already exists.';
    const pwProblem = passwordProblem(body.password);
    if (pwProblem) fields.password = pwProblem;
    if (Object.keys(fields).length) return fail(res, 422, 'Please fix the highlighted fields.', fields);

    const { lastInsertRowid } = db
      .prepare('INSERT INTO users (name, email, business_name, password_hash) VALUES (?, ?, ?, ?)')
      .run(name, email, business, hashPassword(body.password));
    const userId = Number(lastInsertRowid);
    if (body.sample_data) loadSampleData(userId);
    createSession(req, res, userId);
    return send(res, 201, userData(userId));
  }

  if (method === 'POST' && p === '/api/auth/login') {
    const ip = clientIp(req);
    if (tooManyFailures(ip)) return fail(res, 429, 'Too many failed attempts. Try again in 15 minutes.');
    const email = cleanText(body.email, 120).toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || typeof body.password !== 'string' || !verifyPassword(body.password, user.password_hash)) {
      recordFailure(ip);
      return fail(res, 401, 'Incorrect email or password.');
    }
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
    createSession(req, res, user.id);
    return send(res, 200, userData(user.id));
  }

  if (method === 'POST' && p === '/api/auth/logout') {
    clearSession(req, res);
    return send(res, 200, { ok: true });
  }

  // Everything below needs a signed-in user.
  const user = sessionUser(req);
  if (!user) return fail(res, 401, 'Please sign in.');
  const uid = user.id;

  // The demo login is public, so nobody may lock others out of it or deface its profile.
  const demoLocked = user.email === DEMO.email && (p === '/api/account/profile' || p === '/api/account/password' || (method === 'DELETE' && p === '/api/account'));
  if (demoLocked) return fail(res, 403, "The shared demo account can't change its profile or password, or be deleted. Create your own account for that.");

  if (method === 'GET' && (p === '/api/data' || p === '/api/auth/me')) return send(res, 200, userData(uid));

  if (method === 'POST' && p === '/api/transactions') {
    const { fields, value: v } = validateTransaction(body);
    if (Object.keys(fields).length) return fail(res, 422, 'Please fix the highlighted fields.', fields);
    db.prepare(
      'INSERT INTO transactions (user_id, type, category, amount, date, description, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(uid, v.type, v.category, v.amount, v.date, v.description, v.payment_method);
    return send(res, 201, userData(uid));
  }

  let m = p.match(/^\/api\/transactions\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(id, uid);
    if (!existing) return fail(res, 404, 'Transaction not found.');
    if (method === 'PUT') {
      const { fields, value: v } = validateTransaction(body);
      if (Object.keys(fields).length) return fail(res, 422, 'Please fix the highlighted fields.', fields);
      db.prepare(
        "UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ?, payment_method = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
      ).run(v.type, v.category, v.amount, v.date, v.description, v.payment_method, id, uid);
      return send(res, 200, userData(uid));
    }
    if (method === 'DELETE') {
      db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, uid);
      return send(res, 200, userData(uid));
    }
  }

  if (method === 'PUT' && p === '/api/budgets') {
    const { fields, value: v } = validateBudget(body);
    if (Object.keys(fields).length) return fail(res, 422, 'Please fix the highlighted fields.', fields);
    db.prepare(
      'INSERT INTO budgets (user_id, period, category, amount) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, period, category) DO UPDATE SET amount = excluded.amount'
    ).run(uid, v.period, v.category, v.amount);
    return send(res, 200, userData(uid));
  }

  m = p.match(/^\/api\/budgets\/(\d+)$/);
  if (m && method === 'DELETE') {
    const { changes } = db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(Number(m[1]), uid);
    if (!changes) return fail(res, 404, 'Budget not found.');
    return send(res, 200, userData(uid));
  }

  if (method === 'PUT' && p === '/api/account/profile') {
    const fields = {};
    const name = cleanText(body.name, 80);
    const business = cleanText(body.business_name, 120);
    const email = cleanText(body.email, 120).toLowerCase();
    const opening = parseMoney(body.opening_balance, { allowZero: true, allowNegative: true });
    if (!name || name.length > 80) fields.name = 'Enter your name (max 80 characters).';
    if (!business || business.length > 120) fields.business_name = 'Enter your business name (max 120 characters).';
    if (!validEmail(email)) fields.email = 'Enter a valid email address.';
    else if (db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, uid)) fields.email = 'Another account already uses this email.';
    if (opening === null) fields.opening_balance = 'Enter a number with up to 2 decimals.';
    if (Object.keys(fields).length) return fail(res, 422, 'Please fix the highlighted fields.', fields);
    db.prepare('UPDATE users SET name = ?, business_name = ?, email = ?, opening_balance = ? WHERE id = ?').run(name, business, email, opening, uid);
    return send(res, 200, userData(uid));
  }

  if (method === 'PUT' && p === '/api/account/password') {
    if (typeof body.current_password !== 'string' || !verifyPassword(body.current_password, user.password_hash)) {
      return fail(res, 422, 'Please fix the highlighted fields.', { current_password: 'Current password is incorrect.' });
    }
    const problem = passwordProblem(body.new_password);
    if (problem) return fail(res, 422, 'Please fix the highlighted fields.', { new_password: problem });
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(body.new_password), uid);
    // Sign out other devices, keep this one.
    const token = readCookie(req, 'sid');
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(uid, sha256(token));
    return send(res, 200, { ok: true });
  }

  if (method === 'POST' && p === '/api/account/sample-data') {
    loadSampleData(uid);
    return send(res, 200, userData(uid));
  }

  if (method === 'DELETE' && p === '/api/account/data') {
    transaction(() => {
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(uid);
      db.prepare('DELETE FROM budgets WHERE user_id = ?').run(uid);
    });
    return send(res, 200, userData(uid));
  }

  if (method === 'DELETE' && p === '/api/account') {
    if (typeof body.password !== 'string' || !verifyPassword(body.password, user.password_hash)) {
      return fail(res, 422, 'Please fix the highlighted fields.', { password: 'Password is incorrect.' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(uid);
    clearSession(req, res);
    return send(res, 200, { ok: true });
  }

  return fail(res, 404, 'Not found.');
}

// ---------- Static files ----------

const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
};

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join('; ');

function serveStatic(req, res, pathname) {
  const entry = STATIC[pathname];
  if (!entry || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  fs.readFile(path.join(ROOT, entry[0]), (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Could not read file');
    }
    res.writeHead(200, {
      'Content-Type': entry[1],
      'Cache-Control': 'no-cache',
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    serveStatic(req, res, url.pathname);
  } catch (err) {
    if (err.status) return fail(res, err.status, err.message);
    console.error(err);
    if (!res.headersSent) fail(res, 500, 'Something went wrong on the server.');
  }
});

// Addresses other devices on the same Wi-Fi can use.
function lanUrls(port) {
  return Object.values(require('node:os').networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal && /^(192\.168\.|10\.)/.test(a.address))
    .map((a) => `http://${a.address}:${port}`);
}

function printLinks(port) {
  console.log(`  This computer:            http://localhost:${port}`);
  for (const url of lanUrls(port)) console.log(`  Phone / other devices:    ${url}  (same Wi-Fi)`);
}

// If the port is busy: when it's this app already running, just show its links;
// otherwise move to the next free port.
async function listen(port, triesLeft) {
  server.removeAllListeners('error');
  server.once('error', async (err) => {
    if (err.code !== 'EADDRINUSE') throw err;
    try {
      const res = await fetch(`http://localhost:${port}/api/meta`, { signal: AbortSignal.timeout(1500) });
      if (res.ok && (await res.json()).expenseCategories) {
        console.log('Business Budget Tracker is already running. Open it here:');
        printLinks(port);
        process.exit(0);
      }
    } catch {}
    if (triesLeft <= 0) {
      console.error(`No free port found near ${PORT}. Close other apps or run: PORT=6000 npm start`);
      process.exit(1);
    }
    console.log(`Port ${port} is used by another app, trying ${port + 1}...`);
    listen(port + 1, triesLeft - 1);
  });
  server.listen(port);
}

server.once('listening', () => {
  console.log('Business Budget Tracker is running. Open it here:');
  printLinks(server.address().port);
  console.log('Keep this window open. Press Ctrl+C to stop.');
});

listen(PORT, 10);
