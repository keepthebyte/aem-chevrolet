/**
 * compare-table — head-to-head spec table (Silverado EV vs. a rival), reconstructive.
 *
 * Authoring:
 *   | compare-table |
 *   head row (2 cells): | <h2>2026</h2><h3>Silverado EV</h3> | <h2>2025</h2><h3>Rivian R1T</h3> |
 *   one row per spec (3 cells): | <p>label</p> | values [+ (caption)] + <img> | values + <img> |
 * Value cells: each heading/paragraph is a value, except a parenthesised one "( … )" — its
 * caption; a paragraph holding only an image is the verdict icon. Disclosure links stay inline.
 * Small-screen twin (the source carries one where the < 800 cell differs): headings authored AFTER
 * the verdict icon — first = value, the rest caption style; shown < 800 in place of those before
 * the icon (which then show >= 800 only). The icon stays below whichever set is visible.
 * The head row is found by content (a cell with an <h3>, no image), never by index.
 * Nodes are moved, never rebuilt (EW1); generated wrappers carry the layout classes (EW2).
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}
const text = (el) => (el ? el.textContent.trim() : '');
const isIcon = (el) => !!el.querySelector('picture, img') && !text(el);
const isCaption = (el) => /^\(.*\)$/s.test(text(el));

function decorateSide(cell, index) {
  cell.classList.add('compare-table-side', `compare-table-side-${index}`);
  const kids = [...cell.children];
  const iconAt = kids.findIndex(isIcon);
  const hasAlt = iconAt > -1 && iconAt < kids.length - 1;
  if (hasAlt) cell.classList.add('compare-table-has-alt');
  kids.forEach((el, i) => {
    let cls = 'compare-table-value';
    if (i === iconAt) cls = 'compare-table-icon';
    else if (hasAlt && i > iconAt) {
      cls = i === iconAt + 1 ? 'compare-table-value compare-table-alt' : 'compare-table-caption compare-table-alt';
    } else if (isCaption(el)) cls = 'compare-table-caption';
    if (hasAlt && i < iconAt) cls += ' compare-table-main';
    const w = document.createElement('div');
    w.className = cls;
    el.before(w);
    w.append(el); // move, never clone (EW1)
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const head = rows.find((row) => row.querySelector('h3') && !row.querySelector('picture, img'));
  const body = document.createElement('div');
  body.className = 'compare-table-body';

  if (head) {
    head.className = 'compare-table-head';
    [...head.children].forEach((cell, i) => {
      cell.classList.add('compare-table-side', `compare-table-side-${i + 1}`);
      const year = cell.querySelector('h2');
      const model = cell.querySelector('h3');
      if (year) cell.prepend(wrapNode(year, 'compare-table-year'));
      if (model) cell.append(wrapNode(model, 'compare-table-model'));
    });
  }

  rows.filter((row) => row !== head).forEach((row, i) => {
    row.className = `compare-table-row compare-table-row-${i + 1}`;
    const [label, ...sides] = [...row.children];
    if (label) label.classList.add('compare-table-label');
    sides.forEach((cell, s) => decorateSide(cell, s + 1));
    body.append(row);
  });

  block.replaceChildren(...(head ? [head] : []), body);
}
