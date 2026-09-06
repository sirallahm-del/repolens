/* NOVA hero — one piece of state, mirroring the reference spec */
let nvMenuOpen = false;

function novaToggleMenu(){
  nvMenuOpen = !nvMenuOpen;
  document.getElementById('nv-menu').classList.toggle('open', nvMenuOpen);
  document.querySelector('.nv-hamburger').classList.toggle('open', nvMenuOpen);
}
function novaCloseMenu(){
  nvMenuOpen = false;
  document.getElementById('nv-menu').classList.remove('open');
  document.querySelector('.nv-hamburger').classList.remove('open');
}