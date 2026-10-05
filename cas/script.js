const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}


// Evidence tabs
const evidenceTabs = document.querySelectorAll('[data-evidence-tab]');
const evidencePanels = document.querySelectorAll('[data-evidence-panel]');
if (evidenceTabs.length && evidencePanels.length) {
  evidenceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.evidenceTab;
      evidenceTabs.forEach(t => t.classList.toggle('active', t === tab));
      evidencePanels.forEach(panel => panel.classList.toggle('active', panel.dataset.evidencePanel === target));
    });
  });
}

// Reinforce muted inline autoplay for evidence videos
function startEvidenceVideos() {
  document.querySelectorAll('.evidence-video video').forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  });
}
document.addEventListener('DOMContentLoaded', startEvidenceVideos);
window.addEventListener('pageshow', startEvidenceVideos);
