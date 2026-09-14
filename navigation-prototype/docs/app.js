import { products, selectFilter, filterProducts } from './catalog.mjs';

const drawer = document.querySelector('#ritualDrawer');
const scrim = document.querySelector('.scrim');
const grid = document.querySelector('#productGrid');
const template = document.querySelector('#productTemplate');
const activeLabel = document.querySelector('#activeFilter');
const resultCount = document.querySelector('#resultCount');
let selected = readFilter();

function readFilter() {
  const params = new URLSearchParams(location.search);
  return selectFilter(null, params.get('group'), params.get('filter'));
}

function setDrawer(open) {
  drawer.classList.toggle('open', open);
  scrim.classList.toggle('show', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.querySelectorAll('[data-drawer-open]').forEach((button) => button.setAttribute('aria-expanded', String(open)));
}

function openSelectedGroup() {
  const group = selected?.group || 'time';
  document.querySelectorAll('.filter-section').forEach((section) => {
    const expanded = section.dataset.group === group;
    const title = section.querySelector('.filter-title');
    title.setAttribute('aria-expanded', String(expanded));
    title.querySelector('span').textContent = expanded ? '−' : '+';
    section.querySelector('.filter-options').hidden = !expanded;
  });
}

function updateUrl(next) {
  const url = next ? `shop.html?group=${encodeURIComponent(next.group)}&filter=${encodeURIComponent(next.value)}` : 'shop.html';
  history.pushState({}, '', url);
}

function render() {
  const results = filterProducts(products, selected);
  grid.replaceChildren();
  results.forEach((product) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('.product-card');
    card.style.setProperty('--accent', product.accent);
    fragment.querySelector('.product-number').textContent = `RITUAL / ${product.id}`;
    fragment.querySelector('.product-art strong').textContent = product.name.toUpperCase();
    const badges = fragment.querySelector('.product-badges');
    (product.badges || []).forEach((label) => {
      const badge = document.createElement('span');
      badge.textContent = label;
      badges.append(badge);
    });
    fragment.querySelector('.product-copy > small').textContent = product.time.join(' + ').toUpperCase();
    fragment.querySelector('.product-copy h2').textContent = product.name;
    fragment.querySelector('.product-description').textContent = product.description;
    fragment.querySelector('.formula-en').textContent = product.formulaEn;
    fragment.querySelector('.formula-cn').textContent = product.formulaCn;
    const tags = fragment.querySelector('.product-tags');
    [...product.need, ...product.occasion].slice(0, 3).forEach((label) => {
      const tag = document.createElement('span');
      tag.textContent = label;
      tags.append(tag);
    });
    grid.append(fragment);
  });
  activeLabel.textContent = selected?.value || 'All Rituals';
  resultCount.textContent = `${results.length} ${results.length === 1 ? 'PRODUCT' : 'PRODUCTS'}`;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const section = button.closest('[data-group]');
    button.classList.toggle('active', selected?.group === section.dataset.group && selected?.value === button.dataset.filter);
  });
  openSelectedGroup();
}

document.querySelectorAll('[data-drawer-open]').forEach((button) => button.addEventListener('click', () => setDrawer(true)));
document.querySelectorAll('[data-drawer-close]').forEach((button) => button.addEventListener('click', () => setDrawer(false)));
document.querySelectorAll('.filter-title').forEach((button) => button.addEventListener('click', () => {
  const section = button.closest('.filter-section');
  const wasOpen = button.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.filter-section').forEach((item) => {
    const title = item.querySelector('.filter-title');
    title.setAttribute('aria-expanded', 'false');
    title.querySelector('span').textContent = '+';
    item.querySelector('.filter-options').hidden = true;
  });
  if (!wasOpen) {
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('span').textContent = '−';
    section.querySelector('.filter-options').hidden = false;
  }
}));
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  const section = button.closest('[data-group]');
  selected = selectFilter(selected, section.dataset.group, button.dataset.filter);
  updateUrl(selected);
  render();
  setDrawer(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));
document.querySelector('[data-clear-filter]').addEventListener('click', () => {
  selected = null;
  updateUrl(null);
  render();
  setDrawer(false);
});
document.querySelector('[data-back]').addEventListener('click', () => {
  if (history.length > 1) history.back(); else location.href = 'index.html';
});
window.addEventListener('popstate', () => { selected = readFilter(); render(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });

render();
