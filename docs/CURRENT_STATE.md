# Codecard — Current State (branch `card-2.0`)

Status verified from code only; current test suite has 58 tests. Build, lint, and tests are run for the current change.

## 0. Page views (`src/lib/view.ts`, `src/App.tsx`)
- `getView({ status, isDemo, searchRequested, exampleRequested })` returns `landing`, `loading`, `live`, `example`, or `error`; errors and loading take precedence.
- Landing shows the header logo + theme toggle only, plus `LandingHero`: pill, "Your card. Your identity.", handle validation, "No login · Free · PNG export", "See an example", and the `FlipCard` showcase.
- `FlipCard` renders `PortraitCard` with the sample profile (Expert foil) on the front and a dark rank-colour patterned back; CSS 3D flip (~9s), sheen (~4s), glow pulse, float, desktop pointer tilt, manual click flip with a 6s auto-pause, and a reduced-motion front-only fallback.
- Loading keeps the full hero and FlipCard, speeds the sheen to 2s, and shows the staged API progress under the search. Live collapses to a compact search bar, renders the full dashboard, and smooth-scrolls to `#studio`.
- Example renders the full dashboard with the sample profile and an "Example profile. Enter your handle to make your own." banner; its button returns to landing and focuses `#handle`. Sharing stays disabled because `profile.isSample` is true.
- Error keeps the existing error copy plus "Back to start". `/u/{handle}` starts in loading and auto-searches; the logo resets to landing and `/`.
- `useCodeforcesProfile` starts idle with no profile and exposes `reset()`; the sample profile is only loaded through `showDemo()`.

## 1. Card templates (`src/lib/cardTemplates.ts`, rendered via `ProfileCard.tsx`)
| id | size (CSS px) | aspect | pixelRatio | available | rendered by |
|---|---|---|---|---|---|
| portrait (default) | 1080×1350 | 4:5 | 2 | yes | `PortraitCard` (scaled s=1) |
| story | 1080×1920 | 9:16 | 2 | yes | `PortraitCard` (single-column, s=1, 36% banner, 1.5× spacing) |
| link | 1200×630 | 1.91:1 | 2 | yes | `PortraitCard` (dedicated two-column layout) |
| print | 750×1050 | 5:7 | 4 | yes | `PortraitCard` (single-column, s=750/1080, 22px text floor) |
| classic | 1400×1000 | 7:5 | 2 | yes | `ClassicLandscapeCard` |

## 2. Portrait card content, top → bottom (`PortraitCard.tsx`)
Ambient rank glow → banner (optional `showBanner`, `customBanner`, `bannerPosition`; fades into background) → bottom glows → foil layer (`hasFoil`: rank ≥ Expert; static gradient, `mix-blend-mode: screen`) → inset glow (`hasInnerGlow`: Master+) → header row: "Codeforces · No. N" (`cardNumber`) + rarity pill (`RankBadge` with `getRarity`, dark translucent bg, rank colour) → flexible spacer → section: avatar ring (`customPhoto` ?? CF avatar, initials fallback via `ProfileAvatar`), handle (`handleFontSize`), rank · country line → section: "Current rating" + gradient rating number (solid duplicate fallback) beside hero visual: heatmap (`showHeatmap`, 126 days/18 weeks, zero cells use `theme.heatmapEmpty`) and/or sparkline (`showRatingChart`, last 26 points) → optional quote (`showQuote` + non-empty `customQuote`) → stat tiles grid (`showStats`/`showHardestProblem` + `stats` selection, always 6 slots, substitution; equal value + caption showing "~" suffix when partial flags set) → footer: `codeforces.com/profile/{handle}` + Codecard watermark (`showWatermark`).

