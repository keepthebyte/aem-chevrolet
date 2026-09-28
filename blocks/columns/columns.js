/**
 * columns — Block Collection columns (image/text splits and n-up units).
 *
 * Authoring: one row per band, one cell per column. A cell holding only an
 * image becomes the image column. Variants (block class): `powershift`
 * (image | text split), `trio` (3 image + title + subtitle units);
 * D/E variants live in columns-<variant>.css (@imported by columns.css).
 * The block only adds classes to generated/structural divs — every authored
 * element stays in place (EW1).
 */
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture, img');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
