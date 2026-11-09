(() => {
  const formShell=document.querySelector('#registro');
  if(!formShell || !('IntersectionObserver' in window)) return;
  const observer=new IntersectionObserver(entries=>{
    document.body.classList.toggle('is-register-visible',entries[0]?.isIntersecting ?? false);
  },{threshold:.12});
  observer.observe(formShell);
})();
