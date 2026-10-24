# Feedback & Review Aggregator Platform (MERN)

A beginner-friendly college project built with **MongoDB Atlas + Express + React + Node.js**.

## Features

- Responsive, modern UI for desktop and mobile
- Submit a review with name, product/service, category, 1–5 star rating, message and recommendation
- Read reviews stored in MongoDB Atlas
- Edit and delete a review
- Search across reviewer, product/service, category and message
- Filter by Product, Service, App and Other
- Sort by newest, oldest, top rated and lowest rated
- Helpful counter for reviews
- Live total-review, average-rating and recommend-percentage statistics
- API health status and readable error messages
- Input validation on frontend and backend

> **Important:** This project does not include login/authentication. For a college demo this can be okay, but in a public production deployment you should add authentication/authorization, rate limiting and moderation so anonymous people cannot edit/delete other people's reviews.

---

## Step 1 — Extract the ZIP

1. Download and extract `feedback-review-platform-ready.zip`.
2. Open the extracted `feedback-review-platform-ready` folder in VS Code.
3. Inside it you should see `frontend` and `backend` folders.

You may use this as a separate clean copy so your existing project files are not accidentally lost.

## Step 2 — Configure MongoDB Atlas

1. Sign in at <https://cloud.mongodb.com/>.
2. Open the correct Atlas project and cluster.
3. Go to **Security → Database Access**.
4. Confirm your **database user** exists. This is not necessarily your MongoDB website login. If unsure, edit/reset the database user's password.
5. Go to **Security → Network Access** (sometimes shown as IP Access List) and make sure your current public IP is allowed. For a safer setup, add your current IP instead of allowing all IPs permanently.
6. Open **Connect → Drivers** on your cluster and copy the Node.js connection string.
7. Replace the placeholder in that URI with the database username and password. A password containing characters such as `@`, `#`, `/`, `:` or spaces must be URL-encoded inside the connection string. Easiest for a beginner is to reset the database-user password to a strong password containing letters and numbers only (do not send it to anyone).

Official troubleshooting: <https://www.mongodb.com/docs/atlas/troubleshoot-connection/>

## Step 3 — Make the backend `.env` file

Open a VS Code terminal and go to the backend folder:

```powershell
cd path\to\feedback-review-platform-ready\backend
Copy-Item .env.example .env
```

Open `backend/.env` in VS Code. Replace the example `MONGO_URI` with the connection string you copied from Atlas. Keep `PORT=5000` and `CLIENT_ORIGIN=http://localhost:5173` as shown.

Example format only (do not copy the fake cluster name):

```env
MONGO_URI=mongodb+srv://DB_USERNAME:DB_PASSWORD@your-real-cluster.mongodb.net/feedback_review_platform?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Keep the URI on one line. Do not put spaces around `=`. **Never paste your real password into chat or commit your `.env` file to GitHub.**

## Step 4 — Install and start backend

In the backend terminal:

```powershell
npm.cmd install
node server.js
```

Expected successful output:

```text
Server running at http://localhost:5000
Health check: http://localhost:5000/api/health
MongoDB connected successfully.
```

The MongoDB line might appear a moment after the first two lines. Leave this terminal running.

Open this URL in Chrome to verify the API and database:

<http://localhost:5000/api/health>

Expected JSON should include `"status":"ok"` and `"database":"connected"`. If it says database disconnected, check the exact Atlas URI, database username/password, current IP access list and cluster status. The API can start while the database is disconnected; reviews will not save until the database connects.

## Step 5 — Install and start frontend

Open a **second terminal** in VS Code (Terminal → New Terminal):

```powershell
cd path\to\feedback-review-platform-ready\frontend
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

If PowerShell asks whether to overwrite a frontend `.env` file, choose according to the prompt; normally this is a fresh setup. The frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:5000
```

Open the Vite URL printed in the terminal, normally:

<http://localhost:5173/>

Keep both terminal windows running. Frontend is in one terminal, backend in the other.

## Step 6 — Test all functions

1. Open `http://localhost:5173/`.
2. Confirm the top-right status becomes **Connected**.
3. Click **Write a review**, fill name, product/service, category, rating and review, then publish.
4. Confirm the card appears and the total/average statistics update.
5. Refresh Chrome. The review should still be there if MongoDB is connected.
6. Test search, category tabs and each sorting choice.
7. Click Helpful and confirm the number increases.
8. Click pencil to edit a review, then save changes.
9. Click trash to delete a review and confirm the prompt.
10. Check `http://localhost:5000/api/health` if the connection status shows Offline.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend status/info |
| GET | `/api/health` | Server and MongoDB connection status |
| GET | `/api/feedback` | Fetch all reviews |
| POST | `/api/feedback` | Create a review |
| PATCH | `/api/feedback/:id` | Update a review |
| DELETE | `/api/feedback/:id` | Delete a review |
| PATCH | `/api/feedback/:id/helpful` | Increment helpful count |

## Common problems

### `bad auth : authentication failed`
- Check username/password under **Security → Database Access**; do not use your Atlas website login password unless you deliberately made them the same.
- Reset the database user's password if needed, update `backend/.env`, save, stop backend with `Ctrl+C`, and run `node server.js` again.
- If password has reserved URI characters, URL-encode them or set a new strong alphanumeric password.

### `IP address is not allowed` / connection timeout
- Add your current IP under Atlas **Network Access / IP Access List** and confirm the cluster is running.

### Frontend says Offline
- Check backend terminal is still running.
- Visit `http://localhost:5000/api/health`.
- Ensure `frontend/.env` says `VITE_API_URL=http://localhost:5000`; restart Vite after changing `.env`.

### Port 5173 is already in use
- Vite may display a different local URL, such as `http://localhost:5174/`. Open the URL that appears in the terminal. If you use a different port, update `CLIENT_ORIGIN` in `backend/.env` to match that exact frontend origin and restart backend.

### PowerShell says `npm.ps1 cannot be loaded`
Use `npm.cmd` exactly as shown in these instructions.

## Stack

- React + Vite
- Node.js + Express
- MongoDB Atlas + Mongoose
- CSS responsive UI
- lucide-react icons
