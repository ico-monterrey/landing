
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


// Rotating globe
const globeEl = document.querySelector("[data-globe]");
if (globeEl) {
  const pins = JSON.parse(globeEl.dataset.points || "[]");
  let rotation = -20;   // longitude at center
  const lat0 = 18 * Math.PI / 180; // tilt
  let dragging = false;
  let startX = 0;
  let startRotation = rotation;
  const R = () => globeEl.clientWidth / 2;

  function project(lat, lon, lon0){
    const φ = lat * Math.PI / 180;
    let λ = (lon - lon0) * Math.PI / 180;
    while (λ > Math.PI) λ -= 2*Math.PI;
    while (λ < -Math.PI) λ += 2*Math.PI;
    const cosc = Math.sin(lat0)*Math.sin(φ) + Math.cos(lat0)*Math.cos(φ)*Math.cos(λ);
    if (cosc <= 0) return null;
    const x = Math.cos(φ) * Math.sin(λ);
    const y = Math.cos(lat0)*Math.sin(φ) - Math.sin(lat0)*Math.cos(φ)*Math.cos(λ);
    return {x, y};
  }

  function renderGlobe(){
    const r = R();
    pins.forEach(pin=>{
      const el = globeEl.querySelector(`[data-id="${pin.id}"]`);
      const pos = project(pin.lat, pin.lon, rotation);
      if(!pos){ el.classList.add("hidden"); return; }
      el.classList.remove("hidden");
      el.style.left = `${r + pos.x * r * 0.9}px`;
      el.style.top  = `${r + pos.y * r * 0.9}px`;
      const scale = 0.78 + 0.34 * ((pos.x + 1) / 2);
      el.style.transform = `translate(-50%,-50%) scale(${scale})`;
      el.style.opacity = String(0.62 + 0.38 * scale);
    });
  }

  function onDown(x){
    dragging = true;
    startX = x;
    startRotation = rotation;
  }
  function onMove(x){
    if(!dragging) return;
    const dx = x - startX;
    rotation = startRotation - dx * 0.28;
    renderGlobe();
  }
  function onUp(){ dragging = false; }

  globeEl.addEventListener("mousedown", e => onDown(e.clientX));
  window.addEventListener("mousemove", e => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);
  globeEl.addEventListener("touchstart", e => onDown(e.touches[0].clientX), {passive:true});
  globeEl.addEventListener("touchmove", e => onMove(e.touches[0].clientX), {passive:true});
  globeEl.addEventListener("touchend", onUp);

  let auto = setInterval(()=>{ if(!dragging){ rotation += 0.35; renderGlobe(); } }, 40);
  globeEl.addEventListener("mouseenter", ()=>clearInterval(auto));
  globeEl.addEventListener("mouseleave", ()=>{
    clearInterval(auto);
    auto = setInterval(()=>{ if(!dragging){ rotation += 0.35; renderGlobe(); } }, 40);
  });
  window.addEventListener("resize", renderGlobe);
  renderGlobe();
}
