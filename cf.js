/*
 * CP Ally for Codeforces — shared helpers
 *
 * Loaded by both the content script and the popup, so the logic that
 * recognises a Codeforces problem URL and launches the cpally:// link lives
 * in exactly one place.
 *
 * Content-script files listed together in the manifest share one scope, and
 * classic <script> tags in popup.html share the global lexical environment,
 * so the functions below are visible to content.js and popup.js without any
 * module wiring.
 */

// Recognised Codeforces problem URL shapes. Each pattern captures
// (contestId, index); the problem "code" is the two joined, e.g. 4 + A => "4A".
const CF_PROBLEM_PATTERNS = [
  // https://codeforces.com/contest/4/problem/A
  /^\/contest\/(\d+)\/problem\/([A-Za-z]\d*)\/?$/,
  // https://codeforces.com/problemset/problem/4/A
  /^\/problemset\/problem\/(\d+)\/([A-Za-z]\d*)\/?$/,
  // https://codeforces.com/gym/102222/problem/A
  /^\/gym\/(\d+)\/problem\/([A-Za-z]\d*)\/?$/,
  // https://codeforces.com/group/<groupId>/contest/4/problem/A
  /^\/group\/[^/]+\/contest\/(\d+)\/problem\/([A-Za-z]\d*)\/?$/,
];

/**
 * Extract the problem code (e.g. "4A") from a Codeforces URL.
 * Returns null when the URL is not a recognised problem page.
 * @param {string} url
 * @returns {string|null}
 */
function extractProblemCode(url) {
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch (_) {
    return null; // not a valid/absolute URL (e.g. an empty tab)
  }

  for (const pattern of CF_PROBLEM_PATTERNS) {
    const match = pathname.match(pattern);
    if (match) {
      const contestId = match[1];
      const index = match[2].toUpperCase();
      return `${contestId}${index}`;
    }
  }
  return null;
}

/**
 * Build the cpally:// deep link for a given problem code.
 * @param {string} code e.g. "4A"
 * @returns {string}
 */
function buildCpAllyUrl(code) {
  return `cpally://problem/${code}`;
}

/**
 * Hand a cpally:// link off to the registered protocol handler without
 * navigating the current page. A throwaway hidden iframe is the least
 * intrusive way to trigger an external-protocol launch.
 *
 * Must be called from within a user gesture (keydown / click) so Chrome
 * allows the external-protocol prompt to appear.
 * @param {string} code e.g. "4A"
 */
function launchCpAlly(code) {
  const url = buildCpAllyUrl(code);
  console.log(`[CP Ally] launching ${url}`);

  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.src = url;
  document.body.appendChild(frame);

  // The launch fires synchronously; drop the frame once it has done its job.
  setTimeout(() => frame.remove(), 2000);
}
