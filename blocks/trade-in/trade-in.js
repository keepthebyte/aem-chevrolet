/**
 * trade-in — icon + text + link row ("Find your trade-in value"), template-slotted.
 *
 * Authoring (one row, three cells; cells classified by content, order-tolerant):
 *   | trade-in |
 *   | <img> icon | <p><strong>title</strong></p> <p>description</p> | <p><a>link</a></p> |
 * The generated cell divs take the slot classes; authored nodes stay where they are (EW1).
 */
const isMedia = (cell) => !!cell.querySelector('picture, img') && !cell.textContent.trim();
const isLinkOnly = (cell) => {
  const links = cell.querySelectorAll('a');
  return links.length > 0 && [...links].map((a) => a.textContent).join('').trim() === cell.textContent.trim();
};

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) return;
  const row = document.createElement('div');
  row.className = 'trade-in-row';
  cells.forEach((cell) => {
    if (isMedia(cell)) cell.classList.add('trade-in-icon');
    else if (isLinkOnly(cell)) cell.classList.add('trade-in-link');
    else cell.classList.add('trade-in-text');
    row.append(cell);
  });
  block.replaceChildren(row);
}
