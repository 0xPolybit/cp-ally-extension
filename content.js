/*
 * CP Ally for Codeforces — content script
 *
 * Runs only on codeforces.com pages (see the manifest matches). Listens for
 * Ctrl+B and, when the current page is a problem, opens it in CP Ally.
 *
 * extractProblemCode() and launchCpAlly() come from cf.js, which the manifest
 * loads in the same content-script context just before this file.
 */

document.addEventListener(
  'keydown',
  (event) => {
    // Match Ctrl+B exactly — no Alt/Shift/Meta — so we don't hijack other combos.
    const isCtrlB =
      event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      (event.key === 'b' || event.key === 'B');

    if (!isCtrlB) return;

    const code = extractProblemCode(window.location.href);
    if (!code) return; // Not a problem page — leave Ctrl+B alone.

    event.preventDefault();
    event.stopPropagation();
    launchCpAlly(code);
    showToast(`Opening ${code} in CP Ally…`);
  },
  true // capture phase: see the key before the page's own handlers
);

/**
 * Briefly show a small confirmation toast in the corner of the page.
 * Styled inline so it can't clash with (or be overridden by) Codeforces' CSS.
 * @param {string} message
 */
function showToast(message) {
  const existing = document.getElementById('cp-ally-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cp-ally-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '2147483647',
    padding: '10px 16px',
    background: '#1f2330',
    color: '#ffffff',
    font: '14px/1.4 system-ui, Arial, sans-serif',
    borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
    opacity: '0',
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 1800);
}

/* ---------------------------------------------------------------------------
 * "OPEN IN CP ALLY IDE" button
 *
 * Adds a button to the contest-details panel in the right sidebar — the box
 * showing the contest title and phase — that does exactly what Ctrl+B does.
 * ------------------------------------------------------------------------- */

const SIDEBAR_BTN_ID = 'cp-ally-sidebar-button';

/**
 * Locate the right-sidebar box that shows the contest details. On Codeforces
 * that is the .roundbox.sidebox holding the contest info table (an rtable with
 * the contest title + phase). Falls back to a box linking to the contest, then
 * to the first sidebar box.
 * @returns {HTMLElement|null}
 */
function findContestDetailsBox() {
  const sidebar = document.querySelector('#sidebar');
  if (!sidebar) return null;

  const table = sidebar.querySelector('.roundbox.sidebox table.rtable');
  if (table) {
    const box = table.closest('.roundbox.sidebox');
    if (box) return box;
  }

  for (const box of sidebar.querySelectorAll('.roundbox.sidebox')) {
    if (box.querySelector('a[href*="/contest/"], a[href*="/gym/"]')) return box;
  }
  return sidebar.querySelector('.roundbox.sidebox');
}

/**
 * Build the white "OPEN IN CP ALLY IDE" button — black text, logo on the left.
 * @param {string} code e.g. "4A"
 * @returns {HTMLElement}
 */
function buildSidebarButton(code) {
  // Wrapper matches the 1em insets Codeforces uses for its sidebar buttons.
  const wrapper = document.createElement('div');
  wrapper.id = SIDEBAR_BTN_ID;
  Object.assign(wrapper.style, { margin: '1em', textAlign: 'center' });

  const button = document.createElement('button');
  button.type = 'button';
  Object.assign(button.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 10px',
    background: '#ffffff',
    color: '#000000',
    border: '1px solid #c8c8c8',
    borderRadius: '6px',
    font: '700 13px/1.2 system-ui, Arial, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  });

  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('logo.png'); // requires web_accessible_resources
  logo.alt = '';
  Object.assign(logo.style, {
    width: '18px',
    height: '18px',
    objectFit: 'contain',
    flex: '0 0 auto',
  });

  const label = document.createElement('span');
  label.textContent = 'OPEN IN CP ALLY IDE';

  button.append(logo, label);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    launchCpAlly(code);
    showToast(`Opening ${code} in CP Ally…`);
  });

  wrapper.appendChild(button);
  return wrapper;
}

/**
 * Add the button to the contest-details panel. Idempotent — safe to call again.
 * @returns {boolean} true once the button exists (or was just added)
 */
function injectSidebarButton() {
  if (document.getElementById(SIDEBAR_BTN_ID)) return true;

  const code = extractProblemCode(window.location.href);
  if (!code) return false; // not a problem page

  const box = findContestDetailsBox();
  if (!box) return false; // no contest sidebar on this page

  box.appendChild(buildSidebarButton(code));
  console.log(`[CP Ally] added "OPEN IN CP ALLY IDE" button for ${code}`);
  return true;
}

// The sidebar is server-rendered, so this usually succeeds immediately. If it
// doesn't (e.g. rendered late), watch briefly until it appears, then stop.
if (!injectSidebarButton()) {
  const observer = new MutationObserver(() => {
    if (injectSidebarButton()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => {
    observer.disconnect();
    if (!document.getElementById(SIDEBAR_BTN_ID) && extractProblemCode(window.location.href)) {
      console.warn('[CP Ally] problem detected but the contest sidebar was not found — button not added.');
    }
  }, 10000);
}
