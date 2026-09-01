/* Double Digital. Ingen avhengigheter.
   Tier 1 er kuttlinjen: den native skyveren som viser for og etter. Alt annet
   er stotte til den. Bevegelse legges paa av JS bak html.anim, saa siden er
   fullt lesbar uten skript, og hele laget staar av ved prefers-reduced-motion.
   Rulleavsloringer bruker transform alene, aldri opacity mot null. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;

  /* ---- kuttlinjen ------------------------------------------------------- */
  const skyvere = [...document.querySelectorAll('[data-compare]')];
  const sett = (k, v) => {
    k.style.setProperty('--split', v + '%');
    const etter = k.querySelector('[data-compare-after] img');
    if (etter) etter.style.width = k.clientWidth + 'px';
  };
  skyvere.forEach(k => {
    const r = k.querySelector('.compare-range');
    if (!r) return;
    const oppdater = () => sett(k, r.value);
    r.addEventListener('input', () => { k.classList.add('brukt'); oppdater(); });
    oppdater();
    if ('ResizeObserver' in window) new ResizeObserver(oppdater).observe(k);
    else addEventListener('resize', oppdater, { passive: true });
  });

  /* En tween paa --split. Brukes til aa demonstrere skyveren en gang, saa den
     leses som noe man kan dra og ikke som et stillbilde. Avbrytes av brukeren. */
  const sveip = (k, fra, til, ms, etterpaa) => {
    const r = k.querySelector('.compare-range');
    if (!r || k.classList.contains('brukt')) return;
    const t0 = performance.now();
    const e = x => 1 - Math.pow(1 - x, 3);
    const tikk = now => {
      if (k.classList.contains('brukt')) return;
      const p = Math.min(1, (now - t0) / ms);
      const v = fra + (til - fra) * e(p);
      r.value = v; sett(k, v);
      if (p < 1) requestAnimationFrame(tikk); else etterpaa && etterpaa();
    };
    requestAnimationFrame(tikk);
  };

  /* ---- meny paa smaa skjermer ------------------------------------------- */
  const header = document.querySelector('[data-header]');
  const knapp = document.querySelector('[data-menu-toggle]');
  const meny = document.querySelector('[data-menu]');
  if (header && knapp && meny) {
    const lukk = () => { header.classList.remove('is-menu-open'); knapp.setAttribute('aria-expanded', 'false'); };
    knapp.addEventListener('click', () => {
      const aapen = header.classList.toggle('is-menu-open');
      knapp.setAttribute('aria-expanded', String(aapen));
    });
    meny.querySelectorAll('a').forEach(a => a.addEventListener('click', lukk));
  }

  /* ---- toppen strammer seg naar heroen er passert ------------------------ */
  if (header) {
    const topp = () => header.classList.toggle('er-nede', scrollY > 90);
    addEventListener('scroll', topp, { passive: true }); topp();
  }

  if (rolig) return;            // resten er bevegelse og skal ikke kjore da
  rot.classList.add('anim');

  /* ---- heroen kommer inn, og kuttlinjen viser seg selv en gang ---------- */
  const hero = document.querySelector('.hero');
  const heroSkyver = document.querySelector('.compare-hero');
  if (hero) {
    requestAnimationFrame(() => hero.classList.add('klar'));
    if (heroSkyver) {
      const r = heroSkyver.querySelector('.compare-range');
      if (r) { r.value = 0; sett(heroSkyver, 0); }
      setTimeout(() => sveip(heroSkyver, 0, 54, 1500), 700);
    }
  }

  /* ---- avslor ved rulling: posisjonssjekk, ikke IntersectionObserver ----
     Ruller man raskt rekker ikke observatoren aa registrere det som farer
     forbi, og det blir staaende. En posisjonssjekk per rullehendelse kan ikke
     gaa glipp av noe. Egen regel for bunnen, der terskelen ellers aldri kan
     krysses. Kalles direkte, ikke via requestAnimationFrame: et hoppet bilde
     er et element som aldri kommer, og det er et darligere bytte enn en
     layoutmaaling paa noen faa titalls elementer. */
  const GRUPPER = [
    ['.process-list li', 70],
    ['.work-intro > div > *', 90],
    ['.case-head', 0], ['.case-feature-layout > *', 120], ['.case-side-layout > *', 120],
    ['.roma-layout > *', 120], ['.case-foot', 0],
    ['.process-intro > *', 90], ['.commitments > div', 110],
    ['.people-intro > *', 90], ['.person', 120],
    ['.contact-grid > div > *', 90], ['.contact-status', 0],
  ];
  const emner = [];
  GRUPPER.forEach(([velger, trinn]) => {
    const teller = new Map();
    document.querySelectorAll(velger).forEach(el => {
      if (el.dataset.inn !== undefined) return;
      if (el.parentElement.closest('[data-inn]')) return;
      if (el.querySelector('[data-inn]')) return;
      const p = el.parentElement, i = teller.get(p) || 0; teller.set(p, i + 1);
      el.dataset.inn = ''; el.style.setProperty('--nol', (i * trinn) + 'ms');
      emner.push(el);
    });
  });
  const caseSkyvere = skyvere.filter(k => k !== heroSkyver);
  const emblem = document.querySelector('.contact-art');
  let emblemGjort = false;

  const sjekk = () => {
    const h = innerHeight;
    const iBunn = scrollY + h >= rot.scrollHeight - 2;
    const grense = iBunn ? h : h * 0.92;
    for (let i = emner.length - 1; i >= 0; i--) {
      if (emner[i].getBoundingClientRect().top < grense) {
        emner[i].classList.add('inne'); emner.splice(i, 1);
      }
    }
    // fugen setter seg i hvert case naar det kommer inn: 44 -> 50, en gang
    for (let i = caseSkyvere.length - 1; i >= 0; i--) {
      const b = caseSkyvere[i].getBoundingClientRect();
      if (b.top < h * 0.8 && b.bottom > 0) {
        const k = caseSkyvere.splice(i, 1)[0];
        const r = k.querySelector('.compare-range');
        if (r) { r.value = 44; sett(k, 44); }
        setTimeout(() => sveip(k, 44, 50, 900), 120);
      }
    }
    if (emblem && !emblemGjort && emblem.getBoundingClientRect().top < h * 0.85) {
      emblemGjort = true; emblem.classList.add('glimt');
    }
    if (!emner.length && !caseSkyvere.length && emblemGjort) {
      removeEventListener('scroll', sjekk); removeEventListener('resize', sjekk);
    }
  };
  addEventListener('scroll', sjekk, { passive: true });
  addEventListener('resize', sjekk, { passive: true });
  addEventListener('load', sjekk, { once: true });
  sjekk();

  /* ---- kromskinnen bak prosessen glir rolig ------------------------------ */
  const skinne = document.querySelector('.process-art');
  if (skinne && !matchMedia('(pointer: coarse)').matches) {
    let venter = false;
    const flytt = () => {
      venter = false;
      const b = skinne.parentElement.getBoundingClientRect();
      if (b.bottom < -200 || b.top > innerHeight + 200) return;
      const midt = (b.top + b.height / 2 - innerHeight / 2) / innerHeight;
      skinne.style.transform = `translate3d(0,${(midt * -26).toFixed(1)}px,0)`;
    };
    addEventListener('scroll', () => { if (!venter) { venter = true; requestAnimationFrame(flytt); } }, { passive: true });
    flytt();
  }
})();
