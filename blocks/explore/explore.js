/**
 * explore — "Explore Trucks" lockup: centred heading, lockup image (desktop + optional
 * mobile crop), two CTAs.
 *
 * Authoring (one cell or several, any order): heading, desktop image, optional mobile image,
 * primary CTA (<strong><a>), secondary CTA (<em><a>).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const nodes = [...block.querySelectorAll(':scope > div > div > *')];
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const pics = nodes.filter((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const ctas = nodes.filter((n) => n.querySelector('a') && !pics.includes(n));
  const rest = nodes.filter((n) => n !== heading && !pics.includes(n) && !ctas.includes(n));

  const box = document.createElement('div');
  box.className = 'explore-inner';
  if (heading) box.append(wrapNode(heading, 'explore-heading'));
  if (pics.length) {
    const media = document.createElement('div');
    media.className = pics.length > 1 ? 'explore-media has-mobile' : 'explore-media';
    media.append(wrapNode(pics[0], 'explore-desktop'));
    if (pics[1]) media.append(wrapNode(pics[1], 'explore-mobile'));
    box.append(media);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'explore-actions';
    actions.append(...ctas);
    box.append(actions);
  }
  box.append(...rest);
  block.replaceChildren(box);
}
