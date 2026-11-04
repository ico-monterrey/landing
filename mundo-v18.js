(() => {

  const emojiPins = [...document.querySelectorAll('.world-emoji-pin-v184')];
  emojiPins.forEach(pin => {
    pin.addEventListener('click', event => {
      event.stopPropagation();
      const selected = pin.classList.contains('is-selected');
      emojiPins.forEach(item => item.classList.remove('is-selected'));
      if (!selected) pin.classList.add('is-selected');
    });
  });

  document.addEventListener('click', () => {
    emojiPins.forEach(pin => pin.classList.remove('is-selected'));
  });
  const map = document.querySelector('.world-map-panel-v18');
  const regions = document.querySelector('.world-regions-v18');

  if ('IntersectionObserver' in window && map) {
    let mapVisible = false;
    let regionsVisible = false;

    const update = () => {
      document.body.classList.toggle(
        'is-world-immersive',
        mapVisible || regionsVisible
      );
    };

    new IntersectionObserver(entries => {
      mapVisible = entries[0]?.isIntersecting ?? false;
      update();
    }, { threshold: .12 }).observe(map);

    if (regions) {
      new IntersectionObserver(entries => {
        regionsVisible = entries[0]?.isIntersecting ?? false;
        update();
      }, { threshold: .08 }).observe(regions);
    }
  }

  const carousel = document.querySelector('[data-world-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.world-carousel-track-v18');
  const cards = [...track.querySelectorAll('.world-card-v18')];
  if (!track || cards.length < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  let visible = false;
  let pauseUntil = 0;

  const cardLeft = card => card.offsetLeft - track.offsetLeft;

  function nearestIndex(){
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

  function goNext(){
    if (Date.now() < pauseUntil) return;
    const next = (nearestIndex() + 1) % cards.length;
    track.scrollTo({
      left: next === 0 ? 0 : cardLeft(cards[next]),
      behavior: 'smooth'
    });
  }

  function stop(){
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start(){
    stop();
    if (reduceMotion || !visible || document.hidden) return;
    timer = setInterval(goNext, 2200);
  }

  ['pointerdown','touchstart','wheel'].forEach(eventName => {
    track.addEventListener(eventName, () => {
      pauseUntil = Date.now() + 5500;
    }, { passive:true });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    }, { threshold:.2 }).observe(carousel);
  } else {
    visible = true;
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
})();
