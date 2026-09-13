const menuBtn=document.querySelector('.menu-toggle');const mobileMenu=document.querySelector('.mobile-menu');if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open?'true':'false');mobileMenu.setAttribute('aria-hidden',open?'false':'true');});}const timeline=document.querySelector('#timeline');
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
  items.forEach((item,i)=>{
    const b=document.createElement('button');
    b.textContent=item.label;
    if(i===items.length-1)b.classList.add('active');
    b.addEventListener('click',()=>{
      timeline.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      timelineImage.src=`assets/historia/${item.id}.jpg`;
      timelineImage.alt=item.month;
      timelinePlace.textContent=`📍 ${item.place}`;
    });
    timeline.appendChild(b);
  });
}
document.querySelectorAll('[data-carousel]').forEach(carousel=>{const track=carousel.querySelector('.carousel-track');const prev=carousel.querySelector('[data-prev]');const next=carousel.querySelector('[data-next]');const step=()=>Math.min(track.clientWidth*.86,440);prev?.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));next?.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));});const form=document.querySelector('#registerForm');if(form){const status=document.querySelector('#formStatus');form.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Registrando...';const payload=Object.fromEntries(new FormData(form));if(payload.website){status.textContent='';return;}try{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error('bad');status.textContent='✅ ¡Listo! Tu registro quedó confirmado.';form.reset();}catch{status.textContent='La conexión con Google Sheets todavía no está configurada.';}});}