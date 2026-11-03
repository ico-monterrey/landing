function ensureV8Styles(){
  if(document.querySelector('link[href*="v8.css"]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='v8.css?v=8.0';
  document.head.appendChild(link);
}
ensureV8Styles();

function ensureV9Styles(){
  if(document.querySelector('link[href*="v9.css"]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='v9.css?v=9.0';
  document.head.appendChild(link);
}
ensureV9Styles();

function ensureV91Styles(){
  if(document.querySelector('link[href*="v9-1.css"]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='v9-1.css?v=9.1';
  document.head.appendChild(link);
}
ensureV91Styles();

function ensureV10Styles(){
  if(document.querySelector('link[href*="v10.css"]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='v10.css?v=10.0';
  document.head.appendChild(link);
}
ensureV10Styles();

function v8Icon(name){
  return '<span class="ico-line ico-'+name+'" aria-hidden="true"></span>';
}
function replaceLeadingEmoji(el,emoji,iconName){
  if(!el) return;
  const text=el.textContent.trim();
  if(!text.startsWith(emoji)) return;
  el.innerHTML=v8Icon(iconName)+'<span>'+text.slice(emoji.length).trim()+'</span>';
}
function applyV8VisualSystem(){
  document.querySelectorAll('.cards.three article>b').forEach(el=>{
    replaceLeadingEmoji(el,'🗣','voice');
    replaceLeadingEmoji(el,'🔥','action');
    replaceLeadingEmoji(el,'🤝','community');
  });

  document.querySelectorAll('.box p').forEach(el=>{
    if(el.innerHTML.includes('🏅')) el.innerHTML=el.innerHTML.replace('🏅',v8Icon('badge'));
  });

  const timelinePlace=document.querySelector('#timelinePlace');
  if(timelinePlace && timelinePlace.textContent.trim().startsWith('📍')){
    timelinePlace.innerHTML=v8Icon('location')+'<span>'+timelinePlace.textContent.replace('📍','').trim()+'</span>';
  }

  document.querySelectorAll('.globe-regions-v74 span,.location-group b').forEach(el=>{
    const text=el.textContent.trim();
    if(text.startsWith('🌎')||text.startsWith('🌍')){
      el.innerHTML=v8Icon('globe')+'<span>'+text.replace(/^🌎|^🌍/,'').trim()+'</span>';
    }
  });

  document.querySelectorAll('.register p').forEach(el=>{
    if(el.innerHTML.includes('🕔')) el.innerHTML=el.innerHTML.replace('🕔',v8Icon('clock'));
    if(el.innerHTML.includes('📍')) el.innerHTML=el.innerHTML.replace('📍',v8Icon('location'));
  });

  document.querySelectorAll('.hype').forEach(el=>{
    if(el.innerHTML.includes('👀')) el.innerHTML=el.innerHTML.replace('👀',v8Icon('eye'));
  });

  document.querySelectorAll('#registerForm small').forEach(el=>{
    const text=el.textContent.trim();
    if(text.startsWith('✓')) el.innerHTML=v8Icon('check')+text.replace(/^✓\s*/,'');
  });

  document.querySelectorAll('.amb-grid strong').forEach(el=>{
    el.textContent=el.textContent.replace(/\s*🙌\s*/g,' ').trim();
  });

  document.querySelectorAll('.btn').forEach(el=>{
    if(el.innerHTML.includes('💬')) el.innerHTML=el.innerHTML.replace('💬',v8Icon('message'));
    if(el.innerHTML.includes('✉️')) el.innerHTML=el.innerHTML.replace('✉️',v8Icon('mail'));
  });
}

function upgradeFooterV9(){
  const footer=document.querySelector('.footer');
  if(!footer || footer.dataset.v9Ready==='true') return;
  footer.dataset.v9Ready='true';

  const first=footer.querySelector('.footer-top > div:first-child');
  const logo=first?.querySelector('.footer-logo');
  const copy=first?.querySelector('p');

  if(first && logo){
    first.classList.add('footer-brand-wrap-v9');
    logo.src='assets/logo/ico-symbol.png';
    logo.alt='ICO';

    const identity=document.createElement('div');
    identity.className='footer-brand-v9';

    const newLogo=logo.cloneNode(true);
    const wordmark=document.createElement('div');
    wordmark.className='footer-wordmark-v9';
    wordmark.innerHTML='<strong>Instituto de Comunicación</strong><span>ICO Monterrey</span>';

    identity.appendChild(newLogo);
    identity.appendChild(wordmark);

    logo.remove();
    first.insertBefore(identity,copy || first.firstChild);
  }

  if(copy){
    copy.className='footer-brand-copy-v9';
    copy.textContent='Comunidad local del Instituto de Comunicación en Monterrey.';
  }

  footer.querySelectorAll('.footer-links a').forEach(a=>{
    const href=a.getAttribute('href')||'';
    let label=a.textContent.trim();
    let icon='';

    if(href.includes('embajador.html')){
      label='Conoce al embajador';
      icon='community';
    }else if(href.includes('wa.me')){
      label='WhatsApp';
      icon='message';
    }else if(href.startsWith('mailto:')){
      label='Correo electrónico';
      icon='mail';
    }else if(href.includes('instagram.com')){
      label='Instagram';
      icon='instagram';
    }else if(href.includes('institutodecomunicacion.com')){
      label='Conoce más sobre ICO';
      icon='globe';
    }

    a.innerHTML=(icon?'<span class="ico-line ico-'+icon+'" aria-hidden="true"></span>':'')+'<span>'+label+'</span>';
  });
}

function initSmartStickyCTA(){
  const sticky=document.querySelector('.mobile-sticky-cta');
  if(!sticky) return;

  const footer=document.querySelector('.footer');
  const primary=document.querySelector('.hero-primary-cta');
  let primaryVisible=!!primary;
  let footerVisible=false;

  const isMobile=()=>window.matchMedia('(max-width:980px)').matches;

  function update(){
    if(!isMobile()){
      sticky.classList.remove('is-visible');
      return;
    }

    const enoughScroll=window.scrollY>220;
    const show=enoughScroll && !primaryVisible && !footerVisible;
    sticky.classList.toggle('is-visible',show);
  }

  if('IntersectionObserver' in window){
    if(primary){
      const primaryObserver=new IntersectionObserver(entries=>{
        primaryVisible=entries[0]?.isIntersecting ?? false;
        update();
      },{threshold:.12});
      primaryObserver.observe(primary);
    }else{
      primaryVisible=false;
    }

    if(footer){
      const footerObserver=new IntersectionObserver(entries=>{
        footerVisible=entries[0]?.isIntersecting ?? false;
        update();
      },{threshold:.03});
      footerObserver.observe(footer);
    }
  }else{
    primaryVisible=false;
  }

  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
}


function initHistoryBackV10(){
  const isHome=location.pathname.endsWith('/index.html') || location.pathname.endsWith('/');
  const homeScrollKey='ico-home-scroll-v10';
  const restoreKey='ico-restore-home-v10';

  if(isHome){
    if(sessionStorage.getItem(restoreKey)==='1'){
      const saved=parseInt(sessionStorage.getItem(homeScrollKey)||'0',10);
      sessionStorage.removeItem(restoreKey);
      requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:saved,behavior:'auto'})));
    }

    document.addEventListener('click',e=>{
      const link=e.target.closest('a[href]');
      if(!link) return;
      const href=link.getAttribute('href')||'';
      if(!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      sessionStorage.setItem(homeScrollKey,String(window.scrollY));
    });
  }

  document.querySelectorAll('a.back, .bottom-home-v74 a[href="index.html"]').forEach(link=>{
    link.textContent='← Regresar';
    link.setAttribute('aria-label','Regresar a la página anterior');

    if(link.dataset.v10BackReady==='true') return;
    link.dataset.v10BackReady='true';

    link.addEventListener('click',e=>{
      const ref=document.referrer;
      let sameOrigin=false;
      try{
        sameOrigin=!!ref && new URL(ref).origin===location.origin;
      }catch{}

      if(sameOrigin && history.length>1){
        e.preventDefault();
        history.back();
        return;
      }

      sessionStorage.setItem(restoreKey,'1');
    });
  });
}

applyV8VisualSystem();
upgradeFooterV9();
initHistoryBackV10();

const menuBtn=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
if(menuBtn&&mobileMenu){
  menuBtn.addEventListener('click',()=>{
    const open=mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',open?'true':'false');
    mobileMenu.setAttribute('aria-hidden',open?'false':'true');
  });
}

const timeline=document.querySelector('#timeline');
const timelineImage=document.querySelector('#timelineImage');
const timelinePlace=document.querySelector('#timelinePlace');
if(timeline&&timelineImage&&timelinePlace){
  const items=[
    {id:'nov-2025',label:'NOV',month:'Noviembre 2025',place:'Parque Fundidora'},
    {id:'ene-2026',label:'ENE',month:'Enero 2026',place:'Macroplaza'},
    {id:'feb-2026',label:'FEB',month:'Febrero 2026',place:'San Pedro de Pinta'},
    {id:'mar-2026',label:'MAR',month:'Marzo 2026',place:'San Pedro de Pinta'},
    {id:'abr-2026',label:'ABR',month:'Abril 2026',place:'San Pedro de Pinta'},
    {id:'may-2026',label:'MAY',month:'Mayo 2026',place:'San Pedro de Pinta'},
    {id:'jul-2026',label:'JUL',month:'Julio 2026',place:'Parque El Capitán'},
    {id:'ago-2026',label:'AGO',month:'Agosto 2026',place:'Parque Bosques del Valle'}
  ];

  let activeIndex=0;
  let timer=null;
  let timelineVisible=false;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderTimeline(index){
    activeIndex=(index+items.length)%items.length;
    const item=items[activeIndex];
    const buttons=[...timeline.querySelectorAll('button')];

    buttons.forEach((button,i)=>button.classList.toggle('active',i===activeIndex));
    timelineImage.src='assets/historia/'+item.id+'.jpg';
    timelineImage.alt=item.month;
    timelinePlace.innerHTML=v8Icon('location')+'<span>'+item.place+'</span>';

    buttons[activeIndex]?.scrollIntoView({
      behavior:reduceMotion?'auto':'smooth',
      block:'nearest',
      inline:'center'
    });
  }

  function stopTimelineAuto(){
    if(timer){
      clearInterval(timer);
      timer=null;
    }
  }

  function startTimelineAuto(){
    stopTimelineAuto();
    if(reduceMotion || !timelineVisible || document.hidden) return;
    timer=setInterval(()=>renderTimeline(activeIndex+1),3200);
  }

  items.forEach((item,i)=>{
    const button=document.createElement('button');
    button.textContent=item.label;
    button.setAttribute('aria-label',item.month);
    button.addEventListener('click',()=>{
      renderTimeline(i);
      startTimelineAuto();
    });
    timeline.appendChild(button);
  });

  renderTimeline(0);

  const stage=timelineImage.closest('.timeline-stage');
  if('IntersectionObserver' in window && stage){
    const observer=new IntersectionObserver(entries=>{
      timelineVisible=entries[0]?.isIntersecting ?? false;
      if(timelineVisible) startTimelineAuto();
      else stopTimelineAuto();
    },{threshold:.28});
    observer.observe(stage);
  }else{
    timelineVisible=true;
    startTimelineAuto();
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) stopTimelineAuto();
    else startTimelineAuto();
  });
}

document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const track=carousel.querySelector('.carousel-track');
  const prev=carousel.querySelector('[data-prev]');
  const next=carousel.querySelector('[data-next]');
  const step=()=>Math.min(track.clientWidth*.86,440);
  prev?.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
  next?.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));
});

