const drawer = document.querySelector('#ritualDrawer');
const scrim = document.querySelector('.scrim');

function setDrawer(open) {
  drawer.classList.toggle('open', open);
  scrim.classList.toggle('show', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.querySelectorAll('[data-drawer-open]').forEach((button) => button.setAttribute('aria-expanded', String(open)));
}

document.querySelectorAll('[data-drawer-open]').forEach((button) => button.addEventListener('click', () => setDrawer(true)));
document.querySelectorAll('[data-drawer-close]').forEach((button) => button.addEventListener('click', () => setDrawer(false)));
document.querySelectorAll('.filter-title').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-title').forEach((other) => {
    const expanded = other === button && other.getAttribute('aria-expanded') !== 'true';
    other.setAttribute('aria-expanded', String(expanded));
    other.querySelector('span').textContent = expanded ? '−' : '+';
    other.nextElementSibling.hidden = !expanded;
  });
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setDrawer(false);
});
