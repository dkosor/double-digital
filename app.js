/* Double Digital, konsept C. Ingen avhengigheter.
   Tier 1 er materialproven som vendes: hvert case-kort har for paa forsiden
   og etter paa baksiden, og vendes paa klikk, tap eller Enter. Alt annet er
   stotte. Bevegelse bak html.anim; siden er komplett uten skript. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;

  /* ---- vendingen ------------------------------------------------------- */
  const kort = [...document.querySelectorAll('[data-flip]')];
  const vend = (k, til) => {
    const paa = til === undefined ? !k.classList.contains('flipped') : til;
    k.classList.toggle('flipped', paa); k.classList.add('brukt');
    k.querySelectorAll('.flip-btn').forEach(b => b.setAttribute('aria-pressed', String(paa)));
    // fokus foelger den synlige siden, saa tastatur ikke lander bak kortet
    const maal = paa ? k.querySelector('.card-back .flip-btn') : k.querySelector('.card-front .flip-btn');
    if (maal && k.contains(document.activeElement)) maal.focus({ preventScroll: true });
  };
  kort.forEach(k => {
    k.querySelectorAll('.flip-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); vend(k); }));
    // klikk paa forsiden (ikke paa lenker) vender ogsaa
    k.querySelector('.card-front').addEventListener('click', e => { if (!e.target.closest('a,button')) vend(k, true); });
    k.addEventListener('keydown', e => { if (e.key === 'Escape' && k.classList.contains('flipped')) vend(k, false); });
  });

  /* ---- meny og topp ---------------------------------------------------- */
  const header = document.querySelector('[data-header]');
  const knapp = document.querySelector('[data-menu-toggle]');
  const meny = document.querySelector('[data-menu]');
  if (header && knapp && meny) {
    knapp.addEventListener('click', () => {
      const aapen = header.classList.toggle('is-menu-open'); knapp.setAttribute('aria-expanded', String(aapen));
    });
    meny.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { header.classList.remove('is-menu-open'); knapp.setAttribute('aria-expanded', 'false'); }));
  }
  if (header) { const t = () => header.classList.toggle('er-nede', scrollY > 80); addEventListener('scroll', t, { passive: true }); t(); }

  if (rolig) return;
  rot.classList.add('anim');

  /* ---- heroen kommer inn ----------------------------------------------- */
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('klar'));

  /* ---- avslor ved rulling: posisjonssjekk, ikke IntersectionObserver ----
     Rask rulling gjor at observatoren gaar glipp av det som farer forbi, og
     det blir staaende. En sjekk per rullehendelse kan ikke gaa glipp av noe,
     og bunnen av siden faar egen regel der terskelen ellers aldri krysses. */
  const GRUPPER = [
    ['.green-block li', 80], ['.work > .shell:first-child > *', 90], ['.card', 120],
    ['.method-text > *', 90], ['.green-block', 0],
    ['.people-text > *', 90], ['.person', 130],
    ['.green-band > *', 110], ['.site-footer', 0],
  ];
  const emner = [];
  GRUPPER.forEach(([v, trinn]) => {
    const teller = new Map();
    document.querySelectorAll(v).forEach(el => {
      if (el.dataset.inn !== undefined) return;
      if (el.parentElement.closest('[data-inn]')) return;
      if (el.querySelector('[data-inn]')) return;
      const p = el.parentElement, i = teller.get(p) || 0; teller.set(p, i + 1);
      el.dataset.inn = ''; el.style.setProperty('--nol', (i * trinn) + 'ms'); emner.push(el);
    });
  });
  // ett kort viser vendingen en gang, saa man skjonner hva provene gjor.
  // Avbrytes av forste beroering, og vendes tilbake av seg selv.
  const demo = kort[kort.length - 1]; let demoGjort = false;
  const sjekk = () => {
    const h = innerHeight, iBunn = scrollY + h >= rot.scrollHeight - 2, grense = iBunn ? h : h * 0.92;
    for (let i = emner.length - 1; i >= 0; i--) if (emner[i].getBoundingClientRect().top < grense) { emner[i].classList.add('inne'); emner.splice(i, 1); }
    if (demo && !demoGjort && demo.getBoundingClientRect().top < h * 0.7) {
      demoGjort = true;
      setTimeout(() => { if (!demo.classList.contains('brukt')) { demo.classList.add('flipped');
        setTimeout(() => { if (!demo.classList.contains('brukt')) demo.classList.remove('flipped'); }, 2600); } }, 500);
    }
    if (!emner.length && demoGjort) { removeEventListener('scroll', sjekk); removeEventListener('resize', sjekk); }
  };
  addEventListener('scroll', sjekk, { passive: true }); addEventListener('resize', sjekk, { passive: true });
  addEventListener('load', sjekk, { once: true }); sjekk();
})();
