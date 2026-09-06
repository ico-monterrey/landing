
const menuBtn = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
if(menuBtn && mobileMenu){
  menuBtn.addEventListener("click",()=>{
    const open = mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  });
}

const timeline = document.querySelector("#timeline");
const timelineImage = document.querySelector("#timelineImage");
if (timeline && timelineImage) {
  const months = [["NOV","nov.svg"],["ENE","ene.svg"],["FEB","feb.svg"],["MAR","mar.svg"],["ABR","abr.svg"],["MAY","may.svg"],["JUL","jul.svg"],["AGO","ago.svg"]];
  months.forEach(([label,file],i)=>{
    const b=document.createElement("button"); b.textContent=label;
    if(i===months.length-1)b.classList.add("active");
    b.onclick=()=>{document.querySelectorAll("#timeline button").forEach(x=>x.classList.remove("active"));b.classList.add("active");timelineImage.src=`assets/eventos/${file}`};
    timeline.appendChild(b);
  });
}

document.querySelectorAll("[data-carousel]").forEach(carousel=>{
  const track = carousel.querySelector(".carousel-track");
  const prev = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  const step = ()=> Math.min(track.clientWidth * .86, 440);
  prev?.addEventListener("click",()=>track.scrollBy({left:-step(),behavior:"smooth"}));
  next?.addEventListener("click",()=>track.scrollBy({left:step(),behavior:"smooth"}));
});

const form=document.querySelector("#registerForm");
if(form){
  const status=document.querySelector("#formStatus");
  form.addEventListener("submit",async(e)=>{
    e.preventDefault();
    status.textContent="Registrando...";
    const payload=Object.fromEntries(new FormData(form));
    if(payload.website){status.textContent="";return;}
    try{
      const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!r.ok) throw new Error();
      status.textContent="✅ ¡Listo! Tu registro quedó confirmado.";
      form.reset();
    }catch{
      status.textContent="La conexión con Google Sheets todavía no está configurada.";
    }
  });
}
