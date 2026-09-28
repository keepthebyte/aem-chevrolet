/**
 * range-features — icon features under RANGE (One-Pedal Driving, Regen on Demand), reconstructive.
 *
 * Authoring (one row per feature):
 *   | range-features |
 *   | <img> icon | <p><strong>title</strong></p> <p>description</p> |
 * A cell holding only an image is the icon; any other cell is the text.
 * Nodes are moved, never rebuilt (EW1).
 */
const isMedia = (cell) => !!cell.querySelector('picture, img') && !cell.textContent.trim();

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const list = document.createElement('ul');
  list.className = 'range-features-list';
  rows.forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'range-feature';
    li.dataset.item = String(i + 1);
    [...row.children].forEach((cell) => {
      cell.classList.add(isMedia(cell) ? 'range-feature-icon' : 'range-feature-text');
      li.append(cell);
    });
    list.append(li);
  });
  block.replaceChildren(list);
}
