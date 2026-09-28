/**
 * icon-grid — Multi-Flex Tailgate configurations: centred icon + title + description,
 * 3-up (1-up below 800px).
 *
 * Authoring rows (one per item, one cell): icon image, title paragraph, description paragraph.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const item = document.createElement('div');
    item.className = 'icon-grid-item';
    const nodes = [...row.querySelectorAll(':scope > div > *')];
    let titled = false;
    nodes.forEach((el) => {
      if (el.matches('picture, img') || el.querySelector('picture, img')) {
        item.append(wrapNode(el, 'icon-grid-icon'));
      } else if (!titled && el.tagName !== 'UL') {
        titled = true;
        item.append(wrapNode(el, 'icon-grid-title'));
      } else {
        item.append(wrapNode(el, 'icon-grid-text'));
      }
    });
    return item;
  });
  block.replaceChildren(...items);
}
