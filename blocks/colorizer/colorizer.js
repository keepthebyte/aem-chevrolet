/**
 * colorizer — 360° colorizer, static initial state (the canvas flipbook spin and the interior
 * panorama are a delivery item — dynamics row). Behaviour ported from the prototype's replica.js:
 * Exterior/Interior tabs (active state) and colour chips (active state + colour name).
 *
 * Section head: default content before the block (<h2> eyebrow, <p> intro) — styled in place.
 * Authored content (classified by content, DA may flatten rows):
 *   images, in order: spin frame, drag helper, then one image per colour chip (alt "<Name> color
 *   chip")
 *   <ul> tab labels (Exterior, Interior — the first is active)
 *   <p> trim name, <p> colour name (disclosure "*" authored as <em>), CTA <p><strong><a>
 *   <p> note after the CTA ("Prices and colors may vary by model.")
 * The active chip is the one whose alt names the authored colour.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (el.tagName === 'P' && el.querySelectorAll('picture, img').length > 1) {
        [...el.children].forEach((c) => out.push(c));
      } else out.push(el);
    });
  });
  return out;
}

const chipName = (img) => (img?.getAttribute('alt') || '').replace(/\s*color chip\s*$/i, '').trim();

export default function decorate(block) {
  const nodes = collectNodes(block);
  const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
  const media = nodes.filter(isMedia);
  const tabs = nodes.find((n) => n.tagName === 'UL' || n.tagName === 'OL');
  const ctaIdx = nodes.findIndex((n) => n.tagName === 'P' && n.querySelector('a'));
  const texts = nodes.filter((n) => n.tagName === 'P' && !isMedia(n));
  const before = texts.filter((p) => ctaIdx < 0 || nodes.indexOf(p) < ctaIdx);
  const after = texts.filter((p) => ctaIdx >= 0 && nodes.indexOf(p) > ctaIdx);
  const [trim, color] = before;
  const cta = ctaIdx >= 0 ? nodes[ctaIdx] : null;

  const stage = document.createElement('div');
  stage.className = 'colorizer-stage';
  if (media[0]) stage.append(wrapNode(media[0], 'colorizer-frame'));
  if (media[1]) stage.append(wrapNode(media[1], 'colorizer-helper'));
  const full = document.createElement('button');
  full.type = 'button';
  full.className = 'colorizer-fullscreen';
  full.setAttribute('aria-label', 'Full screen');
  stage.append(full);

  const panel = document.createElement('div');
  panel.className = 'colorizer-panel';
  if (tabs) {
    tabs.setAttribute('role', 'tablist');
    const items = [...tabs.querySelectorAll('li')];
    const select = (t) => items.forEach((o) => {
      o.classList.toggle('is-active', o === t);
      o.setAttribute('aria-selected', String(o === t));
    });
    items.forEach((li) => {
      li.setAttribute('role', 'tab');
      li.tabIndex = 0;
      li.addEventListener('click', () => select(li));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(li); }
      });
    });
    if (items[0]) select(items[0]);
    panel.append(wrapNode(tabs, 'colorizer-tabs'));
  }

  const chips = document.createElement('ul');
  chips.className = 'colorizer-chips';
  const colorWrap = color ? wrapNode(color, 'colorizer-color') : null;
  const current = color ? color.textContent.replace(/\*/g, '').trim() : '';
  const chipEls = media.slice(2).map((m) => {
    const li = document.createElement('li');
    li.className = 'colorizer-chip';
    li.setAttribute('role', 'button');
    li.tabIndex = 0;
    li.append(m);
    return li;
  });
  const activate = (li) => {
    chipEls.forEach((o) => {
      o.classList.toggle('is-active', o === li);
      o.setAttribute('aria-pressed', String(o === li));
    });
    const name = chipName(li.querySelector('img'));
    if (color && name && color.firstChild?.nodeType === Node.TEXT_NODE) {
      color.firstChild.textContent = name;
    }
  };
  chipEls.forEach((li) => {
    const on = chipName(li.querySelector('img')) === current;
    li.classList.toggle('is-active', on);
    li.setAttribute('aria-pressed', String(on));
    li.addEventListener('click', () => activate(li));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(li); }
    });
    chips.append(li);
  });
  if (chipEls.length) panel.append(chips);
  if (trim) panel.append(wrapNode(trim, 'colorizer-trim'));
  if (colorWrap) panel.append(colorWrap);
  if (cta) panel.append(wrapNode(cta, 'colorizer-actions'));

  const body = document.createElement('div');
  body.className = 'colorizer-body';
  body.append(stage, panel);
  const parts = [body];
  after.forEach((p) => parts.push(wrapNode(p, 'colorizer-note')));
  const leftovers = [...block.querySelectorAll(':scope > div > div > *')];
  if (leftovers.length) parts.push(...leftovers);
  block.replaceChildren(...parts);
}