## 3. CardCustomizer sections (`CardCustomizer.tsx`)
- Header: Reset button (calls CardStudio onReset: defaults from memory and clears localStorage).
- Template: grid of 5 template buttons (labels, aspect, dimensions, "Soon" badge still exists for `available: false` — currently none).
- Theme: obsidian / minimal previews.
- Accent: 8 swatches, custom colour picker, "Rank colour" toggle (`autoRankColor`, shows resolved rank accent).
- Banner: "Cinematic banner" toggle, upload button (image MIME, 6 MB, inline error 3), Remove, Crop position (top/center/bottom).
- Profile photo: "Upload photo" (same checks) + Reset (only when custom set), avatar preview, inline error, mode caption.
- Personal quote: toggle + 90-char input.
- Tagline Designation: Auto/Custom buttons; Auto shows generated tagline; Custom input (48 chars); "Show tagline" toggle (`showDesignation`, description "Classic card only" when portrait active).
- Card sections: toggles for rating graph, heatmap, hardest challenge, achievement stats, watermark.
- Stat tiles: 6 select slots over the stat pool with `swapStat` duplicate handling.
- Download button + export-size caption (`template.width × pixelRatio`), plus Share, Copy image/caption, Post on X, and Post on LinkedIn actions.

## 4. Export and sharing
- Current: only PNG via `html-to-image`'s `toPng` inside `CardStudio.tsx` (`handleDownload`); `document.fonts.ready`, `cacheBust: true`, theme background colour; error message "Export failed. Please try again."
- PNG is pre-rendered after card/options settle and cached for share actions. Native sharing sends the PNG and caption where supported; other actions copy/download the image or caption and open platform share links.
- Public profile URLs use `/u/{handle}`; opening one loads that live profile, and browser back/forward follows the path.
- Default pixel sizes: portrait 2160×2700, story 2160×3840, link 2400×1260, print 3000×4200 (750×1050 ×4), classic 2800×2000.
- Filename: `codecard-{template}-{handle}.png` (template id, handle, not the "-front" pattern).
- JPEG/WebP: do NOT exist. No scale options (1x–4x) in the UI. No export service module, no Export section in CardCustomizer, no 4000px/16MP warning or cap.
- Card back / front-back toggle / print sheet export: do NOT exist anywhere in the code.

## 5. Profile fields (`Profile` in `types/profile.ts`, computed in `services/codeforces/`)
- Any missing data becomes `null` or `available: false`; UI shows "—" instead of zeros.
- `rank`/`maxRank`: normalized from user info; `rating`/`maxRating` from `userRating`; `ratingHistory`: points from rating changes.
- `problemsSolved`: distinct handled problems ("OK" only) across contest/practice; `unratedSolved`: distinct solved without a rating; `ratedContests`: distinct rated contests.
- `contestStats`: totals, best rank, avg/best/worst changes, positive/negative counts, recent — from rating history.
- `topics`: count per tag of solved problems (strength vs. most-solved); `difficulty`: buckets of solved problems by rating (unrated excluded).
- `submissionActivity`: last ~year of Sunday-aligned days with submissions/accepted counts, streaks, active days, max daily, `isPartial` when pagination-capped.
- `peakDay`: most distinct problems first-accepted in one local day, with date and `partial`.
- `grit`: most non-OK attempts before first AC on one problem, with problem name/index and `partial`.
- `hardestProblem(s)`: highest-rated solved problems (rated only); `contests`: `ratingHistory.length` count; `bestComeback`: max single rating change (null if no history); `topTag`: most-solved tag; `cardNumber`: 1000–9999 from a FNV-1a hash of the handle.
- `avatarUrl`/`avatarDataUrl`: CF avatar URL / fetched data URL avatar; `initials`: from names.

## 6. Persistence (`lib/cardOptionsStorage.ts`)
- localStorage key `codecard.card-options.v1`, payload `{ version: 1, options }`; written on every card-options change via an `App` effect.
- Migration fills unknown keys from `DEFAULT_CARD_OPTIONS`, repairs stats (`sanitizeStats`: unknown ids/dedupes to exactly 6 slots), uses `normalizeHex` to validate `customAccent`.
- `clearCardOptions` used in the customizer's Reset path (in `CardStudio.tsx`).
- Data URLs for `customPhoto` / `customBanner` larger than 1 MB are excluded from storage (kept in memory only); failing `setItem` retries without the data URLs, then silently gives up. App theme uses a separate `localStorage` key (`lib/appTheme.ts`).

