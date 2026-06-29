/*
 * CP Ally for Codeforces — popup
 *
 * Reads the active tab, shows the detected problem code (if any), and lets the
 * user open it in CP Ally with a click — the same thing Ctrl+B does on the page.
 *
 * extractProblemCode() and launchCpAlly() come from cf.js (loaded first).
 */

const statusEl = document.getElementById("status");
const badgeEl = document.getElementById("code-badge");
const openBtn = document.getElementById("open-btn");

async function init() {
  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch (_) {
    statusEl.textContent = "Could not read the current tab.";
    return;
  }

  // tab.url is only populated for codeforces.com tabs, because that is the only
  // host this extension has permission for.
  const code = extractProblemCode(tab && tab.url ? tab.url : "");

  if (!code) {
    statusEl.textContent = "Open a Codeforces problem page to use CP Ally.";
    openBtn.disabled = true;
    return;
  }

  statusEl.textContent = "Problem detected:";
  badgeEl.textContent = code;
  badgeEl.hidden = false;
  openBtn.disabled = false;
  openBtn.addEventListener("click", () => {
    launchCpAlly(code);
    statusEl.textContent = `Opening ${code} in CP Ally…`;
  });
}

init();
