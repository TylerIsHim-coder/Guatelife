# Firebase-Backed Admin Content Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move admin-editable content (inline text overrides + mentor cards) from per-browser `localStorage` to Firestore, so admin edits show up for every visitor on every device.

**Architecture:** Firebase JS SDK (compat build) loaded via CDN `<script>` tags — matching this project's existing build-free, CDN-script style (Tailwind is loaded the same way). Firestore holds two documents (`content/overrides`, `content/mentors`) that fully replace the role of `localStorage` as the source of truth for this content. `admin.js`'s storage functions become Firestore-backed but keep the same call signatures used by the rest of the file wherever possible, so the rendering code (`buildMentorCardEl`, `applyOverrides`, etc.) barely changes.

**Tech Stack:** Vanilla JS, Firebase JS SDK 10.x (compat build via CDN), Firestore. No build step, no test runner — this project has neither, so verification in every task is manual (browser + Firestore console), matching how the rest of the site is already verified.

## Global Constraints

- No bundler/build step — all new code must work as plain `<script>` tags, no `import`/`export` syntax (per spec: "Firebase JS SDK compat build via CDN").
- Firestore document size cap is 1 MiB — uploaded mentor photos must be resized/compressed client-side before being stored as base64 (per spec).
- Firestore security rules are open read/write on `content/*` only — already published; do not change rules as part of this plan.
- Existing `applications` and `users` Firestore rules/collections are unrelated to this work — do not touch them.
- Firebase project config (already provided):
  ```js
  {
    apiKey: "AIzaSyD1X7lLkdaTgCQ-dKZraSTkSbNwcnSjETI",
    authDomain: "guatelife-2cc1b.firebaseapp.com",
    projectId: "guatelife-2cc1b",
    storageBucket: "guatelife-2cc1b.firebasestorage.app",
    messagingSenderId: "692683119844",
    appId: "1:692683119844:web:2003d0a7c35e9bf177a0f1",
    measurementId: "G-27NVPF2DLT"
  }
  ```

---

## File Structure

- **Create** `firebase-config.js` — initializes the Firebase app + Firestore client, exposes `window.GuateLifeDb`.
- **Modify** `index.html` — add Firebase SDK + config `<script>` tags before `admin.js`.
- **Modify** `about.html` — same as above.
- **Modify** `admin.js` — storage layer (`loadOverrides`/`saveOverride`, `loadAllMentors`/`saveAllMentors`) becomes Firestore-backed; `init()` becomes async; add photo compression, inline save-error feedback, one-time local→cloud migration button, and a Firestore-aware reset button.

---

### Task 1: Wire up the Firebase SDK and Firestore client

**Files:**
- Create: `firebase-config.js`
- Modify: `index.html:341-344`
- Modify: `about.html:278-281`

**Interfaces:**
- Produces: `window.GuateLifeDb` — a `firebase.firestore.Firestore` instance, available globally to any script loaded after `firebase-config.js`.

- [ ] **Step 1: Create `firebase-config.js`**

```js
/* ============================================================
   GuateLife — Firebase initialization
   Loaded after the Firebase compat SDK scripts, before admin.js.
   ============================================================ */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyD1X7lLkdaTgCQ-dKZraSTkSbNwcnSjETI",
    authDomain: "guatelife-2cc1b.firebaseapp.com",
    projectId: "guatelife-2cc1b",
    storageBucket: "guatelife-2cc1b.firebasestorage.app",
    messagingSenderId: "692683119844",
    appId: "1:692683119844:web:2003d0a7c35e9bf177a0f1",
    measurementId: "G-27NVPF2DLT"
  };

  firebase.initializeApp(firebaseConfig);
  window.GuateLifeDb = firebase.firestore();
})();
```

- [ ] **Step 2: Add the SDK + config script tags to `index.html`**

Find (`index.html:341-344`):
```html
  <script src="main.js"></script>
  <script src="i18n.js"></script>
  <script src="onboarding.js"></script>
  <script src="admin.js"></script>
```

Replace with:
```html
  <script src="main.js"></script>
  <script src="i18n.js"></script>
  <script src="onboarding.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="admin.js"></script>
```

- [ ] **Step 3: Add the same script tags to `about.html`**

Find (`about.html:278-281`):
```html
  <script src="main.js"></script>
  <script src="i18n.js"></script>
  <script src="onboarding.js"></script>
  <script src="admin.js"></script>
```

Replace with:
```html
  <script src="main.js"></script>
  <script src="i18n.js"></script>
  <script src="onboarding.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="admin.js"></script>
```

