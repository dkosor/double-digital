/* Double Digital, konsept C. Ingen avhengigheter.
   Tier 1 er materialproven som vendes: hvert case-kort har for paa forsiden
   og etter paa baksiden, og vendes paa klikk, tap eller Enter. Alt annet er
   stotte. Bevegelse bak html.anim; siden er komplett uten skript. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;

  /* ---- forvandlingen: kuttlinjen drives av rullingen, eller av haanden -----
     Hver ramme har --x, andelen av den nye siden som er skjovet over den gamle.
     Standard: 0 naar rammen kommer inn nederst, 100 naar den gaar ut overst, saa
     man ser den gamle siden bli den nye mens man ruller. Drar man skyveren selv,
     vinner haanden og rullingen slipper den rammen. */
  const rammer = [...document.querySelectorAll('[data-wipe]')];
  const sett = (r, x) => { x = Math.max(0, Math.min(100, x)); r.style.setProperty('--x', x.toFixed(1) + '%'); const i = r.querySelector('.wipe-range'); if (i && Math.abs(i.value - x) > .5) i.value = x; };
  rammer.forEach(r => {
    const i = r.querySelector('.wipe-range'); if (!i) return;
    i.addEventListener('input', () => { r.classList.add('brukt'); sett(r, +i.value); });
    // med bevegelse starter rammen som den gamle siden og forvandles ved rulling;
    // uten bevegelse staar den paa 50 og kan dras
    sett(r, rolig ? 50 : 0);
  });
  const glatt = t => t * t * (3 - 2 * t);
  const drivRammer = () => {
    if (rolig) return;
    const h = innerHeight;
    rammer.forEach(r => {
      if (r.classList.contains('brukt')) return;
      const b = r.getBoundingClientRect();
      if (b.bottom < 0 || b.top > h) return;
      // 0 naar toppen av rammen kommer inn nederst, 1 naar bunnen gaar ut overst,
      // strukket litt saa forvandlingen skjer i det man faktisk ser paa rammen
      const p = (h - b.top) / (h + b.height);
      sett(r, glatt(Math.max(0, Math.min(1, (p - .12) / .76))) * 100);
    });
  };
  addEventListener('scroll', drivRammer, { passive: true }); addEventListener('resize', drivRammer, { passive: true });
  drivRammer();

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
    ['.green-block li', 80], ['.work > .shell:first-child > *', 90], ['.proeve', 110],
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
  const sjekk = () => {
    const h = innerHeight, iBunn = scrollY + h >= rot.scrollHeight - 2, grense = iBunn ? h : h * 0.92;
    for (let i = emner.length - 1; i >= 0; i--) if (emner[i].getBoundingClientRect().top < grense) { emner[i].classList.add('inne'); emner.splice(i, 1); }
    if (!emner.length) { removeEventListener('scroll', sjekk); removeEventListener('resize', sjekk); }
  };
  addEventListener('scroll', sjekk, { passive: true }); addEventListener('resize', sjekk, { passive: true });
  addEventListener('load', sjekk, { once: true }); sjekk();
})();
