(() => {
  const journey = document.querySelector('[data-experience-journey]');
  if (!journey) return;

  const moments = [...journey.querySelectorAll('[data-exp-step], [data-exp-visual]')];

  if (!('IntersectionObserver' in window)) {
    moments.forEach(moment => moment.classList.add('is-active'));
    return;
  }

  const ratios = new Map();

  function updateActiveMoment() {
    let best = null;
    let bestRatio = 0;

    moments.forEach(moment => {
      const ratio = ratios.get(moment) || 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = moment;
      }
    });

    moments.forEach(moment => {
      moment.classList.toggle('is-active', moment === best && bestRatio > 0.16);
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => ratios.set(entry.target, entry.intersectionRatio));
    updateActiveMoment();
  }, {
    threshold: [0, .16, .28, .42, .56, .7, .84],
    rootMargin: '-12% 0px -12% 0px'
  });

  moments.forEach(moment => observer.observe(moment));
})();