- [ ] **Step 4: Verify in the browser**

Run a local static server (the Firestore SDK needs a real origin, not `file://`):
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000/index.html`, open devtools.

- **Network tab**: confirm both `firebase-app-compat.js` and `firebase-firestore-compat.js` return `200` (not `404`). If either 404s, the pinned version `10.7.1` is no longer hosted — check https://firebase.google.com/docs/web/setup for a current version number and update it in both step 2 and step 3 above (use the same version for both files in both `<script>` tags).
- **Console tab**: run `window.GuateLifeDb` — expected output: a `Firestore` object (not `undefined`). Run `window.GuateLifeDb.app.options.projectId` — expected output: `"guatelife-2cc1b"`.
- Confirm no red errors in the console.

- [ ] **Step 5: Commit**

```bash
git add firebase-config.js index.html about.html
git commit -m "Wire up Firebase SDK and Firestore client"
```

---

### Task 2: Move text overrides from localStorage to Firestore

**Files:**
- Modify: `admin.js:25-46` (storage helpers)
- Modify: `admin.js:516-553` (`enterEditMode`, uses `saveOverride`)
- Modify: `admin.js:629-661` (`init`)
- Modify: `admin.js:663-667` (bootstrap)

**Interfaces:**
- Consumes: `window.GuateLifeDb` (produced by Task 1).
- Produces: `loadOverrides()` — sync, returns the in-memory cache (an object like `{ en: {...}, es: {...} }`). `saveOverride(lang, key, value)` — mutates the cache and returns a `Promise` from the Firestore write (callers may ignore or `.catch()` it). `loadOverridesFromFirestore()` — async, populates the cache; must be awaited once during `init()` before `applyOverrides()` runs.

- [ ] **Step 1: Replace the override storage helpers**

Find (`admin.js:21-46`):
```js
  /* ============================================================
     TEXT OVERRIDE HELPERS
  ============================================================ */

  function loadOverrides() {
    try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveOverride(lang, key, value) {
    const all = loadOverrides();
    if (!all[lang]) all[lang] = {};
    all[lang][key] = value;
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  }

  function applyOverrides() {
    const all = loadOverrides();
    const lang = window.GuateLifeI18n ? window.GuateLifeI18n.getLanguage() : 'en';
    const overrides = all[lang] || {};
    Object.entries(overrides).forEach(([key, value]) => {
      document.querySelectorAll(`[data-i18n="${CSS.escape(key)}"]`).forEach((el) => {
        el.innerHTML = value;
      });
    });
  }
```

Replace with:
```js
  /* ============================================================
     TEXT OVERRIDE HELPERS
     Firestore-backed: content/overrides → { en: {...}, es: {...} }
  ============================================================ */

  let overridesCache = null;

  async function loadOverridesFromFirestore() {
    try {
      const snap = await window.GuateLifeDb.collection('content').doc('overrides').get();
      overridesCache = snap.exists ? snap.data() : {};
    } catch (err) {
      console.error('GuateLife: failed to load text overrides from Firestore', err);
      overridesCache = {};
    }
  }

  function loadOverrides() {
    return overridesCache || {};
  }

  function saveOverride(lang, key, value) {
    if (!overridesCache) overridesCache = {};
    if (!overridesCache[lang]) overridesCache[lang] = {};
    overridesCache[lang][key] = value;
    return window.GuateLifeDb.collection('content').doc('overrides').set(overridesCache);
  }

  function applyOverrides() {
    const all = loadOverrides();
    const lang = window.GuateLifeI18n ? window.GuateLifeI18n.getLanguage() : 'en';
    const overrides = all[lang] || {};
    Object.entries(overrides).forEach(([key, value]) => {
      document.querySelectorAll(`[data-i18n="${CSS.escape(key)}"]`).forEach((el) => {
        el.innerHTML = value;
      });
    });
  }
```

- [ ] **Step 2: Make `init()` async and load overrides before rendering**

Find (`admin.js:629-661`):
```js
  function init() {
    migrateOldMentors();
    createAdminButton();

    /* Apply saved text overrides (i18n has already run before this script) */
    applyOverrides();

    /* On the About page: hide the hardcoded HTML mentor cards and render from storage */
    const grid = getMentorsGrid();
    if (grid) {
      grid.querySelectorAll('.mentor-card').forEach((el) => { el.style.display = 'none'; });
      refreshAllMentors();
    }

    /* Patch applyLanguage so overrides survive language toggling */
    if (window.GuateLifeI18n) {
      const orig = window.GuateLifeI18n.applyLanguage;
      window.GuateLifeI18n.applyLanguage = function (lang) {
        orig(lang);
        applyOverrides();
        if (isEditMode) {
          document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.dataset.adminKey = el.getAttribute('data-i18n');
          });
        }
      };
    }

    /* Re-enter edit mode when navigating between pages in the same session */
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      enterEditMode();
    }
  }
