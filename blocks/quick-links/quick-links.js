/**
 * quick-links — four shopping-tool tiles (icon, title, link label); each whole tile is the link.
 *
 * One authored row per tile, one cell: icon image, <h2> title, <p><a href>label</a></p>.
 * The tile becomes an <a> carrying the authored href; the authored inner anchor is unwrapped (EW6)
 * so the label paragraph (and its editor index) survives inside the tile link.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'quick-links-list';
  [...block.children].forEach((row) => {
    const media = row.querySelector('picture, img');
    const mediaPara = media ? (media.closest('p') || media) : null;
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    const link = row.querySelector('a[href]');
    if (!heading && !link) return;
    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'quick-links-tile';
    if (link) tile.href = link.href;
    if (mediaPara) tile.append(wrapNode(mediaPara, 'quick-links-icon'));
    if (heading) tile.append(wrapNode(heading, 'quick-links-title'));
    if (link) {
      const labelPara = link.closest('p') || link;
      tile.append(wrapNode(labelPara, 'quick-links-label'));
      link.replaceWith(...link.childNodes);
    }
    // leftovers stay visible inside the tile
    row.querySelectorAll(':scope > div > *').forEach((n) => tile.append(n));
    const li = document.createElement('li');
    li.append(tile);
    list.append(li);
  });
  block.replaceChildren(list);
}
