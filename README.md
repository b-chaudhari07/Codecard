# Codecard

**Your Codeforces, visualized.**

A premium Codeforces profile analytics and card-generation interface. Explore a
competitive programming profile, customize a 4:5 profile card, and export it as
a high-resolution PNG.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React
- html-to-image

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://localhost:5173`).

```bash
npm run build   # type-check + production build
npm run lint    # Oxlint
npm run preview # preview the production build
```

## Live Codeforces data

Profiles are fetched directly in the browser from the official public API:

- `user.info` — profile, rank, rating, registration date, contribution
- `user.rating` — rated contest history
- `user.status` — submissions, unique solved problems, tags and difficulty

Requests are sequential and throttled to **one every two seconds**. Profiles are
cached in memory for five minutes and duplicate in-flight requests are ignored.

Solved problems are counted once per `contestId` + problem `index` and only for
an `OK` verdict. Problems without a difficulty rating are excluded from the
difficulty distribution and reported separately — they are never treated as
rating zero. Contest metrics are labelled **rated contests** and are derived from
`user.rating`.

Loading, not-found, rate-limit, network, invalid-response and empty-history
states are handled explicitly. Failed live data is never replaced with the
sample fixture.

## Card Studio

The studio renders a 4:5 profile card at its design size of **1080 × 1350** and
scales it only for the on-screen preview. Customization is local state, so theme,
accent and section changes update instantly without another API request.

### Themes

- **Obsidian** — dark glassmorphism: `#090A0C` background, `#151619` surfaces,
  silver and muted-gold accents, ambient light and inset highlights.
- **Minimal** — Apple-inspired light theme: `#F5F5F7` background, white surfaces,
  lavender accents, soft shadows and generous whitespace.

### Accents and rank colouring

Five accents are available in both themes: **Lavender, Sapphire, Gold, Emerald
and Rose**. Each accent has a darker `onLight` variant so it stays legible on the
Minimal theme.

Rank colouring is enabled by default and resolves the card accent from the
profile's Codeforces rank. It is purely a rendering override: the manual accent
stays stored in `CardOptions` and is restored the moment rank colouring is turned
off. Clicking an accent disables rank colouring so the manual choice is visible
immediately.

### Sections

Every section can be toggled independently:

- rating graph
- problem statistics (solved count and difficulty spread)
- topic tags
- contest statistics (rated contests and best rank)
- membership date
- branding watermark (header wordmark and footer tagline)

The "Verified profile" label and the profile URL are always kept.

## Demo mode

`src/data/sampleProfile.ts` (`@chaudharibhavesh198`) is used only as an
explicitly labelled demo. It is shown on first load and whenever "View demo
profile" is chosen from an error state; live searches replace it.

## Structure

```
src/
  assets/            sample avatar
  components/
    charts/          shared SVG rating chart
    dashboard/       hero, metrics, analytics widgets, loading/error states
    layout/          header and footer
    studio/          card studio, card, customizer
    ui/              small shared primitives
  data/              sample profile fixture
  hooks/             useCodeforcesProfile (cache, stages, errors)
  lib/               card themes, formatting and chart helpers
  services/
    codeforces/      raw types, endpoints, throttled API client, avatar proxy, transformers
  types/             shared TypeScript interfaces
```

## PNG export

`html-to-image` exports only the isolated card node at 2× (**2160 × 2700**) so the
downloaded PNG stays sharp. The export uses the active theme's background colour
and the filename is `codecard-{handle}.png`. Dashboard UI and controls are never
part of the export target.

## Avatars

`user.info` provides `titlePhoto` (preferred) with `avatar` as the fallback. The
URL is stored on the application profile and rewritten from the canonical
`userpic.codeforces.org` host to `codeforces.com/userpic/...`.

Because neither host sends CORS headers, the image is fetched through a
CORS-enabled image proxy (`wsrv.nl`, with `images.weserv.nl` as a second
hostname), resized to a 400 × 400 `fit=cover` JPEG and inlined as a data URL.
That keeps the image inside the exported PNG. The avatar fetch runs in parallel
with the throttled API calls, successful results are cached in memory, and
in-flight requests are de-duplicated. If the proxy fails, the direct
`codeforces.com` URL is still used for display; initials are only rendered after
the image itself reports a load error.

## Known limitations

- `userpic.codeforces.org` currently returns HTTP 503, and
  `codeforces.com/userpic/...` does not send an `access-control-allow-origin`
  header. Avatar loading therefore depends on the `wsrv.nl` proxy; if it is
  unreachable the card falls back to the direct image and then to initials.
- `user.status` is capped at 30,000 retrieved submissions (three pages of
  10,000). If the cap is reached, the profile shows a truncation warning.
