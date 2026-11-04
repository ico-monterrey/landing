(() => {
  const carousel = document.querySelector('[data-world-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.world-carousel-track-v15');
  const cards = [...track.querySelectorAll('.world-card-v15')];
  if (!track || cards.length < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;
  let visible = false;
  let pauseUntil = 0;

  const cardLeft = card => card.offsetLeft - track.offsetLeft;

  function nearestIndex(){
    const left = track.scrollLeft;
    let best = 0;
    let distance = Infinity;
    cards.forEach((card,i)=>{
      const d = Math.abs(cardLeft(card)-left);
      if(d < distance){
        distance = d;
        best = i;
      }
    });
    return best;
  }

  function goNext(){
    if(Date.now() < pauseUntil) return;
    index = (nearestIndex()+1) % cards.length;

    if(index === 0){
      track.scrollTo({left:0,behavior:'smooth'});
    }else{
      track.scrollTo({left:cardLeft(cards[index]),behavior:'smooth'});
    }
  }

  function stop(){
    if(timer){
      clearInterval(timer);
      timer = null;
    }
  }

  function start(){
    stop();
    if(reduceMotion || !visible || document.hidden) return;
    timer = setInterval(goNext,2200);
  }

  function userInteracted(){
    pauseUntil = Date.now()+5500;
    index = nearestIndex();
  }

  ['pointerdown','touchstart','wheel'].forEach(eventName=>{
    track.addEventListener(eventName,userInteracted,{passive:true});
  });

  track.addEventListener('scroll',()=>{
    window.clearTimeout(track._icoScrollTimer);
    track._icoScrollTimer = window.setTimeout(()=>{
      index = nearestIndex();
    },100);
  },{passive:true});

  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries=>{
      visible = entries[0]?.isIntersecting ?? false;
      if(visible) start();
      else stop();
    },{threshold:.2});
    observer.observe(carousel);
  }else{
    visible = true;
    start();
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) stop();
    else start();
  });
})();
