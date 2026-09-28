/**
 * video — inline video with poster (Silverado EV "Super Cruise :25" row).
 *
 * Authoring rows (queried, not indexed):
 *   - poster: an editorial <img>/<picture> (the frame the player shows at rest)
 *   - caption: a heading (<h3>) under the player
 *   - source: a link to the Brightcove player URL (…/index.html?videoId=…)
 * The player itself is a delivery item: the block renders the poster with the
 * static player-state control, and exposes the video id as data-video-id so the
 * Brightcove embed can be wired later without re-authoring.
 *
 * @ew-exempt <p> Brightcove source link (row 3) — config: read into data-video-id /
 *   data-video-src, then removed from the rendered DOM (never displayed)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const media = block.querySelector('picture') || block.querySelector('img');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const link = block.querySelector('a[href]');

  const frame = document.createElement('div');
  frame.className = 'video-frame';
  if (media) frame.append(media.closest('p') && media.closest('p').children.length === 1 ? media.closest('p') : media);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'video-toggle';
  toggle.setAttribute('aria-label', 'Pause video');
  frame.append(toggle);

  const parts = [frame];
  if (heading) parts.push(wrapNode(heading, 'video-caption'));

  if (link) {
    block.dataset.videoSrc = link.href;
    try {
      const id = new URL(link.href).searchParams.get('videoId');
      if (id) block.dataset.videoId = id;
    } catch { /* not a URL — data-video-src still carries it */ }
    (link.closest('p') || link).remove();
  }

  // leftovers pass: any authored element no slot consumed stays visible
  const leftovers = [...block.querySelectorAll(':scope > div > div > *')];
  block.replaceChildren(...parts, ...leftovers);
}
