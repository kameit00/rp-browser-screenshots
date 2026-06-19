/**
 * Pages to screenshot.
 *
 * Each entry is either:
 *   - a string:  a path relative to BASE_URL ("/", "/checkout/cart") OR an
 *                absolute URL ("https://shop.example.com/some-page").
 *   - an object: { path, fullPage?, label? }
 *
 * BASE_URL is provided via the BASE_URL env var (set it locally and in CI).
 *
 * >>> EDIT THIS LIST with your shop's pages. <<<
 */
export type UrlEntry =
  | string
  | {
      path: string;
      fullPage?: boolean; // default true
      label?: string; // optional filename override
    };

const urls: UrlEntry[] = [
  {
    path: 'https://www.relax-pillow.de/seitenschlaeferkissen-lagerungsrolle-160-x-40-cm-mit-bezug.html',
    label: 'product-lagerungsrolle',
    fullPage: true,
  },
  // Add more pages here, e.g.:
  // '/',                                       // homepage (uses BASE_URL)
  // '/checkout/cart',
  // { path: '/contact', fullPage: false },
];

export default urls;