```

Replace with:
```js
  async function init() {
    createAdminButton();

    /* Load saved text overrides from Firestore (i18n has already run before this script) */
    await loadOverridesFromFirestore();
    applyOverrides();

    /* On the About page: hide the hardcoded HTML mentor cards and render from storage */
    const grid = getMentorsGrid();
    if (grid) {
      grid.querySelectorAll('.mentor-card').forEach((el) => { el.style.display = 'none'; });
      refreshAllMentors();
    }

    /* Patch applyLanguage so overrides survive language toggling */
    if (window.GuateLifeI18n) {
      const orig = window.GuateLifeI18n.applyLanguage;
      window.GuateLifeI18n.applyLanguage = function (lang) {
        orig(lang);
        applyOverrides();
        if (isEditMode) {
          document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.dataset.adminKey = el.getAttribute('data-i18n');
          });
        }
      };
    }

    /* Re-enter edit mode when navigating between pages in the same session */
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      enterEditMode();
    }
  }
```

Note: `migrateOldMentors()` is removed from `init()` here because Task 3 deletes that function entirely (superseded by Task 6's cloud migration). Leaving the call in would break `init()` between Task 2 and Task 3 — that's fine, Task 3 is the very next task and this plan is executed in order.

- [ ] **Step 3: Verify text overrides round-trip through Firestore**

With the local server still running (`python3 -m http.server 8000`), open `http://localhost:8000/index.html`.

1. Click the lock icon (bottom-right), enter password `tyleriscool123`.
2. Click any highlighted text (e.g. the hero headline), change it, click elsewhere to blur.
3. In the Firebase console → Firestore Database → Data tab, open `content/overrides`. Expected: a field for the page's language (e.g. `en`) containing a map with the edited `data-i18n` key and your new text as its value.
4. Reload the page (still in the browser, not exiting edit mode first). Expected: the edited text persists (loaded back from Firestore, not from `localStorage` — open devtools → Application → Local Storage and confirm `guatelife-content-overrides` is no longer being written to for new edits).

- [ ] **Step 4: Commit**

```bash
git add admin.js
git commit -m "Move text overrides from localStorage to Firestore"
```

---

### Task 3: Move mentor storage from localStorage to Firestore

**Files:**
- Modify: `admin.js:48-66` (storage helpers)
- Modify: `admin.js:141-201` (`applyMentorEditMode` — blur handler + delete button)
- Modify: `admin.js:235-363` (`showAddMentorModal` — save handler)
- Modify: `admin.js:611-627` (delete `migrateOldMentors`)
- Modify: `admin.js:629-661` (`init` — await mentor load, drop `migrateOldMentors()` call already removed in Task 2)

**Interfaces:**
- Consumes: `window.GuateLifeDb` (Task 1), `DEFAULT_MENTORS` (existing constant, admin.js:14-17).
- Produces: `loadAllMentors()` — sync, returns the in-memory mentor list array. `saveAllMentors(list)` — mutates the cache and returns a `Promise` from the Firestore write. `loadMentorsFromFirestore()` — async, populates the cache (seeding Firestore with `DEFAULT_MENTORS` on first run); must be awaited once during `init()`.

- [ ] **Step 1: Replace the mentor storage helpers**

Find (`admin.js:48-66`):
```js
  /* ============================================================
     MENTOR STORAGE
  ============================================================ */

  function loadAllMentors() {
    try {
      const raw = localStorage.getItem(ALL_MENTORS_KEY);
      if (raw) return JSON.parse(raw);
      /* First visit — seed defaults */
      localStorage.setItem(ALL_MENTORS_KEY, JSON.stringify(DEFAULT_MENTORS));
      return DEFAULT_MENTORS.map((m) => Object.assign({}, m));
    } catch {
      return DEFAULT_MENTORS.map((m) => Object.assign({}, m));
    }
  }

  function saveAllMentors(list) {
    localStorage.setItem(ALL_MENTORS_KEY, JSON.stringify(list));
  }
```

