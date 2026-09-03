/* Double Digital, kapittelutgaven.
   Tier 1: fire fullskjerms kapitler som stables over hverandre (wow-catalog D2).
   Snittet i hvert kapittel drives av rullingen gjennom kapittelet, eller av
   haanden. Linjer avslores gjennom klipp. Alt bak html.anim; uten skript eller
   med reduced motion er siden en vanlig rekke og fullt lesbar. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;

  /* ---- snittet ------------------------------------------------------------ */
  const scener = [...document.querySelectorAll('[data-vend]')];
  const sett = (s, x) => { x = Math.max(0, Math.min(100, x)); s.style.setProperty('--x', x.toFixed(1) + '%');
    const i = s.querySelector('.vend'); if (i && Math.abs(i.value - x) > .5) i.value = x; };
  scener.forEach(s => {
    const i = s.querySelector('.vend'); if (!i) return;
    i.addEventListener('input', () => { s.classList.add('brukt'); sett(s, +i.value); });
    let drar = false;
    const til = ev => { const b = s.getBoundingClientRect(); sett(s, (ev.clientX - b.left) / b.width * 100); };
    i.addEventListener('pointerdown', ev => { drar = true; s.classList.add('brukt'); i.setPointerCapture(ev.pointerId); til(ev); ev.preventDefault(); });
    i.addEventListener('pointermove', ev => { if (drar) til(ev); });
    i.addEventListener('pointerup', () => { drar = false; }); i.addEventListener('pointercancel', () => { drar = false; });
    sett(s, rolig ? 50 : 0);
  });

  /* ---- meny og topp -------------------------------------------------------- */
  const header = document.querySelector('[data-header]'), knapp = document.querySelector('[data-menu-toggle]'), meny = document.querySelector('[data-menu]');
  if (header && knapp && meny) {
    knapp.addEventListener('click', () => { const a = header.classList.toggle('is-menu-open'); knapp.setAttribute('aria-expanded', String(a)); });
    meny.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { header.classList.remove('is-menu-open'); knapp.setAttribute('aria-expanded', 'false'); }));
  }
  if (header) { const t = () => header.classList.toggle('er-nede', scrollY > 40); addEventListener('scroll', t, { passive: true }); t(); }

  if (rolig || !window.gsap || !window.ScrollTrigger) return;   // vanlig rekke, komplett
  rot.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);

  /* ---- linjeavsloring ------------------------------------------------------ */
  const avslor = (el, d = 0) => gsap.to(el.querySelectorAll(':scope > .l > i'), { y: 0, duration: 1.15, ease: 'power3.out', stagger: .1, delay: d });
  const opnerT = document.querySelector('.opner-tittel');
  if (opnerT) avslor(opnerT, .2);
  const blokker = [...document.querySelectorAll('.kap-tittel, .seksjonstittel')];
  blokker.forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => avslor(el) }));

  /* ---- kapitlene: snittet folger rullingen gjennom kapittelet -------------- */
  const glatt = t => t * t * (3 - 2 * t);
  document.querySelectorAll('.kapittel').forEach((k, i) => {
    const s = k.querySelector('[data-vend]');
    if (s) ScrollTrigger.create({ trigger: k, start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: t => { if (!s.classList.contains('brukt')) sett(s, glatt(Math.min(1, t.progress / .72)) * 100); } });
    // det utgaaende kapittelet trekker seg bakover naar det neste glir over
    const fest = k.querySelector('.kap-fest'), neste = k.nextElementSibling;
    if (fest && neste && neste.classList.contains('kapittel'))
      gsap.fromTo(fest, { scale: 1, filter: 'brightness(1)' },
        { scale: .92, filter: 'brightness(.4)', ease: 'none',
          scrollTrigger: { trigger: neste, start: 'top bottom', end: 'top top', scrub: true } });
  });

  /* ---- opneren viker for det forste kapittelet ----------------------------- */
  const opner = document.querySelector('.opner');
  if (opner) gsap.to(opner, { scale: .95, filter: 'brightness(.4)', ease: 'none',
    scrollTrigger: { trigger: '.kapitler', start: 'top bottom', end: 'top top', scrub: true } });

  /* ---- rolige lag i de stille seksjonene ----------------------------------- */
  gsap.utils.toArray('.steg li').forEach((li, k) => gsap.fromTo(li, { x: 16 }, { x: 0, duration: .9, delay: k * .09, ease: 'power3.out',
    scrollTrigger: { trigger: '.steg', start: 'top 86%', once: true } }));
  const pl = gsap.utils.toArray('.plater figure');
  if (pl.length === 2 && matchMedia('(min-width: 901px)').matches) {
    gsap.fromTo(pl[0], { y: 26 }, { y: -26, ease: 'none', scrollTrigger: { trigger: '.oss', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(pl[1], { y: 64 }, { y: -64, ease: 'none', scrollTrigger: { trigger: '.oss', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---- sikring: en linje over synsranden staar aldri skjult ---------------- */
  const igjen = [...blokker];
  const sikre = () => { const h = innerHeight;
    for (let i = igjen.length - 1; i >= 0; i--) if (igjen[i].getBoundingClientRect().top < h * .98) { gsap.set(igjen[i].querySelectorAll(':scope > .l > i'), { y: 0 }); igjen.splice(i, 1); } };
  const avslorAlt = () => { document.querySelectorAll('.l > i').forEach(i => gsap.set(i, { y: 0 })); igjen.length = 0; };
  window.__avslorAlt = avslorAlt; addEventListener('beforeprint', avslorAlt);
  addEventListener('scroll', sikre, { passive: true });
  addEventListener('resize', () => { ScrollTrigger.refresh(); sikre(); }, { passive: true });
  addEventListener('load', () => { ScrollTrigger.refresh(); sikre(); }, { once: true });
})();
