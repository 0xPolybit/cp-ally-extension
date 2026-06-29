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
