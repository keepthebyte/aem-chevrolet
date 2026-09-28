/**
 * stats — stat band (gb stat columns): one authored row per stat. The block is the grid and each
 * authored row stays the grid item (`.stats-item`), so the variant files (stats-capability.css,
 * stats-technology.css — owned by other bands) can style the raw row/cell shape.
 *
 * Row, one cell: value paragraph led by <strong> (or a heading) — <p><strong>Up to 478
 *   miles</strong></p> —
 *   then the label paragraph(s); disclosure triggers are links to their source fragment
 *   (site-wide disclosure convention — styled by the foundation, never restyled here).
 * Row, two cells: cell 1 = value, cell 2 = label.
 */

const isValue = (el) => /^H[1-6]$/.test(el.tagName)
  || (el.tagName === 'P' && el.firstElementChild?.tagName === 'STRONG'
    && el.textContent.trim() === el.firstElementChild.textContent.trim());

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('stats-item');
    const cells = [...row.children];
    if (cells.length > 1) {
      cells[0].classList.add('stat-value');
      cells.slice(1).forEach((c) => c.classList.add('stat-label'));
      return;
    }
    const cell = cells[0];
    if (!cell) return;
    const nodes = [...cell.children];
    const value = document.createElement('div');
    value.className = 'stat-value';
    const label = document.createElement('div');
    label.className = 'stat-label';
    nodes.forEach((n) => {
      if (!value.childElementCount && isValue(n)) value.append(n);
      else label.append(n);
    });
    cell.replaceChildren(...[value, label].filter((w) => w.childElementCount));
  });
}