## 7. Plan checklist (done / partial / missing)
- DONE: rarity from rank in `cardThemes.ts` + portrait rarity pill; foil (Expert+) and inset glow (Master+); single rank-colour source (`RANK_ACCENTS`, `rankAccent()` reads dark variant); stat-picker registry + customizer + substitution + tests; versioned persistence with migration; story/link/print layouts; minimal-theme `heatmapEmpty` fix (`#E3E7EC`); photo upload/reset; classic tagline toggle.
- PARTIAL: CardStudio reset behavior already does memory defaults and clears saved custom options, but has no dedicated "Reset card" labelled control outside the Reset button; export has defaults per template but no scale choices.
- MISSING: export service extraction (`cards/export/`) and options, JPEG/WebP modes, 1x–4x scales, 4000px/16 MP warning and cap, Export section, "-front" filename scheme, card back, front/back toggle, print sheet.

## 8. Privacy, deployment, and app resilience
- No accounts, tracking or analytics, and no profile data stored on Codecard servers. Profile data is fetched directly from Codeforces in-browser.
- Avatars are fetched through wsrv.nl to embed in PNGs. Card settings and small uploaded images are stored in browser localStorage; uploads over 1 MB stay memory-only. Codecard is not affiliated with Codeforces.
- Error boundaries wrap the app and card studio separately, with friendly reload fallbacks and console error logging.
- `VITE_SITE_URL` sets the public origin for metadata and share links; unset metadata uses `https://your-domain` and runtime share links use the current origin. `VITE_GITHUB_URL` optionally sets the footer repository link; unset hides it. `.env.example` documents both.
- Deploy with `npm run build`, publish `dist`, and add `public/og.png` at 1200×630. `vercel.json` and `public/_redirects` provide SPA fallbacks. Social previews are generic until per-user previews exist; index title/description and favicon are present.

## 9. Known rough edges
- Template grid's "Soon" badge is currently unreachable: every template is `available: true`.
- `rankAccent()` (lib/utils.ts) trusts every `CodeforcesRank` key; unknown input would crash (but all callers pass profile.rank, always valid).
- The link template hard-codes its hero visual at 132 px with the heatmap at 0.6× scale; spacing is manual, unlike the single-column layouts.
- Portrait tile-grid constants (`GRID_ONE_ROW_HEIGHT`/`GRID_TWO_ROW_HEIGHT`) assume the 1080-wide base; other single-column templates rely on the shared scale factor.
- Classic card predates the portrait registry: no `stats` selection, no rarity pill, no foil, though it does use `theme.heatmapEmpty` and the custom photo/tagline toggle.
- The default banner is an SVG asset imported via Vite (`anime-banner.svg`), so exports rasterize an SVG; custom banners are data URLs and bypass it. Exports wait for `document.fonts.ready` before capture.

## 10. Tests
- `services/codeforces/transformers.test.ts` (13): peak day distinct counting/dedup/day assignment, grit counting/labels, difficulty buckets, helper edge cases.
- `lib/cardStats.test.ts` (12): selection/captions/partial "~" suffix, substitution of unavailable stats, all-unavailable placeholder, unique ids mandate, `swapStat` replace/swap/no-op, `sanitizeStats` repair + default fill.
- `lib/cardOptionsStorage.test.ts` (6): migration of missing fields, stats repair, nonsense payloads, round-trip persistence, invalid stored JSON, oversized data URL exclusion, quota failure fallback, clear.
- `lib/view.test.ts` (4): landing/idle, loading, live success, example, and error precedence.
- `lib/routing.test.ts` (5), `lib/ranks.test.ts` (3), `lib/caption.test.ts` (6), `lib/shareActions.test.ts` (2), `services/codeforces/sniper.test.ts` (7). Total: 58 tests.
- No tests yet for the rasterisation/export service itself; share helpers and view state are covered.