const form=document.querySelector('#registerForm');
if(form){
  const status=document.querySelector('#formStatus');
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    status.textContent='Registrando...';
    const payload=Object.fromEntries(new FormData(form));
    if(payload.website){status.textContent='';return;}
    try{
      const r=await fetch('/api/register',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      if(!r.ok)throw new Error('bad');
      status.textContent='¡Listo! Tu registro quedó confirmado.';
      form.reset();
    }catch{
      status.textContent='La conexión con Google Sheets todavía no está configurada.';
    }
  });
}

function tryDynamicAutoplay(){
  document.querySelectorAll('.auto-dynamic-video').forEach(video=>{
    video.muted=true;
    video.defaultMuted=true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    const attempt=()=>{
      const promise=video.play();
      if(promise&&typeof promise.catch==='function') promise.catch(()=>{});
    };
    if(video.readyState>=2) attempt();
    else video.addEventListener('canplay',attempt,{once:true});
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  applyV8VisualSystem();
  upgradeFooterV9();
  initSmartStickyCTA();
  initHistoryBackV10();
  tryDynamicAutoplay();
});
window.addEventListener('pageshow',()=>{
  applyV8VisualSystem();
  upgradeFooterV9();
  initHistoryBackV10();
  tryDynamicAutoplay();
});
