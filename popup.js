/*
 * CP Ally for Codeforces — popup
 *
 * Reads the active tab. If it's a Codeforces problem, it shows the detected
 * code, an "Open in CP Ally IDE" button, quick links to the problem's other
 * Codeforces pages, and copy helpers. Otherwise it shows an empty state.
 *
 * extractProblem(), buildCpAllyUrl() and launchCpAlly() come from cf.js.
 */

const els = {
  version: document.getElementById("version"),
  problemView: document.getElementById("problem-view"),
  emptyView: document.getElementById("empty-view"),
  code: document.getElementById("code-badge"),
  kind: document.getElementById("kind-badge"),
  openBtn: document.getElementById("open-btn"),
  statement: document.getElementById("link-statement"),
  submit: document.getElementById("link-submit"),
  my: document.getElementById("link-my"),
  standings: document.getElementById("link-standings"),
  copyLink: document.getElementById("copy-link"),
  copyCode: document.getElementById("copy-code"),
  feedback: document.getElementById("feedback"),
};

const KIND_LABELS = {
  contest: "Contest",
  problemset: "Problemset",
  gym: "Gym",
  group: "Group",
};

let feedbackTimer;
function showFeedback(message) {
  els.feedback.textContent = message;
  els.feedback.classList.add("show");
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => els.feedback.classList.remove("show"), 1500);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showFeedback(`${label} copied`);
  } catch (_) {
    showFeedback("Copy failed");
  }
}

async function init() {
  els.version.textContent = "v" + chrome.runtime.getManifest().version;

  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch (_) {
    // ignore — falls through to the empty state
  }

  const url = tab && tab.url ? tab.url : "";
  const problem = extractProblem(url);

  if (!problem) {
    els.emptyView.hidden = false;
    return;
  }

  let origin = "https://codeforces.com";
  try {
    origin = new URL(url).origin;
  } catch (_) {
    // keep the default origin
  }

  els.problemView.hidden = false;
  els.code.textContent = problem.code;
  els.kind.textContent = KIND_LABELS[problem.kind] || "";

  els.statement.href = `${origin}${problem.base}/problem/${problem.index}`;
  els.submit.href = `${origin}${problem.base}/submit`;
  els.my.href = `${origin}${problem.base}/my`;
  els.standings.href = `${origin}${problem.base}/standings`;

  els.openBtn.addEventListener("click", () => {
    launchCpAlly(problem.code);
    showFeedback(`Opening ${problem.code}…`);
  });
  els.copyLink.addEventListener("click", () =>
    copyText(buildCpAllyUrl(problem.code), "Link")
  );
  els.copyCode.addEventListener("click", () => copyText(problem.code, "Code"));
}

init();
