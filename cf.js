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

/**
 * Parse a Codeforces URL into its problem parts.
 * Returns null when the URL is not a recognised problem page.
 *
 * @param {string} url
 * @returns {{code:string, contestId:string, index:string, kind:string, base:string}|null}
 *   code     e.g. "4A"            (contestId + index)
 *   contestId e.g. "4"
 *   index    e.g. "A"            (uppercased; may include a digit, e.g. "F2")
 *   kind     "contest" | "problemset" | "gym" | "group"
 *   base     path prefix for related tabs, e.g. "/contest/4"
 */
function extractProblem(url) {
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch (_) {
    return null; // not a valid/absolute URL (e.g. an empty tab)
  }

  let m;
  if ((m = pathname.match(/^\/contest\/(\d+)\/problem\/([A-Za-z]\d*)\/?$/))) {
    return makeProblem(m[1], m[2], 'contest', `/contest/${m[1]}`);
  }
  if ((m = pathname.match(/^\/problemset\/problem\/(\d+)\/([A-Za-z]\d*)\/?$/))) {
    return makeProblem(m[1], m[2], 'problemset', `/contest/${m[1]}`);
  }
  if ((m = pathname.match(/^\/gym\/(\d+)\/problem\/([A-Za-z]\d*)\/?$/))) {
    return makeProblem(m[1], m[2], 'gym', `/gym/${m[1]}`);
  }
  if ((m = pathname.match(/^\/group\/([^/]+)\/contest\/(\d+)\/problem\/([A-Za-z]\d*)\/?$/))) {
    return makeProblem(m[2], m[3], 'group', `/group/${m[1]}/contest/${m[2]}`);
  }
  return null;
}

function makeProblem(contestId, index, kind, base) {
  const idx = index.toUpperCase();
  return { code: `${contestId}${idx}`, contestId, index: idx, kind, base };
}

/**
 * Extract just the problem code (e.g. "4A") from a Codeforces URL, or null.
 * @param {string} url
 * @returns {string|null}
 */
function extractProblemCode(url) {
  const problem = extractProblem(url);
  return problem ? problem.code : null;
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
