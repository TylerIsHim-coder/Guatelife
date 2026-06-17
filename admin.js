/* ============================================================
   GuateLife — Admin inline editor + mentor manager
   Password-protected, persists all changes to localStorage.
   ============================================================ */
(function () {
  'use strict';

  const ADMIN_PASSWORD = 'tyleriscool123';
  const OVERRIDES_KEY  = 'guatelife-content-overrides';
  const ALL_MENTORS_KEY = 'guatelife-all-mentors';
  const SESSION_KEY    = 'guatelife-admin-session';

  /* Default mentors — used to seed localStorage on first visit */
  const DEFAULT_MENTORS = [
    { id: 'builtin-0', name: 'Brendan', title: 'Assistant CEO',  bio: '', photo: 'assets/mentors/brendan.jpeg' },
    { id: 'builtin-1', name: 'Tyler',   title: 'Guatelife CEO',  bio: '', photo: 'assets/mentors/tyler.jpeg'   },
  ];

  let isEditMode = false;

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

  function getMentorsGrid() {
    return document.querySelector('#mentors [data-stagger]');
  }

  /* ============================================================
     MENTOR RENDERING
  ============================================================ */

  function refreshAllMentors() {
    const grid = getMentorsGrid();
    if (!grid) return;

    /* Remove all previously rendered mentor cards and the add button */
    grid.querySelectorAll('.admin-rendered-mentor, #admin-add-mentor-btn').forEach((el) => el.remove());

    loadAllMentors().forEach((mentor, idx) => {
      grid.appendChild(buildMentorCardEl(mentor, idx));
    });

    if (isEditMode) injectAddMentorButton(grid);
  }

  function buildMentorCardEl(mentor, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'admin-rendered-mentor text-center';
    wrap.style.cssText = 'position:relative;';

    /* Photo */
    const photoInner = mentor.photo
      ? `<img src="${mentor.photo}" alt="${esc(mentor.name)}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#8FB1D6,#A6C56B);display:flex;align-items:center;justify-content:center;font-size:2.2rem;font-weight:600;color:white;font-family:'Cormorant Garamond',Georgia,serif;">${initials(mentor.name)}</div>`;

    /* Name */
    const nameEl = document.createElement('p');
    nameEl.className = 'font-serif text-2xl font-medium text-ink';
    nameEl.style.marginTop = '20px';
    nameEl.dataset.mentorField = 'name';
    nameEl.dataset.mentorIdx   = String(idx);
    nameEl.textContent = mentor.name;

    /* Title */
    const titleEl = document.createElement('p');
    titleEl.className = 'mt-1 text-sm font-medium';
    titleEl.style.color = '#5E80AC';
    titleEl.dataset.mentorField = 'title';
    titleEl.dataset.mentorIdx   = String(idx);
    titleEl.textContent = mentor.title;

    /* Bio */
    const bioEl = document.createElement('p');
    bioEl.className = 'mt-3 text-sm leading-relaxed text-muted max-w-xs mx-auto';
    bioEl.style.whiteSpace = 'pre-line';
    bioEl.dataset.mentorField   = 'bio';
    bioEl.dataset.mentorIdx     = String(idx);
    bioEl.dataset.placeholder   = 'Add a bio…';
    bioEl.textContent = mentor.bio || '';
    if (!mentor.bio && !isEditMode) bioEl.style.display = 'none';

    /* Photo wrapper */
    const photoWrap = document.createElement('div');
    photoWrap.style.cssText = 'width:128px;height:128px;border-radius:50%;overflow:hidden;margin:0 auto;';
    photoWrap.innerHTML = photoInner;

    wrap.appendChild(photoWrap);
    wrap.appendChild(nameEl);
    wrap.appendChild(titleEl);
    wrap.appendChild(bioEl);

    if (isEditMode) applyMentorEditMode(wrap, idx);

    return wrap;
  }

  function applyMentorEditMode(card, idx) {
    /* Make name, title, bio fields editable */
    card.querySelectorAll('[data-mentor-field]').forEach((el) => {
      const field = el.dataset.mentorField;

      el.contentEditable = 'true';
      el.style.display   = ''; // ensure bio is visible in edit mode
      el.style.outline   = '2px dashed rgba(166,197,107,0.5)';
      el.style.borderRadius = '4px';
      el.style.cursor    = 'text';
      el.style.minWidth  = '40px';
      el.style.minHeight = '1em';

      /* Prevent Enter in single-line fields */
      if (field !== 'bio') {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
        });
      }

      el.addEventListener('focus', () => {
        el.style.outline    = '2px solid #A6C56B';
        el.style.background = 'rgba(166,197,107,0.07)';
      });

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
    });

    /* Delete button */
    const del = document.createElement('button');
    del.setAttribute('aria-label', 'Remove mentor');
    del.title   = 'Remove mentor';
    del.innerHTML = '&times;';
    del.style.cssText = `
      position:absolute;top:-6px;right:-6px;
      width:26px;height:26px;border-radius:50%;
      border:2px solid #fff;background:#ef4444;color:#fff;
      font-size:16px;line-height:1;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10;
    `;
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
    card.appendChild(del);
  }

  /* "+" card shown at the end of the grid in edit mode */
  function injectAddMentorButton(grid) {
    const btn = document.createElement('button');
    btn.id = 'admin-add-mentor-btn';
    btn.setAttribute('aria-label', 'Add mentor');
    btn.style.cssText = `
      width:128px;min-height:190px;
      border:2px dashed rgba(166,197,107,0.5);
      border-radius:16px;background:rgba(166,197,107,0.04);
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:8px;
      cursor:pointer;color:#7CA24E;
      font-family:Inter,system-ui,sans-serif;font-size:13px;
      transition:background 0.15s,border-color 0.15s;
    `;
    btn.innerHTML = `<span style="font-size:32px;line-height:1;font-weight:300;">+</span><span>Add Mentor</span>`;
    btn.addEventListener('mouseenter', () => {
      btn.style.background   = 'rgba(166,197,107,0.12)';
      btn.style.borderColor  = '#A6C56B';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background   = 'rgba(166,197,107,0.04)';
      btn.style.borderColor  = 'rgba(166,197,107,0.5)';
    });
    btn.addEventListener('click', showAddMentorModal);
    grid.appendChild(btn);
  }

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

  function showAddMentorModal() {
    if (document.getElementById('admin-add-mentor-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'admin-add-mentor-modal';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:10002;
      background:rgba(11,15,20,0.7);
      backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;
    `;

    overlay.innerHTML = `
      <div style="
        background:#fff;border-radius:24px;
        padding:40px 36px 32px;max-width:420px;width:92%;
        box-shadow:0 40px 80px -20px rgba(0,0,0,0.35);
        font-family:Inter,system-ui,sans-serif;
        max-height:92vh;overflow-y:auto;box-sizing:border-box;
      ">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:500;color:#0F172A;margin:0 0 4px;">Add a Mentor</p>
        <p style="font-size:13px;color:#94a3b8;margin:0 0 28px;">The card appears on the page immediately and stays after the browser is closed.</p>

        <label style="${labelStyle()}">Name *</label>
        <input id="amf-name" type="text" placeholder="e.g. Maria García" style="${inputStyle()}" />

        <label style="${labelStyle()} margin-top:18px;">Role / Title *</label>
        <input id="amf-title" type="text" placeholder="e.g. Math Mentor" style="${inputStyle()}" />

        <label style="${labelStyle()} margin-top:18px;">Bio</label>
        <textarea id="amf-bio" placeholder="A short description…" rows="3" style="${inputStyle()} resize:vertical;line-height:1.5;"></textarea>

        <label style="${labelStyle()} margin-top:18px;">Photo</label>
        <p style="font-size:12px;color:#94a3b8;margin:0 0 10px;">Upload from your device, or paste a web link.</p>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <label for="amf-file" style="
            padding:8px 16px;border:1.5px solid rgba(0,0,0,0.1);
            border-radius:8px;cursor:pointer;font-size:13px;color:#475569;
            white-space:nowrap;transition:border-color 0.15s;
          ">Choose file</label>
          <input id="amf-file" type="file" accept="image/*" style="display:none;" />
          <span id="amf-file-name" style="font-size:12px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;">No file chosen</span>
        </div>
        <input id="amf-url" type="url" placeholder="Or paste image URL: https://…" style="${inputStyle()}" />

        <div id="amf-preview-wrap" style="margin:14px 0 0;display:none;text-align:center;">
          <img id="amf-preview" src="" alt="Preview" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,0,0,0.08);" />
        </div>

        <p id="amf-error" style="color:#ef4444;font-size:12px;min-height:18px;margin:14px 0 0;"></p>

        <div style="display:flex;gap:8px;margin-top:16px;">
          <button id="amf-cancel" style="${secondaryBtnStyle()}">Cancel</button>
          <button id="amf-save"   style="${primaryBtnStyle()}">Add Mentor</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const nameEl     = overlay.querySelector('#amf-name');
    const titleEl    = overlay.querySelector('#amf-title');
    const bioEl      = overlay.querySelector('#amf-bio');
    const fileInput  = overlay.querySelector('#amf-file');
    const fileNameEl = overlay.querySelector('#amf-file-name');
    const urlInput   = overlay.querySelector('#amf-url');
    const previewWrap = overlay.querySelector('#amf-preview-wrap');
    const previewImg = overlay.querySelector('#amf-preview');
    const errorEl    = overlay.querySelector('#amf-error');

    nameEl.focus();

    /* Focus styles */
    [nameEl, titleEl, bioEl, urlInput].forEach((inp) => {
      inp.addEventListener('focus', () => { inp.style.borderColor = '#8FB1D6'; });
      inp.addEventListener('blur',  () => { inp.style.borderColor = 'rgba(0,0,0,0.1)'; });
    });

    let base64Photo = null;

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

    urlInput.addEventListener('input', () => {
      base64Photo = null;
      fileInput.value = '';
      fileNameEl.textContent = 'No file chosen';
      const url = urlInput.value.trim();
      previewImg.src = url;
      previewWrap.style.display = url ? 'block' : 'none';
    });

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

    overlay.querySelector('#amf-save').addEventListener('click', save);
    overlay.querySelector('#amf-cancel').addEventListener('click', () => overlay.remove());
    nameEl.addEventListener('keydown',  (e) => { if (e.key === 'Enter') { e.preventDefault(); titleEl.focus(); } });
    titleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); bioEl.focus(); } });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  /* ============================================================
     ADMIN BUTTON
  ============================================================ */

  function createAdminButton() {
    const btn = document.createElement('button');
    btn.id = 'admin-lock-btn';
    btn.setAttribute('aria-label', 'Admin login');
    btn.innerHTML = lockIcon();
    btn.style.cssText = `
      position:fixed;bottom:20px;right:20px;z-index:9999;
      width:38px;height:38px;border-radius:50%;
      border:1px solid rgba(0,0,0,0.08);
      background:rgba(255,255,255,0.6);
      backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      cursor:pointer;display:flex;align-items:center;justify-content:center;
      opacity:0.25;transition:opacity 0.2s,transform 0.2s;color:#475569;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.85'; btn.style.transform = 'scale(1.08)'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = isEditMode ? '1' : '0.25'; btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', handleAdminClick);
    document.body.appendChild(btn);
  }

  function lockIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;pointer-events:none"><rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke-linecap="round"/></svg>`;
  }

  function unlockIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a6c56b" stroke-width="1.5" style="width:16px;height:16px;pointer-events:none"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1" stroke-linecap="round"/></svg>`;
  }

  /* ============================================================
     PASSWORD MODAL
  ============================================================ */

  function showPasswordModal() {
    const overlay = document.createElement('div');
    overlay.id = 'admin-modal-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:10001;
      background:rgba(11,15,20,0.65);
      backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;
    `;

    overlay.innerHTML = `
      <div style="
        background:#fff;border-radius:24px;padding:40px 36px 32px;
        max-width:340px;width:90%;
        box-shadow:0 40px 80px -20px rgba(0,0,0,0.35);
        font-family:Inter,system-ui,sans-serif;
      ">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:500;color:#0F172A;margin:0 0 6px;">Admin Access</p>
        <p style="font-size:13px;color:#475569;margin:0 0 24px;">Enter the password to edit site content.</p>
        <input id="admin-pw-input" type="password" placeholder="Password" autocomplete="current-password" style="${inputStyle()}" />
        <p id="admin-pw-error" style="color:#ef4444;font-size:12px;min-height:18px;margin:0 0 16px;"></p>
        <div style="display:flex;gap:8px;">
          <button id="admin-cancel-btn" style="${secondaryBtnStyle()}">Cancel</button>
          <button id="admin-enter-btn"  style="${primaryBtnStyle()}">Enter</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input    = overlay.querySelector('#admin-pw-input');
    const error    = overlay.querySelector('#admin-pw-error');
    const enterBtn  = overlay.querySelector('#admin-enter-btn');
    const cancelBtn = overlay.querySelector('#admin-cancel-btn');

    input.focus();
    input.addEventListener('focus', () => { input.style.borderColor = '#8FB1D6'; });
    input.addEventListener('blur',  () => { input.style.borderColor = 'rgba(0,0,0,0.1)'; });

    const tryLogin = () => {
      if (input.value === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        overlay.remove();
        enterEditMode();
      } else {
        error.textContent = 'Incorrect password. Try again.';
        input.value = '';
        input.focus();
        input.style.borderColor = '#ef4444';
        setTimeout(() => { input.style.borderColor = '#8FB1D6'; }, 600);
      }
    };

    enterBtn.addEventListener('click', tryLogin);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
    cancelBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  /* ============================================================
     TOOLBAR
  ============================================================ */

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

  /* ============================================================
     ENTER / EXIT EDIT MODE
  ============================================================ */

  function injectAdminStyles() {
    if (document.getElementById('admin-inline-styles')) return;
    const s = document.createElement('style');
    s.id = 'admin-inline-styles';
    s.textContent = `
      [data-mentor-field][contenteditable="true"]:empty::before {
        content: attr(data-placeholder);
        color: #94a3b8;
        pointer-events: none;
        font-style: italic;
      }
    `;
    document.head.appendChild(s);
  }

  function enterEditMode() {
    isEditMode = true;
    injectAdminStyles();

    const btn = document.getElementById('admin-lock-btn');
    if (btn) { btn.innerHTML = unlockIcon(); btn.style.opacity = '1'; }

    createToolbar();

    const lang = window.GuateLifeI18n ? window.GuateLifeI18n.getLanguage() : 'en';

    function onFocus(e) {
      Object.assign(e.currentTarget.style, { outline: '2px solid #A6C56B', background: 'rgba(166,197,107,0.07)' });
    }
    function onBlur(e) {
      const el = e.currentTarget;
      Object.assign(el.style, { outline: '2px dashed rgba(166,197,107,0.45)', background: '' });
      saveOverride(lang, el.dataset.adminKey, el.innerHTML);
    }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.contentEditable = 'true';
      el.dataset.adminKey = el.getAttribute('data-i18n');
      Object.assign(el.style, {
        outline: '2px dashed rgba(166,197,107,0.45)',
        borderRadius: '3px', cursor: 'text', minWidth: '20px',
      });
      el.addEventListener('focus', onFocus, { capture: true });
      el.addEventListener('blur',  onBlur,  { capture: true });
    });

    window._adminOnFocus = onFocus;
    window._adminOnBlur  = onBlur;

    /* Mentor cards — re-render with edit controls */
    if (getMentorsGrid()) refreshAllMentors();
  }

  function exitEditMode() {
    isEditMode = false;
    sessionStorage.removeItem(SESSION_KEY);

    const toolbar = document.getElementById('admin-edit-toolbar');
    if (toolbar) toolbar.remove();

    const btn = document.getElementById('admin-lock-btn');
    if (btn) { btn.innerHTML = lockIcon(); btn.style.opacity = '0.25'; }

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.contentEditable = 'false';
      Object.assign(el.style, { outline: '', borderRadius: '', cursor: '', background: '', minWidth: '' });
      if (window._adminOnFocus) el.removeEventListener('focus', window._adminOnFocus, { capture: true });
      if (window._adminOnBlur)  el.removeEventListener('blur',  window._adminOnBlur,  { capture: true });
    });

    /* Re-render mentor cards without edit controls */
    if (getMentorsGrid()) refreshAllMentors();
  }

  function handleAdminClick() {
    if (isEditMode) exitEditMode();
    else showPasswordModal();
  }

  /* ============================================================
     STYLE HELPERS
  ============================================================ */

  function labelStyle() {
    return 'display:block;font-size:11px;font-weight:600;color:#0F172A;margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase;';
  }

  function inputStyle() {
    return 'width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.15s;margin-bottom:6px;';
  }

  function primaryBtnStyle() {
    return 'flex:1;padding:11px;border:none;border-radius:10px;background:#0F172A;color:#fff;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;';
  }

  function secondaryBtnStyle() {
    return 'flex:1;padding:11px;border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;background:transparent;cursor:pointer;font-size:13px;color:#475569;font-family:inherit;';
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function initials(name) {
    return String(name).trim().split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
  }

  /* ============================================================
     INIT
  ============================================================ */

  async function init() {
    createAdminButton();

    /* Load saved text overrides and mentors from Firestore (i18n has already run before this script) */
    await Promise.all([loadOverridesFromFirestore(), loadMentorsFromFirestore()]);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
