/* ============================================================
   GuateLife — i18n (English / Spanish)
   Central translation dictionary + apply/toggle helpers.
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'guatelife-lang';

  const TRANSLATIONS = {
    en: {
      'nav.mission': `Mission`,
      'nav.how': `How it works`,
      'nav.involved': `Get involved`,
      'nav.about': `About Us`,
      'nav.lang': `Switch language`,

      'btn.becomeMentor': `Become a Mentor`,
      'btn.applyStudent': `Apply as a Student`,
      'btn.requestMentor': `Request a Mentor`,

      'hero.title': `Bridging and empowering students<br class="hidden md:block" /> to a world of possibilities.`,
      'hero.subtitle': `We pair ambitious students in Guatemala with the mentors and resources to turn potential into reality.`,

      'trust.heading': `Building on the world's best learning resources and partners`,

      'mission.eyebrow': `Our mission`,
      'mission.heading': `Talent is universal.<br />\n<span class="italic text-muted">Opportunity is not.</span>`,
      'mission.body': `Across Guatemala, brilliant students are held back not by ability, but by access. GuateLife closes that gap — connecting them with mentors, knowledge, and a global community that believes in their potential.`,
      'mission.seeHow': `See how it works`,
      'mission.cardSubtitle': `Personal mentorship, matched with care`,
      'mission.point1': `Vetted, top high school mentors from the U.S.`,
      'mission.point2': `Free, lifelong learning access`,
      'mission.point3': `Guidance in English, math, technology, and music`,

      'how.heading': `Three steps to a brighter future.`,
      'how.step1.label': `Step 01`,
      'how.step1.title': `Match`,
      'how.step1.body': `We pair each student with a dedicated mentor aligned to their academic goals, interests, and unique ambitions.`,
      'how.step2.label': `Step 02`,
      'how.step2.title': `Mentor`,
      'how.step2.body': `Weekly 1:1 online sessions and personalized learning paths provide the human guidance that drives real momentum.`,
      'how.step3.label': `Step 03`,
      'how.step3.title': `Mobilize`,
      'how.step3.body': `Students unlock their academic potential, graduate with confidence, and step into brighter futures.`,

      'paths.heading': `There's a place for you here.`,
      'paths.mentorEyebrow': `For Mentors`,
      'paths.mentorTitle': `Invest an hour.<br />A lifetime of impact.`,
      'paths.mentorBody': `Give just one hour a week. We handle the matching, logistics, and curriculum — you bring the perspective and belief.`,
      'paths.studentEyebrow': `For Students`,
      'paths.studentTitle': `Your potential.<br />Fully realized.`,
      'paths.studentBody': `Elite mentorship. World-class resources. An unwavering community invested in your success. Entirely free and conducted online via major video calling platforms.`,

      'cta.heading': `Be part of<br /><span class="italic text-white/90">the next chapter.</span>`,
      'cta.body': `Whether you have an hour to share or a future to forge — your next chapter begins here.`,

      'aboutCta.heading': `Be part of<br /><span class="italic text-white/90">the next chapter.</span>`,

      'footer.tagline': `Connecting Guatemala's students to a world of opportunity — one mentor, one future at a time.`,
      'footer.programHeading': `Program`,
      'footer.programMentor': `Become a mentor`,
      'footer.programApply': `Apply as a student`,
      'footer.orgHeading': `Organization`,
      'footer.partners': `Partners`,
      'footer.connectHeading': `Connect`,
      'footer.contact': `Contact`,
      'footer.donate': `Donate`,
      'footer.newsletter': `Newsletter`,
      'footer.copyright': `© 2026 GuateLife. Supporting students in Guatemala since 2025.`,
      'footer.privacy': `Privacy`,
      'footer.terms': `Terms`,

      'about.eyebrow': `About GuateLife`,
      'about.heading': `Our story,<br /><span class="italic text-white/80">our mission.</span>`,
      'about.subtitle': `GuateLife is dedicated to expanding educational equity in Guatemala. We partner with local schools and educators to identify ambitious students, matching them with the mentorship and material resources necessary for long-term academic success. Through our structured support network, we maximize student retention and engagement, providing educational institutions with a framework to transform student potential into measurable impact.`,

      'story.eyebrow': `Why we started`,
      'story.body1': `GuateLife, an extension of Hope Camp Guatemala, was founded by two brothers who kept meeting the same brilliant students since 2023 — youth full of curiosity and drive, who lacked the resources, guidance, and networks that turn potential into a brighter future.`,
      'story.body2': `So we built the bridge ourselves: free 1:1 weekly mentorship, curated learning paths from Khan Academy and Khan Academy Kids, and a growing community of partner schools across Guatemala — all designed around one motivated student at a time.`,
      'story.cardHeading': `What we believe`,
      'story.belief1': `Equity over charity — because every single child belongs at the exact same starting line.`,
      'story.belief2': `Connection over scale — because life-changing mentorship happens one deep relationship at a time.`,
      'story.belief3': `Legacy over handout — because the students who rise are the very ones who return to lift the next.`,

      'impact.eyebrow': `Our impact`,
      'impact.heading': `Momentum you can measure.`,
      'impact.stat1': `Students mentored`,
      'impact.stat2': `Mentorship hours given`,
      'impact.stat3': `Partner schools`,

      'mentors.eyebrow': `Meet our mentors`,
      'mentors.heading': `The people behind the mentorship.`,
      'mentors.m1.name': `Daniela Morales`,
      'mentors.m1.age': `Age 34`,
      'mentors.m1.bio': `Software engineer based in San Francisco, originally from Quetzaltenango. Daniela mentors students in math and computer science, helping them build confidence with code and problem-solving.`,
      'mentors.m2.name': `James Whitfield`,
      'mentors.m2.age': `Age 41`,
      'mentors.m2.bio': `High school English teacher with 15 years in the classroom. James works with students on reading, writing, and college essays — with a few terrible puns along the way.`,
      'mentors.m3.name': `Sofía Ramírez`,
      'mentors.m3.age': `Age 29`,
      'mentors.m3.bio': `Pre-med graduate student and first-generation college grad. Sofía mentors students in science and college prep, drawing on her own path from rural Guatemala to university.`,

      'alt.heroMountains': `Cinematic Guatemala highland mountains at golden hour`,

      'wizard.common.step': `Step {n} of {total}`,
      'wizard.common.back': `← Back`,
      'wizard.common.continue': `Continue`,
      'wizard.common.submit': `Submit`,
      'wizard.common.sending': `Sending your application…`,
      'wizard.common.errorTitle': `Something went wrong`,
      'wizard.common.errorBody': `We couldn't send your application, but your answers are still here. Please try again.`,
      'wizard.common.close': `Close`,
      'wizard.common.tryAgain': `Try again`,
      'wizard.common.done': `Done`,
      'wizard.common.required': `This field is required.`,
      'wizard.common.invalidEmail': `Please enter a valid email address.`,
    },
    es: {
      'nav.mission': `Misión`,
      'nav.how': `Cómo funciona`,
      'nav.involved': `Participa`,
      'nav.about': `Sobre Nosotros`,
      'nav.lang': `Cambiar idioma`,

      'btn.becomeMentor': `Sé Mentor`,
      'btn.applyStudent': `Postúlate como Estudiante`,
      'btn.requestMentor': `Solicita un Mentor`,

      'hero.title': `Conectando y empoderando a los estudiantes<br class="hidden md:block" /> hacia un mundo de posibilidades.`,
      'hero.subtitle': `Conectamos a estudiantes con ambición en Guatemala con los mentores y recursos para convertir su potencial en realidad.`,

      'trust.heading': `Construimos sobre los mejores recursos educativos y socios del mundo`,

      'mission.eyebrow': `Nuestra misión`,
      'mission.heading': `El talento es universal.<br />\n<span class="italic text-muted">Las oportunidades no.</span>`,
      'mission.body': `En toda Guatemala, estudiantes brillantes se ven limitados no por su capacidad, sino por su acceso. GuateLife cierra esa brecha, conectándolos con mentores, conocimiento y una comunidad global que cree en su potencial.`,
      'mission.seeHow': `Descubre cómo funciona`,
      'mission.cardSubtitle': `Mentoría personalizada, con dedicación`,
      'mission.point1': `Mentores verificados, de los mejores colegios de EE. UU.`,
      'mission.point2': `Acceso gratuito de aprendizaje para toda la vida`,
      'mission.point3': `Guía en inglés, matemáticas, tecnología y música`,

      'how.heading': `Tres pasos hacia un futuro más brillante.`,
      'how.step1.label': `Paso 01`,
      'how.step1.title': `Conexión`,
      'how.step1.body': `Conectamos a cada estudiante con un mentor dedicado, afín a sus metas académicas, intereses y ambiciones únicas.`,
      'how.step2.label': `Paso 02`,
      'how.step2.title': `Mentoría`,
      'how.step2.body': `Sesiones semanales 1:1 en línea y rutas de aprendizaje personalizadas brindan la guía humana que impulsa un progreso real.`,
      'how.step3.label': `Paso 03`,
      'how.step3.title': `Impulso`,
      'how.step3.body': `Los estudiantes desarrollan todo su potencial académico, se gradúan con confianza y avanzan hacia un futuro más brillante.`,

      'paths.heading': `Aquí hay un lugar para ti.`,
      'paths.mentorEyebrow': `Para Mentores`,
      'paths.mentorTitle': `Invierte una hora.<br />Un impacto de por vida.`,
      'paths.mentorBody': `Dona solo una hora a la semana. Nosotros nos encargamos de las conexiones, la logística y el plan de estudios; tú aportas la perspectiva y la confianza.`,
      'paths.studentEyebrow': `Para Estudiantes`,
      'paths.studentTitle': `Tu potencial.<br />Plenamente realizado.`,
      'paths.studentBody': `Mentoría de excelencia. Recursos de clase mundial. Una comunidad incondicional comprometida con tu éxito. Completamente gratuito y en línea a través de las principales plataformas de videollamadas.`,

      'cta.heading': `Sé parte de<br /><span class="italic text-white/90">el próximo capítulo.</span>`,
      'cta.body': `Ya sea que tengas una hora para compartir o un futuro por forjar, tu próximo capítulo comienza aquí.`,

      'aboutCta.heading': `Sé parte de<br /><span class="italic text-white/90">el próximo capítulo.</span>`,

      'footer.tagline': `Conectando a los estudiantes de Guatemala con un mundo de oportunidades, un mentor y un futuro a la vez.`,
      'footer.programHeading': `Programa`,
      'footer.programMentor': `Sé mentor`,
      'footer.programApply': `Postúlate como estudiante`,
      'footer.orgHeading': `Organización`,
      'footer.partners': `Socios`,
      'footer.connectHeading': `Conéctate`,
      'footer.contact': `Contacto`,
      'footer.donate': `Donar`,
      'footer.newsletter': `Boletín`,
      'footer.copyright': `© 2026 GuateLife. Apoyando a estudiantes en Guatemala desde 2025.`,
      'footer.privacy': `Privacidad`,
      'footer.terms': `Términos`,

      'about.eyebrow': `Sobre GuateLife`,
      'about.heading': `Nuestra historia,<br /><span class="italic text-white/80">nuestra misión.</span>`,
      'about.subtitle': `GuateLife se dedica a ampliar la equidad educativa en Guatemala. Nos asociamos con escuelas y educadores locales para identificar estudiantes ambiciosos, conectándolos con la mentoría y los recursos materiales necesarios para el éxito académico a largo plazo. A través de nuestra red estructurada de apoyo, maximizamos la retención y el compromiso estudiantil, brindando a las instituciones educativas un marco para transformar el potencial estudiantil en un impacto medible.`,

      'story.eyebrow': `Por qué empezamos`,
      'story.body1': `GuateLife, una extensión de Hope Camp Guatemala, fue fundada por dos hermanos que seguían encontrándose con los mismos estudiantes brillantes desde 2023 — jóvenes llenos de curiosidad y determinación, que carecían de los recursos, la orientación y las redes necesarias para convertir su potencial en un futuro más brillante.`,
      'story.body2': `Así que construimos el puente nosotros mismos: mentoría gratuita 1:1 cada semana, rutas de aprendizaje seleccionadas de Khan Academy y Khan Academy Kids, y una comunidad creciente de escuelas asociadas en toda Guatemala — todo diseñado en torno a un estudiante motivado a la vez.`,
      'story.cardHeading': `Lo que creemos`,
      'story.belief1': `Equidad antes que caridad — porque cada niño merece exactamente el mismo punto de partida.`,
      'story.belief2': `Conexión antes que escala — porque la mentoría que transforma vidas ocurre una relación profunda a la vez.`,
      'story.belief3': `Legado antes que limosna — porque los estudiantes que progresan son los mismos que regresan para impulsar al siguiente.`,

      'impact.eyebrow': `Nuestro impacto`,
      'impact.heading': `Resultados que puedes medir.`,
      'impact.stat1': `Estudiantes asesorados`,
      'impact.stat2': `Horas de mentoría brindadas`,
      'impact.stat3': `Escuelas asociadas`,

      'mentors.eyebrow': `Conoce a nuestros mentores`,
      'mentors.heading': `Las personas detrás de la mentoría.`,
      'mentors.m1.name': `Daniela Morales`,
      'mentors.m1.age': `34 años`,
      'mentors.m1.bio': `Ingeniera de software radicada en San Francisco, originaria de Quetzaltenango. Daniela asesora a estudiantes en matemáticas y ciencias de la computación, ayudándoles a ganar confianza con el código y la resolución de problemas.`,
      'mentors.m2.name': `James Whitfield`,
      'mentors.m2.age': `41 años`,
      'mentors.m2.bio': `Profesor de inglés de secundaria con 15 años en el aula. James trabaja con estudiantes en lectura, escritura y ensayos universitarios, con algunos chistes terribles en el camino.`,
      'mentors.m3.name': `Sofía Ramírez`,
      'mentors.m3.age': `29 años`,
      'mentors.m3.bio': `Estudiante de posgrado en medicina y primera generación en graduarse de la universidad. Sofía asesora a estudiantes en ciencias y preparación universitaria, basándose en su propio camino desde la Guatemala rural hasta la universidad.`,

      'alt.heroMountains': `Vista cinematográfica de las montañas del altiplano de Guatemala al atardecer`,

      'wizard.common.step': `Paso {n} de {total}`,
      'wizard.common.back': `← Atrás`,
      'wizard.common.continue': `Continuar`,
      'wizard.common.submit': `Enviar`,
      'wizard.common.sending': `Enviando tu solicitud…`,
      'wizard.common.errorTitle': `Algo salió mal`,
      'wizard.common.errorBody': `No pudimos enviar tu solicitud, pero tus respuestas siguen aquí. Por favor, inténtalo de nuevo.`,
      'wizard.common.close': `Cerrar`,
      'wizard.common.tryAgain': `Intentar de nuevo`,
      'wizard.common.done': `Listo`,
      'wizard.common.required': `Este campo es obligatorio.`,
      'wizard.common.invalidEmail': `Por favor ingresa una dirección de correo electrónico válida.`,
    },
  };

  function getLanguage() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  function t(key) {
    return TRANSLATIONS[getLanguage()][key];
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    const dict = TRANSLATIONS[lang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      if (dict[key] !== undefined) el.setAttribute('alt', dict[key]);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
    });

    const LANG_NAMES = { en: 'English', es: 'Español' };
    document.querySelectorAll('.lang-toggle-code').forEach((el) => {
      el.textContent = LANG_NAMES[lang] || lang.toUpperCase();
    });
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
  }

  function toggleLanguage() {
    setLanguage(getLanguage() === 'en' ? 'es' : 'en');
  }

  window.GuateLifeI18n = { getLanguage, setLanguage, applyLanguage, toggleLanguage, t };

  document.querySelectorAll('.lang-toggle').forEach((btn) => {
    btn.addEventListener('click', toggleLanguage);
  });

  applyLanguage(getLanguage());
})();
