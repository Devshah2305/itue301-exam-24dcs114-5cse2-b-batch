# FINDINGS.md

---

## T1 — Event Listing (Components and Props)

### What was wrong
Two problems in the starter code:
1. `Events.jsx` was missing entirely — the file existed on disk as `" Events.jsx"` (with a leading space in the filename), which meant the import in `App.jsx` (`import Events from "./pages/Events"`) failed at runtime and the Events page never loaded.
2. `EventCard.jsx` had no `PropTypes` declaration, so React raised console warnings for every card rendered.

### Why it mattered
The missing `Events.jsx` meant the entire events listing page crashed on load. The missing PropTypes caused React warnings in the browser console, which the spec explicitly forbids ("the page raises no React warnings").

### How you fixed it
Created `/client/src/pages/Events.jsx` with a correct default export, a hardcoded `EVENTS` array, and `key={event.id}` on each `<EventCard>`. Added a `PropTypes.shape(...)` declaration to `EventCard.jsx` covering all six required props (`title`, `category`, `date`, `duration`, `fee`, `seatsLeft`). The formatting helpers (`formatDate`, `formatDuration`, `formatFee`) were already correct and were kept unchanged.

---

## T2 — Registration (Routing and State)

### What was wrong
Three problems:
1. The validation check order was wrong — the email-limit check (`emailCount >= 3`) ran before the seat check (`seatsLeft <= 0`), but the spec requires "Event is full" to be caught first.
2. The fetch URL in `Register.jsx` pointed to `http://localhost:5000/api/v1/events` but the server's `.env` sets `PORT=5001`, so the event list never loaded.
3. `client/package.json` was an exact copy of the server's `package.json` — it listed `express`, `cors`, `mongoose` and `dotenv` instead of `react`, `react-dom`, `react-router-dom` and `vite`, so `npm install` in the client folder would install the wrong packages entirely.

### Why it mattered
The wrong check order meant a student with 3 registrations trying to register for a full event would see "Limit of 3 registrations reached" instead of "Event is full". The wrong port meant the event dropdown was always empty and showed "Could not load events". The wrong `package.json` meant the client could never be installed or started.

### How you fixed it
In `Register.jsx`, moved the `seatsLeft <= 0` check above the `emailCount >= 3` check. Changed the fetch URL from port `5000` to `5001`. Replaced `client/package.json` with the correct Vite + React dependencies (`react`, `react-dom`, `react-router-dom`, `prop-types`, `@vitejs/plugin-react`, `vite`). Also created the missing `client/index.html` entry point and `client/vite.config.js` (which were absent from the starter kit).

---

## T3 — Organisers Directory (API Consumption)

### What was wrong
`loadOrganisers` was defined as a plain `async function` inside the component body but was not wrapped in `useCallback`. It was passed as the dependency of `useEffect`. Because a new function reference is created on every render, the effect fired again after each state update (e.g. after `setOrganisers` or `setLoading` ran), causing an infinite fetch loop.

### Why it mattered
The component repeatedly called `https://jsonplaceholder.typicode.com/users?_limit=10` on every render cycle instead of exactly once on mount. This violated the spec rule ("request exactly once on opening") and would hammer the external API unnecessarily.

### How you fixed it
Wrapped `loadOrganisers` in `useCallback(async () => { ... }, [])` so its reference is stable across renders. The `useEffect` dependency array then correctly sees the same function reference after mount and does not re-fire. The Retry button still calls `loadOrganisers` directly, which triggers a fresh fetch without a page reload.

---

## T4 — Events Service (Express and Middleware)

### What was wrong
Two problems in `server.js`:
1. The `/api/v1/boom` route threw synchronously (`throw new Error(...)`) inside a regular Express 4 route handler. In Express 4, synchronous throws inside non-async route handlers do **not** automatically reach the error-handling middleware — the process crashes or the error goes unhandled instead of returning a clean 500 response.
2. The POST, GET and DELETE routes returned the full Mongoose document (with `date`, `category`, `duration`, `_id`, `__v`, etc.) instead of the shape the spec defines: `{ id, title, capacity, fee }`.

### Why it mattered
The unhandled throw on `/api/v1/boom` meant any unhandled error bypassed the global error handler, so the spec requirement ("any unhandled error responds 500 `{ error: 'Something went wrong' }` with no stack trace") was not met. The wrong response shape meant API consumers received fields they did not expect and lacked the `id` field they needed for subsequent GET/DELETE calls.

### How you fixed it
Wrapped the throw in `/api/v1/boom` in a `try/catch` and called `next(err)` explicitly, routing it through the existing error-handling middleware. Updated all route handlers to respond with only `{ id: event._id.toString(), title, capacity, fee }`. The GET `/api/v1/events` list response also includes `seatsLeft`, `date`, `category` and `duration` as extra fields needed by the frontend, but the four required fields are always present.

---

## T5 — Event Data (MongoDB and Mongoose)

### What was wrong
Three problems in `models/Event.js`:
1. The `capacity` field's custom validator — the one that enforces the cultural-event cap of 200 — used an **arrow function**: `validator: (value) => { if (this.category === ...) }`. Arrow functions do not bind their own `this`, so `this` was `undefined` at runtime and the cultural cap was never enforced.
2. There was no **integer validator** on `capacity`, so fractional values like `3.7` passed validation even though the spec requires a whole number.
3. `createdAt` was defined as a manual schema field with `default: Date.now` but without Mongoose's `timestamps` option. This works for inserts but is not idiomatic and does not guarantee the field is managed automatically.

### Why it mattered
Because `this` was `undefined` in the arrow function, a cultural event with capacity 300 saved successfully instead of being rejected. Without an integer check, non-whole capacities silently passed. The manual `createdAt` field would not behave consistently across all Mongoose operations.

### How you fixed it
Changed both `capacity` validators to regular `function()` expressions so `this` correctly refers to the document being validated. Added a first validator `Number.isInteger(value)` with message `"capacity must be a whole number"`. Removed the manual `createdAt` field and replaced it with `timestamps: { createdAt: "createdAt", updatedAt: false }` in the schema options, letting Mongoose manage the field automatically. `seed.js` was also updated to trigger both a `fee < 0` error and the cultural capacity error so `formatValidationError` output shows multiple entries in `details`.
