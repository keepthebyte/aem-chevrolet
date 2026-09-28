/**
 * charging-options — three icon columns (home / on-the-go / app) with a text
 * link or app-store badges (band C, prototype parts/30-charging .bc-ways).
 *
 * Authoring: one row per option, one cell: icon image, <h3> title, <p> text,
 * then EITHER a link paragraph OR, per store, a badge image paragraph followed
 * by a paragraph whose link text is the store URL.
 *
 * @ew-exempt <a> store-badge link text (the URL) — text-as-metadata; the badge
 *   image is the visible label (moved into the anchor, alt → aria-label).
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// a CTA paragraph: its only content is one link (inline disclosure links stay in the text)
const isLinkPara = (el) => {
  const a = el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim();
};
const isImagePara = (el) => el.matches('picture, img') || !!el.querySelector('picture, img');
const isUrlLink = (a) => {
  try {
    return new URL(a.textContent.trim(), window.location).href === new URL(a.href).href;
  } catch {
    return false;
  }
};

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const kids = [...cell.children];
    const item = document.createElement('div');
    item.className = 'charging-option';
    const badges = document.createElement('div');
    badges.className = 'option-badges';
    let seenTitle = false;
    kids.forEach((el, i) => {
      const next = kids[i + 1];
      const nextLink = next && isLinkPara(next) ? next.querySelector('a') : null;
      if (isImagePara(el) && !seenTitle) {
        item.append(wrapNode(el, 'option-icon'));
      } else if (isImagePara(el) && nextLink && isUrlLink(nextLink)) {
        // badge: move the authored image into the authored store link
        const media = el.querySelector('picture, img') || el;
        const label = document.createElement('span');
        label.className = 'url';
        label.append(...nextLink.childNodes);
        nextLink.prepend(media);
        nextLink.append(label);
        const img = nextLink.querySelector('img');
        if (img && img.alt) nextLink.setAttribute('aria-label', img.alt);
        el.remove();
      } else if (isLinkPara(el) && isUrlLink(el.querySelector('a'))) {
        badges.append(el);
      } else if (el.matches('h1, h2, h3, h4, h5, h6')) {
        seenTitle = true;
        item.append(wrapNode(el, 'option-title'));
      } else if (isLinkPara(el)) {
        item.append(wrapNode(el, 'option-link'));
      } else {
        item.append(wrapNode(el, 'option-text'));
      }
    });
    if (badges.children.length) item.append(badges);
    row.replaceChildren(item);
  });
}
