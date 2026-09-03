/* Double Digital, Magasinet.
   Tier 1: oppslaget vendes. Den nye siden skyves opp over den gamle langs
   bildetekststripen, drevet av rullingen, eller av haanden. Linjer avslores
   gjennom klipp. Alt bak html.anim; uten skript eller med reduced motion er
   siden statisk og komplett. Bevegelse er transform og klipp, aldri opacity mot null. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;

  /* ---- oppslaget vendes ------------------------------------------------- */
  const rammer = [...document.querySelectorAll('[data-vend]')];
  const sett = (r, y) => { y = Math.max(0, Math.min(100, y)); r.style.setProperty('--y', y.toFixed(1) + '%'); const i = r.querySelector('.vend'); if (i && Math.abs(i.value - y) > .5) i.value = y; };
  rammer.forEach(r => {
    const i = r.querySelector('.vend'); if (!i) return;
    // skyveren er vannrett av natur; her betyr hoyere verdi mer av den nye siden
    i.addEventListener('input', () => { r.classList.add('brukt'); sett(r, +i.value); });
    // loddrett drag rett paa rammen
    let drar = false;
    const til = ev => { const b = r.getBoundingClientRect(); sett(r, (b.bottom - ev.clientY) / b.height * 100); };
    i.addEventListener('pointerdown', ev => { drar = true; r.classList.add('brukt'); i.setPointerCapture(ev.pointerId); til(ev); ev.preventDefault(); });
    i.addEventListener('pointermove', ev => { if (drar) til(ev); });
    i.addEventListener('pointerup', () => { drar = false; }); i.addEventListener('pointercancel', () => { drar = false; });
    sett(r, rolig ? 50 : 0);
  });
  const glatt = t => t * t * (3 - 2 * t);
  const driv = () => {
    if (rolig) return;
    const h = innerHeight;
    rammer.forEach(r => {
      if (r.classList.contains('brukt')) return;
      const b = r.getBoundingClientRect(); if (b.bottom < 0 || b.top > h) return;
      const p = (h - b.top) / (h + b.height);
      sett(r, glatt(Math.max(0, Math.min(1, (p - .14) / .72))) * 100);
    });
  };
  addEventListener('scroll', driv, { passive: true }); addEventListener('resize', driv, { passive: true }); driv();

  /* ---- meny og topp ------------------------------------------------------ */
  const header = document.querySelector('[data-header]'), knapp = document.querySelector('[data-menu-toggle]'), meny = document.querySelector('[data-menu]');
  if (header && knapp && meny) {
    knapp.addEventListener('click', () => { const a = header.classList.toggle('is-menu-open'); knapp.setAttribute('aria-expanded', String(a)); });
    meny.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { header.classList.remove('is-menu-open'); knapp.setAttribute('aria-expanded', 'false'); }));
  }
  if (header) { const t = () => header.classList.toggle('er-nede', scrollY > 40); addEventListener('scroll', t, { passive: true }); t(); }

  if (rolig || !window.gsap || !window.ScrollTrigger) return;   // statisk og komplett
  rot.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);

  /* ---- linjeavsloring: hver linje faar en indre wrapper som glir opp ------- */
  document.querySelectorAll('.linjer > span').forEach(s => { const i = document.createElement('i'); while (s.firstChild) i.appendChild(s.firstChild); s.appendChild(i); });
  const avslor = (el, delay = 0) => gsap.to(el.querySelectorAll('.linjer > span > i, :scope > span > i'), { y: 0, duration: 1, ease: 'power3.out', stagger: .09, delay });
  const forside = document.querySelectorAll('.forside .linjer');
  forside.forEach((el, k) => avslor(el, .15 + k * .25));
  const blokker = [...document.querySelectorAll('.linjer')].filter(el => !el.closest('.forside'));
  blokker.forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => avslor(el) }));

  /* ---- lag i tre hastigheter ---------------------------------------------- */
  gsap.utils.toArray('.oppslag').forEach(o => {
    const tall = o.querySelector('.sidetall'), ramme = o.querySelector('.ramme');
    gsap.fromTo(tall, { y: -22 }, { y: 22, ease: 'none', scrollTrigger: { trigger: o, start: 'top bottom', end: 'bottom top', scrub: true } });   // foran, raskt
    gsap.fromTo(ramme, { scale: .985 }, { scale: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: ramme, start: 'top 92%', once: true } });
  });
  gsap.utils.toArray('.steg li').forEach((li, k) => gsap.fromTo(li, { x: 16 }, { x: 0, duration: .8, delay: k * .08, ease: 'power3.out', scrollTrigger: { trigger: '.steg', start: 'top 85%', once: true } }));
  const pl = gsap.utils.toArray('.plater figure');
  if (pl.length === 2 && matchMedia('(min-width: 641px)').matches) {
    gsap.fromTo(pl[0], { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.oss', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(pl[1], { y: 70 }, { y: -70, ease: 'none', scrollTrigger: { trigger: '.oss', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---- sikring: en linje over synsranden staar aldri skjult ---------------- */
  const sikre = () => { const h = innerHeight; for (let i = blokker.length - 1; i >= 0; i--) if (blokker[i].getBoundingClientRect().top < h * .98) { gsap.set(blokker[i].querySelectorAll('span > i'), { y: 0 }); blokker.splice(i, 1); } };
  const avslorAlt = () => { document.querySelectorAll('.linjer > span > i').forEach(i => gsap.set(i, { y: 0 })); blokker.length = 0; };
  window.__avslorAlt = avslorAlt; addEventListener('beforeprint', avslorAlt);
  addEventListener('scroll', sikre, { passive: true }); addEventListener('resize', () => { ScrollTrigger.refresh(); sikre(); }, { passive: true });
  addEventListener('load', () => { ScrollTrigger.refresh(); sikre(); }, { once: true });
})();
