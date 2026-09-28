/**
 * accordion — FAQ expander (Block Collection shape: one row per item,
 * cell 1 = question, cell 2 = answer).
 *
 * Behaviour (replica.js parity with the live gb-expander): the item gains `.active` and the
 * body animates its height over 0.3s. EW7: the authored question heading moves into a
 * div.accordion-title (never into a <button>/<summary>); the whole head row takes the click,
 * and a chevron-only <button> carries aria-expanded.
 */

let uid = 0;

export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [qCell, aCell] = [...row.children];
    uid += 1;
    const item = document.createElement('div');
    item.className = 'accordion-item';

    const head = document.createElement('div');
    head.className = 'accordion-head';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accordion-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', `accordion-body-${uid}`);
    toggle.setAttribute('aria-label', 'Expand');
    const title = document.createElement('div');
    title.className = 'accordion-title';
    if (qCell) title.append(...qCell.childNodes);
    head.append(toggle, title);

    const body = document.createElement('div');
    body.className = 'accordion-body';
    body.id = `accordion-body-${uid}`;
    body.hidden = true;
    const inner = document.createElement('div');
    inner.className = 'accordion-content';
    if (aCell) inner.append(...aCell.childNodes);
    body.append(inner);

    item.append(head, body);

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      item.classList.toggle('active', open);
      if (open) {
        body.hidden = false;
        body.style.height = '0px';
        body.getBoundingClientRect();
        body.style.height = `${body.scrollHeight}px`;
        body.addEventListener('transitionend', () => { body.style.height = ''; }, { once: true });
      } else {
        body.style.height = `${body.scrollHeight}px`;
        body.getBoundingClientRect();
        body.style.height = '0px';
        body.addEventListener('transitionend', () => {
          body.hidden = true;
          body.style.height = '';
        }, { once: true });
      }
    };
    head.addEventListener('click', () => setOpen(!item.classList.contains('active')));
    return item;
  });
  block.replaceChildren(...items);
}
