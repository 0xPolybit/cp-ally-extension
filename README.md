# CP Ally for Codeforces

A tiny Chrome extension (plain HTML / CSS / JavaScript, Manifest V3) that opens
the Codeforces problem you're viewing in the **CP Ally** desktop app.

Press <kbd>Ctrl</kbd> + <kbd>B</kbd> on any Codeforces problem page and the
extension launches `cpally://problem/<code>` — e.g. `cpally://problem/4A`.

## Features

- **Codeforces-only.** The content script and host permissions are scoped to
  `codeforces.com`, so the extension has no access to any other site.
- **One shortcut.** <kbd>Ctrl</kbd> + <kbd>B</kbd> on a problem page opens it in
  CP Ally and shows a small confirmation toast.
- **In-page button.** A white **Open in CP Ally IDE** button (with the logo) is
  added to the contest-details panel in the right sidebar and does the same thing.
- **Toolbar popup.** Click the icon (next to the URL bar) for a small GUI: the
  detected problem code, an **Open in CP Ally IDE** button, quick links to the
  problem's Statement / Submit / My submissions / Standings pages, and
  copy-to-clipboard helpers for the code and the `cpally://` link. Dark theme
  with a neon-green accent.
- **No build step, no dependencies.** Just static files you load unpacked.

## How it works

1. A content script runs only on `codeforces.com` pages.
2. When you press <kbd>Ctrl</kbd> + <kbd>B</kbd>, it reads the current URL and
   extracts the problem code (contest id + index, e.g. `4` + `A` → `4A`).
3. It opens `cpally://problem/<code>` via a hidden iframe, which hands the link
   to whichever app is registered for the `cpally://` protocol on your system.

> **Note:** the extension only *triggers* the `cpally://` link. Something on
> your machine has to be registered to handle that protocol (the CP Ally app).
> If nothing is registered, the browser will say it can't open the link — see
> [Testing](#testing) for how to register a temporary handler.

## Supported problem URLs

| Page type  | Example URL                                                   | Code      |
| ---------- | ------------------------------------------------------------- | --------- |
| Contest    | `https://codeforces.com/contest/4/problem/A`                  | `4A`      |
| Problemset | `https://codeforces.com/problemset/problem/4/A`               | `4A`      |
| Gym        | `https://codeforces.com/gym/102222/problem/C`                 | `102222C` |
| Group      | `https://codeforces.com/group/abcDEF12/contest/4/problem/A`   | `4A`      |

Problem indices with a sub-number (e.g. `A1`, `F2`) are supported too. On any
other Codeforces page the shortcut does nothing.

## Project structure

```
cp-ally-extension/
├── manifest.json   # Manifest V3 config, permissions, icons
├── cf.js           # Shared logic: URL parsing + cpally:// launch (used by both below)
├── content.js      # Runs on codeforces.com; listens for Ctrl+B; shows the toast
├── popup.html      # Toolbar popup markup
├── popup.css       # Popup styles
├── popup.js        # Popup logic: detect code in the active tab, Open button
├── logo.png        # Extension icon
├── .gitignore
├── LICENSE
└── README.md
```

## Installation (load unpacked)

1. Open `chrome://extensions` in Chrome (or any Chromium browser — Edge, Brave…).
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** and select this project folder.
4. The CP Ally icon appears in the toolbar. Pin it for quick access.

After editing any file, return to `chrome://extensions` and click the **reload**
(↻) icon on the extension card.

## Usage

- Open a Codeforces problem, e.g. <https://codeforces.com/contest/4/problem/A>.
- Press <kbd>Ctrl</kbd> + <kbd>B</kbd> → CP Ally opens `cpally://problem/4A`.
- Or click **Open in CP Ally IDE** in the contest panel on the right.
- Or click the toolbar icon and use the popup (Open button, quick links, copy).

## Testing

See the **Testing** section below in the repo notes, or the instructions shared
when this was set up. In short:

1. Load the extension unpacked (above).
2. Visit a problem page and open DevTools → **Console**. Pressing
   <kbd>Ctrl</kbd> + <kbd>B</kbd> logs `[CP Ally] launching cpally://problem/4A`,
   which confirms detection works even without the protocol handler installed.
3. The popup shows the detected code, which is the quickest way to verify
   parsing on different problem URLs.
4. To verify the actual launch, register a handler for `cpally://` (a real
   CP Ally install, or a temporary test handler) and watch it open.

## Permissions

- `host_permissions: *://codeforces.com/*` (and subdomains) — lets the content
  script run on, and the popup read the URL of, Codeforces tabs **only**.

No `tabs`, no `<all_urls>`, no background access to other sites.

## License

See [LICENSE](LICENSE).
