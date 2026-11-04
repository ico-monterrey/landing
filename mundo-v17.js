(() => {
  const map = document.querySelector('[data-world-map]');
  const pins = [...document.querySelectorAll('.world-pin-v17')];

  pins.forEach(pin => {
    pin.addEventListener('click', event => {
      event.stopPropagation();
      const wasSelected = pin.classList.contains('is-selected');
      pins.forEach(item => item.classList.remove('is-selected'));
      if (!wasSelected) pin.classList.add('is-selected');
    });
  });

  document.addEventListener('click', () => {
    pins.forEach(pin => pin.classList.remove('is-selected'));
  });

  // En móvil, oculta temporalmente el CTA mientras el usuario explora
  // el mapa y los resúmenes para que no tape contenido.
  if ('IntersectionObserver' in window && map) {
    const body = document.body;
    const nearby = document.querySelector('.world-regions-v17');
    let mapVisible = false;
    let regionsVisible = false;

    const updateImmersive = () => {
      body.classList.toggle('is-world-immersive', mapVisible || regionsVisible);
    };

    const mapObserver = new IntersectionObserver(entries => {
      mapVisible = entries[0]?.isIntersecting ?? false;
      updateImmersive();
    }, { threshold: .12 });

    mapObserver.observe(map);

    if (nearby) {
      const regionObserver = new IntersectionObserver(entries => {
        regionsVisible = entries[0]?.isIntersecting ?? false;
        updateImmersive();
      }, { threshold: .08 });

      regionObserver.observe(nearby);
    }
  }

  const carousel = document.querySelector('[data-world-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.world-carousel-track-v17');
  const cards = [...track.querySelectorAll('.world-card-v17')];
  if (!track || cards.length < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  let visible = false;
  let pauseUntil = 0;

  const cardLeft = card => card.offsetLeft - track.offsetLeft;

  function nearestIndex() {
    const left = track.scrollLeft;
    let best = 0;
    let distance = Infinity;

    cards.forEach((card, i) => {
      const d = Math.abs(cardLeft(card) - left);
      if (d < distance) {
        distance = d;
        best = i;
      }
    });

    return best;
  }

  function goNext() {
    if (Date.now() < pauseUntil) return;

    const current = nearestIndex();
    const next = (current + 1) % cards.length;

    track.scrollTo({
      left: next === 0 ? 0 : cardLeft(cards[next]),
      behavior: 'smooth'
    });
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    if (reduceMotion || !visible || document.hidden) return;
    timer = setInterval(goNext, 2200);
  }

  function userInteracted() {
    pauseUntil = Date.now() + 5500;
  }

  ['pointerdown', 'touchstart', 'wheel'].forEach(eventName => {
    track.addEventListener(eventName, userInteracted, { passive: true });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    }, { threshold: .2 });

    observer.observe(carousel);
  } else {
    visible = true;
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
})();
