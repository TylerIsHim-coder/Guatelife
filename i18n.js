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

      'hero.title': `Connecting Guatemala's students<br class="hidden md:block" /> to a world of opportunity.`,
      'hero.subtitle': `We pair ambitious students with world-class mentors and the resources to turn potential into opportunity.`,

      'trust.heading': `Building on the world's best learning resources`,

      'mission.eyebrow': `Our mission`,
      'mission.heading': `Talent is everywhere.<br />\n<span class="italic text-muted">Opportunity is not.</span>`,
      'mission.body': `Across Guatemala, brilliant students are held back not by ability, but by access. GuateLife closes that gap — connecting them with mentors, knowledge, and a global community that believes in their potential.`,
      'mission.seeHow': `See how it works`,
      'mission.cardSubtitle': `Personal mentorship, matched with care`,
      'mission.point1': `Vetted, world-class mentors`,
      'mission.point2': `Free, lifelong learning access`,
      'mission.point3': `Guidance in Spanish &amp; English`,

      'how.heading': `Three steps to a changed life.`,
      'how.step1.label': `Step 01`,
      'how.step1.title': `Match`,
      'how.step1.body': `We pair each student with a mentor aligned to their goals, language, and ambitions.`,
      'how.step2.label': `Step 02`,
      'how.step2.title': `Mentor`,
      'how.step2.body': `Weekly sessions, curated Khan Academy paths, and real human guidance build momentum.`,
      'how.step3.label': `Step 03`,
      'how.step3.title': `Mobilize`,
      'how.step3.body': `Students unlock scholarships, universities, and careers — then return to lift the next.`,

      'paths.heading': `There's a place for you here.`,
      'paths.mentorEyebrow': `For Mentors`,
      'paths.mentorTitle': `Share an hour.<br />Change a trajectory.`,
      'paths.mentorBody': `Give one hour a week. We handle the matching, scheduling, and curriculum — you bring perspective and belief.`,
      'paths.studentEyebrow': `For Students`,
      'paths.studentTitle': `Your potential,<br />finally unlocked.`,
      'paths.studentBody': `Free mentorship, world-class resources, and a community invested in your future. No cost — ever.`,

      'cta.heading': `Transforming futures<br /><span class="italic text-white/90">through mentorship.</span>`,
      'cta.body': `Whether you have an hour to give or a future to build — your next chapter starts here.`,

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
      'about.subtitle': `GuateLife started with a simple belief: a student's future shouldn't depend on their zip code. Here's why we exist, and the difference we're making together.`,

      'story.eyebrow': `Why we started`,
      'story.body1': `Across Guatemala, brilliant students are locked out of their future — not by a lack of ability, but by a lack of access. GuateLife exists to shatter that barrier. We bridge the distance, connecting driven students with the mentors, knowledge, and global networks necessary to turn raw potential into an undeniable reality.`,
      'story.cardHeading': `What we believe`,
      'story.belief1': `Access, not charity — every student deserves the same starting line.`,
      'story.belief2': `Mentorship works best one relationship at a time.`,
      'story.belief3': `Students who rise, return — and lift the next generation.`,

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

      'hero.title': `Conectamos a los estudiantes de Guatemala<br class="hidden md:block" /> con un mundo de oportunidades.`,
      'hero.subtitle': `Conectamos a estudiantes con ambición con mentores de clase mundial y los recursos para convertir su potencial en oportunidades.`,

      'trust.heading': `Construimos sobre los mejores recursos educativos del mundo`,

      'mission.eyebrow': `Nuestra misión`,
      'mission.heading': `El talento está en todas partes.<br />\n<span class="italic text-muted">Las oportunidades no.</span>`,
      'mission.body': `En toda Guatemala, estudiantes brillantes se ven limitados no por su capacidad, sino por su acceso. GuateLife cierra esa brecha, conectándolos con mentores, conocimiento y una comunidad global que cree en su potencial.`,
      'mission.seeHow': `Descubre cómo funciona`,
      'mission.cardSubtitle': `Mentoría personalizada, con dedicación`,
      'mission.point1': `Mentores de clase mundial, verificados`,
      'mission.point2': `Acceso gratuito de aprendizaje para toda la vida`,
      'mission.point3': `Guía en español e inglés`,

      'how.heading': `Tres pasos hacia una vida transformada.`,
      'how.step1.label': `Paso 01`,
      'how.step1.title': `Conexión`,
      'how.step1.body': `Conectamos a cada estudiante con un mentor afín a sus metas, idioma y ambiciones.`,
      'how.step2.label': `Paso 02`,
      'how.step2.title': `Mentoría`,
      'how.step2.body': `Sesiones semanales, rutas seleccionadas de Khan Academy y orientación humana real generan impulso.`,
      'how.step3.label': `Paso 03`,
      'how.step3.title': `Impulso`,
      'how.step3.body': `Los estudiantes acceden a becas, universidades y carreras — y luego regresan para impulsar a los siguientes.`,

      'paths.heading': `Aquí hay un lugar para ti.`,
      'paths.mentorEyebrow': `Para Mentores`,
      'paths.mentorTitle': `Comparte una hora.<br />Cambia un destino.`,
      'paths.mentorBody': `Dona una hora a la semana. Nosotros nos encargamos de las conexiones, la programación y el plan de estudios; tú aportas perspectiva y confianza.`,
      'paths.studentEyebrow': `Para Estudiantes`,
      'paths.studentTitle': `Tu potencial,<br />por fin desatado.`,
      'paths.studentBody': `Mentoría gratuita, recursos de clase mundial y una comunidad comprometida con tu futuro. Sin costo, nunca.`,

      'cta.heading': `Transformando futuros<br /><span class="italic text-white/90">a través de la mentoría.</span>`,
      'cta.body': `Ya sea que tengas una hora para dar o un futuro por construir, tu próximo capítulo comienza aquí.`,

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
      'about.subtitle': `GuateLife nació de una creencia simple: el futuro de un estudiante no debería depender de su código postal. Esta es la razón de nuestra existencia y la diferencia que estamos logrando juntos.`,

      'story.eyebrow': `Por qué empezamos`,
      'story.body1': `En toda Guatemala, estudiantes brillantes se ven excluidos de su futuro, no por falta de capacidad, sino por falta de acceso. GuateLife existe para romper esa barrera. Acortamos la distancia, conectando a estudiantes decididos con los mentores, el conocimiento y las redes globales necesarias para convertir el potencial en bruto en una realidad innegable.`,
      'story.cardHeading': `Lo que creemos`,
      'story.belief1': `Acceso, no caridad: cada estudiante merece el mismo punto de partida.`,
      'story.belief2': `La mentoría funciona mejor una relación a la vez.`,
      'story.belief3': `Los estudiantes que progresan, regresan e impulsan a la siguiente generación.`,

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

    document.querySelectorAll('.lang-toggle-code').forEach((el) => {
      el.textContent = lang.toUpperCase();
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
