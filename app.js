'use strict';

// ---------- Small helpers ----------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  income: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  expense: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  budget: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  reports: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  arrowIn: '<line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/>',
  arrowOut: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  profit: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
};
const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

const COLORS = { income: '#10b981', expense: '#1e3a5f', net: '#f59e0b', grid: '#eef1f6' };
const PALETTE = ['#1e3a5f', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#64748b'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONEY_RE = /^\d{1,9}(\.\d{1,2})?$/;
const PESO_FMT = '"₱"#,##0.00;-"₱"#,##0.00';

const nf = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cf = new Intl.NumberFormat('en-PH', { notation: 'compact', maximumFractionDigits: 1 });
const peso = (c) => (c < 0 ? '-₱' : '₱') + nf.format(Math.abs(c) / 100);
const pesoShort = (c) => (c < 0 ? '-₱' : '₱') + cf.format(Math.abs(c) / 100);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);
const sum = (list) => list.reduce((a, t) => a + t.amount, 0);

// Dates are local 'YYYY-MM-DD' strings so they compare correctly as text.
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const todayStr = () => ymd(new Date());
const addDays = (s, n) => {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};
const weekStart = (s) => {
  const d = parseYmd(s);
  return addDays(s, -((d.getDay() + 6) % 7));
};
const shiftMonth = (key, n) => {
  const d = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthRange = (key) => {
  const last = new Date(+key.slice(0, 4), +key.slice(5, 7), 0).getDate();
  return [`${key}-01`, `${key}-${pad(last)}`];
};
const monthName = (key, short) =>
  new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, 1).toLocaleDateString('en-PH', { month: short ? 'short' : 'long', year: 'numeric' });
const fmtDate = (s) => parseYmd(s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const shortDate = (s) => parseYmd(s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

// ---------- State ----------

const now = new Date();
const state = {
  meta: null,
  user: null,
  tx: [],
  budgets: [],
  charts: {},
  tables: {},
  route: 'dashboard',
  view: {
    trend: 12,
    flowRange: { income: 'monthly', expense: 'monthly' },
    budgetPeriod: 'monthly',
    budgetMonth: now.getMonth() + 1,
    budgetYear: now.getFullYear(),
    report: { kind: 'monthly', month: now.getMonth() + 1, quarter: Math.floor(now.getMonth() / 3) + 1, year: now.getFullYear() },
  },
};

const PAGES = {
  dashboard: { title: 'Dashboard', icon: 'dashboard', render: renderDashboard },
  income: { title: 'Income', icon: 'income', render: (el) => renderFlowPage(el, 'income') },
  expenses: { title: 'Expenses', icon: 'expense', render: (el) => renderFlowPage(el, 'expense') },
  budgets: { title: 'Budget Planning', icon: 'budget', render: renderBudgets },
  reports: { title: 'Financial Reports', icon: 'reports', render: renderReports },
  transactions: { title: 'Transactions', icon: 'list', render: renderTransactions },
  settings: { title: 'Settings', icon: 'settings', render: renderSettings },
};

const catsFor = (type) => (type === 'income' ? state.meta.incomeCategories : state.meta.expenseCategories);
const catLabel = (c) => (c === state.meta.overall ? 'Overall spending' : c);

function txBetween(from, to, type, category) {
  return state.tx.filter((t) => t.date >= from && t.date <= to && (!type || t.type === type) && (!category || t.category === category));
}
const sumRange = (from, to, type, category) => sum(txBetween(from, to, type, category));

// ---------- API ----------

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (res.status === 401 && state.user && !url.startsWith('/api/auth')) {
    showAuth();
    toast('Your session ended. Please sign in again.', 'error');
  }
  if (!res.ok) {
    throw Object.assign(new Error(data?.error || `Request failed (${res.status}).`), { fields: data?.fields, status: res.status });
  }
  return data;
}

function setData(d) {
  state.user = d.user;
  state.tx = d.transactions;
  state.budgets = d.budgets;
  const initials = d.user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  $('#user-chip').innerHTML = `<span class="avatar">${esc(initials)}</span><div class="who"><strong>${esc(d.user.name)}</strong><span>${esc(d.user.business_name)}</span></div>`;
}

// Save something, then redraw the current page from fresh server data.
async function mutate(method, url, body, message) {
  setData(await api(method, url, body));
  renderPage(false);
  if (message) toast(message);
}

// ---------- Boot and shell ----------

document.addEventListener('DOMContentLoaded', boot);

async function boot() {
  try {
    state.meta = await api('GET', '/api/meta');
  } catch {
    // Usually means index.html was opened directly (file:// or a live-reload server) instead of through server.js.
    $('#boot').innerHTML = `<p class="muted" style="max-width:460px;text-align:center;padding:16px">Could not reach the budget server from <code>${esc(location.origin)}</code>.<br><br>
      Run <code>npm start</code> in the budget folder, then open <strong>http://localhost:5050</strong> on this computer,
      or <strong>http://&lt;this computer's IP&gt;:5050</strong> from another device on the same Wi-Fi.</p>`;
    return;
  }
  if (window.Chart) {
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    Chart.defaults.color = '#6b7a90';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
  }
  initShell();
  bindAuth();
  try {
    setData(await api('GET', '/api/data'));
    showApp();
  } catch {
    showAuth();
  }
  $('#boot').hidden = true;
}

function initShell() {
  $('#nav').innerHTML = Object.entries(PAGES)
    .map(([key, p]) => `<a class="nav-link" href="#/${key}" data-route="${key}" title="${p.title}">${icon(p.icon)}<span class="label">${p.title}</span>${
      key === 'budgets' ? '<span class="nav-badge" id="budget-badge" hidden></span>' : ''
    }</a>`)
    .join('');
  $('#collapse-btn').innerHTML = icon('chevronLeft');
  $('#menu-btn').innerHTML = icon('menu');
  $('#logout-btn').insertAdjacentHTML('afterbegin', icon('logout'));

  try {
    if (localStorage.getItem('sidebar-collapsed') === '1') document.body.classList.add('sidebar-collapsed');
  } catch {}
  $('#collapse-btn').addEventListener('click', () => {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    try {
      localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
    } catch {}
    setTimeout(() => Object.values(state.charts).forEach((c) => c.resize()), 280);
  });
  $('#menu-btn').addEventListener('click', () => document.body.classList.add('sidebar-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  $('#logout-btn').addEventListener('click', async () => {
    try {
      await api('POST', '/api/auth/logout');
    } catch {}
    showAuth();
    toast('Signed out.');
  });

  window.addEventListener('hashchange', () => state.user && route());

  // Shared buttons anywhere on the page.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !state.user) return;
    const { action, id } = btn.dataset;
    if (action === 'add-tx') openTxModal(null, btn.dataset.type);
    else if (action === 'edit-tx') openTxModal(state.tx.find((t) => t.id === Number(id)));
    else if (action === 'delete-tx') confirmDeleteTx(Number(id));
    else if (action === 'set-budget') openBudgetModal(btn.dataset.period, btn.dataset.category);
    else if (action === 'delete-budget') confirmDeleteBudget(Number(id));
  });
}

function showApp() {
  $('#auth-view').hidden = true;
  $('#app-view').hidden = false;
  if (!location.hash) history.replaceState(null, '', '#/dashboard');
  route();
}

function showAuth() {
  destroyCharts();
  state.user = null;
  state.tx = [];
  state.budgets = [];
  state.tables = {};
  $('#modal-root').innerHTML = '';
  $('#app-view').hidden = true;
  $('#auth-view').hidden = false;
  document.title = 'Sign in · BudgetBook';
}

function route() {
  const name = location.hash.replace(/^#\/?/, '');
  state.route = PAGES[name] ? name : 'dashboard';
  document.body.classList.remove('sidebar-open');
  renderPage(true);
  window.scrollTo(0, 0);
}

function renderPage(animate) {
  if (!state.user) return;
  destroyCharts();
  const page = PAGES[state.route];
  $('#page-title').textContent = page.title;
  $('#page-sub').textContent = state.user.business_name;
  document.title = `${page.title} · BudgetBook`;
  $$('#nav .nav-link').forEach((a) => a.classList.toggle('active', a.dataset.route === state.route));

  const type = state.route === 'income' ? 'income' : state.route === 'expenses' ? 'expense' : '';
  const add = $('#topbar-add');
  add.dataset.type = type;
  add.innerHTML = `${icon('plus')}<span class="label">${type === 'income' ? 'Add income' : type === 'expense' ? 'Add expense' : 'New transaction'}</span>`;

  const flagged = [...budgetUsage('monthly', todayStr().slice(0, 7)), ...budgetUsage('yearly', todayStr().slice(0, 4))].filter((u) => u.status !== 'ok');
  const badge = $('#budget-badge');
  badge.hidden = !flagged.length;
  badge.textContent = flagged.length;

  const el = $('#page');
  if (animate) {
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
  }
  page.render(el);
}

// ---------- Auth ----------

// Adds an eye button inside each password box that shows or hides what was typed.
function addPasswordToggles(form) {
  $$('input[type="password"]', form).forEach((input) => {
    const wrap = document.createElement('div');
    wrap.className = 'pw-wrap';
    input.replaceWith(wrap);
    wrap.append(input);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    wrap.append(btn);
    const set = (show) => {
      input.type = show ? 'text' : 'password';
      btn.innerHTML = icon(show ? 'eyeOff' : 'eye');
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.title = show ? 'Hide password' : 'Show password';
      btn.setAttribute('aria-pressed', String(show));
    };
    set(false);
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // keep the click from also focusing the input via its <label>
      set(input.type === 'password');
    });
    // Always hide again on submit, so the password isn't left visible after signing in.
    form.addEventListener('submit', () => set(false));
  });
}

