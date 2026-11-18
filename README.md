# BudgetBook – Business Budget Tracker

Track income, expenses, budgets and reports for a business, in Philippine Peso (₱).

## Run

Only the computer that runs the server needs this. Phones and other devices just open the link in a browser.

1. Install Node.js version 22.13 or newer from https://nodejs.org. To check what you have, run `node -v`.
2. In this folder, run:

   ```
   npm install
   npm start
   ```

**Where data is saved**
- If `DATABASE_URL` is set (a Supabase / Postgres connection string), data goes to that database and survives restarts. Locally, put it in a `.env` file: `DATABASE_URL=postgresql://...`. On Render, add it under the service's **Environment** tab.
- Otherwise data goes to `data/budget.db` on this computer. Don't use this on Render's free plan: the file is wiped whenever the server restarts.

Open http://localhost:5050. To use another port: `PORT=5051 npm start`.

Demo account (12 months of sample café data): `demo@example.com` / `demo1234`.

## What's inside

| File | Purpose |
| --- | --- |
| `server.js` | HTTP server, JSON API, auth (scrypt passwords, HttpOnly session cookie), validation, sample data |
| `db.js` | Database layer: Postgres when `DATABASE_URL` is set, SQLite file otherwise |
| `index.html` | Page shell: sign-in/register and app layout |
| `app.js` | Dashboard, income, expenses, budgets, reports, transactions, settings |
| `styles.css` | Navy / white / gray theme with green accents, responsive layout |
| `data/budget.db` | SQLite database (only used when `DATABASE_URL` is not set) |

Charts (Chart.js), PDF export (jsPDF) and Excel export (SheetJS) load from cdnjs, so those need an internet connection.
Everything else works offline.

## Reset

SQLite: stop the server and delete the `data/` folder. Postgres: delete the `users`, `sessions`, `transactions` and `budgets` tables in Supabase. The demo account is recreated on the next start.