Replace with:
```js
  /* ============================================================
     MENTOR STORAGE
     Firestore-backed: content/mentors → { list: [...] }
  ============================================================ */

  let mentorsCache = null;

  async function loadMentorsFromFirestore() {
    try {
      const docRef = window.GuateLifeDb.collection('content').doc('mentors');
      const snap = await docRef.get();
      if (snap.exists && Array.isArray(snap.data().list)) {
        mentorsCache = snap.data().list;
      } else {
        /* First visit — seed defaults */
        mentorsCache = DEFAULT_MENTORS.map((m) => Object.assign({}, m));
        await docRef.set({ list: mentorsCache });
      }
    } catch (err) {
      console.error('GuateLife: failed to load mentors from Firestore', err);
      mentorsCache = DEFAULT_MENTORS.map((m) => Object.assign({}, m));
    }
  }

  function loadAllMentors() {
    return mentorsCache || DEFAULT_MENTORS.map((m) => Object.assign({}, m));
  }

  function saveAllMentors(list) {
    mentorsCache = list;
    return window.GuateLifeDb.collection('content').doc('mentors').set({ list });
  }
```

- [ ] **Step 2: Update the mentor field blur handler (fire-and-forget save, matches existing pattern)**

Find (`admin.js:166-176`):
```js
      el.addEventListener('blur', () => {
        el.style.outline    = '2px dashed rgba(166,197,107,0.5)';
        el.style.background = '';

        const newVal = el.innerText.trim();
        const list   = loadAllMentors();
        if (list[idx]) {
          list[idx][field] = newVal;
          saveAllMentors(list);
        }
      });
```

Replace with:
```js
      el.addEventListener('blur', () => {
        el.style.outline    = '2px dashed rgba(166,197,107,0.5)';
        el.style.background = '';

        const newVal = el.innerText.trim();
        const list   = loadAllMentors();
        if (list[idx]) {
          list[idx][field] = newVal;
          saveAllMentors(list).catch((err) => {
            console.error('GuateLife: failed to save mentor edit', err);
          });
        }
      });
```

- [ ] **Step 3: Update the delete-mentor handler**

Find (`admin.js:192-199`):
```js
    del.addEventListener('click', () => {
      const list = loadAllMentors();
      const name = list[idx] ? list[idx].name : 'this mentor';
      if (!confirm(`Remove ${name}?`)) return;
      list.splice(idx, 1);
      saveAllMentors(list);
      refreshAllMentors();
    });
```

Replace with:
```js
    del.addEventListener('click', () => {
      const list = loadAllMentors();
      const name = list[idx] ? list[idx].name : 'this mentor';
      if (!confirm(`Remove ${name}?`)) return;
      list.splice(idx, 1);
      saveAllMentors(list).catch((err) => {
        console.error('GuateLife: failed to delete mentor', err);
        alert('Failed to delete — check your connection and try again.');
      });
      refreshAllMentors();
    });
```

- [ ] **Step 4: Update the add-mentor save handler**

Find (`admin.js:339-356`):
```js
    const save = () => {
      errorEl.textContent = '';
      const name  = nameEl.value.trim();
      const title = titleEl.value.trim();
      if (!name)  { errorEl.textContent = 'Name is required.'; nameEl.focus(); return; }
      if (!title) { errorEl.textContent = 'Role / Title is required.'; titleEl.focus(); return; }

      const photo = base64Photo || urlInput.value.trim() || null;
      const bio   = bioEl.value.trim();
      const id    = 'custom-' + Date.now();

      const list = loadAllMentors();
      list.push({ id, name, title, bio, photo });
      saveAllMentors(list);

      overlay.remove();
      refreshAllMentors();
    };
```

Replace with:
```js
    const save = () => {
      errorEl.textContent = '';
      const name  = nameEl.value.trim();
      const title = titleEl.value.trim();
      if (!name)  { errorEl.textContent = 'Name is required.'; nameEl.focus(); return; }
      if (!title) { errorEl.textContent = 'Role / Title is required.'; titleEl.focus(); return; }

      const photo = base64Photo || urlInput.value.trim() || null;
      const bio   = bioEl.value.trim();
      const id    = 'custom-' + Date.now();

      const list = loadAllMentors();
      list.push({ id, name, title, bio, photo });
      saveAllMentors(list)
        .then(() => {
          overlay.remove();
          refreshAllMentors();
        })
        .catch((err) => {
          console.error('GuateLife: failed to save new mentor', err);
          errorEl.textContent = 'Failed to save — check your connection and try again.';
        });
    };
```

