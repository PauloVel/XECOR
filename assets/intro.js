/* Waits for Anton, shows the EVRABO® loader (so the font never swaps mid-sequence), holds, hard-cuts to the page with a red punch flash. */
(function () {
  const el = document.getElementById('ev-intro');
  if (!el) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fontReady = document.fonts
    ? Promise.race([document.fonts.load("1em Anton", "EVRABO®"), new Promise((r) => setTimeout(r, 2500))])
    : Promise.resolve();

  fontReady.catch(() => {}).then(() => {
    el.classList.add('ready');
    setTimeout(() => {
      el.remove();
      if (reduced) return;
      const punch = document.createElement('div');
      punch.className = 'ev-punch';
      punch.addEventListener('animationend', () => punch.remove());
      document.body.appendChild(punch);
    }, reduced ? 0 : 1200);
  });
})();
