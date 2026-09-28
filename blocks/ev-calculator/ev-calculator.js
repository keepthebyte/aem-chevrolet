/**
 * ev-calculator — "Electric vs. gas" cost comparison (static initial state; the eGallon/fuel-cost
 * API is an owner decision — dynamics row). A real <form> with a <select> built from authored rows.
 *
 * Section head (default content before the block, reabsorbed — EW8): <h2> title, <h2> subtitle.
 * Rows (classified by content, not index):
 *   <p>Vehicle</p><ul><li>option…</li></ul>   — select label + options (first option selected)
 *   <p>Your Zip Code</p>                        — zip field label
 *   <p>Compare</p>                              — submit label
 *   <p>$0.00</p><p>Electric</p>                 — result (value + label), repeated for Gas
 *   <p>The electric cost is calculated…</p>     — note
 *   image                                       — vehicle image
 *   <h2>Model images shown throughout…</h2>     — disclaimer
 *
 * @ew-exempt <li> vehicle options — form control data (EW5c); rendered as <option>s, the list
 *   stays hidden
 */

let uid = 0;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
      && kids[0].childElementCount > 1) {
      kids = [...kids[0].children];
    }
    out.push(...kids);
  });
  return out;
}

const text = (el) => (el ? el.textContent.trim() : '');

export default function decorate(block) {
  uid += 1;
  const id = `ev-calculator-${uid}`;

  // section head (default content) — MOVE its children into the block (EW8)
  const headSource = block.parentElement?.previousElementSibling;
  const head = document.createElement('div');
  head.className = 'ev-calculator-head';
  if (headSource?.classList.contains('default-content-wrapper')) {
    const headings = [...headSource.querySelectorAll('h1, h2, h3, h4, p')];
    headings.forEach((h, i) => head.append(wrapNode(h, i === 0 ? 'ev-calculator-title' : 'ev-calculator-sub')));
    headSource.remove();
  }

  // classify authored nodes
  const nodes = collectNodes(block);
  const list = nodes.find((n) => n.tagName === 'UL' || n.tagName === 'OL');
  const media = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
  const disclaimer = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const paras = nodes.filter((n) => n.tagName === 'P' && n !== media);
  const listIdx = list ? nodes.indexOf(list) : -1;
  const vehicleLabel = listIdx > 0 && nodes[listIdx - 1].tagName === 'P' ? nodes[listIdx - 1] : null;
  const rest = paras.filter((p) => p !== vehicleLabel);
  const [zipLabel, submitLabel, ...tail] = rest;
  const results = [];
  let note = null;
  for (let i = 0; i < tail.length; i += 1) {
    if (/^\$/.test(text(tail[i])) && tail[i + 1]) {
      results.push([tail[i], tail[i + 1]]);
      i += 1;
    } else if (!note) note = tail[i];
  }

  // form
  const form = document.createElement('form');
  form.className = 'ev-calculator-form';
  form.noValidate = true;
  form.addEventListener('submit', (e) => e.preventDefault());

  const vehicle = document.createElement('div');
  vehicle.className = 'ev-calculator-field ev-calculator-vehicle';
  const select = document.createElement('select');
  select.name = 'vehicle';
  if (vehicleLabel) {
    vehicleLabel.id = `${id}-vehicle`;
    select.setAttribute('aria-labelledby', vehicleLabel.id);
    vehicle.append(wrapNode(vehicleLabel, 'ev-calculator-label ev-calculator-vehicle-label'));
  }
  if (list) {
    [...list.querySelectorAll('li')].forEach((li, i) => {
      const opt = document.createElement('option');
      opt.value = text(li);
      opt.textContent = text(li);
      if (i === 0) opt.selected = true;
      select.append(opt);
    });
    list.hidden = true;
    vehicle.append(list);
  }
  vehicle.append(select);

  const zip = document.createElement('div');
  zip.className = 'ev-calculator-field ev-calculator-zip';
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'zip';
  input.inputMode = 'numeric';
  input.autocomplete = 'postal-code';
  if (zipLabel) {
    zipLabel.id = `${id}-zip`;
    input.setAttribute('aria-labelledby', zipLabel.id);
    zip.append(wrapNode(zipLabel, 'ev-calculator-label'));
  }
  zip.append(input);

  const submit = document.createElement('div');
  submit.className = 'ev-calculator-submit';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button primary';
  if (submitLabel) {
    submitLabel.id = `${id}-submit`;
    button.setAttribute('aria-labelledby', submitLabel.id);
  }
  submit.append(button);
  if (submitLabel) submit.append(wrapNode(submitLabel, 'ev-calculator-submit-label'));
  form.append(vehicle, zip, submit);

  // results
  const out = document.createElement('div');
  out.className = 'ev-calculator-results';
  const cols = document.createElement('div');
  cols.className = 'ev-calculator-cols';
  results.forEach(([value, label], i) => {
    const r = document.createElement('div');
    r.className = `ev-calculator-result ${i === 0 ? 'electric' : 'gas'}`;
    r.append(wrapNode(value, 'ev-calculator-value'), wrapNode(label, 'ev-calculator-result-label'));
    cols.append(r);
  });
  if (note) cols.append(wrapNode(note, 'ev-calculator-note'));
  out.append(cols);
  if (media) out.append(wrapNode(media.closest('p') || media, 'ev-calculator-media'));

  const parts = [head, form, out];
  if (disclaimer) parts.push(wrapNode(disclaimer, 'ev-calculator-disclaimer'));
  const leftovers = [...block.querySelectorAll(':scope > div > div > *')];
  if (leftovers.length) parts.push(...leftovers);
  block.replaceChildren(...parts);
}
