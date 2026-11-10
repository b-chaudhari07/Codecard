# Codecard

**Your Codeforces, visualized.**

A premium Codeforces profile analytics and card-generation interface. Explore a
competitive programming profile, customize a collectible card in five template
shapes, and export it as a high-resolution PNG.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React
- html-to-image
- Vitest

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://localhost:5173`).

## Deploy

Set `VITE_SITE_URL` to the public site origin (for example,
`https://codecard.example.com`) before building. `VITE_GITHUB_URL` optionally
sets the footer repository link; when unset, that link is hidden. Add
`public/og.png` at 1200×630 for social link previews; preview images are generic
until per-user previews exist. Build with `npm run build` and deploy the `dist`
output directory. The project includes Vercel and Netlify SPA rewrites. If
`VITE_SITE_URL` is unset, metadata uses the placeholder `https://your-domain`
and generated share links fall back to the current origin.

```bash
npm run build   # type-check + production build
npm run lint    # Oxlint
npm run test    # Vitest unit tests
npm run preview # preview the production build
```

## Views

The app has five top-level views, decided by the pure `getView()` helper in
`src/lib/view.ts`:

- **Landing** — shown before any search. The header shows only the logo and
  theme toggle; the hero includes the handle search, a looping front/back card
  showcase, and a "See an example" action.
- **Loading** — the hero stays visible with the card showcase and the existing
  staged API progress list under the search box.
- **Live** — a real Codeforces profile. The hero collapses to a compact search
  bar, the full dashboard renders, and the page scrolls to the Card Studio.
- **Example** — the sample profile with an "Example profile" banner; sharing
  stays disabled and the banner returns to the landing search.
- **Error** — the existing error states plus "Back to start".

Opening `/u/{handle}` starts in the loading view and auto-searches, so the
landing hero never flashes. Clicking the Codecard logo resets the view to
landing and the URL to `/`.

## Card templates

All templates are available today and rendered from one scoring design; the
portrait, story and print layouts share a single-column composition scaled by
`template.width / 1080`, and the link template uses a dedicated two-column
layout:

| Template | Size (CSS px) | Aspect | Default export | Notes |
|---|---|---|---|---|
| Portrait (default) | 1080 × 1350 | 4:5 | 2160 × 2700 | The base design |
| Story | 1080 × 1920 | 9:16 | 2160 × 3840 | 36% banner, larger section spacing |
| Link | 1200 × 630 | 1.91:1 | 2400 × 1260 | Two columns: identity + rating left, stats right |
| Print | 750 × 1050 | 5:7 | 3000 × 4200 | Scaled to 63 × 88 mm style; smallest text stays ≥ 22 px |
| Classic | 1400 × 1000 | 7:5 | 2800 × 2000 | The original landscape card |

## Themes

- **Obsidian** — dark cinematic glass; `#07080C` background, translucent
  surfaces, ambient glows and inset highlights.
- **Minimal** — light frosted daylight; `#F2F4F7` background, white glass
  surfaces and soft shadows. The heatmap's zero-activity cells use a light
  neutral (`#E3E7EC`) while the obsidian theme keeps its dark green cells.

## Accents and rank colour

Eight accents are available in both themes (each with a darker variant for the
light theme). **Rank colour is on by default**: the card, rarity pill, glows and
foil use the official Codeforces colour for the profile's rank (also derived for
unrated profiles via the manual accent). Turning it off restores the manual
accent; picking an accent disables rank colouring so the choice is visible
immediately.

## Rarity and foil

The header pill on the portrait-family cards shows a game-style rarity derived
only from the real Codeforces rank — Newbie/Pupil/Specialist → COMMON, UNCOMMON,
RARE; Expert → EPIC; Candidate Master → EPIC+; Master and International Master →
LEGENDARY; the three Grandmaster tiers → MYTHIC. From Expert up, a subtle static
holographic foil (diagonal white + rank-colour bands, `mix-blend-mode: screen`)
lights the card; from Master up an inner rank-colour glow is added. No
animations — exports stay deterministic.

## Customization

- **Banner** — show/hide the cinematic artwork, upload your own image (max
  6 MB, images only) and choose the crop position.
- **Profile photo** — upload a photo shown inside the avatar ring (max 6 MB,
  data URL, survives PNG export) or reset to the Codeforces avatar; the initials
  fallback stays if a load fails.
- **Quote** — optional personal motto (90 chars).
- **Tagline** — auto-generated rank-aware designation or your own text
  (classic card; the portrait design never renders a tagline).
- **Sections** — rating graph, activity heatmap, hardest challenge, achievement
  stats, watermark.
- **Stat tiles** — six slots from a nine-stat pool (boss, solved, streak,
  peak day, grit, contests, active days, peak rating, sniper). Unavailable stats are
  replaced by the next available one from the pool, so tiles never show fake
  zeros or blanks; selecting a duplicate swaps the two slots.

Card options are stored per browser in `localStorage` under a versioned schema;
loading migrates them against the defaults, and any oversized custom images
(> 1 MB) stay in memory only so quota errors can't break the page. "Reset"
restores the defaults and clears the saved options.

## PNG export

`html-to-image` rasterizes only the isolated card node (`data-codecard-export`)
using `toPng`, each template's default pixel ratio (see table), and the active
theme's background colour, so even translucent surfaces export correctly. The
filename is `codecard-{template}-{handle}.png`, and the export waits for web
fonts and cache-busts images. Dashboard chrome is never part of the card.

## Sharing

Share controls can invoke the native share sheet with a pre-rendered PNG, copy
the image or caption, or open X and LinkedIn share pages. Share URLs use
`/u/{handle}`; opening one loads that live Codeforces profile. Native share and
clipboard image support depend on browser permissions and platform support.

## Privacy

Codecard has no accounts, tracking or analytics, and stores no data on its
servers. Profile data comes directly from the public Codeforces API in your
browser. Avatars use the third-party wsrv.nl image proxy so they can be embedded
in downloads. Card settings and small uploaded photos/banners stay in this
browser's local storage; large uploads remain in memory only. Codecard is not
affiliated with or endorsed by Codeforces.

## Live Codeforces data

Profiles are fetched directly in the browser from the official public API:

- `user.info` — profile, rank, rating, registration date, contribution
- `user.rating` — rated contest history
- `user.status` — submissions, unique solves, tags and difficulty

Requests are sequential and throttled to one every two seconds; results are
cached in memory for five minutes. Solves are counted once per
`contestId + index` for `OK` verdicts; unrated problems are excluded from the
difficulty distribution instead of being treated as rating zero. Loading,
not-found, rate-limit, network, invalid-response and empty-history states are
explicit; failed live data is never replaced with the sample fixture.

## Demo mode

`src/data/sampleProfile.ts` is an explicitly labelled design preview for the
`codecard_demo` handle ("Codecard Demo", initials `CD`, no personal photo). It
is shown through "See an example" on the landing hero or from error states; live
searches replace it. Its activity window is generated relative to today, so the
heatmap always looks fresh. The landing hero renders the same sample profile in
the FlipCard showcase at a fixed preview scale, with an Expert rank so the foil
is visible.

## Avatars

Codeforces image hosts send no CORS headers, so the avatar is fetched through a
resized CORS proxy (`wsrv.nl`) and inlined as a data URL; the direct URL is used
for display if the proxy fails, and initials are rendered only after the image
itself reports a load error.

## Known limitations

- `user.status` is capped at 30,000 retrieved submissions; when the cap is hit,
  the profile shows a truncation warning and affected captions carry a "~".
- The default card banner ships as an SVG asset; uploads are inlined data URLs.
