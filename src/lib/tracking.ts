/**
 * Forwards campaign tracking params (utm_*, gclid, fbclid, …) from this landing
 * page's URL onto outbound links back to the main site.
 *
 * The main site reads these off its own URL and carries them through checkout to
 * the GA4 purchase event — but only if they are present on arrival. Every link
 * here is a hardcoded absolute URL, so without this the query string is dropped
 * on the first click and the booking can never be tied back to the campaign.
 *
 * Applied where each URL is built, rather than by rewriting hrefs in the DOM
 * after load, because this page is a React SPA:
 *   - the DOM is still empty at DOMContentLoaded (and at window.load), so a
 *     querySelectorAll pass finds nothing at all;
 *   - React overwrites any externally-set href as soon as the underlying value
 *     changes — which is exactly what the 4/7-day booking toggle does.
 */

const MM_HOST = 'madmonkeyhostels.com';

/**
 * Captured once at module load. The landing page never mutates its own query
 * string, so this stays valid for the life of the page.
 */
const CAPTURED_SEARCH = typeof window === 'undefined' ? '' : window.location.search;

/**
 * Returns `href` with the landing page's query params appended, if and only if
 * it points at the main site. Anything else — social links, same-page anchors,
 * relative paths — is returned untouched.
 *
 * Params already present on the target link win; they are never clobbered.
 * The `search` argument exists for testing.
 */
export function withTracking(href: string, search: string = CAPTURED_SEARCH): string {
  if (!search || !href || href.startsWith('#')) return href;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href; // relative or malformed — leave it alone
  }

  if (url.hostname !== MM_HOST && !url.hostname.endsWith(`.${MM_HOST}`)) return href;

  new URLSearchParams(search).forEach((value, key) => {
    if (!url.searchParams.has(key)) url.searchParams.append(key, value);
  });

  return url.toString();
}
