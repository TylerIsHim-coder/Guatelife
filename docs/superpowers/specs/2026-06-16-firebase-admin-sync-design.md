# Firebase-backed admin content sync — design

## Problem

`admin.js` persists all admin edits (inline text overrides and the mentor list on the About page) to `localStorage`. This is scoped per-browser: edits made while logged into the admin panel on one device only show up on that same browser. Site visitors on other devices never see the changes, and the admin's own edits don't follow them between their own devices either.

## Goal

Admin edits made through the existing password-gated inline editor should sync to every visitor of the live site, on any device/browser — not just the one used to make the edit.

## Scope

Both pieces of admin-editable content move to Firebase:
- Inline text overrides (currently `OVERRIDES_KEY` in `localStorage`)
- Mentor cards: add/edit/delete (currently `ALL_MENTORS_KEY` in `localStorage`)

## Architecture

- The site is a static, build-free HTML/JS site (Tailwind and all other dependencies are loaded via CDN `<script>` tags, no bundler). Firebase is added the same way: the Firebase JS SDK **compat build** via CDN `<script>` tags in `index.html` and `about.html`, plus a new `firebase-config.js` holding the project's web config object.
- **Firestore** is the source of truth for admin-editable content, replacing `localStorage` for that purpose. Two documents in a `content` collection:
  - `content/overrides` → `{ en: { [data-i18n key]: html }, es: { ... } }` — same shape as today's `OVERRIDES_KEY` value.
  - `content/mentors` → `{ list: [ { id, name, title, bio, photo }, ... ] }` — same shape as today's `ALL_MENTORS_KEY` value.
- On page load, both docs are fetched once (in parallel) before content is rendered/overridden. No realtime listeners — a page refresh is sufficient to see the latest content, which matches how a small content site is actually used.
- If the Firestore fetch fails (offline, blocked request, etc.), the page falls back to the hardcoded HTML defaults already present in `index.html` / `about.html` rather than blocking render or erroring.
- **Security model**: per explicit decision, Firestore rules allow open read/write on the two `content/*` docs — the same trust level as today (the admin password is a client-side UI gate only, not real protection; it never was, since the password string is visible in `admin.js` source). This keeps the design simple and avoids introducing Firebase Authentication. Rules are scoped narrowly to `content/*` only, not the whole database.

## Code changes (`admin.js`)

- `loadOverrides` / `saveOverride` and `loadAllMentors` / `saveAllMentors` become Firestore-backed, reading/writing the two docs above. An in-memory cache avoids redundant reads during a single page session (e.g. mentor edits don't need to re-fetch the whole doc on every keystroke/blur).
- `init()` becomes async: fetch `content/overrides` and `content/mentors` in parallel, then apply overrides and render mentors — mirroring the current synchronous flow but awaiting the network round trip first.
- **Photo uploads**: uploaded files are currently embedded as raw base64 (`admin.js:316-328`). Firestore caps documents at 1 MiB; a few uncompressed photos in one `mentors` doc could exceed that. Uploaded images are resized/compressed client-side via `<canvas>` (max ~480px on the long edge, JPEG quality ~0.8) before being stored as base64. Pasted image URLs are unaffected (stored as plain strings, same as today).
- **One-time migration**: the admin currently has real edits sitting in `localStorage` on their own browser. The edit toolbar gains a "Push local edits to cloud" button, shown only when legacy `OVERRIDES_KEY`/`ALL_MENTORS_KEY` data is detected in `localStorage`. Clicking it reads that local data and writes it into the two Firestore docs (overwriting whatever defaults were seeded there). This is a manual, one-time, admin-triggered action — not an automatic migration on every page load.
- "Reset all to defaults" now resets the two Firestore docs back to `DEFAULT_MENTORS` / empty overrides, instead of clearing `localStorage` keys.
- Save failures (e.g. editing while offline) surface a brief inline error near the edited field rather than silently discarding the edit and leaving the admin unaware it didn't persist.

## Setup (manual, in Firebase console — outside this repo)

1. Confirm Firestore (not Realtime Database) is enabled on the project.
2. Add Firestore security rules scoped to `content/*`:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /content/{docId} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Retrieve the web app config (`firebaseConfig` object: apiKey, authDomain, projectId, etc.) from Project Settings → General → Your apps, and provide it for `firebase-config.js`.

## Out of scope

- Firebase Authentication / real write protection (explicitly declined — open rules match today's trust model).
- Realtime sync to already-open tabs (a refresh is sufficient).
- Firebase Storage for photos (resizing client-side keeps base64-in-Firestore viable without a second product).
