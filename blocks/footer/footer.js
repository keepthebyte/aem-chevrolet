import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Chevrolet global footer (gb-global-footer), template-slotted by section order of the /footer
 * document: 1 logo · 2 link columns (desktop) · 3 link columns (mobile — the source authors a
 * separate mobile set) 4 CTAs (Get Updates, Search) · 5 social links · 6 legal links · 7
 * preference links (AdChoices, privacy choices).
 */
const ROLES = ['logo', 'links', 'links-sm', 'cta', 'social', 'legal', 'prefs'];

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'gfoot';
  [...fragment.children].forEach((section, i) => {
    if (ROLES[i]) section.classList.add(`footer-${ROLES[i]}`);
    footer.append(section);
  });

  // brand-link paragraphs and icon links must not render as buttons
  footer.querySelectorAll('.footer-social a.button, .footer-prefs a.button').forEach((a) => {
    a.className = '';
    const p = a.closest('.button-wrapper');
    if (p) p.className = '';
  });

  // the Search link (icon + label) is a tertiary link, not a button
  footer.querySelectorAll('.footer-cta a:not(.button)').forEach((a) => a.classList.add('footer-search'));

  block.append(footer);

  // chat launcher (Salesforce embedded messaging on the source): static, icon-only; wiring the
  // messaging embed is an owner decision (dynamic-features row 9)
  if (!document.querySelector('.chat-launcher')) {
    const chat = document.createElement('button');
    chat.type = 'button';
    chat.className = 'chat-launcher';
    chat.setAttribute('aria-label', 'Chevrolet Web Messaging');
    document.body.append(chat);
  }
}
