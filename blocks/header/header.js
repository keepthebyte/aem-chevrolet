import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Chevrolet global nav (gb-global-nav), template-slotted. /nav document: section 1 = brand (logo
 * link), section 2 = main nav list (Vehicles, Shop), section 3 = tools (:account: icon). The
 * mega-menu flyouts behind Vehicles / Shop / the hamburger were not captured (dynamic-features
 * row 8) — the triggers keep the stock aria-expanded machinery for when they are.
 */

// source breakpoint: the nav row stacks below 800px
const isDesktop = window.matchMedia('(min-width: 800px)');

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (!nav) return;
  toggleAllNavSections(nav.querySelector('.nav-sections'));
  nav.setAttribute('aria-expanded', 'false');
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Additional Products and Services' : 'Close menu');
  if (!expanded) window.addEventListener('keydown', closeOnEscape);
  else window.removeEventListener('keydown', closeOnEscape);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  ['brand', 'sections', 'tools'].forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand link must not render as a button
  const brandLink = nav.querySelector('.nav-brand a.button');
  if (brandLink) {
    brandLink.className = '';
    const wrapper = brandLink.closest('.button-wrapper');
    if (wrapper) wrapper.className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((item) => {
      item.classList.add('nav-drop');
      item.setAttribute('aria-expanded', 'false');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('click', () => {
        const expanded = item.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  // hamburger (visible at every width on the source)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const hamburgerButton = document.createElement('button');
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-label', 'Additional Products and Services');
  const hamburgerIcon = document.createElement('span');
  hamburgerIcon.className = 'nav-hamburger-icon';
  hamburgerButton.append(hamburgerIcon);
  hamburger.append(hamburgerButton);
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