function bindAuth() {
  addPasswordToggles($('#login-form'));
  addPasswordToggles($('#register-form'));

  $$('[data-auth-tab]').forEach((tab) =>
    tab.addEventListener('click', () => {
      $$('[data-auth-tab]').forEach((t) => t.classList.toggle('active', t === tab));
      $('#login-form').hidden = tab.dataset.authTab !== 'login';
      $('#register-form').hidden = tab.dataset.authTab !== 'register';
    })
  );

  $('#use-demo').addEventListener('click', () => {
    const f = $('#login-form');
    f.elements.email.value = state.meta.demo.email;
    f.elements.password.value = state.meta.demo.password;
    f.requestSubmit();
  });

  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const email = f.elements.email.value.trim();
    const password = f.elements.password.value;
    const fields = {};
    if (!email) fields.email = 'Enter your email.';
    if (!password) fields.password = 'Enter your password.';
    if (Object.keys(fields).length) return showFieldErrors(f, fields);
    withBusy(f, async () => {
      setData(await api('POST', '/api/auth/login', { email, password }));
      f.reset();
      showApp();
      toast(`Welcome back, ${state.user.name.split(' ')[0]}!`);
    });
  });

  $('#register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const v = {
      name: f.elements.name.value.trim(),
      business_name: f.elements.business_name.value.trim(),
      email: f.elements.email.value.trim(),
      password: f.elements.password.value,
      sample_data: f.elements.sample_data.checked,
    };
    const fields = {};
    if (!v.name) fields.name = 'Enter your name.';
    if (!v.business_name) fields.business_name = 'Enter your business name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) fields.email = 'Enter a valid email address.';
    const pw = passwordProblem(v.password);
    if (pw) fields.password = pw;
    else if (v.password !== f.elements.confirm.value) fields.confirm = 'Passwords do not match.';
    if (Object.keys(fields).length) return showFieldErrors(f, fields);
    withBusy(f, async () => {
      setData(await api('POST', '/api/auth/register', v));
      f.reset();
      f.elements.sample_data.checked = true;
      showApp();
      toast(`Account created. Welcome, ${state.user.name.split(' ')[0]}!`);
    });
  });
}

function passwordProblem(pw) {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Use at least one letter and one number.';
  return null;
}

// ---------- Forms, modals, toasts ----------

function showFieldErrors(form, fields = {}, message = '') {
  $$('.field', form).forEach((f) => {
    f.classList.remove('invalid');
    $('.err', f)?.remove();
  });
  for (const [name, msg] of Object.entries(fields)) {
    const field = form.elements[name]?.closest('.field');
    if (field) {
      field.classList.add('invalid');
      field.insertAdjacentHTML('beforeend', `<small class="err">${esc(msg)}</small>`);
    }
  }
  const box = $('[data-form-error]', form);
  if (box) box.textContent = message;
  const firstBad = $('.field.invalid input, .field.invalid select', form);
  if (firstBad) firstBad.focus();
}

async function withBusy(form, fn) {
  const btn = $('[type=submit]', form);
  btn.disabled = true;
  showFieldErrors(form);
  try {
    await fn();
  } catch (err) {
    showFieldErrors(form, err.fields || {}, err.message);
  } finally {
    btn.disabled = false;
  }
}

const invalid = (fields) => Object.assign(new Error('Please fix the highlighted fields.'), { fields });

function openModal({ title, body, footer, onSubmit }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<form class="modal" novalidate role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="modal-body"><div class="form-error" data-form-error></div>${body}</div>
    <div class="modal-foot">${footer}</div></form>`;
  $('#modal-root').appendChild(overlay);
  const form = $('form', overlay);
  const onKey = (e) => e.key === 'Escape' && close();
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('mousedown', (e) => e.target === overlay && close());
  $$('[data-close]', overlay).forEach((b) => b.addEventListener('click', close));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    withBusy(form, () => onSubmit(form, close));
  });
  setTimeout(() => $('input:not([type=hidden]), select, button[type=submit]', form)?.focus(), 50);
  return form;
}

function confirmModal({ title, message, confirmLabel, onConfirm }) {
  openModal({
    title,
    body: `<p style="margin:0">${message}</p>`,
    footer: `<button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-danger">${esc(confirmLabel)}</button>`,
    onSubmit: async (form, close) => {
      await onConfirm();
      close();
    },
  });
}

