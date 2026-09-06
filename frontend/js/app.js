/* =========================================================
   NOVA — shared app behaviour (all pages)
   ========================================================= */

// ---------- Theme ----------
(function initTheme(){
  const saved = localStorage.getItem('nova_theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
})();

function novaToggleTheme(){
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  if(next === 'dark') html.setAttribute('data-theme','dark'); else html.removeAttribute('data-theme');
  localStorage.setItem('nova_theme', next);
}

// ---------- Icons (local, no CDN dependency) ----------
function novaIcons(){
  document.querySelectorAll('[data-lucide]').forEach(el => {
    const name = el.getAttribute('data-lucide');
    const paths = window.NOVA_ICON_PATHS && NOVA_ICON_PATHS[name];
    if(!paths) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if(el.className) svg.setAttribute('class', el.className);
    if(el.getAttribute('style')) svg.setAttribute('style', el.getAttribute('style'));
    svg.innerHTML = paths;
    el.replaceWith(svg);
  });
}

// ---------- Scroll reveal (landing page feature cards etc.) ----------
function novaInitReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 70 + 'ms';
    io.observe(el);
  });
}

// ---------- Toasts ----------
function novaToast(msg){
  let stack = document.querySelector('.toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s ease, transform .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

// ---------- Count-up numbers ----------
function novaCountUp(el, end, opts = {}){
  const dur = opts.duration || 900;
  const isMoney = !!opts.money;
  const start = 0;
  const startTime = performance.now();
  function step(now){
    const p = Math.min(1, (now - startTime) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = start + (end - start) * eased;
    el.textContent = isMoney ? NOVA.fmt(val) : NOVA.fmtNum(val);
    if(p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Command palette ----------
const NOVA_COMMANDS = [
  { label: 'Créer un devis', icon: 'file-plus-2', href: 'devis.html?new=1' },
  { label: 'Créer une facture', icon: 'receipt', href: 'factures.html?new=1' },
  { label: 'Ajouter un client', icon: 'user-plus', href: 'clients.html?new=1' },
  { label: 'Voir les impayés', icon: 'alert-triangle', href: 'factures.html?filter=impayes' },
  { label: 'Ouvrir le tableau de bord', icon: 'layout-dashboard', href: 'dashboard.html' },
  { label: 'Voir les clients', icon: 'users', href: 'clients.html' },
  { label: 'Ouvrir les paramètres', icon: 'settings', href: 'settings.html' },
  { label: 'Analyser mon activité', icon: 'sparkles', href: 'dashboard.html#analyse' }
];

function novaBuildPalette(){
  if(document.querySelector('.cmdk-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.innerHTML = `
    <div class="cmdk">
      <div class="cmdk-input">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Rechercher ou exécuter une action..." autocomplete="off" />
      </div>
      <div class="cmdk-list"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('input');
  const list = overlay.querySelector('.cmdk-list');
  let selected = 0;

  function render(filter=''){
    const items = NOVA_COMMANDS.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()));
    list.innerHTML = items.map((c,i) => `
      <div class="cmdk-item ${i===selected?'sel':''}" data-href="${c.href}">
        <i data-lucide="${c.icon}"></i><span>${c.label}</span>
      </div>`).join('') || `<div class="cmdk-group-label">Aucun résultat</div>`;
    novaIcons();
    list.querySelectorAll('.cmdk-item').forEach(el => {
      el.addEventListener('click', () => { window.location.href = el.dataset.href; });
    });
  }

  function open(){
    overlay.classList.add('open');
    selected = 0;
    input.value = '';
    render();
    setTimeout(() => input.focus(), 50);
  }
  function close(){ overlay.classList.remove('open'); }

  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
  input.addEventListener('input', () => { selected = 0; render(input.value); });
  document.addEventListener('keydown', (e) => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    }
    if(e.key === 'Escape') close();
  });

  document.querySelectorAll('[data-cmdk-trigger]').forEach(t => t.addEventListener('click', open));
}

// ---------- Quick create (sidebar) ----------
function novaToggleQuickCreate(){
  const menu = document.getElementById('quick-create-menu');
  if(!menu) return;
  menu.classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('quick-create');
  const menu = document.getElementById('quick-create-menu');
  if(!wrap || !menu) return;
  if(!wrap.contains(e.target)) menu.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
  novaIcons();
  novaBuildPalette();
  novaInitReveal();
});       