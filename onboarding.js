/* ============================================================
   GuateLife — onboarding wizard (mentor / student)
   One question per slide, Typeform-style. Vanilla JS, no deps.
   ============================================================ */
(function () {
  'use strict';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaqzanln';

  const SUBJECT_OPTIONS = [
    { id: 'math', label: { en: 'Math', es: 'Matemáticas' } },
    { id: 'language', label: { en: 'Language', es: 'Idiomas' } },
    { id: 'reading', label: { en: 'Reading', es: 'Lectura' } },
    { id: 'writing', label: { en: 'Writing', es: 'Escritura' } },
    { id: 'science', label: { en: 'Science', es: 'Ciencias' } },
    { id: 'computerSkills', label: { en: 'Computer Skills', es: 'Habilidades informáticas' } },
    { id: 'music', label: { en: 'Music', es: 'Música' } },
  ];

  const MEETING_OPTIONS = [
    { id: 'zoom', label: { en: 'Zoom', es: 'Zoom' } },
    { id: 'googleMeet', label: { en: 'Google Meet', es: 'Google Meet' } },
    { id: 'facetime', label: { en: 'FaceTime', es: 'FaceTime' } },
    { id: 'whatsapp', label: { en: 'WhatsApp', es: 'WhatsApp' } },
    { id: 'phoneCall', label: { en: 'Phone call', es: 'Llamada telefónica' } },
  ];

  const FLOWS = {
    mentor: {
      questions: [
        { id: 'name', type: 'text', label: { en: "What's your full name?", es: '¿Cuál es tu nombre completo?' }, placeholder: { en: 'Jane Doe', es: 'Jane Doe' } },
        { id: 'email', type: 'email', label: { en: "What's your email address?", es: '¿Cuál es tu dirección de correo electrónico?' }, placeholder: { en: 'jane@example.com', es: 'jane@example.com' } },
        {
          id: 'subjects',
          type: 'multiselect',
          label: { en: 'In what areas can you provide support?', es: '¿En qué áreas puedes brindar apoyo?' },
          options: SUBJECT_OPTIONS,
        },
        { id: 'languages', type: 'text', label: { en: 'What languages do you speak?', es: '¿Qué idiomas hablas?' }, placeholder: { en: 'e.g. English, Spanish', es: 'Ej. inglés, español' } },
        { id: 'availability', type: 'text', label: { en: 'How many hours per week can you commit?', es: '¿Cuántas horas por semana puedes dedicar?' }, placeholder: { en: 'e.g. 1-2 hours', es: 'Ej. 1-2 horas' } },
        { id: 'why', type: 'text', label: { en: 'Why do you want to mentor a student?', es: '¿Por qué quieres ser mentor de un estudiante?' }, placeholder: { en: 'Share a few words', es: 'Comparte algunas palabras' } },
      ],
      doneTitle: { en: "You're in!", es: '¡Listo, ya eres parte!' },
      doneMessage: {
        en: "Thanks for stepping up to mentor — we'll review your details and reach out soon with next steps.",
        es: 'Gracias por dar el paso para ser mentor. Revisaremos tu información y nos pondremos en contacto pronto con los próximos pasos.',
      },
    },
    student: {
      questions: [
        { id: 'name', type: 'text', label: { en: "What's your full name?", es: '¿Cuál es tu nombre completo?' }, placeholder: { en: 'Jane Doe', es: 'Jane Doe' } },
        { id: 'email', type: 'email', label: { en: "What's your email address?", es: '¿Cuál es tu dirección de correo electrónico?' }, placeholder: { en: 'jane@example.com', es: 'jane@example.com' } },
        { id: 'grade', type: 'text', label: { en: 'What grade or year are you in?', es: '¿En qué grado o año estás?' }, placeholder: { en: 'e.g. 10th grade', es: 'Ej. 10.º grado' } },
        { id: 'school', type: 'text', label: { en: 'What school do you attend?', es: '¿A qué escuela asistes?' }, placeholder: { en: 'School name', es: 'Nombre de la escuela' } },
        {
          id: 'subjects',
          type: 'multiselect',
          label: { en: 'What do you want to get better at?', es: '¿En qué quieres mejorar?' },
          options: SUBJECT_OPTIONS,
        },
        {
          id: 'meetingPreference',
          type: 'multiselect',
          label: { en: 'How would you prefer to meet with your mentor?', es: '¿Cómo prefieres reunirte con tu mentor?' },
          options: MEETING_OPTIONS,
        },
        { id: 'goals', type: 'text', label: { en: 'What are you hoping to get out of this program?', es: '¿Qué esperas obtener de este programa?' }, placeholder: { en: 'Share a few words', es: 'Comparte algunas palabras' } },
      ],
      doneTitle: { en: 'Thanks for applying!', es: '¡Gracias por postularte!' },
      doneMessage: {
        en: "We've received your application — we'll be in touch soon to match you with a mentor.",
        es: 'Hemos recibido tu solicitud. Pronto nos pondremos en contacto para conectarte con un mentor.',
      },
    },
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const i18n = window.GuateLifeI18n;

  let overlay, progressBar, body, closeBtn;
  let currentFlowKey = null;
  let currentStep = 0;
  let answers = {};
  let submitState = 'idle';
  let triggerEl = null;
  let lang = 'en';

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Onboarding');

    const track = document.createElement('div');
    track.className = 'onboarding-progress-track';
    progressBar = document.createElement('div');
    progressBar.className = 'onboarding-progress-bar';
    track.appendChild(progressBar);

    closeBtn = document.createElement('button');
    closeBtn.className = 'onboarding-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>';
    closeBtn.addEventListener('click', close);

    body = document.createElement('div');
    body.className = 'onboarding-body';

    overlay.appendChild(track);
    overlay.appendChild(closeBtn);
    overlay.appendChild(body);
    document.body.appendChild(overlay);

    overlay.addEventListener('keydown', onKeydown);
  }

  function open(flowKey, trigger) {
    if (!FLOWS[flowKey]) return;
    currentFlowKey = flowKey;
    currentStep = 0;
    answers = {};
    submitState = 'idle';
    triggerEl = trigger || null;
    lang = i18n.getLanguage();

    document.body.style.overflow = 'hidden';
    overlay.classList.add('open');
    render();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';

    const finish = () => {
      if (triggerEl) triggerEl.focus();
    };

    if (reduceMotion) finish();
    else overlay.addEventListener('transitionend', finish, { once: true });
  }

  function getFlow() {
    return FLOWS[currentFlowKey];
  }

  function render() {
    const flow = getFlow();
    const total = flow.questions.length;

    body.innerHTML = '';
    const content = document.createElement('div');
    content.className = 'onboarding-content onboarding-step';

    if (currentStep < total) {
      const q = flow.questions[currentStep];
      progressBar.style.width = `${((currentStep) / total) * 100}%`;

      const eyebrow = document.createElement('p');
      eyebrow.className = 'onboarding-eyebrow';
      eyebrow.textContent = i18n.t('wizard.common.step')
        .replace('{n}', currentStep + 1)
        .replace('{total}', total);

      const question = document.createElement('h2');
      question.className = 'onboarding-question';
      question.textContent = q.label[lang];

      const error = document.createElement('p');
      error.className = 'onboarding-error';

      const nav = document.createElement('div');
      nav.className = 'onboarding-nav';

      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'onboarding-back' + (currentStep === 0 ? ' hidden-step' : '');
      back.textContent = i18n.t('wizard.common.back');
      back.addEventListener('click', goBack);

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn-primary onboarding-continue cursor-pointer';
      next.textContent = currentStep === total - 1 ? i18n.t('wizard.common.submit') : i18n.t('wizard.common.continue');

      content.appendChild(eyebrow);
      content.appendChild(question);

      let focusTarget;

      if (q.type === 'multiselect') {
        const optionsWrap = document.createElement('div');
        optionsWrap.className = 'onboarding-options';

        const selected = new Set(answers[q.id] || []);

        q.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'onboarding-option' + (selected.has(opt.id) ? ' selected' : '');
          btn.textContent = opt.label[lang];
          btn.setAttribute('aria-pressed', selected.has(opt.id) ? 'true' : 'false');
          btn.addEventListener('click', () => {
            const isSelected = selected.has(opt.id);
            if (isSelected) selected.delete(opt.id);
            else selected.add(opt.id);
            answers[q.id] = Array.from(selected);
            btn.classList.toggle('selected', !isSelected);
            btn.setAttribute('aria-pressed', String(!isSelected));
            error.classList.remove('visible');
          });
          optionsWrap.appendChild(btn);
        });

        content.appendChild(optionsWrap);
        focusTarget = optionsWrap.querySelector('button');
      } else {
        const input = document.createElement('input');
        input.className = 'onboarding-input';
        input.type = q.type === 'email' ? 'email' : 'text';
        input.placeholder = q.placeholder[lang] || '';
        input.value = answers[q.id] || '';
        input.autocomplete = q.type === 'email' ? 'email' : 'off';
        input.setAttribute('aria-label', q.label[lang]);

        content.appendChild(input);
        focusTarget = input;
      }

      content.appendChild(error);

      next.addEventListener('click', () => goNext(focusTarget, error));

      nav.appendChild(back);
      nav.appendChild(next);
      content.appendChild(nav);

      body.appendChild(content);
      if (focusTarget) focusTarget.focus();
    } else {
      progressBar.style.width = '100%';
      content.classList.add('onboarding-done');
      content.style.textAlign = 'center';

      if (submitState === 'submitting') {
        const spinner = document.createElement('div');
        spinner.className = 'onboarding-spinner';

        const title = document.createElement('h2');
        title.className = 'onboarding-question';
        title.textContent = i18n.t('wizard.common.sending');

        content.appendChild(spinner);
        content.appendChild(title);

        body.appendChild(content);
      } else if (submitState === 'error') {
        const icon = document.createElement('div');
        icon.className = 'onboarding-done-icon onboarding-error-icon';
        icon.textContent = '!';

        const title = document.createElement('h2');
        title.className = 'onboarding-question';
        title.textContent = i18n.t('wizard.common.errorTitle');

        const message = document.createElement('p');
        message.className = 'mt-4 text-white/70 max-w-md mx-auto';
        message.textContent = i18n.t('wizard.common.errorBody');

        const nav = document.createElement('div');
        nav.className = 'onboarding-nav';
        nav.style.justifyContent = 'center';
        nav.style.gap = '1.5rem';

        const closeLink = document.createElement('button');
        closeLink.type = 'button';
        closeLink.className = 'onboarding-back';
        closeLink.textContent = i18n.t('wizard.common.close');
        closeLink.addEventListener('click', close);

        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'btn-primary cursor-pointer';
        retry.textContent = i18n.t('wizard.common.tryAgain');
        retry.addEventListener('click', () => {
          submitState = 'submitting';
          render();
          attemptSubmit();
        });

        nav.appendChild(closeLink);
        nav.appendChild(retry);

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(nav);

        body.appendChild(content);
        retry.focus();
      } else {
        const icon = document.createElement('div');
        icon.className = 'onboarding-done-icon';
        icon.innerHTML = '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        const title = document.createElement('h2');
        title.className = 'onboarding-question';
        title.textContent = flow.doneTitle[lang];

        const message = document.createElement('p');
        message.className = 'mt-4 text-white/70 max-w-md mx-auto';
        message.textContent = flow.doneMessage[lang];

        const nav = document.createElement('div');
        nav.className = 'onboarding-nav';
        nav.style.justifyContent = 'center';

        const done = document.createElement('button');
        done.type = 'button';
        done.className = 'btn-primary cursor-pointer';
        done.textContent = i18n.t('wizard.common.done');
        done.addEventListener('click', close);

        nav.appendChild(done);

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(nav);

        body.appendChild(content);
        done.focus();
      }
    }
  }

  function validate(q, value) {
    if (q.type === 'multiselect') {
      return value.length ? '' : i18n.t('wizard.common.required');
    }
    const trimmed = value.trim();
    if (!trimmed) return i18n.t('wizard.common.required');
    if (q.type === 'email' && !EMAIL_RE.test(trimmed)) return i18n.t('wizard.common.invalidEmail');
    return '';
  }

  function goNext(input, errorEl) {
    const flow = getFlow();
    const q = flow.questions[currentStep];
    const value = q.type === 'multiselect' ? (answers[q.id] || []) : input.value;
    const message = validate(q, value);

    if (message) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      if (q.type !== 'multiselect') input.focus();
      return;
    }

    if (q.type !== 'multiselect') answers[q.id] = value.trim();
    currentStep += 1;

    if (currentStep === flow.questions.length) {
      submitState = 'submitting';
      render();
      attemptSubmit();
    } else {
      render();
    }
  }

  function goBack() {
    if (currentStep === 0) return;
    currentStep -= 1;
    render();
  }

  function buildPayload() {
    const flow = getFlow();
    const isMentor = currentFlowKey === 'mentor';
    const formatted = {};

    Object.entries(answers).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        formatted[key] = value;
        return;
      }
      const q = flow.questions.find((item) => item.id === key);
      const options = (q && q.options) || [];
      formatted[key] = value
        .map((id) => {
          const opt = options.find((o) => o.id === id);
          return opt ? opt.label.en : id;
        })
        .join(', ');
    });

    return {
      ...formatted,
      'Submission type': isMentor ? 'Mentor application' : 'Student application',
      _subject: `New ${isMentor ? 'Mentor' : 'Student'} application — ${answers.name}`,
      _replyto: answers.email,
    };
  }

  async function attemptSubmit() {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayload()),
      });

      submitState = response.ok ? 'success' : 'error';
    } catch (err) {
      submitState = 'error';
    }

    render();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'Enter') {
      const active = document.activeElement;
      if (active && active.classList.contains('onboarding-input')) {
        e.preventDefault();
        const continueBtn = overlay.querySelector('.onboarding-continue');
        if (continueBtn) continueBtn.click();
        return;
      }
    }

    if (e.key === 'Tab') {
      const focusable = Array.from(
        overlay.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function init() {
    buildOverlay();
    document.querySelectorAll('[data-onboarding]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        open(el.dataset.onboarding, el);
      });
    });
  }

  init();
})();