function toast(message, kind = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.innerHTML = `${icon(kind === 'success' ? 'check' : 'alert')}<span>${esc(message)}</span>`;
  $('#toast-root').appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

// ---------- Transactions: add / edit / delete ----------

function validateTx(v) {
  const fields = {};
  if (!MONEY_RE.test(v.amount) || Number(v.amount) <= 0) fields.amount = 'Enter an amount above ₱0 with up to 2 decimals.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || v.date < '2000-01-01' || v.date > '2099-12-31') fields.date = 'Enter a valid date.';
  if (!catsFor(v.type).includes(v.category)) fields.category = 'Choose a category.';
  if (!state.meta.paymentMethods.includes(v.payment_method)) fields.payment_method = 'Choose a payment method.';
  if (!v.description) fields.description = 'Add a short description.';
  return fields;
}

function openTxModal(tx, presetType) {
  const t = tx
    ? { ...tx, amount: (tx.amount / 100).toFixed(2) }
    : { type: presetType || 'expense', amount: '', date: todayStr(), category: '', payment_method: 'Cash', description: '' };
  const methods = state.meta.paymentMethods.map((m) => `<option ${m === t.payment_method ? 'selected' : ''}>${esc(m)}</option>`).join('');
  const form = openModal({
    title: tx ? 'Edit transaction' : 'New transaction',
    body: `
      <div class="seg block">
        <button type="button" data-set-type="income" class="income ${t.type === 'income' ? 'active' : ''}">Income</button>
        <button type="button" data-set-type="expense" class="expense ${t.type === 'expense' ? 'active' : ''}">Expense</button>
      </div>
      <input type="hidden" name="type" value="${t.type}">
      <div class="grid-2">
        <label class="field"><span>Amount</span><div class="money-input"><input name="amount" inputmode="decimal" placeholder="0.00" autocomplete="off" value="${esc(t.amount)}"></div></label>
        <label class="field"><span>Date</span><input name="date" type="date" value="${esc(t.date)}"></label>
      </div>
      <div class="grid-2">
        <label class="field"><span>Category</span><select name="category"></select></label>
        <label class="field"><span data-method-label></span><select name="payment_method">${methods}</select></label>
      </div>
      <label class="field"><span>Description</span><input name="description" maxlength="200" placeholder="e.g. Coffee beans restock" value="${esc(t.description)}"></label>`,
    footer: `<button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary">${tx ? 'Save changes' : 'Add transaction'}</button>`,
    onSubmit: async (form, close) => {
      const v = Object.fromEntries(new FormData(form));
      v.amount = String(v.amount).replace(/,/g, '').trim();
      v.description = String(v.description).trim();
      const fields = validateTx(v);
      if (Object.keys(fields).length) throw invalid(fields);
      setData(await api(tx ? 'PUT' : 'POST', tx ? `/api/transactions/${tx.id}` : '/api/transactions', v));
      close();
      renderPage(false);
      const cents = Math.round(Number(v.amount) * 100);
      toast(tx ? 'Transaction updated.' : `${v.type === 'income' ? 'Income' : 'Expense'} of ${peso(cents)} added.`);
      if (v.type === 'expense') warnIfOverBudget(v.category, v.date);
    },
  });

  const fillCategories = (type, selected) => {
    form.elements.category.innerHTML =
      '<option value="">Select category</option>' + catsFor(type).map((c) => `<option ${c === selected ? 'selected' : ''}>${esc(c)}</option>`).join('');
    $('[data-method-label]', form).textContent = type === 'income' ? 'Received via' : 'Payment method';
  };
  fillCategories(t.type, t.category);
  $$('[data-set-type]', form).forEach((b) =>
    b.addEventListener('click', () => {
      $$('[data-set-type]', form).forEach((x) => x.classList.toggle('active', x === b));
      form.elements.type.value = b.dataset.setType;
      fillCategories(b.dataset.setType, '');
    })
  );
}

function warnIfOverBudget(category, date) {
  const hits = budgetUsage('monthly', date.slice(0, 7)).filter((u) => (u.category === category || u.category === state.meta.overall) && u.status !== 'ok');
  for (const u of hits) {
    toast(`${catLabel(u.category)} is at ${Math.round(u.pct)}% of its ${monthName(date.slice(0, 7))} budget.`, u.status === 'over' ? 'error' : 'warn');
  }
}

function confirmDeleteTx(id) {
  const t = state.tx.find((x) => x.id === id);
  if (!t) return;
  confirmModal({
    title: 'Delete transaction?',
    message: `This permanently removes <strong>${esc(t.description)}</strong> (${peso(t.amount)}, ${fmtDate(t.date)}).`,
    confirmLabel: 'Delete',
    onConfirm: () => mutate('DELETE', `/api/transactions/${id}`, null, 'Transaction deleted.'),
  });
}

// ---------- Budgets ----------

function budgetUsage(period, key) {
  const [from, to] = period === 'monthly' ? monthRange(key) : [`${key}-01-01`, `${key}-12-31`];
  const expenses = txBetween(from, to, 'expense');
  return state.budgets
    .filter((b) => b.period === period)
    .map((b) => {
      const spent = sum(b.category === state.meta.overall ? expenses : expenses.filter((t) => t.category === b.category));
      const p = pct(spent, b.amount);
      return { ...b, spent, remaining: b.amount - spent, pct: p, status: p >= 100 ? 'over' : p >= 80 ? 'warn' : 'ok' };
    })
    .sort((a, b) => (a.category === state.meta.overall ? -1 : b.category === state.meta.overall ? 1 : a.category.localeCompare(b.category)));
}

const statusLabel = (u) => (u.pct > 100 ? 'Over budget' : u.pct >= 100 ? 'Limit reached' : u.pct >= 80 ? 'Near limit' : 'On track');

function progressBar(u, large) {
  return `<div class="progress ${u.status} ${large ? 'lg' : ''}"><span data-w="${Math.min(u.pct, 100).toFixed(1)}"></span></div>`;
}

// Animate progress bars from 0 to their value after they are on screen.
function animateBars(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.progress > span[data-w]', root).forEach((s) => (s.style.width = `${s.dataset.w}%`))));
}

function openBudgetModal(period = 'monthly', category = '') {
  const find = (p, c) => state.budgets.find((b) => b.period === p && b.category === c);
  const existing = find(period, category);
  const options = [state.meta.overall, ...state.meta.expenseCategories]
    .map((c) => `<option value="${esc(c)}" ${c === category ? 'selected' : ''}>${esc(catLabel(c))}</option>`)
    .join('');
  const form = openModal({
    title: existing ? 'Edit budget limit' : 'Set budget limit',
    body: `
      <div class="grid-2">
        <label class="field"><span>Period</span><select name="period">
          <option value="monthly" ${period === 'monthly' ? 'selected' : ''}>Every month</option>
          <option value="yearly" ${period === 'yearly' ? 'selected' : ''}>Every year</option></select></label>
        <label class="field"><span>Applies to</span><select name="category"><option value="">Select category</option>${options}</select></label>
      </div>
      <label class="field"><span>Spending limit</span><div class="money-input"><input name="amount" inputmode="decimal" placeholder="0.00" autocomplete="off" value="${existing ? (existing.amount / 100).toFixed(2) : ''}"></div></label>
      <p class="hint">You'll see a warning at 80% of the limit and an alert when it's exceeded.</p>`,
    footer: `<button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-primary">Save budget</button>`,
    onSubmit: async (form, close) => {
      const v = Object.fromEntries(new FormData(form));
      v.amount = String(v.amount).replace(/,/g, '').trim();
      const fields = {};
      if (!v.category) fields.category = 'Choose what this limit applies to.';
      if (!MONEY_RE.test(v.amount) || Number(v.amount) <= 0) fields.amount = 'Enter a limit above ₱0 with up to 2 decimals.';
      if (Object.keys(fields).length) throw invalid(fields);
      setData(await api('PUT', '/api/budgets', v));
      close();
      renderPage(false);
      toast(`${catLabel(v.category)} budget saved.`);
    },
  });
  // Show the current limit when the user picks a combination that already has one.
  const prefill = () => {
    const b = find(form.elements.period.value, form.elements.category.value);
    if (b) form.elements.amount.value = (b.amount / 100).toFixed(2);
  };
  form.elements.period.addEventListener('change', prefill);
  form.elements.category.addEventListener('change', prefill);
}

function confirmDeleteBudget(id) {
  const b = state.budgets.find((x) => x.id === id);
  if (!b) return;
  confirmModal({
    title: 'Remove budget limit?',
    message: `The ${b.period} limit of <strong>${peso(b.amount)}</strong> for <strong>${esc(catLabel(b.category))}</strong> will be removed. Your transactions are not affected.`,
    confirmLabel: 'Remove',
    onConfirm: () => mutate('DELETE', `/api/budgets/${id}`, null, 'Budget limit removed.'),
  });
}

// ---------- Charts ----------

function destroyCharts() {
  Object.values(state.charts).forEach((c) => c.destroy());
  state.charts = {};
}

function chartBox(id, hasData, emptyText, small) {
  return `<div class="chart-box ${small ? 'sm' : ''}">${hasData ? `<canvas id="${id}"></canvas>` : `<div class="chart-empty">${emptyText}</div>`}</div>`;
}

function chart(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (!window.Chart) {
    canvas.insertAdjacentHTML('afterend', '<div class="chart-empty">Charts need an internet connection to load.</div>');
    canvas.remove();
    return;
  }
  state.charts[id] = new Chart(canvas, config);
}

function moneyAxes(horizontal) {
  const value = { grid: { color: COLORS.grid }, border: { display: false }, ticks: { callback: (v) => pesoShort(v * 100) } };
  const label = { grid: { display: false }, border: { display: false } };
  return horizontal ? { x: value, y: label } : { x: label, y: value };
}

const moneyTooltip = (horizontal) => ({
  callbacks: { label: (c) => `${c.dataset.label}: ${peso(Math.round((horizontal ? c.parsed.x : c.parsed.y) * 100))}` },
});

// Income and expense bars with a net profit line.
function flowChart(id, buckets) {
  chart(id, {
    type: 'bar',
    data: {
      labels: buckets.map((b) => b.label),
      datasets: [
        { type: 'line', label: 'Net profit', data: buckets.map((b) => (b.income - b.expense) / 100), borderColor: COLORS.net, backgroundColor: COLORS.net, borderWidth: 2, pointRadius: 3, tension: 0.35, order: 0 },
        { label: 'Income', data: buckets.map((b) => b.income / 100), backgroundColor: COLORS.income, borderRadius: 6, maxBarThickness: 26, order: 1 },
        { label: 'Expenses', data: buckets.map((b) => b.expense / 100), backgroundColor: COLORS.expense, borderRadius: 6, maxBarThickness: 26, order: 1 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' }, tooltip: moneyTooltip() },
      scales: moneyAxes(),
    },
  });
}

function doughnutChart(id, entries) {
  const total = entries.reduce((a, e) => a + e.amount, 0);
  chart(id, {
    type: 'doughnut',
    data: {
      labels: entries.map((e) => e.category),
      datasets: [{ data: entries.map((e) => e.amount / 100), backgroundColor: PALETTE, borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '66%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: (c) => `${c.label}: ${peso(Math.round(c.parsed * 100))} (${pct(c.parsed * 100, total).toFixed(1)}%)` } },
      },
    },
  });
}

function byCategory(list) {
  const map = new Map();
  for (const t of list) map.set(t.category, (map.get(t.category) || 0) + t.amount);
  return [...map].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

function withTotals(ranges) {
  return ranges.map((r) => ({ ...r, income: sumRange(r.from, r.to, 'income'), expense: sumRange(r.from, r.to, 'expense') }));
}

function lastMonths(n) {
  const cur = todayStr().slice(0, 7);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = shiftMonth(cur, -i);
    const [from, to] = monthRange(key);
    out.push({ key, label: monthName(key, true), from, to });
  }
  return out;
}

function minYear() {
  let min = new Date().getFullYear();
  for (const t of state.tx) min = Math.min(min, Number(t.date.slice(0, 4)));
  return min;
}

function yearOptions(selected) {
  const out = [];
  for (let y = new Date().getFullYear() + 1; y >= minYear(); y--) out.push(`<option value="${y}" ${y === selected ? 'selected' : ''}>${y}</option>`);
  return out.join('');
}

const monthOptions = (selected) => MONTHS.map((m, i) => `<option value="${i + 1}" ${i + 1 === selected ? 'selected' : ''}>${m}</option>`).join('');

function statCard({ label, value, sub = '', iconName, tone, highlight }) {
  return `<div class="card stat ${highlight ? 'highlight' : ''}">
    <div class="stat-top"><span>${label}</span><span class="stat-icon ${tone}">${icon(iconName)}</span></div>
    <div class="stat-value" title="${esc(value)}">${value}</div>
    <div class="stat-sub">${sub}</div></div>`;
}

function deltaText(cur, prev, lowerIsBetter) {
  if (!prev) return '';
  const d = ((cur - prev) / Math.abs(prev)) * 100;
  const good = lowerIsBetter ? d <= 0 : d >= 0;
  return `<span class="delta ${good ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(1)}%</span>`;
}

function emptyState(title, text, button = '') {
  return `<div class="empty"><strong>${title}</strong>${text}${button ? `<div style="margin-top:12px">${button}</div>` : ''}</div>`;
}

function txListItem(t) {
  return `<div class="list-item">
    <span class="tx-icon ${t.type}">${icon(t.type === 'income' ? 'arrowIn' : 'arrowOut')}</span>
    <div class="grow"><strong>${esc(t.description)}</strong><span>${esc(t.category)} · ${fmtDate(t.date)}</span></div>
    <span class="num amount-${t.type}">${t.type === 'income' ? '+' : '−'}${peso(t.amount)}</span></div>`;
}

// ---------- Dashboard ----------

function renderDashboard(el) {
  const today = todayStr();
  const mk = today.slice(0, 7);
  const [mFrom, mTo] = monthRange(mk);
  // Compare against the same days of last month so a half-finished month isn't judged against a full one.
  const prevKey = shiftMonth(mk, -1);
  const [pFrom, pEndOfMonth] = monthRange(prevKey);
  const pTo = `${prevKey}-${pad(Math.min(Number(today.slice(8)), Number(pEndOfMonth.slice(8))))}`;

  const inc = sumRange(mFrom, mTo, 'income');
  const exp = sumRange(mFrom, mTo, 'expense');
  const pInc = sumRange(pFrom, pTo, 'income');
  const pExp = sumRange(pFrom, pTo, 'expense');
  const net = inc - exp;
  const allIn = sum(state.tx.filter((t) => t.type === 'income'));
  const allOut = sum(state.tx.filter((t) => t.type === 'expense'));
  const balance = state.user.opening_balance + allIn - allOut;

  const usage = budgetUsage('monthly', mk);
  const flagged = [...usage, ...budgetUsage('yearly', today.slice(0, 4))].filter((u) => u.status !== 'ok');
  const over = flagged.filter((u) => u.status === 'over');

  const months = withTotals(lastMonths(state.view.trend));
  const summary = withTotals(lastMonths(6)).reverse();
  const monthExpenses = byCategory(txBetween(mFrom, mTo, 'expense'));
  const recent = state.tx.slice(0, 7);

  const alert = flagged.length
    ? `<div class="alert ${over.length ? 'over' : 'warn'}">${icon('alert')}<div>
        <strong>${over.length ? `${over.length} budget${over.length > 1 ? 's' : ''} exceeded` : 'Budgets nearing their limits'}</strong>
        <ul>${flagged.map((u) => `<li>${esc(catLabel(u.category))} (${u.period}): ${peso(u.spent)} of ${peso(u.amount)} — ${Math.round(u.pct)}%</li>`).join('')}</ul>
        <a href="#/budgets">Review budgets →</a></div></div>`
    : '';

  el.innerHTML = `
    ${alert}
    <div class="grid stats">
      ${statCard({ label: 'Business balance', value: peso(balance), sub: `Opening ${peso(state.user.opening_balance)} + all income − all expenses`, iconName: 'wallet', tone: 'navy', highlight: true })}
      ${statCard({ label: `Income · ${MONTHS[now.getMonth()]}`, value: peso(inc), sub: `${deltaText(inc, pInc)} vs same days last month`, iconName: 'income', tone: 'green' })}
      ${statCard({ label: `Expenses · ${MONTHS[now.getMonth()]}`, value: peso(exp), sub: `${deltaText(exp, pExp, true)} vs same days last month`, iconName: 'expense', tone: 'red' })}
      ${statCard({ label: 'Net profit this month', value: peso(net), sub: inc ? `Profit margin <strong class="${net >= 0 ? 'up' : 'down'}">${pct(net, inc).toFixed(1)}%</strong>` : 'No income recorded yet', iconName: 'profit', tone: net >= 0 ? 'green' : 'red' })}
    </div>

    <div class="grid cols-2">
      <div class="card">
        <div class="card-head"><div><h2>Income vs expenses</h2><span class="muted">Monthly totals with net profit</span></div>
          <div class="seg" data-trend-seg>${[6, 12].map((n) => `<button data-trend="${n}" class="${state.view.trend === n ? 'active' : ''}">${n} months</button>`).join('')}</div></div>
        ${chartBox('dash-flow', state.tx.length, 'Add transactions to see your trend.')}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Budget usage</h2><span class="muted">${monthName(mk)}</span></div><a href="#/budgets" class="btn btn-ghost btn-sm">Manage</a></div>
        ${
          usage.length
            ? usage.map((u) => `<div class="budget-row"><div class="budget-row-top"><strong>${esc(catLabel(u.category))}</strong><span>${peso(u.spent)} / ${peso(u.amount)}</span></div>${progressBar(u)}</div>`).join('')
            : emptyState('No monthly budgets yet', 'Set limits to track spending against plan.', `<button class="btn btn-primary btn-sm" data-action="set-budget" data-period="monthly">${icon('plus')} Set a budget</button>`)
        }
      </div>
    </div>

    <div class="grid cols-2">
      <div class="card">
        <div class="card-head"><h2>Recent transactions</h2><a href="#/transactions" class="btn btn-ghost btn-sm">View all</a></div>
        ${recent.length ? recent.map(txListItem).join('') : emptyState('No transactions yet', 'Record your first income or expense.', `<button class="btn btn-primary btn-sm" data-action="add-tx">${icon('plus')} New transaction</button>`)}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Where money went</h2><span class="muted">Expenses in ${MONTHS[now.getMonth()]}</span></div></div>
        ${chartBox('dash-cats', monthExpenses.length, 'No expenses this month yet.', true)}
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div><h2>Monthly summary</h2><span class="muted">Last 6 months</span></div><a href="#/reports" class="btn btn-ghost btn-sm">Full reports</a></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Month</th><th class="num">Income</th><th class="num">Expenses</th><th class="num">Net profit</th><th class="num">Margin</th></tr></thead>
        <tbody>${summary
          .map((m) => {
            const n = m.income - m.expense;
            return `<tr><td>${monthName(m.key)}</td><td class="num amount-income">${peso(m.income)}</td><td class="num">${peso(m.expense)}</td>
              <td class="num ${n >= 0 ? 'up' : 'down'}"><strong>${peso(n)}</strong></td><td class="num">${m.income ? `${pct(n, m.income).toFixed(1)}%` : '—'}</td></tr>`;
          })
          .join('')}</tbody>
      </table></div>
    </div>`;

  flowChart('dash-flow', months);
  doughnutChart('dash-cats', monthExpenses);
  animateBars(el);
  $$('[data-trend]', el).forEach((b) =>
    b.addEventListener('click', () => {
      state.view.trend = Number(b.dataset.trend);
      renderPage(false);
    })
  );
}

// ---------- Income / Expenses pages ----------

function flowRanges(range) {
  const today = todayStr();
  if (range === 'daily') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = addDays(today, i - 29);
      return { label: shortDate(d), from: d, to: d };
    });
  }
  if (range === 'weekly') {
    const ws = weekStart(today);
    return Array.from({ length: 12 }, (_, i) => {
      const from = addDays(ws, (i - 11) * 7);
      return { label: shortDate(from), from, to: addDays(from, 6) };
    });
  }
  if (range === 'yearly') {
    const out = [];
    for (let y = minYear(); y <= now.getFullYear(); y++) out.push({ label: String(y), from: `${y}-01-01`, to: `${y}-12-31` });
    return out;
  }
  return lastMonths(12);
}

const RANGE_TEXT = { daily: 'last 30 days', weekly: 'last 12 weeks', monthly: 'last 12 months', yearly: 'all years' };

function renderFlowPage(el, type) {
  const isIncome = type === 'income';
  const word = isIncome ? 'Income' : 'Expenses';
  const today = todayStr();
  const ws = weekStart(today);
  const [mFrom, mTo] = monthRange(today.slice(0, 7));
  const y = today.slice(0, 4);
  const range = state.view.flowRange[type];
  const buckets = flowRanges(range).map((r) => ({ ...r, amount: sumRange(r.from, r.to, type) }));
  const windowFrom = buckets[0].from;
  const windowTo = buckets[buckets.length - 1].to;
  const cats = byCategory(txBetween(windowFrom, windowTo, type));
  const tone = isIncome ? 'green' : 'red';

  el.innerHTML = `
    <div class="grid stats">
      ${statCard({ label: 'Today', value: peso(sumRange(today, today, type)), sub: fmtDate(today), iconName: 'calendar', tone })}
      ${statCard({ label: 'This week', value: peso(sumRange(ws, addDays(ws, 6), type)), sub: `${shortDate(ws)} – ${shortDate(addDays(ws, 6))}`, iconName: 'calendar', tone })}
      ${statCard({ label: 'This month', value: peso(sumRange(mFrom, mTo, type)), sub: MONTHS[now.getMonth()], iconName: isIncome ? 'income' : 'expense', tone })}
      ${statCard({ label: 'This year', value: peso(sumRange(`${y}-01-01`, `${y}-12-31`, type)), sub: y, iconName: 'profit', tone: 'navy', highlight: true })}
    </div>
    <div class="grid cols-2">
      <div class="card">
        <div class="card-head"><div><h2>${word} over time</h2><span class="muted">Totals for the ${RANGE_TEXT[range]}</span></div>
          <div class="seg">${['daily', 'weekly', 'monthly', 'yearly'].map((r) => `<button data-range="${r}" class="${r === range ? 'active' : ''}">${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</div></div>
        ${chartBox(`${type}-trend`, true)}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>${isIncome ? 'Income by source' : 'Expenses by category'}</h2><span class="muted">${RANGE_TEXT[range]}</span></div></div>
        ${chartBox(`${type}-cats`, cats.length, `No ${word.toLowerCase()} in this window.`, true)}
      </div>
    </div>
    ${explorerHtml(type, type)}`;

  chart(`${type}-trend`, {
    type: 'bar',
    data: { labels: buckets.map((b) => b.label), datasets: [{ label: word, data: buckets.map((b) => b.amount / 100), backgroundColor: isIncome ? COLORS.income : COLORS.expense, borderRadius: 6, maxBarThickness: 32 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: moneyTooltip() }, scales: moneyAxes() },
  });
  doughnutChart(`${type}-cats`, cats);
  $$('[data-range]', el).forEach((b) =>
    b.addEventListener('click', () => {
      state.view.flowRange[type] = b.dataset.range;
      renderPage(false);
    })
  );
  bindExplorer(type, type);
}

// ---------- Transaction table with search, filters, sorting ----------

function tableState(key, fixedType) {
  state.tables[key] ||= { q: '', type: fixedType || '', category: '', from: '', to: '', sort: 'date', dir: 'desc', page: 1, size: 15 };
  return state.tables[key];
}

function categoryOptions(type, selected) {
  const groups = type ? [[type, catsFor(type)]] : [['income', catsFor('income')], ['expense', catsFor('expense')]];
  return (
    '<option value="">All categories</option>' +
    groups
      .map(([g, cats]) => `<optgroup label="${g === 'income' ? 'Income' : 'Expenses'}">${cats.map((c) => `<option ${c === selected ? 'selected' : ''}>${esc(c)}</option>`).join('')}</optgroup>`)
      .join('')
  );
}

function explorerHtml(key, fixedType) {
  const f = tableState(key, fixedType);
  const title = fixedType === 'income' ? 'Income records' : fixedType === 'expense' ? 'Expense records' : 'All transactions';
  const addLabel = fixedType === 'income' ? 'Add income' : fixedType === 'expense' ? 'Add expense' : 'New transaction';
  return `<div class="card" id="ex-${key}">
    <div class="card-head"><h2>${title}</h2><button class="btn btn-primary btn-sm" data-action="add-tx" data-type="${fixedType || ''}">${icon('plus')} ${addLabel}</button></div>
    <div class="toolbar">
      <label class="grow">Search<div class="search">${icon('search')}<input class="input" data-f="q" placeholder="Description, category, method or amount" value="${esc(f.q)}"></div></label>
      ${fixedType ? '' : `<label>Type<select class="select" data-f="type"><option value="">All types</option>
        <option value="income" ${f.type === 'income' ? 'selected' : ''}>Income</option><option value="expense" ${f.type === 'expense' ? 'selected' : ''}>Expense</option></select></label>`}
      <label>Category<select class="select" data-f="category">${categoryOptions(f.type, f.category)}</select></label>
      <label>From<input class="input" type="date" data-f="from" value="${esc(f.from)}"></label>
      <label>To<input class="input" type="date" data-f="to" value="${esc(f.to)}"></label>
      <button class="btn btn-ghost" data-reset type="button">Reset</button>
    </div>
    <div data-results></div>
  </div>`;
}

function filteredTx(f) {
  const q = f.q.trim().toLowerCase();
  const list = state.tx.filter(
    (t) =>
      (!f.type || t.type === f.type) &&
      (!f.category || t.category === f.category) &&
      (!f.from || t.date >= f.from) &&
      (!f.to || t.date <= f.to) &&
      (!q || `${t.description} ${t.category} ${t.payment_method} ${(t.amount / 100).toFixed(2)}`.toLowerCase().includes(q))
  );
  const dir = f.dir === 'asc' ? 1 : -1;
  return list.sort((a, b) => {
    const c = f.sort === 'amount' ? a.amount - b.amount : String(a[f.sort]).localeCompare(String(b[f.sort]));
    return (c || a.id - b.id) * dir;
  });
}

function explorerResults(key, fixedType) {
  const f = state.tables[key];
  if (f.from && f.to && f.from > f.to) return emptyState('Check the date range', 'The "From" date is after the "To" date.');
  const list = filteredTx(f);
  const pages = Math.max(1, Math.ceil(list.length / f.size));
  f.page = Math.min(f.page, pages);
  const rows = list.slice((f.page - 1) * f.size, f.page * f.size);
  const cols = [['date', 'Date'], ['description', 'Description'], ['category', 'Category'], !fixedType && ['type', 'Type'], ['payment_method', 'Method'], ['amount', 'Amount', 'num']].filter(Boolean);

  if (!list.length) {
    return state.tx.length
      ? emptyState('No matches', 'No transactions match these filters.')
      : emptyState('No transactions yet', 'Records you add will show up here.');
  }
  const inc = sum(list.filter((t) => t.type === 'income'));
  const exp = sum(list.filter((t) => t.type === 'expense'));
  return `<div class="table-wrap"><table>
    <thead><tr>${cols
      .map(([k, label, cls = '']) => `<th class="sortable ${cls} ${f.sort === k ? 'sorted' : ''}" data-sort="${k}">${label} ${f.sort === k ? (f.dir === 'asc' ? '▲' : '▼') : ''}</th>`)
      .join('')}<th class="actions"><span class="sr-only"></span></th></tr></thead>
    <tbody>${rows
      .map(
        (t) => `<tr>
        <td style="white-space:nowrap">${fmtDate(t.date)}</td>
        <td class="desc"><strong title="${esc(t.description)}">${esc(t.description)}</strong></td>
        <td>${esc(t.category)}</td>
        ${fixedType ? '' : `<td><span class="badge ${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</span></td>`}
        <td>${esc(t.payment_method)}</td>
        <td class="num amount-${t.type}">${t.type === 'income' ? '+' : '−'}${peso(t.amount)}</td>
        <td class="actions"><button class="icon-btn" data-action="edit-tx" data-id="${t.id}" title="Edit" aria-label="Edit">${icon('edit')}</button><button class="icon-btn danger" data-action="delete-tx" data-id="${t.id}" title="Delete" aria-label="Delete">${icon('trash')}</button></td>
      </tr>`
      )
      .join('')}</tbody></table></div>
    <div class="table-foot">
      <span class="summary-line"><strong>${list.length}</strong> record${list.length === 1 ? '' : 's'}${fixedType !== 'expense' ? ` · In <strong class="up">${peso(inc)}</strong>` : ''}${fixedType !== 'income' ? ` · Out <strong>${peso(exp)}</strong>` : ''}${fixedType ? '' : ` · Net <strong class="${inc - exp >= 0 ? 'up' : 'down'}">${peso(inc - exp)}</strong>`}</span>
      <div class="pager"><button class="btn btn-ghost btn-sm" data-page="prev" ${f.page <= 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${f.page} of ${pages}</span>
        <button class="btn btn-ghost btn-sm" data-page="next" ${f.page >= pages ? 'disabled' : ''}>Next</button></div>
    </div>`;
}

function bindExplorer(key, fixedType) {
  const root = $(`#ex-${key}`);
  const f = state.tables[key];
  const draw = () => ($('[data-results]', root).innerHTML = explorerResults(key, fixedType));
  $$('[data-f]', root).forEach((input) => {
    const evt = input.tagName === 'INPUT' && input.type !== 'date' ? 'input' : 'change';
    input.addEventListener(evt, () => {
      f[input.dataset.f] = input.value;
      f.page = 1;
      if (input.dataset.f === 'type') {
        if (f.category && f.type && !catsFor(f.type).includes(f.category)) f.category = '';
        $('[data-f="category"]', root).innerHTML = categoryOptions(f.type, f.category);
      }
      draw();
    });
  });
  root.addEventListener('click', (e) => {
    const th = e.target.closest('[data-sort]');
    const pg = e.target.closest('[data-page]');
    if (th) {
      const k = th.dataset.sort;
      f.dir = f.sort === k ? (f.dir === 'asc' ? 'desc' : 'asc') : k === 'date' || k === 'amount' ? 'desc' : 'asc';
      f.sort = k;
      draw();
    } else if (pg) {
      f.page += pg.dataset.page === 'next' ? 1 : -1;
      draw();
    } else if (e.target.closest('[data-reset]')) {
      delete state.tables[key];
      root.outerHTML = explorerHtml(key, fixedType);
      bindExplorer(key, fixedType);
    }
  });
  draw();
}

function renderTransactions(el) {
  const inc = sum(state.tx.filter((t) => t.type === 'income'));
  const exp = sum(state.tx.filter((t) => t.type === 'expense'));
  el.innerHTML = `
    <div class="grid stats">
      ${statCard({ label: 'Total records', value: state.tx.length.toLocaleString('en-PH'), sub: 'Income and expense entries', iconName: 'list', tone: 'navy' })}
      ${statCard({ label: 'All-time income', value: peso(inc), sub: `${state.tx.filter((t) => t.type === 'income').length} entries`, iconName: 'income', tone: 'green' })}
      ${statCard({ label: 'All-time expenses', value: peso(exp), sub: `${state.tx.filter((t) => t.type === 'expense').length} entries`, iconName: 'expense', tone: 'red' })}
      ${statCard({ label: 'All-time net', value: peso(inc - exp), sub: 'Income minus expenses', iconName: 'profit', tone: 'navy', highlight: true })}
    </div>
    ${explorerHtml('all', '')}`;
  bindExplorer('all', '');
}

// ---------- Budget planning page ----------

function renderBudgets(el) {
  const v = state.view;
  const period = v.budgetPeriod;
  const key = period === 'monthly' ? `${v.budgetYear}-${pad(v.budgetMonth)}` : String(v.budgetYear);
  const [from, to] = period === 'monthly' ? monthRange(key) : [`${key}-01-01`, `${key}-12-31`];
  const label = period === 'monthly' ? monthName(key) : key;
  const usage = budgetUsage(period, key);
  const overall = usage.find((u) => u.category === state.meta.overall);
  const catUsage = usage.filter((u) => u !== overall);
  const spent = sumRange(from, to, 'expense');
  const catLimitSum = catUsage.reduce((a, u) => a + u.amount, 0);
  const limit = overall ? overall.amount : catLimitSum;
  const remaining = limit - spent;
  const used = pct(spent, limit);
  const flagged = usage.filter((u) => u.status !== 'ok');

  const rows = [state.meta.overall, ...state.meta.expenseCategories].map((c) => {
    const u = usage.find((x) => x.category === c);
    const catSpent = c === state.meta.overall ? spent : sumRange(from, to, 'expense', c);
    if (!u) {
      return `<tr><td><strong>${esc(catLabel(c))}</strong></td><td class="num muted">No limit</td><td class="num">${peso(catSpent)}</td><td class="num muted">—</td>
        <td style="min-width:140px"><span class="badge none">Not set</span></td>
        <td class="actions"><button class="btn btn-ghost btn-sm" data-action="set-budget" data-period="${period}" data-category="${esc(c)}">Set limit</button></td></tr>`;
    }
    return `<tr><td><strong>${esc(catLabel(c))}</strong></td><td class="num">${peso(u.amount)}</td><td class="num">${peso(u.spent)}</td>
      <td class="num ${u.remaining < 0 ? 'down' : ''}">${peso(u.remaining)}</td>
      <td style="min-width:140px">${progressBar(u)}<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:12px"><span class="badge ${u.status}">${statusLabel(u)}</span><span class="muted">${Math.round(u.pct)}%</span></div></td>
      <td class="actions"><button class="icon-btn" data-action="set-budget" data-period="${period}" data-category="${esc(c)}" title="Edit limit" aria-label="Edit limit">${icon('edit')}</button><button class="icon-btn danger" data-action="delete-budget" data-id="${u.id}" title="Remove limit" aria-label="Remove limit">${icon('trash')}</button></td></tr>`;
  });

  el.innerHTML = `
    <div class="page-actions">
      <div class="controls">
        <div class="seg">${['monthly', 'yearly'].map((p) => `<button data-period-tab="${p}" class="${p === period ? 'active' : ''}">${p === 'monthly' ? 'Monthly' : 'Yearly'}</button>`).join('')}</div>
        ${period === 'monthly' ? `<select class="select" data-bm style="width:auto">${monthOptions(v.budgetMonth)}</select>` : ''}
        <select class="select" data-by style="width:auto">${yearOptions(v.budgetYear)}</select>
      </div>
      <button class="btn btn-primary" data-action="set-budget" data-period="${period}">${icon('plus')} Set budget</button>
    </div>

    ${flagged.length ? `<div class="alert ${flagged.some((u) => u.status === 'over') ? 'over' : 'warn'}">${icon('alert')}<div><strong>Budget warnings for ${label}</strong><ul>${flagged
      .map((u) => `<li>${esc(catLabel(u.category))}: ${statusLabel(u).toLowerCase()} — ${peso(u.spent)} of ${peso(u.amount)} (${Math.round(u.pct)}%)</li>`)
      .join('')}</ul></div></div>` : ''}

    <div class="grid stats">
      ${statCard({ label: `${overall ? 'Overall' : 'Combined'} budget · ${label}`, value: limit ? peso(limit) : 'Not set', sub: overall ? 'Overall spending limit' : catUsage.length ? 'Sum of category limits' : 'Set a limit to start tracking', iconName: 'budget', tone: 'navy', highlight: true })}
      ${statCard({ label: 'Spent', value: peso(spent), sub: `${txBetween(from, to, 'expense').length} expense records`, iconName: 'expense', tone: 'red' })}
      ${statCard({ label: 'Remaining', value: limit ? peso(remaining) : '—', sub: limit ? (remaining >= 0 ? 'Left to spend' : '<span class="down">Over the limit</span>') : 'No limit set', iconName: 'wallet', tone: remaining >= 0 ? 'green' : 'red' })}
      ${statCard({ label: 'Budget used', value: limit ? `${used.toFixed(1)}%` : '—', sub: limit ? progressBar({ pct: used, status: used >= 100 ? 'over' : used >= 80 ? 'warn' : 'ok' }) : '', iconName: 'profit', tone: used >= 100 ? 'red' : used >= 80 ? 'amber' : 'green' })}
    </div>

    <div class="grid cols-2">
      <div class="card">
        <div class="card-head"><div><h2>Category limits</h2><span class="muted">${period === 'monthly' ? 'Monthly limits repeat every month' : 'Yearly limits repeat every year'}</span></div></div>
        ${overall && catLimitSum > overall.amount ? `<div class="alert warn" style="margin-bottom:14px">${icon('alert')}<div>Category limits add up to ${peso(catLimitSum)}, which is more than the overall limit of ${peso(overall.amount)}.</div></div>` : ''}
        <div class="table-wrap"><table>
          <thead><tr><th>Category</th><th class="num">Limit</th><th class="num">Spent</th><th class="num">Remaining</th><th>Progress</th><th></th></tr></thead>
          <tbody>${rows.join('')}</tbody></table></div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Planned vs actual</h2><span class="muted">${label}</span></div></div>
        ${chartBox('budget-chart', catUsage.length, 'Set category limits to compare plan and actual spending.')}
      </div>
    </div>`;

  chart('budget-chart', {
    type: 'bar',
    data: {
      labels: catUsage.map((u) => u.category.split(' and ')[0]),
      datasets: [
        { label: 'Budget', data: catUsage.map((u) => u.amount / 100), backgroundColor: '#cbd3df', borderRadius: 5, maxBarThickness: 18 },
        { label: 'Spent', data: catUsage.map((u) => u.spent / 100), backgroundColor: catUsage.map((u) => (u.status === 'over' ? '#dc2626' : u.status === 'warn' ? '#f59e0b' : COLORS.income)), borderRadius: 5, maxBarThickness: 18 },
      ],
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom' }, tooltip: moneyTooltip(true) }, scales: moneyAxes(true) },
  });
  animateBars(el);

  $$('[data-period-tab]', el).forEach((b) =>
    b.addEventListener('click', () => {
      v.budgetPeriod = b.dataset.periodTab;
      renderPage(false);
    })
  );
  $('[data-bm]', el)?.addEventListener('change', (e) => {
    v.budgetMonth = Number(e.target.value);
    renderPage(false);
  });
  $('[data-by]', el).addEventListener('change', (e) => {
    v.budgetYear = Number(e.target.value);
    renderPage(false);
  });
}

// ---------- Reports ----------

function reportDefinition(r) {
  if (r.kind === 'monthly') {
    const key = `${r.year}-${pad(r.month)}`;
    const [from, to] = monthRange(key);
    const last = Number(to.slice(8));
    const buckets = [];
    for (let d = 1; d <= last; d += 7) {
      const e = Math.min(d + 6, last);
      buckets.push({ label: `${MONTHS[r.month - 1].slice(0, 3)} ${d}–${e}`, from: `${key}-${pad(d)}`, to: `${key}-${pad(e)}` });
    }
    const prevKey = shiftMonth(key, -1);
    const [pf, pt] = monthRange(prevKey);
    return { title: 'Monthly Financial Report', label: monthName(key), slug: key, from, to, months: 1, bucketName: 'Week', buckets, prev: { from: pf, to: pt, label: monthName(prevKey) } };
  }
  if (r.kind === 'quarterly') {
    const first = (r.quarter - 1) * 3 + 1;
    const keys = [0, 1, 2].map((i) => `${r.year}-${pad(first + i)}`);
    const buckets = keys.map((k) => {
      const [from, to] = monthRange(k);
      return { label: MONTHS[+k.slice(5) - 1], from, to };
    });
    const pq = r.quarter === 1 ? 4 : r.quarter - 1;
    const py = r.quarter === 1 ? r.year - 1 : r.year;
    const pFirst = (pq - 1) * 3 + 1;
    return {
      title: 'Quarterly Financial Report',
      label: `Q${r.quarter} ${r.year} (${MONTHS[first - 1].slice(0, 3)}–${MONTHS[first + 1].slice(0, 3)})`,
      slug: `${r.year}-Q${r.quarter}`,
      from: buckets[0].from,
      to: buckets[2].to,
      months: 3,
      bucketName: 'Month',
      buckets,
      prev: { from: `${py}-${pad(pFirst)}-01`, to: monthRange(`${py}-${pad(pFirst + 2)}`)[1], label: `Q${pq} ${py}` },
    };
  }
  const buckets = MONTHS.map((m, i) => {
    const [from, to] = monthRange(`${r.year}-${pad(i + 1)}`);
    return { label: m.slice(0, 3), from, to };
  });
  return {
    title: 'Annual Financial Report',
    label: String(r.year),
    slug: String(r.year),
    from: `${r.year}-01-01`,
    to: `${r.year}-12-31`,
    months: 12,
    bucketName: 'Month',
    buckets,
    prev: { from: `${r.year - 1}-01-01`, to: `${r.year - 1}-12-31`, label: String(r.year - 1) },
  };
}

// A category's limit over the whole report period (yearly limit for annual reports, else monthly × months).
function periodLimit(category, def) {
  if (def.months === 12) {
    const yearly = state.budgets.find((b) => b.period === 'yearly' && b.category === category);
    if (yearly) return yearly.amount;
  }
  const monthly = state.budgets.find((b) => b.period === 'monthly' && b.category === category);
  return monthly ? monthly.amount * def.months : null;
}

function buildReport() {
  const r = state.view.report;
  const def = reportDefinition(r);
  const txs = txBetween(def.from, def.to).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  const income = sum(txs.filter((t) => t.type === 'income'));
  const expense = sum(txs.filter((t) => t.type === 'expense'));
  const prevIncome = sumRange(def.prev.from, def.prev.to, 'income');
  const prevExpense = sumRange(def.prev.from, def.prev.to, 'expense');
  return {
    kind: r.kind,
    def,
    txs,
    income,
    expense,
    net: income - expense,
    prev: { income: prevIncome, expense: prevExpense, net: prevIncome - prevExpense },
    buckets: withTotals(def.buckets),
    incomeByCat: byCategory(txs.filter((t) => t.type === 'income')).map((c) => ({ ...c, share: pct(c.amount, income) })),
    expenseByCat: byCategory(txs.filter((t) => t.type === 'expense')).map((c) => ({ ...c, share: pct(c.amount, expense), limit: periodLimit(c.category, def) })),
    overallLimit: periodLimit(state.meta.overall, def),
  };
}

function renderReports(el) {
  const r = state.view.report;
  const rep = buildReport();
  const margin = rep.income ? pct(rep.net, rep.income) : 0;
  const prevMargin = rep.prev.income ? pct(rep.prev.net, rep.prev.income) : 0;

  el.innerHTML = `
    <div class="page-actions">
      <div class="controls">
        <div class="seg">${['monthly', 'quarterly', 'yearly'].map((k) => `<button data-kind="${k}" class="${k === r.kind ? 'active' : ''}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
        ${r.kind === 'monthly' ? `<select class="select" data-rm style="width:auto">${monthOptions(r.month)}</select>` : ''}
        ${r.kind === 'quarterly' ? `<select class="select" data-rq style="width:auto">${[1, 2, 3, 4].map((q) => `<option value="${q}" ${q === r.quarter ? 'selected' : ''}>Q${q}</option>`).join('')}</select>` : ''}
        <select class="select" data-ry style="width:auto">${yearOptions(r.year)}</select>
      </div>
      <div class="controls">
        <button class="btn btn-navy" data-pdf>${icon('download')} PDF</button>
        <button class="btn btn-primary" data-xlsx>${icon('download')} Excel</button>
      </div>
    </div>

    <div class="grid stats">
      ${statCard({ label: `Income · ${rep.def.label}`, value: peso(rep.income), sub: `${deltaText(rep.income, rep.prev.income)} vs ${rep.def.prev.label}`, iconName: 'income', tone: 'green' })}
      ${statCard({ label: 'Expenses', value: peso(rep.expense), sub: `${deltaText(rep.expense, rep.prev.expense, true)} vs ${rep.def.prev.label}`, iconName: 'expense', tone: 'red' })}
      ${statCard({ label: rep.net >= 0 ? 'Net profit' : 'Net loss', value: peso(rep.net), sub: `${deltaText(rep.net, rep.prev.net)} vs ${rep.def.prev.label}`, iconName: 'profit', tone: rep.net >= 0 ? 'green' : 'red', highlight: true })}
      ${statCard({ label: 'Profit margin', value: rep.income ? `${margin.toFixed(1)}%` : '—', sub: rep.prev.income ? `${prevMargin.toFixed(1)}% in ${rep.def.prev.label}` : 'Net profit ÷ income', iconName: 'budget', tone: 'navy' })}
    </div>

    <div class="grid cols-2">
      <div class="card">
        <div class="card-head"><div><h2>Income vs expenses</h2><span class="muted">${rep.def.label} by ${rep.def.bucketName.toLowerCase()}</span></div></div>
        ${chartBox('report-flow', rep.txs.length, 'No transactions in this period.')}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Expense breakdown</h2><span class="muted">${rep.def.label}</span></div></div>
        ${chartBox('report-cats', rep.expenseByCat.length, 'No expenses in this period.', true)}
      </div>
    </div>

    <div class="grid cols-2-even">
      <div class="card">
        <div class="card-head"><h2>Income by source</h2></div>
        ${categoryTable(rep.incomeByCat, rep.income, false)}
      </div>
      <div class="card">
        <div class="card-head"><h2>Expenses by category</h2></div>
        ${categoryTable(rep.expenseByCat, rep.expense, true, rep.overallLimit)}
      </div>
    </div>

    <div class="grid cols-2-even">
      <div class="card">
        <div class="card-head"><h2>Profit and loss statement</h2><span class="muted">${rep.def.label}</span></div>
        <div class="kv">
          <span><strong>Revenue</strong></span><span></span>
          ${rep.incomeByCat.map((c) => `<span style="padding-left:12px">${esc(c.category)}</span><span class="num">${peso(c.amount)}</span>`).join('')}
          <span><strong>Total revenue</strong></span><span class="num up">${peso(rep.income)}</span>
          <span><strong>Operating expenses</strong></span><span></span>
          ${rep.expenseByCat.map((c) => `<span style="padding-left:12px">${esc(c.category)}</span><span class="num">(${peso(c.amount)})</span>`).join('')}
          <span><strong>Total expenses</strong></span><span class="num">(${peso(rep.expense)})</span>
          <span style="border-top:2px solid var(--gray-200);padding-top:10px"><strong>${rep.net >= 0 ? 'Net profit' : 'Net loss'}</strong></span>
          <span class="num ${rep.net >= 0 ? 'up' : 'down'}" style="border-top:2px solid var(--gray-200);padding-top:10px;font-size:16px">${peso(rep.net)}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${rep.def.bucketName}ly breakdown</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>${rep.def.bucketName}</th><th class="num">Income</th><th class="num">Expenses</th><th class="num">Net</th></tr></thead>
          <tbody>${rep.buckets.map((b) => `<tr><td>${b.label}</td><td class="num amount-income">${peso(b.income)}</td><td class="num">${peso(b.expense)}</td><td class="num ${b.income - b.expense >= 0 ? 'up' : 'down'}">${peso(b.income - b.expense)}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td>Total</td><td class="num">${peso(rep.income)}</td><td class="num">${peso(rep.expense)}</td><td class="num ${rep.net >= 0 ? 'up' : 'down'}">${peso(rep.net)}</td></tr></tfoot>
        </table></div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div><h2>Transactions in this period</h2><span class="muted">${rep.txs.length} records — all included in the PDF and Excel downloads</span></div></div>
      ${
        rep.txs.length
          ? `<div class="table-wrap" style="max-height:420px;overflow-y:auto"><table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Method</th><th class="num">Amount</th></tr></thead>
            <tbody>${rep.txs.map((t) => `<tr><td style="white-space:nowrap">${fmtDate(t.date)}</td><td class="desc"><strong>${esc(t.description)}</strong></td><td>${esc(t.category)}</td><td><span class="badge ${t.type}">${t.type === 'income' ? 'Income' : 'Expense'}</span></td><td>${esc(t.payment_method)}</td><td class="num amount-${t.type}">${t.type === 'income' ? '+' : '−'}${peso(t.amount)}</td></tr>`).join('')}</tbody>
          </table></div>`
          : emptyState('Nothing recorded', `There are no transactions in ${esc(rep.def.label)}.`)
      }
    </div>`;

  flowChart('report-flow', rep.buckets);
  doughnutChart('report-cats', rep.expenseByCat);

  const rerender = () => renderPage(false);
  $$('[data-kind]', el).forEach((b) => b.addEventListener('click', () => ((r.kind = b.dataset.kind), rerender())));
  $('[data-rm]', el)?.addEventListener('change', (e) => ((r.month = Number(e.target.value)), rerender()));
  $('[data-rq]', el)?.addEventListener('change', (e) => ((r.quarter = Number(e.target.value)), rerender()));
  $('[data-ry]', el).addEventListener('change', (e) => ((r.year = Number(e.target.value)), rerender()));
  $('[data-pdf]', el).addEventListener('click', () => downloadPdf(rep));
  $('[data-xlsx]', el).addEventListener('click', () => downloadExcel(rep));
}

function categoryTable(rows, total, withBudget, overallLimit) {
  if (!rows.length) return emptyState('Nothing recorded', 'No entries in this period.');
  return `<div class="table-wrap"><table>
    <thead><tr><th>Category</th><th class="num">Amount</th><th class="num">Share</th>${withBudget ? '<th class="num">Budget</th><th class="num">Variance</th>' : ''}</tr></thead>
    <tbody>${rows
      .map(
        (c) => `<tr><td>${esc(c.category)}</td><td class="num">${peso(c.amount)}</td><td class="num">${c.share.toFixed(1)}%</td>${
          withBudget
            ? c.limit
              ? `<td class="num">${peso(c.limit)}</td><td class="num ${c.limit - c.amount >= 0 ? 'up' : 'down'}">${peso(c.limit - c.amount)}</td>`
              : '<td class="num muted">—</td><td class="num muted">—</td>'
            : ''
        }</tr>`
      )
      .join('')}</tbody>
    <tfoot><tr><td>Total</td><td class="num">${peso(total)}</td><td class="num">100%</td>${
      withBudget
        ? overallLimit
          ? `<td class="num">${peso(overallLimit)}</td><td class="num ${overallLimit - total >= 0 ? 'up' : 'down'}">${peso(overallLimit - total)}</td>`
          : '<td></td><td></td>'
        : ''
    }</tr></tfoot></table></div>`;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business';
const changePct = (cur, prev) => (prev ? `${(((cur - prev) / Math.abs(prev)) * 100).toFixed(1)}%` : 'n/a');

function downloadPdf(rep) {
  const lib = window.jspdf;
  if (!lib?.jsPDF) return toast('PDF export needs an internet connection to load. Reload and try again.', 'error');
  const doc = new lib.jsPDF({ unit: 'pt', format: 'a4' });
  if (typeof doc.autoTable !== 'function') return toast('PDF table plugin did not load. Reload and try again.', 'error');

  // The built-in PDF fonts have no peso sign, so amounts use the "PHP" code.
  const money = (c) => `${c < 0 ? '-' : ''}PHP ${nf.format(Math.abs(c) / 100)}`;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const navy = [30, 58, 95];

  doc.setFillColor(21, 42, 74);
  doc.rect(0, 0, W, 96, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(rep.def.title, 40, 44);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${state.user.business_name}  |  ${rep.def.label}`, 40, 68);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString('en-PH')}`, W - 40, 68, { align: 'right' });

  let y = 124;
  const right = (cols) => Object.fromEntries(cols.map((c) => [c, { halign: 'right' }]));
  const section = (title, head, body, columnStyles = {}, foot) => {
    if (y > H - 120) {
      doc.addPage();
      y = 50;
    }
    doc.setTextColor(22, 33, 58);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, 40, y);
    doc.autoTable({
      startY: y + 8,
      head: [head],
      body,
      foot: foot ? [foot] : undefined,
      theme: 'striped',
      headStyles: { fillColor: navy, textColor: 255 },
      footStyles: { fillColor: [230, 236, 245], textColor: [22, 33, 58], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles,
      margin: { left: 40, right: 40 },
    });
    y = doc.lastAutoTable.finalY + 28;
  };

  section(
    'Summary',
    ['Metric', rep.def.label, rep.def.prev.label, 'Change'],
    [
      ['Total income', money(rep.income), money(rep.prev.income), changePct(rep.income, rep.prev.income)],
      ['Total expenses', money(rep.expense), money(rep.prev.expense), changePct(rep.expense, rep.prev.expense)],
      [rep.net >= 0 ? 'Net profit' : 'Net loss', money(rep.net), money(rep.prev.net), changePct(rep.net, rep.prev.net)],
      ['Profit margin', rep.income ? `${pct(rep.net, rep.income).toFixed(1)}%` : 'n/a', rep.prev.income ? `${pct(rep.prev.net, rep.prev.income).toFixed(1)}%` : 'n/a', ''],
      ['Transactions', String(rep.txs.length), '', ''],
    ],
    right([1, 2, 3])
  );
  section(
    `Income vs expenses by ${rep.def.bucketName.toLowerCase()}`,
    [rep.def.bucketName, 'Income', 'Expenses', 'Net'],
    rep.buckets.map((b) => [b.label, money(b.income), money(b.expense), money(b.income - b.expense)]),
    right([1, 2, 3]),
    ['Total', money(rep.income), money(rep.expense), money(rep.net)]
  );
  section(
    'Income by source',
    ['Category', 'Amount', 'Share'],
    rep.incomeByCat.length ? rep.incomeByCat.map((c) => [c.category, money(c.amount), `${c.share.toFixed(1)}%`]) : [['No income recorded', '', '']],
    right([1, 2]),
    ['Total', money(rep.income), '100%']
  );
  section(
    'Expenses by category',
    ['Category', 'Amount', 'Share', 'Budget', 'Variance'],
    rep.expenseByCat.length
      ? rep.expenseByCat.map((c) => [c.category, money(c.amount), `${c.share.toFixed(1)}%`, c.limit ? money(c.limit) : '-', c.limit ? money(c.limit - c.amount) : '-'])
      : [['No expenses recorded', '', '', '', '']],
    right([1, 2, 3, 4]),
    ['Total', money(rep.expense), '100%', rep.overallLimit ? money(rep.overallLimit) : '', rep.overallLimit ? money(rep.overallLimit - rep.expense) : '']
  );
  section(
    'Transactions',
    ['Date', 'Type', 'Category', 'Description', 'Method', 'Amount'],
    rep.txs.length
      ? rep.txs.map((t) => [t.date, t.type === 'income' ? 'Income' : 'Expense', t.category, t.description, t.payment_method, money(t.type === 'income' ? t.amount : -t.amount)])
      : [['No transactions', '', '', '', '', '']],
    { 5: { halign: 'right' }, 3: { cellWidth: 150 } }
  );

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 145);
    doc.text(`${state.user.business_name} - ${rep.def.title}`, 40, H - 20);
    doc.text(`Page ${i} of ${pages}`, W - 40, H - 20, { align: 'right' });
  }
  doc.save(`${slugify(state.user.business_name)}-report-${rep.def.slug}.pdf`);
  toast('PDF report downloaded.');
}

function downloadExcel(rep) {
  if (!window.XLSX) return toast('Excel export needs an internet connection to load. Reload and try again.', 'error');
  const m = (c) => ({ t: 'n', v: c / 100, z: PESO_FMT });
  const share = (p) => ({ t: 'n', v: p / 100, z: '0.0%' });
  const change = (cur, prev) => (prev ? { t: 'n', v: (cur - prev) / Math.abs(prev), z: '0.0%' } : 'n/a');
  const wb = XLSX.utils.book_new();
  const addSheet = (name, rows, widths) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet(
    'Summary',
    [
      [rep.def.title],
      ['Business', state.user.business_name],
      ['Period', rep.def.label],
      ['Generated', new Date().toLocaleString('en-PH')],
      [],
      ['Metric', rep.def.label, rep.def.prev.label, 'Change'],
      ['Total income', m(rep.income), m(rep.prev.income), change(rep.income, rep.prev.income)],
      ['Total expenses', m(rep.expense), m(rep.prev.expense), change(rep.expense, rep.prev.expense)],
      [rep.net >= 0 ? 'Net profit' : 'Net loss', m(rep.net), m(rep.prev.net), change(rep.net, rep.prev.net)],
      ['Profit margin', rep.income ? share(pct(rep.net, rep.income)) : 'n/a', rep.prev.income ? share(pct(rep.prev.net, rep.prev.income)) : 'n/a'],
      ['Transactions', rep.txs.length],
    ],
    [24, 22, 22, 12]
  );
  addSheet(
    'Breakdown',
    [[rep.def.bucketName, 'Income', 'Expenses', 'Net'], ...rep.buckets.map((b) => [b.label, m(b.income), m(b.expense), m(b.income - b.expense)]), ['Total', m(rep.income), m(rep.expense), m(rep.net)]],
    [16, 18, 18, 18]
  );
  addSheet(
    'Income by source',
    [['Category', 'Amount', 'Share'], ...rep.incomeByCat.map((c) => [c.category, m(c.amount), share(c.share)]), ['Total', m(rep.income), share(rep.income ? 100 : 0)]],
    [26, 18, 10]
  );
  addSheet(
    'Expenses by category',
    [
      ['Category', 'Amount', 'Share', 'Budget', 'Variance'],
      ...rep.expenseByCat.map((c) => [c.category, m(c.amount), share(c.share), c.limit ? m(c.limit) : '', c.limit ? m(c.limit - c.amount) : '']),
      ['Total', m(rep.expense), share(rep.expense ? 100 : 0), rep.overallLimit ? m(rep.overallLimit) : '', rep.overallLimit ? m(rep.overallLimit - rep.expense) : ''],
    ],
    [28, 18, 10, 18, 18]
  );
  addSheet(
    'Transactions',
    [['Date', 'Type', 'Category', 'Description', 'Payment method', 'Amount'], ...rep.txs.map((t) => [t.date, t.type === 'income' ? 'Income' : 'Expense', t.category, t.description, t.payment_method, m(t.type === 'income' ? t.amount : -t.amount)])],
    [12, 10, 26, 40, 16, 18]
  );
  XLSX.writeFile(wb, `${slugify(state.user.business_name)}-report-${rep.def.slug}.xlsx`);
  toast('Excel report downloaded.');
}

// ---------- Settings ----------

function renderSettings(el) {
  const u = state.user;
  el.innerHTML = `
    <div class="settings-grid">
      <form class="card" id="profile-form" novalidate>
        <div class="card-head"><div><h2>Business profile</h2><span class="muted">Shown on reports and in the sidebar</span></div></div>
        <div class="form-error" data-form-error></div>
        <div class="grid-2">
          <label class="field"><span>Your name</span><input name="name" maxlength="80" value="${esc(u.name)}"></label>
          <label class="field"><span>Business name</span><input name="business_name" maxlength="120" value="${esc(u.business_name)}"></label>
        </div>
        <label class="field"><span>Email (used to sign in)</span><input name="email" type="email" maxlength="120" value="${esc(u.email)}"></label>
        <label class="field"><span>Opening balance</span><div class="money-input"><input name="opening_balance" inputmode="decimal" value="${(u.opening_balance / 100).toFixed(2)}"></div></label>
        <p class="hint">Cash and bank funds you had before recording transactions. Business balance = opening balance + income − expenses. Currency: Philippine Peso (₱).</p>
        <button class="btn btn-primary" type="submit">Save profile</button>
      </form>

      <form class="card" id="password-form" novalidate>
        <div class="card-head"><div><h2>Change password</h2><span class="muted">Other signed-in devices will be signed out</span></div></div>
        <div class="form-error" data-form-error></div>
        <label class="field"><span>Current password</span><input name="current_password" type="password" autocomplete="current-password"></label>
        <label class="field"><span>New password</span><input name="new_password" type="password" autocomplete="new-password"></label>
        <label class="field"><span>Confirm new password</span><input name="confirm" type="password" autocomplete="new-password"></label>
        <p class="hint">At least 8 characters, with a letter and a number.</p>
        <button class="btn btn-navy" type="submit">Update password</button>
      </form>

      <div class="card">
        <div class="card-head"><div><h2>Your data</h2><span class="muted">Member since ${fmtDate(u.created_at.slice(0, 10))}</span></div></div>
        <div class="kv" style="margin-bottom:18px">
          <span>Transactions</span><span class="num">${state.tx.length}</span>
          <span>Budget limits</span><span class="num">${state.budgets.length}</span>
        </div>
        <div class="stack">
          <div class="row-between"><div><strong>Load sample data</strong><div class="muted">Replaces your records with 12 months of demo café data.</div></div><button class="btn btn-ghost" data-sample>Load sample</button></div>
          <div class="row-between"><div><strong>Clear all records</strong><div class="muted">Deletes every transaction and budget. Your account stays.</div></div><button class="btn btn-danger-ghost" data-clear>Clear records</button></div>
        </div>
      </div>

      <div class="card danger-zone">
        <div class="card-head"><div><h2>Delete account</h2><span class="muted">Permanently removes your account and all its records</span></div></div>
        <p class="muted" style="margin-top:0">This cannot be undone. Download any reports you need first.</p>
        <button class="btn btn-danger" data-delete-account>Delete account</button>
      </div>
    </div>`;

  $('#profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const v = Object.fromEntries(new FormData(f));
    v.opening_balance = String(v.opening_balance).replace(/,/g, '').trim();
    const fields = {};
    if (!v.name.trim()) fields.name = 'Enter your name.';
    if (!v.business_name.trim()) fields.business_name = 'Enter your business name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) fields.email = 'Enter a valid email address.';
    if (!/^-?\d{1,9}(\.\d{1,2})?$/.test(v.opening_balance)) fields.opening_balance = 'Enter a number with up to 2 decimals.';
    if (Object.keys(fields).length) return showFieldErrors(f, fields);
    withBusy(f, () => mutate('PUT', '/api/account/profile', v, 'Profile saved.'));
  });

  $('#password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const v = Object.fromEntries(new FormData(f));
    const fields = {};
    if (!v.current_password) fields.current_password = 'Enter your current password.';
    const problem = passwordProblem(v.new_password);
    if (problem) fields.new_password = problem;
    else if (v.new_password !== v.confirm) fields.confirm = 'Passwords do not match.';
    if (Object.keys(fields).length) return showFieldErrors(f, fields);
    withBusy(f, async () => {
      await api('PUT', '/api/account/password', { current_password: v.current_password, new_password: v.new_password });
      f.reset();
      toast('Password updated.');
    });
  });

  $('[data-sample]', el).addEventListener('click', () =>
    confirmModal({
      title: 'Load sample data?',
      message: `This <strong>replaces all ${state.tx.length} transactions and ${state.budgets.length} budget limits</strong> with demo data.`,
      confirmLabel: 'Replace with sample data',
      onConfirm: () => mutate('POST', '/api/account/sample-data', null, 'Sample data loaded.'),
    })
  );
  $('[data-clear]', el).addEventListener('click', () =>
    confirmModal({
      title: 'Clear all records?',
      message: `This permanently deletes <strong>${state.tx.length} transactions and ${state.budgets.length} budget limits</strong>.`,
      confirmLabel: 'Delete everything',
      onConfirm: () => mutate('DELETE', '/api/account/data', null, 'All records cleared.'),
    })
  );
  $('[data-delete-account]', el).addEventListener('click', () =>
    openModal({
      title: 'Delete your account?',
      body: `<p style="margin-top:0">This permanently deletes <strong>${esc(state.user.business_name)}</strong> and all its records. Enter your password to confirm.</p>
        <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password"></label>`,
      footer: `<button type="button" class="btn btn-ghost" data-close>Cancel</button><button type="submit" class="btn btn-danger">Delete account</button>`,
      onSubmit: async (form, close) => {
        const password = form.elements.password.value;
        if (!password) throw invalid({ password: 'Enter your password.' });
        await api('DELETE', '/api/account', { password });
        close();
        showAuth();
        toast('Account deleted.');
      },
    })
  );
}
