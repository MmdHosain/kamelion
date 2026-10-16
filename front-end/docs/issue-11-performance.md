# Issue #11: reduce initial JavaScript

Baseline: `c7f9f14fb6b42be955f3ed12507cd2cf79578cf0`, measured 2026-10-16.

## Changes

- Split About, Services, FAQ, Resources, Video, admin login and the admin application with React.lazy. Both video URL aliases share a module.
- Keep the home page eager to avoid adding a chunk round trip to its critical rendering path.
- Keep AdminProtectedRoute eager: unauthorized visitors redirect without rendering/downloading AdminPage.
- Mount lazy appointment and authentication forms only while open. Separate Suspense boundaries keep the header, footer and chat usable while routes/forms load. Loading notices are Persian, announce status and allow closing pending forms.
- Add an error boundary with a full-page reload recovery action for failed chunk downloads (React.lazy caches rejected imports).
- Observe newly inserted fade sections so lazy route content does not remain invisible. Disconnect observers on unmount.

## Production build measurements

Same lockfile, Node/npm environment, Vite 7.3.0, default production build; decimal kB. Gzip is Vite's reported estimate, not a claim that the deployment serves gzip.

| Resource | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Initial JS | 856.70 kB | 359.63 kB | 58.0% |
| Initial JS, gzip | 253.40 kB | 113.06 kB | 55.4% |
| CSS, gzip | 11.29 kB | 11.31 kB | essentially unchanged |

AdminPage is now a separate ~446.19 kB (~129.28 kB gzip) chunk. Smaller public-route/form chunks are loaded on demand. This reduces initial download, not total application size; opening a new route introduces a request and loading state.

## Dependency and asset audit

- Recharts is imported by AdminDashboard; splitting AdminPage removes its chart dependency graph from the public entry bundle.
- Swiper is imported only by CommentsSlider, which is not imported by the active page tree. react-day-picker has no source imports. Removing these installed packages would not reduce the current browser download.
- The chat capsule is an interactive input with quick prompts, minimize behavior and rotating text even when its dialog is closed. It remains eager to preserve that behavior; simply mounting it only when open would remove the launcher.
- The home page also renders a booking calendar directly, so lazy-loading AppointmentModal cannot defer every calendar utility.
- `public` contains no real raster images. AboutSection references absent `/images/IMG_2923.jpeg`; SliderCard uses dynamic URLs and an external placeholder. Image byte sizes, responsive encodings and quality cannot be measured without the actual assets. Do not invent dimensions or claimed image savings.
- index.css loads font CSS from both cdnjs (Vazir) and Google Fonts (Vazirmatn), while Vazir is the first-choice font. Consider self-hosting one font with font-display: swap after confirming licensing/design requirements. These external dependencies were not modified.

## Validation and limitations

- `npm run build`: passes; the original >500 kB JS warning disappears.
- ESLint on changed JS/JSX files: passes. Repository-wide lint still reports 12 errors and 2 warnings in untouched files.
- `git diff --check`: passes.
- Browser execution/network emulation could not be completed: Chromium is not installed, and Playwright's download returned truncated/invalid archives. No measured FCP/LCP, interaction timings or real 3G/4G results are claimed.
- The lockfile contains several tarballs on mirror-npm.runflare.com, which returned 502 during installation. For local installation only, those resolved URLs were temporarily replaced with registry.npmjs.org, then the original lockfile was restored. No dependency versions were changed.

## Follow-up browser verification

Run `npm ci`, `npm run build`, `npm run preview`. Test baseline and this branch with the same backend, viewport, cold cache and font conditions. Use custom profiles (not universal definitions of 3G/4G): 3G = 1.6 Mbps down / 750 kbps up / 150 ms latency; 4G = 9 Mbps down / 1.5 Mbps up / 85 ms latency. Repeat at least three times; report median JS transfer, FCP and LCP separately.

Check home -> each public route, browser back/forward, direct route refresh, both /video aliases, admin redirect without credentials, authenticated admin access, appointment open/close/reopen, and authentication/OTP flow against a test backend. Confirm new sections become visible after lazy navigation. In Network, confirm no AdminPage or form chunks on the initial home request; appointment/auth chunks should appear only when their UI is requested. Block a lazy chunk to verify the Persian error/reload action, and delay one to verify its loading/close UI.
