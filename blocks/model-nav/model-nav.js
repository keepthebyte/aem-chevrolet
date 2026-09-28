/*
 * model-nav — the sticky model sub-navigation (gb-secondary-nav). Content model: one cell holding
 * the list of model links; the first link is the current page. Desktop: centred row of links.
 * Mobile (< 800px): only the current link shows, plus an icon-only expand toggle (no words added,
 * EW7: authored text never lives inside a <button>).
 */
export default function decorate(block) {
  const list = block.querySelector('ul');
  if (!list) return;
  list.classList.add('model-nav-list');
  const items = [...list.querySelectorAll(':scope > li')];
  // the pipeline may wrap each link in a <p> (#98) — unwrap so the li holds the anchor directly
  items.forEach((li) => {
    const p = li.querySelector(':scope > p');
    if (p) p.replaceWith(...p.childNodes);
  });
  const current = items.find((li) => {
    const a = li.querySelector('a');
    return a && new URL(a.href, window.location).pathname === window.location.pathname;
  }) || items[0];
  if (current) {
    current.classList.add('is-current');
    current.querySelector('a')?.setAttribute('aria-current', 'page');
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'model-nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Show model navigation');
  toggle.addEventListener('click', () => {
    const open = block.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  const bar = document.createElement('nav');
  bar.className = 'model-nav-bar';
  bar.setAttribute('aria-label', 'Model navigation');
  bar.append(list, toggle);
  block.replaceChildren(bar);
}
