/* Double Digital, Lakk.
   Tier 1: forvandlingen i glasset. Kuttlinjen i krom drives av rullingen eller
   av haanden. Glasspanelene ligger i perspektiv og retter seg opp naar de
   kommer inn. Linjer avslores gjennom klipp. Alt bak html.anim; uten skript
   eller med reduced motion er siden statisk og komplett. */
(() => {
  'use strict';
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rot = document.documentElement;
  const bred = () => matchMedia('(min-width: 901px)').matches;

  /* ---- kuttlinjen ---------------------------------------------------------- */
  const rammer = [...document.querySelectorAll('[data-vend]')];
  const sett = (r, x) => { x = Math.max(0, Math.min(100, x)); r.style.setProperty('--x', x.toFixed(1) + '%'); const i = r.querySelector('.vend'); if (i && Math.abs(i.value - x) > .5) i.value = x; };
  rammer.forEach(r => {
    const i = r.querySelector('.vend'); if (!i) return;
    i.addEventListener('input', () => { r.classList.add('brukt'); sett(r, +i.value); });
    let drar = false;
    const til = ev => { const b = r.querySelector('.scene').getBoundingClientRect(); sett(r, (ev.clientX - b.left) / b.width * 100); };
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
      if (r.classList.contains('brukt') || r.hasAttribute('data-demo')) return;
      const b = r.getBoundingClientRect(); if (b.bottom < 0 || b.top > h) return;
      const p = (h - b.top) / (h + b.height);
      sett(r, glatt(Math.max(0, Math.min(1, (p - .14) / .72))) * 100);
    });
  };
  addEventListener('scroll', driv, { passive: true }); addEventListener('resize', driv, { passive: true }); driv();

  /* ---- meny og topp --------------------------------------------------------- */
  const header = document.querySelector('[data-header]'), knapp = document.querySelector('[data-menu-toggle]'), meny = document.querySelector('[data-menu]');
  if (header && knapp && meny) {
    knapp.addEventListener('click', () => { const a = header.classList.toggle('is-menu-open'); knapp.setAttribute('aria-expanded', String(a)); });
    meny.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { header.classList.remove('is-menu-open'); knapp.setAttribute('aria-expanded', 'false'); }));
  }
  if (header) { const t = () => header.classList.toggle('er-nede', scrollY > 40); addEventListener('scroll', t, { passive: true }); t(); }

  if (rolig || !window.gsap || !window.ScrollTrigger) return;
  rot.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);

  /* ---- linjeavsloring ------------------------------------------------------- */
  document.querySelectorAll('.linjer > span').forEach(s => { const i = document.createElement('i'); while (s.firstChild) i.appendChild(s.firstChild); s.appendChild(i); });
  const avslor = (el, delay = 0) => gsap.to(el.querySelectorAll(':scope > span > i'), { y: 0, duration: 1, ease: 'power3.out', stagger: .09, delay });
  document.querySelectorAll('.hero .linjer').forEach((el, k) => avslor(el, .15 + k * .25));
  const blokker = [...document.querySelectorAll('.linjer')].filter(el => !el.closest('.hero'));
  blokker.forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => avslor(el) }));

  /* ---- lag i tre hastigheter --------------------------------------------------- */
  /* Heroens panel demonstrerer mekanikken en gang ved innlasting: linjen sveiper
     rolig til 58 prosent saa man ser hva den gjor, og slipper straks brukeren
     tar i den. Det er den eneste bevegelsen i heroen, og den viser produktet. */
  const demo = document.querySelector('[data-demo]');
  if (demo) {
    const t0 = performance.now(), varighet = 1900, mal = 58;
    const lett = t => 1 - Math.pow(1 - t, 3);
    const tikk = naa => {
      if (demo.classList.contains('brukt')) return;
      const t = Math.min(1, (naa - t0 - 700) / varighet);
      if (t > 0) sett(demo, lett(t) * mal);
      if (t < 1) requestAnimationFrame(tikk);
    };
    requestAnimationFrame(tikk);
  }
  // glasspanelene: i perspektiv i ro, retter seg opp naar de kommer inn
  gsap.utils.toArray('.ramme').forEach(r => {
    if (bred()) gsap.fromTo(r, { rotateY: 7, transformPerspective: 1400 }, { rotateY: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 88%', once: true } });
    else gsap.fromTo(r, { scale: .985 }, { scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 92%', once: true } });
  });
  gsap.utils.toArray('.case .nr').forEach(n => gsap.fromTo(n, { y: 18 }, { y: -18, ease: 'none', scrollTrigger: { trigger: n.closest('.case'), start: 'top bottom', end: 'bottom top', scrub: true } }));
  const skinne = document.querySelector('.skinne');
  if (skinne) gsap.fromTo(skinne, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.metode', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.utils.toArray('.steg li').forEach((li, k) => gsap.fromTo(li, { x: 16 }, { x: 0, duration: .8, delay: k * .08, ease: 'power3.out', scrollTrigger: { trigger: '.steg', start: 'top 85%', once: true } }));
  const pl = gsap.utils.toArray('.plater figure');
  if (pl.length === 2 && bred()) {
    gsap.fromTo(pl[0], { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.oss', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(pl[1], { y: 70 }, { y: -70, ease: 'none', scrollTrigger: { trigger: '.oss', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  const km = document.querySelector('.kontakt-merke');
  if (km && bred()) gsap.fromTo(km, { y: 60 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.kontakt', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---- sikring: en linje over synsranden staar aldri skjult ------------------- */
  const sikre = () => { const h = innerHeight; for (let i = blokker.length - 1; i >= 0; i--) if (blokker[i].getBoundingClientRect().top < h * .98) { gsap.set(blokker[i].querySelectorAll(':scope > span > i'), { y: 0 }); blokker.splice(i, 1); } };
  const avslorAlt = () => { document.querySelectorAll('.linjer > span > i').forEach(i => gsap.set(i, { y: 0 })); blokker.length = 0; };
  window.__avslorAlt = avslorAlt; addEventListener('beforeprint', avslorAlt);
  addEventListener('scroll', sikre, { passive: true }); addEventListener('resize', () => { ScrollTrigger.refresh(); sikre(); }, { passive: true });
  addEventListener('load', () => { ScrollTrigger.refresh(); sikre(); }, { once: true });
})();
