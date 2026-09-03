/* Double Digital, konsept C, scrollcraft-pass.
   Tier 1: forvandlingen skjer mens man ser paa. Hver prove er et staalpanel
   med hele nettsiden inni, og kuttlinjen drives av rullingen eller av haanden.
   Signatur: merket kommer fra hverandre i heroen og samles i avslutningen.
   Alt bak html.anim; uten skript eller med reduced motion er siden statisk og
   komplett. Bevegelse er transform og klipp, aldri opacity mot null. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;
  const bred = () => matchMedia('(min-width: 761px)').matches;

  /* ---- forvandlingen ---------------------------------------------------- */
  const rammer = [...document.querySelectorAll('[data-wipe]')];
  const sett = (r, x) => { x = Math.max(0, Math.min(100, x)); r.style.setProperty('--x', x.toFixed(1) + '%'); const i = r.querySelector('.wipe-range'); if (i && Math.abs(i.value - x) > .5) i.value = x; };
  rammer.forEach(r => {
    const i = r.querySelector('.wipe-range'); if (!i) return;
    i.addEventListener('input', () => { r.classList.add('brukt'); sett(r, +i.value); });
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
      const p = (h - b.top) / (h + b.height);
      sett(r, glatt(Math.max(0, Math.min(1, (p - .12) / .76))) * 100);
    });
  };
  addEventListener('scroll', drivRammer, { passive: true }); addEventListener('resize', drivRammer, { passive: true });
  drivRammer();

  /* ---- meny og topp ------------------------------------------------------ */
  const header = document.querySelector('[data-header]');
  const knapp = document.querySelector('[data-menu-toggle]');
  const meny = document.querySelector('[data-menu]');
  if (header && knapp && meny) {
    knapp.addEventListener('click', () => { const aapen = header.classList.toggle('is-menu-open'); knapp.setAttribute('aria-expanded', String(aapen)); });
    meny.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { header.classList.remove('is-menu-open'); knapp.setAttribute('aria-expanded', 'false'); }));
  }
  if (header) { const t = () => header.classList.toggle('er-nede', scrollY > 80); addEventListener('scroll', t, { passive: true }); t(); }

  if (rolig || !window.gsap || !window.ScrollTrigger) return;   // statisk og komplett
  rot.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('klar'));

  /* ---- ordmasker: ordet ligger under en klippekant til det avslores -------- */
  const del = el => {
    if (el.dataset.delt !== undefined) return; el.dataset.delt = '';
    // gaa gjennom barna, saa <br> og lenker overlever delingen
    const noder = [...el.childNodes]; el.textContent = '';
    noder.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(bit => {
          if (!bit) return;
          if (/^\s+$/.test(bit)) { el.appendChild(document.createTextNode(' ')); return; }
          const y = document.createElement('span'); y.className = 'w'; const z = document.createElement('span'); z.textContent = bit; y.appendChild(z); el.appendChild(y);
        });
      } else el.appendChild(n);   // <br>, <a>, <strong>: uendret
    });
  };
  const TEKST = '.hero h1, .hero-lede, h2, .lead, .people-text p:not(.eyebrow), .contact-grid p:not(.eyebrow)';
  document.querySelectorAll(TEKST).forEach(del);
  const avslor = (el, delay = 0) => gsap.to(el.querySelectorAll('.w > span'), { y: 0, duration: .9, ease: 'power3.out', stagger: .035, delay });
  const heroH1 = document.querySelector('.hero h1'), heroLede = document.querySelector('.hero-lede');
  if (heroH1) avslor(heroH1, .15); if (heroLede) avslor(heroLede, .5);
  document.querySelectorAll(TEKST).forEach(el => {
    if (el.closest('.hero')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => avslor(el) });
  });

  /* ---- signaturen: merket kommer fra hverandre --------------------------- */
  const stage = document.querySelector('.emblem-stage');
  const eL = document.querySelector('.emblem-l'), eR = document.querySelector('.emblem-r');
  const tray = document.querySelector('.tray-wrap'), stack = document.querySelector('.hero-stack');
  if (hero && stage && eL && eR && tray && bred()) {
    gsap.set(tray, { y: '58vh' });
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=130%', pin: true, scrub: .8, anticipatePin: 1 } })
      .to(eL, { x: '-34vw', scale: .78, rotateY: 18, ease: 'none' }, 0)
      .to(eR, { x: '37vw', scale: 1.06, rotateY: -14, ease: 'none' }, 0)
      .to(stack, { y: -60, ease: 'none' }, 0)
      .to(stack.querySelectorAll('.w > span'), { y: '-112%', stagger: .01, ease: 'none' }, .15)
      .to(tray, { y: 0, ease: 'none' }, .1)
      .fromTo('.scene-far', { scale: 1 }, { scale: 1.12, ease: 'none' }, 0);
  }

  /* ---- arbeid: to spalter i to hastigheter -------------------------------- */
  const work = document.querySelector('.work');
  if (work && bred()) gsap.utils.toArray('.proeve').forEach((p, k) => {
    gsap.fromTo(p, { y: k % 2 ? 90 : 30 }, { y: k % 2 ? -110 : -30, ease: 'none', scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray('.plate.frame, .tray-plate, .people-plates .plate').forEach(p => {
    gsap.fromTo(p, { scale: .965, y: 28 }, { scale: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 92%', once: true } });
  });

  /* ---- metode: blokken kommer inn fra siden, stegene i rekke --------------- */
  const gb = document.querySelector('.green-block');
  if (gb) {
    gsap.fromTo(gb, { x: 80, rotateY: 8, transformPerspective: 1200 }, { x: 0, rotateY: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: gb, start: 'top 85%', once: true } });
    gsap.fromTo(gb.querySelectorAll('li'), { x: 34 }, { x: 0, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: gb, start: 'top 80%', once: true } });
  }

  /* ---- hvem vi er: to plater i to hastigheter ----------------------------- */
  const pl = gsap.utils.toArray('.people-plates > *');
  if (pl.length === 2 && bred()) {
    gsap.fromTo(pl[0], { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.people', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(pl[1], { y: 90 }, { y: -90, ease: 'none', scrollTrigger: { trigger: '.people', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---- avslutningen: de to D-ene samles ---------------------------------- */
  const cl = document.querySelector('.emblem-cl'), cr = document.querySelector('.emblem-cr');
  if (cl && cr) gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'top 20%', scrub: .6 } })
    .fromTo(cl, { x: '-22vw', y: 40, rotateY: 22 }, { x: 0, y: 0, rotateY: 0, ease: 'none' }, 0)
    .fromTo(cr, { x: '22vw', y: -40, rotateY: -22 }, { x: 0, y: 0, rotateY: 0, ease: 'none' }, 0);

  /* Sikring: et ord som ligger over synsranden skal aldri staa skjult, uansett
     om en trigger rakk aa fyre. Kjores paa rulling og paa storrelsesendring,
     og setter (ikke tweener) saa et helsidebilde viser alt umiddelbart. */
  const blokker = [...document.querySelectorAll(TEKST)].filter(el => !el.closest('.hero'));
  const sikre = () => {
    const h = innerHeight;
    for (let i = blokker.length - 1; i >= 0; i--) {
      if (blokker[i].getBoundingClientRect().top < h * .98) { gsap.set(blokker[i].querySelectorAll('.w > span'), { y: 0 }); blokker.splice(i, 1); }
    }
  };
  // helsidebilder i Playwright endrer ikke viewporten, saa det finnes ingen hendelse
  // aa lytte paa. Utskrift og opptaksverktoy faar en eksplisitt krok i stedet.
  const avslorAlt = () => { document.querySelectorAll('.w > span').forEach(s => { if (!s.closest('.hero')) gsap.set(s, { y: 0 }); }); blokker.length = 0; };
  window.__avslorAlt = avslorAlt;
  addEventListener('beforeprint', avslorAlt);
  addEventListener('resize', () => { ScrollTrigger.refresh(); sikre(); }, { passive: true });
  addEventListener('scroll', sikre, { passive: true });
  addEventListener('load', () => { ScrollTrigger.refresh(); sikre(); }, { once: true });
})();
