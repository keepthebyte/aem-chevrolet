/**
 * carousel — generic native-scroll carousel
 * (variants: trims, quotes, cards, stars, gallery, videos).
 *
 * Authoring (reconstructive, one ROW per slide):
 *   | carousel <variant> [loop] [counter] |
 *   | cell 1 | cell 2 | cell 3 |   ← one row per slide, 1–3 cells in visual order
 *   A cell holding only images (<img>/<picture>) is a MEDIA cell; any other cell is TEXT
 *   (h3 / p / ul / links; sub-field kicker → leading <strong>; CTAs per D6 <strong>/<em> links).
 *   The section head (eyebrow/heading) and any CTA under the carousel are DEFAULT CONTENT
 *   in the same section — never block rows.
 *
 * Decorated DOM (nodes MOVED, never rebuilt — EW1):
 *   .carousel-viewport (native x-scroller) > ul.carousel-slides > li.carousel-slide
 *     > div.carousel-cell.carousel-cell-<n>.(carousel-media|carousel-text)
 *       (n = 1-based authored cell); in media cells each image moves into
 *       div.carousel-media-item.carousel-media-item-<k> (k = 1-based)
 *   .carousel-nav > button.carousel-prev [span.carousel-counter] button.carousel-next
 *
 * Behaviour (port of stardust/prototypes/js/replica.js, observed on live): arrows scroll one slide
 * step (slide 2 left − slide 1 left); prev/next disabled at the ends unless `loop` (then wraps);
 * `counter` renders "n/N" — a runtime value, the only generated text (#100 allowlist).
 * Variant files (carousel-<variant>.css, @imported by carousel.css) own insets,
 * slide sizes, cell layout and type.
 */

const isMediaCell = (cell) => !!cell.querySelector('picture, img') && !cell.textContent.trim();

function slideStep(scroller) {
  const items = [...scroller.querySelectorAll('.carousel-slide')].filter((li) => li.offsetWidth);
  if (items.length < 2) return scroller.clientWidth;
  return items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
}

function navButton(className, label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.setAttribute('aria-label', label);
  return b;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const loop = block.classList.contains('loop');

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';
  const list = document.createElement('ul');
  list.className = 'carousel-slides';
  viewport.append(list);

  rows.forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    li.dataset.slide = String(i + 1);
    [...row.children].forEach((cell, c) => {
      const media = isMediaCell(cell);
      cell.classList.add('carousel-cell', `carousel-cell-${c + 1}`, media ? 'carousel-media' : 'carousel-text');
      // media cells: each authored image (<p>/<picture>) moves into its own wrapper (EW2)
      if (media) {
        [...cell.children].forEach((item, k) => {
          const w = document.createElement('div');
          w.className = `carousel-media-item carousel-media-item-${k + 1}`;
          cell.append(w);
          w.append(item);
        });
      }
      li.append(cell); // the generated cell div moves with its authored children intact
    });
    list.append(li);
  });

  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  const prev = navButton('carousel-prev', 'Previous Slide');
  const next = navButton('carousel-next', 'Next Slide');
  nav.append(prev);
  let counter = null;
  if (block.classList.contains('counter')) {
    counter = document.createElement('span');
    counter.className = 'carousel-counter';
    counter.setAttribute('aria-live', 'polite');
    nav.append(counter);
  }
  nav.append(next);
  block.replaceChildren(viewport, nav);

  const total = rows.length;
  const sync = () => {
    const max = viewport.scrollWidth - viewport.clientWidth - 2;
    block.classList.toggle('is-scrollable', max > 0);
    if (!loop) {
      prev.disabled = viewport.scrollLeft <= 2;
      next.disabled = viewport.scrollLeft >= max;
      prev.classList.toggle('is-disabled', prev.disabled);
      next.classList.toggle('is-disabled', next.disabled);
    }
    if (counter) {
      const step = slideStep(viewport) || 1;
      counter.textContent = `${Math.min(total, Math.round(viewport.scrollLeft / step) + 1)}/${total}`;
    }
  };
  const go = (dir) => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    let to = viewport.scrollLeft + dir * slideStep(viewport);
    if (loop && to > max + 2) to = 0;
    if (loop && to < -2) to = max;
    viewport.scrollTo({ left: to, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  viewport.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(sync));
  sync();
  requestAnimationFrame(sync);
}
