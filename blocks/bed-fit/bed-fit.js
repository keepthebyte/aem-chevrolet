/**
 * bed-fit — bed "fit items" selector: one selector row of item tiles, one photo + fit-spec
 * panel per item.
 *
 * Authoring rows (one per item, 3 cells):
 *   1. item icon (<img>) + item label paragraph ("Couch")
 *   2. photo — desktop (2:1) image, optionally followed by a mobile (1:1) image
 *      (the block shows one per breakpoint)
 *   3. fit spec — "Fit items up to" / <strong>length</strong> paragraph / "in length*" /
 *      sub-line / <ul> of steps
 *
 * Behaviour (replica.js parity): clicking tile i shows panel i. The source repeats the selector
 * inside every panel; here ONE authored selector drives all panels (the repeats were hidden
 * duplicates with no visible delta, so no presentational copies are rendered).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const media = (cell) => [...cell.querySelectorAll('picture, img')]
  .filter((m) => !(m.tagName === 'IMG' && m.closest('picture')))
  .map((m) => (m.parentElement && m.parentElement.tagName === 'P' ? m.parentElement : m));

export default function decorate(block) {
  const rows = [...block.children];
  const tabs = document.createElement('div');
  tabs.className = 'bed-fit-tabs';
  tabs.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'bed-fit-panels';

  const items = rows.map((row, i) => {
    const [iconCell, photoCell, specCell] = [...row.children];
    const tab = document.createElement('div');
    tab.className = 'bed-fit-tab';
    tab.setAttribute('role', 'tab');
    tab.tabIndex = 0;
    if (iconCell) {
      const [icon] = media(iconCell);
      if (icon) tab.append(wrapNode(icon, 'bed-fit-icon'));
      const label = document.createElement('div');
      label.className = 'bed-fit-label';
      label.append(...iconCell.children);
      tab.append(label);
    }
    const panel = document.createElement('div');
    panel.className = 'bed-fit-panel';
    panel.setAttribute('role', 'tabpanel');
    if (photoCell) {
      const [desktop, mobile] = media(photoCell);
      const photo = document.createElement('div');
      photo.className = mobile ? 'bed-fit-photo has-mobile' : 'bed-fit-photo';
      if (desktop) photo.append(wrapNode(desktop, 'bed-fit-photo-desktop'));
      if (mobile) photo.append(wrapNode(mobile, 'bed-fit-photo-mobile'));
      panel.append(photo);
    }
    if (specCell) {
      const spec = document.createElement('div');
      spec.className = 'bed-fit-spec';
      // classify by content (EW1: nodes move, never copied): the <strong> paragraph is the length;
      // the
      // paragraph right after it ("in length*") stays plain; later paragraphs are the sub-line.
      let seenLength = 0;
      [...specCell.children].forEach((el) => {
        if (el.tagName === 'P' && el.querySelector('strong') && !seenLength) {
          seenLength = 1;
          spec.append(wrapNode(el, 'bed-fit-length'));
        } else if (el.tagName === 'P' && seenLength === 1) {
          seenLength = 2;
          spec.append(el);
        } else if (el.tagName === 'P' && seenLength === 2) {
          spec.append(wrapNode(el, 'bed-fit-sub'));
        } else {
          spec.append(el);
        }
      });
      panel.append(spec);
    }
    tabs.append(tab);
    panels.append(panel);
    return { tab, panel, i };
  });

  const select = (idx) => items.forEach(({ tab, panel, i }) => {
    const on = i === idx;
    panel.hidden = !on;
    tab.classList.toggle('active', on);
    tab.setAttribute('aria-selected', String(on));
  });
  items.forEach(({ tab, i }) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
    });
  });
  block.replaceChildren(panels, tabs);
  select(0);
}