- [ ] **Step 5: Delete `migrateOldMentors` (superseded by Task 6's cloud migration)**

Find (`admin.js:611-627`):
```js
  /* ============================================================
     INIT
  ============================================================ */

  /* Migrate mentors added under the old storage key (guatelife-custom-mentors) */
  function migrateOldMentors() {
    if (localStorage.getItem(ALL_MENTORS_KEY)) return;
    try {
      const old = localStorage.getItem('guatelife-custom-mentors');
      if (old) {
        const oldList = JSON.parse(old);
        const merged = DEFAULT_MENTORS.map((m) => Object.assign({}, m)).concat(oldList);
        localStorage.setItem(ALL_MENTORS_KEY, JSON.stringify(merged));
        localStorage.removeItem('guatelife-custom-mentors');
      }
    } catch { /* ignore */ }
  }
```

Replace with:
```js
  /* ============================================================
     INIT
  ============================================================ */
```

- [ ] **Step 6: Await mentor load in `init()`**

Find (`admin.js`, the version produced by Task 2's Step 2):
```js
    /* Load saved text overrides from Firestore (i18n has already run before this script) */
    await loadOverridesFromFirestore();
    applyOverrides();
```

Replace with:
```js
    /* Load saved text overrides and mentors from Firestore (i18n has already run before this script) */
    await Promise.all([loadOverridesFromFirestore(), loadMentorsFromFirestore()]);
    applyOverrides();
```

- [ ] **Step 7: Verify mentors round-trip through Firestore**

With the local server running, open `http://localhost:8000/about.html` (this is the page with the mentors grid).

1. Confirm the page renders the two default mentors (Brendan, Tyler) without errors.
2. Log in as admin, click "Add Mentor", fill in Name + Title, save.
3. In the Firebase console → Firestore Database → Data, open `content/mentors`. Expected: the `list` array now has three entries.
4. Edit a mentor's name inline (click the highlighted name, type, click away). Expected: `content/mentors` in Firestore updates with the new name.
5. Delete the mentor you added. Expected: `content/mentors` in Firestore shows the list back to two entries.
6. Reload the page. Expected: the two default mentors render correctly (loaded from Firestore).

- [ ] **Step 8: Commit**

```bash
git add admin.js
git commit -m "Move mentor storage from localStorage to Firestore"
```

---

### Task 4: Compress uploaded mentor photos before storing

**Files:**
- Modify: `admin.js:316-328` (file upload handler in `showAddMentorModal`)

**Interfaces:**
- Produces: `resizeImageFile(file, maxDim, quality)` — returns a `Promise<string>` resolving to a JPEG data URL no larger than `maxDim` px on its longest edge.

- [ ] **Step 1: Add the resize helper**

Find (`admin.js:231-234`):
```js
  /* ============================================================
     ADD MENTOR MODAL
  ============================================================ */
```

Replace with:
```js
  /* ============================================================
     IMAGE HELPERS
  ============================================================ */

  /* Resizes/compresses an uploaded image client-side so a handful of
     mentor photos comfortably fit under Firestore's 1 MiB document cap. */
  function resizeImageFile(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not read image file'));
        img.onload = () => {
          let width  = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width  = maxDim;
          } else if (height >= width && height > maxDim) {
            width  = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width  = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     ADD MENTOR MODAL
  ============================================================ */
```

- [ ] **Step 2: Use the resize helper in the file upload handler**

Find (`admin.js:316-328`):
```js
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      fileNameEl.textContent = file.name;
      urlInput.value = '';
      const reader = new FileReader();
      reader.onload = (e) => {
        base64Photo = e.target.result;
        previewImg.src = base64Photo;
        previewWrap.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
```

Replace with:
```js
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      fileNameEl.textContent = file.name;
      urlInput.value = '';
      resizeImageFile(file, 480, 0.8)
        .then((dataUrl) => {
          base64Photo = dataUrl;
          previewImg.src = base64Photo;
          previewWrap.style.display = 'block';
        })
        .catch((err) => {
          console.error('GuateLife: failed to process uploaded photo', err);
          errorEl.textContent = 'Could not process that image — try a different file.';
        });
    });
```

- [ ] **Step 3: Verify photo compression**

With the local server running, open `http://localhost:8000/about.html`, log in as admin, click "Add Mentor", upload a real photo (ideally a multi-megabyte JPEG/PNG from a phone or camera, if you have one handy — that's the case this protects against).

1. Confirm the preview image appears and looks correct (not distorted, not pixelated beyond what's expected from compression).
2. In devtools console, after the preview appears, run: `document.getElementById('amf-preview').src.length`. Expected: well under `1000000` (1 MB) — typically tens of thousands of characters for a 480px JPEG.
3. Save the mentor. In the Firebase console, open `content/mentors` and confirm the new entry's `photo` field is a `data:image/jpeg;base64,...` string, and that the document overall is far from the 1 MiB Firestore limit (Firestore console shows document size doesn't apply visually, but the base64 string length check above is the real signal).
4. Delete the test mentor when done (cleanup).

- [ ] **Step 4: Commit**

```bash
git add admin.js
git commit -m "Compress uploaded mentor photos before storing in Firestore"
```

---

### Task 5: Inline feedback when a save fails

**Files:**
- Modify: `admin.js:531-535` (text override blur handler in `enterEditMode`)

**Interfaces:**
- Consumes: `saveOverride` (Task 2), which already returns a `Promise`.
- Produces: `flashSaveError(el)` — briefly outlines an element red and sets a tooltip, used wherever a Firestore write might fail.

- [ ] **Step 1: Add the `flashSaveError` helper**

Find (`admin.js`, the `esc` function — admin.js:601-605):
```js
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
```

Replace with:
```js
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Briefly flags an editable element red when its Firestore save fails,
     so a dropped connection doesn't silently discard an edit. */
  function flashSaveError(el) {
    const prevOutline = el.style.outline;
    const prevTitle   = el.title;
    el.style.outline = '2px solid #ef4444';
    el.title = 'Save failed — check your connection and try again.';
    setTimeout(() => {
      el.style.outline = prevOutline;
      el.title = prevTitle;
    }, 2500);
  }
```

- [ ] **Step 2: Use it in the text override blur handler**

Find (`admin.js:531-535`):
```js
    function onBlur(e) {
      const el = e.currentTarget;
      Object.assign(el.style, { outline: '2px dashed rgba(166,197,107,0.45)', background: '' });
      saveOverride(lang, el.dataset.adminKey, el.innerHTML);
    }
```

Replace with:
```js
    function onBlur(e) {
      const el = e.currentTarget;
      Object.assign(el.style, { outline: '2px dashed rgba(166,197,107,0.45)', background: '' });
      saveOverride(lang, el.dataset.adminKey, el.innerHTML).catch((err) => {
        console.error('GuateLife: failed to save text edit', err);
        flashSaveError(el);
      });
    }
```

- [ ] **Step 3: Use it in the mentor field blur handler**

Find (`admin.js`, the version produced by Task 3's Step 2):
```js
      el.addEventListener('blur', () => {
        el.style.outline    = '2px dashed rgba(166,197,107,0.5)';
        el.style.background = '';

        const newVal = el.innerText.trim();
        const list   = loadAllMentors();
        if (list[idx]) {
          list[idx][field] = newVal;
          saveAllMentors(list).catch((err) => {
            console.error('GuateLife: failed to save mentor edit', err);
          });
        }
      });
```

Replace with:
```js
      el.addEventListener('blur', () => {
        el.style.outline    = '2px dashed rgba(166,197,107,0.5)';
        el.style.background = '';

        const newVal = el.innerText.trim();
        const list   = loadAllMentors();
        if (list[idx]) {
          list[idx][field] = newVal;
          saveAllMentors(list).catch((err) => {
            console.error('GuateLife: failed to save mentor edit', err);
            flashSaveError(el);
          });
        }
      });
```

- [ ] **Step 4: Verify by simulating a dropped connection**

With the local server running, open `http://localhost:8000/index.html`, log in as admin.

1. In devtools → Network tab, set throttling to "Offline".
2. Click an editable text field, change it, click away.
3. Expected: the field briefly outlines red and shows a tooltip on hover ("Save failed — check your connection and try again."), and the console logs the error — the page does not crash or hang.
4. Set Network throttling back to "No throttling" (or "Online"), make the same edit again, confirm it saves normally (outline goes back to the dashed green state, no error).

- [ ] **Step 5: Commit**

```bash
git add admin.js
git commit -m "Show inline feedback when a Firestore save fails"
```

---

### Task 6: One-time "push local edits to cloud" migration

**Files:**
- Modify: `admin.js:464-496` (`createToolbar`)

**Interfaces:**
- Consumes: `overridesCache`, `mentorsCache` (Tasks 2/3 — written to directly here), `OVERRIDES_KEY`, `ALL_MENTORS_KEY` (existing constants, admin.js:9-10).
- Produces: `hasLegacyLocalData()` — sync boolean, used to decide whether the migration button renders.

- [ ] **Step 1: Add the detection + migration functions**

Find (`admin.js:460-463`):
```js
  /* ============================================================
     TOOLBAR
  ============================================================ */
```

Replace with:
```js
  /* ============================================================
     LOCAL → CLOUD MIGRATION (one-time)
  ============================================================ */

  function hasLegacyLocalData() {
    return !!(localStorage.getItem(OVERRIDES_KEY) || localStorage.getItem(ALL_MENTORS_KEY));
  }

  async function pushLocalEditsToCloud() {
    if (!confirm('Push this browser\'s saved edits to the cloud? This will overwrite current cloud content with what\'s stored locally on this device.')) {
      return;
    }
    try {
      const localOverridesRaw = localStorage.getItem(OVERRIDES_KEY);
      const localMentorsRaw   = localStorage.getItem(ALL_MENTORS_KEY);
      const localOverrides    = localOverridesRaw ? JSON.parse(localOverridesRaw) : null;
      const localMentors      = localMentorsRaw ? JSON.parse(localMentorsRaw) : null;

      if (localOverrides) {
        await window.GuateLifeDb.collection('content').doc('overrides').set(localOverrides);
        overridesCache = localOverrides;
      }
      if (localMentors) {
        await window.GuateLifeDb.collection('content').doc('mentors').set({ list: localMentors });
        mentorsCache = localMentors;
      }

      localStorage.removeItem(OVERRIDES_KEY);
      localStorage.removeItem(ALL_MENTORS_KEY);

      applyOverrides();
      refreshAllMentors();

      const btn = document.getElementById('admin-push-local-btn');
      if (btn) btn.remove();

      alert('Local edits pushed to the cloud.');
    } catch (err) {
      console.error('GuateLife: failed to push local edits to Firestore', err);
      alert('Failed to push local edits — check your connection and try again.');
    }
  }

  /* ============================================================
     TOOLBAR
  ============================================================ */
```

- [ ] **Step 2: Add the button to the toolbar**

Find (`admin.js:464-496`):
```js
  function createToolbar() {
    const bar = document.createElement('div');
    bar.id = 'admin-edit-toolbar';
    bar.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:10000;
      background:rgba(11,15,20,0.93);
      backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
      padding:9px 20px;
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      border-bottom:1px solid rgba(255,255,255,0.07);
      font-family:Inter,system-ui,sans-serif;
    `;
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#a6c56b;flex-shrink:0;"></span>
        <span style="color:rgba(255,255,255,0.85);font-size:13px;">Edit mode — click any highlighted text to change it. Changes save automatically.</span>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button id="admin-reset-btn" style="padding:6px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-size:12px;font-family:inherit;">Reset all to defaults</button>
        <button id="admin-exit-btn"  style="padding:6px 14px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;background:rgba(255,255,255,0.07);color:#fff;cursor:pointer;font-size:12px;font-family:inherit;">Exit editing</button>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#admin-exit-btn').addEventListener('click', exitEditMode);
    bar.querySelector('#admin-reset-btn').addEventListener('click', () => {
      if (confirm('Reset all edits (text and mentors) back to defaults? This cannot be undone.')) {
        localStorage.removeItem(OVERRIDES_KEY);
        localStorage.removeItem(ALL_MENTORS_KEY);
        location.reload();
      }
    });
  }
```

Replace with:
```js
  function createToolbar() {
    const bar = document.createElement('div');
    bar.id = 'admin-edit-toolbar';
    bar.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:10000;
      background:rgba(11,15,20,0.93);
      backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
      padding:9px 20px;
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      border-bottom:1px solid rgba(255,255,255,0.07);
      font-family:Inter,system-ui,sans-serif;
    `;
    const pushBtnHtml = hasLegacyLocalData()
      ? `<button id="admin-push-local-btn" style="padding:6px 14px;border:1px solid rgba(166,197,107,0.4);border-radius:8px;background:rgba(166,197,107,0.12);color:#a6c56b;cursor:pointer;font-size:12px;font-family:inherit;">Push local edits to cloud</button>`
      : '';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#a6c56b;flex-shrink:0;"></span>
        <span style="color:rgba(255,255,255,0.85);font-size:13px;">Edit mode — click any highlighted text to change it. Changes save automatically.</span>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        ${pushBtnHtml}
        <button id="admin-reset-btn" style="padding:6px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-size:12px;font-family:inherit;">Reset all to defaults</button>
        <button id="admin-exit-btn"  style="padding:6px 14px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;background:rgba(255,255,255,0.07);color:#fff;cursor:pointer;font-size:12px;font-family:inherit;">Exit editing</button>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#admin-exit-btn').addEventListener('click', exitEditMode);
    const pushBtn = bar.querySelector('#admin-push-local-btn');
    if (pushBtn) pushBtn.addEventListener('click', pushLocalEditsToCloud);
    bar.querySelector('#admin-reset-btn').addEventListener('click', () => {
      if (confirm('Reset all edits (text and mentors) back to defaults? This cannot be undone.')) {
        localStorage.removeItem(OVERRIDES_KEY);
        localStorage.removeItem(ALL_MENTORS_KEY);
        location.reload();
      }
    });
  }
```

- [ ] **Step 3: Verify the migration button**

With the local server running, open `http://localhost:8000/index.html`, open devtools console.

1. Seed fake legacy data to simulate the admin's real situation:
   ```js
   localStorage.setItem('guatelife-content-overrides', JSON.stringify({ en: { 'hero.headline': 'MIGRATED TEXT TEST' } }));
   ```
2. Reload the page, log in as admin. Expected: the toolbar shows a "Push local edits to cloud" button (green-tinted, left of "Reset all to defaults").
3. Click it, confirm the dialog. Expected: an `alert` confirms success, the button disappears, and the page text now shows "MIGRATED TEXT TEST" wherever `hero.headline` renders.
4. In the Firebase console, open `content/overrides` and confirm it now contains `hero.headline: "MIGRATED TEXT TEST"`.
5. Reload the page again. Expected: the button stays gone (legacy `localStorage` keys were cleared in step 3), and the text persists (now coming from Firestore).
6. Use the admin UI to change `hero.headline` back to its original text when done (cleanup).

- [ ] **Step 4: Commit**

```bash
git add admin.js
git commit -m "Add one-time local-to-cloud migration for legacy localStorage edits"
```

---

### Task 7: Reset button resets Firestore instead of localStorage

**Files:**
- Modify: `admin.js` (reset button handler inside `createToolbar`, produced by Task 6's Step 2)

**Interfaces:**
- Consumes: `window.GuateLifeDb`, `DEFAULT_MENTORS` (existing constant).

- [ ] **Step 1: Update the reset handler**

Find (`admin.js`, the version produced by Task 6's Step 2):
```js
    bar.querySelector('#admin-reset-btn').addEventListener('click', () => {
      if (confirm('Reset all edits (text and mentors) back to defaults? This cannot be undone.')) {
        localStorage.removeItem(OVERRIDES_KEY);
        localStorage.removeItem(ALL_MENTORS_KEY);
        location.reload();
      }
    });
```

Replace with:
```js
    bar.querySelector('#admin-reset-btn').addEventListener('click', () => {
      if (!confirm('Reset all edits (text and mentors) back to defaults? This cannot be undone.')) return;
      Promise.all([
        window.GuateLifeDb.collection('content').doc('overrides').set({}),
        window.GuateLifeDb.collection('content').doc('mentors').set({ list: DEFAULT_MENTORS.map((m) => Object.assign({}, m)) }),
      ])
        .then(() => location.reload())
        .catch((err) => {
          console.error('GuateLife: failed to reset content', err);
          alert('Failed to reset — check your connection and try again.');
        });
    });
```

- [ ] **Step 2: Verify**

With the local server running, open `http://localhost:8000/about.html`, log in as admin.

1. Add a throwaway mentor and edit some text, confirm both show up in the Firebase console under `content/overrides` and `content/mentors`.
2. Click "Reset all to defaults" in the toolbar, confirm the dialog.
3. Expected: the page reloads, the throwaway mentor and text edit are gone, only the two default mentors (Brendan, Tyler) show.
4. In the Firebase console, confirm `content/overrides` is now `{}` and `content/mentors.list` is back to the two default entries.

- [ ] **Step 3: Commit**

```bash
git add admin.js
git commit -m "Reset button now resets Firestore content instead of localStorage"
```

---

## End-to-End Verification (after all tasks)

- [ ] Open `http://localhost:8000/index.html` in two different browsers (e.g. Chrome and Firefox, or a normal + incognito window — anything with separate `localStorage`).
- [ ] In browser A, log in as admin and edit some text.
- [ ] In browser B (no admin login), load/reload the page. Expected: the edited text from browser A appears — this is the actual goal of this whole plan (cross-browser/cross-device sync via Firestore instead of per-browser `localStorage`).
- [ ] Repeat for a mentor edit on the About page.
