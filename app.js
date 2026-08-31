/* Double Digital portefølje. Ingen avhengigheter.
   Sammenligneren er en <input type=range> som ligger usynlig over bildene.
   Det gir drag med mus, drag med finger og piltaster gratis, og skjermleser
   får en ekte skyvekontroll i stedet for et div-triks. */
(() => {
  'use strict';
  document.querySelectorAll('[data-sml]').forEach(boks => {
    const hendel = boks.querySelector('.sml__hendel');
    const etter  = boks.querySelector('[data-etter]');
    const bilde  = etter && etter.querySelector('img');
    if (!hendel || !etter || !bilde) return;

    const tegn = () => {
      const p = hendel.value + '%';
      boks.style.setProperty('--del', p);
      // etter-laget klippes, saa bildet inni maa holdes i full bredde
      bilde.style.width = boks.clientWidth + 'px';
    };
    hendel.addEventListener('input', tegn);
    addEventListener('resize', tegn, { passive: true });
    if (document.readyState === 'complete') tegn();
    else addEventListener('load', tegn, { once: true });
    tegn();
  });
})();
