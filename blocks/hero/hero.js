/**
 * hero — Silverado EV masthead (template-slotted, replica of gb-content-overlay hero).
 *
 * Authoring (queried by content, never by row index — DA may flatten the rows):
 *   - image(s): desktop image first; an optional second image is the < 800px rendition
 *   - <h2> model year ("2026"), followed by a <p> with the previous-year link ("2025", collapsed
 *   at rest)
 *   - <h1> model name
 *   - <p> price line ("As shown $86,600" + disclosure link "*")
 *   - CTAs: secondary <em><a>, primary <strong><a> (desktop: inside the image, right;
 *     < 800px: stacked below the image, primary first)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  // 1. query + capture before moving anything
  const media = [...block.querySelectorAll('picture, img')]
    .filter((el) => el.tagName === 'PICTURE' || !el.closest('picture'));
  const title = block.querySelector('h1');
  const year = block.querySelector('h2');
  const ctas = [...block.querySelectorAll('a.button, p > strong > a, p > em > a')]
    .map((a) => a.closest('p') || a)
    .filter((p, i, all) => all.indexOf(p) === i);
  const paras = [...block.querySelectorAll('p')]
    .filter((p) => !ctas.includes(p) && !p.querySelector('picture, img'));
  const years = paras.find((p) => /^\s*\d{4}\s*$/.test(p.textContent));
  const price = paras.find((p) => p !== years);

  // 2. layout wrappers
  const stage = document.createElement('div');
  stage.className = 'hero-stage';
  const mediaBox = document.createElement('div');
  mediaBox.className = 'hero-media';
  media.forEach((m, i) => mediaBox.append(wrapNode(m, i === 0 ? 'hero-media-lg' : 'hero-media-sm')));
  if (media.length < 2) mediaBox.classList.add('hero-media-single');
  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  // 3. move the authored nodes
  if (year) {
    const yearBox = wrapNode(year, 'hero-year');
    if (years) yearBox.append(wrapNode(years, 'hero-years'));
    inner.append(yearBox);
  }
  if (title) inner.append(wrapNode(title, 'hero-title'));
  if (price) inner.append(wrapNode(price, 'hero-price'));
  stage.append(mediaBox, inner);

  const actions = document.createElement('div');
  actions.className = 'hero-actions';
  actions.append(...ctas);

  // leftovers: any authored element no slot consumed stays visible
  const leftovers = [...block.querySelectorAll(':scope > div > div > *')];
  if (leftovers.length) inner.append(...leftovers);

  block.replaceChildren(stage, actions);
}
