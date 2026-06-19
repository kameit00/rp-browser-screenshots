# Browserling — Cross-browser / cross-OS screenshots

Automated screenshot capture of web pages across **3 browser engines**
(Chromium, Firefox, WebKit) × **3 operating systems** (Ubuntu, Windows, macOS),
running entirely on free GitHub Actions runners. Output: a downloadable ZIP
of PNGs per browser/OS combo.

> Note: WebKit approximates Safari. This is **engine-level** coverage, not real
> Safari or real mobile devices. For real-device snapshots use BrowserStack.

---

## Project layout

```
Browserling/
├── playwright.config.ts        # browser projects (chromium/firefox/webkit)
├── urls.config.ts              # <<< EDIT: list of pages to screenshot >>>
├── tests/
│   └── screenshot.spec.ts      # loops URLs, captures one PNG each
├── .github/workflows/
│   └── screenshots.yml         # 3 OSes x 3 browsers matrix
├── package.json
└── tsconfig.json
```

## 1. Tell it what to screenshot

Edit `urls.config.ts`:

```ts
const urls: UrlEntry[] = [
  '/',                 // homepage -> resolves to <BASE_URL>/
  '/checkout/cart',
  { path: '/contact', fullPage: false },
];
```

Paths are appended to `BASE_URL` (see below). Absolute URLs (`https://...`) are
used as-is, so you can screenshot multiple domains.

## 2. Run locally

```bash
cd Browserling
npm install
npx playwright install            # downloads the 3 browser engines

# capture PNGs (default mode) for the homepage, etc.
BASE_URL=https://shop.example.com npm run screenshot

# results land in ./screenshots/<os>/<browser>/<label>.png
```

Run just one browser:

```bash
npx playwright test --project=chromium
```

## 3. Run in GitHub Actions (the real value)

Push this folder to a GitHub repo (private is fine). Then:

**Manual run:** GitHub → *Actions* → *Cross-browser screenshots* → *Run workflow*
→ enter the base URL.

…or from the CLI:

```bash
gh workflow run screenshots.yml -f base_url=https://shop.example.com
gh run watch                    # follow live
gh run download <run-id>        # download all screenshot ZIPs
```

Each run produces **9 artifacts** (`{os}-{browser}`), each containing the PNGs
for that combination. Default retention: 30 days.

There is also an optional **weekly schedule** in the workflow (Monday 03:00 UTC)
— delete the `schedule:` block if you don't want it.

## 4. (Optional) Visual regression / comparison mode

Instead of just capturing, you can have Playwright **fail on visual changes**
vs committed baseline PNGs.

```bash
# seed baselines once:
BASE_URL=https://shop.example.com npm run update-snapshots
# commit the new tests/*.spec.ts-snapshots/ folders

# then run in compare mode:
BASE_URL=https://shop.example.com MODE=compare npm run screenshot
```

In CI set the workflow `mode` input to `compare`. Baselines are stored
**per browser** (see `snapshotPathTemplate`), so each engine has its own.
Cross-OS rendering differences (fonts/AA) mean you may need a relaxed
`maxDiffPixelRatio` — already set to `0.01` in the test.

## What this costs

- **GitHub Actions:** free for public repos; private repos get **2,000 free
  minutes/month** (Linux = 1x, Windows = 2x, macOS = 10x multiplier). One full
  matrix run ≈ a few hundred billable minutes, so watch the macOS jobs if your
  repo is private.
- **Playwright:** fully free / open source.

## Upgrades to consider later

- Push screenshots back to a `gh-pages` branch for a browsable gallery
  (needs a PAT with `contents: write`).
- Add real mobile emulation: extra projects using `devices['iPhone 14']` etc.
- Add an authenticated-user flow (inject cookies / do a login step).
